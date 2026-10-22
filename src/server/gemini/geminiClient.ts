import { GoogleGenerativeAI } from '@google/generative-ai';
import {
  CHECKLIST_SYSTEM_INSTRUCTION,
  CHECKLIST_RESPONSE_SCHEMA,
  buildChecklistPrompt,
} from './checklistPrompt';
import {
  EXTRACTION_SYSTEM_INSTRUCTION,
  EXTRACTION_RESPONSE_SCHEMA,
  buildExtractionPrompt,
} from './extractionPrompt';
import { ChecklistApiError, GenerateChecklistResponse } from '../../types/checklist';

/**
 * Representasi Raw Output Terstruktur dari Gemini API untuk Ekstraksi Pengumuman
 */
export interface RawExtractionAiOutput {
  resultType: 'task' | 'no_task' | 'multiple_tasks';
  message?: string;
  title?: string;
  course?: string;
  description?: string;
  dueDate?: string;
  dueTime?: string;
  sourceTimezone?: string;
  requirements?: string[];
  isAmbiguousDeadline?: boolean;
  ambiguityReason?: string;
  ambiguityType?: string;
  criticalFieldEvidence?: {
    title?: string;
    deadline?: string;
    requirements?: string;
  };
  warnings?: string[];
}

export type GeminiErrorCode =
  | 'UNCONFIGURED_SERVER'
  | 'SERVICE_OVERLOAD_OR_QUOTA'
  | 'TIMEOUT'
  | 'INVALID_AI_RESPONSE'
  | 'NETWORK_ERROR';

export interface GeminiApiError {
  code: GeminiErrorCode;
  message: string;
}

/**
 * Interface Client Gemini Bersama untuk Fitur Checklist
 */
export interface IGeminiClient {
  generateChecklist(input: {
    title: string;
    description?: string;
    requirements?: string[];
  }): Promise<GenerateChecklistResponse>;
}

/**
 * Interface Client Gemini Bersama untuk Fitur Ekstraksi Pengumuman
 */
export interface IGeminiExtractionClient {
  extractTask(input: {
    text: string;
    sourceMessageDate?: string | null;
    displayTimezone: string;
  }): Promise<RawExtractionAiOutput>;
}

const DEFAULT_TIMEOUT_MS = 30000;

/**
 * Model Default Gemini:
 * Mengikuti PRD Bagian 9 & Dokumentasi Resmi Google AI (ai.google.dev):
 * Model dapat dikonfigurasi melalui variabel lingkungan GEMINI_MODEL di file .env server,
 * dengan nilai bawaan 'gemini-2.5-flash' (atau model aktif yang ditentukan tim).
 */
export const DEFAULT_GEMINI_MODEL =
  (typeof process !== 'undefined' && process.env?.GEMINI_MODEL) || 'gemini-3.8-flash';

export class GeminiService implements IGeminiClient, IGeminiExtractionClient {
  private client: GoogleGenerativeAI | null = null;
  private modelName: string;

  constructor(apiKey?: string, modelName?: string) {
    const key =
      apiKey ||
      (typeof process !== 'undefined' && process.env?.GEMINI_API_KEY) ||
      '';

    if (key && key.trim().length > 0 && !key.includes('your_gemini_api_key_here')) {
      this.client = new GoogleGenerativeAI(key.trim());
    }
    this.modelName =
      modelName ||
      (typeof process !== 'undefined' && process.env?.GEMINI_MODEL) ||
      DEFAULT_GEMINI_MODEL;
  }

  private getClient(): GoogleGenerativeAI | null {
    if (this.client) return this.client;
    const key = (typeof process !== 'undefined' && process.env?.GEMINI_API_KEY) || '';
    if (key && key.trim().length > 0 && !key.includes('your_gemini_api_key_here')) {
      this.client = new GoogleGenerativeAI(key.trim());
    }
    return this.client;
  }

  public getModelName(): string {
    return (
      (typeof process !== 'undefined' && process.env?.GEMINI_MODEL) ||
      this.modelName ||
      DEFAULT_GEMINI_MODEL
    );
  }

  public isConfigured(): boolean {
    return this.getClient() !== null;
  }

  /**
   * Ekstraksi Pengumuman ke Draf Tugas (POST /api/extract-task)
   */
  public async extractTask(input: {
    text: string;
    sourceMessageDate?: string | null;
    displayTimezone: string;
  }): Promise<RawExtractionAiOutput> {
    const client = this.getClient();
    if (!client) {
      const error: GeminiApiError = {
        code: 'UNCONFIGURED_SERVER',
        message: 'Konfigurasi Gemini API key di server belum tersedia. Silakan atur GEMINI_API_KEY pada file .env server.',
      };
      throw error;
    }

    const model = client.getGenerativeModel({
      model: this.getModelName(),
      systemInstruction: EXTRACTION_SYSTEM_INSTRUCTION,
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: EXTRACTION_RESPONSE_SCHEMA,
        temperature: 0.1, // Rendah untuk kepatuhan fakta & determinisme
      },
    });

    const promptText = buildExtractionPrompt(input);

    // Batas waktu timeout aplikasi 30 detik (PRD Bagian 9)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

    try {
      // Sesuai PRD: Eksekusi tunggal dengan batas waktu 30 detik.
      // Jika gagal, error dilempar ke UI agar pengguna yang menekan tombol "Coba Lagi".
      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: promptText }] }],
      });

      clearTimeout(timeoutId);

      const responseText = result.response.text();
      if (!responseText || responseText.trim().length === 0) {
        const error: GeminiApiError = {
          code: 'INVALID_AI_RESPONSE',
          message: 'Respons dari model AI kosong atau tidak dapat diproses.',
        };
        throw error;
      }

      let parsed: RawExtractionAiOutput;
      try {
        parsed = JSON.parse(responseText);
      } catch {
        const error: GeminiApiError = {
          code: 'INVALID_AI_RESPONSE',
          message: 'Gagal mem-parsing format structured output JSON dari model AI.',
        };
        throw error;
      }

      if (!parsed || !parsed.resultType) {
        const error: GeminiApiError = {
          code: 'INVALID_AI_RESPONSE',
          message: 'Format output AI tidak memuat klasifikasi resultType yang valid.',
        };
        throw error;
      }

      return parsed;
    } catch (err: unknown) {
      clearTimeout(timeoutId);

      if (err && typeof err === 'object' && 'code' in err && 'message' in err) {
        throw err as GeminiApiError;
      }

      const errorMessage = err instanceof Error ? err.message : String(err);

      // Tangani timeout 30 detik
      if (
        (err instanceof Error && err.name === 'AbortError') ||
        errorMessage.toLowerCase().includes('aborted') ||
        errorMessage.toLowerCase().includes('timeout')
      ) {
        const error: GeminiApiError = {
          code: 'TIMEOUT',
          message: 'Permintaan ekstraksi tugas melebihi batas waktu aplikasi 30 detik.',
        };
        throw error;
      }

      // Tangani kuota atau overload / high demand (503 / 429)
      if (
        errorMessage.includes('429') ||
        errorMessage.includes('503') ||
        errorMessage.toLowerCase().includes('quota') ||
        errorMessage.toLowerCase().includes('rate limit') ||
        errorMessage.toLowerCase().includes('overloaded') ||
        errorMessage.toLowerCase().includes('high demand')
      ) {
        const error: GeminiApiError = {
          code: 'SERVICE_OVERLOAD_OR_QUOTA',
          message: 'Layanan AI sedang sibuk atau kuota permintaan telah tercapai. Silakan coba sesaat lagi.',
        };
        throw error;
      }

      // Jaringan / koneksi eksternal
      const error: GeminiApiError = {
        code: 'NETWORK_ERROR',
        message: 'Koneksi ke layanan AI terputus atau gagal dihubungi. Periksa jaringan Anda.',
      };
      throw error;
    }
  }

  /**
   * Pembuatan Langkah Pengerjaan Checklist (POST /api/generate-checklist)
   */
  public async generateChecklist(input: {
    title: string;
    description?: string;
    requirements?: string[];
  }): Promise<GenerateChecklistResponse> {
    const client = this.getClient();
    if (!client) {
      const error: ChecklistApiError = {
        code: 'UNCONFIGURED_SERVER',
        message: 'Konfigurasi Gemini API key di server belum tersedia.',
      };
      throw error;
    }

    const model = client.getGenerativeModel({
      model: this.getModelName(),
      systemInstruction: CHECKLIST_SYSTEM_INSTRUCTION,
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: CHECKLIST_RESPONSE_SCHEMA,
        temperature: 0.2,
      },
    });

    const promptText = buildChecklistPrompt(input);

    // Enforce 30s application timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

    try {
      // Sesuai PRD: Eksekusi tunggal dengan batas waktu 30 detik.
      // Jika gagal, error dilempar ke UI agar pengguna yang menekan tombol "Coba Lagi".
      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: promptText }] }],
      });

      clearTimeout(timeoutId);

      const responseText = result.response.text();
      if (!responseText || responseText.trim().length === 0) {
        const error: ChecklistApiError = {
          code: 'INVALID_AI_RESPONSE',
          message: 'Respons dari model AI kosong atau tidak dapat diproses.',
        };
        throw error;
      }

      let parsed: { steps?: unknown };
      try {
        parsed = JSON.parse(responseText);
      } catch {
        const error: ChecklistApiError = {
          code: 'INVALID_AI_RESPONSE',
          message: 'Gagal mem-parsing format structured output JSON dari model AI.',
        };
        throw error;
      }

      if (!parsed || !Array.isArray(parsed.steps)) {
        const error: ChecklistApiError = {
          code: 'INVALID_AI_RESPONSE',
          message: 'Format output AI tidak memuat array langkah pengerjaan yang valid.',
        };
        throw error;
      }

      return {
        steps: parsed.steps.map((s) => String(s).trim()),
      };
    } catch (err: unknown) {
      clearTimeout(timeoutId);

      if (err && typeof err === 'object' && 'code' in err && 'message' in err) {
        throw err as ChecklistApiError;
      }

      const errorMessage = err instanceof Error ? err.message : String(err);

      // Tangani timeout
      if (
        (err instanceof Error && err.name === 'AbortError') ||
        errorMessage.toLowerCase().includes('aborted') ||
        errorMessage.toLowerCase().includes('timeout')
      ) {
        const error: ChecklistApiError = {
          code: 'TIMEOUT',
          message: 'Permintaan pembuatan langkah pengerjaan melebihi batas waktu 30 detik.',
        };
        throw error;
      }

      // Tangani kuota atau overload / high demand (503 / 429)
      if (
        errorMessage.includes('429') ||
        errorMessage.includes('503') ||
        errorMessage.toLowerCase().includes('quota') ||
        errorMessage.toLowerCase().includes('rate limit') ||
        errorMessage.toLowerCase().includes('overloaded') ||
        errorMessage.toLowerCase().includes('high demand')
      ) {
        const error: ChecklistApiError = {
          code: 'SERVICE_OVERLOAD_OR_QUOTA',
          message: 'Layanan AI sedang sibuk atau kuota permintaan telah tercapai. Silakan coba sesaat lagi.',
        };
        throw error;
      }

      // Jaringan / koneksi
      const error: ChecklistApiError = {
        code: 'NETWORK_ERROR',
        message: 'Koneksi ke layanan AI terputus atau gagal dihubungi. Periksa jaringan Anda.',
      };
      throw error;
    }
  }
}

/**
 * Singleton instance default untuk digunakan bersama di server
 */
export const defaultGeminiService = new GeminiService();

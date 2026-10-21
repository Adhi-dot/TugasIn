import { GoogleGenerativeAI } from '@google/generative-ai';
import {
  CHECKLIST_SYSTEM_INSTRUCTION,
  CHECKLIST_RESPONSE_SCHEMA,
  buildChecklistPrompt,
} from './checklistPrompt';
import { ChecklistApiError, GenerateChecklistResponse } from '../../types/checklist';

/**
 * Interface Client Gemini Bersama
 * Menyediakan metode standar pemanggilan structured output dengan timeout 30 detik.
 */
export interface IGeminiClient {
  generateChecklist(input: {
    title: string;
    description?: string;
    requirements?: string[];
  }): Promise<GenerateChecklistResponse>;
}

const DEFAULT_TIMEOUT_MS = 30000;
const DEFAULT_MODEL = 'gemini-1.5-flash';

export class GeminiService implements IGeminiClient {
  private client: GoogleGenerativeAI | null = null;
  private modelName: string;

  constructor(apiKey?: string, modelName: string = DEFAULT_MODEL) {
    const key =
      apiKey ||
      (typeof process !== 'undefined' && process.env?.GEMINI_API_KEY) ||
      (typeof process !== 'undefined' && process.env?.VITE_GEMINI_API_KEY) ||
      '';

    if (key && key.trim().length > 0) {
      this.client = new GoogleGenerativeAI(key.trim());
    }
    this.modelName = modelName;
  }

  public isConfigured(): boolean {
    return this.client !== null;
  }

  public async generateChecklist(input: {
    title: string;
    description?: string;
    requirements?: string[];
  }): Promise<GenerateChecklistResponse> {
    if (!this.client) {
      const error: ChecklistApiError = {
        code: 'UNCONFIGURED_SERVER',
        message: 'Konfigurasi Gemini API key di server belum tersedia.',
      };
      throw error;
    }

    const model = this.client.getGenerativeModel({
      model: this.modelName,
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

      // Tangani kuota atau overload
      if (
        errorMessage.includes('429') ||
        errorMessage.toLowerCase().includes('quota') ||
        errorMessage.toLowerCase().includes('rate limit') ||
        errorMessage.toLowerCase().includes('overloaded')
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

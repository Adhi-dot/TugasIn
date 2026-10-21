import { z } from 'zod';
import {
  GenerateChecklistRequest,
  GenerateChecklistResponse,
  GenerateChecklistErrorResponse,
  ChecklistApiError,
} from '../../types/checklist';
import { IGeminiClient, defaultGeminiService } from '../gemini/geminiClient';

/**
 * Skema Validasi Input Request POST /api/generate-checklist
 * Mengikuti batasan ketat PRD & aturan kerja:
 * - Judul wajib, tidak hanya whitespace, maksimal 150 karakter.
 * - Deskripsi maksimal 2000 karakter.
 * - Ketentuan maksimal 20 item, masing-masing maksimal 300 karakter.
 */
export const GenerateChecklistInputSchema = z.object({
  title: z
    .string({
      required_error: 'Judul tugas wajib diisi.',
      invalid_type_error: 'Judul tugas harus berupa teks string.',
    })
    .trim()
    .min(1, 'Judul tugas tidak boleh kosong atau hanya berisi spasi.')
    .max(150, 'Judul tugas maksimal 150 karakter.'),
  description: z
    .string({
      invalid_type_error: 'Deskripsi tugas harus berupa teks string.',
    })
    .max(2000, 'Deskripsi tugas maksimal 2.000 karakter.')
    .optional(),
  requirements: z
    .array(
      z
        .string({
          invalid_type_error: 'Ketentuan tugas harus berupa teks string.',
        })
        .max(300, 'Tiap butir ketentuan maksimal 300 karakter.'),
      {
        invalid_type_error: 'Ketentuan harus berupa array string.',
      }
    )
    .max(20, 'Maksimal 20 butir ketentuan tugas.')
    .optional(),
});

/**
 * Skema Validasi Server-Side untuk Memverifikasi Respons Gemini
 * Wajib berisi 3 sampai 7 langkah, teks tidak kosong, dan batas panjang wajar.
 */
export const GeminiOutputSchema = z.object({
  steps: z
    .array(
      z
        .string()
        .trim()
        .min(3, 'Langkah pengerjaan terlalu pendek atau kosong.')
        .max(250, 'Teks langkah kerja maksimal 250 karakter.')
    )
    .min(3, 'Hasil AI harus memuat minimal 3 langkah pengerjaan.')
    .max(7, 'Hasil AI tidak boleh memuat lebih dari 7 langkah pengerjaan.'),
});

export interface ApiResponse<T> {
  status: number;
  body: T;
}

/**
 * Controller / Handler Inti POST /api/generate-checklist
 * Menerima request mentah, memvalidasi dengan Zod, memanggil client Gemini, dan memverifikasi hasil.
 */
export async function handleGenerateChecklist(
  rawInput: unknown,
  geminiClient: IGeminiClient = defaultGeminiService
): Promise<ApiResponse<GenerateChecklistResponse | GenerateChecklistErrorResponse>> {
  // 1. Validasi Input Request
  const parseResult = GenerateChecklistInputSchema.safeParse(rawInput);
  if (!parseResult.success) {
    const firstError = parseResult.error.errors[0]?.message || 'Input data tugas tidak valid.';
    return {
      status: 400,
      body: {
        error: {
          code: 'INVALID_INPUT',
          message: firstError,
        },
      },
    };
  }

  const validatedInput: GenerateChecklistRequest = parseResult.data;

  // 2. Pemanggilan Layanan Gemini
  let rawAiResponse: GenerateChecklistResponse;
  try {
    rawAiResponse = await geminiClient.generateChecklist(validatedInput);
  } catch (err: unknown) {
    const errorObj = err as ChecklistApiError;
    let httpStatus = 500;

    switch (errorObj.code) {
      case 'UNCONFIGURED_SERVER':
        httpStatus = 503;
        break;
      case 'SERVICE_OVERLOAD_OR_QUOTA':
        httpStatus = 429;
        break;
      case 'TIMEOUT':
        httpStatus = 504;
        break;
      case 'INVALID_AI_RESPONSE':
        httpStatus = 502;
        break;
      default:
        httpStatus = 500;
        break;
    }

    return {
      status: httpStatus,
      body: {
        error: {
          code: errorObj.code || 'NETWORK_ERROR',
          message: errorObj.message || 'Terjadi kesalahan saat memproses langkah pengerjaan.',
        },
      },
    };
  }

  // 3. Verifikasi Server-Side Terhadap Output Model
  const verificationResult = GeminiOutputSchema.safeParse(rawAiResponse);
  if (!verificationResult.success) {
    return {
      status: 502,
      body: {
        error: {
          code: 'INVALID_AI_RESPONSE',
          message: 'Hasil langkah pengerjaan dari AI tidak memenuhi standar validasi (harus 3–7 langkah valid).',
        },
      },
    };
  }

  // 4. Return Output Sukses
  return {
    status: 200,
    body: {
      steps: verificationResult.data.steps,
    },
  };
}

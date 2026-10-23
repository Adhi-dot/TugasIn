import { ExtractionRequest, ExtractionResponse, ExtractionErrorState } from '../types/extraction';
import { getSimulatedExtraction } from './mockExtractionService';

export const API_ENDPOINT = '/api/extract-task';
export const DEFAULT_TIMEOUT_MS = 30000;

export interface ExtractionServiceOptions {
  useMock?: boolean;
  signal?: AbortSignal;
}

/**
 * Service Pemanggilan Backend Ekstraksi Pengumuman (POST /api/extract-task)
 * 
 * Aturan Produksi (PRD Bagian 9 & Instruksi Kerja):
 * 1. Produksi memanggil kontrak endpoint /api/extract-task milik member Gemini Extraction.
 * 2. DILARANG fallback diam-diam ke hasil simulasi saat API gagal!
 * 3. Batas waktu timeout aplikasi adalah 30 detik.
 * 4. Input divalidasi ketat (tidak kosong, maks 5.000 karakter).
 */
export async function extractTaskFromAnnouncement(
  request: ExtractionRequest,
  options?: ExtractionServiceOptions
): Promise<ExtractionResponse> {
  // 1. Validasi Input Klien Sebelum Pemanggilan
  const trimmed = request.text.trim();
  if (!trimmed) {
    const error: ExtractionErrorState = {
      type: 'INVALID_INPUT',
      message: 'Teks pengumuman tidak boleh kosong atau hanya berupa spasi.',
      actionableHint: 'Silakan tempelkan pesan pengumuman tugas dari WhatsApp atau LMS.',
    };
    throw error;
  }

  if (request.text.length > 5000) {
    const error: ExtractionErrorState = {
      type: 'INVALID_INPUT',
      message: 'Panjang teks pengumuman melebihi batas maksimal 5.000 karakter.',
      actionableHint: 'Mohon ringkas atau ambil bagian pengumuman tugas yang relevan saja.',
    };
    throw error;
  }

  // 2. Jika opsi useMock diaktifkan secara eksplisit (untuk testing/offline fixture berlabel)
  if (options?.useMock) {
    await new Promise((resolve) => setTimeout(resolve, 80));
    return getSimulatedExtraction(request);
  }

  // 3. Jalur Produksi Murni (Memanggil POST /api/extract-task)
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort('TIMEOUT');
  }, DEFAULT_TIMEOUT_MS);

  // Sambungkan sinyal abort eksternal pengguna jika ada
  if (options?.signal) {
    options.signal.addEventListener('abort', () => {
      controller.abort('USER_ABORT');
    });
  }

  try {
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      // Penanganan HTTP Status Code Spesifik (PRD Bagian 9)
      if (response.status === 429) {
        const error: ExtractionErrorState = {
          type: 'RATE_LIMIT_OR_QUOTA',
          message: 'Layanan ekstraksi AI sedang sibuk atau kuota permintaan tercapai.',
          actionableHint: 'Silakan tunggu beberapa saat sebelum mencoba lagi, atau gunakan Tambah Manual.',
        };
        throw error;
      }

      if (response.status >= 400 && response.status < 500) {
        const error: ExtractionErrorState = {
          type: 'INVALID_INPUT',
          message: 'Format pengumuman tidak dapat diproses oleh server.',
          actionableHint: 'Pastikan teks pengumuman terbaca jelas dan tidak rusak.',
        };
        throw error;
      }

      const error: ExtractionErrorState = {
        type: 'INVALID_RESPONSE',
        message: 'Terjadi gangguan internal saat memproses ekstraksi di server Gemini.',
        actionableHint: 'Silakan coba lagi atau masukkan tugas secara manual.',
      };
      throw error;
    }

    const data: ExtractionResponse = await response.json();
    return data;
  } catch (err: unknown) {
    clearTimeout(timeoutId);

    // Tangani pembatalan manual oleh pengguna
    if (options?.signal?.aborted || (err instanceof Error && err.name === 'AbortError' && controller.signal.reason === 'USER_ABORT')) {
      throw new Error('USER_ABORT');
    }

    // Tangani batas waktu timeout 30 detik
    if (controller.signal.reason === 'TIMEOUT' || (err instanceof Error && err.name === 'AbortError' && controller.signal.reason === 'TIMEOUT')) {
      const error: ExtractionErrorState = {
        type: 'TIMEOUT',
        message: 'Waktu tunggu pemrosesan melebihi batas 30 detik.',
        actionableHint: 'Koneksi ke server Gemini memerlukan waktu lebih lama dari biasanya. Silakan coba lagi atau gunakan Tambah Manual.',
      };
      throw error;
    }

    // Jika error sudah terstruktur, teruskan langsung
    if (typeof err === 'object' && err !== null && 'type' in err) {
      throw err;
    }

    // Error Jaringan / Network Failure: TIDAK ADA FALLBACK DIAM-DIAM KE SIMULASI!
    const networkError: ExtractionErrorState = {
      type: 'NETWORK_ERROR',
      message: 'Gagal terhubung ke endpoint backend ekstraksi (/api/extract-task).',
      actionableHint: 'Periksa koneksi jaringan atau pastikan backend ekstraksi telah aktif. Anda dapat mencoba lagi atau menggunakan Tambah Manual.',
    };
    throw networkError;
  }
}

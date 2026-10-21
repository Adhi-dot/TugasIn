import { ExtractionRequest, ExtractionResponse, ExtractionErrorState } from '../types/extraction';

const API_ENDPOINT = '/api/extract-task';
const DEFAULT_TIMEOUT_MS = 30000;

/**
 * Simulasi Fixture Cerdas (Hanya aktif saat backend belum terpasang di dev)
 * Berlabel `isSimulated: true` secara eksplisit sesuai instruksi PRD Bagian 9 & 12.
 */
function getSimulatedExtraction(request: ExtractionRequest): ExtractionResponse {
  const text = request.text.toLowerCase();

  // Kasus: Multiple Tasks
  if (text.includes('sistem basis data') && text.includes('kalkulus') || (text.includes('tugas 1') && text.includes('tugas 2'))) {
    return {
      resultType: 'multiple_tasks',
      warnings: ['Teks memuat lebih dari satu instruksi penugasan yang terpisah.'],
      message: 'Terdapat beberapa tugas berbeda dalam satu pengumuman. Mohon pisahkan pengumuman agar pencatatan tugas akurat.',
      isSimulated: true,
    };
  }

  // Kasus: No Task (Obrolan biasa tanpa tugas)
  if (!text.includes('tugas') && !text.includes('kumpulkan') && !text.includes('deadline') && !text.includes('project') && !text.includes('makalah')) {
    return {
      resultType: 'no_task',
      message: 'Tugas tidak ditemukan dalam pengumuman ini. Silakan periksa kembali teks yang ditempel atau gunakan Tambah Manual.',
      isSimulated: true,
    };
  }

  // Kasus: Ambiguous Deadline ("Jumat depan", "besok" tanpa sourceMessageDate)
  const isAmbiguous = text.includes('jumat depan') || (text.includes('besok') && !request.sourceMessageDate);

  // Parsing demonstrasi cerdas sesuai contoh PRD Bagian 13
  let title = 'Tugas Desain Wireframe Aplikasi Perpustakaan';
  let course: string | null = 'UI/UX';
  let description = 'Membuat wireframe aplikasi perpustakaan secara berkelompok dan dikumpulkan melalui LMS.';
  let dueDate: string | null = '2026-10-21';
  let dueTime: string | null = '23:59';
  const requirements: string[] = ['Format berkas PDF', 'Maksimal 3 anggota per kelompok', 'Kumpul via LMS'];

  if (text.includes('basis data')) {
    title = 'Perancangan ERD Sistem Basis Data';
    course = 'Sistem Basis Data';
    description = 'Tugas perancangan Entity Relationship Diagram untuk studi kasus perpustakaan.';
  } else if (text.includes('metodologi') || text.includes('proposal')) {
    title = 'Penyusunan Proposal Metodologi Penelitian';
    course = 'Metodologi Penelitian';
    description = 'Menyusun Bab 1 sampai Bab 3 proposal penelitian kuantitatif.';
  }

  if (isAmbiguous) {
    dueDate = null;
    dueTime = null;
  }

  return {
    resultType: 'task',
    draft: {
      title,
      course,
      description,
      dueDate,
      dueTime,
      sourceTimezone: text.includes('wib') ? 'WIB (UTC+7)' : null,
      requirements,
      isAmbiguousDeadline: isAmbiguous,
      ambiguityReason: isAmbiguous ? 'Tenggat waktu menyebutkan istilah relatif tanpa acuan tanggal pasti.' : undefined,
    },
    warnings: isAmbiguous ? ['Tenggat waktu ambigu, harap pastikan tanggal dengan dosen atau simpan tanpa deadline.'] : undefined,
    criticalFieldEvidence: {
      title: 'buat wireframe aplikasi perpustakaan',
      deadline: dueDate ? '21 Oktober 2026 pukul 23.59 WIB' : 'Jumat depan',
      requirements: 'Maksimal 3 anggota per kelompok. Kumpulkan PDF',
    },
    isSimulated: true,
  };
}

/**
 * Service pemanggilan backend ekstraksi pengumuman
 * Mendukung AbortController, batas waktu 30 detik, serta isolasi fallback
 */
export async function extractTaskFromAnnouncement(
  request: ExtractionRequest,
  externalSignal?: AbortSignal
): Promise<ExtractionResponse> {
  // Validasi lokal sebelum pemanggilan
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

  // Setup timeout 30 detik
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort('TIMEOUT');
  }, DEFAULT_TIMEOUT_MS);

  // Hubungkan sinyal eksternal jika ada pembatalan dari user
  if (externalSignal) {
    externalSignal.addEventListener('abort', () => {
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
        message: 'Terjadi gangguan internal saat memproses ekstraksi di server.',
        actionableHint: 'Silakan coba lagi atau masukkan tugas secara manual.',
      };
      throw error;
    }

    const data: ExtractionResponse = await response.json();
    return data;
  } catch (err: unknown) {
    clearTimeout(timeoutId);

    // Tangani pembatalan oleh pengguna
    if (externalSignal?.aborted || (err instanceof Error && err.name === 'AbortError' && controller.signal.reason === 'USER_ABORT')) {
      throw new Error('USER_ABORT');
    }

    // Tangani timeout 30 detik
    if (controller.signal.reason === 'TIMEOUT' || (err instanceof Error && err.name === 'AbortError' && controller.signal.reason === 'TIMEOUT')) {
      const error: ExtractionErrorState = {
        type: 'TIMEOUT',
        message: 'Waktu tunggu pemrosesan melebihi batas 30 detik.',
        actionableHint: 'Koneksi ke Gemini memerlukan waktu lebih lama dari biasanya. Silakan coba lagi.',
      };
      throw error;
    }

    // Jika terjadi Network Error / backend belum berjalan saat dev, aktifkan fallback berlabel simulasi
    if (err instanceof TypeError) {
      // Di environment pengembangan frontend tanpa backend lokal aktif
      await new Promise((resolve) => setTimeout(resolve, 50)); // Latensi simulasi alami
      return getSimulatedExtraction(request);
    }

    // Re-throw jika error terstruktur sudah terbentuk
    if (typeof err === 'object' && err !== null && 'type' in err) {
      throw err;
    }

    const error: ExtractionErrorState = {
      type: 'NETWORK_ERROR',
      message: 'Gagal terhubung ke layanan ekstraksi tugas.',
      actionableHint: 'Periksa koneksi internet Anda atau gunakan tombol Tambah Manual.',
    };
    throw error;
  }
}

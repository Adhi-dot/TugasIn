import { ExtractionRequest, ExtractionResponse } from '../types/extraction';
import { checkDeadlineAmbiguity } from '../utils/deadlines';

/**
 * [FIXTURE / SIMULASI TERPISAH]
 * Hanya digunakan untuk demonstrasi offline terisolasi atau automated fixture testing.
 * Selalu berlabel `isSimulated: true` secara eksplisit sesuai instruksi PRD Bagian 9 & 12.
 * DILARANG digunakan sebagai fallback diam-diam di jalur produksi!
 */
export function getSimulatedExtraction(request: ExtractionRequest): ExtractionResponse {
  const text = request.text.toLowerCase();

  // Kasus: Multiple Tasks (PRD Bagian 4 & US-01)
  if (
    (text.includes('sistem basis data') && text.includes('kalkulus')) ||
    (text.includes('tugas 1') && text.includes('tugas 2')) ||
    (text.includes('tugas a') && text.includes('tugas b'))
  ) {
    return {
      resultType: 'multiple_tasks',
      warnings: ['Teks memuat lebih dari satu instruksi tugas yang terpisah.'],
      message: 'Pengumuman terdeteksi memuat lebih dari satu tugas. Harap pisahkan teks agar diproses satu tugas per satu waktu.',
      isSimulated: true,
    };
  }

  // Kasus: No Task (Obrolan biasa tanpa tugas) (PRD Bagian 4 & US-01)
  if (
    !text.includes('tugas') &&
    !text.includes('kumpulkan') &&
    !text.includes('deadline') &&
    !text.includes('project') &&
    !text.includes('makalah') &&
    !text.includes('wireframe')
  ) {
    return {
      resultType: 'no_task',
      message: 'Teks yang dimasukkan tidak terdeteksi memuat informasi tugas kuliah. Mohon periksa kembali teks pengumuman Anda atau gunakan Tambah Manual.',
      isSimulated: true,
    };
  }

  // Cek ambiguitas deadline menggunakan utilitas PRD
  const ambiguityCheck = checkDeadlineAmbiguity(request.text, request.sourceMessageDate);

  // Parsing demonstrasi cerdas sesuai contoh PRD Bagian 13
  let title = 'Tugas Desain Wireframe Aplikasi Perpustakaan';
  let course: string | null = 'UI/UX';
  let description = 'Membuat wireframe aplikasi perpustakaan secara berkelompok dan dikumpulkan melalui LMS.';
  let dueDate: string | null = ambiguityCheck.isAmbiguous ? null : '2026-10-21';
  let dueTime: string | null = ambiguityCheck.isAmbiguous ? null : '23:59';
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
      isAmbiguousDeadline: ambiguityCheck.isAmbiguous,
      ambiguityReason: ambiguityCheck.reason,
      ambiguityType: ambiguityCheck.ambiguityType,
    },
    warnings: ambiguityCheck.isAmbiguous && ambiguityCheck.reason ? [ambiguityCheck.reason] : undefined,
    criticalFieldEvidence: {
      title: 'buat wireframe aplikasi perpustakaan',
      deadline: dueDate ? '21 Oktober 2026 pukul 23.59 WIB' : 'Tenggat ambigu / perlu dilengkapi',
      requirements: 'Maksimal 3 anggota per kelompok. Kumpulkan PDF',
    },
    isSimulated: true,
  };
}

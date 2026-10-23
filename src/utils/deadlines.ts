/**
 * Aturan Deadline & Pendeteksi Ambigu Sesuai PRD TugasIn Bagian 8
 * 
 * Aturan:
 * 1. Tanggal, jam, dan zona waktu adalah field terpisah. Dilarang auto-fill 23.59 atau tahun berjalan.
 * 2. "Besok" hanya dikonversi jika tanggal pesan asal (sourceMessageDate) diketahui.
 *    Jika tidak diketahui, tandai ambigu dan minta pengguna melengkapi tanggal acuan.
 * 3. "Jumat depan", tanggal tanpa tahun, tanggal tidak valid, atau dua tenggat bertentangan ditandai ambigu.
 * 4. Waktu tidak boleh tersimpan tanpa tanggal. Tugas tanpa deadline tetap boleh disimpan.
 */

export interface DeadlineAmbiguityResult {
  isAmbiguous: boolean;
  reason?: string;
  ambiguityType?: 'relative_no_source_date' | 'ambiguous_relative_phrase' | 'no_year' | 'conflicting_deadlines';
  suggestedAction?: string;
}

const INDONESIAN_MONTHS = [
  'januari', 'februari', 'maret', 'april', 'mei', 'juni',
  'juli', 'agustus', 'september', 'oktober', 'november', 'desember',
  'jan', 'feb', 'mar', 'apr', 'jun', 'jul', 'agu', 'sep', 'okt', 'nov', 'des'
];

/**
 * Memeriksa apakah teks pengumuman mengandung tenggat waktu yang ambigu
 */
export function checkDeadlineAmbiguity(
  text: string,
  sourceMessageDate?: string | null
): DeadlineAmbiguityResult {
  if (!text) {
    return { isAmbiguous: false };
  }

  const normalized = text.toLowerCase();

  // 1. Frasa Relatif: "Jumat depan" (memiliki ambiguitas ganda antara Jumat terdekat atau Jumat pekan depan)
  if (normalized.includes('jumat depan') || normalized.includes('senin depan') || normalized.includes('minggu depan')) {
    return {
      isAmbiguous: true,
      reason: 'Pengumuman menggunakan istilah relatif (misal "Jumat depan") yang memiliki interpretasi tanggal ganda.',
      ambiguityType: 'ambiguous_relative_phrase',
      suggestedAction: 'Harap pastikan tanggal pasti batas pengumpulan kepada dosen/asisten atau tentukan secara manual.',
    };
  }

  // 2. Frasa Relatif: "besok" atau "lusa"
  const hasBesok = /\bbesok\b/i.test(normalized);
  const hasLusa = /\blusa\b/i.test(normalized);
  if (hasBesok || hasLusa) {
    const hasSourceDate = Boolean(sourceMessageDate && sourceMessageDate.trim());
    if (!hasSourceDate) {
      return {
        isAmbiguous: true,
        reason: 'Istilah "besok"/"lusa" memerlukan acuan tanggal pesan asal agar tanggal pasti dapat dihitung.',
        ambiguityType: 'relative_no_source_date',
        suggestedAction: 'Isi tanggal pesan asal pada kolom pengumuman, atau tentukan tanggal deadline secara manual di preview.',
      };
    }
  }

  // 3. Tenggat Bertentangan (Dua tanggal atau waktu berbeda yang bersaing dalam satu pengumuman)
  const hasConflictKeyword = 
    (normalized.includes('namun') || normalized.includes('tetapi') || normalized.includes('revisi deadline') || normalized.includes('diundur')) &&
    (normalized.includes('lms') && (normalized.includes('chat') || normalized.includes('email')));
  if (hasConflictKeyword) {
    return {
      isAmbiguous: true,
      reason: 'Ditemukan indikasi perbedaan atau perubahan tenggat waktu yang bertentangan dalam pengumuman.',
      ambiguityType: 'conflicting_deadlines',
      suggestedAction: 'Periksa ketentuan mana yang berlaku (LMS atau pesan grup) lalu sesuaikan tanggal di preview.',
    };
  }

  // 4. Tanggal tanpa tahun (Contoh: "25 Oktober", "10 November" tanpa 4 digit tahun 202X)
  const monthRegexPattern = new RegExp(`\\b(\\d{1,2})\\s+(${INDONESIAN_MONTHS.join('|')})\\b`, 'i');
  const monthMatch = normalized.match(monthRegexPattern);
  if (monthMatch) {
    // Cek apakah ada 4 digit tahun di sekitarnya (misal: "25 Oktober 2026")
    const dateWithYearPattern = new RegExp(`\\b(\\d{1,2})\\s+(${INDONESIAN_MONTHS.join('|')})\\s+(20\\d{2})\\b`, 'i');
    const hasYear = dateWithYearPattern.test(normalized);
    if (!hasYear) {
      return {
        isAmbiguous: true,
        reason: 'Tanggal pengumpulan disebutkan tanpa tahun. Sistem dilarang mengasumsikan tahun berjalan secara otomatis.',
        ambiguityType: 'no_year',
        suggestedAction: 'Lengkapi tahun pengumpulan pada kolom batas pengumpulan sebelum menyimpan.',
      };
    }
  }

  return { isAmbiguous: false };
}

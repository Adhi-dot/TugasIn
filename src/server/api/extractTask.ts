import { z } from 'zod';
import { ExtractionRequest, ExtractionResponse } from '../../types/extraction';
import { TaskDraft } from '../../types/task';
import {
  IGeminiExtractionClient,
  defaultGeminiService,
  RawExtractionAiOutput,
  GeminiApiError,
} from '../gemini/geminiClient';
import { checkDeadlineAmbiguity } from '../../utils/deadlines';

/**
 * Skema Validasi Input Request POST /api/extract-task
 * Mengikuti batasan ketat PRD Bagian 4, 7, 9:
 * - text: wajib, non-whitespace, minimal 1 karakter, maksimal 5.000 karakter.
 * - sourceMessageDate: opsional, format YYYY-MM-DD.
 * - displayTimezone: string IANA / zona tampilan (default "Asia/Jakarta").
 */
export const ExtractTaskInputSchema = z.object({
  text: z
    .string({
      required_error: 'Teks pengumuman wajib diisi.',
      invalid_type_error: 'Teks pengumuman harus berupa string.',
    })
    .trim()
    .min(1, 'Teks pengumuman tidak boleh kosong atau hanya berupa spasi.')
    .max(5000, 'Panjang teks pengumuman melebihi batas maksimal 5.000 karakter.'),
  sourceMessageDate: z
    .string({
      invalid_type_error: 'Tanggal pesan asal harus berupa teks string YYYY-MM-DD.',
    })
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal pesan asal harus YYYY-MM-DD.')
    .nullable()
    .optional(),
  displayTimezone: z
    .string({
      invalid_type_error: 'Display timezone harus berupa string.',
    })
    .min(1, 'Display timezone tidak boleh kosong.')
    .default('Asia/Jakarta'),
});

export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
  };
}

export interface ApiResponse<T> {
  status: number;
  body: T;
}

/**
 * Utilitas penambahan hari secara aman berbasis UTC (menghindari offset time drift)
 */
export function addDaysToDateString(dateStr: string, days: number): string | null {
  const parts = dateStr.split('-');
  if (parts.length !== 3) return null;
  const y = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10) - 1;
  const d = parseInt(parts[2], 10);
  if (isNaN(y) || isNaN(m) || isNaN(d)) return null;

  const dt = new Date(Date.UTC(y, m, d));
  dt.setUTCDate(dt.getUTCDate() + days);

  const newY = dt.getUTCFullYear();
  const newM = String(dt.getUTCMonth() + 1).padStart(2, '0');
  const newD = String(dt.getUTCDate()).padStart(2, '0');
  return `${newY}-${newM}-${newD}`;
}

/**
 * Utilitas validasi tanggal kalender riil (menolak tanggal mustahil seperti 31 Feb, 31 Apr)
 */
export function isValidCalendarDate(year: number, month: number, day: number): boolean {
  if (month < 1 || month > 12 || day < 1 || day > 31) return false;
  const d = new Date(Date.UTC(year, month - 1, day));
  return (
    d.getUTCFullYear() === year &&
    d.getUTCMonth() === month - 1 &&
    d.getUTCDate() === day
  );
}

/**
 * Memeriksa apakah teks pengumuman memuat tanggal mustahil (seperti "31 Februari")
 */
function checkImpossibleDateInText(text: string): boolean {
  const normalized = text.toLowerCase();
  // 30 atau 31 Februari
  if (/\b(30|31)\s+(februari|feb)\b/i.test(normalized)) {
    return true;
  }
  // 31 pada bulan-bulan 30 hari (April, Juni, September, November)
  if (/\b31\s+(april|apr|juni|jun|september|sep|november|nov)\b/i.test(normalized)) {
    return true;
  }
  return false;
}

const INDONESIAN_MONTH_MAP: Record<string, number> = {
  januari: 1, jan: 1,
  februari: 2, feb: 2,
  maret: 3, mar: 3,
  april: 4, apr: 4,
  mei: 5,
  juni: 6, jun: 6,
  juli: 7, jul: 7,
  agustus: 8, agu: 8,
  september: 9, sep: 9,
  oktober: 10, okt: 10,
  november: 11, nov: 11,
  desember: 12, des: 12,
};

/**
 * Utilitas konversi string tanggal (ISO atau format teks Indonesia) ke format ISO YYYY-MM-DD
 */
export function parseIndonesianDateToIso(rawDateStr?: string | null): string | null {
  if (!rawDateStr) return null;
  const trimmed = rawDateStr.trim();

  // 1. Format ISO YYYY-MM-DD
  const isoMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) {
    const y = parseInt(isoMatch[1], 10);
    const m = parseInt(isoMatch[2], 10);
    const d = parseInt(isoMatch[3], 10);
    return isValidCalendarDate(y, m, d)
      ? `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
      : null;
  }

  // 2. Format teks Indonesia: "21 Oktober 2026"
  const textMatch = trimmed.match(/\b(\d{1,2})\s+([a-zA-Z]+)\s+(20\d{2})\b/);
  if (textMatch) {
    const d = parseInt(textMatch[1], 10);
    const monthName = textMatch[2].toLowerCase();
    const y = parseInt(textMatch[3], 10);
    const m = INDONESIAN_MONTH_MAP[monthName];
    if (m && isValidCalendarDate(y, m, d)) {
      return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    }
  }

  return null;
}

/**
 * Normalisasi Zona Waktu Sumber Pengumuman ke IANA Timezone Identifier Resmi
 * Mengikuti PRD Bagian 9 & Aturan Arsitektur:
 * - "WIB", "UTC+7", "GMT+7" dinormalisasi ke "Asia/Jakarta"
 * - "WITA", "UTC+8", "GMT+8" dinormalisasi ke "Asia/Makassar"
 * - "WIT", "UTC+9", "GMT+9" dinormalisasi ke "Asia/Jayapura"
 * - Identifier IANA valid (misal "Asia/Jakarta", "UTC") dipertahankan
 * - PENTING: Jika zona waktu TIDAK disebutkan di pengumuman, WAJIB mengembalikan null!
 *   Dilarang mengubah zona yang tidak disebutkan menjadi fakta sumber (misal dilarang auto-fill Asia/Jakarta).
 */
export function normalizeSourceTimezone(
  rawTz?: string | null,
  announcementText?: string
): string | null {
  const text = announcementText || '';
  const tzCandidate = (rawTz || '').trim();

  // 1. Cek apakah di teks pengumuman atau field rawTz ada indikator zona waktu eksplisit
  const combined = `${tzCandidate} ${text}`.toUpperCase();

  const mentionsWIB = /\b(WIB|UTC\+7|GMT\+7)\b/.test(combined);
  const mentionsWITA = /\b(WITA|UTC\+8|GMT\+8)\b/.test(combined);
  const mentionsWIT = /\b(WIT|UTC\+9|GMT\+9)\b/.test(combined);

  if (mentionsWIB) return 'Asia/Jakarta';
  if (mentionsWITA) return 'Asia/Makassar';
  if (mentionsWIT) return 'Asia/Jayapura';

  // 2. Jika AI menghasilkan zona IANA valid yang cocok
  if (tzCandidate.length > 0) {
    const upperCandidate = tzCandidate.toUpperCase();
    if (upperCandidate === 'ASIA/JAKARTA') return 'Asia/Jakarta';
    if (upperCandidate === 'ASIA/MAKASSAR') return 'Asia/Makassar';
    if (upperCandidate === 'ASIA/JAYAPURA') return 'Asia/Jayapura';
    if (upperCandidate === 'UTC') return 'UTC';

    try {
      new Intl.DateTimeFormat(undefined, { timeZone: tzCandidate }).format();
      return tzCandidate;
    } catch {
      return null;
    }
  }

  // 3. Zona tidak disebutkan: WAJIB null!
  return null;
}

/**
 * Controller Inti POST /api/extract-task
 * Menangani validasi request, pemanggilan client Gemini, serta penegakan aturan
 * deterministik tenggat waktu & ambiguitas sesuai PRD-TugasIn.md Bagian 8 & 9.
 */
export async function handleExtractTask(
  rawInput: unknown,
  geminiClient: IGeminiExtractionClient = defaultGeminiService
): Promise<ApiResponse<ExtractionResponse | ApiErrorResponse>> {
  // 1. Validasi Input Klien
  const parseResult = ExtractTaskInputSchema.safeParse(rawInput);
  if (!parseResult.success) {
    const firstError = parseResult.error.errors[0]?.message || 'Input pengumuman tidak valid.';
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

  const validatedInput: ExtractionRequest = parseResult.data;

  // Log aman: tidak mencatat teks pengumuman atau kunci rahasia
  // console.info(`[Extract Task] Memproses teks (panjang: ${validatedInput.text.length} karakter).`);

  // 2. Pemanggilan Layanan Gemini
  let rawAiResponse: RawExtractionAiOutput;
  try {
    rawAiResponse = await geminiClient.extractTask(validatedInput);
  } catch (err: unknown) {
    const errorObj = err as GeminiApiError;
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
          message: errorObj.message || 'Terjadi gangguan saat memproses ekstraksi di server Gemini.',
        },
      },
    };
  }

  // 3. Verifikasi Server-Side Terhadap Output Model
  if (!rawAiResponse || !rawAiResponse.resultType) {
    return {
      status: 502,
      body: {
        error: {
          code: 'INVALID_AI_RESPONSE',
          message: 'Model AI tidak mengembalikan klasifikasi hasil ekstraksi yang valid.',
        },
      },
    };
  }

  const resultType = rawAiResponse.resultType;

  // 4. Kasus: Bukan Tugas (no_task) - PRD Bagian 4 & US-01
  if (resultType === 'no_task') {
    return {
      status: 200,
      body: {
        resultType: 'no_task',
        draft: null,
        message:
          rawAiResponse.message ||
          'Teks yang dimasukkan tidak terdeteksi memuat informasi tugas kuliah. Mohon periksa kembali teks pengumuman Anda atau gunakan Tambah Manual.',
        warnings: [],
      },
    };
  }

  // 5. Kasus: Beberapa Tugas (multiple_tasks) - PRD Bagian 4 & US-01
  if (resultType === 'multiple_tasks') {
    return {
      status: 200,
      body: {
        resultType: 'multiple_tasks',
        draft: null,
        message:
          rawAiResponse.message ||
          'Pengumuman terdeteksi memuat lebih dari satu tugas. Harap pisahkan teks agar diproses satu tugas per satu waktu.',
        warnings:
          rawAiResponse.warnings && rawAiResponse.warnings.length > 0
            ? rawAiResponse.warnings
            : ['Teks memuat lebih dari satu instruksi tugas yang terpisah.'],
      },
    };
  }

  // 6. Kasus: Satu Tugas (task) - Bangun Draf & Tegakkan Aturan Tenggat PRD Bagian 8
  const warnings: string[] = [];
  const textNormalized = validatedInput.text.toLowerCase();

  // Audit ambiguitas deadline menggunakan utilitas PRD
  const ambiguityCheck = checkDeadlineAmbiguity(
    validatedInput.text,
    validatedInput.sourceMessageDate
  );

  let isAmbiguousDeadline = false;
  let ambiguityReason: string | undefined = undefined;
  let ambiguityType: TaskDraft['ambiguityType'] = undefined;

  let dueDate: string | null = null;
  let dueTime: string | null = null;

  // Cek apakah ada tanggal mustahil di kalender (misal 31 Februari)
  const isImpossibleDate = checkImpossibleDateInText(validatedInput.text);
  if (isImpossibleDate) {
    isAmbiguousDeadline = true;
    ambiguityReason = 'Tanggal pengumpulan tidak valid pada kalender (misal 31 Februari atau 31 pada bulan 30 hari).';
    warnings.push(ambiguityReason);
  } else if (ambiguityCheck.isAmbiguous) {
    isAmbiguousDeadline = true;
    ambiguityReason = ambiguityCheck.reason;
    ambiguityType = ambiguityCheck.ambiguityType;
    if (ambiguityReason) {
      warnings.push(ambiguityReason);
    }
  }

  // Tangani kalkulasi tanggal relatif jika ada acuan tanggal pesan asal
  const hasBesok = /\bbesok\b/i.test(textNormalized);
  const hasLusa = /\blusa\b/i.test(textNormalized);
  if ((hasBesok || hasLusa) && validatedInput.sourceMessageDate) {
    const daysToAdd = hasBesok ? 1 : 2;
    const computedDate = addDaysToDateString(validatedInput.sourceMessageDate, daysToAdd);
    if (computedDate) {
      dueDate = computedDate;
      isAmbiguousDeadline = false;
      ambiguityReason = undefined;
      ambiguityType = undefined;
    }
  } else if (!isAmbiguousDeadline) {
    // 1. Cek apakah model AI mengembalikan tanggal
    const parsedAiDate = parseIndonesianDateToIso(rawAiResponse.dueDate);
    if (parsedAiDate) {
      dueDate = parsedAiDate;
    } else {
      // 2. Fallback deterministik: cek apakah teks memuat tanggal lengkap dengan 4 digit tahun (contoh: "21 Oktober 2026")
      const parsedTextDate = parseIndonesianDateToIso(validatedInput.text);
      if (parsedTextDate) {
        dueDate = parsedTextDate;
      }
    }
  }

  // Waktu pengumpulan (dueTime)
  // Aturan PRD: Waktu tidak boleh dianggap deadline lengkap tanpa tanggal.
  // dueTime hanya boleh terisi jika dueDate tersedia. Jangan pernah asumsikan 23:59 otomatis.
  let rawDueTime = rawAiResponse.dueTime ? rawAiResponse.dueTime.trim() : null;
  if (!rawDueTime) {
    // Deteksi waktu eksplisit dari teks pengumuman (contoh: "pukul 23.59" atau "23:59")
    const textTimeMatch = validatedInput.text.match(/\b(?:pukul|jam)?\s*([01]?\d|2[0-3])[:.]([0-5]\d)\b/i);
    if (textTimeMatch) {
      rawDueTime = `${textTimeMatch[1]}:${textTimeMatch[2]}`;
    }
  }

  const timeMatch = rawDueTime ? rawDueTime.match(/^([01]?\d|2[0-3])[:.]([0-5]\d)$/) : null;

  if (timeMatch && dueDate) {
    // Normalisasi format HH:mm
    const h = String(parseInt(timeMatch[1], 10)).padStart(2, '0');
    const m = timeMatch[2];
    dueTime = `${h}:${m}`;
  } else if (timeMatch && !dueDate) {
    // Waktu ada tetapi tanggal tidak ada -> ditolak sebagai deadline lengkap (PRD Bagian 8)
    dueTime = null;
    isAmbiguousDeadline = true;
    const timeWarning = `Waktu pengumpulan ("${timeMatch[0]}") terdeteksi tanpa tanggal pasti, sehingga tidak dapat dijadikan batas tenggat lengkap.`;
    if (!warnings.includes(timeWarning)) {
      warnings.push(timeWarning);
    }
  } else {
    // Jam tidak disebutkan: JANGAN MENGASUMSIKAN 23.59!
    dueTime = null;
  }

  // PRD Bagian 8: Tugas tanpa deadline sama sekali tetap menghasilkan draft dengan peringatan
  // PENTING: Hanya tambahkan peringatan jika deadline memang BENAR-BENAR TIDAK ADA dan tidak ambigu
  if (!dueDate && !isAmbiguousDeadline) {
    warnings.push('Pengumuman tidak memuat tenggat waktu pengumpulan (perlu dilengkapi).');
  }

  // Masukkan peringatan tambahan dari model jika ada (filter peringatan palsu/kontradiktif jika deadline sudah lengkap)
  if (Array.isArray(rawAiResponse.warnings)) {
    for (const w of rawAiResponse.warnings) {
      const trimmedW = String(w).trim();
      if (dueDate && trimmedW.toLowerCase().includes('tenggat')) {
        continue; // Hindari warning tenggat palsu jika dueDate berhasil teridentifikasi lengkap
      }
      if (trimmedW && !warnings.includes(trimmedW)) {
        warnings.push(trimmedW);
      }
    }
  }

  // Rakit TaskDraft resmi
  const draftTitle =
    (rawAiResponse.title && rawAiResponse.title.trim()) || 'Tugas Baru dari Pengumuman';

  let draftCourse =
    rawAiResponse.course && rawAiResponse.course.trim().length > 0
      ? rawAiResponse.course.trim().slice(0, 100)
      : null;

  // Fallback nama mata kuliah jika disebutkan eksplisit di teks tapi terlewat oleh AI
  if (!draftCourse) {
    const courseRegexMatch = validatedInput.text.match(/\b(?:mata\s*kuliah|matkul)\s+([A-Za-z0-9/ ]+?)(?:,|\.|\bbuat\b|\btugas\b|\bprojek\b|$)/i);
    if (courseRegexMatch && courseRegexMatch[1].trim().length > 0) {
      draftCourse = courseRegexMatch[1].trim().slice(0, 100);
    }
  }

  const draftDescription =
    (rawAiResponse.description && rawAiResponse.description.trim()) || '';

  const draftSourceTimezone = normalizeSourceTimezone(
    rawAiResponse.sourceTimezone,
    validatedInput.text
  );

  let draftRequirements: string[] = Array.isArray(rawAiResponse.requirements)
    ? rawAiResponse.requirements
        .map((r) => String(r).trim())
        .filter((r) => r.length > 0)
    : [];

  // Fallback ketentuan eksplisit jika terlewat oleh AI
  if (draftRequirements.length === 0) {
    if (/\bmaksimal\s+\d+\s+anggota\b/i.test(validatedInput.text)) {
      const match = validatedInput.text.match(/\bmaksimal\s+\d+\s+anggota[^\n,.]*/i);
      if (match) draftRequirements.push(match[0].trim());
    }
    if (/\b(?:format|file)\s+pdf\b/i.test(validatedInput.text) || /\bkumpulkan\s+pdf\b/i.test(validatedInput.text)) {
      draftRequirements.push('Format PDF');
    }
    if (/\blms\b/i.test(validatedInput.text)) {
      draftRequirements.push('Kumpul melalui LMS');
    }
  }

  const draft: TaskDraft = {
    title: draftTitle.slice(0, 150),
    course: draftCourse,
    description: draftDescription,
    dueDate,
    dueTime,
    sourceTimezone: draftSourceTimezone,
    requirements: draftRequirements,
    isAmbiguousDeadline: isAmbiguousDeadline || undefined,
    ambiguityReason: isAmbiguousDeadline ? ambiguityReason : undefined,
    ambiguityType: isAmbiguousDeadline ? ambiguityType : undefined,
  };

  // Bukti teks verbatim untuk field kritis
  const criticalFieldEvidence: Record<string, string> = {};
  if (rawAiResponse.criticalFieldEvidence?.title?.trim()) {
    criticalFieldEvidence.title = rawAiResponse.criticalFieldEvidence.title.trim();
  } else {
    criticalFieldEvidence.title = draftTitle;
  }

  if (rawAiResponse.criticalFieldEvidence?.deadline?.trim()) {
    criticalFieldEvidence.deadline = rawAiResponse.criticalFieldEvidence.deadline.trim();
  } else if (dueDate) {
    // Cari kalimat di pengumuman yang memuat deadline
    const deadlineSentenceMatch = validatedInput.text.match(/[^.!?\n]*\b(?:kumpulkan|tenggat|deadline|batas|pada)\b[^.!?\n]*/i);
    criticalFieldEvidence.deadline = deadlineSentenceMatch
      ? deadlineSentenceMatch[0].trim()
      : `${dueDate}${dueTime ? ' ' + dueTime : ''}`;
  }

  if (rawAiResponse.criticalFieldEvidence?.requirements?.trim()) {
    criticalFieldEvidence.requirements = rawAiResponse.criticalFieldEvidence.requirements.trim();
  } else if (draftRequirements.length > 0) {
    criticalFieldEvidence.requirements = draftRequirements.join('. ');
  }

  return {
    status: 200,
    body: {
      resultType: 'task',
      draft,
      warnings,
      criticalFieldEvidence,
    },
  };
}

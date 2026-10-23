import { TaskDraft } from '../types/task';

export interface ValidationResult {
  isValid: boolean;
  errors: {
    title?: string;
    course?: string;
    dueDate?: string;
    dueTime?: string;
  };
  cleanedDraft?: TaskDraft;
}

/**
 * Validasi ketat draft tugas sebelum disimpan (Sesuai PRD Bagian 8 & 9)
 */
export function validateTaskDraft(draft: TaskDraft): ValidationResult {
  const errors: ValidationResult['errors'] = {};

  // 1. Validasi Judul Tugas: Wajib, maksimal 150 karakter setelah trim
  const trimmedTitle = (draft.title || '').trim();
  if (!trimmedTitle) {
    errors.title = 'Judul tugas wajib diisi.';
  } else if (trimmedTitle.length > 150) {
    errors.title = 'Judul tugas tidak boleh melebihi 150 karakter.';
  }

  // 2. Validasi Mata Kuliah: Opsional, maksimal 100 karakter jika diisi
  const trimmedCourse = (draft.course || '').trim();
  if (trimmedCourse.length > 100) {
    errors.course = 'Nama mata kuliah tidak boleh melebihi 100 karakter.';
  }

  // 3. Validasi Deadline: Waktu tidak boleh disimpan tanpa tanggal
  const hasDate = Boolean(draft.dueDate && draft.dueDate.trim());
  const hasTime = Boolean(draft.dueTime && draft.dueTime.trim());

  if (hasTime && !hasDate) {
    errors.dueTime = 'Waktu pengumpulan tidak dapat disimpan tanpa tanggal. Silakan tentukan tanggal atau hapus jam.';
  }

  // 4. Validasi Format Tanggal jika ada (YYYY-MM-DD)
  if (hasDate) {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(draft.dueDate!.trim())) {
      errors.dueDate = 'Format tanggal pengumpulan tidak valid (harus YYYY-MM-DD).';
    } else {
      const parsedDate = new Date(draft.dueDate!.trim());
      if (isNaN(parsedDate.getTime())) {
        errors.dueDate = 'Tanggal pengumpulan tidak valid.';
      }
    }
  }

  // 5. Validasi Format Jam jika ada (HH:mm)
  if (hasTime && hasDate) {
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    if (!timeRegex.test(draft.dueTime!.trim())) {
      errors.dueTime = 'Format jam pengumpulan tidak valid (harus HH:mm).';
    }
  }

  const isValid = Object.keys(errors).length === 0;

  let cleanedDraft: TaskDraft | undefined = undefined;
  if (isValid) {
    cleanedDraft = {
      title: trimmedTitle,
      course: trimmedCourse ? trimmedCourse : null,
      description: (draft.description || '').trim(),
      dueDate: hasDate ? draft.dueDate!.trim() : null,
      dueTime: hasDate && hasTime ? draft.dueTime!.trim() : null,
      sourceTimezone: draft.sourceTimezone ? draft.sourceTimezone.trim() : null,
      requirements: (draft.requirements || []).filter((r) => r.trim().length > 0),
      isAmbiguousDeadline: draft.isAmbiguousDeadline,
    };
  }

  return {
    isValid,
    errors,
    cleanedDraft,
  };
}

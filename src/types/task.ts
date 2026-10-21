/**
 * Model Data Tugas TugasIn (Sesuai PRD Bagian 9)
 */

export type TaskStatus = 'not_started' | 'dikerjakan' | 'selesai';

export interface TaskChecklistItem {
  id: string;
  text: string;
  completed: boolean;
  origin: 'ai' | 'manual';
}

export interface Task {
  id: string;
  title: string;                    // Wajib, maks 150 karakter
  course: string | null;            // Maks 100 karakter
  description: string;
  sourceText: string;               // Teks pengumuman asli
  sourceMessageDate: string | null; // Format YYYY-MM-DD
  dueDate: string | null;           // Format YYYY-MM-DD
  dueTime: string | null;           // Format HH:mm (hanya ada jika dueDate ada)
  sourceTimezone: string | null;    // Zona waktu dari sumber jika eksplisit
  displayTimezone: string;          // Zona waktu untuk tampilan aplikasi (e.g. Asia/Jakarta)
  requirements: string[];           // Ketentuan dari sumber pengumuman
  status: TaskStatus;
  checklist: TaskChecklistItem[];
  createdAt: string;                // ISO timestamp
  updatedAt: string;                // ISO timestamp
}

/**
 * Draft Tugas hasil ekstraksi Gemini sebelum disimpan pengguna
 */
export interface TaskDraft {
  title: string;
  course: string | null;
  description: string;
  dueDate: string | null;
  dueTime: string | null;
  sourceTimezone: string | null;
  requirements: string[];
  isAmbiguousDeadline?: boolean;
  ambiguityReason?: string;
}

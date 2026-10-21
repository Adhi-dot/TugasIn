/**
 * Task Data Models & Enums for TugasIn
 * Aligned with PRD-TugasIn.md Section 9 & AGENTS.md
 */

export type TaskStatus = 'not_started' | 'in_progress' | 'done';

export type TaskFilter = 'all' | 'not_started' | 'in_progress' | 'done';

export type ChecklistOrigin = 'ai' | 'manual';

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
  origin: ChecklistOrigin;
}

export interface Task {
  id: string;
  title: string;
  course: string | null;
  description: string;
  sourceText: string;                // Teks pengumuman; string kosong "" untuk input manual
  sourceMessageDate: string | null;  // Acuan tanggal relatif (YYYY-MM-DD atau null)
  dueDate: string | null;            // Tanggal penuh valid (YYYY-MM-DD atau null)
  dueTime: string | null;            // HH:mm atau null, hanya jika dueDate tersedia
  sourceTimezone: string | null;     // Zona yang disebutkan/dikonfirmasi (atau null)
  displayTimezone: string;           // Zona untuk tampilan dan perhitungan indikator (IANA atau label terdaftar)
  requirements: string[];            // Ketentuan dari sumber
  status: TaskStatus;                // not_started | in_progress | done
  checklist: ChecklistItem[];        // Langkah pengerjaan
  createdAt: string;                 // ISO timestamp
  updatedAt: string;                 // ISO timestamp
}

export interface TaskDeadlineInfo {
  formattedDeadline: string;
  isOverdue: boolean;
  hasTime: boolean;
  hasDeadline: boolean;
  deadlineTimestamp: number | null;
  urgencyLabel?: string;
}

export interface TaskChecklistProgress {
  total: number;
  completed: number;
  percentage: number;
  formattedProgress: string; // e.g. "3/5 langkah (60%)"
}

export interface DashboardSummary {
  activeCount: number;   // not_started + in_progress
  doneCount: number;     // done
  totalCount: number;
  overdueCount: number;
  notStartedCount: number;
  inProgressCount: number;
}

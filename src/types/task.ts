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
  sourceText?: string;
  sourceMessageDate?: string | null; // YYYY-MM-DD
  dueDate: string | null;            // YYYY-MM-DD
  dueTime: string | null;            // HH:mm
  sourceTimezone: string | null;     // e.g. "WIB"
  displayTimezone: string;           // e.g. "WIB" or "Asia/Jakarta"
  requirements: string[];
  status: TaskStatus;
  checklist: ChecklistItem[];
  createdAt: string;                 // ISO string
  updatedAt: string;                 // ISO string
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

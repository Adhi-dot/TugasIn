import { ChecklistItemData } from './checklist';

export type TaskStatus = 'not_started' | 'in_progress' | 'done';

export interface Task {
  id: string;
  title: string;
  course: string | null;
  description: string;
  sourceText?: string;
  sourceMessageDate?: string | null;
  dueDate?: string | null;
  dueTime?: string | null;
  sourceTimezone?: string | null;
  displayTimezone?: string;
  requirements: string[];
  status: TaskStatus;
  checklist: ChecklistItemData[];
  createdAt: string;
  updatedAt: string;
}

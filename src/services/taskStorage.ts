/**
 * Service: Task Storage & State Persistence
 * Aligned with PRD-TugasIn.md Sections 5, 7, 9 & AGENTS.md
 * 
 * Key responsibilities:
 * 1. Single source of truth storage key: "tugasin_tasks"
 * 2. Strict validation on reading stored data:
 *    - Validates schema, required fields, and status enum.
 *    - Detects corrupted JSON or invalid shapes without silent automatic deletion.
 * 3. Graceful handling of QuotaExceededError / unavailable localStorage.
 * 4. Preserves backward-compatible Task contracts.
 */

import { Task, TaskStatus } from '../types/task';
import { ChecklistItemData, ChecklistOrigin } from '../types/checklist';
import { resolveIanaTimezone } from '../lib/deadline';

export const STORAGE_KEY = 'tugasin_tasks';

export interface StorageLoadResult {
  status: 'empty' | 'valid' | 'corrupted';
  tasks: Task[];
  rawError?: string;
}

export interface StorageSaveResult {
  success: boolean;
  error?: string;
  isQuotaExceeded?: boolean;
}

/**
 * Validates a single ChecklistItemData
 */
function isValidChecklistItem(item: unknown): item is ChecklistItemData {
  if (!item || typeof item !== 'object') return false;
  const candidate = item as Record<string, unknown>;
  const validOrigin: ChecklistOrigin[] = ['ai', 'manual'];

  return (
    typeof candidate.id === 'string' &&
    candidate.id.trim().length > 0 &&
    typeof candidate.text === 'string' &&
    typeof candidate.completed === 'boolean' &&
    validOrigin.includes(candidate.origin as ChecklistOrigin)
  );
}

/**
 * Validates whether an unknown parsed object matches the Task interface contract
 */
export function isValidTask(obj: unknown): obj is Task {
  if (!obj || typeof obj !== 'object') return false;
  const candidate = obj as Record<string, unknown>;

  // Required string ID
  if (typeof candidate.id !== 'string' || candidate.id.trim().length === 0) {
    return false;
  }

  // Required title (max 150 chars)
  if (
    typeof candidate.title !== 'string' ||
    candidate.title.trim().length === 0 ||
    candidate.title.length > 150
  ) {
    return false;
  }

  // Course: optional string <= 100 or null
  if (candidate.course !== null && candidate.course !== undefined) {
    if (typeof candidate.course !== 'string' || candidate.course.length > 100) {
      return false;
    }
  }

  // Description: string
  if (typeof candidate.description !== 'string') {
    return false;
  }

  // Status: must be one of 'not_started' | 'in_progress' | 'done'
  const validStatuses: TaskStatus[] = ['not_started', 'in_progress', 'done'];
  if (!validStatuses.includes(candidate.status as TaskStatus)) {
    return false;
  }

  // Checklist: must be array of valid checklist items
  if (!Array.isArray(candidate.checklist)) {
    return false;
  }
  for (const item of candidate.checklist) {
    if (!isValidChecklistItem(item)) {
      return false;
    }
  }

  // Requirements: must be array of strings
  if (!Array.isArray(candidate.requirements)) {
    return false;
  }
  for (const req of candidate.requirements) {
    if (typeof req !== 'string') return false;
  }

  // Date constraints: dueTime without dueDate is invalid
  const hasDate = typeof candidate.dueDate === 'string' && candidate.dueDate.trim().length > 0;
  const hasTime = typeof candidate.dueTime === 'string' && candidate.dueTime.trim().length > 0;
  if (hasTime && !hasDate) {
    return false;
  }

  return true;
}

/**
 * Normalizes a validated task to ensure all optional properties conform strictly to defaults
 */
export function normalizeTask(candidate: Record<string, unknown>): Task {
  const defaultTz = resolveIanaTimezone(
    typeof candidate.displayTimezone === 'string' ? candidate.displayTimezone : null
  );

  return {
    id: String(candidate.id),
    title: String(candidate.title).trim(),
    course: typeof candidate.course === 'string' && candidate.course.trim().length > 0
      ? candidate.course.trim()
      : null,
    description: typeof candidate.description === 'string' ? candidate.description : '',
    sourceText: typeof candidate.sourceText === 'string' ? candidate.sourceText : '',
    sourceMessageDate: typeof candidate.sourceMessageDate === 'string' && candidate.sourceMessageDate.trim().length > 0
      ? candidate.sourceMessageDate.trim()
      : null,
    dueDate: typeof candidate.dueDate === 'string' && candidate.dueDate.trim().length > 0
      ? candidate.dueDate.trim()
      : null,
    dueTime: typeof candidate.dueTime === 'string' && candidate.dueTime.trim().length > 0
      ? candidate.dueTime.trim()
      : null,
    sourceTimezone: typeof candidate.sourceTimezone === 'string' && candidate.sourceTimezone.trim().length > 0
      ? candidate.sourceTimezone.trim()
      : null,
    displayTimezone: defaultTz,
    requirements: Array.isArray(candidate.requirements)
      ? candidate.requirements.map(r => String(r).trim()).filter(Boolean)
      : [],
    status: (candidate.status as TaskStatus) || 'not_started',
    checklist: Array.isArray(candidate.checklist)
      ? (candidate.checklist as ChecklistItemData[]).map(item => ({
          id: String(item.id),
          text: String(item.text),
          completed: Boolean(item.completed),
          origin: (item.origin === 'ai' ? 'ai' : 'manual') as ChecklistOrigin,
        }))
      : [],
    createdAt: typeof candidate.createdAt === 'string' ? candidate.createdAt : new Date().toISOString(),
    updatedAt: typeof candidate.updatedAt === 'string' ? candidate.updatedAt : new Date().toISOString(),
  };
}

function getStorage(): Storage | null {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage;
    }
    if (typeof globalThis !== 'undefined' && (globalThis as unknown as { localStorage?: Storage }).localStorage) {
      return (globalThis as unknown as { localStorage: Storage }).localStorage;
    }
  } catch {
    return null;
  }
  return null;
}

/**
 * Reads tasks from localStorage, with strict validation & corrupt detection.
 * If data is corrupt or cannot be parsed, does NOT automatically delete.
 */
export function loadTasksFromStorage(): StorageLoadResult {
  const storage = getStorage();
  if (!storage) {
    return {
      status: 'corrupted',
      tasks: [],
      rawError: 'Penyimpanan lokal browser tidak tersedia pada lingkungan ini',
    };
  }

  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw || raw.trim() === '') {
      return { status: 'empty', tasks: [] };
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch (parseErr) {
      return {
        status: 'corrupted',
        tasks: [],
        rawError: parseErr instanceof Error ? parseErr.message : 'JSON tidak valid',
      };
    }

    if (!Array.isArray(parsed)) {
      return {
        status: 'corrupted',
        tasks: [],
        rawError: 'Data tersimpan bukan berupa array tugas yang valid',
      };
    }

    if (parsed.length === 0) {
      return { status: 'empty', tasks: [] };
    }

    const validatedTasks: Task[] = [];
    for (let i = 0; i < parsed.length; i++) {
      const item = parsed[i];
      if (!isValidTask(item)) {
        return {
          status: 'corrupted',
          tasks: [],
          rawError: `Item pada indeks ${i} tidak memenuhi kontrak data Task`,
        };
      }
      validatedTasks.push(normalizeTask(item as unknown as Record<string, unknown>));
    }

    return {
      status: 'valid',
      tasks: validatedTasks,
    };
  } catch (err) {
    return {
      status: 'corrupted',
      tasks: [],
      rawError: err instanceof Error ? err.message : 'Gagal mengakses penyimpanan lokal browser',
    };
  }
}

/**
 * Saves tasks to localStorage. Handles QuotaExceededError and quota failures.
 * Returns { success: true } or { success: false, error, isQuotaExceeded }.
 */
export function saveTasksToStorage(tasks: Task[]): StorageSaveResult {
  const storage = getStorage();
  if (!storage) {
    return {
      success: false,
      error: 'Penyimpanan lokal browser tidak tersedia atau dinonaktifkan.',
    };
  }

  try {
    const serialized = JSON.stringify(tasks);
    storage.setItem(STORAGE_KEY, serialized);
    return { success: true };
  } catch (err: unknown) {
    const isQuota =
      Boolean(
        err &&
          typeof err === 'object' &&
          ('code' in err || 'name' in err) &&
          ((err as { code?: number }).code === 22 ||
            (err as { code?: number }).code === 1014 ||
            (err as { name?: string }).name === 'QuotaExceededError' ||
            (err as { name?: string }).name === 'NS_ERROR_DOM_QUOTA_REACHED')
      );

    const errorMessage = isQuota
      ? 'Kapasitas penyimpanan lokal browser telah penuh (QuotaExceededError). Perubahan belum dapat disimpan.'
      : 'Penyimpanan lokal browser tidak dapat diakses atau diblokir. Perubahan belum dapat disimpan.';

    console.error('saveTasksToStorage error:', err);

    return {
      success: false,
      error: errorMessage,
      isQuotaExceeded: isQuota,
    };
  }
}

/**
 * Explicitly clears corrupted tasks from localStorage after user confirmation.
 */
export function resetStorage(): boolean {
  const storage = getStorage();
  if (!storage) return false;

  try {
    storage.removeItem(STORAGE_KEY);
    return true;
  } catch (e) {
    console.error('Gagal mereset localStorage:', e);
    return false;
  }
}

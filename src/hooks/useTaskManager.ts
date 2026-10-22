/**
 * Custom Hook: useTaskManager
 * Single Source of Truth for TugasIn Tasks across Dashboard,
 * Announcement Extraction, Task Management, and Checklist.
 * 
 * Complies with PRD-TugasIn.md Sections 5, 7, 9 & Member Task Management rules:
 * - Single localStorage source key: "tugasin_tasks"
 * - Safe error handling: never closes forms on storage failure
 * - Non-destructive corrupted data detection & user-confirmed reset
 * - Double-submit guard
 * - Immediate reactivity across views
 */

import { useState, useCallback, useRef } from 'react';
import { Task, TaskStatus } from '../types/task';
import { ChecklistItemData } from '../types/checklist';
import {
  loadTasksFromStorage,
  saveTasksToStorage,
  resetStorage,
} from '../services/taskStorage';
import { resolveIanaTimezone } from '../lib/deadline';

export interface ManualTaskDraft {
  title: string;
  course?: string | null;
  description?: string;
  dueDate?: string | null;
  dueTime?: string | null;
  sourceTimezone?: string | null;
  displayTimezone?: string;
  requirements?: string[];
}

export interface UseTaskManagerReturn {
  tasks: Task[];
  isCorrupted: boolean;
  corruptedDetails: string | null;
  storageError: string | null;
  isSaving: boolean;
  isDemoMode: boolean;
  // Actions
  addTaskManual: (draft: ManualTaskDraft) => Promise<{ success: boolean; error?: string; task?: Task }>;
  addExtractedTask: (task: Task) => Promise<boolean>;
  updateTask: (taskId: string, updates: Partial<Task>) => Promise<{ success: boolean; error?: string; updatedTask?: Task }>;
  deleteTask: (taskId: string) => Promise<boolean>;
  updateTaskStatus: (taskId: string, newStatus: TaskStatus) => Promise<boolean>;
  updateTaskChecklist: (taskId: string, newChecklist: ChecklistItemData[]) => Promise<boolean>;
  confirmResetStorage: () => void;
  dismissCorruptedState: () => void;
  clearStorageError: () => void;
  // Dev / Testing Helpers
  loadMockData: (mockTasks: Task[]) => void;
  clearAllTasks: () => void;
}

export function useTaskManager(): UseTaskManagerReturn {
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);
  const [storageError, setStorageError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Initial load from storage with corruption detection
  const initialLoadRef = useRef<{ tasks: Task[]; isCorrupted: boolean; error: string | null } | null>(null);
  if (initialLoadRef.current === null) {
    const loadResult = loadTasksFromStorage();
    if (loadResult.status === 'corrupted') {
      initialLoadRef.current = {
        tasks: [],
        isCorrupted: true,
        error: loadResult.rawError || 'Format data penyimpanan lokal tidak sesuai kontrak',
      };
    } else {
      initialLoadRef.current = {
        tasks: loadResult.tasks,
        isCorrupted: false,
        error: null,
      };
    }
  }

  const [tasks, setTasks] = useState<Task[]>(initialLoadRef.current.tasks);
  const [isCorrupted, setIsCorrupted] = useState<boolean>(initialLoadRef.current.isCorrupted);
  const [corruptedDetails, setCorruptedDetails] = useState<string | null>(initialLoadRef.current.error);

  // Helper to persist task array and update state if save succeeds
  const persistAndSet = useCallback(
    async (updater: (prev: Task[]) => Task[]): Promise<boolean> => {
      if (isSaving) return false;

      // PRD US-06 Guard: Jangan menimpa data mentah jika penyimpanan masih dalam status rusak
      if (isCorrupted) {
        setStorageError('Penyimpanan browser terdeteksi rusak. Harap konfirmasi Reset Penyimpanan terlebih dahulu sebelum menyimpan data baru agar data mentah tidak tertimpa.');
        return false;
      }

      setIsSaving(true);

      const nextTasks = updater(tasks);

      // If in demo mode, keep only in memory
      if (isDemoMode) {
        setTasks(nextTasks);
        setIsSaving(false);
        return true;
      }

      const saveResult = saveTasksToStorage(nextTasks);
      if (!saveResult.success) {
        setStorageError(saveResult.error || 'Gagal menyimpan perubahan ke penyimpanan lokal browser.');
        setIsSaving(false);
        return false;
      }

      setTasks(nextTasks);
      setStorageError(null);
      setIsSaving(false);
      return true;
    },
    [isCorrupted, isDemoMode, isSaving, tasks]
  );

  /**
   * 1. Tambah Tugas Manual
   * - Judul wajib setelah trim, maksimal 150 karakter.
   * - Mata kuliah opsional, maksimal 100 karakter.
   * - Waktu tidak boleh disimpan tanpa tanggal.
   * - Tugas tanpa deadline tetap boleh disimpan.
   * - Status awal 'not_started', checklist awal [].
   * - ID unik dan timestamp dibuat aplikasi.
   * - Simpan tepat satu tugas, cegah simpan ganda.
   */
  const addTaskManual = useCallback(
    async (draft: ManualTaskDraft): Promise<{ success: boolean; error?: string; task?: Task }> => {
      const trimmedTitle = (draft.title || '').trim();
      if (!trimmedTitle) {
        return { success: false, error: 'Judul tugas wajib diisi.' };
      }
      if (trimmedTitle.length > 150) {
        return { success: false, error: 'Judul tugas tidak boleh melebihi 150 karakter.' };
      }

      const trimmedCourse = (draft.course || '').trim();
      if (trimmedCourse.length > 100) {
        return { success: false, error: 'Nama mata kuliah tidak boleh melebihi 100 karakter.' };
      }

      const hasDate = Boolean(draft.dueDate && draft.dueDate.trim().length > 0);
      const hasTime = Boolean(draft.dueTime && draft.dueTime.trim().length > 0);

      if (hasTime && !hasDate) {
        return { success: false, error: 'Waktu pengumpulan tidak dapat disimpan tanpa tanggal.' };
      }

      const now = new Date().toISOString();
      const defaultTimezone = resolveIanaTimezone(draft.displayTimezone);

      const newTask: Task = {
        id: `task-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        title: trimmedTitle,
        course: trimmedCourse.length > 0 ? trimmedCourse : null,
        description: (draft.description || '').trim(),
        sourceText: '',
        sourceMessageDate: null,
        dueDate: hasDate ? draft.dueDate!.trim() : null,
        dueTime: hasDate && hasTime ? draft.dueTime!.trim() : null,
        sourceTimezone: draft.sourceTimezone ? draft.sourceTimezone.trim() : null,
        displayTimezone: defaultTimezone,
        requirements: (draft.requirements || []).map(r => r.trim()).filter(Boolean),
        status: 'not_started',
        checklist: [],
        createdAt: now,
        updatedAt: now,
      };

      const success = await persistAndSet((prev) => [newTask, ...prev]);
      if (!success) {
        return { success: false, error: 'Penyimpanan lokal gagal. Draft tetap aman di formulir.' };
      }

      return { success: true, task: newTask };
    },
    [persistAndSet]
  );

  /**
   * Add Task from Gemini Announcement Extraction
   */
  const addExtractedTask = useCallback(
    async (newTask: Task): Promise<boolean> => {
      return await persistAndSet((prev) => [newTask, ...prev]);
    },
    [persistAndSet]
  );

  /**
   * 2. Edit Tugas
   * - Dukung koreksi: judul, mata kuliah, deskripsi, tanggal, waktu, zona waktu, ketentuan.
   * - Pertahankan ID, createdAt, sourceText, dan checklist.
   * - Perbarui updatedAt saat berhasil disimpan.
   */
  const updateTask = useCallback(
    async (
      taskId: string,
      updates: Partial<Task>
    ): Promise<{ success: boolean; error?: string; updatedTask?: Task }> => {
      let candidateUpdatedTask: Task | null = null;

      const trimmedTitle = updates.title !== undefined ? updates.title.trim() : undefined;
      if (trimmedTitle !== undefined && trimmedTitle.length === 0) {
        return { success: false, error: 'Judul tugas wajib diisi.' };
      }
      if (trimmedTitle !== undefined && trimmedTitle.length > 150) {
        return { success: false, error: 'Judul tugas tidak boleh melebihi 150 karakter.' };
      }

      const trimmedCourse = updates.course !== undefined ? (updates.course ? updates.course.trim() : null) : undefined;
      if (trimmedCourse && trimmedCourse.length > 100) {
        return { success: false, error: 'Nama mata kuliah tidak boleh melebihi 100 karakter.' };
      }

      const success = await persistAndSet((prev) =>
        prev.map((t) => {
          if (t.id === taskId) {
            const finalDueDate = updates.dueDate !== undefined ? updates.dueDate : t.dueDate;
            const finalDueTime = updates.dueTime !== undefined ? updates.dueTime : t.dueTime;

            // Guard: time without date
            const effectiveDueTime = finalDueDate ? finalDueTime : null;

            const updated: Task = {
              ...t,
              title: trimmedTitle !== undefined ? trimmedTitle : t.title,
              course: trimmedCourse !== undefined ? trimmedCourse : t.course,
              description: updates.description !== undefined ? updates.description : t.description,
              dueDate: finalDueDate ? finalDueDate.trim() : null,
              dueTime: effectiveDueTime ? effectiveDueTime.trim() : null,
              sourceTimezone: updates.sourceTimezone !== undefined ? updates.sourceTimezone : t.sourceTimezone,
              displayTimezone: updates.displayTimezone !== undefined ? updates.displayTimezone : t.displayTimezone,
              requirements: updates.requirements !== undefined ? updates.requirements : t.requirements,
              // Preserved fields
              id: t.id,
              sourceText: t.sourceText,
              sourceMessageDate: t.sourceMessageDate,
              status: updates.status !== undefined ? updates.status : t.status,
              checklist: updates.checklist !== undefined ? updates.checklist : t.checklist,
              createdAt: t.createdAt,
              updatedAt: new Date().toISOString(),
            };
            candidateUpdatedTask = updated;
            return updated;
          }
          return t;
        })
      );

      if (!success) {
        return { success: false, error: 'Penyimpanan lokal gagal. Perubahan belum dapat disimpan.' };
      }

      return { success: true, updatedTask: candidateUpdatedTask || undefined };
    },
    [persistAndSet]
  );

  /**
   * 3. Hapus Tugas
   * - Hapus setelah konfirmasi pengguna.
   */
  const deleteTask = useCallback(
    async (taskId: string): Promise<boolean> => {
      return await persistAndSet((prev) => prev.filter((t) => t.id !== taskId));
    },
    [persistAndSet]
  );

  /**
   * 4. Ubah Status Tugas (not_started, in_progress, done)
   */
  const updateTaskStatus = useCallback(
    async (taskId: string, newStatus: TaskStatus): Promise<boolean> => {
      return await persistAndSet((prev) =>
        prev.map((t) =>
          t.id === taskId
            ? { ...t, status: newStatus, updatedAt: new Date().toISOString() }
            : t
        )
      );
    },
    [persistAndSet]
  );

  /**
   * Update Checklist (dipanggil dari ChecklistSection / TaskChecklist)
   */
  const updateTaskChecklist = useCallback(
    async (taskId: string, newChecklist: ChecklistItemData[]): Promise<boolean> => {
      return await persistAndSet((prev) =>
        prev.map((t) =>
          t.id === taskId
            ? { ...t, checklist: newChecklist, updatedAt: new Date().toISOString() }
            : t
        )
      );
    },
    [persistAndSet]
  );

  /**
   * Reset corrupted storage explicitly
   */
  const confirmResetStorage = useCallback(() => {
    resetStorage();
    setIsCorrupted(false);
    setCorruptedDetails(null);
    setTasks([]);
  }, []);

  const dismissCorruptedState = useCallback(() => {
    setIsCorrupted(false);
  }, []);

  const clearStorageError = useCallback(() => {
    setStorageError(null);
  }, []);

  // Development/Test Utilities
  const loadMockData = useCallback((mockTasks: Task[]) => {
    setIsDemoMode(true);
    setTasks(mockTasks);
    setStorageError(null);
  }, []);

  const clearAllTasks = useCallback(() => {
    setIsDemoMode(false);
    resetStorage();
    setTasks([]);
    setStorageError(null);
  }, []);

  return {
    tasks,
    isCorrupted,
    corruptedDetails,
    storageError,
    isSaving,
    isDemoMode,
    addTaskManual,
    addExtractedTask,
    updateTask,
    deleteTask,
    updateTaskStatus,
    updateTaskChecklist,
    confirmResetStorage,
    dismissCorruptedState,
    clearStorageError,
    loadMockData,
    clearAllTasks,
  };
}

import { useState, useCallback, useRef, useEffect } from 'react';
import { ChecklistItemData, ChecklistApiError } from '../types/checklist';
import { handleGenerateChecklist } from '../server/api/generateChecklist';

export interface UseTaskChecklistProps {
  taskId: string;
  taskTitle: string;
  taskDescription?: string;
  taskRequirements?: string[];
  initialChecklist?: ChecklistItemData[];
  onUpdateChecklist?: (items: ChecklistItemData[]) => void;
}

export interface UseTaskChecklistReturn {
  checklist: ChecklistItemData[];
  isLoading: boolean;
  error: ChecklistApiError | null;
  editingItemId: string | null;
  isRegenerateDialogOpen: boolean;
  stats: {
    total: number;
    completed: number;
    percentage: number;
  };
  actions: {
    generateChecklist: () => Promise<void>;
    retryGenerate: () => Promise<void>;
    toggleItem: (id: string) => void;
    startEditing: (id: string) => void;
    saveEdit: (id: string, newText: string) => boolean;
    cancelEdit: () => void;
    openRegenerateDialog: () => void;
    closeRegenerateDialog: () => void;
    confirmRegenerate: () => Promise<void>;
    clearError: () => void;
  };
}

export function useTaskChecklist({
  taskId,
  taskTitle,
  taskDescription,
  taskRequirements,
  initialChecklist = [],
  onUpdateChecklist,
}: UseTaskChecklistProps): UseTaskChecklistReturn {
  const [checklist, setChecklist] = useState<ChecklistItemData[]>(initialChecklist);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<ChecklistApiError | null>(null);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [isRegenerateDialogOpen, setIsRegenerateDialogOpen] = useState<boolean>(false);

  // Melacak taskId saat ini untuk proteksi stale response
  const activeTaskIdRef = useRef<string>(taskId);
  useEffect(() => {
    activeTaskIdRef.current = taskId;
    setChecklist(initialChecklist);
    setError(null);
    setEditingItemId(null);
  }, [taskId, initialChecklist]);

  // Sinkronisasi pembaruan ke caller / storage bersama
  const persistChecklist = useCallback(
    (newItems: ChecklistItemData[]) => {
      setChecklist(newItems);
      if (onUpdateChecklist) {
        onUpdateChecklist(newItems);
      }
    },
    [onUpdateChecklist]
  );

  // Hitung statistik progres (aman dari pembagian nol)
  const total = checklist.length;
  const completed = checklist.filter((item) => item.completed).length;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  // Eksekusi pemanggilan generate checklist
  const executeGeneration = useCallback(async () => {
    if (isLoading) return; // Cegah double request

    setIsLoading(true);
    setError(null);

    const requestPayload = {
      title: taskTitle,
      description: taskDescription,
      requirements: taskRequirements,
    };

    try {
      const response = await handleGenerateChecklist(requestPayload);

      // Proteksi stale request: abaikan hasil jika taskId telah berubah di UI
      if (activeTaskIdRef.current !== taskId) {
        setIsLoading(false);
        return;
      }

      if (response.status === 200 && 'steps' in response.body) {
        const newChecklistItems: ChecklistItemData[] = response.body.steps.map(
          (stepText, index) => ({
            id: `chk-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 6)}`,
            text: stepText,
            completed: false,
            origin: 'ai',
          })
        );

        persistChecklist(newChecklistItems);
      } else if ('error' in response.body) {
        setError(response.body.error);
      }
    } catch (err: unknown) {
      if (activeTaskIdRef.current === taskId) {
        const errObj = err as ChecklistApiError;
        setError({
          code: errObj.code || 'NETWORK_ERROR',
          message: errObj.message || 'Gagal menghubungi server untuk membuat langkah pengerjaan.',
        });
      }
    } finally {
      if (activeTaskIdRef.current === taskId) {
        setIsLoading(false);
      }
    }
  }, [isLoading, taskTitle, taskDescription, taskRequirements, taskId, persistChecklist]);

  // Centang / batal centang
  const toggleItem = useCallback(
    (id: string) => {
      const updated = checklist.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      );
      persistChecklist(updated);
    },
    [checklist, persistChecklist]
  );

  // Edit Teks Langkah
  const startEditing = useCallback((id: string) => {
    setEditingItemId(id);
  }, []);

  const saveEdit = useCallback(
    (id: string, newText: string): boolean => {
      const trimmed = newText.trim();
      if (trimmed.length === 0) {
        return false;
      }
      const updated = checklist.map((item) =>
        item.id === id ? { ...item, text: trimmed } : item
      );
      persistChecklist(updated);
      setEditingItemId(null);
      return true;
    },
    [checklist, persistChecklist]
  );

  const cancelEdit = useCallback(() => {
    setEditingItemId(null);
  }, []);

  // Regenerate flow
  const openRegenerateDialog = useCallback(() => {
    setIsRegenerateDialogOpen(true);
  }, []);

  const closeRegenerateDialog = useCallback(() => {
    setIsRegenerateDialogOpen(false);
  }, []);

  const confirmRegenerate = useCallback(async () => {
    setIsRegenerateDialogOpen(false);
    await executeGeneration();
  }, [executeGeneration]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    checklist,
    isLoading,
    error,
    editingItemId,
    isRegenerateDialogOpen,
    stats: {
      total,
      completed,
      percentage,
    },
    actions: {
      generateChecklist: executeGeneration,
      retryGenerate: executeGeneration,
      toggleItem,
      startEditing,
      saveEdit,
      cancelEdit,
      openRegenerateDialog,
      closeRegenerateDialog,
      confirmRegenerate,
      clearError,
    },
  };
}

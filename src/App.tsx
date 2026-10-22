import React, { useState } from 'react';
import { Task } from './types/task';
import { MOCK_TASKS } from './data/mockTasks';
import { useTaskManager } from './hooks/useTaskManager';
import { DashboardHeader } from './components/dashboard/DashboardHeader';
import { DashboardView } from './components/dashboard/DashboardView';
import { AnnouncementInputAndPreview } from './components/features/input-preview';
import { ManualTaskModal, TaskDetailModal } from './components/features/task-management';
import { X, AlertTriangle, AlertCircle } from 'lucide-react';

export const App: React.FC = () => {
  const {
    tasks,
    isCorrupted,
    corruptedDetails,
    storageError,
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
  } = useTaskManager();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [dashboardError, setDashboardError] = useState<string | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [activeModal, setActiveModal] = useState<'announcement' | 'manual' | null>(null);

  // Derive active selected task from master tasks array for immediate reactivity
  const activeSelectedTask = selectedTaskId
    ? tasks.find((t) => t.id === selectedTaskId) || null
    : null;

  // Handlers for action buttons
  const handleAddFromAnnouncement = () => {
    setActiveModal('announcement');
  };

  const handleAddManual = () => {
    setActiveModal('manual');
  };

  const handleSelectTask = (task: Task) => {
    setSelectedTaskId(task.id);
  };

  const handleCloseDetail = () => {
    setSelectedTaskId(null);
  };

  // Quick Demo Controls for testing (Strictly dev mode)
  const handleLoadMockData = () => {
    loadMockData(MOCK_TASKS);
    setDashboardError(null);
    setIsLoading(false);
  };

  const handleClearAll = () => {
    clearAllTasks();
    setDashboardError(null);
    setIsLoading(false);
  };

  const handleSimulateLoading = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 800);
  };

  const handleSimulateError = () => {
    setDashboardError('Koneksi terputus saat mengambil data penyimpanan lokal. Silakan coba lagi.');
  };

  return (
    <div className="min-h-screen bg-canvas flex flex-col font-sans text-ink-primary">
      {/* Top Application Header */}
      <DashboardHeader
        onAddFromAnnouncement={handleAddFromAnnouncement}
        onAddManual={handleAddManual}
      />

      {/* Global Storage Error Notification (e.g. QuotaExceededError) */}
      {storageError && (
        <aside
          role="alert"
          aria-live="assertive"
          className="bg-amber-50 border-b border-amber-200 px-4 py-2.5 text-xs text-amber-900 flex items-center justify-between gap-3 sticky top-[57px] z-40 shadow-sm"
        >
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <div>
              <span className="font-bold">Peringatan Penyimpanan Browser: </span>
              <span>{storageError}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={clearStorageError}
            className="p-1 rounded text-amber-700 hover:text-amber-900 hover:bg-amber-100 transition-colors"
            aria-label="Tutup pesan penyimpanan"
          >
            <X className="w-4 h-4" />
          </button>
        </aside>
      )}

      {/* Corrupted Storage Recovery Dialog (PRD US-06: Non-destructive reset offer) */}
      {isCorrupted && (
        <aside
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="corrupted-title"
          aria-describedby="corrupted-desc"
          className="bg-rose-50 border-b border-rose-300 px-4 py-3 text-xs text-rose-900 flex flex-wrap items-center justify-between gap-3 sticky top-[57px] z-40 shadow-sm"
        >
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
            <div>
              <p id="corrupted-title" className="font-bold text-sm">
                Data Penyimpanan Browser Terdeteksi Rusak
              </p>
              <p id="corrupted-desc" className="text-rose-800">
                {corruptedDetails || 'Format data di penyimpanan lokal tidak sesuai kontrak.'} Aplikasi tetap dibuka dalam mode aman.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={confirmResetStorage}
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-md shadow-sm transition-colors text-xs"
            >
              Reset Penyimpanan (Kosongkan)
            </button>
            <button
              type="button"
              onClick={dismissCorruptedState}
              className="px-3 py-1.5 bg-white border border-rose-200 text-rose-800 font-semibold rounded-md hover:bg-rose-100/50 transition-colors text-xs"
            >
              Buka Sementara
            </button>
          </div>
        </aside>
      )}

      {/* Main Dashboard View */}
      <div className="flex-1">
        <DashboardView
          tasks={tasks}
          isLoading={isLoading}
          error={dashboardError}
          onAddTaskFromAnnouncement={handleAddFromAnnouncement}
          onAddManualTask={handleAddManual}
          onSelectTask={handleSelectTask}
          onRetry={() => {
            setDashboardError(null);
            setIsLoading(false);
          }}
        />
      </div>

      {/* Developer Testing Toolbar: STRICTLY RENDERED IN DEV MODE ONLY */}
      {import.meta.env.DEV && (
        <aside
          aria-label="Toolbar Pengujian Pengembang"
          className="bg-white border-t border-border px-4 py-2 text-xs text-ink-muted flex flex-wrap items-center justify-between gap-3 sticky bottom-0 z-20 shadow-sm"
        >
          <div className="flex items-center gap-2">
            <span className="font-semibold text-ink-primary">Status Uji Dashboard:</span>
            <span>
              {isDemoMode ? 'Mode Data Demo (Dalam Memori)' : `${tasks.length} Tugas Tersimpan`}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleLoadMockData}
              className="px-2 py-1 bg-indigo-50 hover:bg-indigo-100 text-brand-primary rounded font-medium transition-colors"
            >
              Muat Data Demo ({MOCK_TASKS.length})
            </button>
            <button
              type="button"
              onClick={handleClearAll}
              className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-ink-secondary rounded font-medium transition-colors"
            >
              Uji State Kosong (0)
            </button>
            <button
              type="button"
              onClick={handleSimulateLoading}
              className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-ink-secondary rounded font-medium transition-colors"
            >
              Uji Loading Skeleton
            </button>
            <button
              type="button"
              onClick={handleSimulateError}
              className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded font-medium transition-colors"
            >
              Uji Error State
            </button>
          </div>
        </aside>
      )}

      {/* Modal Dialog: Detail Tugas, Status, Edit, Hapus & Checklist Terpadu */}
      <TaskDetailModal
        task={activeSelectedTask}
        isOpen={Boolean(activeSelectedTask)}
        onClose={handleCloseDetail}
        onUpdateTask={updateTask}
        onDeleteTask={async (taskId) => {
          const success = await deleteTask(taskId);
          if (success) {
            handleCloseDetail();
          }
          return success;
        }}
        onUpdateStatus={updateTaskStatus}
        onUpdateChecklist={updateTaskChecklist}
      />

      {/* Modal Dialog: Alur Input Pengumuman & Preview (Member Input/Preview) */}
      {activeModal === 'announcement' && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-announcement-title"
          className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
        >
          <div className="bg-surface border border-hairline rounded-2xl max-w-4xl w-full p-6 shadow-2xl relative my-auto animate-in fade-in zoom-in-95 duration-150">
            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 p-2 rounded-lg text-ink-muted hover:text-ink hover:bg-slate-100 transition-colors z-10"
              aria-label="Tutup form input pengumuman"
            >
              <X className="w-5 h-5" />
            </button>

            <AnnouncementInputAndPreview
              onSaveTask={async (newTask) => {
                const success = await addExtractedTask(newTask);
                if (success) {
                  setActiveModal(null);
                }
                return success;
              }}
              onManualAdd={() => {
                setActiveModal('manual');
              }}
            />
          </div>
        </div>
      )}

      {/* Modal Dialog: Tambah Tugas Manual (Member Task Management) */}
      <ManualTaskModal
        isOpen={activeModal === 'manual'}
        onClose={() => setActiveModal(null)}
        onSubmit={addTaskManual}
      />
    </div>
  );
};

export default App;

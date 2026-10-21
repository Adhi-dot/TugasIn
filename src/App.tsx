import React, { useState, useEffect } from 'react';
import { Task } from './types/task';
import { ChecklistItemData } from './types/checklist';
import { MOCK_TASKS } from './data/mockTasks';
import { DashboardHeader } from './components/dashboard/DashboardHeader';
import { DashboardView } from './components/dashboard/DashboardView';
import { TaskChecklist } from './components/checklist/TaskChecklist';
import { X, Sparkles, Plus, BookOpen, Calendar, FileText } from 'lucide-react';

export const App: React.FC = () => {
  // Flag indicating if current state is temporary demo fixture (kept strictly in memory)
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);

  // Initial user tasks strictly read from localStorage; new users always start with empty [] (Empty State)
  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const saved = localStorage.getItem('tugasin_tasks');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Gagal membaca localStorage:', e);
    }
    // New users start with EMPTY array to display authentic empty state
    return [];
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [activeModal, setActiveModal] = useState<'announcement' | 'manual' | null>(null);

  // Sync actual user tasks to localStorage only when NOT in temporary demo mode
  useEffect(() => {
    if (isDemoMode) {
      // Demo data must never be saved as user tasks
      return;
    }
    try {
      localStorage.setItem('tugasin_tasks', JSON.stringify(tasks));
    } catch (e) {
      console.warn('Gagal menyimpan ke localStorage:', e);
    }
  }, [tasks, isDemoMode]);

  // Update checklist for active task & reflect in master task list
  const handleUpdateChecklist = (newChecklist: ChecklistItemData[]) => {
    if (!selectedTask) return;

    setTasks((prevTasks) =>
      prevTasks.map((t) => {
        if (t.id === selectedTask.id) {
          const updated: Task = {
            ...t,
            checklist: newChecklist,
            updatedAt: new Date().toISOString(),
          };
          setSelectedTask(updated);
          return updated;
        }
        return t;
      })
    );
  };

  // Handlers for action buttons
  const handleAddFromAnnouncement = () => {
    setActiveModal('announcement');
  };

  const handleAddManual = () => {
    setActiveModal('manual');
  };

  const handleSelectTask = (task: Task) => {
    setSelectedTask(task);
  };

  // Quick Demo Controls for development (Explicit action only)
  const handleLoadMockData = () => {
    setIsDemoMode(true);
    setTasks(MOCK_TASKS);
    setErrorMessage(null);
    setIsLoading(false);
  };

  const handleClearAllTasks = () => {
    setIsDemoMode(false);
    setTasks([]);
    try {
      localStorage.removeItem('tugasin_tasks');
    } catch (e) {
      console.warn('Gagal menghapus localStorage:', e);
    }
    setErrorMessage(null);
    setIsLoading(false);
  };

  const handleSimulateLoading = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 800);
  };

  const handleSimulateError = () => {
    setErrorMessage('Koneksi terputus saat mengambil data penyimpanan lokal. Silakan coba lagi.');
  };

  return (
    <div className="min-h-screen bg-canvas flex flex-col font-sans">
      {/* Top Application Header */}
      <DashboardHeader
        onAddFromAnnouncement={handleAddFromAnnouncement}
        onAddManual={handleAddManual}
      />

      {/* Main Dashboard View */}
      <div className="flex-1">
        <DashboardView
          tasks={tasks}
          isLoading={isLoading}
          error={errorMessage}
          onAddTaskFromAnnouncement={handleAddFromAnnouncement}
          onAddManualTask={handleAddManual}
          onSelectTask={handleSelectTask}
          onRetry={() => {
            setErrorMessage(null);
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
              onClick={handleClearAllTasks}
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

      {/* Modal Dialog: Detail Tugas & Checklist AI Integrasi Penuh */}
      {selectedTask && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-task-title"
          className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
        >
          <div className="bg-white border border-border rounded-2xl max-w-3xl w-full max-h-[92vh] overflow-y-auto p-5 sm:p-7 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150 space-y-6">
            <button
              type="button"
              onClick={() => setSelectedTask(null)}
              className="absolute top-4 right-4 p-2 rounded-lg text-ink-muted hover:text-ink-primary hover:bg-slate-100 transition-colors"
              aria-label="Tutup detail tugas"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Task Context Header */}
            <div className="space-y-3 pr-8">
              <div className="flex flex-wrap items-center gap-2">
                {selectedTask.course && (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-md bg-indigo-50 text-brand-primary border border-indigo-100">
                    <BookOpen className="w-3.5 h-3.5" />
                    {selectedTask.course}
                  </span>
                )}
                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-md ${
                    selectedTask.status === 'not_started'
                      ? 'bg-slate-100 text-slate-700'
                      : selectedTask.status === 'in_progress'
                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  }`}
                >
                  {selectedTask.status === 'not_started'
                    ? 'Belum Mulai'
                    : selectedTask.status === 'in_progress'
                    ? 'Sedang Dikerjakan'
                    : 'Selesai'}
                </span>
                {selectedTask.dueDate && (
                  <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-md bg-slate-100 text-ink-secondary">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    <span>
                      {selectedTask.dueDate}
                      {selectedTask.dueTime ? ` · ${selectedTask.dueTime}` : ''}
                      {selectedTask.displayTimezone ? ` ${selectedTask.displayTimezone}` : ''}
                    </span>
                  </span>
                )}
              </div>

              <h2 id="modal-task-title" className="text-xl sm:text-2xl font-bold text-ink-primary leading-tight">
                {selectedTask.title}
              </h2>

              {selectedTask.description && (
                <p className="text-sm text-ink-secondary leading-relaxed">
                  {selectedTask.description}
                </p>
              )}
            </div>

            {/* Official Requirements from Lecturer */}
            {selectedTask.requirements && selectedTask.requirements.length > 0 && (
              <div className="border-l-4 border-brand-primary bg-slate-50 p-4 rounded-r-xl space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-ink-primary">
                  <FileText className="w-4 h-4 text-brand-primary" />
                  <span>Ketentuan Resmi dari Pengumuman Dosen</span>
                </div>
                <ul className="text-xs sm:text-sm text-ink-secondary space-y-1 list-disc list-inside">
                  {selectedTask.requirements.map((req, i) => (
                    <li key={i}>{req}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Primary TaskChecklist Component with AI Assistant */}
            <div className="pt-2">
              <TaskChecklist
                taskId={selectedTask.id}
                taskTitle={selectedTask.title}
                taskDescription={selectedTask.description}
                taskRequirements={selectedTask.requirements}
                initialChecklist={selectedTask.checklist}
                onUpdateChecklist={handleUpdateChecklist}
              />
            </div>

            {/* Modal Footer */}
            <div className="pt-3 border-t border-border flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedTask(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-ink-primary text-xs font-semibold rounded-lg transition-colors"
              >
                Tutup & Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Dialog: Placeholder Integrasi Tambah dari Pengumuman */}
      {activeModal === 'announcement' && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div className="bg-white border border-border rounded-2xl max-w-md w-full p-6 shadow-xl relative text-center">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-brand-primary flex items-center justify-center mx-auto mb-3">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-ink-primary">
              Integrasi Input Pengumuman
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-ink-muted leading-relaxed">
              Tombol ini telah siap dan menyediakan callback ke alur ekstraksi chat Gemini (bagian Member Input/Preview).
            </p>
            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className="mt-5 w-full py-2 bg-brand-primary hover:bg-brand-hover text-white text-xs font-semibold rounded-lg transition-colors"
            >
              Mengerti
            </button>
          </div>
        </div>
      )}

      {/* Modal Dialog: Placeholder Integrasi Tambah Manual */}
      {activeModal === 'manual' && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div className="bg-white border border-border rounded-2xl max-w-md w-full p-6 shadow-xl relative text-center">
            <div className="w-12 h-12 rounded-xl bg-slate-100 text-ink-secondary flex items-center justify-center mx-auto mb-3">
              <Plus className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-ink-primary">
              Integrasi Tambah Manual
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-ink-muted leading-relaxed">
              Tombol ini telah siap dan menyediakan callback ke formulir pembuatan tugas manual.
            </p>
            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className="mt-5 w-full py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-lg transition-colors"
            >
              Mengerti
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;

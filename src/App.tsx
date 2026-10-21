import React, { useState, useEffect } from 'react';
import { Task } from './types/task';
import { MOCK_TASKS } from './data/mockTasks';
import { DashboardHeader } from './components/dashboard/DashboardHeader';
import { DashboardView } from './components/dashboard/DashboardView';
import { X, Sparkles, Plus, CheckCircle2, BookOpen } from 'lucide-react';

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
              Muat Data Demo (5)
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

      {/* Modal Dialog: Detail Tugas (Callback Saat Kartu Dipilih) */}
      {selectedTask && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-task-title"
          className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div className="bg-white border border-border rounded-2xl max-w-lg w-full p-6 shadow-xl relative animate-in fade-in zoom-in-95 duration-150">
            <button
              type="button"
              onClick={() => setSelectedTask(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-ink-muted hover:text-ink-primary hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-3">
              {selectedTask.course && (
                <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded bg-slate-100 text-ink-secondary">
                  <BookOpen className="w-3 h-3" />
                  {selectedTask.course}
                </span>
              )}
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-brand-primary">
                {selectedTask.status === 'not_started'
                  ? 'Belum mulai'
                  : selectedTask.status === 'in_progress'
                  ? 'Dikerjakan'
                  : 'Selesai'}
              </span>
            </div>

            <h3 id="modal-task-title" className="text-lg font-bold text-ink-primary leading-snug">
              {selectedTask.title}
            </h3>

            {selectedTask.description && (
              <p className="mt-2 text-sm text-ink-secondary leading-relaxed">
                {selectedTask.description}
              </p>
            )}

            {/* Checklist Section */}
            <div className="mt-5 pt-4 border-t border-border">
              <h4 className="text-xs font-bold uppercase tracking-wider text-ink-muted mb-2">
                Checklist Pengerjaan ({selectedTask.checklist.length} Langkah)
              </h4>
              {selectedTask.checklist.length === 0 ? (
                <p className="text-xs text-ink-faint italic">Belum ada langkah pengerjaan.</p>
              ) : (
                <ul className="space-y-2">
                  {selectedTask.checklist.map((item) => (
                    <li
                      key={item.id}
                      className="flex items-start gap-2.5 text-xs text-ink-secondary bg-slate-50 border border-slate-100 rounded-lg p-2.5"
                    >
                      <CheckCircle2
                        className={`w-4 h-4 shrink-0 mt-0.5 ${
                          item.completed ? 'text-emerald-600' : 'text-slate-300'
                        }`}
                      />
                      <span className={item.completed ? 'line-through text-ink-muted' : ''}>
                        {item.text}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedTask(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-ink-primary text-xs font-semibold rounded-lg transition-colors"
              >
                Tutup
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

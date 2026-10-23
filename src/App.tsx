import React, { useState, useCallback } from 'react';
import { Task, TaskDraft, TaskFilter } from './types/task';
import { MOCK_TASKS } from './data/mockTasks';
import { useTaskManager } from './hooks/useTaskManager';
import { useExtraction } from './hooks/useExtraction';
import { checkDeadlineAmbiguity } from './utils/deadlines';
import { ExtractionRequest } from './types/extraction';
import { AppSidebar } from './components/layout/AppSidebar';
import { DashboardHeader } from './components/dashboard/DashboardHeader';
import { DashboardView } from './components/dashboard/DashboardView';
import { TaskPreviewModal } from './components/features/preview/TaskPreviewModal';
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

  const {
    isLoading: isExtracting,
    error: extractionError,
    extract,
    clearError: clearExtractionError,
  } = useExtraction({ useMock: false });

  // Navigation & UI States
  const [activeNav, setActiveNav] = useState<'workspace' | 'ekstraksi' | 'tenggat' | 'arsip' | 'pengaturan'>('workspace');
  const [activeFilter, setActiveFilter] = useState<TaskFilter>('all');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isManualModalOpen, setIsManualModalOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [dashboardError, setDashboardError] = useState<string | null>(null);

  // Extraction Preview Modal States
  const [activePreviewDraft, setActivePreviewDraft] = useState<TaskDraft | null>(null);
  const [activeSourceText, setActiveSourceText] = useState<string>('');
  const [activeDisplayTimezone, setActiveDisplayTimezone] = useState<string>('Asia/Jakarta');
  const [activeSourceDate, setActiveSourceDate] = useState<string | null>(null);
  const [extractionWarnings, setExtractionWarnings] = useState<string[]>([]);
  const [criticalEvidence, setCriticalEvidence] = useState<Record<string, string>>({});
  const [extractionNotice, setExtractionNotice] = useState<string | null>(null);

  // Derive active selected task from master tasks array for immediate reactivity
  const activeSelectedTask = selectedTaskId
    ? tasks.find((t) => t.id === selectedTaskId) || null
    : null;

  // Scroll and focus announcement extraction panel
  const handleFocusExtraction = () => {
    setActiveNav('workspace');
    const panel = document.getElementById('announcement-extractor-section');
    if (panel) {
      panel.scrollIntoView({ behavior: 'smooth', block: 'center' });
      const textarea = panel.querySelector('textarea');
      textarea?.focus();
    }
  };

  // Nav selection handler
  const handleNavSelect = (nav: 'workspace' | 'ekstraksi' | 'tenggat' | 'arsip' | 'pengaturan') => {
    setActiveNav(nav);
    if (nav === 'ekstraksi') {
      handleFocusExtraction();
    } else if (nav === 'tenggat') {
      setActiveFilter('all');
      const list = document.getElementById('task-list-panel');
      list?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (nav === 'arsip') {
      setActiveFilter('done');
      const list = document.getElementById('task-list-panel');
      list?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (nav === 'workspace') {
      setActiveFilter('all');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Extraction Execution Handler from Dashboard
  const handleExtractAnnouncement = useCallback(
    async (request: ExtractionRequest) => {
      clearExtractionError();
      setExtractionNotice(null);

      const response = await extract(request);
      if (response) {
        if (response.resultType === 'task' && response.draft) {
          const ambiguityCheck = checkDeadlineAmbiguity(request.text, request.sourceMessageDate);
          const enrichedDraft: TaskDraft = {
            ...response.draft,
            isAmbiguousDeadline: response.draft.isAmbiguousDeadline || ambiguityCheck.isAmbiguous,
            ambiguityReason: response.draft.ambiguityReason || ambiguityCheck.reason,
            ambiguityType: response.draft.ambiguityType || ambiguityCheck.ambiguityType,
          };

          setActivePreviewDraft(enrichedDraft);
          setActiveSourceText(request.text);
          setActiveDisplayTimezone(request.displayTimezone || 'Asia/Jakarta');
          setActiveSourceDate(request.sourceMessageDate || null);
          setExtractionWarnings(response.warnings || []);
          setCriticalEvidence(response.criticalFieldEvidence || {});
        } else if (response.resultType === 'no_task') {
          setExtractionNotice('Teks pengumuman tidak memuat informasi tugas kuliah yang valid. Silakan periksa kembali teks.');
        } else if (response.resultType === 'multiple_tasks') {
          setExtractionNotice('Pengumuman memuat beberapa tugas sekaligus. Harap tempelkan satu pengumuman tugas per proses.');
        }
      }
    },
    [clearExtractionError, extract]
  );

  // Save Extracted Task from Preview Modal
  const handleSaveExtractedDraft = useCallback(
    async (validatedDraft: TaskDraft, sourceText: string): Promise<boolean> => {
      const newTask: Task = {
        id: `task-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        title: validatedDraft.title,
        course: validatedDraft.course,
        description: validatedDraft.description,
        sourceText: sourceText,
        sourceMessageDate: activeSourceDate,
        dueDate: validatedDraft.dueDate,
        dueTime: validatedDraft.dueTime,
        sourceTimezone: validatedDraft.sourceTimezone,
        displayTimezone: activeDisplayTimezone,
        requirements: validatedDraft.requirements,
        status: 'not_started',
        checklist: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      try {
        const success = await addExtractedTask(newTask);
        if (success) {
          setActivePreviewDraft(null);
          // Scroll to task list
          setTimeout(() => {
            const list = document.getElementById('task-list-panel');
            list?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }, 150);
          return true;
        }
        return false;
      } catch {
        return false;
      }
    },
    [activeDisplayTimezone, activeSourceDate, addExtractedTask]
  );

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
    <div className="min-h-screen bg-background flex flex-row font-sans text-dark-ink antialiased">
      {/* ================= STITCH SIDEBAR NAVIGATION ================= */}
      <AppSidebar
        activeNav={activeNav}
        onNavSelect={handleNavSelect}
        onNewExtraction={handleFocusExtraction}
        onOpenHelp={() => {
          const guide = document.querySelector('aside');
          guide?.scrollIntoView({ behavior: 'smooth' });
        }}
        completedTasksCount={tasks.filter((t) => t.status === 'done').length}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* ================= MAIN VIEWPORT CONTAINER ================= */}
      <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden bg-ivory-bg">
        {/* Top Sticky Header Bar */}
        <DashboardHeader
          onAddFromAnnouncement={handleFocusExtraction}
          onAddManual={() => setIsManualModalOpen(true)}
          onToggleMobileSidebar={() => setIsMobileSidebarOpen((prev) => !prev)}
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
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg shadow-sm transition-colors text-xs"
              >
                Reset Penyimpanan (Kosongkan)
              </button>
              <button
                type="button"
                onClick={dismissCorruptedState}
                className="px-3 py-1.5 bg-white border border-rose-200 text-rose-800 font-semibold rounded-lg hover:bg-rose-100/50 transition-colors text-xs"
              >
                Buka Sementara
              </button>
            </div>
          </aside>
        )}

        {/* Extraction Feedback Notice (if no task or multiple tasks detected) */}
        {extractionNotice && (
          <aside
            role="alert"
            className="bg-amber-50 border-b border-amber-300 px-4 sm:px-8 py-3 text-xs text-amber-950 flex items-center justify-between gap-3 shadow-sm"
          >
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span className="font-medium">{extractionNotice}</span>
            </div>
            <button
              type="button"
              onClick={() => setExtractionNotice(null)}
              className="p-1 text-amber-800 hover:text-amber-950 rounded transition-colors"
              aria-label="Tutup pemberitahuan"
            >
              <X className="w-4 h-4" />
            </button>
          </aside>
        )}

        {/* Extraction Error Notice (if API failed/timeout) */}
        {extractionError && (
          <aside
            role="alert"
            className="bg-rose-50 border-b border-rose-300 px-4 sm:px-8 py-3 text-xs text-rose-950 flex items-center justify-between gap-3 shadow-sm"
          >
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span className="font-medium">
                Ekstraksi gagal: {extractionError.message || 'Layanan sibuk atau timeout. Teks Anda tetap aman.'}
              </span>
            </div>
            <button
              type="button"
              onClick={clearExtractionError}
              className="p-1 text-rose-800 hover:text-rose-950 rounded transition-colors"
              aria-label="Tutup error ekstraksi"
            >
              <X className="w-4 h-4" />
            </button>
          </aside>
        )}

        {/* Main Operational Dashboard View */}
        <DashboardView
          tasks={tasks}
          isLoading={isLoading}
          error={dashboardError}
          onAddTaskFromAnnouncement={handleFocusExtraction}
          onAddManualTask={() => setIsManualModalOpen(true)}
          onSelectTask={(task) => setSelectedTaskId(task.id)}
          onRetry={() => {
            setDashboardError(null);
            setIsLoading(false);
          }}
          initialFilter={activeFilter}
          onExtractAnnouncement={handleExtractAnnouncement}
          isExtracting={isExtracting}
        />

        {/* Developer Testing Toolbar: STRICTLY RENDERED IN DEV MODE ONLY */}
        {import.meta.env.DEV && (
          <aside
            aria-label="Toolbar Pengujian Pengembang"
            className="bg-surface-container-lowest border-t border-outline-variant/40 px-4 sm:px-8 py-2.5 text-xs text-outline flex flex-wrap items-center justify-between gap-3 sticky bottom-0 z-20 shadow-sm"
          >
            <div className="flex items-center gap-2">
              <span className="font-bold text-dark-ink">Status Uji Dashboard:</span>
              <span className="font-medium">
                {isDemoMode ? 'Mode Data Demo (Dalam Memori)' : `${tasks.length} Tugas Tersimpan`}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleLoadMockData}
                className="px-2.5 py-1 bg-lime-accent hover:bg-lime-300 text-dark-ink rounded-lg font-bold transition-colors"
              >
                Muat Data Demo ({MOCK_TASKS.length})
              </button>
              <button
                type="button"
                onClick={handleClearAll}
                className="px-2.5 py-1 bg-surface-container-low hover:bg-surface-container-high text-dark-ink rounded-lg font-medium transition-colors"
              >
                Uji State Kosong (0)
              </button>
              <button
                type="button"
                onClick={handleSimulateLoading}
                className="px-2.5 py-1 bg-surface-container-low hover:bg-surface-container-high text-dark-ink rounded-lg font-medium transition-colors"
              >
                Uji Loading Skeleton
              </button>
              <button
                type="button"
                onClick={handleSimulateError}
                className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg font-medium transition-colors"
              >
                Uji Error State
              </button>
            </div>
          </aside>
        )}
      </div>

      {/* Modal Dialog: Detail Tugas, Status, Edit, Hapus & Checklist Terpadu */}
      <TaskDetailModal
        task={activeSelectedTask}
        isOpen={Boolean(activeSelectedTask)}
        onClose={() => setSelectedTaskId(null)}
        onUpdateTask={updateTask}
        onDeleteTask={async (taskId) => {
          const success = await deleteTask(taskId);
          if (success) {
            setSelectedTaskId(null);
          }
          return success;
        }}
        onUpdateStatus={updateTaskStatus}
        onUpdateChecklist={updateTaskChecklist}
      />

      {/* Modal Dialog: Preview & Koreksi Hasil Ekstraksi Gemini (Screen 2) */}
      {activePreviewDraft && (
        <TaskPreviewModal
          draft={activePreviewDraft}
          sourceText={activeSourceText}
          sourceMessageDate={activeSourceDate}
          displayTimezone={activeDisplayTimezone}
          warnings={extractionWarnings}
          criticalFieldEvidence={criticalEvidence}
          onSave={handleSaveExtractedDraft}
          onCancel={() => setActivePreviewDraft(null)}
        />
      )}

      {/* Modal Dialog: Tambah Tugas Manual (Member Task Management) */}
      <ManualTaskModal
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
        onSubmit={addTaskManual}
      />
    </div>
  );
};

export default App;

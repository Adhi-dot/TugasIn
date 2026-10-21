import React, { useState } from 'react';
import { HeroSection } from './components/features/input/HeroSection';
import { AnnouncementInputForm } from './components/features/input/AnnouncementInputForm';
import { TaskPreviewModal } from './components/features/preview/TaskPreviewModal';
import { FeedbackBanner } from './components/features/feedback/FeedbackBanner';
import { useExtraction } from './hooks/useExtraction';
import { Task, TaskDraft } from './types/task';
import { ExtractionRequest } from './types/extraction';
import { CheckIcon, CalendarIcon } from './components/ui/icons';

export const App: React.FC = () => {
  const {
    isLoading,
    error,
    result,
    extract,
    clearError,
    resetResult,
  } = useExtraction();

  // State untuk alur penyimpanan tugas dan navigasi
  const [activeDraft, setActiveDraft] = useState<TaskDraft | null>(null);
  const [activeSourceText, setActiveSourceText] = useState<string>('');
  const [activeDisplayTimezone, setActiveDisplayTimezone] = useState<string>('Asia/Jakarta');
  const [activeSourceDate, setActiveSourceDate] = useState<string | null>(null);

  // List tugas tersimpan (mempertahankan data tugas yang berhasil disimpan via alur Input & Preview)
  const [savedTasks, setSavedTasks] = useState<Task[]>([]);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [lastRequest, setLastRequest] = useState<ExtractionRequest | null>(null);

  // Handler eksekusi ekstraksi dari form input
  const handleExtract = async (request: ExtractionRequest) => {
    setLastRequest(request);
    clearError();
    resetResult();

    const response = await extract(request);
    if (response) {
      if (response.resultType === 'task' && response.draft) {
        setActiveDraft(response.draft);
        setActiveSourceText(request.text);
        setActiveDisplayTimezone(request.displayTimezone);
        setActiveSourceDate(request.sourceMessageDate || null);
      }
    }
  };

  // Handler coba lagi (Retry) saat terjadi kegagalan jaringan atau timeout
  const handleRetry = () => {
    if (lastRequest) {
      handleExtract(lastRequest);
    }
  };

  // Handler simpan tugas tervalidasi (Kontrak integrasi dengan member task management)
  const handleSaveTask = async (validatedDraft: TaskDraft, sourceText: string): Promise<boolean> => {
    // Simulasi pembuatan ID dan timestamp oleh lapisan aplikasi
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

    // Tepat satu tugas disimpan ke list
    setSavedTasks((prev) => [newTask, ...prev]);

    // Tutup modal preview dan tampilkan notifikasi keberhasilan
    setActiveDraft(null);
    setSuccessToast(`Tugas "${newTask.title}" berhasil disimpan ke sistem!`);
    setTimeout(() => setSuccessToast(null), 4000);

    return true;
  };

  // Handler pembatalan preview
  const handleCancelPreview = () => {
    setActiveDraft(null);
  };

  // Handler navigasi tambah manual
  const handleManualAdd = () => {
    alert('Jalur Tambah Manual: Terhubung dengan modul formulir manual (Member Pengelolaan Tugas).');
  };

  return (
    <div className="min-h-screen flex flex-col bg-canvas text-ink">
      {/* Top Navigation Bar */}
      <header className="border-b border-hairline bg-surface sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-brand-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
              T
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base tracking-tight text-ink">TugasIn</span>
                <span className="hidden sm:inline-block text-[11px] font-medium text-brand-700 bg-brand-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                  Dari chat jadi checklist
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden md:inline-flex items-center gap-1.5 text-xs text-ink-muted bg-surface-subtle px-3 py-1.5 rounded-full border border-hairline">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Semester Ganjil 2024/2025
            </span>

            <button
              type="button"
              onClick={handleManualAdd}
              className="text-xs font-semibold text-ink-muted hover:text-ink bg-surface border border-hairline hover:bg-slate-50 px-3.5 py-1.5 rounded-input transition-colors"
            >
              + Tambah manual
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 py-8 w-full">
        {/* Toast Notifikasi Berhasil */}
        {successToast && (
          <div className="mb-6 bg-brand-50 border border-emerald-200 text-brand-700 px-4 py-3 rounded-card text-sm flex items-center justify-between shadow-sm animate-in fade-in duration-200">
            <div className="flex items-center gap-2">
              <CheckIcon className="w-4 h-4 text-brand-600" />
              <span>{successToast}</span>
            </div>
            <button
              type="button"
              onClick={() => setSuccessToast(null)}
              className="text-brand-600 hover:text-brand-800 text-xs font-medium"
            >
              Tutup
            </button>
          </div>
        )}

        {/* Hero Section */}
        <HeroSection />

        {/* Feedback Alert Banners (no_task, multiple_tasks, error timeout, dsb) */}
        <FeedbackBanner
          resultType={result?.resultType}
          error={error}
          onRetry={handleRetry}
          onManualAdd={handleManualAdd}
          onDismiss={() => {
            clearError();
            resetResult();
          }}
          className="mb-6"
        />

        {/* Announcement Input Form (Fitur Utama FR-01) */}
        <AnnouncementInputForm
          onExtract={handleExtract}
          isLoading={isLoading}
          onManualAdd={handleManualAdd}
          className="mb-10"
        />

        {/* Daftar Tugas yang Baru Tersimpan (Visualisasi Hasil Simpan FR-02) */}
        {savedTasks.length > 0 && (
          <section className="mt-12 pt-8 border-t border-hairline">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-ink">Tugas Tersimpan ({savedTasks.length})</h3>
                <p className="text-xs text-ink-muted">Hasil tugas dari ekstraksi pengumuman yang telah disetujui</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {savedTasks.map((t) => (
                <div key={t.id} className="bg-surface rounded-card border border-hairline p-5 shadow-sm space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-semibold text-sm text-ink leading-snug">{t.title}</h4>
                    {t.course && (
                      <span className="text-[11px] font-medium bg-surface-subtle text-ink-muted px-2 py-0.5 rounded border border-hairline flex-shrink-0">
                        {t.course}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-ink-muted line-clamp-2 leading-relaxed">{t.description}</p>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-hairline text-xs">
                    <div className="flex items-center gap-1.5 text-ink-muted">
                      <CalendarIcon className="w-3.5 h-3.5 text-ink-subtle" />
                      <span>
                        {t.dueDate ? (
                          <>
                            {t.dueDate} {t.dueTime ? `pukul ${t.dueTime}` : '(Jam tidak disebutkan)'}
                          </>
                        ) : (
                          <span className="text-amber-700 italic">Belum ada deadline</span>
                        )}
                      </span>
                    </div>

                    <span className="text-[11px] text-brand-700 bg-brand-50 px-2 py-0.5 rounded-full font-medium">
                      {t.status === 'not_started' ? 'Belum mulai' : t.status}
                    </span>
                  </div>

                  {t.requirements.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {t.requirements.map((req, idx) => (
                        <span key={idx} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                          {req}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Task Preview Modal (Fitur Utama FR-02) */}
      {activeDraft && (
        <TaskPreviewModal
          draft={activeDraft}
          sourceText={activeSourceText}
          sourceMessageDate={activeSourceDate}
          displayTimezone={activeDisplayTimezone}
          warnings={result?.warnings}
          criticalFieldEvidence={result?.criticalFieldEvidence}
          onSave={handleSaveTask}
          onCancel={handleCancelPreview}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-hairline bg-surface py-6 mt-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-wrap items-center justify-between gap-4 text-xs text-ink-muted">
          <div>
            © 2026 TugasIn — Platform Otomasi Tugas Mahasiswa. Dibuat dengan Gemini AI.
          </div>
          <div className="flex items-center gap-4">
            <span className="hover:text-ink cursor-pointer">Panduan Format</span>
            <span className="hover:text-ink cursor-pointer">Privasi & Keamanan Data</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;

import React, { useState, useCallback } from 'react';
import { HeroSection } from '../input/HeroSection';
import { AnnouncementInputForm } from '../input/AnnouncementInputForm';
import { TaskPreviewModal } from '../preview/TaskPreviewModal';
import { FeedbackBanner } from '../feedback/FeedbackBanner';
import { useExtraction } from '../../../hooks/useExtraction';
import { Task, TaskDraft } from '../../../types/task';
import { ExtractionRequest } from '../../../types/extraction';
import { checkDeadlineAmbiguity } from '../../../utils/deadlines';

export interface AnnouncementInputAndPreviewProps {
  onSaveTask?: (task: Task) => Promise<boolean | void> | boolean | void;
  onManualAdd?: () => void;
  useMock?: boolean;
  className?: string;
}

export const AnnouncementInputAndPreview: React.FC<AnnouncementInputAndPreviewProps> = ({
  onSaveTask,
  onManualAdd,
  useMock = false,
  className = '',
}) => {
  const {
    isLoading,
    error,
    result,
    extract,
    clearError,
    resetResult,
  } = useExtraction({ useMock });

  // State untuk alur input & preview
  const [activeDraft, setActiveDraft] = useState<TaskDraft | null>(null);
  const [activeSourceText, setActiveSourceText] = useState<string>('');
  const [activeDisplayTimezone, setActiveDisplayTimezone] = useState<string>('Asia/Jakarta');
  const [activeSourceDate, setActiveSourceDate] = useState<string | null>(null);
  const [lastRequest, setLastRequest] = useState<ExtractionRequest | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Handler eksekusi ekstraksi dari form input
  const handleExtract = useCallback(
    async (request: ExtractionRequest) => {
      setLastRequest(request);
      clearError();
      resetResult();

      const response = await extract(request, { useMock });
      if (response) {
        if (response.resultType === 'task' && response.draft) {
          // Lakukan audit ambiguitas deadline tambahan
          const ambiguityCheck = checkDeadlineAmbiguity(request.text, request.sourceMessageDate);
          const enrichedDraft: TaskDraft = {
            ...response.draft,
            isAmbiguousDeadline: response.draft.isAmbiguousDeadline || ambiguityCheck.isAmbiguous,
            ambiguityReason: response.draft.ambiguityReason || ambiguityCheck.reason,
            ambiguityType: response.draft.ambiguityType || ambiguityCheck.ambiguityType,
          };

          setActiveDraft(enrichedDraft);
          setActiveSourceText(request.text);
          setActiveDisplayTimezone(request.displayTimezone);
          setActiveSourceDate(request.sourceMessageDate || null);
        }
      }
    },
    [clearError, extract, resetResult, useMock]
  );

  // Handler coba lagi (Retry) saat terjadi kegagalan jaringan atau timeout
  const handleRetry = useCallback(() => {
    if (lastRequest) {
      handleExtract(lastRequest);
    }
  }, [handleExtract, lastRequest]);

  // Handler simpan tugas tervalidasi ke state bersama / Task Management
  const handleSaveValidatedTask = useCallback(
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
        if (onSaveTask) {
          const saveResult = await onSaveTask(newTask);
          if (saveResult === false) {
            // Penyimpanan ditolak oleh parent handler, jangan tutup modal
            return false;
          }
        }

        // Simpan berhasil: tutup modal dan tampilkan notifikasi sukses
        setActiveDraft(null);
        setSuccessToast(`Tugas "${newTask.title}" berhasil disimpan!`);
        setTimeout(() => setSuccessToast(null), 4000);
        return true;
      } catch (err) {
        // Gagal menyimpan (misal penyimpanan lokal error)
        console.error('Error saat menyimpan tugas:', err);
        return false;
      }
    },
    [activeDisplayTimezone, activeSourceDate, onSaveTask]
  );

  // Handler pembatalan preview
  const handleCancelPreview = useCallback(() => {
    setActiveDraft(null);
  }, []);

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Toast Notifikasi Sukses Simpan */}
      {successToast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="bg-brand-900 text-white px-5 py-3.5 rounded-xl shadow-xl flex items-center gap-3 border border-emerald-500/30">
            <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm">
              ✓
            </div>
            <div>
              <p className="text-xs font-semibold text-white">{successToast}</p>
              <p className="text-[11px] text-emerald-200">Data tugas siap dikelola di dashboard dan checklist.</p>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <HeroSection />

      {/* Feedback Banner: Error API, Timeout, No Task, Multiple Tasks */}
      <FeedbackBanner
        resultType={result?.resultType}
        error={error}
        onRetry={handleRetry}
        onManualAdd={onManualAdd}
        onDismiss={() => {
          clearError();
          resetResult();
        }}
      />

      {/* Form Input Pengumuman */}
      <AnnouncementInputForm
        onExtract={handleExtract}
        isLoading={isLoading}
        onManualAdd={onManualAdd}
      />

      {/* Modal Preview & Koreksi Ekstraksi */}
      {activeDraft && (
        <TaskPreviewModal
          draft={activeDraft}
          sourceText={activeSourceText}
          sourceMessageDate={activeSourceDate}
          displayTimezone={activeDisplayTimezone}
          warnings={result?.warnings}
          criticalFieldEvidence={result?.criticalFieldEvidence}
          onSave={handleSaveValidatedTask}
          onCancel={handleCancelPreview}
        />
      )}
    </div>
  );
};

import React from 'react';
import { Sparkles, RotateCcw, AlertCircle, Info, Loader2 } from 'lucide-react';
import { ChecklistItemData } from '../../types/checklist';
import { useTaskChecklist } from '../../hooks/useTaskChecklist';
import { ChecklistProgress } from './ChecklistProgress';
import { ChecklistItem } from './ChecklistItem';
import { RegenerateConfirmDialog } from './RegenerateConfirmDialog';

export interface TaskChecklistProps {
  readonly taskId: string;
  readonly taskTitle: string;
  readonly taskDescription?: string;
  readonly taskRequirements?: string[];
  readonly initialChecklist?: ChecklistItemData[];
  readonly onUpdateChecklist?: (items: ChecklistItemData[]) => void;
}

export const TaskChecklist: React.FC<TaskChecklistProps> = ({
  taskId,
  taskTitle,
  taskDescription,
  taskRequirements,
  initialChecklist,
  onUpdateChecklist,
}) => {
  const {
    checklist,
    isLoading,
    error,
    editingItemId,
    isRegenerateDialogOpen,
    stats,
    actions,
  } = useTaskChecklist({
    taskId,
    taskTitle,
    taskDescription,
    taskRequirements,
    initialChecklist,
    onUpdateChecklist,
  });

  return (
    <div className="w-full bg-surface rounded-2xl p-6 sm:p-7 border border-hairline shadow-sm space-y-6">
      {/* Header Bagian Checklist */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <h2 className="text-lg sm:text-xl font-bold text-ink">Langkah Pengerjaan</h2>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-accent-soft text-accent-ink border border-blue-200">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Saran AI</span>
          </span>
        </div>

        {checklist.length > 0 && !isLoading && (
          <button
            type="button"
            onClick={actions.openRegenerateDialog}
            className="self-start sm:self-auto px-3 py-1.5 text-xs font-semibold text-ink-muted hover:text-ink hover:bg-slate-100 border border-slate-200 rounded-lg flex items-center gap-1.5 transition"
            aria-label="Buat ulang langkah pengerjaan"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Buat ulang</span>
          </button>
        )}
      </div>

      {/* State 1: Error State Banner */}
      {error && (
        <div
          className="p-4 rounded-xl bg-danger-soft border border-rose-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
          role="alert"
        >
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 text-danger shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-danger">Gagal membuat langkah pengerjaan</p>
              <p className="text-xs text-rose-700 leading-relaxed mt-0.5">{error.message}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              type="button"
              onClick={actions.clearError}
              className="px-3 py-1.5 text-xs font-semibold text-rose-700 hover:text-rose-900 rounded-lg transition"
            >
              Tutup
            </button>
            <button
              type="button"
              onClick={actions.retryGenerate}
              className="px-3 py-1.5 text-xs font-semibold bg-danger hover:bg-rose-700 text-white rounded-lg shadow-sm flex items-center gap-1.5 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Coba lagi</span>
            </button>
          </div>
        </div>
      )}

      {/* State 2: Loading Skeleton State */}
      {isLoading && (
        <div className="space-y-3 py-2 animate-pulse" aria-busy="true" aria-label="Sedang membuat langkah pengerjaan">
          <div className="flex items-center justify-between text-xs text-ink-muted pb-1">
            <div className="h-4 bg-slate-200 rounded w-1/3" />
            <div className="h-4 bg-slate-200 rounded w-1/6" />
          </div>
          <div className="h-2 bg-slate-200 rounded-full w-full mb-4" />
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-12 bg-slate-100 border border-slate-200 rounded-xl" />
          ))}
          <p className="text-xs text-center text-ink-muted pt-2 flex items-center justify-center gap-2">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-accent" />
            <span>Gemini sedang menyusun langkah pengerjaan tugas...</span>
          </p>
        </div>
      )}

      {/* State 3: Empty State (Belum ada checklist) */}
      {!isLoading && checklist.length === 0 && !error && (
        <div className="text-center py-8 px-4 rounded-xl border border-dashed border-slate-300 bg-slate-50/50 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-accent-soft text-accent flex items-center justify-center mx-auto shadow-sm">
            <Sparkles className="w-6 h-6" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-base font-bold text-ink">Belum ada langkah pengerjaan</h3>
            <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
              Minta Gemini memecah tugas ini menjadi 3–7 langkah terstruktur untuk memudahkan pengerjaan secara bertahap.
            </p>
          </div>
          <button
            type="button"
            onClick={actions.generateChecklist}
            className="px-5 py-2.5 bg-accent hover:bg-accent-hover text-white text-sm font-semibold rounded-xl shadow-sm inline-flex items-center gap-2 transition"
          >
            <Sparkles className="w-4 h-4" />
            <span>Buat langkah pengerjaan</span>
          </button>
        </div>
      )}

      {/* State 4: Success State (Daftar checklist aktif) */}
      {!isLoading && checklist.length > 0 && (
        <div className="space-y-4">
          <ChecklistProgress
            completed={stats.completed}
            total={stats.total}
            percentage={stats.percentage}
          />

          <div className="space-y-2 pt-1" role="list" aria-label="Daftar langkah kerja">
            {checklist.map((item) => (
              <ChecklistItem
                key={item.id}
                item={item}
                isEditing={editingItemId === item.id}
                onToggle={actions.toggleItem}
                onStartEdit={actions.startEditing}
                onSaveEdit={actions.saveEdit}
                onCancelEdit={actions.cancelEdit}
              />
            ))}
          </div>

          <div className="flex items-center gap-2 pt-3 text-xs text-ink-muted border-t border-slate-100">
            <Info className="w-3.5 h-3.5 shrink-0 text-slate-400" />
            <p>Langkah ini adalah saran AI untuk mempermudah pengerjaan dan tidak mengubah ketentuan resmi pengumuman.</p>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Buat Ulang */}
      <RegenerateConfirmDialog
        isOpen={isRegenerateDialogOpen}
        completedCount={stats.completed}
        totalCount={stats.total}
        onConfirm={actions.confirmRegenerate}
        onCancel={actions.closeRegenerateDialog}
      />
    </div>
  );
};

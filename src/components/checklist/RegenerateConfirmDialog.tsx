import React, { useEffect } from 'react';
import { AlertCircle, X, RotateCcw } from 'lucide-react';

export interface RegenerateConfirmDialogProps {
  readonly isOpen: boolean;
  readonly completedCount: number;
  readonly totalCount: number;
  readonly onConfirm: () => void;
  readonly onCancel: () => void;
}

export const RegenerateConfirmDialog: React.FC<RegenerateConfirmDialogProps> = ({
  isOpen,
  completedCount,
  totalCount,
  onConfirm,
  onCancel,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm transition-opacity"
      role="dialog"
      aria-modal="true"
      aria-labelledby="regenerate-dialog-title"
    >
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-start justify-between">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-accent flex items-center justify-center">
            <AlertCircle className="w-5 h-5 text-accent" />
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="p-1 text-ink-muted hover:text-ink rounded-lg hover:bg-slate-100 transition"
            aria-label="Tutup dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2">
          <h3
            id="regenerate-dialog-title"
            className="text-lg font-bold text-ink"
          >
            Buat ulang langkah pengerjaan?
          </h3>
          <p className="text-sm text-ink-muted leading-relaxed">
            Checklist yang ada saat ini beserta progresnya{' '}
            <strong className="text-ink font-semibold">
              ({completedCount} dari {totalCount} selesai)
            </strong>{' '}
            akan digantikan sepenuhnya dengan saran langkah baru dari Gemini. Tindakan ini tidak dapat dibatalkan.
          </p>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-semibold text-ink-muted hover:text-ink hover:bg-slate-100 rounded-xl transition"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-semibold bg-accent hover:bg-accent-hover text-white rounded-xl shadow-sm transition flex items-center gap-1.5"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Ya, Buat Ulang</span>
          </button>
        </div>
      </div>
    </div>
  );
};

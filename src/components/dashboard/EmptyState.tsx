import React from 'react';
import { Inbox, Filter, Sparkles, Plus } from 'lucide-react';

interface EmptyStateProps {
  type: 'no-tasks' | 'filter-empty';
  onAddFromAnnouncement?: () => void;
  onAddManual?: () => void;
  onResetFilter?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  type,
  onAddFromAnnouncement,
  onAddManual,
  onResetFilter,
}) => {
  if (type === 'no-tasks') {
    return (
      <div className="bg-white border border-border border-dashed rounded-2xl p-8 sm:p-12 text-center flex flex-col items-center justify-center my-6">
        <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-brand-primary mb-4 shadow-sm">
          <Inbox className="w-7 h-7" aria-hidden="true" />
        </div>
        <h3 className="text-lg font-bold text-ink-primary">
          Belum ada tugas yang dicatat
        </h3>
        <p className="mt-1.5 text-sm text-ink-muted max-w-md leading-relaxed">
          Mulai atur jadwal belajarmu. Tempel pengumuman tugas dari chat grup kelas atau buat tugas baru secara manual.
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          {onAddFromAnnouncement && (
            <button
              type="button"
              onClick={onAddFromAnnouncement}
              className="inline-flex items-center gap-2 bg-brand-primary hover:bg-brand-hover text-white text-sm font-semibold px-4 py-2.5 rounded-lg shadow-sm active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Tambah dari pengumuman</span>
            </button>
          )}

          {onAddManual && (
            <button
              type="button"
              onClick={onAddManual}
              className="inline-flex items-center gap-1.5 bg-white hover:bg-canvas text-ink-secondary hover:text-ink-primary border border-border text-sm font-semibold px-4 py-2.5 rounded-lg active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah manual</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  // Variant: filter-empty
  return (
    <div className="bg-white border border-border rounded-xl p-8 sm:p-10 text-center flex flex-col items-center justify-center my-6">
      <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-ink-secondary mb-3">
        <Filter className="w-6 h-6" aria-hidden="true" />
      </div>
      <h3 className="text-base font-semibold text-ink-primary">
        Tidak ada tugas yang cocok
      </h3>
      <p className="mt-1 text-xs sm:text-sm text-ink-muted max-w-sm">
        Tidak ditemukan tugas pada filter atau kata kunci pencarian ini.
      </p>

      {onResetFilter && (
        <button
          type="button"
          onClick={onResetFilter}
          className="mt-4 inline-flex items-center text-xs font-semibold text-brand-primary hover:text-brand-hover hover:underline"
        >
          Tampilkan semua tugas
        </button>
      )}
    </div>
  );
};

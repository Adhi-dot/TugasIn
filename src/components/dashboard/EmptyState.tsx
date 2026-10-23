import React from 'react';
import { Inbox, Filter, Sparkles, Plus } from 'lucide-react';

export interface EmptyStateProps {
  type: 'no-tasks' | 'filter-empty';
  onAddFromAnnouncement?: () => void;
  onAddManual?: () => void;
  onResetFilter?: () => void;
}

export const EmptyState: React.FC<Readonly<EmptyStateProps>> = ({
  type,
  onAddFromAnnouncement,
  onAddManual,
  onResetFilter,
}) => {
  if (type === 'no-tasks') {
    return (
      <div className="bg-surface-container-lowest border border-outline-variant/50 border-dashed rounded-2xl p-8 sm:p-12 text-center flex flex-col items-center justify-center my-4 shadow-sm">
        <div className="w-14 h-14 rounded-2xl bg-surface-container-low border border-outline-variant/40 flex items-center justify-center text-forest-green mb-4 shadow-sm">
          <Inbox className="w-7 h-7" aria-hidden="true" />
        </div>
        <h3 className="text-lg font-bold text-dark-ink">
          Belum ada tugas yang dicatat
        </h3>
        <p className="mt-1.5 text-xs sm:text-sm text-on-surface-variant max-w-md leading-relaxed">
          Mulai atur jadwal belajarmu. Tempel pengumuman tugas dari chat grup kelas di atas atau buat tugas baru secara manual.
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          {onAddFromAnnouncement && (
            <button
              type="button"
              onClick={onAddFromAnnouncement}
              className="inline-flex items-center gap-2 bg-forest-green hover:bg-[#193e31] text-white text-xs sm:text-sm font-bold px-4 py-2.5 rounded-xl shadow-sm active:scale-95 transition-all"
            >
              <Sparkles className="w-4 h-4 text-lime-accent" />
              <span>Tempel Pengumuman</span>
            </button>
          )}

          {onAddManual && (
            <button
              type="button"
              onClick={onAddManual}
              className="inline-flex items-center gap-1.5 bg-surface-container-lowest hover:bg-surface-container-high text-dark-ink border border-outline-variant/50 text-xs sm:text-sm font-bold px-4 py-2.5 rounded-xl shadow-sm active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4 text-forest-green" />
              <span>Tambah Manual</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  // Variant: filter-empty
  return (
    <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-xl p-8 sm:p-10 text-center flex flex-col items-center justify-center my-4 shadow-sm">
      <div className="w-12 h-12 rounded-xl bg-surface-container-low flex items-center justify-center text-outline mb-3">
        <Filter className="w-6 h-6" aria-hidden="true" />
      </div>
      <h3 className="text-base font-bold text-dark-ink">
        Tidak ada tugas yang cocok
      </h3>
      <p className="mt-1 text-xs text-on-surface-variant max-w-sm">
        Tidak ditemukan tugas pada filter atau kata kunci pencarian ini.
      </p>

      {onResetFilter && (
        <button
          type="button"
          onClick={onResetFilter}
          className="mt-4 inline-flex items-center text-xs font-bold text-forest-green hover:underline"
        >
          Tampilkan semua tugas
        </button>
      )}
    </div>
  );
};

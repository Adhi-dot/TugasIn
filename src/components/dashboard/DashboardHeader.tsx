import React from 'react';
import { CheckSquare, Sparkles, Plus } from 'lucide-react';

interface DashboardHeaderProps {
  onAddFromAnnouncement?: () => void;
  onAddManual?: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  onAddFromAnnouncement,
  onAddManual,
}) => {
  return (
    <header className="bg-white border-b border-border sticky top-0 z-30 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-primary text-white flex items-center justify-center shadow-sm shrink-0">
            <CheckSquare className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg sm:text-xl tracking-tight text-ink-primary">
                TugasIn
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-indigo-50 text-brand-primary border border-indigo-100 hidden sm:inline-block">
                MVP
              </span>
            </div>
            <p className="text-xs text-ink-muted hidden xs:block">
              Dari chat jadi checklist.
            </p>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          {onAddManual && (
            <button
              type="button"
              onClick={onAddManual}
              className="inline-flex items-center gap-1.5 bg-white hover:bg-slate-50 text-ink-secondary hover:text-ink-primary border border-border text-xs sm:text-sm font-semibold px-3 sm:px-3.5 py-2 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
            >
              <Plus className="w-4 h-4 text-ink-muted" />
              <span className="hidden sm:inline">Tambah manual</span>
              <span className="sm:hidden">Manual</span>
            </button>
          )}

          {onAddFromAnnouncement && (
            <button
              type="button"
              onClick={onAddFromAnnouncement}
              className="inline-flex items-center gap-1.5 bg-brand-primary hover:bg-brand-hover text-white text-xs sm:text-sm font-semibold px-3 sm:px-4 py-2 rounded-lg shadow-sm active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2"
            >
              <Sparkles className="w-4 h-4" />
              <span className="hidden sm:inline">Tambah dari pengumuman</span>
              <span className="sm:hidden">Ekstrak Chat</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

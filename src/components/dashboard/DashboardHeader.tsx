import React from 'react';
import {
  GraduationCap,
  Sparkles,
  ClipboardPaste,
  Plus,
  Menu,
} from 'lucide-react';

export interface DashboardHeaderProps {
  onAddFromAnnouncement?: () => void;
  onAddManual?: () => void;
  onToggleMobileSidebar?: () => void;
}

export const DashboardHeader: React.FC<Readonly<DashboardHeaderProps>> = ({
  onAddFromAnnouncement,
  onAddManual,
  onToggleMobileSidebar,
}) => {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-4 sm:px-8 py-3 w-full bg-ivory-bg border-b border-outline-variant/30 select-none">
      {/* Left side: Mobile Toggle & Semester context */}
      <div className="flex items-center gap-3 sm:gap-6">
        {/* Mobile Sidebar Hamburger Toggle */}
        <button
          type="button"
          onClick={onToggleMobileSidebar}
          className="p-2 rounded-lg text-on-surface-variant hover:text-dark-ink hover:bg-surface-container-high lg:hidden transition-colors"
          aria-label="Buka menu sidebar"
        >
          <Menu className="w-5 h-5 text-forest-green" />
        </button>

        {/* Semester Context Badge */}
        <div className="flex items-center gap-2 bg-surface-container-lowest px-3 py-1.5 rounded-lg border border-outline-variant/40 shadow-sm">
          <GraduationCap className="w-4 h-4 text-forest-green shrink-0" />
          <span className="text-xs sm:text-sm font-semibold text-dark-ink whitespace-nowrap">
            Semester Aktif: Genap 2026
          </span>
        </div>

        {/* AI Model Tag */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded bg-secondary-container/40 border border-secondary/30 text-on-secondary-container text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-secondary" />
          <span>Mode AI Extractor</span>
        </div>
      </div>

      {/* Right side actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {onAddManual && (
          <button
            type="button"
            onClick={onAddManual}
            className="h-10 px-3 sm:px-3.5 rounded-lg border border-outline-variant/60 bg-surface-container-lowest hover:bg-surface-container-high text-dark-ink flex items-center gap-1.5 text-xs sm:text-sm font-medium transition-colors active:opacity-90 shadow-sm"
          >
            <Plus className="w-4 h-4 text-forest-green" />
            <span className="hidden sm:inline">Tambah Manual</span>
            <span className="sm:hidden">Manual</span>
          </button>
        )}

        {onAddFromAnnouncement && (
          <button
            type="button"
            onClick={onAddFromAnnouncement}
            className="h-10 px-3.5 sm:px-4 rounded-lg bg-lime-accent hover:bg-lime-300 text-dark-ink font-semibold flex items-center gap-2 text-xs sm:text-sm transition-all active:scale-[0.98] shadow-sm"
          >
            <ClipboardPaste className="w-4 h-4 text-forest-green" />
            <span className="hidden sm:inline">Tempel Chat</span>
            <span className="sm:hidden">Ekstrak</span>
          </button>
        )}

        {/* Profile Avatar Chip */}
        <div className="flex items-center gap-2 pl-1 sm:pl-2 border-l border-outline-variant/40">
          <div
            className="w-8 h-8 rounded-full bg-forest-green text-surface-container-lowest flex items-center justify-center font-bold text-xs shadow-sm"
            title="Mahasiswa Aktif"
          >
            M
          </div>
          <div className="hidden xl:flex flex-col text-left">
            <span className="text-xs font-bold text-dark-ink leading-tight">
              Mahasiswa
            </span>
            <span className="text-[10px] text-on-surface-variant leading-tight">
              Tugas Pribadi
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

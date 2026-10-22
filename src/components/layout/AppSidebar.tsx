import React from 'react';
import {
  CheckSquare,
  PlusCircle,
  LayoutDashboard,
  MessageSquareShare,
  CalendarClock,
  FolderCheck,
  Settings,
  Database,
  HelpCircle,
  X,
} from 'lucide-react';

export interface AppSidebarProps {
  activeNav?: 'workspace' | 'ekstraksi' | 'tenggat' | 'arsip' | 'pengaturan';
  onNavSelect?: (nav: 'workspace' | 'ekstraksi' | 'tenggat' | 'arsip' | 'pengaturan') => void;
  onNewExtraction?: () => void;
  onOpenHelp?: () => void;
  completedTasksCount?: number;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const AppSidebar: React.FC<Readonly<AppSidebarProps>> = ({
  activeNav = 'workspace',
  onNavSelect,
  onNewExtraction,
  onOpenHelp,
  completedTasksCount = 0,
  isOpenMobile = false,
  onCloseMobile,
}) => {
  const handleNavClick = (nav: 'workspace' | 'ekstraksi' | 'tenggat' | 'arsip' | 'pengaturan') => {
    onNavSelect?.(nav);
    onCloseMobile?.();
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpenMobile && (
        <div
          role="presentation"
          onClick={onCloseMobile}
          className="fixed inset-0 bg-dark-ink/50 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-200"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        id="app-sidebar"
        aria-label="Navigasi Utama Aplikasi"
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-surface-container-low border-r border-outline-variant/40 flex flex-col justify-between p-4 transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:static'
        }`}
      >
        {/* Top Branding & Navigation */}
        <div className="flex flex-col gap-6">
          {/* Brand Logo Header */}
          <div className="flex items-center justify-between px-2 py-1">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-forest-green flex items-center justify-center text-lime-accent relative shrink-0 shadow-sm">
                <CheckSquare className="w-5 h-5 text-lime-accent" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-lime-accent rounded-full border-2 border-surface-container-low" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-forest-green tracking-tight leading-none font-sans">
                  TugasIn
                </h1>
                <p className="text-xs text-on-surface-variant font-medium mt-1">
                  Chat Jadi Checklist
                </p>
              </div>
            </div>

            {/* Mobile Close Button */}
            <button
              type="button"
              onClick={onCloseMobile}
              className="p-1.5 rounded-lg text-on-surface-variant hover:text-dark-ink hover:bg-surface-container-high lg:hidden transition-colors"
              aria-label="Tutup menu navigasi"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Action: Ekstraksi Baru CTA button */}
          <button
            type="button"
            onClick={() => {
              onNewExtraction?.();
              onCloseMobile?.();
            }}
            className="w-full h-11 bg-forest-green hover:bg-[#193e31] text-white rounded-xl flex items-center justify-center gap-2 font-semibold text-sm transition-all duration-150 active:scale-[0.98] shadow-sm focus:outline-none focus:ring-2 focus:ring-forest-green focus:ring-offset-2"
          >
            <PlusCircle className="w-4 h-4 text-lime-accent" />
            <span>Ekstraksi Baru</span>
          </button>

          {/* Main Navigation Menu */}
          <nav aria-label="Menu Utama" className="flex flex-col gap-1.5">
            {/* Workspace */}
            <button
              type="button"
              onClick={() => handleNavClick('workspace')}
              className={`flex items-center justify-between px-3 py-2.5 rounded-lg font-semibold text-sm transition-colors duration-150 text-left w-full ${
                activeNav === 'workspace'
                  ? 'bg-lime-accent text-dark-ink'
                  : 'text-on-surface-variant hover:bg-surface-container-highest hover:text-dark-ink'
              }`}
            >
              <div className="flex items-center gap-3">
                <LayoutDashboard
                  className={`w-4 h-4 ${
                    activeNav === 'workspace' ? 'text-forest-green' : 'text-on-surface-variant'
                  }`}
                />
                <span>Workspace</span>
              </div>
              {activeNav === 'workspace' && (
                <span className="w-2 h-2 rounded-full bg-forest-green shrink-0" />
              )}
            </button>

            {/* Ekstraksi Chat */}
            <button
              type="button"
              onClick={() => handleNavClick('ekstraksi')}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-sm transition-colors duration-150 text-left w-full ${
                activeNav === 'ekstraksi'
                  ? 'bg-lime-accent text-dark-ink font-semibold'
                  : 'text-on-surface-variant hover:bg-surface-container-highest hover:text-dark-ink'
              }`}
            >
              <MessageSquareShare className="w-4 h-4" />
              <span>Ekstraksi Chat</span>
            </button>

            {/* Tenggat Waktu */}
            <button
              type="button"
              onClick={() => handleNavClick('tenggat')}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-sm transition-colors duration-150 text-left w-full ${
                activeNav === 'tenggat'
                  ? 'bg-lime-accent text-dark-ink font-semibold'
                  : 'text-on-surface-variant hover:bg-surface-container-highest hover:text-dark-ink'
              }`}
            >
              <CalendarClock className="w-4 h-4" />
              <span>Tenggat Waktu</span>
            </button>

            {/* Arsip Tugas (Tugas Selesai) */}
            <button
              type="button"
              onClick={() => handleNavClick('arsip')}
              className={`flex items-center justify-between px-3 py-2.5 rounded-lg font-medium text-sm transition-colors duration-150 text-left w-full ${
                activeNav === 'arsip'
                  ? 'bg-lime-accent text-dark-ink font-semibold'
                  : 'text-on-surface-variant hover:bg-surface-container-highest hover:text-dark-ink'
              }`}
            >
              <div className="flex items-center gap-3">
                <FolderCheck className="w-4 h-4" />
                <span>Arsip Selesai</span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-surface-container-high text-on-surface-variant">
                {completedTasksCount}
              </span>
            </button>

            {/* Pengaturan */}
            <button
              type="button"
              onClick={() => handleNavClick('pengaturan')}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-sm transition-colors duration-150 text-left w-full ${
                activeNav === 'pengaturan'
                  ? 'bg-lime-accent text-dark-ink font-semibold'
                  : 'text-on-surface-variant hover:bg-surface-container-highest hover:text-dark-ink'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Pengaturan</span>
            </button>
          </nav>
        </div>

        {/* Bottom Sidebar Section */}
        <div className="flex flex-col gap-3 pt-4 border-t border-outline-variant/40">
          {/* Storage Badge Container */}
          <div className="p-3 bg-surface-container-lowest rounded-xl border border-outline-variant/50 flex flex-col gap-1.5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-forest-green" />
                <span className="text-xs font-bold text-dark-ink">
                  Penyimpanan Lokal
                </span>
              </div>
              <span className="flex h-2 w-2 relative" title="Aktif di browser lokal Anda">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary" />
              </span>
            </div>
            <p className="text-[11px] text-outline leading-tight">
              Penyimpanan: Browser Lokal (localStorage). Privasi aman di perangkat Anda.
            </p>
          </div>

          {/* Footer Help link */}
          <button
            type="button"
            onClick={onOpenHelp}
            className="flex items-center gap-2 px-2 py-1.5 text-on-surface-variant hover:text-dark-ink text-xs font-medium transition-colors text-left"
          >
            <HelpCircle className="w-4 h-4 text-outline" />
            <span>Bantuan &amp; Panduan</span>
          </button>
        </div>
      </aside>
    </>
  );
};

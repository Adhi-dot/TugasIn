import React from 'react';
import {
  AlertCircle,
  RefreshCw,
  Compass,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
} from 'lucide-react';
import { Task, TaskFilter } from '../../types/task';
import { ExtractionRequest } from '../../types/extraction';
import { useDashboardTasks } from '../../hooks/useDashboardTasks';
import { SummaryStats } from './SummaryStats';
import { StatusFilter } from './StatusFilter';
import { TaskCard } from './TaskCard';
import { EmptyState } from './EmptyState';
import { DashboardSkeleton } from './DashboardSkeleton';
import { AnnouncementInputForm } from '../features/input/AnnouncementInputForm';

export interface DashboardViewProps {
  tasks: Task[];
  isLoading?: boolean;
  error?: string | null;
  onAddTaskFromAnnouncement?: () => void;
  onAddManualTask?: () => void;
  onSelectTask?: (task: Task) => void;
  onRetry?: () => void;
  initialFilter?: TaskFilter;
  onExtractAnnouncement?: (request: ExtractionRequest) => void;
  isExtracting?: boolean;
}

export const DashboardView: React.FC<Readonly<DashboardViewProps>> = ({
  tasks,
  isLoading = false,
  error = null,
  onAddTaskFromAnnouncement,
  onAddManualTask,
  onSelectTask,
  onRetry,
  initialFilter = 'all',
  onExtractAnnouncement,
  isExtracting = false,
}) => {
  const {
    filter,
    setFilter,
    searchQuery,
    setSearchQuery,
    summary,
    filteredTasks,
    referenceTime,
  } = useDashboardTasks({ tasks, initialFilter });

  // 1. Loading State
  if (isLoading) {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-6">
        <DashboardSkeleton />
      </main>
    );
  }

  // 2. Error State
  if (error) {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-10">
        <div
          role="alert"
          className="bg-surface-container-lowest border border-rose-200 rounded-2xl p-6 sm:p-8 text-center max-w-lg mx-auto shadow-sm"
        >
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-3">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-base font-bold text-dark-ink">
            Gagal Memuat Data Tugas
          </h2>
          <p className="mt-1.5 text-xs sm:text-sm text-on-surface-variant">
            {error}
          </p>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="mt-4 inline-flex items-center gap-1.5 bg-forest-green hover:bg-[#193e31] text-white text-xs font-bold px-4 py-2 rounded-xl shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-forest-green"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Coba Lagi</span>
            </button>
          )}
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 space-y-6 bg-ivory-bg">
      {/* Workspace Page Title & Editorial Context Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-2 border-b border-outline-variant/30">
        <div>
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-medium text-outline mb-1">
            <span>Workspace Mahasiswa</span>
            <span>/</span>
            <span className="text-forest-green font-bold">Semester Genap 2026</span>
          </nav>
          <h2 className="text-xl sm:text-2xl font-bold text-dark-ink tracking-tight font-sans">
            Dashboard Tugas Mahasiswa
          </h2>
          <p className="text-xs sm:text-sm text-on-surface-variant mt-0.5">
            Ubah pengumuman chat &amp; LMS menjadi langkah kerja terstruktur dengan Gemini AI
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-outline flex items-center gap-2 bg-surface-container-lowest px-3 py-1.5 rounded-lg border border-outline-variant/40 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-secondary shrink-0" />
            <span>Penyimpanan: Aktif di Browser</span>
          </span>
        </div>
      </div>

      {/* 3 Metric Summary Cards Grid */}
      <SummaryStats summary={summary} />

      {/* Hero Announcement Extraction Panel (Direct on Dashboard!) */}
      {onExtractAnnouncement && (
        <AnnouncementInputForm
          onExtract={onExtractAnnouncement}
          isLoading={isExtracting}
          onManualAdd={onAddManualTask}
        />
      )}

      {/* Main Operational Grid: 8 Columns Tasks, 4 Columns Guidance */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ================= LEFT COLUMN: TASK LIST (8 COLS) ================= */}
        <section className="lg:col-span-8 flex flex-col gap-4">
          {/* Search & Filter Toolbar */}
          <StatusFilter
            currentFilter={filter}
            onFilterChange={setFilter}
            summary={summary}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />

          {/* Task Cards or Empty State */}
          {tasks.length === 0 ? (
            <EmptyState
              type="no-tasks"
              onAddFromAnnouncement={onAddTaskFromAnnouncement}
              onAddManual={onAddManualTask}
            />
          ) : filteredTasks.length === 0 ? (
            <EmptyState
              type="filter-empty"
              onResetFilter={() => {
                setFilter('all');
                setSearchQuery('');
              }}
            />
          ) : (
            <div
              id="task-list-panel"
              aria-label="Daftar Tugas Mahasiswa"
              className="grid grid-cols-1 sm:grid-cols-2 gap-4"
            >
              {filteredTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onSelect={onSelectTask}
                  referenceTime={referenceTime}
                />
              ))}
            </div>
          )}
        </section>

        {/* ================= RIGHT COLUMN: GUIDANCE & SHORTCUTS (4 COLS) ================= */}
        <aside className="lg:col-span-4 flex flex-col gap-4">
          {/* Card 1: Panduan Penggunaan / Panduan Cepat */}
          <div className="bg-surface-container-lowest rounded-xl p-5 border border-outline-variant/40 shadow-sm space-y-3.5">
            <div className="flex items-center gap-2 pb-2.5 border-b border-outline-variant/30">
              <Compass className="w-4 h-4 text-forest-green" />
              <h3 className="text-sm font-bold text-dark-ink">Panduan Cepat TugasIn</h3>
            </div>
            <ul className="space-y-3 text-xs leading-relaxed text-on-surface-variant">
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-lime-accent text-dark-ink font-bold flex items-center justify-center text-[11px] shrink-0 mt-0.5">
                  1
                </span>
                <div>
                  <strong className="text-dark-ink block">Tempel Pengumuman</strong>
                  Salin teks dari grup kelas atau LMS ke panel hijau di atas.
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-lime-accent text-dark-ink font-bold flex items-center justify-center text-[11px] shrink-0 mt-0.5">
                  2
                </span>
                <div>
                  <strong className="text-dark-ink block">Verifikasi Hasil</strong>
                  Periksa judul, tanggal tenggat, dan ketentuan sebelum disimpan.
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-lime-accent text-dark-ink font-bold flex items-center justify-center text-[11px] shrink-0 mt-0.5">
                  3
                </span>
                <div>
                  <strong className="text-dark-ink block">Kerjakan Checklist</strong>
                  Buka detail tugas untuk menyusun langkah kerja terstruktur dengan AI.
                </div>
              </li>
            </ul>
          </div>

          {/* Card 2: Status Legend */}
          <div className="bg-surface-container-lowest rounded-xl p-5 border border-outline-variant/40 shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-dark-ink uppercase tracking-wider text-outline">
              Keterangan Status Tugas
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded-lg bg-surface-container-low border border-outline-variant/30">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-outline" />
                  <span className="font-semibold text-dark-ink">Belum Mulai</span>
                </div>
                <span className="text-[11px] text-outline">Tugas baru</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-lime-accent/30 border border-secondary/20">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-forest-green" />
                  <span className="font-semibold text-dark-ink">Dikerjakan</span>
                </div>
                <span className="text-[11px] text-dark-ink">Sedang berjalan</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50 border border-emerald-200">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-forest-green" />
                  <span className="font-semibold text-forest-green">Selesai</span>
                </div>
                <span className="text-[11px] text-forest-green">Tuntas</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-rose-50 border border-rose-200">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                  <span className="font-semibold text-rose-800">Terlambat</span>
                </div>
                <span className="text-[11px] text-rose-700">Tenggat lewat</span>
              </div>
            </div>
          </div>

          {/* Card 3: Tips & Privacy */}
          <div className="bg-surface-container-lowest rounded-xl p-4.5 border border-outline-variant/40 shadow-sm space-y-2 text-xs text-on-surface-variant">
            <div className="flex items-center gap-1.5 font-bold text-dark-ink">
              <ShieldCheck className="w-4 h-4 text-forest-green" />
              <span>Privasi &amp; Penyimpanan Aman</span>
            </div>
            <p className="leading-relaxed text-[11px] text-outline">
              Data tugas disimpan langsung di peramban (localStorage) Anda. Tidak ada penyimpanan data pengumuman permanen di database publik.
            </p>
          </div>
        </aside>
      </div>
    </main>
  );
};

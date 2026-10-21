import React from 'react';
import { Search, Globe } from 'lucide-react';
import { TaskFilter, DashboardSummary } from '../../types/task';

interface StatusFilterProps {
  currentFilter: TaskFilter;
  onFilterChange: (filter: TaskFilter) => void;
  summary: DashboardSummary;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  timezoneLabel?: string;
}

export const StatusFilter: React.FC<StatusFilterProps> = ({
  currentFilter,
  onFilterChange,
  summary,
  searchQuery,
  onSearchChange,
  timezoneLabel = 'WIB (UTC+7)',
}) => {
  const filterTabs: Array<{ id: TaskFilter; label: string; count: number }> = [
    { id: 'all', label: 'Semua', count: summary.totalCount },
    { id: 'not_started', label: 'Belum mulai', count: summary.notStartedCount },
    { id: 'in_progress', label: 'Dikerjakan', count: summary.inProgressCount },
    { id: 'done', label: 'Selesai', count: summary.doneCount },
  ];

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-2">
      {/* Segmented Filter Pills */}
      <div
        role="tablist"
        aria-label="Filter status tugas"
        className="inline-flex items-center p-1 bg-slate-100 rounded-lg border border-border overflow-x-auto max-w-full"
      >
        {filterTabs.map((tab) => {
          const isActive = currentFilter === tab.id;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              aria-controls="task-list-panel"
              id={`filter-tab-${tab.id}`}
              type="button"
              onClick={() => onFilterChange(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium whitespace-nowrap transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary ${
                isActive
                  ? 'bg-white text-ink-primary shadow-sm font-semibold'
                  : 'text-ink-secondary hover:text-ink-primary hover:bg-slate-200/50'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[11px] px-1.5 py-0.2 rounded-full font-semibold ${
                  isActive
                    ? 'bg-indigo-50 text-brand-primary'
                    : 'bg-slate-200 text-ink-secondary'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search Input & Timezone Badge */}
      <div className="flex items-center gap-2.5">
        <div className="relative flex-1 sm:w-64">
          <label htmlFor="task-search-input" className="sr-only">
            Cari judul tugas atau mata kuliah
          </label>
          <Search className="w-4 h-4 text-ink-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            id="task-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Cari tugas / mata kuliah..."
            className="w-full text-xs sm:text-sm pl-9 pr-3 py-1.5 bg-white border border-border rounded-lg text-ink-primary placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all"
          />
        </div>

        <div
          title={`Zona waktu kalkulasi deadline: ${timezoneLabel}`}
          className="hidden sm:flex items-center gap-1 text-[11px] font-medium text-ink-muted bg-slate-100 border border-border px-2.5 py-1.5 rounded-lg shrink-0"
        >
          <Globe className="w-3.5 h-3.5 text-ink-secondary" />
          <span>{timezoneLabel}</span>
        </div>
      </div>
    </div>
  );
};

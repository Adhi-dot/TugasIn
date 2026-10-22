import React from 'react';
import { Search, Globe } from 'lucide-react';
import { TaskFilter, DashboardSummary } from '../../types/task';
import { resolveIanaTimezone, getTimezoneDisplayLabel } from '../../lib/deadline';

export interface StatusFilterProps {
  currentFilter: TaskFilter;
  onFilterChange: (filter: TaskFilter) => void;
  summary: DashboardSummary;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  timezoneLabel?: string;
}

export const StatusFilter: React.FC<Readonly<StatusFilterProps>> = ({
  currentFilter,
  onFilterChange,
  summary,
  searchQuery,
  onSearchChange,
  timezoneLabel,
}) => {
  const activeTz = resolveIanaTimezone(null);
  const resolvedLabel = timezoneLabel || `${getTimezoneDisplayLabel(activeTz)} (${activeTz})`;
  const filterTabs: Array<{ id: TaskFilter; label: string; count: number }> = [
    { id: 'all', label: 'Semua Tugas', count: summary.totalCount },
    { id: 'not_started', label: 'Belum Mulai', count: summary.notStartedCount },
    { id: 'in_progress', label: 'Dikerjakan', count: summary.inProgressCount },
    { id: 'done', label: 'Selesai', count: summary.doneCount },
  ];

  return (
    <div className="bg-surface-container-lowest rounded-xl p-3 border border-outline-variant/40 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
      {/* Search Bar */}
      <div className="relative w-full md:w-72">
        <label htmlFor="task-search-input" className="sr-only">
          Cari judul tugas atau mata kuliah
        </label>
        <Search className="w-4 h-4 text-outline absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          id="task-search-input"
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Cari judul atau mata kuliah..."
          className="w-full bg-surface-container-low border border-outline-variant/30 rounded-lg pl-9 pr-3 py-1.5 text-xs sm:text-sm text-dark-ink placeholder:text-outline focus:outline-none focus:ring-1 focus:ring-forest-green transition-all"
        />
      </div>

      {/* Segmented Tabs & Timezone */}
      <div className="flex flex-wrap items-center justify-between md:justify-end gap-2 w-full md:w-auto">
        <div
          role="tablist"
          aria-label="Filter status tugas"
          className="flex items-center gap-1 bg-surface-container-low p-1 rounded-lg border border-outline-variant/30 overflow-x-auto max-w-full"
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
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-green ${
                  isActive
                    ? 'bg-surface-container-lowest text-forest-green shadow-none font-bold'
                    : 'text-on-surface-variant hover:text-dark-ink hover:bg-surface-container-highest/60 font-medium'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[11px] px-1.5 py-0.2 rounded-full font-bold ${
                    isActive
                      ? 'bg-lime-accent text-dark-ink'
                      : 'bg-surface-container-high text-on-surface-variant'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Timezone pill */}
        <div
          title={`Zona waktu: ${resolvedLabel}`}
          className="hidden xl:flex items-center gap-1.5 text-xs text-outline bg-surface-container-low px-2.5 py-1.5 rounded-lg border border-outline-variant/30"
        >
          <Globe className="w-3.5 h-3.5 text-secondary" />
          <span>{resolvedLabel}</span>
        </div>
      </div>
    </div>
  );
};

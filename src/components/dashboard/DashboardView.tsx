import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Task, TaskFilter } from '../../types/task';
import { useDashboardTasks } from '../../hooks/useDashboardTasks';
import { SummaryStats } from './SummaryStats';
import { StatusFilter } from './StatusFilter';
import { TaskCard } from './TaskCard';
import { EmptyState } from './EmptyState';
import { DashboardSkeleton } from './DashboardSkeleton';

export interface DashboardViewProps {
  tasks: Task[];
  isLoading?: boolean;
  error?: string | null;
  onAddTaskFromAnnouncement?: () => void;
  onAddManualTask?: () => void;
  onSelectTask?: (task: Task) => void;
  onRetry?: () => void;
  initialFilter?: TaskFilter;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  tasks,
  isLoading = false,
  error = null,
  onAddTaskFromAnnouncement,
  onAddManualTask,
  onSelectTask,
  onRetry,
  initialFilter = 'all',
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <DashboardSkeleton />
      </main>
    );
  }

  // 2. Error State
  if (error) {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div
          role="alert"
          className="bg-white border border-rose-200 rounded-2xl p-6 sm:p-8 text-center max-w-lg mx-auto shadow-sm"
        >
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-3">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-base font-bold text-ink-primary">
            Gagal Memuat Data Tugas
          </h2>
          <p className="mt-1.5 text-xs sm:text-sm text-ink-muted">
            {error}
          </p>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="mt-4 inline-flex items-center gap-1.5 bg-brand-primary hover:bg-brand-hover text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-brand-primary"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Coba Lagi</span>
            </button>
          )}
        </div>
      </main>
    );
  }

  // 3. Global Empty State (Ketika data tasks sama sekali kosong)
  if (tasks.length === 0) {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <SummaryStats summary={summary} />
        <EmptyState
          type="no-tasks"
          onAddFromAnnouncement={onAddTaskFromAnnouncement}
          onAddManual={onAddManualTask}
        />
      </main>
    );
  }

  // 4. Success State (Render Main Dashboard)
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Telemetry Summary Cards */}
      <SummaryStats summary={summary} />

      {/* Filter Tabs & Search Controls */}
      <StatusFilter
        currentFilter={filter}
        onFilterChange={setFilter}
        summary={summary}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Filter Empty State (Ketika hasil filter 0) */}
      {filteredTasks.length === 0 ? (
        <EmptyState
          type="filter-empty"
          onResetFilter={() => {
            setFilter('all');
            setSearchQuery('');
          }}
        />
      ) : (
        /* Task Cards Grid */
        <section
          id="task-list-panel"
          aria-label="Daftar Tugas Mahasiswa"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {filteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onSelect={onSelectTask}
              referenceTime={referenceTime}
            />
          ))}
        </section>
      )}
    </main>
  );
};

import React from 'react';
import { Clock, CheckCircle2, AlertTriangle } from 'lucide-react';
import { DashboardSummary } from '../../types/task';

interface SummaryStatsProps {
  summary: DashboardSummary;
}

export const SummaryStats: React.FC<SummaryStatsProps> = ({ summary }) => {
  return (
    <section aria-label="Ringkasan Status Tugas" className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {/* Kartu Tugas Aktif */}
      <div className="bg-white border border-border rounded-xl p-5 shadow-card hover:shadow-card-hover transition-all">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-ink-secondary">Tugas Aktif</span>
          <div className="w-9 h-9 rounded-lg bg-indigo-50 text-brand-primary flex items-center justify-center">
            <Clock className="w-5 h-5" aria-hidden="true" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-3xl font-bold tracking-tight text-ink-primary">
            {summary.activeCount}
          </span>
          <span className="text-xs text-ink-muted">tugas perlu diselesaikan</span>
        </div>
        {summary.overdueCount > 0 && (
          <div className="mt-3 flex items-center gap-1.5 text-xs font-medium text-urgent-overdue-text bg-urgent-overdue-bg border border-urgent-overdue-border rounded-md px-2.5 py-1 w-fit">
            <AlertTriangle className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{summary.overdueCount} tugas melewati deadline</span>
          </div>
        )}
      </div>

      {/* Kartu Tugas Selesai */}
      <div className="bg-white border border-border rounded-xl p-5 shadow-card hover:shadow-card-hover transition-all">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-ink-secondary">Tugas Selesai</span>
          <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" aria-hidden="true" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-3xl font-bold tracking-tight text-emerald-600">
            {summary.doneCount}
          </span>
          <span className="text-xs text-ink-muted">tugas berhasil dituntaskan</span>
        </div>
        <div className="mt-3 flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200/60 rounded-md px-2.5 py-1 w-fit">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
          <span>
            {summary.totalCount > 0
              ? `${Math.round((summary.doneCount / summary.totalCount) * 100)}% dari total ${summary.totalCount} tugas`
              : 'Belum ada tugas tercatat'}
          </span>
        </div>
      </div>
    </section>
  );
};

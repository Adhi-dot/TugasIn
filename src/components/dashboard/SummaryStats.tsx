import React from 'react';
import { ListTodo, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { DashboardSummary } from '../../types/task';

export interface SummaryStatsProps {
  summary: DashboardSummary;
}

export const SummaryStats: React.FC<Readonly<SummaryStatsProps>> = ({ summary }) => {
  const completionPercentage =
    summary.totalCount > 0 ? Math.round((summary.doneCount / summary.totalCount) * 100) : 0;

  return (
    <section aria-label="Ringkasan Status Tugas" className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Card 1: Tugas Aktif */}
      <div className="bg-surface-container-lowest rounded-xl p-5 border border-outline-variant/40 flex items-start justify-between shadow-sm">
        <div>
          <span className="text-xs font-semibold text-outline">Beban Kerja Berjalan</span>
          <h3 className="text-2xl font-bold text-dark-ink mt-1">
            {summary.activeCount} Tugas Aktif
          </h3>
          <p className="text-xs text-on-surface-variant mt-1.5 flex items-center gap-1">
            <span className="font-semibold text-forest-green">
              {summary.notStartedCount} belum mulai
            </span>{' '}
            · {summary.inProgressCount} dikerjakan
          </p>
        </div>
        <div className="w-12 h-12 rounded-xl bg-surface-container-low flex items-center justify-center text-forest-green shrink-0 border border-outline-variant/30">
          <ListTodo className="w-6 h-6" />
        </div>
      </div>

      {/* Card 2: Perlu Perhatian (Terlambat) */}
      <div
        className={`rounded-xl p-5 border flex items-start justify-between shadow-sm ${
          summary.overdueCount > 0
            ? 'bg-rose-50/70 border-rose-200'
            : 'bg-surface-container-lowest border-outline-variant/40'
        }`}
      >
        <div>
          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-bold ${
                summary.overdueCount > 0 ? 'text-rose-800' : 'text-outline'
              }`}
            >
              Prioritas Kritis
            </span>
            {summary.overdueCount > 0 && (
              <span className="px-2 py-0.5 rounded-md text-[11px] bg-rose-200 text-rose-900 font-bold">
                Terlambat
              </span>
            )}
          </div>
          <h3
            className={`text-2xl font-bold mt-1 ${
              summary.overdueCount > 0 ? 'text-rose-950' : 'text-dark-ink'
            }`}
          >
            {summary.overdueCount} Perlu Perhatian
          </h3>
          <p
            className={`text-xs mt-1.5 ${
              summary.overdueCount > 0 ? 'text-rose-800 font-medium' : 'text-on-surface-variant'
            }`}
          >
            {summary.overdueCount > 0
              ? 'Tenggat terlambat butuh tindakan segera'
              : 'Semua tenggat aman terkendali'}
          </p>
        </div>
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${
            summary.overdueCount > 0
              ? 'bg-rose-100 text-rose-700 border-rose-200'
              : 'bg-surface-container-low text-outline border-outline-variant/30'
          }`}
        >
          <AlertTriangle className="w-6 h-6" />
        </div>
      </div>

      {/* Card 3: Tugas Selesai */}
      <div className="bg-emerald-50/60 rounded-xl p-5 border border-emerald-200 flex items-start justify-between shadow-sm">
        <div>
          <span className="text-xs font-semibold text-secondary">Pencapaian Mahasiswa</span>
          <h3 className="text-2xl font-bold text-dark-ink mt-1">
            {summary.doneCount} Tugas Selesai
          </h3>
          <p className="text-xs text-forest-green font-medium mt-1.5">
            {summary.totalCount > 0
              ? `Tingkat penyelesaian ${completionPercentage}% dari total ${summary.totalCount} tugas`
              : 'Belum ada tugas tersimpan'}
          </p>
        </div>
        <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-forest-green shrink-0 border border-emerald-200">
          <CheckCircle2 className="w-6 h-6" />
        </div>
      </div>
    </section>
  );
};

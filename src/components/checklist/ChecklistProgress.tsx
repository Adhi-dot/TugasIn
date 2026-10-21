import React from 'react';

export interface ChecklistProgressProps {
  readonly completed: number;
  readonly total: number;
  readonly percentage: number;
}

export const ChecklistProgress: React.FC<ChecklistProgressProps> = ({
  completed,
  total,
  percentage,
}) => {
  return (
    <div className="w-full space-y-2">
      <div className="flex items-center justify-between text-xs sm:text-sm font-semibold text-ink-muted">
        <span>Progres Pengerjaan</span>
        <span className="tabular-nums font-medium text-ink">
          {completed} dari {total} selesai ({percentage}%)
        </span>
      </div>
      <div
        className="w-full bg-slate-200 h-2 rounded-full overflow-hidden"
        role="progressbar"
        aria-valuenow={percentage}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Kemajuan checklist tugas"
      >
        <div
          className={`h-full transition-all duration-300 ease-out rounded-full ${
            percentage === 100 ? 'bg-success' : 'bg-accent'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

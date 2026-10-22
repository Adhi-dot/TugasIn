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
      <div className="flex items-center justify-between text-xs font-semibold text-outline">
        <span className="font-bold text-dark-ink">Progres Checklist</span>
        <span className="tabular-nums font-bold text-forest-green">
          {completed} dari {total} selesai ({percentage}%)
        </span>
      </div>
      <div
        className="w-full bg-surface-container-low border border-outline-variant/30 h-2.5 rounded-full overflow-hidden"
        role="progressbar"
        aria-valuenow={percentage}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Kemajuan checklist tugas"
      >
        <div
          className={`h-full transition-all duration-300 ease-out rounded-full ${
            percentage === 100 ? 'bg-forest-green' : 'bg-forest-green'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

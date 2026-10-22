import React from 'react';
import { Calendar, Clock, AlertCircle, CheckCircle2, ChevronRight, BookOpen } from 'lucide-react';
import { Task } from '../../types/task';
import { getTaskDeadlineInfo, calculateChecklistProgress } from '../../lib/deadline';

export interface TaskCardProps {
  task: Task;
  onSelect?: (task: Task) => void;
  referenceTime?: Date;
}

export const TaskCard: React.FC<Readonly<TaskCardProps>> = ({
  task,
  onSelect,
  referenceTime = new Date(),
}) => {
  const deadlineInfo = getTaskDeadlineInfo(task, referenceTime);
  const checklistProgress = calculateChecklistProgress(task.checklist);

  const getStatusBadge = () => {
    switch (task.status) {
      case 'not_started':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-surface-container-low text-on-surface-variant border border-outline-variant/30">
            <span className="w-1.5 h-1.5 rounded-full bg-outline" />
            Belum mulai
          </span>
        );
      case 'in_progress':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-0.5 rounded-full bg-lime-accent text-dark-ink border border-secondary/20">
            <span className="w-1.5 h-1.5 rounded-full bg-forest-green animate-pulse" />
            Dikerjakan
          </span>
        );
      case 'done':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-forest-green border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-forest-green" />
            Selesai
          </span>
        );
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect?.(task);
    }
  };

  return (
    <article
      tabIndex={0}
      role="button"
      aria-label={`Kartu tugas: ${task.title}. Status: ${task.status}. Tenggat: ${deadlineInfo.formattedDeadline}`}
      onClick={() => onSelect?.(task)}
      onKeyDown={handleKeyDown}
      className={`group bg-surface-container-lowest rounded-xl border p-5 flex flex-col justify-between transition-all cursor-pointer text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-forest-green focus-visible:ring-offset-2 shadow-sm ${
        deadlineInfo.isOverdue
          ? 'border-rose-300 hover:border-rose-500 hover:shadow-md'
          : 'border-outline-variant/40 hover:border-forest-green/60 hover:shadow-md'
      }`}
    >
      <div>
        {/* Top Header: Course & Status */}
        <div className="flex items-center justify-between gap-2 mb-3">
          {task.course ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded bg-surface-container-low text-dark-ink border border-outline-variant/30 truncate max-w-[65%]">
              <BookOpen className="w-3 h-3 text-secondary shrink-0" />
              <span className="truncate">{task.course}</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded bg-surface-container-low text-outline border border-outline-variant/20">
              Tugas Umum
            </span>
          )}
          {getStatusBadge()}
        </div>

        {/* Task Title */}
        <h3 className="font-bold text-base text-dark-ink line-clamp-2 leading-snug group-hover:text-forest-green transition-colors">
          {task.title}
        </h3>

        {/* Brief Description */}
        {task.description && (
          <p className="mt-2 text-xs text-on-surface-variant line-clamp-2 leading-relaxed">
            {task.description}
          </p>
        )}
      </div>

      <div className="mt-4 pt-3.5 border-t border-outline-variant/30 flex flex-col gap-2.5">
        {/* Deadline Information */}
        <div className="flex items-center justify-between text-xs gap-2">
          {deadlineInfo.isOverdue ? (
            <div className="flex items-center gap-1.5 text-rose-800 font-bold bg-rose-100 border border-rose-200 px-2 py-0.5 rounded">
              <AlertCircle className="w-3.5 h-3.5 text-rose-700 shrink-0" />
              <span className="truncate">{deadlineInfo.formattedDeadline}</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-on-surface-variant font-medium">
              {deadlineInfo.hasTime ? (
                <Calendar className="w-3.5 h-3.5 text-forest-green shrink-0" />
              ) : (
                <Clock className="w-3.5 h-3.5 text-outline shrink-0" />
              )}
              <span className="truncate">{deadlineInfo.formattedDeadline}</span>
            </div>
          )}

          <ChevronRight className="w-4 h-4 text-outline group-hover:text-forest-green group-hover:translate-x-0.5 transition-all shrink-0 ml-auto" />
        </div>

        {/* Checklist Progress Bar */}
        <div>
          <div className="flex items-center justify-between text-[11px] text-outline mb-1">
            <span className="font-medium">Checklist Langkah</span>
            <span className="font-bold text-dark-ink">{checklistProgress.formattedProgress}</span>
          </div>
          <div className="w-full h-2 bg-surface-container-low rounded-full overflow-hidden border border-outline-variant/30">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                task.status === 'done' || checklistProgress.percentage === 100
                  ? 'bg-forest-green'
                  : checklistProgress.percentage > 0
                  ? 'bg-forest-green'
                  : 'bg-outline-variant/40'
              }`}
              style={{ width: `${checklistProgress.percentage}%` }}
            />
          </div>
        </div>
      </div>
    </article>
  );
};

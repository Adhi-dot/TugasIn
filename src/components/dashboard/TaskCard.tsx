import React from 'react';
import { Calendar, Clock, AlertCircle, CheckCircle2, ChevronRight, BookOpen } from 'lucide-react';
import { Task } from '../../types/task';
import { getTaskDeadlineInfo, calculateChecklistProgress } from '../../lib/deadline';

interface TaskCardProps {
  task: Task;
  onSelect?: (task: Task) => void;
  referenceTime?: Date;
}

export const TaskCard: React.FC<TaskCardProps> = ({
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
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            Belum mulai
          </span>
        );
      case 'in_progress':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            Dikerjakan
          </span>
        );
      case 'done':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
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
      className={`group bg-white rounded-xl border p-4 sm:p-5 flex flex-col justify-between transition-all cursor-pointer text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 ${
        deadlineInfo.isOverdue
          ? 'border-urgent-overdue-border shadow-sm hover:border-rose-400 hover:shadow-card-hover'
          : 'border-border shadow-card hover:border-slate-300 hover:shadow-card-hover'
      }`}
    >
      <div>
        {/* Top Header: Course & Status */}
        <div className="flex items-center justify-between gap-2 mb-2.5">
          {task.course ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded bg-slate-100 text-ink-secondary truncate max-w-[65%]">
              <BookOpen className="w-3 h-3 text-ink-muted shrink-0" />
              <span className="truncate">{task.course}</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded bg-slate-50 text-ink-faint border border-slate-100">
              Tugas Umum
            </span>
          )}
          {getStatusBadge()}
        </div>

        {/* Task Title */}
        <h3 className="font-semibold text-base text-ink-primary line-clamp-2 leading-snug group-hover:text-brand-primary transition-colors">
          {task.title}
        </h3>

        {/* Brief Description */}
        {task.description && (
          <p className="mt-1.5 text-xs text-ink-muted line-clamp-2 leading-relaxed">
            {task.description}
          </p>
        )}
      </div>

      <div className="mt-4 pt-3.5 border-t border-border/80 flex flex-col gap-2.5">
        {/* Deadline Information */}
        <div className="flex items-center justify-between text-xs gap-2">
          {deadlineInfo.isOverdue ? (
            <div className="flex items-center gap-1.5 text-urgent-overdue-text font-semibold bg-urgent-overdue-bg border border-urgent-overdue-border px-2 py-0.5 rounded">
              <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
              <span className="truncate">{deadlineInfo.formattedDeadline}</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-ink-secondary">
              {deadlineInfo.hasTime ? (
                <Calendar className="w-3.5 h-3.5 text-ink-muted shrink-0" />
              ) : (
                <Clock className="w-3.5 h-3.5 text-ink-muted shrink-0" />
              )}
              <span className="truncate">{deadlineInfo.formattedDeadline}</span>
            </div>
          )}

          <ChevronRight className="w-4 h-4 text-ink-faint group-hover:text-brand-primary group-hover:translate-x-0.5 transition-all shrink-0 ml-auto" />
        </div>

        {/* Checklist Progress Bar */}
        <div>
          <div className="flex items-center justify-between text-[11px] text-ink-muted mb-1">
            <span>Checklist</span>
            <span className="font-medium text-ink-secondary">{checklistProgress.formattedProgress}</span>
          </div>
          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                task.status === 'done' || checklistProgress.percentage === 100
                  ? 'bg-emerald-500'
                  : checklistProgress.percentage > 0
                  ? 'bg-brand-primary'
                  : 'bg-slate-200'
              }`}
              style={{ width: `${checklistProgress.percentage}%` }}
            />
          </div>
        </div>
      </div>
    </article>
  );
};

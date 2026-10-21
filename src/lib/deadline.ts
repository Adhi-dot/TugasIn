/**
 * Deadline Calculation & Task Sorting Helper for TugasIn
 * Strictly enforces PRD Section 6.1, 8, and 9:
 * 1. Prevents arbitrary UTC shifts.
 * 2. Date without time displayed as "Batas tanggal ... · jam tidak disebutkan".
 * 3. Overdue for date without time only activates after date ends (23:59:59.999).
 * 4. Completed tasks NEVER display "Terlambat".
 * 5. Deterministic 4-tier sorting.
 */

import { Task, TaskDeadlineInfo, TaskChecklistProgress } from '../types/task';

const MONTH_NAMES_ID = [
  'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
  'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
];

/**
 * Parses YYYY-MM-DD and HH:mm safely without UTC offset shift.
 */
export function parseLocalDate(dueDate: string, dueTime?: string | null, isEndOfDayIfNoTime = false): Date | null {
  if (!dueDate || typeof dueDate !== 'string') return null;

  const parts = dueDate.split('-');
  if (parts.length !== 3) return null;

  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1; // 0-indexed
  const day = parseInt(parts[2], 10);

  if (isNaN(year) || isNaN(month) || isNaN(day)) return null;

  let hours = 0;
  let minutes = 0;
  let seconds = 0;
  let ms = 0;

  if (dueTime && typeof dueTime === 'string') {
    const timeParts = dueTime.split(':');
    if (timeParts.length >= 2) {
      hours = parseInt(timeParts[0], 10) || 0;
      minutes = parseInt(timeParts[1], 10) || 0;
    }
  } else if (isEndOfDayIfNoTime) {
    hours = 23;
    minutes = 59;
    seconds = 59;
    ms = 999;
  }

  const d = new Date(year, month, day, hours, minutes, seconds, ms);
  return isNaN(d.getTime()) ? null : d;
}

/**
 * Returns formatted deadline string and overdue telemetry.
 */
export function getTaskDeadlineInfo(task: Task, referenceTime: Date = new Date()): TaskDeadlineInfo {
  if (!task.dueDate) {
    return {
      formattedDeadline: 'Belum ada deadline',
      isOverdue: false,
      hasTime: false,
      hasDeadline: false,
      deadlineTimestamp: null,
    };
  }

  const hasTime = Boolean(task.dueTime && task.dueTime.trim().length > 0);
  // For overdue calculation: date without time becomes overdue only after 23:59:59
  const deadlineDate = parseLocalDate(task.dueDate, task.dueTime, !hasTime);

  if (!deadlineDate) {
    return {
      formattedDeadline: 'Format tanggal tidak valid',
      isOverdue: false,
      hasTime,
      hasDeadline: true,
      deadlineTimestamp: null,
    };
  }

  const deadlineTimestamp = deadlineDate.getTime();
  const nowTimestamp = referenceTime.getTime();

  // Rule: Completed tasks NEVER display "Terlambat"
  const isOverdue = task.status !== 'done' && nowTimestamp > deadlineTimestamp;

  // Format readable Indonesian text
  const parts = task.dueDate.split('-');
  const day = parseInt(parts[2], 10);
  const monthIdx = parseInt(parts[1], 10) - 1;
  const year = parts[0];
  const monthStr = MONTH_NAMES_ID[monthIdx] || parts[1];

  let formattedDeadline = '';

  if (hasTime && task.dueTime) {
    const tz = task.displayTimezone || task.sourceTimezone || 'WIB';
    formattedDeadline = `${day} ${monthStr} ${year}, ${task.dueTime} ${tz}`;
  } else {
    formattedDeadline = `Batas tanggal ${day} ${monthStr} ${year} · jam tidak disebutkan`;
  }

  return {
    formattedDeadline,
    isOverdue,
    hasTime,
    hasDeadline: true,
    deadlineTimestamp,
    urgencyLabel: isOverdue ? 'Terlambat' : undefined,
  };
}

/**
 * Calculates checklist progress with safe zero-division handling.
 */
export function calculateChecklistProgress(checklist?: Task['checklist']): TaskChecklistProgress {
  if (!checklist || !Array.isArray(checklist) || checklist.length === 0) {
    return {
      total: 0,
      completed: 0,
      percentage: 0,
      formattedProgress: '0/0 langkah (0%)',
    };
  }

  const total = checklist.length;
  const completed = checklist.filter(item => item.completed).length;
  const percentage = Math.round((completed / total) * 100);

  return {
    total,
    completed,
    percentage,
    formattedProgress: `${completed}/${total} langkah (${percentage}%)`,
  };
}

/**
 * Deterministic 4-tier task sorting:
 * 1. Active overdue tasks (earliest deadline first)
 * 2. Active tasks with upcoming deadline (nearest deadline first)
 * 3. Active tasks without deadline
 * 4. Completed tasks (latest updated first)
 */
export function sortTasksByPriority(tasks: Task[], referenceTime: Date = new Date()): Task[] {
  return [...tasks].sort((a, b) => {
    const infoA = getTaskDeadlineInfo(a, referenceTime);
    const infoB = getTaskDeadlineInfo(b, referenceTime);

    // Helper: compute tier rank (1 to 4)
    const getTier = (task: Task, info: TaskDeadlineInfo): number => {
      if (task.status === 'done') return 4;
      if (info.isOverdue) return 1;
      if (info.hasDeadline && info.deadlineTimestamp !== null) return 2;
      return 3; // active without deadline
    };

    const tierA = getTier(a, infoA);
    const tierB = getTier(b, infoB);

    if (tierA !== tierB) {
      return tierA - tierB;
    }

    // Within Tier 1 (Overdue): Earliest deadline first (paling lama/lampau terlebih dahulu)
    if (tierA === 1) {
      const timeA = infoA.deadlineTimestamp ?? 0;
      const timeB = infoB.deadlineTimestamp ?? 0;
      return timeA - timeB;
    }

    // Within Tier 2 (Upcoming): Nearest deadline first (terdekat terlebih dahulu)
    if (tierA === 2) {
      const timeA = infoA.deadlineTimestamp ?? Infinity;
      const timeB = infoB.deadlineTimestamp ?? Infinity;
      return timeA - timeB;
    }

    // Within Tier 3 (No deadline): Sort by createdAt ascending or title
    if (tierA === 3) {
      return (new Date(a.createdAt).getTime() || 0) - (new Date(b.createdAt).getTime() || 0);
    }

    // Within Tier 4 (Done): Sort by updatedAt descending
    return (new Date(b.updatedAt).getTime() || 0) - (new Date(a.updatedAt).getTime() || 0);
  });
}

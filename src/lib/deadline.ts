/**
 * Deadline Calculation & Task Sorting Helper for TugasIn
 * Strictly enforces PRD Section 6.1, 8, and 9:
 * 1. Uses IANA timezones (e.g. "Asia/Jakarta") for accurate calculations.
 * 2. Defaults to browser's resolved IANA timezone, never silent fallback to WIB.
 * 3. Maps Indonesian regional display labels: WIB (Asia/Jakarta), WITA (Asia/Makassar), WIT (Asia/Jayapura).
 * 4. Calculates precise UTC timestamp for deadline in target timezone, even if browser is in another timezone.
 * 5. Date without time displayed as "Batas tanggal ... · jam tidak disebutkan".
 * 6. Overdue for date without time only activates after date ends (23:59:59.999) in displayTimezone.
 * 7. Completed tasks NEVER display "Terlambat".
 * 8. Deterministic 4-tier sorting.
 */

import { Task, TaskDeadlineInfo, TaskChecklistProgress } from '../types/task';

const MONTH_NAMES_ID = [
  'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
  'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
];

/**
 * Resolves an input timezone string into a valid IANA timezone identifier.
 * Follows PRD rule: Default timezone follows the user's browser, not hardcoded WIB.
 */
export function resolveIanaTimezone(tz?: string | null): string {
  // If undefined/empty, detect from user's browser runtime
  if (!tz || typeof tz !== 'string' || tz.trim() === '') {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Jakarta';
    } catch {
      return 'Asia/Jakarta';
    }
  }

  const clean = tz.trim();
  const upper = clean.toUpperCase();

  // Common Indonesian abbreviation mapping to canonical IANA zones
  if (upper === 'WIB') return 'Asia/Jakarta';
  if (upper === 'WITA') return 'Asia/Makassar';
  if (upper === 'WIT') return 'Asia/Jayapura';
  if (upper === 'UTC' || upper === 'GMT') return 'UTC';

  // Validate if provided string is a valid IANA timezone identifier
  try {
    new Intl.DateTimeFormat(undefined, { timeZone: clean }).format();
    return clean;
  } catch {
    // If invalid, fallback to the browser's resolved timezone
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Jakarta';
    } catch {
      return 'Asia/Jakarta';
    }
  }
}

/**
 * Returns a user-friendly display abbreviation for an IANA timezone.
 */
export function getTimezoneDisplayLabel(ianaTz: string): string {
  if (ianaTz === 'Asia/Jakarta') return 'WIB';
  if (ianaTz === 'Asia/Makassar') return 'WITA';
  if (ianaTz === 'Asia/Jayapura') return 'WIT';
  if (ianaTz === 'UTC') return 'UTC';

  try {
    const formatter = new Intl.DateTimeFormat('id-ID', {
      timeZone: ianaTz,
      timeZoneName: 'short',
    });
    const parts = formatter.formatToParts(new Date());
    const tzPart = parts.find((p) => p.type === 'timeZoneName');
    return tzPart && tzPart.value ? tzPart.value : ianaTz;
  } catch {
    return ianaTz;
  }
}

/**
 * Calculates the exact UTC millisecond timestamp corresponding to a wall-clock date and time
 * in a specific target IANA timezone, regardless of the host machine's local browser timezone.
 */
export function getZonedDeadlineTimestamp(
  dueDate: string,
  dueTime: string | null,
  ianaTimezone: string,
  isEndOfDayIfNoTime = false
): number | null {
  if (!dueDate || typeof dueDate !== 'string') return null;

  const parts = dueDate.split('-');
  if (parts.length !== 3) return null;

  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10); // 1-12
  const day = parseInt(parts[2], 10);

  if (isNaN(year) || isNaN(month) || isNaN(day)) return null;

  let hour = 0;
  let minute = 0;
  let second = 0;
  let millisecond = 0;

  if (dueTime && typeof dueTime === 'string') {
    const timeParts = dueTime.split(':');
    if (timeParts.length >= 2) {
      hour = parseInt(timeParts[0], 10) || 0;
      minute = parseInt(timeParts[1], 10) || 0;
    }
  } else if (isEndOfDayIfNoTime) {
    hour = 23;
    minute = 59;
    second = 59;
    millisecond = 999;
  }

  // 1. Initial guess in UTC:
  const guessUtc = Date.UTC(year, month - 1, day, hour, minute, second, millisecond);

  try {
    // 2. Format guess in the target timezone to measure the exact timezone offset:
    const dtf = new Intl.DateTimeFormat('en-US', {
      timeZone: ianaTimezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hourCycle: 'h23',
    });

    const formattedParts = dtf.formatToParts(new Date(guessUtc));
    const getPartVal = (type: string) =>
      parseInt(formattedParts.find((p) => p.type === type)?.value || '0', 10);

    const zonedYear = getPartVal('year');
    const zonedMonth = getPartVal('month');
    const zonedDay = getPartVal('day');
    const zonedHour = getPartVal('hour');
    const zonedMinute = getPartVal('minute');
    const zonedSecond = getPartVal('second');

    const zonedAsUtc = Date.UTC(
      zonedYear,
      zonedMonth - 1,
      zonedDay,
      zonedHour,
      zonedMinute,
      zonedSecond,
      millisecond
    );

    const offsetMs = zonedAsUtc - guessUtc;
    return guessUtc - offsetMs;
  } catch {
    // Fallback if Intl fails
    return guessUtc;
  }
}

/**
 * Parses YYYY-MM-DD and HH:mm safely.
 * Maintained for local helper compatibility.
 */
export function parseLocalDate(
  dueDate: string,
  dueTime?: string | null,
  isEndOfDayIfNoTime = false
): Date | null {
  const iana = resolveIanaTimezone(null);
  const ts = getZonedDeadlineTimestamp(dueDate, dueTime ?? null, iana, isEndOfDayIfNoTime);
  return ts !== null ? new Date(ts) : null;
}

/**
 * Returns formatted deadline string and overdue telemetry according to displayTimezone.
 */
export function getTaskDeadlineInfo(
  task: Task,
  referenceTime: Date = new Date()
): TaskDeadlineInfo {
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
  const ianaTz = resolveIanaTimezone(task.displayTimezone);
  const displayLabel = getTimezoneDisplayLabel(ianaTz);

  // For overdue calculation: date without time becomes overdue only after 23:59:59 in displayTimezone
  const deadlineTimestamp = getZonedDeadlineTimestamp(
    task.dueDate,
    task.dueTime,
    ianaTz,
    !hasTime
  );

  if (deadlineTimestamp === null) {
    return {
      formattedDeadline: 'Format tanggal tidak valid',
      isOverdue: false,
      hasTime,
      hasDeadline: true,
      deadlineTimestamp: null,
    };
  }

  const nowTimestamp = referenceTime.getTime();

  // Rule: Completed tasks NEVER display "Terlambat"
  const isOverdue = task.status !== 'done' && nowTimestamp > deadlineTimestamp;

  // Format readable Indonesian date
  const parts = task.dueDate.split('-');
  const day = parseInt(parts[2], 10);
  const monthIdx = parseInt(parts[1], 10) - 1;
  const year = parts[0];
  const monthStr = MONTH_NAMES_ID[monthIdx] || parts[1];

  let formattedDeadline = '';

  if (hasTime && task.dueTime) {
    formattedDeadline = `${day} ${monthStr} ${year}, ${task.dueTime} ${displayLabel}`;
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
  const completed = checklist.filter((item) => item.completed).length;
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

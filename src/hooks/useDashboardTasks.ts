/**
 * Custom Hook: useDashboardTasks
 * Handles filter state, search query, periodic deadline refresh,
 * metric calculations, and deterministic priority sorting.
 */

import { useState, useMemo, useEffect } from 'react';
import { Task, TaskFilter, DashboardSummary } from '../types/task';
import { sortTasksByPriority, getTaskDeadlineInfo } from '../lib/deadline';

interface UseDashboardTasksOptions {
  tasks: Task[];
  initialFilter?: TaskFilter;
  autoRefreshIntervalMs?: number; // default: 30000ms (30s)
}

export function useDashboardTasks({
  tasks,
  initialFilter = 'all',
  autoRefreshIntervalMs = 30000,
}: UseDashboardTasksOptions) {
  const [filter, setFilter] = useState<TaskFilter>(initialFilter);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [referenceTime, setReferenceTime] = useState<Date>(() => new Date());

  // Periodically update reference time so overdue calculations update live while dashboard remains open
  useEffect(() => {
    const timer = setInterval(() => {
      setReferenceTime(new Date());
    }, autoRefreshIntervalMs);

    return () => clearInterval(timer);
  }, [autoRefreshIntervalMs]);

  // Compute reactive summary metrics
  const summary = useMemo<DashboardSummary>(() => {
    let activeCount = 0;
    let doneCount = 0;
    let notStartedCount = 0;
    let inProgressCount = 0;
    let overdueCount = 0;

    for (const task of tasks) {
      if (task.status === 'done') {
        doneCount++;
      } else {
        activeCount++;
        if (task.status === 'not_started') {
          notStartedCount++;
        } else if (task.status === 'in_progress') {
          inProgressCount++;
        }

        const deadlineInfo = getTaskDeadlineInfo(task, referenceTime);
        if (deadlineInfo.isOverdue) {
          overdueCount++;
        }
      }
    }

    return {
      activeCount,
      doneCount,
      totalCount: tasks.length,
      overdueCount,
      notStartedCount,
      inProgressCount,
    };
  }, [tasks, referenceTime]);

  // Filter tasks by status and search query, then sort by multi-tier priority
  const filteredTasks = useMemo<Task[]>(() => {
    let result = tasks;

    // 1. Status Filter
    if (filter !== 'all') {
      result = result.filter(task => task.status === filter);
    }

    // 2. Search Query (Title, Course, Description)
    const query = searchQuery.trim().toLowerCase();
    if (query.length > 0) {
      result = result.filter(task => {
        const titleMatch = task.title.toLowerCase().includes(query);
        const courseMatch = task.course ? task.course.toLowerCase().includes(query) : false;
        const descMatch = task.description ? task.description.toLowerCase().includes(query) : false;
        return titleMatch || courseMatch || descMatch;
      });
    }

    // 3. Multi-tier Sorting
    return sortTasksByPriority(result, referenceTime);
  }, [tasks, filter, searchQuery, referenceTime]);

  return {
    filter,
    setFilter,
    searchQuery,
    setSearchQuery,
    referenceTime,
    summary,
    filteredTasks,
    refreshTime: () => setReferenceTime(new Date()),
  };
}

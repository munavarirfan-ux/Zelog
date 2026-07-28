export type ProjectColor = "indigo" | "violet" | "sky" | "emerald" | "amber" | "rose";

export interface Project {
  id: string;
  name: string;
  client?: string;
  color: ProjectColor;
  billableDefault: boolean;
}

export interface TimeEntry {
  id: string;
  task: string;
  projectId: string;
  billable: boolean;
  tags: string[];
  /** yyyy-MM-dd, the calendar day this entry belongs to */
  date: string;
  startTime: string;
  endTime: string;
  durationSeconds: number;
}

export interface RunningTimer {
  id: string;
  task: string;
  projectId: string;
  billable: boolean;
  tags: string[];
  /** When the current (unpaused) segment began. Irrelevant while paused. */
  startedAt: string;
  /** Seconds banked from segments completed before the current one. */
  accumulatedSeconds: number;
  isPaused: boolean;
}

export type TimeRangeFilter = "today" | "week" | "month" | "all";

export interface TrackerFilters {
  projectIds: string[];
  range: TimeRangeFilter;
}

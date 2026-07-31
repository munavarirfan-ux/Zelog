import {
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  parseISO,
  startOfMonth,
  startOfWeek,
  subDays,
} from "date-fns";
import type { TimeEntry, TimeRangeFilter, TrackerFilters } from "@/types/tracker";

function inRange(dateStr: string, range: TimeRangeFilter, now: Date): boolean {
  const d = parseISO(dateStr);
  if (range === "today") return isSameDay(d, now);
  if (range === "week") {
    return d >= startOfWeek(now, { weekStartsOn: 1 }) && d <= endOfWeek(now, { weekStartsOn: 1 });
  }
  if (range === "month") {
    return d >= startOfMonth(now) && d <= endOfMonth(now);
  }
  return true;
}

export function applyFilters(entries: TimeEntry[], filters: TrackerFilters, now: Date = new Date()): TimeEntry[] {
  let result = entries;
  if (filters.projectIds.length > 0) {
    result = result.filter((e) => filters.projectIds.includes(e.projectId));
  }
  result = result.filter((e) => inRange(e.date, filters.range, now));
  return result;
}

export interface DayGroupData {
  date: string;
  totalSeconds: number;
  entries: TimeEntry[];
}

export function groupEntriesByDay(entries: TimeEntry[]): DayGroupData[] {
  const map = new Map<string, TimeEntry[]>();
  for (const e of entries) {
    const list = map.get(e.date) ?? [];
    list.push(e);
    map.set(e.date, list);
  }
  return Array.from(map.entries())
    .map(([date, es]) => ({
      date,
      totalSeconds: es.reduce((sum, e) => sum + e.durationSeconds, 0),
      entries: es.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()),
    }))
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export interface WeekGroupData {
  weekStart: string;
  weekEnd: string;
  totalSeconds: number;
  days: DayGroupData[];
}

export function groupEntriesByWeek(dayGroups: DayGroupData[]): WeekGroupData[] {
  const weekMap = new Map<string, DayGroupData[]>();
  for (const day of dayGroups) {
    const d = parseISO(day.date);
    const ws = startOfWeek(d, { weekStartsOn: 1 });
    const key = format(ws, "yyyy-MM-dd");
    const list = weekMap.get(key) ?? [];
    list.push(day);
    weekMap.set(key, list);
  }
  return Array.from(weekMap.entries())
    .map(([weekStartStr, days]) => {
      const ws = parseISO(weekStartStr);
      const we = endOfWeek(ws, { weekStartsOn: 1 });
      return {
        weekStart: format(ws, "MMM dd"),
        weekEnd: format(we, "MMM dd"),
        totalSeconds: days.reduce((s, d) => s + d.totalSeconds, 0),
        days: days.sort((a, b) => (a.date < b.date ? 1 : -1)),
      };
    })
    .sort((a, b) => {
      const aFirst = a.days[0]?.date ?? "";
      const bFirst = b.days[0]?.date ?? "";
      return aFirst < bFirst ? 1 : -1;
    });
}

export function totalForDate(entries: TimeEntry[], dateStr: string): number {
  return entries.filter((e) => e.date === dateStr).reduce((s, e) => s + e.durationSeconds, 0);
}

export function totalForRange(entries: TimeEntry[], range: TimeRangeFilter, now: Date = new Date()): number {
  return entries.filter((e) => inRange(e.date, range, now)).reduce((s, e) => s + e.durationSeconds, 0);
}

export function weeklyHoursSeries(entries: TimeEntry[], now: Date = new Date()) {
  const days = eachDayOfInterval({ start: subDays(now, 6), end: now });
  return days.map((d) => {
    const key = format(d, "yyyy-MM-dd");
    const seconds = entries.filter((e) => e.date === key).reduce((s, e) => s + e.durationSeconds, 0);
    return { date: key, label: format(d, "EEE"), hours: +(seconds / 3600).toFixed(2) };
  });
}

export function productivityTrend(entries: TimeEntry[], days = 14, now: Date = new Date()) {
  const range = eachDayOfInterval({ start: subDays(now, days - 1), end: now });
  return range.map((d) => {
    const key = format(d, "yyyy-MM-dd");
    const seconds = entries.filter((e) => e.date === key).reduce((s, e) => s + e.durationSeconds, 0);
    return { date: key, hours: +(seconds / 3600).toFixed(2) };
  });
}

export interface ProjectDistributionRow {
  projectId: string;
  seconds: number;
  hours: number;
  percent: number;
}

export function projectDistribution(entries: TimeEntry[]): ProjectDistributionRow[] {
  const totals = new Map<string, number>();
  for (const e of entries) totals.set(e.projectId, (totals.get(e.projectId) ?? 0) + e.durationSeconds);
  const grand = Array.from(totals.values()).reduce((a, b) => a + b, 0) || 1;
  return Array.from(totals.entries())
    .map(([projectId, seconds]) => ({
      projectId,
      seconds,
      hours: seconds / 3600,
      percent: Math.round((seconds / grand) * 100),
    }))
    .sort((a, b) => b.seconds - a.seconds);
}

export function billablePercent(entries: TimeEntry[]): number {
  const total = entries.reduce((s, e) => s + e.durationSeconds, 0);
  if (total === 0) return 0;
  const billable = entries.filter((e) => e.billable).reduce((s, e) => s + e.durationSeconds, 0);
  return Math.round((billable / total) * 100);
}

export interface HeatmapCell {
  date: string;
  hours: number;
  level: 0 | 1 | 2 | 3 | 4;
}

function intensityLevel(seconds: number): 0 | 1 | 2 | 3 | 4 {
  const hours = seconds / 3600;
  if (hours <= 0) return 0;
  if (hours < 1.5) return 1;
  if (hours < 3) return 2;
  if (hours < 5.5) return 3;
  return 4;
}

export function heatmapData(entries: TimeEntry[], weeks = 12, now: Date = new Date()): HeatmapCell[] {
  const totalsByDate = new Map<string, number>();
  for (const e of entries) totalsByDate.set(e.date, (totalsByDate.get(e.date) ?? 0) + e.durationSeconds);
  const start = subDays(now, weeks * 7 - 1);
  const days = eachDayOfInterval({ start, end: now });
  return days.map((d) => {
    const key = format(d, "yyyy-MM-dd");
    const seconds = totalsByDate.get(key) ?? 0;
    return { date: key, hours: +(seconds / 3600).toFixed(2), level: intensityLevel(seconds) };
  });
}

export function recentActivity(entries: TimeEntry[], limit = 5): TimeEntry[] {
  return [...entries].sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()).slice(0, limit);
}

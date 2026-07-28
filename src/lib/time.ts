import { differenceInSeconds, format, isSameDay, parseISO } from "date-fns";
import type { RunningTimer } from "@/types/tracker";

export function formatDuration(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = Math.floor(totalSeconds % 60);
  return [h, m, s].map((n) => String(n).padStart(2, "0")).join(":");
}

export function formatDurationShort(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.round((totalSeconds % 3600) / 60);
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

export function formatDurationHours(totalSeconds: number, digits = 1): string {
  return (totalSeconds / 3600).toFixed(digits);
}

export function formatTimeRange(startIso: string, endIso: string): string {
  return `${format(parseISO(startIso), "h:mm a")} — ${format(parseISO(endIso), "h:mm a")}`;
}

export function elapsedSeconds(startedAtIso: string, now: Date = new Date()): number {
  return Math.max(0, differenceInSeconds(now, parseISO(startedAtIso)));
}

export function isToday(dateIso: string, now: Date = new Date()): boolean {
  return isSameDay(parseISO(dateIso), now);
}

export function runningTimerElapsedSeconds(timer: RunningTimer, now: Date = new Date()): number {
  if (timer.isPaused) return timer.accumulatedSeconds;
  return timer.accumulatedSeconds + elapsedSeconds(timer.startedAt, now);
}

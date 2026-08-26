import {
  differenceInCalendarDays,
  eachDayOfInterval,
  endOfMonth,
  format,
  getDay,
  parseISO,
  startOfMonth,
} from "date-fns";
import { isHoliday, holidayName, leaveTypeById, type TimeOffRequest } from "./timeOffData";
import type { AttendanceMode } from "./attendanceData";

/* ═══════════════════════════════════════════════════════════
   Per-employee monthly attendance, for the Reports & Dashboard
   bar graphs. Joins three things the app already tracks:
     • worked hours + work-from-home (deterministic per person)
     • approved leave ranges (real, from the Time Off store)
     • the anomaly of logging hours *during* approved leave
   All mock/front-end only — no backend.
   ═══════════════════════════════════════════════════════════ */

export type EmployeeDayKind =
  | "present" // worked in office
  | "wfh" // worked from home
  | "half-day" // worked a partial day
  | "leave" // on approved leave, no hours logged
  | "leave-worked" // on approved leave but still logged hours (the anomaly)
  | "holiday"
  | "weekend"
  | "absent"
  | "future"; // scheduled but not yet reached

export interface EmployeeDay {
  date: string; // yyyy-MM-dd
  label: string; // "Aug 03"
  dayNum: number;
  weekday: string; // "Mon"
  weekend: boolean;
  holiday: boolean;
  holidayName?: string;
  future: boolean;
  kind: EmployeeDayKind;
  /** office | wfh for any day where hours were logged. */
  mode?: AttendanceMode;
  /** Hours actually logged that day, in seconds (0 when none). */
  workedSeconds: number;
  /** True when the day falls inside an approved leave range. */
  onLeave: boolean;
  leaveTypeId?: string;
  leaveColor?: string;
  leaveLabel?: string;
  leaveHalfDay?: boolean;
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const HOUR = 3600;

/** Stable FNV-1a hash → deterministic per-employee, per-day variety. */
function hashStr(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

/** Map of yyyy-MM-dd → approved leave info for one employee. */
function approvedLeaveByDate(
  employeeId: string,
  requests: TimeOffRequest[],
): Map<string, { leaveTypeId?: string; halfDay: boolean }> {
  const map = new Map<string, { leaveTypeId?: string; halfDay: boolean }>();
  requests
    .filter((r) => r.employeeId === employeeId && r.status === "approved")
    .forEach((r) => {
      const start = parseISO(r.startDate);
      const end = parseISO(r.endDate);
      if (end < start) return;
      eachDayOfInterval({ start, end }).forEach((d) => {
        map.set(format(d, "yyyy-MM-dd"), {
          leaveTypeId: r.leaveTypeId,
          halfDay: r.durationType === "half-day",
        });
      });
    });
  return map;
}

/**
 * Build one month of attendance for a single employee. Worked hours and the
 * office/WFH split are deterministic (seeded by employee id) so the chart is
 * stable across renders; leave days come from the real approved requests.
 */
export function buildEmployeeMonth(
  employeeId: string,
  monthDate: Date,
  today: Date,
  requests: TimeOffRequest[],
): EmployeeDay[] {
  const leaveMap = approvedLeaveByDate(employeeId, requests);
  const start = startOfMonth(monthDate);
  const end = endOfMonth(monthDate);

  return eachDayOfInterval({ start, end }).map((d) => {
    const iso = format(d, "yyyy-MM-dd");
    const dayNum = d.getDate();
    const dow = getDay(d);
    const weekend = dow === 0 || dow === 6;
    const holiday = isHoliday(d);
    const future = differenceInCalendarDays(d, today) > 0;
    const seed = hashStr(`${employeeId}:${iso}`);

    const base: EmployeeDay = {
      date: iso,
      label: format(d, "MMM dd"),
      dayNum,
      weekday: WEEKDAYS[dow],
      weekend,
      holiday,
      holidayName: holiday ? holidayName(d) : undefined,
      future,
      kind: "present",
      workedSeconds: 0,
      onLeave: false,
    };

    if (weekend) return { ...base, kind: "weekend" };
    if (holiday) return { ...base, kind: "holiday" };
    if (future) return { ...base, kind: "future" };

    // Approved leave takes precedence over the generated work pattern.
    const leave = leaveMap.get(iso);
    if (leave) {
      const type = leaveTypeById(leave.leaveTypeId);
      const leaveFields = {
        onLeave: true,
        leaveTypeId: leave.leaveTypeId,
        leaveColor: type?.color ?? "#8B7CF6",
        leaveLabel: type?.name ?? "Leave",
        leaveHalfDay: leave.halfDay,
      };
      // A half-day leave means they worked the other half → always logged hours.
      // For full-day leaves, a deterministic subset still logs hours (the anomaly).
      const workedDespiteLeave = leave.halfDay || seed % 4 === 0;
      if (workedDespiteLeave) {
        const mode: AttendanceMode = seed % 3 === 0 ? "wfh" : "office";
        const workedSeconds = leave.halfDay
          ? 4 * HOUR + (seed % 40) * 60 // ~4h — the worked half
          : 3 * HOUR + (seed % 180) * 60; // 3–6h logged during a full-day leave
        return { ...base, ...leaveFields, kind: "leave-worked", mode, workedSeconds };
      }
      return { ...base, ...leaveFields, kind: "leave" };
    }

    // A normal working day — deterministic pattern.
    const r = seed % 100;
    if (r < 6) return { ...base, kind: "absent" };

    if (r < 12) {
      // Half day.
      const mode: AttendanceMode = seed % 4 === 0 ? "wfh" : "office";
      return { ...base, kind: "half-day", mode, workedSeconds: 4 * HOUR + (seed % 40) * 60 };
    }

    const isWfh = r < 34; // ~1 in 4 working days is WFH
    const mode: AttendanceMode = isWfh ? "wfh" : "office";
    const workedSeconds = 7 * HOUR + 30 * 60 + (seed % 150) * 60; // ~7.5–10h
    return { ...base, kind: isWfh ? "wfh" : "present", mode, workedSeconds };
  });
}

/** Roll-up totals for the month (for summary strip above the chart). */
export interface EmployeeMonthSummary {
  workedSeconds: number;
  officeDays: number;
  wfhDays: number;
  leaveDays: number; // full-day equivalents on approved leave
  leaveWorkedDays: number; // days logged hours despite being on leave
  absentDays: number;
}

export function summarizeEmployeeMonth(days: EmployeeDay[]): EmployeeMonthSummary {
  const s: EmployeeMonthSummary = {
    workedSeconds: 0,
    officeDays: 0,
    wfhDays: 0,
    leaveDays: 0,
    leaveWorkedDays: 0,
    absentDays: 0,
  };
  for (const d of days) {
    s.workedSeconds += d.workedSeconds;
    if (d.onLeave) s.leaveDays += d.leaveHalfDay ? 0.5 : 1;
    if (d.kind === "leave-worked") s.leaveWorkedDays += 1;
    if (d.kind === "absent") s.absentDays += 1;
    if (d.workedSeconds > 0) {
      if (d.mode === "wfh") s.wfhDays += 1;
      else s.officeDays += 1;
    }
  }
  return s;
}

/** "8h 15m" / "45m" for tooltips and summaries. */
export function formatWorkedHours(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.round((seconds % 3600) / 60);
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

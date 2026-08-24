import { differenceInCalendarDays, format, parseISO } from "date-fns";
import { MOCK_EMPLOYEES, type Employee } from "./orgData";
import { LEAVE_TYPES } from "./timeOffData";

/**
 * Home "today" reference — kept aligned with the Time Off mock data anchor
 * (see timeOffData) so return dates and holiday countdowns read sensibly in the
 * demo regardless of the wall clock.
 */
export const HOME_TODAY = "2026-08-06";
const TODAY = parseISO(HOME_TODAY);

const EMP_BY_ID = new Map(MOCK_EMPLOYEES.map((e) => [e.id, e]));
export function getEmployee(id: string): Employee | undefined {
  return EMP_BY_ID.get(id);
}

export function leaveColor(leaveTypeId: string): string {
  return LEAVE_TYPES.find((t) => t.id === leaveTypeId)?.color ?? "#93C5FD";
}
export function leaveName(leaveTypeId: string): string {
  return LEAVE_TYPES.find((t) => t.id === leaveTypeId)?.name ?? "Leave";
}
/** Accent color for the "working remotely today" attendance display. */
export const WFH_COLOR = "#7DD3FC";

export type DayPart = "Full day" | "Half day";

export interface OnLeaveEntry {
  employeeId: string;
  leaveTypeId: string;
  dayPart: DayPart;
  returnLabel: string;
}

export interface WfhEntry {
  employeeId: string;
  dayPart: DayPart;
  statusLabel?: string;
}

export interface NewJoinerEntry {
  employeeId: string;
  joinDate: string; // yyyy-MM-dd
}

export interface AnniversaryEntry {
  employeeId: string;
  years: number;
  /** True when the anniversary falls today. */
  today?: boolean;
}

export interface BirthdayEntry {
  employeeId: string;
  date: string; // yyyy-MM-dd
}

/* ── Curated "today" data for the demo ── */

export const ON_LEAVE_TODAY: OnLeaveEntry[] = [
  { employeeId: "prod1", leaveTypeId: "annual", dayPart: "Full day", returnLabel: "Back Mon, 10 Aug" },
  { employeeId: "hr1", leaveTypeId: "casual", dayPart: "Full day", returnLabel: "Back Fri, 8 Aug" },
  { employeeId: "sal1", leaveTypeId: "sick", dayPart: "Half day", returnLabel: "Back tomorrow" },
  { employeeId: "mkt1", leaveTypeId: "annual", dayPart: "Full day", returnLabel: "Back Wed, 12 Aug" },
  { employeeId: "des3", leaveTypeId: "casual", dayPart: "Half day", returnLabel: "Back tomorrow" },
  { employeeId: "mkt2", leaveTypeId: "sick", dayPart: "Full day", returnLabel: "Back Thu, 7 Aug" },
];

export const WFH_TODAY: WfhEntry[] = [
  { employeeId: "eng2", dayPart: "Full day", statusLabel: "Approved" },
  { employeeId: "des2", dayPart: "Full day", statusLabel: "Approved" },
  { employeeId: "eng3", dayPart: "Full day", statusLabel: "Approved" },
  { employeeId: "cto", dayPart: "Full day", statusLabel: "Approved" },
  { employeeId: "des1", dayPart: "Half day", statusLabel: "Approved" },
  { employeeId: "cmo", dayPart: "Half day" },
];

export const NEW_JOINERS: NewJoinerEntry[] = [
  { employeeId: "des3", joinDate: "2026-08-01" },
  { employeeId: "eng4", joinDate: "2026-07-28" },
  { employeeId: "mkt2", joinDate: "2026-07-15" },
];

export const WORK_ANNIVERSARIES: AnniversaryEntry[] = [
  { employeeId: "des1", years: 5, today: true },
  { employeeId: "eng3", years: 3, today: true },
  { employeeId: "cpo", years: 7, today: true },
  { employeeId: "cmo", years: 6, today: true },
  { employeeId: "hrhead", years: 4, today: true },
  { employeeId: "ceo", years: 8, today: true },
  { employeeId: "eng1", years: 3, today: true },
  { employeeId: "mkt1", years: 2, today: true },
  { employeeId: "des2", years: 1, today: true },
  { employeeId: "cto", years: 5, today: true },
];

export const UPCOMING_BIRTHDAYS: BirthdayEntry[] = [
  { employeeId: "eng2", date: "2026-08-06" },
  { employeeId: "cto", date: "2026-08-06" },
  { employeeId: "prod1", date: "2026-08-06" },
  { employeeId: "des2", date: "2026-08-06" },
  { employeeId: "hr1", date: "2026-08-06" },
  { employeeId: "mkt1", date: "2026-08-06" },
  { employeeId: "sal1", date: "2026-08-06" },
  { employeeId: "des3", date: "2026-08-06" },
  { employeeId: "eng4", date: "2026-08-06" },
  { employeeId: "mkt2", date: "2026-08-06" },
];

/* ── Formatting helpers ── */

export function formatJoinDate(iso: string): string {
  return format(parseISO(iso), "d MMM yyyy");
}

export interface HolidayMeta {
  dateLabel: string; // "15 Aug"
  dayName: string; // "Saturday"
  daysAway: number;
  awayLabel: string; // "Today" | "Tomorrow" | "3 days away"
}

export function holidayMeta(iso: string): HolidayMeta {
  const d = parseISO(iso);
  const daysAway = differenceInCalendarDays(d, TODAY);
  const awayLabel = daysAway <= 0 ? "Today" : daysAway === 1 ? "Tomorrow" : `${daysAway} days away`;
  return {
    dateLabel: format(d, "d MMM"),
    dayName: format(d, "EEEE"),
    daysAway,
    awayLabel,
  };
}

/** Upcoming holidays from today, soonest first, limited to `count`. */
export function upcomingHolidays<T extends { date: string; name: string }>(holidays: T[], count = 4): T[] {
  return holidays
    .filter((h) => differenceInCalendarDays(parseISO(h.date), TODAY) >= 0)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, count);
}

/* ── Workforce snapshot ── */

const ACTIVE_EMPLOYEES = MOCK_EMPLOYEES.filter((e) => e.status === "active");
export const WORKFORCE_TOTAL = ACTIVE_EMPLOYEES.length;
export const ON_LEAVE_COUNT = ON_LEAVE_TODAY.length;
export const WFH_COUNT = WFH_TODAY.length;
export const PRESENT_COUNT = Math.max(0, WORKFORCE_TOTAL - ON_LEAVE_COUNT - WFH_COUNT);

/* ── Recent activity feed ── */

export type ActivityKind = "joined" | "leave" | "wfh" | "project" | "timesheet" | "manager";

export interface ActivityItem {
  id: string;
  kind: ActivityKind;
  title: string;
  at: string; // relative label
}

export const RECENT_ACTIVITY: ActivityItem[] = [
  { id: "a1", kind: "joined", title: "Ali Karimi joined the Design team", at: "2h ago" },
  { id: "a2", kind: "leave", title: "Leave approved for Lena Fischer", at: "3h ago" },
  { id: "a3", kind: "wfh", title: "WFH approved for Mia Rossi", at: "5h ago" },
  { id: "a4", kind: "project", title: "Nadia Haddad assigned to Atlas Robotics", at: "Yesterday" },
  { id: "a5", kind: "timesheet", title: "Tomás Herrera submitted a timesheet", at: "Yesterday" },
  { id: "a6", kind: "manager", title: "Grace Kim now reports to Daniel Okafor", at: "2d ago" },
];

/* ── Team availability ── */

export type AvailStatus = "present" | "wfh" | "leave" | "holiday";

export const AVAIL_COLORS: Record<AvailStatus, string> = {
  present: "#34D399",
  wfh: "#7DD3FC",
  leave: "#F9A8D4",
  holiday: "#C4B5FD",
};

export const AVAIL_LABELS: Record<AvailStatus, string> = {
  present: "Present",
  wfh: "WFH",
  leave: "Leave",
  holiday: "Holiday",
};

export const TEAM_AVAILABILITY: { employeeId: string; status: AvailStatus }[] = [
  { employeeId: "eng1", status: "present" },
  { employeeId: "eng2", status: "wfh" },
  { employeeId: "eng3", status: "present" },
  { employeeId: "eng4", status: "present" },
  { employeeId: "cto", status: "present" },
  { employeeId: "cpo", status: "present" },
  { employeeId: "des1", status: "present" },
  { employeeId: "des2", status: "wfh" },
  { employeeId: "cmo", status: "wfh" },
  { employeeId: "prod1", status: "leave" },
  { employeeId: "hr1", status: "leave" },
  { employeeId: "sal1", status: "leave" },
  { employeeId: "mkt1", status: "present" },
  { employeeId: "hrhead", status: "holiday" },
];

/* ── Quick insights ── */

export const INSIGHTS = {
  attendancePct: Math.round(((PRESENT_COUNT + WFH_COUNT) / WORKFORCE_TOTAL) * 100),
  availabilityPct: Math.round((PRESENT_COUNT / WORKFORCE_TOTAL) * 100),
  /** Leave days taken per week (last 7 weeks) — sparkline. */
  leaveTrend: [4, 6, 5, 8, 6, 9, 7],
};

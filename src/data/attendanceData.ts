import {
  differenceInCalendarDays,
  eachDayOfInterval,
  endOfMonth,
  format,
  getDay,
  parseISO,
  startOfMonth,
} from "date-fns";
import { Briefcase, Building2, Home, type LucideIcon } from "lucide-react";
import { MOCK_EMPLOYEES, type Employee } from "./orgData";

/* ═══════════════════════════════════════════════════════════
   Attendance domain model — a Workforce Presence hub.
   All data is mock/front-end only (no backend, GPS, or camera).
   ═══════════════════════════════════════════════════════════ */

export type AttendanceMode = "office" | "wfh" | "client";
export type DayStatus =
  | "present"
  | "wfh"
  | "client"
  | "late"
  | "half-day"
  | "holiday"
  | "weekend"
  | "absent"
  | "leave";

export interface ModeConfig {
  id: AttendanceMode;
  label: string;
  short: string;
  color: string;
  icon: LucideIcon;
  /** Whether a live selfie is captured during check-in. */
  requiresSelfie: boolean;
  /** Whether a client must be picked. */
  requiresClient: boolean;
}

export const MODES: Record<AttendanceMode, ModeConfig> = {
  office: { id: "office", label: "Office", short: "Office", color: "#34D399", icon: Building2, requiresSelfie: false, requiresClient: false },
  wfh: { id: "wfh", label: "Work From Home", short: "WFH", color: "#38BDF8", icon: Home, requiresSelfie: true, requiresClient: false },
  client: { id: "client", label: "Client Visit", short: "Client", color: "#6366F1", icon: Briefcase, requiresSelfie: true, requiresClient: true },
};

export const MODE_LIST: ModeConfig[] = [MODES.office, MODES.wfh];

export interface StatusConfig {
  id: DayStatus;
  label: string;
  color: string;
}

export const STATUS: Record<DayStatus, StatusConfig> = {
  present: { id: "present", label: "Present", color: "#34D399" },
  wfh: { id: "wfh", label: "Work From Home", color: "#38BDF8" },
  client: { id: "client", label: "Client Visit", color: "#6366F1" },
  late: { id: "late", label: "Late", color: "#FB923C" },
  "half-day": { id: "half-day", label: "Half Day", color: "#FBBF24" },
  holiday: { id: "holiday", label: "Holiday", color: "#94A3B8" },
  weekend: { id: "weekend", label: "Weekend", color: "#64748B" },
  absent: { id: "absent", label: "Absent", color: "#F43F5E" },
  leave: { id: "leave", label: "On Leave", color: "#8B7CF6" },
};

export const STATUS_LEGEND: DayStatus[] = [
  "present", "wfh", "client", "late", "half-day", "holiday", "weekend", "absent",
];

/* ── Offices & clients ── */

export interface OfficeLocation {
  id: string;
  name: string;
  address: string;
  radiusMeters: number;
  lat: number;
  lng: number;
}

export const OFFICES: OfficeLocation[] = [
  { id: "hyd", name: "Hyderabad HQ", address: "Hitec City, Hyderabad", radiusMeters: 150, lat: 17.4485, lng: 78.3908 },
  { id: "blr", name: "Bengaluru Office", address: "Koramangala, Bengaluru", radiusMeters: 120, lat: 12.9352, lng: 77.6245 },
];

export const CLIENTS: { id: string; name: string; site: string }[] = [
  { id: "atlas", name: "Atlas Robotics", site: "Gachibowli, Hyderabad" },
  { id: "nimbus", name: "Nimbus Retail", site: "Madhapur, Hyderabad" },
  { id: "vertex", name: "Vertex Bank", site: "Financial District" },
];

/* ── Timeline events ── */

export type TimelineKind = "check-in" | "break-start" | "break-end" | "check-out";

export interface TimelineEvent {
  kind: TimelineKind;
  time: string; // "09:02 AM"
  label: string;
  detail?: string;
}

/* ── Rich attendance timeline bar (tracking table) ── */

export type SegmentKind = "work" | "break" | "wfh" | "client" | "missing" | "offline";

export const SEGMENT_COLORS: Record<SegmentKind, string> = {
  work: "#34D399",    // green — working
  break: "#FBBF24",   // yellow — break
  wfh: "#38BDF8",     // blue — work from home
  client: "#8B5CF6",  // purple — client visit
  missing: "#F43F5E", // red — missing checkout
  offline: "#CBD5E1", // grey — offline
};

export const SEGMENT_LABELS: Record<SegmentKind, string> = {
  work: "Working", break: "Break", wfh: "Work From Home",
  client: "Client Visit", missing: "Missing checkout", offline: "Offline",
};

export interface AttendanceSegment {
  kind: SegmentKind;
  /** 0–100 % across the working window. */
  start: number;
  end: number;
  time: string; // "09:05 AM – 01:00 PM"
}

/* ── Arrival status ── */

export type ArrivalStatus = "early" | "on-time" | "late" | "very-late" | "missed";

export const ARRIVAL_CONFIG: Record<ArrivalStatus, { label: string; color: string }> = {
  early: { label: "Early", color: "#10B981" },
  "on-time": { label: "On Time", color: "#34D399" },
  late: { label: "Late", color: "#FB923C" },
  "very-late": { label: "Very Late", color: "#F43F5E" },
  missed: { label: "Missed", color: "#94A3B8" },
};

/* ── Verification metadata (captured on check-in) ── */

export interface VerificationMeta {
  gps: boolean;
  photo: boolean;
  lat: number;
  lng: number;
  accuracy: number; // meters
  officeDistance: number; // meters
  address: string;
  /** IANA timezone captured from the device, e.g. "Asia/Kolkata (GMT+5:30)". */
  timezone: string;
  ip: string;
  browser: string;
  os: string;
  device: string;
  battery: number; // %
  mockLocation: boolean;
  selfieUrl?: string;
}

export function sampleVerification(mode: AttendanceMode, opts?: Partial<VerificationMeta>): VerificationMeta {
  const office = OFFICES[0];
  const base: VerificationMeta = {
    gps: true,
    photo: MODES[mode].requiresSelfie,
    lat: 17.4482,
    lng: 78.3912,
    accuracy: 8,
    officeDistance: mode === "office" ? 42 : 6200,
    address: mode === "office" ? office.address : mode === "wfh" ? "Banjara Hills, Hyderabad" : CLIENTS[0].site,
    timezone: "Asia/Kolkata (GMT+5:30)",
    ip: "103.21.58.14",
    browser: "Chrome 128",
    os: "macOS 15",
    device: "MacBook Pro",
    battery: 82,
    mockLocation: false,
    selfieUrl: MODES[mode].requiresSelfie ? "https://i.pravatar.cc/160?img=15" : undefined,
  };
  return { ...base, ...opts };
}

/* ── Monthly calendar (employee) ── */

export interface CalendarDay {
  date: string; // yyyy-MM-dd
  status: DayStatus;
  checkIn?: string;
  checkOut?: string;
  hours?: string;
  /** Effective (productive) hours, and gross (clocked) hours incl. breaks. */
  effectiveHours?: string;
  grossHours?: string;
  breakTime?: string;
  arrival?: ArrivalStatus;
  segments?: AttendanceSegment[];
  mode?: AttendanceMode;
  gps?: boolean;
  photo?: boolean;
}

const CHECK_INS = ["08:58 AM", "09:02 AM", "09:11 AM", "09:34 AM", "08:45 AM", "09:06 AM"];
const CHECK_OUTS = ["06:04 PM", "06:31 PM", "05:58 PM", "07:12 PM", "06:20 PM", "01:30 PM"];

/** "08h 24m" / "45m" ↔ minutes, for deriving gross = effective + break. */
function hmToMinutes(s?: string): number {
  if (!s) return 0;
  const h = /(\d+)\s*h/.exec(s);
  const m = /(\d+)\s*m/.exec(s);
  return (h ? parseInt(h[1], 10) * 60 : 0) + (m ? parseInt(m[1], 10) : 0);
}
function minutesToHM(min: number): string {
  return `${String(Math.floor(min / 60)).padStart(2, "0")}h ${String(min % 60).padStart(2, "0")}m`;
}

/** Deterministic status for a given day-of-month (stable across renders). */
function statusForDay(day: number, dow: number, isFuture: boolean, isToday: boolean): DayStatus {
  if (dow === 0 || dow === 6) return "weekend";
  if (isFuture) return "weekend" === "weekend" ? "weekend" : "weekend"; // placeholder replaced below
  // Sprinkle variety deterministically.
  if (day === 15) return "holiday";
  if (day % 11 === 0) return "leave";
  if (day % 5 === 0) return "wfh";
  if (day % 9 === 0) return "half-day";
  if (day % 6 === 0) return "late";
  if (day % 13 === 0) return "absent";
  return "present";
}

export function buildMonthCalendar(monthDate: Date, today: Date): CalendarDay[] {
  const start = startOfMonth(monthDate);
  const end = endOfMonth(monthDate);
  return eachDayOfInterval({ start, end }).map((d) => {
    const day = d.getDate();
    const dow = getDay(d);
    const iso = format(d, "yyyy-MM-dd");
    const diff = differenceInCalendarDays(d, today);
    const isFuture = diff > 0;
    const isToday = diff === 0;
    let status: DayStatus = statusForDay(day, dow, isFuture, isToday);
    if (isFuture) status = dow === 0 || dow === 6 ? "weekend" : "present"; // future days show as scheduled/empty
    const worked = ["present", "wfh", "client", "late", "half-day"].includes(status);
    const mode: AttendanceMode | undefined = status === "wfh" ? "wfh" : status === "client" ? "client" : worked ? "office" : undefined;
    const active = worked && !isFuture;
    const late = status === "late";
    const effectiveHours = active ? (status === "half-day" ? "04h 10m" : "08h 24m") : undefined;
    const breakTime = active ? "45m" : undefined;
    const grossHours = active ? minutesToHM(hmToMinutes(effectiveHours) + hmToMinutes(breakTime)) : undefined;
    const arrival: ArrivalStatus | undefined = active
      ? late
        ? day % 2 === 0 ? "late" : "very-late"
        : day % 3 === 0 ? "early" : "on-time"
      : undefined;
    return {
      date: iso,
      status: isFuture ? (dow === 0 || dow === 6 ? "weekend" : "present") : status,
      checkIn: active ? CHECK_INS[day % CHECK_INS.length] : undefined,
      checkOut: active ? (status === "half-day" ? "01:30 PM" : CHECK_OUTS[day % CHECK_OUTS.length]) : undefined,
      hours: effectiveHours,
      effectiveHours,
      breakTime,
      grossHours,
      arrival,
      segments: active ? buildSegments(status, mode, true, late, false) : undefined,
      mode,
      gps: active,
      photo: active && mode !== "office",
    };
  });
}

/* ── Team roster (admin) — today's presence ── */

export interface TeamMember {
  employee: Employee;
  managerName: string;
  status: DayStatus;
  mode?: AttendanceMode;
  checkIn?: string;
  checkOut?: string;
  hours?: string;
  /** Effective (productive) hours, break, and gross (clocked) hours. */
  effectiveHours?: string;
  breakTime?: string;
  grossHours?: string;
  arrival: ArrivalStatus;
  segments: AttendanceSegment[];
  gps: boolean;
  photo: boolean;
  address: string;
  lat: number;
  lng: number;
  accuracy: number; // meters
  battery: number;
  device: string;
  browser: string;
  notes?: string;
}

/** Deterministic rich timeline for the tracking table bar. */
function buildSegments(status: DayStatus, mode: AttendanceMode | undefined, checkedOut: boolean, late: boolean, missing: boolean): AttendanceSegment[] {
  if (status === "absent") return [{ kind: "offline", start: 0, end: 100, time: "No activity today" }];
  if (status === "leave") return [{ kind: "offline", start: 0, end: 100, time: "Approved leave" }];
  const workKind: SegmentKind = mode === "wfh" ? "wfh" : mode === "client" ? "client" : "work";
  const startPct = late ? 22 : 6;
  const startTime = late ? "10:12 AM" : "09:05 AM";
  const morningEnd = 46;
  const breakEnd = 54;
  const lastEnd = checkedOut ? 90 : 80;
  const segs: AttendanceSegment[] = [
    { kind: workKind, start: startPct, end: morningEnd, time: `${startTime} – 01:00 PM` },
    { kind: "break", start: morningEnd, end: breakEnd, time: "01:00 PM – 01:48 PM" },
    { kind: missing ? "missing" : workKind, start: breakEnd, end: lastEnd, time: missing ? "01:48 PM – no checkout" : checkedOut ? "01:48 PM – 06:34 PM" : "01:48 PM – ongoing" },
  ];
  return segs;
}

const empById = new Map(MOCK_EMPLOYEES.map((e) => [e.id, e]));
function nameOf(id?: string): string {
  return (id && empById.get(id)?.name) ?? "—";
}

/** Deterministic team presence derived from the org roster. */
export const TEAM_TODAY: TeamMember[] = MOCK_EMPLOYEES.filter((e) => e.status === "active").map((e, i) => {
  const cycle = i % 9;
  const status: DayStatus =
    cycle === 0 ? "wfh" :
    cycle === 1 ? "present" :
    cycle === 2 ? "late" :
    cycle === 3 ? "leave" :
    cycle === 4 ? "absent" :
    cycle === 5 ? "client" :
    "present";
  const worked = ["present", "wfh", "client", "late"].includes(status);
  const mode: AttendanceMode | undefined = status === "wfh" ? "wfh" : status === "client" ? "client" : worked ? "office" : undefined;
  const late = status === "late";
  const checkedOut = worked && (i % 5 === 2); // a subset have already clocked out
  const missing = worked && !checkedOut && i % 7 === 3; // a subset forgot to check out
  const checkIn = worked ? CHECK_INS[i % CHECK_INS.length] : undefined;
  const arrival: ArrivalStatus =
    !worked ? "missed" :
    late ? (i % 2 === 0 ? "late" : "very-late") :
    checkIn && (checkIn.startsWith("08:") ) ? "early" : "on-time";
  return {
    employee: e,
    managerName: nameOf(e.managerId),
    status,
    mode,
    checkIn,
    checkOut: checkedOut ? CHECK_OUTS[i % CHECK_OUTS.length] : undefined,
    hours: worked ? ["03h 20m", "05h 12m", "06h 40m", "02h 05m"][i % 4] : undefined,
    effectiveHours: worked ? ["03h 20m", "05h 12m", "06h 40m", "02h 05m"][i % 4] : undefined,
    breakTime: worked ? ["45m", "30m", "1h 05m", "20m"][i % 4] : undefined,
    grossHours: worked ? ["04h 05m", "05h 42m", "07h 45m", "02h 25m"][i % 4] : undefined,
    arrival,
    segments: buildSegments(status, mode, checkedOut, late, missing),
    gps: worked,
    photo: worked && mode !== "office",
    address:
      mode === "office" ? "Hitec City, Hyderabad" :
      mode === "wfh" ? ["Banjara Hills", "Kondapur", "Gachibowli"][i % 3] + ", Hyderabad" :
      mode === "client" ? CLIENTS[i % CLIENTS.length].site : "—",
    lat: 17.4482 + ((i % 5) - 2) * 0.006,
    lng: 78.3912 + ((i % 4) - 2) * 0.006,
    accuracy: worked ? [6, 8, 12, 18, 24][i % 5] : 0,
    battery: 40 + ((i * 7) % 60),
    device: ["MacBook Pro", "ThinkPad X1", "iPhone 15", "Pixel 8"][i % 4],
    browser: ["Chrome 128", "Safari 17", "Edge 128", "Firefox 129"][i % 4],
    notes: missing ? "System did not record a check-out event." : late ? "Arrived after grace period." : undefined,
  };
});

/** Count of members whose arrival matched a status today. */
export function countByArrival(a: ArrivalStatus): number {
  return TEAM_TODAY.filter((m) => m.arrival === a).length;
}

/** Count of members currently in a given attendance mode. */
export function countByMode(mode: AttendanceMode): number {
  return TEAM_TODAY.filter((m) => m.mode === mode).length;
}

/** Present = anyone who worked (present/wfh/client/late). */
export const PRESENT_TODAY = TEAM_TODAY.filter((m) => ["present", "wfh", "client", "late"].includes(m.status)).length;
export const WORKING_NOW = TEAM_TODAY.filter((m) => m.checkIn && !m.checkOut && m.status !== "leave" && m.status !== "absent").length;
export const CHECKED_OUT = TEAM_TODAY.filter((m) => m.checkOut).length;
export const MISSED_CHECKINS = TEAM_TODAY.filter((m) => m.status === "absent").length;

export function countByStatus(status: DayStatus): number {
  return TEAM_TODAY.filter((m) => m.status === status).length;
}

export const WORKFORCE_TOTAL = TEAM_TODAY.length;

/* ── Analytics (admin) ── */

export const OFFICE_WFH_TREND = [
  { label: "Mon", office: 12, wfh: 4, client: 2 },
  { label: "Tue", office: 14, wfh: 3, client: 1 },
  { label: "Wed", office: 10, wfh: 6, client: 3 },
  { label: "Thu", office: 12, wfh: 5, client: 2 },
  { label: "Fri", office: 8, wfh: 8, client: 1 },
];

export const MONTHLY_ATTENDANCE_PCT = [92, 94, 90, 96, 93, 97, 95, 91];

export const DEPARTMENT_ATTENDANCE = [
  { dept: "Engineering", pct: 96, color: "#7DD3FC" },
  { dept: "Product", pct: 93, color: "#6EE7B7" },
  { dept: "Design", pct: 91, color: "#F9A8D4" },
  { dept: "Marketing", pct: 88, color: "#FDBA74" },
  { dept: "Sales", pct: 90, color: "#C4B5FD" },
  { dept: "HR", pct: 98, color: "#93C5FD" },
];

/** 7×N heatmap intensity (0–4) for the attendance calendar heatmap. */
export const ATTENDANCE_HEATMAP: number[][] = Array.from({ length: 7 }, (_, r) =>
  Array.from({ length: 16 }, (_, c) => (r === 6 || r === 5 ? 0 : ((r + c * 3) % 5))),
);

/** Monthly attendance % trend (rolling year). */
export const MONTHLY_ATTENDANCE = [
  { label: "Jan", pct: 92 }, { label: "Feb", pct: 94 }, { label: "Mar", pct: 90 },
  { label: "Apr", pct: 96 }, { label: "May", pct: 93 }, { label: "Jun", pct: 97 },
  { label: "Jul", pct: 95 }, { label: "Aug", pct: 91 },
];

/** Weekly employee-arrival distribution. */
export const ARRIVAL_TREND = [
  { label: "Mon", early: 5, onTime: 7, late: 3 },
  { label: "Tue", early: 6, onTime: 6, late: 2 },
  { label: "Wed", early: 4, onTime: 8, late: 4 },
  { label: "Thu", early: 7, onTime: 5, late: 2 },
  { label: "Fri", early: 3, onTime: 9, late: 3 },
];

/** Weekly work-from-home headcount trend. */
export const WFH_WEEKLY_TREND = OFFICE_WFH_TREND.map((d) => ({ label: d.label, wfh: d.wfh }));

/* ── Leave analytics ── */

export interface LeaveBalance {
  label: string;
  used: number;
  total: number;
  color: string;
}

export const LEAVE_BALANCES: LeaveBalance[] = [
  { label: "Annual Leave", used: 8, total: 18, color: "#8B5CF6" },
  { label: "Casual Leave", used: 4, total: 12, color: "#38BDF8" },
  { label: "Sick Leave", used: 3, total: 10, color: "#FB923C" },
  { label: "Comp Off", used: 1, total: 5, color: "#34D399" },
];

export const LEAVE_REMAINING = LEAVE_BALANCES.reduce((s, b) => s + (b.total - b.used), 0);

export const LEAVE_TREND = [
  { label: "Apr", annual: 3, casual: 2, sick: 1 },
  { label: "May", annual: 2, casual: 1, sick: 2 },
  { label: "Jun", annual: 4, casual: 2, sick: 1 },
  { label: "Jul", annual: 1, casual: 3, sick: 2 },
  { label: "Aug", annual: 2, casual: 1, sick: 1 },
];

export const DEPARTMENT_LEAVE = [
  { dept: "Engineering", pct: 12, color: "#C4B5FD" },
  { dept: "Product", pct: 9, color: "#A5B4FC" },
  { dept: "Design", pct: 14, color: "#F9A8D4" },
  { dept: "Marketing", pct: 11, color: "#FDBA74" },
  { dept: "Sales", pct: 8, color: "#6EE7B7" },
  { dept: "HR", pct: 6, color: "#93C5FD" },
];

export const LEAVE_HEATMAP: number[][] = Array.from({ length: 7 }, (_, r) =>
  Array.from({ length: 16 }, (_, c) => (r === 6 ? 0 : (r + c * 2 + 1) % 5)),
);

/* ── Requests ── */

export type RequestType =
  | "leave"
  | "wfh"
  | "on-duty"
  | "correction"
  | "regularization"
  | "missed-checkout"
  | "missed-checkin"
  | "overtime"
  | "shift-change";

export const REQUEST_TYPES: { id: RequestType; label: string }[] = [
  { id: "leave", label: "Leave Requests" },
  { id: "wfh", label: "WFH Requests" },
  { id: "on-duty", label: "On Duty Requests" },
  { id: "correction", label: "Attendance Corrections" },
  { id: "regularization", label: "Regularization" },
  { id: "missed-checkout", label: "Missed Check-outs" },
  { id: "overtime", label: "Overtime Requests" },
  { id: "shift-change", label: "Shift Change Requests" },
  { id: "missed-checkin", label: "Missed Check In" },
];

export type RequestStatus = "pending" | "approved" | "rejected" | "sent-back";

export interface AttendanceRequest {
  id: string;
  employeeId: string;
  type: RequestType;
  date: string; // yyyy-MM-dd
  detail: string;
  reason: string;
  status: RequestStatus;
  createdAt: string;
  comment?: string;
}

export function requestTypeLabel(type: RequestType): string {
  return REQUEST_TYPES.find((t) => t.id === type)?.label ?? "Request";
}

/** Seed requests (admin queue draws from these). */
export const SEED_REQUESTS: AttendanceRequest[] = [
  { id: "ar1", employeeId: "eng4", type: "missed-checkout", date: "2026-08-18", detail: "Forgot to check out", reason: "Left for a client meeting and forgot to check out.", status: "pending", createdAt: "2026-08-19" },
  { id: "ar2", employeeId: "des2", type: "wfh", date: "2026-08-21", detail: "WFH — Full day", reason: "Home internet installation.", status: "pending", createdAt: "2026-08-19" },
  { id: "ar3", employeeId: "mkt1", type: "correction", date: "2026-08-17", detail: "Check-in 09:45 → 09:05", reason: "Biometric didn't register on entry.", status: "pending", createdAt: "2026-08-18" },
  { id: "ar4", employeeId: "eng3", type: "overtime", date: "2026-08-16", detail: "2h 15m overtime", reason: "Production incident support.", status: "pending", createdAt: "2026-08-17" },
  { id: "ar5", employeeId: "sal1", type: "regularization", date: "2026-08-15", detail: "Marked absent → present", reason: "Was on an approved client visit.", status: "pending", createdAt: "2026-08-16" },
  { id: "ar10", employeeId: "prod1", type: "leave", date: "2026-08-25", detail: "Annual leave — 2 days", reason: "Family function out of town.", status: "pending", createdAt: "2026-08-20" },
  { id: "ar11", employeeId: "des1", type: "on-duty", date: "2026-08-22", detail: "On duty — client site (Atlas)", reason: "On-site UX research session with the client.", status: "pending", createdAt: "2026-08-20" },
  { id: "ar12", employeeId: "eng2", type: "shift-change", date: "2026-08-23", detail: "Morning → Evening shift", reason: "Coordinating with the US team this week.", status: "pending", createdAt: "2026-08-20" },
  { id: "ar13", employeeId: "des3", type: "wfh", date: "2026-08-22", detail: "WFH — Half day", reason: "Doctor's appointment in the morning.", status: "pending", createdAt: "2026-08-20" },
  { id: "ar6", employeeId: "hr1", type: "missed-checkin", date: "2026-08-14", detail: "Missed check-in 09:00", reason: "Phone battery died in transit.", status: "approved", createdAt: "2026-08-14", comment: "Approved — verified with security log." },
  // Current employee (eng1) — shown under "My Requests".
  { id: "ar7", employeeId: "eng1", type: "correction", date: "2026-08-19", detail: "Check-out 05:40 → 06:35", reason: "System logged me out early during a deploy.", status: "pending", createdAt: "2026-08-19" },
  { id: "ar8", employeeId: "eng1", type: "wfh", date: "2026-08-12", detail: "WFH — Full day", reason: "Focus day for release planning.", status: "approved", createdAt: "2026-08-11", comment: "Approved." },
  { id: "ar9", employeeId: "eng1", type: "overtime", date: "2026-08-10", detail: "1h 30m overtime", reason: "On-call incident.", status: "rejected", createdAt: "2026-08-10", comment: "Please log via the on-call sheet instead." },
];

import { addDays, eachDayOfInterval, format, isWeekend, parseISO } from "date-fns";

export type RequestCategory = "leave" | "wfh";
export type DurationType = "full-day" | "half-day";
export type HalfDaySession = "first-half" | "second-half";
export type RequestStatus = "pending" | "approved" | "rejected" | "cancelled" | "changes-requested";

export interface LeaveType {
  id: string;
  name: string;
  color: string;
  /** Days allocated per year. Only meaningful when tracksBalance is true. */
  allocation: number;
  tracksBalance: boolean;
}

export interface RequestComment {
  id: string;
  authorId: string;
  text: string;
  at: string;
  action?: "comment" | "approved" | "rejected" | "changes-requested" | "cancelled";
}

/** Centralized Time Off request model (leave + work-from-home). */
export interface TimeOffRequest {
  id: string;
  employeeId: string;
  requestCategory: RequestCategory;
  leaveTypeId?: string;
  startDate: string; // yyyy-MM-dd
  endDate: string; // yyyy-MM-dd
  durationType: DurationType;
  halfDaySession?: HalfDaySession;
  reason: string;
  status: RequestStatus;
  approverIds: string[];
  /** Extra people to notify (CC) about this request. */
  notifyIds?: string[];
  attachmentUrl?: string;
  recurring?: boolean;
  createdAt: string;
  /** Working-day count (derived, excludes weekends/holidays; half-day = 0.5). */
  durationDays: number;
  comments: RequestComment[];
}

export const LEAVE_TYPES: LeaveType[] = [
  { id: "annual", name: "Annual Leave", color: "#8B7CF6", allocation: 20, tracksBalance: true },
  { id: "sick", name: "Sick Leave", color: "#F9A8D4", allocation: 10, tracksBalance: true },
  { id: "casual", name: "Casual Leave", color: "#FDBA74", allocation: 8, tracksBalance: true },
  { id: "comp-off", name: "Comp Off", color: "#6EE7B7", allocation: 3, tracksBalance: true },
  { id: "unpaid", name: "Unpaid Leave", color: "#C4B5FD", allocation: 0, tracksBalance: false },
  { id: "other", name: "Other", color: "#93C5FD", allocation: 0, tracksBalance: false },
];

export const WFH_COLOR = "#7DD3FC";
export const WFH_MONTHLY_ALLOWANCE = 8;

export const CURRENT_USER_ID = "eng1"; // Irfan Alisha (see orgData)

export interface Holiday {
  date: string; // yyyy-MM-dd
  name: string;
}

/** Default company holidays (seed; customizable by the Company Head). */
export const DEFAULT_HOLIDAYS: Holiday[] = [
  { date: "2026-08-15", name: "Independence Day" },
  { date: "2026-08-28", name: "Onam" },
  { date: "2026-10-02", name: "Gandhi Jayanti" },
  { date: "2026-10-20", name: "Diwali" },
  { date: "2026-12-25", name: "Christmas" },
];

// Live holiday lookup used by date helpers; kept in sync with the holiday store.
let holidayMap: Record<string, string> = Object.fromEntries(DEFAULT_HOLIDAYS.map((h) => [h.date, h.name]));

/** Update the holiday lookup used by isHoliday/holidayName/computeWorkingDays. */
export function syncHolidays(list: Holiday[]): void {
  holidayMap = Object.fromEntries(list.map((h) => [h.date, h.name]));
}

export function leaveTypeById(id?: string): LeaveType | undefined {
  return LEAVE_TYPES.find((t) => t.id === id);
}

export function isHoliday(date: Date): boolean {
  return format(date, "yyyy-MM-dd") in holidayMap;
}

export function holidayName(date: Date): string | undefined {
  return holidayMap[format(date, "yyyy-MM-dd")];
}

export function requestColor(req: TimeOffRequest): string {
  if (req.requestCategory === "wfh") return WFH_COLOR;
  return leaveTypeById(req.leaveTypeId)?.color ?? "#93C5FD";
}

export function requestLabel(req: TimeOffRequest): string {
  if (req.requestCategory === "wfh") return "Work From Home";
  return leaveTypeById(req.leaveTypeId)?.name ?? "Leave";
}

/** Working days in a range excluding weekends and holidays; half-day → 0.5. */
export function computeWorkingDays(start: string, end: string, durationType: DurationType): number {
  const s = parseISO(start);
  const e = parseISO(end);
  if (e < s) return 0;
  const days = eachDayOfInterval({ start: s, end: e }).filter((d) => !isWeekend(d) && !isHoliday(d));
  if (durationType === "half-day") return days.length > 0 ? 0.5 : 0;
  return days.length;
}

/** True if two inclusive date ranges overlap. */
export function rangesOverlap(aStart: string, aEnd: string, bStart: string, bEnd: string): boolean {
  return parseISO(aStart) <= parseISO(bEnd) && parseISO(bStart) <= parseISO(aEnd);
}

export interface BalanceRow {
  key: string;
  label: string;
  color: string;
  available: number;
  used: number;
  pending: number;
  total: number;
}

const ACTIVE_STATUSES: RequestStatus[] = ["approved", "pending", "changes-requested"];

/** Per-type balances for an employee, derived from allocations and their requests. */
export function computeBalances(employeeId: string, requests: TimeOffRequest[]): BalanceRow[] {
  const mine = requests.filter((r) => r.employeeId === employeeId);

  const rows: BalanceRow[] = LEAVE_TYPES.filter((t) => t.tracksBalance).map((t) => {
    const used = mine
      .filter((r) => r.leaveTypeId === t.id && r.status === "approved")
      .reduce((s, r) => s + r.durationDays, 0);
    const pending = mine
      .filter((r) => r.leaveTypeId === t.id && (r.status === "pending" || r.status === "changes-requested"))
      .reduce((s, r) => s + r.durationDays, 0);
    return {
      key: t.id,
      label: t.name,
      color: t.color,
      total: t.allocation,
      used,
      pending,
      available: Math.max(0, t.allocation - used - pending),
    };
  });

  // Work From Home (monthly notional allowance)
  const wfhUsed = mine.filter((r) => r.requestCategory === "wfh" && r.status === "approved").reduce((s, r) => s + r.durationDays, 0);
  const wfhPending = mine
    .filter((r) => r.requestCategory === "wfh" && (r.status === "pending" || r.status === "changes-requested"))
    .reduce((s, r) => s + r.durationDays, 0);
  rows.push({
    key: "wfh",
    label: "Work From Home",
    color: WFH_COLOR,
    total: WFH_MONTHLY_ALLOWANCE,
    used: wfhUsed,
    pending: wfhPending,
    available: Math.max(0, WFH_MONTHLY_ALLOWANCE - wfhUsed - wfhPending),
  });

  return rows;
}

/** Requests that block a new request (active statuses) for overlap checks. */
export function activeRequestsFor(employeeId: string, requests: TimeOffRequest[], excludeId?: string): TimeOffRequest[] {
  return requests.filter(
    (r) => r.employeeId === employeeId && r.id !== excludeId && ACTIVE_STATUSES.includes(r.status),
  );
}

function d(offsetFromToday: number): string {
  // App "today" reference is 2026-08-06 (see session context).
  return format(addDays(parseISO("2026-08-06"), offsetFromToday), "yyyy-MM-dd");
}

function mk(partial: Omit<TimeOffRequest, "durationDays" | "comments"> & { comments?: RequestComment[] }): TimeOffRequest {
  return {
    ...partial,
    durationDays: computeWorkingDays(partial.startDate, partial.endDate, partial.durationType),
    comments: partial.comments ?? [],
  };
}

export const MOCK_REQUESTS: TimeOffRequest[] = [
  mk({ id: "r1", employeeId: "eng1", requestCategory: "leave", leaveTypeId: "annual", startDate: d(7), endDate: d(9), durationType: "full-day", reason: "Family trip", status: "approved", approverIds: ["cto"], createdAt: d(-3),
    comments: [{ id: "c1", authorId: "cto", text: "Approved — enjoy!", at: d(-2), action: "approved" }] }),
  mk({ id: "r2", employeeId: "eng1", requestCategory: "wfh", startDate: d(1), endDate: d(1), durationType: "full-day", reason: "Home repairs", status: "pending", approverIds: ["cto"], createdAt: d(0) }),
  mk({ id: "r3", employeeId: "eng1", requestCategory: "leave", leaveTypeId: "sick", startDate: d(-10), endDate: d(-10), durationType: "full-day", reason: "Fever", status: "approved", approverIds: ["cto"], createdAt: d(-11) }),
  mk({ id: "r4", employeeId: "eng1", requestCategory: "leave", leaveTypeId: "casual", startDate: d(14), endDate: d(14), durationType: "half-day", halfDaySession: "first-half", reason: "Appointment", status: "pending", approverIds: ["cto"], createdAt: d(0) }),

  mk({ id: "r5", employeeId: "eng3", requestCategory: "leave", leaveTypeId: "annual", startDate: d(6), endDate: d(10), durationType: "full-day", reason: "Vacation", status: "approved", approverIds: ["eng1"], createdAt: d(-5) }),
  mk({ id: "r6", employeeId: "eng4", requestCategory: "wfh", startDate: d(2), endDate: d(3), durationType: "full-day", reason: "Deliveries", status: "pending", approverIds: ["eng1"], createdAt: d(0) }),
  mk({ id: "r7", employeeId: "eng4", requestCategory: "leave", leaveTypeId: "sick", startDate: d(8), endDate: d(9), durationType: "full-day", reason: "Recovery", status: "pending", approverIds: ["eng1"], createdAt: d(-1) }),
  mk({ id: "r8", employeeId: "eng5", requestCategory: "leave", leaveTypeId: "unpaid", startDate: d(7), endDate: d(11), durationType: "full-day", reason: "Personal", status: "approved", approverIds: ["eng1"], createdAt: d(-6) }),
  mk({ id: "r9", employeeId: "des1", requestCategory: "leave", leaveTypeId: "casual", startDate: d(4), endDate: d(4), durationType: "full-day", reason: "Errand", status: "approved", approverIds: ["cpo"], createdAt: d(-2) }),
  mk({ id: "r10", employeeId: "des2", requestCategory: "wfh", startDate: d(1), endDate: d(2), durationType: "full-day", reason: "Focus time", status: "approved", approverIds: ["des1"], createdAt: d(-2) }),
  mk({ id: "r11", employeeId: "mkt1", requestCategory: "leave", leaveTypeId: "annual", startDate: d(9), endDate: d(13), durationType: "full-day", reason: "Break", status: "pending", approverIds: ["cmo"], createdAt: d(-1) }),
  mk({ id: "r12", employeeId: "prod1", requestCategory: "leave", leaveTypeId: "annual", startDate: d(6), endDate: d(7), durationType: "full-day", reason: "Wedding", status: "approved", approverIds: ["cpo"], createdAt: d(-4) }),
  mk({ id: "r13", employeeId: "eng2", requestCategory: "wfh", startDate: d(0), endDate: d(0), durationType: "full-day", reason: "Remote", status: "approved", approverIds: ["cto"], createdAt: d(-1) }),
  mk({ id: "r14", employeeId: "sal1", requestCategory: "leave", leaveTypeId: "sick", startDate: d(-4), endDate: d(-3), durationType: "full-day", reason: "Flu", status: "rejected", approverIds: ["cmo"], createdAt: d(-6),
    comments: [{ id: "c2", authorId: "cmo", text: "Please share a medical note.", at: d(-5), action: "rejected" }] }),

  // Additional pending items so approvers see a fuller queue.
  mk({ id: "r15", employeeId: "prod1", requestCategory: "leave", leaveTypeId: "annual", startDate: d(12), endDate: d(15), durationType: "full-day", reason: "Family visit", status: "pending", approverIds: ["cpo"], createdAt: d(0) }),
  mk({ id: "r16", employeeId: "des2", requestCategory: "leave", leaveTypeId: "casual", startDate: d(5), endDate: d(5), durationType: "half-day", halfDaySession: "second-half", reason: "Appointment", status: "pending", approverIds: ["des1"], createdAt: d(0) }),
  mk({ id: "r17", employeeId: "hr1", requestCategory: "wfh", startDate: d(3), endDate: d(4), durationType: "full-day", reason: "Focus week", status: "pending", approverIds: ["hrhead"], createdAt: d(0) }),
  mk({ id: "r18", employeeId: "mkt2", requestCategory: "wfh", startDate: d(2), endDate: d(2), durationType: "full-day", reason: "Deliveries", status: "pending", approverIds: ["mkt1"], createdAt: d(0) }),
  mk({ id: "r19", employeeId: "cto", requestCategory: "wfh", startDate: d(1), endDate: d(1), durationType: "full-day", reason: "Offsite prep", status: "pending", approverIds: ["ceo"], createdAt: d(0) }),
];

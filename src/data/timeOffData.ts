import { addDays, eachDayOfInterval, format, isWeekend, parseISO } from "date-fns";

export type RequestCategory = "leave";
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

/** Centralized Time Off request model (leave). */
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

export const CURRENT_USER_ID = "eng1"; // Irfan Alisha (see orgData)

export interface Holiday {
  date: string; // yyyy-MM-dd
  name: string;
  /** Optional (restricted) holiday — employees may choose to avail it or not. */
  optional?: boolean;
}

/** Default company holidays (seed; customizable by the Company Head). */
export const DEFAULT_HOLIDAYS: Holiday[] = [
  { date: "2026-01-01", name: "New Year's Day" },
  { date: "2026-01-14", name: "Pongal / Makar Sankranti" },
  { date: "2026-01-15", name: "Pongal (Day 2)", optional: true },
  { date: "2026-01-26", name: "Republic Day" },
  { date: "2026-03-04", name: "Holi", optional: true },
  { date: "2026-03-19", name: "Ugadi", optional: true },
  { date: "2026-03-20", name: "Eid-ul-Fitar" },
  { date: "2026-04-03", name: "Good Friday" },
  { date: "2026-05-27", name: "Bakrid / Eid al-Adha", optional: true },
  { date: "2026-08-15", name: "Independence Day" },
  { date: "2026-08-28", name: "Onam", optional: true },
  { date: "2026-09-14", name: "Ganesh Chaturthi" },
  { date: "2026-10-02", name: "Gandhi Jayanti" },
  { date: "2026-10-20", name: "Diwali / Deepavali" },
  { date: "2026-10-21", name: "Vijaya Dashami" },
  { date: "2026-12-25", name: "Christmas" },
];

/* ─────────────── Location-wise holiday calendars ─────────────── */

/** A named holiday calendar, mapped to one or more office locations (a country). */
export interface HolidayCalendar {
  id: string;
  name: string;
  country: string;
  flag: string;         // emoji flag / glyph
  locations: string[];  // office cities that follow this calendar
  isDefault?: boolean;
  holidays: Holiday[];
}

// Country holiday seeds (2026). Kept intentionally lightweight for the prototype.
const US_HOLIDAYS: Holiday[] = [
  { date: "2026-01-01", name: "New Year's Day" },
  { date: "2026-01-19", name: "Martin Luther King Jr. Day" },
  { date: "2026-02-16", name: "Presidents' Day" },
  { date: "2026-05-25", name: "Memorial Day" },
  { date: "2026-06-19", name: "Juneteenth" },
  { date: "2026-07-03", name: "Independence Day (observed)" },
  { date: "2026-09-07", name: "Labor Day" },
  { date: "2026-11-11", name: "Veterans Day", optional: true },
  { date: "2026-11-26", name: "Thanksgiving" },
  { date: "2026-11-27", name: "Day after Thanksgiving", optional: true },
  { date: "2026-12-25", name: "Christmas Day" },
];

const UK_HOLIDAYS: Holiday[] = [
  { date: "2026-01-01", name: "New Year's Day" },
  { date: "2026-04-03", name: "Good Friday" },
  { date: "2026-04-06", name: "Easter Monday" },
  { date: "2026-05-04", name: "Early May Bank Holiday" },
  { date: "2026-05-25", name: "Spring Bank Holiday" },
  { date: "2026-08-31", name: "Summer Bank Holiday" },
  { date: "2026-12-25", name: "Christmas Day" },
  { date: "2026-12-28", name: "Boxing Day (substitute)" },
];

const DE_HOLIDAYS: Holiday[] = [
  { date: "2026-01-01", name: "Neujahr" },
  { date: "2026-04-03", name: "Karfreitag" },
  { date: "2026-04-06", name: "Ostermontag" },
  { date: "2026-05-01", name: "Tag der Arbeit" },
  { date: "2026-05-14", name: "Christi Himmelfahrt" },
  { date: "2026-05-25", name: "Pfingstmontag" },
  { date: "2026-10-03", name: "Tag der Deutschen Einheit" },
  { date: "2026-12-25", name: "Erster Weihnachtstag" },
  { date: "2026-12-26", name: "Zweiter Weihnachtstag" },
];

const AE_HOLIDAYS: Holiday[] = [
  { date: "2026-01-01", name: "New Year's Day" },
  { date: "2026-03-20", name: "Eid al-Fitr", optional: true },
  { date: "2026-05-27", name: "Eid al-Adha" },
  { date: "2026-12-02", name: "UAE National Day" },
  { date: "2026-12-03", name: "UAE National Day (Day 2)", optional: true },
];

const SG_HOLIDAYS: Holiday[] = [
  { date: "2026-01-01", name: "New Year's Day" },
  { date: "2026-02-17", name: "Chinese New Year" },
  { date: "2026-05-01", name: "Labour Day" },
  { date: "2026-08-09", name: "National Day" },
  { date: "2026-12-25", name: "Christmas Day" },
];

const JP_HOLIDAYS: Holiday[] = [
  { date: "2026-01-01", name: "New Year's Day" },
  { date: "2026-05-05", name: "Children's Day" },
  { date: "2026-07-20", name: "Marine Day" },
  { date: "2026-11-03", name: "Culture Day" },
  { date: "2026-12-23", name: "Emperor's Birthday", optional: true },
];

const GLOBAL_HOLIDAYS: Holiday[] = [
  { date: "2026-01-01", name: "New Year's Day" },
  { date: "2026-12-25", name: "Christmas Day" },
];

/** Seed calendars mapped to the demo org's real office cities. */
export const DEFAULT_CALENDARS: HolidayCalendar[] = [
  { id: "cal-in", name: "India", country: "India", flag: "🇮🇳", locations: ["Hyderabad"], isDefault: true, holidays: DEFAULT_HOLIDAYS },
  { id: "cal-us", name: "United States", country: "United States", flag: "🇺🇸", locations: ["San Francisco", "New York"], holidays: US_HOLIDAYS },
  { id: "cal-uk", name: "United Kingdom", country: "United Kingdom", flag: "🇬🇧", locations: ["London"], holidays: UK_HOLIDAYS },
  { id: "cal-de", name: "Germany", country: "Germany", flag: "🇩🇪", locations: ["Berlin", "Munich"], holidays: DE_HOLIDAYS },
  { id: "cal-ae", name: "UAE", country: "United Arab Emirates", flag: "🇦🇪", locations: ["Dubai"], holidays: AE_HOLIDAYS },
  { id: "cal-global", name: "Global", country: "All other locations", flag: "🌐", locations: [], holidays: GLOBAL_HOLIDAYS },
];

/** Presets offered when creating a new calendar. */
export interface CountryPreset { code: string; name: string; flag: string; holidays: Holiday[]; }
export const COUNTRY_PRESETS: CountryPreset[] = [
  { code: "IN", name: "India", flag: "🇮🇳", holidays: DEFAULT_HOLIDAYS },
  { code: "US", name: "United States", flag: "🇺🇸", holidays: US_HOLIDAYS },
  { code: "GB", name: "United Kingdom", flag: "🇬🇧", holidays: UK_HOLIDAYS },
  { code: "DE", name: "Germany", flag: "🇩🇪", holidays: DE_HOLIDAYS },
  { code: "AE", name: "United Arab Emirates", flag: "🇦🇪", holidays: AE_HOLIDAYS },
  { code: "SG", name: "Singapore", flag: "🇸🇬", holidays: SG_HOLIDAYS },
  { code: "JP", name: "Japan", flag: "🇯🇵", holidays: JP_HOLIDAYS },
  { code: "XX", name: "Blank calendar", flag: "🗓️", holidays: [] },
];

/** The calendar that applies to a given office location (falls back to default). */
export function calendarForLocation(calendars: HolidayCalendar[], location?: string): HolidayCalendar | undefined {
  if (!calendars.length) return undefined;
  const byLoc = location ? calendars.find((c) => c.locations.includes(location)) : undefined;
  return byLoc ?? calendars.find((c) => c.isDefault) ?? calendars[0];
}

/** Holidays that apply to a given office location. */
export function holidaysForLocation(calendars: HolidayCalendar[], location?: string): Holiday[] {
  return calendarForLocation(calendars, location)?.holidays ?? [];
}

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
  return leaveTypeById(req.leaveTypeId)?.color ?? "#93C5FD";
}

export function requestLabel(req: TimeOffRequest): string {
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
  mk({ id: "r3", employeeId: "eng1", requestCategory: "leave", leaveTypeId: "sick", startDate: d(-10), endDate: d(-10), durationType: "full-day", reason: "Fever", status: "approved", approverIds: ["cto"], createdAt: d(-11) }),
  mk({ id: "r4", employeeId: "eng1", requestCategory: "leave", leaveTypeId: "casual", startDate: d(14), endDate: d(14), durationType: "half-day", halfDaySession: "first-half", reason: "Appointment", status: "pending", approverIds: ["cto"], createdAt: d(0) }),

  mk({ id: "r5", employeeId: "eng3", requestCategory: "leave", leaveTypeId: "annual", startDate: d(6), endDate: d(10), durationType: "full-day", reason: "Vacation", status: "approved", approverIds: ["eng1"], createdAt: d(-5) }),
  mk({ id: "r7", employeeId: "eng4", requestCategory: "leave", leaveTypeId: "sick", startDate: d(8), endDate: d(9), durationType: "full-day", reason: "Recovery", status: "pending", approverIds: ["eng1"], createdAt: d(-1) }),
  mk({ id: "r8", employeeId: "eng5", requestCategory: "leave", leaveTypeId: "unpaid", startDate: d(7), endDate: d(11), durationType: "full-day", reason: "Personal", status: "approved", approverIds: ["eng1"], createdAt: d(-6) }),
  mk({ id: "r9", employeeId: "des1", requestCategory: "leave", leaveTypeId: "casual", startDate: d(4), endDate: d(4), durationType: "full-day", reason: "Errand", status: "approved", approverIds: ["cpo"], createdAt: d(-2) }),
  mk({ id: "r11", employeeId: "mkt1", requestCategory: "leave", leaveTypeId: "annual", startDate: d(9), endDate: d(13), durationType: "full-day", reason: "Break", status: "pending", approverIds: ["cmo"], createdAt: d(-1) }),
  mk({ id: "r12", employeeId: "prod1", requestCategory: "leave", leaveTypeId: "annual", startDate: d(6), endDate: d(7), durationType: "full-day", reason: "Wedding", status: "approved", approverIds: ["cpo"], createdAt: d(-4) }),
  mk({ id: "r14", employeeId: "sal1", requestCategory: "leave", leaveTypeId: "sick", startDate: d(-4), endDate: d(-3), durationType: "full-day", reason: "Flu", status: "rejected", approverIds: ["cmo"], createdAt: d(-6),
    comments: [{ id: "c2", authorId: "cmo", text: "Please share a medical note.", at: d(-5), action: "rejected" }] }),

  // Additional pending items so approvers see a fuller queue.
  mk({ id: "r15", employeeId: "prod1", requestCategory: "leave", leaveTypeId: "annual", startDate: d(12), endDate: d(15), durationType: "full-day", reason: "Family visit", status: "pending", approverIds: ["cpo"], createdAt: d(0) }),
  mk({ id: "r16", employeeId: "des2", requestCategory: "leave", leaveTypeId: "casual", startDate: d(5), endDate: d(5), durationType: "half-day", halfDaySession: "second-half", reason: "Appointment", status: "pending", approverIds: ["des1"], createdAt: d(0) }),
];

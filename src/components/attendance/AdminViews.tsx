"use client";

import { useMemo, useState } from "react";
import Drawer from "@mui/material/Drawer";
import MuiTextField from "@mui/material/TextField";
import MuiTooltip from "@mui/material/Tooltip";
import {
  ArrowRight, ArrowUpDown, Briefcase, CalendarDays,
  Check, CheckCircle2, ChevronDown, ChevronRight, ChevronUp, Clock, ClockAlert, Download,
  FileClock, Filter, Globe, Home, Hourglass, LogOut, MapPin,
  Palmtree, Radio, RotateCcw, Search, Send,
  Timer, TrendingUp, Users, X, type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { WebClockButton } from "@/components/home/WebClockButton";
import { ApplyWfhButton } from "./ApplyWfhButton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PersonAvatar } from "@/components/ui/person-avatar";
import { useAttendanceStore } from "@/store/attendanceStore";
import {
  BarList, GroupedBars, MapSurface, MetaRow, StatusPill, Timeline, TimelineBar, VerifyBadge,
} from "./shared";
import {
  ARRIVAL_CONFIG, DEPARTMENT_ATTENDANCE, LEAVE_TREND, MODES, MONTHLY_ATTENDANCE,
  OFFICE_WFH_TREND, PRESENT_TODAY, STATUS, TEAM_TODAY, WORKFORCE_TOTAL,
  countByMode, countByStatus, requestTypeLabel,
  type RequestStatus, type RequestType, type TeamMember, type TimelineEvent,
} from "@/data/attendanceData";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";

const OFFICE = "#34D399", WFH = "#38BDF8", LEAVE = "#8B5CF6", LATE = "#FB923C", ABSENT = "#F43F5E";

function statusColor(m: TeamMember): string {
  if (m.status === "absent") return ABSENT;
  if (m.status === "leave") return LEAVE;
  if (m.status === "late") return LATE;
  if (m.mode) return MODES[m.mode].color;
  return "#94A3B8";
}

/* ── minimal white panel ── */
function Panel({ title, sub, icon: Icon, color = "#7A4DFF", right, className, children }: {
  title?: string; sub?: string; icon?: LucideIcon; color?: string; right?: React.ReactNode; className?: string; children: React.ReactNode;
}) {
  return (
    <section className={cn("rounded-[20px] border border-border/[0.08] bg-surface p-5 shadow-[0_1px_3px_rgba(40,30,90,0.05)]", className)}>
      {title ? (
        <div className="mb-4 flex items-center gap-2.5">
          {Icon ? <span className="flex h-8 w-8 items-center justify-center rounded-[10px]" style={{ backgroundColor: `${color}18`, color }}><Icon className="h-4 w-4" strokeWidth={2} /></span> : null}
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-[15px] font-semibold text-text">{title}</h3>
            {sub ? <p className="truncate text-xs text-text-tertiary">{sub}</p> : null}
          </div>
          {right}
        </div>
      ) : null}
      {children}
    </section>
  );
}

/* ── Section heading ── */
function SectionHeading({ title, sub, action }: { title: string; sub?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-4 flex items-end justify-between gap-3">
      <div className="min-w-0">
        <h2 className="text-base font-semibold tracking-tight text-text">{title}</h2>
        {sub ? <p className="mt-0.5 text-xs text-text-tertiary">{sub}</p> : null}
      </div>
      {action}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   DASHBOARD — workforce command center (5 focused sections)
   ═══════════════════════════════════════════════════════════ */

const TIMELINE_LEGEND: { label: string; color: string }[] = [
  { label: "Working", color: "#34D399" },
  { label: "Work From Home", color: "#38BDF8" },
  { label: "Break", color: "#FBBF24" },
  { label: "Missing checkout", color: "#F43F5E" },
];

const LIVE_COLS = "grid grid-cols-[minmax(150px,1.4fr)_minmax(150px,200px)_80px_72px_80px_96px] items-center gap-4";

/* ── Today's Attendance Overview — minimal HRMS snapshot (reused on Home) ── */
export function AttendanceOverviewCard({ onOpenTracking, className }: { onOpenTracking?: () => void; className?: string }) {
  const total = WORKFORCE_TOTAL;
  const present = PRESENT_TODAY;
  const presentPct = total ? Math.round((present / total) * 100) : 0;
  const wfh = countByMode("wfh");
  const leave = countByStatus("leave");
  const late = countByStatus("late");
  // On-site & on-time — office mode excludes late arrivals so buckets stay distinct.
  const office = Math.max(0, countByMode("office") - late);

  // Mutually-exclusive workforce status (sums to today's present + leave).
  const statusItems = [
    { label: "Office", value: office, color: OFFICE },
    { label: "Work From Home", value: wfh, color: WFH },
    { label: "On Leave", value: leave, color: LEAVE },
    { label: "Late", value: late, color: LATE },
  ];

  return (
    <section className={cn("rounded-[20px] border border-border/[0.08] bg-surface p-6 shadow-[0_1px_3px_rgba(40,30,90,0.05)] sm:p-7", className)}>
      <div className="mb-6 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-base font-semibold tracking-tight text-text">Today&apos;s Attendance Overview</h2>
          <p className="mt-0.5 text-xs text-text-tertiary">{format(new Date(), "EEEE, d MMMM yyyy")}</p>
        </div>
        <Button variant="outline" size="sm" className="shrink-0 gap-1.5" onClick={onOpenTracking}>Open Tracking <ArrowRight className="h-3.5 w-3.5" /></Button>
      </div>

      <div className="grid gap-8 lg:grid-cols-[240px_1fr] lg:gap-12">
        {/* Left — attendance health */}
        <div className="flex items-center gap-5">
          <Ring pct={presentPct} color={OFFICE} label={`${presentPct}%`} size={96} thickness={8} />
          <div>
            <p className="text-sm font-semibold text-text">Present Today</p>
            <p className="mt-1.5 text-2xl font-bold leading-none tabular-nums text-text">
              {present} <span className="text-base font-medium text-text-tertiary">/ {total}</span>
            </p>
            <p className="mt-1 text-xs text-text-tertiary">employees</p>
          </div>
        </div>

        {/* Right — workforce status */}
        <div className="lg:border-l lg:border-border/[0.07] lg:pl-12">
          <p className="mb-4 text-[11px] font-semibold uppercase tracking-wide text-text-tertiary">Workforce Status</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {statusItems.map((s) => {
              const pct = total ? Math.round((s.value / total) * 100) : 0;
              return (
                <div key={s.label} className="flex items-center gap-3 rounded-[14px] border border-border/[0.07] bg-surface-2/50 px-4 py-3">
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: s.color }} aria-hidden />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-text">{s.label}</p>
                    <p className="text-xs text-text-tertiary">{s.value} {s.value === 1 ? "employee" : "employees"}</p>
                  </div>
                  <span className="text-sm font-semibold tabular-nums text-text-secondary">{pct}%</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-border/[0.06] pt-3.5 text-xs text-text-tertiary">
        <span className="font-medium text-text-secondary">{total} Total Employees</span>
        <span aria-hidden>•</span>
        <span>Updated 2 mins ago</span>
      </div>
    </section>
  );
}

export function AdminDashboard({ onNavigate }: { onNavigate?: (tab: string) => void }) {
  // Employees with recorded activity today — those "on the clock" surface first.
  const liveRows = TEAM_TODAY.filter((m) => m.checkIn).slice(0, 8);

  return (
    <div className="space-y-6">
      {/* Attendance Analytics */}
      <section>
        <SectionHeading title="Attendance Analytics" sub="Trends across recent periods" />
        <div className="grid gap-4 lg:grid-cols-2">
          <Panel title="Attendance Trend" icon={TrendingUp} color={WFH}>
            <GroupedBars data={OFFICE_WFH_TREND} keys={[
              { key: "office", color: OFFICE, label: "Office" },
              { key: "wfh", color: WFH, label: "WFH" },
              { key: "client", color: "#6366F1", label: "Client Visit" },
            ]} />
          </Panel>
          <Panel title="Leave Trend" sub="Days taken per month by leave type" icon={Palmtree} color={LEAVE}>
            <GroupedBars data={LEAVE_TREND} keys={[
              { key: "annual", color: "#8B5CF6", label: "Annual" },
              { key: "casual", color: "#38BDF8", label: "Casual" },
              { key: "sick", color: "#FB923C", label: "Sick" },
            ]} />
          </Panel>
          <Panel title="Department Attendance" icon={Users} color="#6EE7B7">
            <BarList items={DEPARTMENT_ATTENDANCE.map((d) => ({ label: d.dept, pct: d.pct, color: d.color }))} />
          </Panel>
          <Panel title="Monthly Attendance %" icon={CalendarDays} color="#7A4DFF">
            <GroupedBars data={MONTHLY_ATTENDANCE} max={100} keys={[{ key: "pct", color: "#7A4DFF", label: "Attendance %" }]} />
          </Panel>
        </div>
      </section>

      {/* 3 — Live Workforce (table) */}
      <Panel
        title="Live Workforce"
        sub="Today's attendance, hours & arrival"
        icon={Radio}
        color="#34D399"
        right={
          <button type="button" onClick={() => onNavigate?.("tracking")} className="inline-flex shrink-0 items-center gap-1 rounded-[10px] px-2.5 py-1.5 text-xs font-semibold text-primary-700 hover:bg-[rgba(122,77,255,0.08)]">
            View all <ArrowRight className="h-3.5 w-3.5" />
          </button>
        }
      >
        <div className="mb-4 flex flex-wrap gap-x-4 gap-y-1.5">
          {TIMELINE_LEGEND.map((l) => (
            <span key={l.label} className="inline-flex items-center gap-1.5 text-[11px] text-text-secondary">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: l.color }} />
              {l.label}
            </span>
          ))}
        </div>

        <div className="overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="min-w-[760px]">
            {/* header */}
            <div className={cn(LIVE_COLS, "border-b border-border/[0.08] pb-2 text-[11px] font-medium uppercase tracking-wide text-text-tertiary")}>
              <span>Employee</span>
              <span>Attendance</span>
              <span className="text-right">Effective</span>
              <span className="text-right">Break</span>
              <span className="text-right">Gross</span>
              <span className="text-right">Arrival</span>
            </div>

            {/* rows */}
            <div className="divide-y divide-border/[0.05]">
              {liveRows.map((m) => {
                const arr = ARRIVAL_CONFIG[m.arrival];
                return (
                  <div key={m.employee.id} className={cn(LIVE_COLS, "py-2.5")}>
                    <div className="flex min-w-0 items-center gap-2.5">
                      <PersonAvatar name={m.employee.name} src={m.employee.avatarUrl} size={30} />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-text">{m.employee.name}</p>
                        <p className="truncate text-[11px] text-text-tertiary">{m.employee.department}</p>
                      </div>
                    </div>
                    <TimelineBar segments={m.segments} height={8} />
                    <span className="text-right text-sm tabular-nums text-text">{m.effectiveHours ?? "—"}</span>
                    <span className="text-right text-sm tabular-nums text-text-secondary">{m.breakTime ?? "—"}</span>
                    <span className="text-right text-sm tabular-nums text-text">{m.grossHours ?? "—"}</span>
                    <span className="flex justify-end">
                      <span className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium" style={{ backgroundColor: `${arr.color}18`, color: arr.color }}>
                        <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: arr.color }} />
                        {arr.label}
                      </span>
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </Panel>
    </div>
  );
}

/* ── Single-value progress ring (present %) ── */
function Ring({ pct, color, label, sub, size = 128, thickness = 12 }: {
  pct: number; color: string; label: string; sub?: string; size?: number; thickness?: number;
}) {
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  const len = (Math.max(0, Math.min(100, pct)) / 100) * c;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgb(var(--border-rgb)/0.12)" strokeWidth={thickness} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={thickness} strokeLinecap="round" strokeDasharray={`${len} ${c - len}`} className="transition-[stroke-dasharray] duration-700" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold leading-none text-text">{label}</span>
        {sub ? <span className="mt-0.5 text-[11px] font-medium text-text-tertiary">{sub}</span> : null}
      </div>
    </div>
  );
}


/* ── Hero (matches Home / Tracker gradient) — persistent workspace header ── */
export function AttendanceHero({ present, wfh, client, leave, late }: {
  present: number; wfh: number; client: number; leave: number; late: number;
}) {
  const stats = [
    { label: "Present", value: present, color: "#34D399" },
    { label: "Work From Home", value: wfh, color: "#7DD3FC" },
    { label: "Client Visit", value: client, color: "#A5B4FC" },
    { label: "On Leave", value: leave, color: "#C4B5FD" },
    { label: "Late", value: late, color: "#FDBA74" },
  ];
  return (
    <section className="relative overflow-hidden rounded-[28px] bg-hero px-6 py-7 text-white shadow-[0_30px_80px_-32px_rgba(49,46,129,0.65)] sm:px-8 sm:py-8">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -right-16 -top-24 h-72 w-72 rounded-full bg-[#B197FF]/30 blur-[90px]" />
        <div className="absolute right-1/3 top-1/2 h-64 w-64 rounded-full bg-[#5B8DEF]/25 blur-[90px]" />
        <div className="absolute -bottom-24 left-1/4 h-64 w-64 rounded-full bg-[#7A4DFF]/25 blur-[90px]" />
        <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, #fff 1px, transparent 0)", backgroundSize: "22px 22px" }} />
      </div>
      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-[26px] font-semibold leading-tight tracking-tight sm:text-[30px]">Attendance</h1>
          <p className="mt-1.5 max-w-md text-sm text-white/65">Monitor today&apos;s workforce, attendance activity, and exceptions.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <WebClockButton />
          <ApplyWfhButton />
        </div>
      </div>

      <div className="relative mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {stats.map((s) => (
          <div key={s.label} className="rounded-[16px] border border-white/10 bg-white/[0.08] px-4 py-3.5 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: s.color }} aria-hidden />
              <p className="text-xs font-medium text-white/70">{s.label}</p>
            </div>
            <p className="mt-2 text-3xl font-bold leading-none tabular-nums text-white">{s.value}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   APPROVALS — central approval workspace (8 categories)
   ═══════════════════════════════════════════════════════════ */

const empName = (id: string) => TEAM_TODAY.find((m) => m.employee.id === id)?.employee.name ?? id;
const empAvatar = (id: string) => TEAM_TODAY.find((m) => m.employee.id === id)?.employee.avatarUrl;
const empDept = (id: string) => TEAM_TODAY.find((m) => m.employee.id === id)?.employee.department ?? "";

// Column grid for the requests table (mirrors Live Workforce layout).
const REQ_COLS = "grid grid-cols-[minmax(140px,1.4fr)_minmax(150px,1.8fr)_78px_186px] items-center gap-3";

const CATEGORY_ICON: Record<RequestType, LucideIcon> = {
  leave: Palmtree, wfh: Home, "on-duty": Briefcase, correction: FileClock,
  regularization: RotateCcw, "missed-checkout": LogOut, overtime: Timer,
  "shift-change": Clock, "missed-checkin": ClockAlert,
};

// Attendance-log request types only — leave & WFH approvals live in the Time Off module.
const APPROVAL_CATEGORIES: RequestType[] = [
  "regularization", "correction", "missed-checkin",
];

const REQ_STATUS_COLOR: Record<string, string> = { pending: LATE, approved: OFFICE, rejected: ABSENT, "sent-back": LEAVE };

export function AdminApprovals() {
  const requests = useAttendanceStore((s) => s.requests);
  const decide = useAttendanceStore((s) => s.decideRequest);
  const [cat, setCat] = useState<RequestType>("regularization");
  const [detail, setDetail] = useState<string | null>(null);
  const [comment, setComment] = useState("");

  const pendingFor = (t: RequestType) => requests.filter((r) => r.status === "pending" && r.type === t).length;
  const list = requests.filter((r) => r.type === cat);
  const active = requests.find((r) => r.id === detail) ?? null;
  const totalPending = requests.filter((r) => r.status === "pending" && APPROVAL_CATEGORIES.includes(r.type)).length;

  function act(id: string, status: RequestStatus, c?: string) {
    decide(id, status, c);
    const verb = status === "approved" ? "Approved" : status === "rejected" ? "Rejected" : "Sent back";
    toast.success(`${verb} · ${empName(requests.find((r) => r.id === id)?.employeeId ?? "")}`);
    setDetail(null); setComment("");
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[264px_1fr]">
      {/* Category rail */}
      <nav className="rounded-[20px] border border-border/[0.08] bg-surface p-2 shadow-[0_1px_3px_rgba(40,30,90,0.05)] lg:self-start">
        <div className="flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {APPROVAL_CATEGORIES.map((t) => {
            const Icon = CATEGORY_ICON[t];
            const active = cat === t;
            const count = pendingFor(t);
            return (
              <button
                key={t}
                type="button"
                onClick={() => setCat(t)}
                className={cn(
                  "flex shrink-0 items-center gap-2.5 rounded-[13px] px-3 py-2.5 text-left text-sm font-medium transition-colors lg:w-full",
                  active ? "bg-[rgba(122,77,255,0.1)] text-primary-700" : "text-text-secondary hover:bg-surface-2 hover:text-text",
                )}
              >
                <Icon className="h-4 w-4 shrink-0" strokeWidth={2} />
                <span className="truncate">{requestTypeLabel(t)}</span>
                {count > 0 ? (
                  <span className={cn("ml-auto rounded-full px-1.5 py-0.5 text-[10px] font-bold tabular-nums", active ? "bg-primary-700 text-white" : "bg-surface-2 text-text-tertiary")}>{count}</span>
                ) : null}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Request list */}
      <Panel title={requestTypeLabel(cat)} sub={`${pendingFor(cat)} pending · ${totalPending} total pending`} icon={CATEGORY_ICON[cat]} color="#7A4DFF">
        {list.length === 0 ? (
          <p className="py-10 text-center text-sm text-text-tertiary">No {requestTypeLabel(cat).toLowerCase()} right now.</p>
        ) : (
          <div className="overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div className="min-w-[600px]">
              {/* header */}
              <div className={cn(REQ_COLS, "border-b border-border/[0.08] pb-2 text-[11px] font-medium uppercase tracking-wide text-text-tertiary")}>
                <span>Employee</span>
                <span>Request</span>
                <span>Date</span>
                <span className="text-right">Action</span>
              </div>

              {/* rows */}
              <div className="divide-y divide-border/[0.05]">
                {list.map((r) => (
                  <div key={r.id} className={cn(REQ_COLS, "py-2.5")}>
                    <div className="flex min-w-0 items-center gap-2.5">
                      <PersonAvatar name={empName(r.employeeId)} src={empAvatar(r.employeeId)} size={30} />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-text">{empName(r.employeeId)}</p>
                        <p className="truncate text-[11px] text-text-tertiary">{empDept(r.employeeId)}</p>
                      </div>
                    </div>
                    <p className="min-w-0 truncate text-sm text-text-secondary">{r.detail}</p>
                    <span className="text-sm tabular-nums text-text-secondary">{format(parseISO(r.date), "d MMM")}</span>
                    <span className="flex justify-end">
                      {r.status === "pending" ? (
                        <span className="flex items-center gap-1.5">
                          <button type="button" onClick={() => { setDetail(r.id); setComment(""); }} className="hidden rounded-[9px] border border-border/[0.1] px-2.5 py-1.5 text-xs font-semibold text-text-secondary hover:bg-surface-2 lg:inline-flex">Details</button>
                          <button type="button" onClick={() => act(r.id, "approved")} aria-label="Approve" className="flex h-8 w-8 items-center justify-center rounded-[9px] bg-[#34D39922] text-[#0F9E6E] hover:bg-[#34D39933]"><Check className="h-4 w-4" strokeWidth={2.5} /></button>
                          <button type="button" onClick={() => act(r.id, "rejected")} aria-label="Reject" className="flex h-8 w-8 items-center justify-center rounded-[9px] bg-[#F43F5E1A] text-[#E11D48] hover:bg-[#F43F5E2E]"><X className="h-4 w-4" strokeWidth={2.5} /></button>
                          <button type="button" onClick={() => { setDetail(r.id); setComment(""); }} aria-label="Send back with comment" className="flex h-8 w-8 items-center justify-center rounded-[9px] bg-[#8B7CF61A] text-[#7C3AED] hover:bg-[#8B7CF62E]"><RotateCcw className="h-4 w-4" strokeWidth={2.2} /></button>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize" style={{ color: REQ_STATUS_COLOR[r.status], backgroundColor: `${REQ_STATUS_COLOR[r.status]}1F` }}>{r.status.replace("-", " ")}</span>
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <Drawer anchor="right" open={active !== null} onClose={() => setDetail(null)} slotProps={{ paper: { sx: { width: 400, maxWidth: "100vw", backgroundImage: "none" } } }}>
          {active ? (
            <div className="flex h-full flex-col p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-base font-semibold text-text">Review request</h2>
                <button type="button" onClick={() => setDetail(null)} aria-label="Close" className="flex h-8 w-8 items-center justify-center rounded-lg text-text-tertiary hover:bg-surface-2"><X className="h-4 w-4" /></button>
              </div>
              <div className="flex items-center gap-3 rounded-[14px] border border-border/[0.06] bg-surface-2/40 p-3">
                <PersonAvatar name={empName(active.employeeId)} src={empAvatar(active.employeeId)} size={40} />
                <div><p className="text-sm font-semibold text-text">{empName(active.employeeId)}</p><p className="text-xs text-text-tertiary">{requestTypeLabel(active.type)} · {format(parseISO(active.date), "d MMM")}</p></div>
              </div>
              <div className="mt-3 space-y-2.5">
                <MetaRow icon={Clock} label="Detail" value={active.detail} />
                <div className="rounded-[12px] bg-surface-2/40 p-3 text-sm text-text-secondary">{active.reason}</div>
              </div>
              <div className="mt-4">
                <label className="mb-1.5 block text-xs font-medium text-text-secondary">Comment to employee</label>
                <MuiTextField value={comment} onChange={(e) => setComment(e.target.value)} multiline minRows={3} fullWidth placeholder="Add a note…" sx={{ "& .MuiOutlinedInput-root": { borderRadius: "12px" } }} />
              </div>
              <div className="mt-auto flex flex-col gap-2 pt-4">
                <div className="flex gap-2">
                  <Button className="flex-1" onClick={() => act(active.id, "approved", comment)}>Approve</Button>
                  <Button variant="outline" className="flex-1 text-[#E11D48]" onClick={() => act(active.id, "rejected", comment)}>Reject</Button>
                </div>
                <Button variant="outline" className="gap-1.5" onClick={() => act(active.id, "sent-back", comment)}><Send className="h-4 w-4" /> Send back for changes</Button>
              </div>
            </div>
          ) : null}
        </Drawer>
      </Panel>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   ATTENDANCE TRACKING — Keka-style operational workspace
   ═══════════════════════════════════════════════════════════ */

type TrackSort = "name" | "department" | "arrival" | "status" | "gross";

export function AdminTracking() {
  const [search, setSearch] = useState("");
  const [dept, setDept] = useState("all");
  const [manager, setManager] = useState("all");
  const [mode, setMode] = useState("all");
  const [status, setStatus] = useState("all");
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [sort, setSort] = useState<{ key: TrackSort; dir: "asc" | "desc" }>({ key: "name", dir: "asc" });
  const [quick, setQuick] = useState<TeamMember | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const activeFilters = [dept, manager, mode, status].filter((v) => v !== "all").length;
  const clearFilters = () => { setDept("all"); setManager("all"); setMode("all"); setStatus("all"); };

  const depts = useMemo(() => ["all", ...Array.from(new Set(TEAM_TODAY.map((m) => m.employee.department)))], []);
  const managers = useMemo(() => ["all", ...Array.from(new Set(TEAM_TODAY.map((m) => m.managerName).filter((n) => n !== "—")))], []);

  const rows = useMemo(() => {
    const filtered = TEAM_TODAY.filter((m) => {
      if (dept !== "all" && m.employee.department !== dept) return false;
      if (manager !== "all" && m.managerName !== manager) return false;
      if (mode !== "all" && m.mode !== mode) return false;
      if (status !== "all" && m.status !== status) return false;
      if (search && !m.employee.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
    const dir = sort.dir === "asc" ? 1 : -1;
    const val = (m: TeamMember): string => {
      switch (sort.key) {
        case "name": return m.employee.name;
        case "department": return m.employee.department;
        case "arrival": return ARRIVAL_CONFIG[m.arrival].label;
        case "status": return STATUS[m.status].label;
        case "gross": return m.grossHours ?? "~";
      }
    };
    return [...filtered].sort((a, b) => val(a).localeCompare(val(b)) * dir);
  }, [dept, manager, mode, status, search, sort]);

  const toggleSort = (key: TrackSort) =>
    setSort((s) => (s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" }));

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="space-y-3">
        <div className="flex items-center gap-2.5">
          <div className="relative min-w-[180px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search employee…" className="h-11 w-full rounded-[14px] border border-border/[0.1] bg-surface pl-9 pr-3 text-sm text-text placeholder:text-text-tertiary focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400/20" />
          </div>
          <button
            type="button"
            onClick={() => setFiltersOpen((o) => !o)}
            aria-expanded={filtersOpen}
            className={cn(
              "inline-flex h-11 shrink-0 items-center gap-2 rounded-[14px] border px-4 text-sm font-medium transition-colors",
              filtersOpen || activeFilters > 0
                ? "border-primary-400/40 bg-primary-400/10 text-primary-600"
                : "border-border/[0.1] bg-surface text-text-secondary hover:text-text",
            )}
          >
            <Filter className="h-4 w-4" />
            Filters
            {activeFilters > 0 ? (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary-500 px-1 text-[11px] font-semibold text-white">{activeFilters}</span>
            ) : null}
            <ChevronDown className={cn("h-4 w-4 transition-transform", filtersOpen && "rotate-180")} />
          </button>
          <Button variant="outline" className="h-11 shrink-0 gap-1.5" onClick={() => toast.success("Attendance log exported (CSV)")}> <Download className="h-4 w-4" /> Export</Button>
        </div>

        {/* Collapsible filter panel */}
        {filtersOpen ? (
          <div className="flex flex-wrap items-center gap-2.5 rounded-[16px] border border-border/[0.08] bg-surface-2/40 p-3">
            <FilterSelect value={dept} onChange={setDept} options={depts.map((d) => ({ value: d, label: d === "all" ? "All departments" : d }))} />
            <FilterSelect value={manager} onChange={setManager} options={managers.map((m) => ({ value: m, label: m === "all" ? "All managers" : m }))} />
            <FilterSelect value={mode} onChange={setMode} options={[{ value: "all", label: "All modes" }, { value: "office", label: "Office" }, { value: "wfh", label: "Work From Home" }]} width={170} />
            <FilterSelect value={status} onChange={setStatus} options={[{ value: "all", label: "All statuses" }, { value: "present", label: "Present" }, { value: "late", label: "Late" }, { value: "leave", label: "On Leave" }, { value: "absent", label: "Absent" }]} width={160} />
            <div className="relative shrink-0">
              <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="h-11 rounded-[14px] border border-border/[0.1] bg-surface pl-9 pr-3 text-sm text-text focus:border-primary-400 focus:outline-none" />
            </div>
            {activeFilters > 0 ? (
              <button type="button" onClick={clearFilters} className="inline-flex h-11 shrink-0 items-center gap-1.5 rounded-[14px] px-3 text-sm font-medium text-text-tertiary transition-colors hover:text-text">
                <X className="h-4 w-4" /> Clear
              </button>
            ) : null}
          </div>
        ) : null}
      </div>

      {/* Attendance log */}
      <Panel title="Attendance Log" sub={`${rows.length} of ${WORKFORCE_TOTAL} employees · ${format(parseISO(date), "d MMM yyyy")}`} icon={Clock} color="#38BDF8">
        {/* Timeline legend */}
        <div className="mb-4 flex flex-wrap gap-x-4 gap-y-1.5">
          {TIMELINE_LEGEND.map((l) => (
            <span key={l.label} className="inline-flex items-center gap-1.5 text-[11px] text-text-secondary">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: l.color }} />
              {l.label}
            </span>
          ))}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-b border-border/[0.08] text-left text-[11px] uppercase tracking-wide text-text-tertiary">
                <ThSort label="Employee" k="name" sort={sort} onSort={toggleSort} />
                <th className="px-3 py-2 font-semibold">Attendance</th>
                <th className="px-3 py-2 font-semibold">Effective</th>
                <th className="px-3 py-2 font-semibold">Break</th>
                <ThSort label="Gross" k="gross" sort={sort} onSort={toggleSort} />
                <ThSort label="Arrival" k="arrival" sort={sort} onSort={toggleSort} />
                <th className="px-3 py-2 font-semibold">Mode</th>
                <th className="w-8" />
              </tr>
            </thead>
            <tbody>
              {rows.map((m) => (
                <TrackingRow key={m.employee.id} m={m} onOpen={() => setQuick(m)} />
              ))}
            </tbody>
          </table>
          {rows.length === 0 ? <p className="py-10 text-center text-sm text-text-tertiary">No employees match these filters.</p> : null}
        </div>
      </Panel>

      <QuickViewDrawer member={quick} onClose={() => setQuick(null)} />
    </div>
  );
}

/* ── One tracking row — click the candidate to open the quick view ── */
function TrackingRow({ m, onOpen }: { m: TeamMember; onOpen: () => void }) {
  const arrival = ARRIVAL_CONFIG[m.arrival];

  return (
    <tr
      onClick={onOpen}
      className="cursor-pointer border-b border-border/[0.05] align-middle transition-colors hover:bg-surface-2/40"
    >
      <td className="px-3 py-2.5">
        <div className="flex items-center gap-2.5">
          <PersonAvatar name={m.employee.name} src={m.employee.avatarUrl} size={34} />
          <span className="min-w-0">
            <span className="block truncate font-semibold text-text">{m.employee.name}</span>
            <span className="block truncate text-xs text-text-tertiary">{m.employee.department}</span>
          </span>
        </div>
      </td>
      <td className="px-3 py-2.5"><div className="w-[160px]"><TimelineBar segments={m.segments} height={8} /></div></td>
      <td className="px-3 py-2.5 font-semibold tabular-nums text-text">{m.effectiveHours ?? "—"}</td>
      <td className="px-3 py-2.5 tabular-nums text-text-secondary">{m.breakTime ?? "—"}</td>
      <td className="px-3 py-2.5 tabular-nums text-text-secondary">{m.grossHours ?? "—"}</td>
      <td className="px-3 py-2.5">
        <span className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium" style={{ color: arrival.color, backgroundColor: `${arrival.color}18` }}>
          <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: arrival.color }} />
          {arrival.label}
        </span>
      </td>
      <td className="px-3 py-2.5">
        {m.mode ? <span className="inline-flex items-center gap-1.5 text-text-secondary">{(() => { const I = MODES[m.mode].icon; return <I className="h-4 w-4" style={{ color: MODES[m.mode].color }} />; })()}{MODES[m.mode].short}</span> : <span className="text-text-tertiary">—</span>}
      </td>
      <td className="px-3 py-2.5 text-right">
        <ChevronRight className="ml-auto h-4 w-4 text-text-tertiary" />
      </td>
    </tr>
  );
}

/* Build an event timeline from a member's day. */
function memberEvents(m: TeamMember): TimelineEvent[] {
  if (!m.checkIn) return [];
  const evs: TimelineEvent[] = [{ kind: "check-in", time: m.checkIn, label: "Checked in", detail: m.address }];
  if (m.breakTime && m.breakTime !== "—") {
    evs.push({ kind: "break-start", time: "01:00 PM", label: "Break started" });
    evs.push({ kind: "break-end", time: "01:48 PM", label: `Break ended · ${m.breakTime}` });
  }
  if (m.checkOut) evs.push({ kind: "check-out", time: m.checkOut, label: "Checked out", detail: m.address });
  return evs;
}

/* ── Quick view drawer — full attendance detail for one candidate ── */
function QuickViewDrawer({ member: m, onClose }: { member: TeamMember | null; onClose: () => void }) {
  const arrival = m ? ARRIVAL_CONFIG[m.arrival] : null;
  const events = m ? memberEvents(m) : [];

  return (
    <Drawer anchor="right" open={m !== null} onClose={onClose} slotProps={{ paper: { sx: { width: 440, maxWidth: "100vw", backgroundImage: "none" } } }}>
      {m ? (
        <div className="flex h-full flex-col overflow-y-auto p-5">
          {/* Header */}
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-text">Quick view</h2>
            <button type="button" onClick={onClose} aria-label="Close" className="flex h-8 w-8 items-center justify-center rounded-lg text-text-tertiary hover:bg-surface-2"><X className="h-4 w-4" /></button>
          </div>

          {/* Person + status */}
          <div className="flex items-center gap-3 rounded-[14px] border border-border/[0.06] bg-surface-2/40 p-3">
            <PersonAvatar name={m.employee.name} src={m.employee.avatarUrl} size={44} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-text">{m.employee.name}</p>
              <p className="truncate text-xs text-text-tertiary">{m.employee.department}</p>
            </div>
            <StatusPill status={m.status} />
          </div>

          {/* Arrival + mode chips */}
          <div className="mt-3 flex flex-wrap gap-2">
            {arrival ? (
              <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium" style={{ color: arrival.color, backgroundColor: `${arrival.color}18` }}>
                <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: arrival.color }} />
                {arrival.label}
              </span>
            ) : null}
            {m.mode ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-2 px-2.5 py-1 text-[11px] font-medium text-text-secondary">
                {(() => { const I = MODES[m.mode].icon; return <I className="h-3.5 w-3.5" style={{ color: MODES[m.mode].color }} />; })()}
                {MODES[m.mode].label}
              </span>
            ) : null}
          </div>

          {/* Attendance events */}
          <p className="mb-3 mt-5 text-xs font-semibold uppercase tracking-wide text-text-tertiary">Attendance events</p>
          {events.length > 0 ? <Timeline events={events} /> : <p className="text-sm text-text-tertiary">No activity recorded today.</p>}

          {/* Working duration */}
          <p className="mb-2.5 mt-5 text-xs font-semibold uppercase tracking-wide text-text-tertiary">Working duration</p>
          <div className="space-y-2.5">
            <MetaRow icon={Clock} label="Effective" value={m.effectiveHours ?? "—"} />
            <MetaRow icon={Timer} label="Break" value={m.breakTime ?? "—"} />
            <MetaRow icon={Hourglass} label="Gross" value={m.grossHours ?? "—"} />
          </div>

          {/* Verification */}
          <p className="mb-2.5 mt-5 text-xs font-semibold uppercase tracking-wide text-text-tertiary">Verification</p>
          <div className="mb-3 flex flex-wrap gap-2">
            <VerifyBadge ok={m.gps} label="GPS" />
            <VerifyBadge ok={m.photo} label="Selfie" />
          </div>
          {m.photo ? (
            <div className="mb-3 flex items-center gap-3 rounded-[12px] border border-border/[0.06] bg-surface p-2.5">
              <img src="https://i.pravatar.cc/120?img=15" alt="Check-in selfie" className="h-12 w-12 rounded-[10px] object-cover" />
              <div className="flex items-center gap-1.5 text-sm font-semibold text-[#0F9E6E]"><CheckCircle2 className="h-4 w-4" /> Face match verified</div>
            </div>
          ) : null}
          {m.gps ? (
            <MapSurface pins={[{ x: 50, y: 58, label: m.employee.name.split(" ")[0], color: statusColor(m), photo: m.employee.avatarUrl ?? undefined }]} height={180} className="mb-3" />
          ) : null}
          <div className="space-y-2.5">
            <MetaRow icon={MapPin} label="Location" value={m.address} />
            <MetaRow icon={Globe} label="Coordinates" value={m.gps ? `${m.lat.toFixed(4)}, ${m.lng.toFixed(4)}` : "—"} />
          </div>
        </div>
      ) : null}
    </Drawer>
  );
}

/* ── Sortable table header cell ── */
function ThSort({ label, k, sort, onSort }: { label: string; k: TrackSort; sort: { key: TrackSort; dir: "asc" | "desc" }; onSort: (k: TrackSort) => void }) {
  const active = sort.key === k;
  return (
    <th className="px-3 py-2 font-semibold">
      <button type="button" onClick={() => onSort(k)} className="inline-flex items-center gap-1 uppercase tracking-wide transition-colors hover:text-text">
        {label}
        {active ? (sort.dir === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />) : <ArrowUpDown className="h-3 w-3 opacity-40" />}
      </button>
    </th>
  );
}

/* ── Toolbar select ── */
function FilterSelect({ value, onChange, options, width = 190 }: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[]; width?: number }) {
  return (
    <div className="shrink-0" style={{ width }}>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="!h-11 rounded-[14px]"><SelectValue /></SelectTrigger>
        <SelectContent>{options.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
      </Select>
    </div>
  );
}

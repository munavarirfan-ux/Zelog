"use client";

import { useEffect, useMemo, useState } from "react";
import Dialog from "@mui/material/Dialog";
import MuiTextField from "@mui/material/TextField";
import {
  addMonths, format, isSameDay, parseISO, startOfMonth,
} from "date-fns";
import {
  BatteryFull, CalendarDays, Check, ChevronLeft, ChevronRight, Clock,
  Coffee, Globe, Hourglass, LogIn, LogOut, MapPin, Monitor, Navigation, Plus, Timer, Wifi, X, Zap,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useAttendanceStore } from "@/store/attendanceStore";
import { CheckInFlow } from "./CheckInFlow";
import { ACard, KpiCard, MapSurface, MetaRow, StatusPill, Timeline, VerifyBadge } from "./shared";
import {
  MODE_LIST, MODES, OFFICES, REQUEST_TYPES, STATUS, STATUS_LEGEND, buildMonthCalendar,
  requestTypeLabel, type AttendanceMode, type CalendarDay, type DayStatus, type RequestType,
} from "@/data/attendanceData";
import { cn } from "@/lib/utils";

/* ── helpers ── */

function greeting(): string {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
}
function fmtHM(ms: number): string {
  const m = Math.floor(ms / 60000);
  return `${String(Math.floor(m / 60)).padStart(2, "0")}h ${String(m % 60).padStart(2, "0")}m`;
}
function fmtHMS(ms: number): string {
  const s = Math.floor(ms / 1000);
  return `${String(Math.floor(s / 3600)).padStart(2, "0")}h ${String(Math.floor((s % 3600) / 60)).padStart(2, "0")}m ${String(s % 60).padStart(2, "0")}s`;
}

function useElapsed(startIso: string | null, active: boolean): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!active) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [active]);
  if (!startIso) return 0;
  return Math.max(0, now - new Date(startIso).getTime());
}

/* ═══════════════ DASHBOARD ═══════════════ */

/**
 * Page-level purple hero for the employee Attendance module. Mirrors the admin
 * AttendanceHero: it sits above the tabs and persists across every tab, carrying
 * the greeting, today's status, quick stats and the live check-in controls.
 */
export function EmployeeAttendanceHero() {
  const { currentUser } = useCurrentUser();
  const first = currentUser.name.split(" ")[0];

  const mode = useAttendanceStore((s) => s.mode);
  const setMode = useAttendanceStore((s) => s.setMode);
  const checkedIn = useAttendanceStore((s) => s.checkedIn);
  const checkedOut = useAttendanceStore((s) => s.checkedOut);
  const checkInAt = useAttendanceStore((s) => s.checkInAt);
  const checkInLabel = useAttendanceStore((s) => s.checkInLabel);
  const checkOutLabel = useAttendanceStore((s) => s.checkOutLabel);
  const onBreak = useAttendanceStore((s) => s.onBreak);
  const verification = useAttendanceStore((s) => s.verification);
  const doCheckIn = useAttendanceStore((s) => s.checkIn);
  const doCheckOut = useAttendanceStore((s) => s.checkOut);
  const toggleBreak = useAttendanceStore((s) => s.toggleBreak);
  const resetDay = useAttendanceStore((s) => s.resetDay);

  const [flowOpen, setFlowOpen] = useState(false);
  const elapsed = useElapsed(checkInAt, checkedIn && !onBreak);
  const activeMode = MODES[mode];
  const office = OFFICES[0];

  const statusText = checkedIn ? (onBreak ? "On Break" : "Working") : checkedOut ? "Checked out" : "Not checked in";

  return (
    <section className="relative overflow-hidden rounded-[28px] bg-hero px-6 py-7 text-white shadow-[0_30px_80px_-32px_rgba(49,46,129,0.65)] sm:px-8 sm:py-8">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -right-16 -top-24 h-72 w-72 rounded-full bg-[#B197FF]/30 blur-[90px]" />
        <div className="absolute right-1/3 top-1/2 h-64 w-64 rounded-full bg-[#5B8DEF]/25 blur-[90px]" />
        <div className="absolute -bottom-24 left-1/4 h-64 w-64 rounded-full bg-[#7A4DFF]/25 blur-[90px]" />
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{ backgroundImage: "radial-gradient(circle at 1px 1px, #fff 1px, transparent 0)", backgroundSize: "22px 22px" }}
        />
      </div>
      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-stretch lg:justify-between">
        {/* Left: greeting + status + tiles */}
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-white/60">{greeting()},</p>
          <h1 className="mt-0.5 flex items-center gap-2 text-[26px] font-semibold leading-tight tracking-tight sm:text-[30px]">
            {first} 👋
          </h1>
          <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm font-medium backdrop-blur">
            <span className={cn("h-2 w-2 rounded-full", checkedIn && !onBreak ? "animate-pulse" : "")} style={{ backgroundColor: checkedIn ? activeMode.color : "#F87171" }} />
            Today&apos;s Status · {statusText}
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <HeroTile label="Today's Hours" value={fmtHM(elapsed)} icon={Clock} />
            <HeroTile label="Check In" value={checkInLabel ?? "—"} icon={LogIn} />
            <HeroTile label="Mode" value={activeMode.short} icon={activeMode.icon} />
            <HeroTile
              label="Location"
              value={mode === "office" ? office.name : verification?.address?.split(",")[0] ?? activeMode.short}
              icon={MapPin}
            />
          </div>

          {(checkedIn || checkedOut) && verification ? (
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur">
                <Check className="h-3.5 w-3.5" /> GPS Verified
              </span>
              {verification.photo ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur">
                  <Check className="h-3.5 w-3.5" /> Photo Verified
                </span>
              ) : null}
            </div>
          ) : null}
        </div>

        {/* Right: action panel */}
        <div className="flex w-full flex-col justify-center gap-3 rounded-[20px] border border-white/15 bg-white/10 p-4 backdrop-blur lg:w-[300px]">
          {!checkedIn && !checkedOut ? (
            <>
              <p className="text-xs font-medium text-white/70">Choose your mode</p>
              <div className="grid grid-cols-3 gap-1.5 rounded-[14px] bg-white/10 p-1">
                {MODE_LIST.map((m) => {
                  const active = m.id === mode;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setMode(m.id)}
                      className={cn(
                        "flex flex-col items-center gap-1 rounded-[10px] px-1 py-2 text-[11px] font-semibold transition-colors",
                        active ? "bg-white text-primary-700 shadow" : "text-white/80 hover:bg-white/10",
                      )}
                    >
                      <m.icon className="h-4 w-4" strokeWidth={2} />
                      {m.short}
                    </button>
                  );
                })}
              </div>
              <Button variant="white" className="h-12 w-full text-[15px]" onClick={() => setFlowOpen(true)}>
                <LogIn className="mr-1.5 h-5 w-5" /> Check In
              </Button>
            </>
          ) : checkedIn ? (
            <>
              <div className="text-center">
                <p className="text-xs font-medium text-white/70">Working for</p>
                <p className="mt-0.5 font-mono text-3xl font-bold tabular-nums">{fmtHMS(elapsed)}</p>
                {onBreak ? <p className="mt-1 text-xs font-semibold text-amber-200">⏸ On break</p> : null}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="white"
                  className="h-11 flex-1 !bg-white/15 !text-white hover:!bg-white/25"
                  onClick={() => toggleBreak(format(new Date(), "hh:mm a"))}
                >
                  <Coffee className="mr-1.5 h-4 w-4" /> {onBreak ? "Resume" : "Break"}
                </Button>
                <Button
                  variant="white"
                  className="h-11 flex-1"
                  onClick={() => { doCheckOut(format(new Date(), "hh:mm a")); toast.success("Checked out"); }}
                >
                  <LogOut className="mr-1.5 h-4 w-4" /> Check Out
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="text-center">
                <p className="text-xs font-medium text-white/70">Checked out at</p>
                <p className="mt-0.5 text-2xl font-bold">{checkOutLabel}</p>
                <p className="mt-1 text-sm text-white/70">Total {fmtHM(elapsed)}</p>
              </div>
              <Button variant="white" className="h-11 w-full !bg-white/15 !text-white hover:!bg-white/25" onClick={resetDay}>
                Start a new session
              </Button>
            </>
          )}
        </div>
      </div>

      <CheckInFlow
        open={flowOpen}
        mode={mode}
        onClose={() => setFlowOpen(false)}
        onComplete={(payload) => { doCheckIn(payload); setFlowOpen(false); toast.success(`Checked in · ${MODES[payload.mode].label}`); }}
      />
    </section>
  );
}

export function EmployeeDashboard() {
  const mode = useAttendanceStore((s) => s.mode);
  const checkedIn = useAttendanceStore((s) => s.checkedIn);
  const checkedOut = useAttendanceStore((s) => s.checkedOut);
  const checkInAt = useAttendanceStore((s) => s.checkInAt);
  const onBreak = useAttendanceStore((s) => s.onBreak);
  const events = useAttendanceStore((s) => s.events);
  const verification = useAttendanceStore((s) => s.verification);

  const elapsed = useElapsed(checkInAt, checkedIn && !onBreak);
  const activeMode = MODES[mode];
  const statusText = checkedIn ? (onBreak ? "On Break" : "Working") : checkedOut ? "Checked out" : "Not checked in";
  const expectedCheckout = checkInAt ? format(new Date(new Date(checkInAt).getTime() + 9 * 3600000), "hh:mm a") : "—";
  const remainingMs = Math.max(0, 8.5 * 3600000 - elapsed);

  return (
    <div className="space-y-5">
      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        <KpiCard icon={Clock} label="Today's Hours" value={fmtHM(elapsed)} color="#7A4DFF" />
        <KpiCard icon={Coffee} label="Break Time" value={checkedIn || checkedOut ? "45m" : "—"} color="#FB923C" />
        <KpiCard icon={Zap} label="Overtime" value={elapsed > 8.5 * 3600000 ? fmtHM(elapsed - 8.5 * 3600000) : "0m"} color="#F472B6" />
        <KpiCard icon={Timer} label="Status" value={<span className="text-base">{statusText}</span>} color={checkedIn ? activeMode.color : "#94A3B8"} />
        <KpiCard icon={Hourglass} label="Expected Out" value={<span className="text-base">{expectedCheckout}</span>} color="#38BDF8" />
        <KpiCard icon={CalendarDays} label="Remaining" value={fmtHM(remainingMs)} color="#34D399" />
      </div>

      {/* Timeline + verification */}
      <div className="grid gap-4 lg:grid-cols-3">
        <ACard title="Today's Timeline" subtitle="Your working activity" icon={Navigation} tint="#7A4DFF" className="lg:col-span-2">
          <Timeline events={events} />
        </ACard>
        <ACard title="Verification" subtitle="Captured at check-in" icon={MapPin} tint="#34D399">
          {verification ? (
            <div className="space-y-2.5">
              <div className="mb-1 flex gap-2">
                <VerifyBadge ok={verification.gps} label="GPS" />
                <VerifyBadge ok={verification.photo} label="Photo" />
                {verification.mockLocation ? <VerifyBadge ok={false} label="Mock GPS" /> : null}
              </div>
              {verification.selfieUrl ? (
                <img src={verification.selfieUrl} alt="Check-in selfie" className="mb-2 h-20 w-20 rounded-[14px] object-cover" />
              ) : null}
              <MetaRow icon={MapPin} label="Address" value={verification.address} />
              <MetaRow icon={Navigation} label="Distance" value={`${verification.officeDistance} m`} />
              <MetaRow icon={Globe} label="IP" value={verification.ip} />
              <MetaRow icon={Monitor} label="Device" value={verification.device} />
              <MetaRow icon={Wifi} label="Browser" value={verification.browser} />
              <MetaRow icon={BatteryFull} label="Battery" value={`${verification.battery}%`} />
            </div>
          ) : (
            <p className="py-6 text-center text-sm text-text-tertiary">Check in to capture GPS, photo & device details.</p>
          )}
        </ACard>
      </div>
    </div>
  );
}

function HeroTile({ label, value, icon: Icon }: { label: string; value: string; icon: typeof Clock }) {
  return (
    <div className="rounded-[14px] border border-white/15 bg-white/10 p-3 backdrop-blur">
      <Icon className="h-4 w-4 text-white/70" strokeWidth={2} />
      <p className="mt-2 truncate text-base font-bold leading-none">{value}</p>
      <p className="mt-1 text-[11px] font-medium text-white/60">{label}</p>
    </div>
  );
}

/* ═══════════════ CALENDAR ═══════════════ */

export function EmployeeCalendar() {
  const today = useMemo(() => new Date(), []);
  const [monthDate, setMonthDate] = useState(() => startOfMonth(today));
  const [selected, setSelected] = useState<CalendarDay | null>(null);
  const days = useMemo(() => buildMonthCalendar(monthDate, today), [monthDate, today]);
  const leadBlanks = days.length ? new Date(days[0].date).getDay() : 0;

  return (
    <>
      <ACard
        title={format(monthDate, "MMMM yyyy")}
        subtitle="Tap any day for full details"
        icon={CalendarDays}
        tint="#7A4DFF"
        action={
          <div className="flex items-center gap-1">
            <IconBtn onClick={() => setMonthDate((d) => addMonths(d, -1))} aria={"Previous month"}><ChevronLeft className="h-4 w-4" /></IconBtn>
            <IconBtn onClick={() => setMonthDate((d) => addMonths(d, 1))} aria={"Next month"}><ChevronRight className="h-4 w-4" /></IconBtn>
          </div>
        }
      >
        <div className="grid grid-cols-7 gap-1.5">
          {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
            <div key={i} className="pb-1 text-center text-[11px] font-semibold text-text-tertiary">{d}</div>
          ))}
          {Array.from({ length: leadBlanks }).map((_, i) => <div key={`b${i}`} />)}
          {days.map((d) => {
            const s = STATUS[d.status];
            const isToday = isSameDay(parseISO(d.date), today);
            const worked = ["present", "wfh", "client", "late", "half-day"].includes(d.status);
            return (
              <button
                key={d.date}
                type="button"
                onClick={() => setSelected(d)}
                className={cn(
                  "group relative flex aspect-square flex-col items-center justify-center rounded-[12px] border text-sm transition-all hover:-translate-y-0.5",
                  isToday ? "border-primary-400 ring-2 ring-primary-400/30" : "border-transparent",
                )}
                style={{ backgroundColor: `${s.color}1A` }}
              >
                <span className="text-[13px] font-semibold" style={{ color: s.color }}>{new Date(d.date).getDate()}</span>
                {worked ? <span className="mt-1 h-1.5 w-1.5 rounded-full" style={{ backgroundColor: s.color }} /> : null}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 border-t border-border/[0.06] pt-3">
          {STATUS_LEGEND.map((st) => (
            <span key={st} className="inline-flex items-center gap-1.5 text-[11px] text-text-secondary">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: STATUS[st].color }} />
              {STATUS[st].label}
            </span>
          ))}
        </div>
      </ACard>

      <Dialog open={selected !== null} onClose={() => setSelected(null)} slotProps={{ paper: { sx: { borderRadius: "20px", maxWidth: 400, width: "100%", backgroundImage: "none" } } }}>
        {selected ? (
          <div className="p-5 sm:p-6">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h2 className="text-base font-semibold text-text">{format(parseISO(selected.date), "EEEE, d MMMM")}</h2>
                <div className="mt-1"><StatusPill status={selected.status} /></div>
              </div>
              <button type="button" onClick={() => setSelected(null)} aria-label="Close" className="flex h-8 w-8 items-center justify-center rounded-lg text-text-tertiary hover:bg-surface-2"><X className="h-4 w-4" /></button>
            </div>
            {selected.checkIn ? (
              <div className="space-y-2.5">
                <MetaRow icon={LogIn} label="Check in" value={selected.checkIn} />
                <MetaRow icon={LogOut} label="Check out" value={selected.checkOut ?? "—"} />
                <MetaRow icon={Clock} label="Working hours" value={selected.hours ?? "—"} />
                <MetaRow icon={Coffee} label="Break" value={selected.breakTime ?? "—"} />
                <MetaRow icon={selected.mode ? MODES[selected.mode].icon : MapPin} label="Mode" value={selected.mode ? MODES[selected.mode].label : "—"} />
                <div className="flex gap-2 pt-1"><VerifyBadge ok={!!selected.gps} label="GPS" /><VerifyBadge ok={!!selected.photo} label="Photo" /></div>
              </div>
            ) : (
              <p className="py-6 text-center text-sm text-text-tertiary">No attendance recorded for this day.</p>
            )}
          </div>
        ) : null}
      </Dialog>
    </>
  );
}

/* ═══════════════ HISTORY ═══════════════ */

export function EmployeeHistory() {
  const today = useMemo(() => new Date(), []);
  const days = useMemo(() => buildMonthCalendar(startOfMonth(today), today), [today]);
  const worked = days
    .filter((d) => d.checkIn && new Date(d.date) <= today)
    .sort((a, b) => b.date.localeCompare(a.date));

  return (
    <ACard title="Attendance History" subtitle={format(today, "MMMM yyyy")} icon={Clock} tint="#38BDF8">
      <div className="space-y-2">
        {worked.map((d) => {
          const s = STATUS[d.status];
          return (
            <div key={d.date} className="flex flex-wrap items-center gap-3 rounded-[14px] border border-border/[0.05] bg-surface-2/40 p-3">
              <div className="flex w-12 flex-col items-center rounded-[10px] bg-surface px-2 py-1 text-center shadow-sm">
                <span className="text-[10px] font-semibold uppercase text-text-tertiary">{format(parseISO(d.date), "EEE")}</span>
                <span className="text-lg font-bold leading-none text-text">{format(parseISO(d.date), "d")}</span>
              </div>
              <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-5 gap-y-1 text-sm">
                <span className="inline-flex items-center gap-1 text-text-secondary"><LogIn className="h-3.5 w-3.5 text-text-tertiary" /> {d.checkIn}</span>
                <span className="inline-flex items-center gap-1 text-text-secondary"><LogOut className="h-3.5 w-3.5 text-text-tertiary" /> {d.checkOut}</span>
                <span className="inline-flex items-center gap-1 font-semibold text-text"><Clock className="h-3.5 w-3.5 text-text-tertiary" /> {d.hours}</span>
                <span className="inline-flex items-center gap-1 text-text-secondary"><Coffee className="h-3.5 w-3.5 text-text-tertiary" /> {d.breakTime}</span>
                {d.mode ? <span className="inline-flex items-center gap-1 text-text-secondary">{(() => { const I = MODES[d.mode].icon; return <I className="h-3.5 w-3.5 text-text-tertiary" />; })()} {MODES[d.mode].short}</span> : null}
              </div>
              <div className="flex items-center gap-2">
                <VerifyBadge ok={!!d.gps} label="GPS" />
                <StatusPill status={d.status} />
              </div>
            </div>
          );
        })}
      </div>
    </ACard>
  );
}

/* ═══════════════ MY REQUESTS ═══════════════ */

export function EmployeeRequests() {
  const { currentUser } = useCurrentUser();
  const requests = useAttendanceStore((s) => s.requests);
  const submit = useAttendanceStore((s) => s.submitRequest);
  const mine = requests.filter((r) => r.employeeId === currentUser.id);
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<RequestType>("correction");
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [reason, setReason] = useState("");

  function handleSubmit() {
    submit({ employeeId: currentUser.id, type, date, detail: requestTypeLabel(type), reason });
    toast.success("Request submitted for approval");
    setOpen(false);
    setReason("");
  }

  const statusColor: Record<string, string> = { pending: "#FB923C", approved: "#34D399", rejected: "#F43F5E", "sent-back": "#8B7CF6" };

  return (
    <ACard
      title="My Requests"
      subtitle="Corrections, WFH, overtime & more"
      icon={Plus}
      tint="#8B7CF6"
      action={<Button size="sm" onClick={() => setOpen(true)} className="gap-1.5"><Plus className="h-4 w-4" /> New Request</Button>}
    >
      {mine.length === 0 ? (
        <p className="py-8 text-center text-sm text-text-tertiary">No requests yet. Raise one for a correction, WFH day, or overtime.</p>
      ) : (
        <div className="space-y-2">
          {mine.map((r) => (
            <div key={r.id} className="flex flex-wrap items-center gap-3 rounded-[14px] border border-border/[0.05] bg-surface-2/40 p-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[rgba(122,77,255,0.1)] text-primary-600"><Clock className="h-4 w-4" /></span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-text">{requestTypeLabel(r.type)}</p>
                <p className="truncate text-xs text-text-tertiary">{r.detail} · {format(parseISO(r.date), "d MMM")}</p>
                {r.comment ? <p className="mt-0.5 truncate text-xs italic text-text-tertiary">“{r.comment}”</p> : null}
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize" style={{ color: statusColor[r.status], backgroundColor: `${statusColor[r.status]}1F` }}>
                {r.status.replace("-", " ")}
              </span>
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onClose={() => setOpen(false)} slotProps={{ paper: { sx: { borderRadius: "20px", maxWidth: 440, width: "100%", backgroundImage: "none" } } }}>
        <div className="p-5 sm:p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-text">New attendance request</h2>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close" className="flex h-8 w-8 items-center justify-center rounded-lg text-text-tertiary hover:bg-surface-2"><X className="h-4 w-4" /></button>
          </div>
          <div className="space-y-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-text-secondary">Request type</label>
              <Select value={type} onValueChange={(v) => setType(v as RequestType)}>
                <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                <SelectContent>{REQUEST_TYPES.map((t) => <SelectItem key={t.id} value={t.id}>{t.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-text-secondary">Date</label>
              <MuiTextField type="date" value={date} onChange={(e) => setDate(e.target.value)} fullWidth size="small" sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px" } }} />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-text-secondary">Reason</label>
              <MuiTextField value={reason} onChange={(e) => setReason(e.target.value)} multiline minRows={3} fullWidth placeholder="Add a short explanation…" sx={{ "& .MuiOutlinedInput-root": { borderRadius: "12px" } }} />
            </div>
          </div>
          <div className="mt-5 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={!reason.trim()}>Submit</Button>
          </div>
        </div>
      </Dialog>
    </ACard>
  );
}

/* ═══════════════ LOCATION HISTORY ═══════════════ */

export function EmployeeLocation() {
  const route = [
    { x: 18, y: 70 }, { x: 40, y: 45 }, { x: 62, y: 58 }, { x: 82, y: 30 },
  ];
  const pins = [
    { x: 18, y: 70, label: "09:02 · Office", color: "#34D399" },
    { x: 40, y: 45, label: "01:00 · Break", color: "#FB923C" },
    { x: 62, y: 58, label: "03:40 · Office", color: "#34D399" },
    { x: 82, y: 30, label: "06:30 · Home", color: "#38BDF8" },
  ];
  const stops = [
    { time: "09:02 AM", label: "Checked in — Hyderabad HQ", icon: LogIn, color: "#34D399" },
    { time: "01:00 PM", label: "Break — Cafe, Gachibowli", icon: Coffee, color: "#FB923C" },
    { time: "01:48 PM", label: "Back at office — Hyderabad HQ", icon: LogIn, color: "#34D399" },
    { time: "06:30 PM", label: "Checked out — Banjara Hills", icon: LogOut, color: "#38BDF8" },
  ];
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <ACard title="Today's Movement" subtitle="GPS trail across today's check-ins" icon={MapPin} tint="#34D399" className="lg:col-span-2">
        <MapSurface pins={pins} route={route} height={340} />
      </ACard>
      <ACard title="Route" subtitle="Location timeline" icon={Navigation} tint="#38BDF8">
        <ol className="relative ml-1">
          {stops.map((s, i) => (
            <li key={i} className="relative flex gap-3 pb-5 last:pb-0">
              {i < stops.length - 1 ? <span className="absolute left-[15px] top-8 h-[calc(100%-1rem)] w-px bg-border/[0.12]" /> : null}
              <span className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full text-white shadow-sm" style={{ background: `linear-gradient(135deg, ${s.color}, ${s.color}CC)` }}>
                <s.icon className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1 pt-0.5">
                <p className="text-sm font-semibold text-text">{s.label}</p>
                <p className="text-xs text-text-tertiary">{s.time}</p>
              </div>
            </li>
          ))}
        </ol>
      </ACard>
    </div>
  );
}

function IconBtn({ children, onClick, aria }: { children: React.ReactNode; onClick: () => void; aria: string }) {
  return (
    <button type="button" onClick={onClick} aria-label={aria} className="flex h-8 w-8 items-center justify-center rounded-lg border border-border/[0.1] text-text-secondary transition-colors hover:bg-surface-2">
      {children}
    </button>
  );
}

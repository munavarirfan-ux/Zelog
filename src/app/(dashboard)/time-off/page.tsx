"use client";

import { useMemo, useState } from "react";
import Checkbox from "@mui/material/Checkbox";
import MuiTooltip from "@mui/material/Tooltip";
import { addDays, format, parseISO } from "date-fns";
import { toast } from "sonner";
import { CalendarClock, CalendarDays, Check, Clock, Download, Palmtree, Plane, Users, UserPlus, X, type LucideIcon } from "lucide-react";
import { SubNav } from "@/components/attendance/shared";
import { PersonAvatar } from "@/components/ui/person-avatar";
import {
  CURRENT_USER_ID,
  computeBalances,
  requestColor,
  requestLabel,
  type TimeOffRequest,
} from "@/data/timeOffData";
import { useOrgStore, useHydratedOrg } from "@/store/orgStore";
import { useRoleStore, useHydratedRole } from "@/store/roleStore";
import { useTimeOffStore, useHydratedTimeOff } from "@/store/timeOffStore";
import { useHolidayStore, useHydratedHolidays } from "@/store/holidayStore";
import { calendarForLocation } from "@/data/timeOffData";
import { LeaveBalanceRings } from "@/components/timeoff/LeaveBalanceRings";
import { RequestHistoryTable } from "@/components/timeoff/RequestHistoryTable";
import { RequestTimeOffDialog } from "@/components/timeoff/RequestTimeOffDialog";
import { RequestDetailsDrawer } from "@/components/timeoff/RequestDetailsDrawer";
import { TeamCalendar } from "@/components/timeoff/TeamCalendar";
import { HolidaysPanel } from "@/components/timeoff/HolidaysPanel";
import { StatusChip } from "@/components/timeoff/StatusChip";

const TODAY = parseISO("2026-08-06");

export default function TimeOffPage() {
  const hydrated = useHydratedTimeOff();
  useHydratedOrg();
  useHydratedRole();
  const role = useRoleStore((s) => s.role);
  const canManageTeam = role === "super-admin" || role === "admin";

  const employees = useOrgStore((s) => s.employees);
  const requests = useTimeOffStore((s) => s.requests);
  const cancelRequest = useTimeOffStore((s) => s.cancelRequest);
  const setStatus = useTimeOffStore((s) => s.setStatus);
  const bulkSetStatus = useTimeOffStore((s) => s.bulkSetStatus);
  const addComment = useTimeOffStore((s) => s.addComment);

  useHydratedHolidays();
  const calendars = useHolidayStore((s) => s.calendars);
  const myLocation = employees.find((e) => e.id === CURRENT_USER_ID)?.location;
  const myCalendarId = useMemo(
    () => calendarForLocation(calendars, myLocation)?.id,
    [calendars, myLocation],
  );

  const [activeKey, setActiveKey] = useState<"mine" | "team" | "holidays">("mine");
  const tabs = useMemo(() => {
    const t: { key: "mine" | "team" | "holidays"; label: string; icon: LucideIcon }[] = [
      { key: "mine", label: "My Time Off", icon: CalendarDays },
    ];
    if (canManageTeam) t.push({ key: "team", label: "My Team Time Off", icon: Users });
    t.push({ key: "holidays", label: "Holidays", icon: Palmtree });
    return t;
  }, [canManageTeam]);
  const currentKey = tabs.some((t) => t.key === activeKey) ? activeKey : "mine";

  const [reqDrawer, setReqDrawer] = useState<{ open: boolean; editing: TimeOffRequest | null; onBehalf: boolean; employeeId: string }>(
    { open: false, editing: null, onBehalf: false, employeeId: CURRENT_USER_ID },
  );
  const [detailsId, setDetailsId] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const myRequests = requests.filter((r) => r.employeeId === CURRENT_USER_ID);
  const balances = useMemo(() => computeBalances(CURRENT_USER_ID, requests), [requests]);
  const detailsReq = requests.find((r) => r.id === detailsId) ?? null;

  const pendingForAction = requests.filter((r) => (r.status === "pending" || r.status === "changes-requested") && r.employeeId !== CURRENT_USER_ID);
  const upcoming = requests.filter((r) => r.status === "approved" && parseISO(r.startDate) >= TODAY && parseISO(r.startDate) <= addDays(TODAY, 30));
  const offToday = employees.filter((e) => requests.some((r) => r.employeeId === e.id && r.status === "approved" && parseISO(r.startDate) <= TODAY && TODAY <= parseISO(r.endDate))).length;

  function exportCsv() {
    const esc = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
    const header = ["Employee", "Type", "Start", "End", "Days", "Status", "Reason"];
    const lines = requests.map((r) => {
      const emp = employees.find((e) => e.id === r.employeeId)?.name ?? r.employeeId;
      return [emp, requestLabel(r), r.startDate, r.endDate, r.durationDays, r.status, r.reason].map(esc).join(",");
    });
    const blob = new Blob([[header.join(","), ...lines].join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "team-time-off.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Calendar exported to CSV");
  }

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  }

  function bulk(status: "approved" | "rejected") {
    if (!selected.size) return;
    bulkSetStatus(Array.from(selected), status, CURRENT_USER_ID);
    toast.success(`${selected.size} request${selected.size === 1 ? "" : "s"} ${status}`);
    setSelected(new Set());
  }

  function decide(r: TimeOffRequest, status: "approved" | "rejected") {
    const name = employees.find((e) => e.id === r.employeeId)?.name ?? "the request";
    setStatus(r.id, status, CURRENT_USER_ID, status === "approved" ? "Approved" : "Declined");
    toast.success(`${status === "approved" ? "Approved" : "Declined"} ${name}'s request`);
    setSelected((prev) => { const n = new Set(prev); n.delete(r.id); return n; });
  }

  return (
    <div className="space-y-5 pb-8">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-shell bg-hero px-6 py-6 text-white shadow-[0_20px_60px_-20px_rgba(49,46,129,0.5)] sm:px-8">
        <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="relative space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Time Off</h1>
              <p className="mt-0.5 text-sm text-white/60">Manage your leave requests.</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setReqDrawer({ open: true, editing: null, onBehalf: false, employeeId: CURRENT_USER_ID })}
                className="inline-flex h-10 items-center gap-1.5 rounded-[12px] bg-white/90 px-4 text-sm font-semibold text-primary-800 shadow-sm transition-colors hover:bg-white"
              >
                <Plane className="h-4 w-4" /> Apply Leave
              </button>
            </div>
          </div>

          {currentKey === "team" && (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <HeroStat icon={<Clock className="h-4 w-4" />} label="Pending approvals" value={pendingForAction.length} />
              <HeroStat icon={<CalendarClock className="h-4 w-4" />} label="Upcoming absences (30d)" value={upcoming.length} />
              <HeroStat icon={<CalendarDays className="h-4 w-4" />} label="Off today" value={offToday} />
            </div>
          )}
        </div>
      </section>

      {/* Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <SubNav
          items={tabs.map((t) => ({ id: t.key, label: t.label, icon: t.icon }))}
          value={currentKey}
          onChange={(id) => setActiveKey(id as "mine" | "team" | "holidays")}
          showIcons
        />
        {currentKey === "team" && (
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => setReqDrawer({ open: true, editing: null, onBehalf: true, employeeId: employees[0]?.id ?? CURRENT_USER_ID })} className="inline-flex h-9 items-center gap-1.5 rounded-[10px] border border-border/10 bg-surface px-3 text-[13px] font-medium text-text-secondary shadow-xs hover:bg-surface-2 dark:border-white/10"><UserPlus className="h-3.5 w-3.5" /> Add on behalf</button>
            <button type="button" onClick={exportCsv} className="inline-flex h-9 items-center gap-1.5 rounded-[10px] border border-border/10 bg-surface px-3 text-[13px] font-medium text-text-secondary shadow-xs hover:bg-surface-2 dark:border-white/10"><Download className="h-3.5 w-3.5" /> Export CSV</button>
          </div>
        )}
      </div>

      {!hydrated ? (
        <div className="rounded-[16px] border border-border/[0.06] bg-surface p-10 text-center text-sm text-text-tertiary dark:border-white/[0.06]">Loading…</div>
      ) : currentKey === "mine" ? (
        /* ─── MY TIME OFF ─── */
        <div className="space-y-5">
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-text">Leave balance</h3>
            <LeaveBalanceRings balances={balances} />
          </div>
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-text">Request history</h3>
            <RequestHistoryTable
              requests={myRequests}
              onView={(r) => setDetailsId(r.id)}
              onEdit={(r) => setReqDrawer({ open: true, editing: r, onBehalf: false, employeeId: r.employeeId })}
              onCancel={(r) => { cancelRequest(r.id, CURRENT_USER_ID); toast.success("Request cancelled"); }}
            />
          </div>
        </div>
      ) : currentKey === "team" ? (
        /* ─── MY TEAM TIME OFF ─── */
        <div className="space-y-4">

          {/* Pending approvals / bulk actions */}
          {pendingForAction.length > 0 && (
            <div className="rounded-[16px] border border-border/[0.07] bg-surface p-4 shadow-card dark:border-white/[0.06]">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-text">Requests awaiting action ({pendingForAction.length})</h3>
                {selected.size > 0 && (
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => bulk("approved")} className="inline-flex h-8 items-center gap-1.5 rounded-[10px] bg-success/15 px-3 text-xs font-semibold text-success hover:bg-success/25"><Check className="h-3.5 w-3.5" /> Approve ({selected.size})</button>
                    <button type="button" onClick={() => bulk("rejected")} className="inline-flex h-8 items-center gap-1.5 rounded-[10px] bg-danger/12 px-3 text-xs font-semibold text-danger hover:bg-danger/20"><X className="h-3.5 w-3.5" /> Reject ({selected.size})</button>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                {pendingForAction.map((r) => {
                  const emp = employees.find((e) => e.id === r.employeeId);
                  const color = requestColor(r);
                  const range = `${format(parseISO(r.startDate), "MMM d")} → ${format(parseISO(r.endDate), "MMM d")}`;
                  return (
                    <div key={r.id} className="flex items-center gap-3 rounded-[12px] border border-border/[0.05] bg-white/60 p-2.5 dark:border-white/[0.05] dark:bg-white/[0.02]">
                      <Checkbox size="small" checked={selected.has(r.id)} onChange={() => toggleSelect(r.id)} sx={{ p: 0.5 }} />
                      <button type="button" onClick={() => setDetailsId(r.id)} className="flex min-w-0 flex-1 items-center gap-3 text-left">
                        <PersonAvatar name={emp?.name ?? "—"} src={emp?.avatarUrl} size={36} />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="truncate text-sm font-semibold text-text">{emp?.name ?? "—"}</span>
                            <span className="shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium" style={{ color, backgroundColor: `${color}1F` }}>{requestLabel(r)}</span>
                          </div>
                          <div className="mt-0.5 truncate text-xs text-text-tertiary">{range} · {r.durationDays}d</div>
                        </div>
                      </button>
                      <div className="flex shrink-0 items-center gap-1.5">
                        <MuiTooltip title="Approve" arrow>
                          <button type="button" onClick={() => decide(r, "approved")} className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#34D39922] text-[#0F9E6E] hover:bg-[#34D39933]"><Check className="h-4 w-4" /></button>
                        </MuiTooltip>
                        <MuiTooltip title="Decline" arrow>
                          <button type="button" onClick={() => decide(r, "rejected")} className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#F43F5E1A] text-[#E11D48] hover:bg-[#F43F5E2A]"><X className="h-4 w-4" /></button>
                        </MuiTooltip>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <TeamCalendar employees={employees} requests={requests} includeInactive={false} onEventClick={(r) => setDetailsId(r.id)} />
        </div>
      ) : (
        /* ─── HOLIDAYS (view-only here; managed in Settings → Time Off) ─── */
        <HolidaysPanel calendars={calendars} initialCalendarId={myCalendarId} />
      )}

      {/* Dialogs */}
      <RequestTimeOffDialog
        open={reqDrawer.open}
        employeeId={reqDrawer.employeeId}
        onBehalf={reqDrawer.onBehalf}
        editing={reqDrawer.editing}
        onClose={() => setReqDrawer((d) => ({ ...d, open: false }))}
        onSaved={(id) => { setReqDrawer((d) => ({ ...d, open: false })); toast.success(reqDrawer.editing ? "Request updated" : "Request submitted"); setDetailsId(id); }}
      />
      <RequestDetailsDrawer
        request={detailsReq}
        canManage={canManageTeam && detailsReq?.employeeId !== CURRENT_USER_ID}
        isOwn={detailsReq?.employeeId === CURRENT_USER_ID}
        onClose={() => setDetailsId(null)}
        onEdit={(r) => { setDetailsId(null); setReqDrawer({ open: true, editing: r, onBehalf: false, employeeId: r.employeeId }); }}
        onApprove={(id, c) => { setStatus(id, "approved", CURRENT_USER_ID, c); toast.success("Request approved"); setDetailsId(null); }}
        onReject={(id, c) => { setStatus(id, "rejected", CURRENT_USER_ID, c); toast.success("Request rejected"); setDetailsId(null); }}
        onRequestChanges={(id, c) => { setStatus(id, "changes-requested", CURRENT_USER_ID, c); toast.success("Changes requested"); setDetailsId(null); }}
        onComment={(id, c) => { addComment(id, CURRENT_USER_ID, c); toast.success("Comment added"); }}
        onCancel={(id) => { cancelRequest(id, CURRENT_USER_ID); toast.success("Request cancelled"); setDetailsId(null); }}
      />
    </div>
  );
}

function HeroStat({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-white/[0.14] px-4 py-3 backdrop-blur-sm">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 text-white">{icon}</span>
      <div>
        <p className="text-xl font-bold tabular-nums text-white">{value}</p>
        <p className="text-[11px] text-white/60">{label}</p>
      </div>
    </div>
  );
}

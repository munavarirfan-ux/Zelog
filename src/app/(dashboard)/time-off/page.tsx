"use client";

import { useMemo, useState } from "react";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Checkbox from "@mui/material/Checkbox";
import { addDays, parseISO } from "date-fns";
import { toast } from "sonner";
import { CalendarClock, CalendarDays, Check, Clock, Download, Plane, UserPlus, X } from "lucide-react";
import {
  CURRENT_USER_ID,
  computeBalances,
  requestLabel,
  type TimeOffRequest,
} from "@/data/timeOffData";
import { useOrgStore, useHydratedOrg } from "@/store/orgStore";
import { useRoleStore, useHydratedRole } from "@/store/roleStore";
import { useTimeOffStore, useHydratedTimeOff } from "@/store/timeOffStore";
import { useHydratedHolidays } from "@/store/holidayStore";
import { MyTimeOffChart } from "@/components/timeoff/MyTimeOffChart";
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
  const canManageHolidays = role === "super-admin";

  const [activeKey, setActiveKey] = useState<"mine" | "team" | "holidays">("mine");
  const tabs = useMemo(() => {
    const t: { key: "mine" | "team" | "holidays"; label: string }[] = [{ key: "mine", label: "My Time Off" }];
    if (canManageTeam) t.push({ key: "team", label: "My Team Time Off" });
    t.push({ key: "holidays", label: "Holidays" });
    return t;
  }, [canManageTeam]);
  const currentKey = tabs.some((t) => t.key === activeKey) ? activeKey : "mine";
  const tabIndex = Math.max(0, tabs.findIndex((t) => t.key === currentKey));

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

          {currentKey === "mine" && (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {balances.map((b) => (
                <div key={b.key} className="rounded-2xl bg-white/[0.14] px-4 py-3 backdrop-blur-sm">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: b.color }} />
                    <span className="truncate text-xs font-medium text-white/70">{b.label}</span>
                  </div>
                  <div className="mt-1.5 flex items-baseline gap-1">
                    <span className="text-2xl font-bold tabular-nums text-white">{b.available}</span>
                    <span className="text-xs text-white/50">/ {b.total} avail.</span>
                  </div>
                </div>
              ))}
            </div>
          )}

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
        <Tabs value={tabIndex} onChange={(_, v) => setActiveKey(tabs[v].key)} sx={{ minHeight: 40, "& .MuiTab-root": { minHeight: 40, py: 1 } }}>
          {tabs.map((t) => (
            <Tab key={t.key} label={t.label} />
          ))}
        </Tabs>
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
          <div className="rounded-[16px] border border-border/[0.07] bg-surface p-4 shadow-card dark:border-white/[0.06]">
            <h3 className="mb-3 text-sm font-semibold text-text">Leave balance</h3>
            <MyTimeOffChart balances={balances} height={260} />
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
              <div className="divide-y divide-border/[0.06] dark:divide-white/[0.05]">
                {pendingForAction.map((r) => {
                  const emp = employees.find((e) => e.id === r.employeeId);
                  return (
                    <div key={r.id} className="flex items-center gap-3 py-2">
                      <Checkbox size="small" checked={selected.has(r.id)} onChange={() => toggleSelect(r.id)} sx={{ p: 0.5 }} />
                      <button type="button" onClick={() => setDetailsId(r.id)} className="flex flex-1 items-center gap-3 text-left">
                        <span className="text-sm font-medium text-text">{emp?.name}</span>
                        <span className="text-xs text-text-tertiary">{requestLabel(r)} · {r.startDate} → {r.endDate} · {r.durationDays}d</span>
                        <span className="ml-auto"><StatusChip status={r.status} /></span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <TeamCalendar employees={employees} requests={requests} includeInactive={false} onEventClick={(r) => setDetailsId(r.id)} />
        </div>
      ) : (
        /* ─── HOLIDAYS ─── */
        <HolidaysPanel canManage={canManageHolidays} />
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

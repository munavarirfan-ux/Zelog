"use client";

import { useMemo, useState } from "react";
import Drawer from "@mui/material/Drawer";
import MuiTextField from "@mui/material/TextField";
import {
  Briefcase, Check, Clock, FileClock, Globe, Home,
  Inbox as InboxIcon, LogIn, LogOut, Palmtree, RotateCcw,
  Send, Timer, X, type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import { format, parseISO } from "date-fns";
import { Button } from "@/components/ui/button";
import { PersonAvatar } from "@/components/ui/person-avatar";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useAttendanceStore, useHydratedAttendance } from "@/store/attendanceStore";
import { useTimeOffStore, useHydratedTimeOff } from "@/store/timeOffStore";
import {
  requestTypeLabel, type RequestType,
} from "@/data/attendanceData";
import {
  requestColor, requestLabel, type TimeOffRequest,
} from "@/data/timeOffData";
import { MOCK_EMPLOYEES } from "@/data/orgData";
import { cn } from "@/lib/utils";

/* ── Employee directory lookup (covers every mock request author) ── */
const EMP = new Map(MOCK_EMPLOYEES.map((e) => [e.id, e]));
const empName = (id: string) => EMP.get(id)?.name ?? id;
const empAvatar = (id: string) => EMP.get(id)?.avatarUrl;
const empDept = (id: string) => EMP.get(id)?.department ?? "";
const empTitle = (id: string) => EMP.get(id)?.jobTitle ?? "";

/* ── Filter groups ── */
type Group = "time-off" | "wfh" | "attendance";

const GROUP_TABS: { id: "all" | Group; label: string }[] = [
  { id: "all", label: "All requests" },
  { id: "time-off", label: "Time Off" },
  { id: "wfh", label: "Work From Home" },
  { id: "attendance", label: "Attendance" },
];

function groupOfAttendance(type: RequestType): Group {
  if (type === "leave") return "time-off";
  if (type === "wfh") return "wfh";
  return "attendance";
}

/* ── Per request-type visual identity ── */
const TYPE_COLOR: Record<RequestType, string> = {
  leave: "#8B7CF6",
  wfh: "#38BDF8",
  "on-duty": "#22D3EE",
  correction: "#FB923C",
  regularization: "#F59E0B",
  "missed-checkout": "#F43F5E",
  "missed-checkin": "#EC4899",
  overtime: "#A78BFA",
  "shift-change": "#34D399",
};

const TYPE_ICON: Record<RequestType, LucideIcon> = {
  leave: Palmtree,
  wfh: Home,
  "on-duty": Globe,
  correction: FileClock,
  regularization: Clock,
  "missed-checkout": LogOut,
  "missed-checkin": LogIn,
  overtime: Timer,
  "shift-change": Briefcase,
};

/* ── Normalized status across both stores ── */
type UStatus = "pending" | "approved" | "rejected" | "sent-back" | "cancelled" | "changes-requested";

const STATUS_META: Record<UStatus, { label: string; color: string }> = {
  pending: { label: "Pending", color: "#F59E0B" },
  approved: { label: "Approved", color: "#0F9E6E" },
  rejected: { label: "Rejected", color: "#E11D48" },
  "sent-back": { label: "Sent back", color: "#7C3AED" },
  "changes-requested": { label: "Changes requested", color: "#7C3AED" },
  cancelled: { label: "Cancelled", color: "#94A3B8" },
};

type Action = "approve" | "reject" | "send-back";

/* ── The unified item every source normalizes into ── */
interface InboxItem {
  key: string; // unique across sources
  id: string; // store id
  source: "timeoff" | "attendance";
  employeeId: string;
  group: Group;
  typeLabel: string;
  icon: LucideIcon;
  color: string;
  title: string;
  reason: string;
  sortDate: string; // ISO-ish for ordering
  dateLabel: string;
  status: UStatus;
  /** Label for the third (non-approve/reject) action. */
  thirdLabel: string;
  history: { authorId?: string; text: string; at?: string; action?: string }[];
}

function fmt(d: string): string {
  try {
    return format(parseISO(d), "d MMM");
  } catch {
    return d;
  }
}

function timeOffTitle(r: TimeOffRequest): string {
  const type = requestLabel(r);
  const range = r.startDate === r.endDate ? fmt(r.startDate) : `${fmt(r.startDate)} – ${fmt(r.endDate)}`;
  const dur = r.durationType === "half-day" ? "Half day" : `${r.durationDays} day${r.durationDays === 1 ? "" : "s"}`;
  return `${type} · ${range} · ${dur}`;
}

export function InboxHub() {
  useHydratedTimeOff();
  useHydratedAttendance();

  const { currentUser, hasPermission } = useCurrentUser();

  const timeOffRequests = useTimeOffStore((s) => s.requests);
  const setTimeOffStatus = useTimeOffStore((s) => s.setStatus);
  const attendanceRequests = useAttendanceStore((s) => s.requests);
  const decideAttendance = useAttendanceStore((s) => s.decideRequest);

  const [tab, setTab] = useState<"all" | Group>("all");
  const [showResolved, setShowResolved] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);
  const [note, setNote] = useState("");

  // Normalize both stores into one list. No approver scoping — both admin and
  // super-admin act on every request.
  const items = useMemo<InboxItem[]>(() => {
    const timeOff: InboxItem[] = timeOffRequests.map((r) => ({
      key: `to_${r.id}`,
      id: r.id,
      source: "timeoff",
      employeeId: r.employeeId,
      group: "time-off",
      typeLabel: requestLabel(r),
      icon: Palmtree,
      color: requestColor(r),
      title: timeOffTitle(r),
      reason: r.reason,
      sortDate: r.createdAt || r.startDate,
      dateLabel: r.startDate === r.endDate ? fmt(r.startDate) : `${fmt(r.startDate)} – ${fmt(r.endDate)}`,
      status: r.status as UStatus,
      thirdLabel: "Request changes",
      history: r.comments.map((c) => ({ authorId: c.authorId, text: c.text, at: c.at, action: c.action })),
    }));

    const attendance: InboxItem[] = attendanceRequests.map((r) => ({
      key: `at_${r.id}`,
      id: r.id,
      source: "attendance",
      employeeId: r.employeeId,
      group: groupOfAttendance(r.type),
      typeLabel: requestTypeLabel(r.type),
      icon: TYPE_ICON[r.type],
      color: TYPE_COLOR[r.type],
      title: r.detail,
      reason: r.reason,
      sortDate: r.createdAt || r.date,
      dateLabel: fmt(r.date),
      status: r.status as UStatus,
      thirdLabel: "Send back",
      history: r.comment ? [{ text: r.comment }] : [],
    }));

    return [...timeOff, ...attendance].sort((a, b) => {
      // Pending first, then most recent.
      const ap = a.status === "pending" ? 0 : 1;
      const bp = b.status === "pending" ? 0 : 1;
      if (ap !== bp) return ap - bp;
      return b.sortDate.localeCompare(a.sortDate);
    });
  }, [timeOffRequests, attendanceRequests]);

  const pendingCount = (g: "all" | Group) =>
    items.filter((i) => i.status === "pending" && (g === "all" || i.group === g)).length;

  const totalPending = pendingCount("all");

  const filtered = items.filter((i) => {
    if (tab !== "all" && i.group !== tab) return false;
    if (!showResolved && i.status !== "pending") return false;
    return true;
  });

  const active = items.find((i) => i.key === openId) ?? null;

  function act(item: InboxItem, action: Action, comment?: string) {
    const text = comment?.trim() || undefined;
    if (item.source === "timeoff") {
      const status = action === "approve" ? "approved" : action === "reject" ? "rejected" : "changes-requested";
      setTimeOffStatus(item.id, status, currentUser.id, text);
    } else {
      const status = action === "approve" ? "approved" : action === "reject" ? "rejected" : "sent-back";
      decideAttendance(item.id, status, text);
    }
    const verb = action === "approve" ? "Approved" : action === "reject" ? "Rejected" : "Sent back";
    toast.success(`${verb} · ${empName(item.employeeId)}`);
    setOpenId(null);
    setNote("");
  }

  // Employee accounts don't have an inbox; guard directly in case the route is hit.
  if (!hasPermission("inbox.view")) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-[22px] border border-border/[0.07] bg-surface py-20 text-center">
        <InboxIcon className="h-8 w-8 text-text-tertiary" />
        <p className="text-sm font-medium text-text">The Inbox is for admins</p>
        <p className="text-xs text-text-tertiary">Switch to an admin role to review and action requests.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-6">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-[24px] bg-primary-gradient p-6 text-white shadow-[0_18px_40px_-24px_rgba(49,46,129,0.6)]">
        <div className="pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full bg-white/10 blur-2xl" aria-hidden />
        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <span className="flex h-12 w-12 items-center justify-center rounded-[16px] bg-white/15 backdrop-blur">
              <InboxIcon className="h-6 w-6" strokeWidth={2} />
            </span>
            <div>
              <h1 className="text-xl font-semibold tracking-tight">Inbox</h1>
              <p className="text-sm text-white/80">
                {totalPending > 0
                  ? `${totalPending} request${totalPending === 1 ? "" : "s"} waiting on you`
                  : "You're all caught up"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-white/10 p-1 text-sm backdrop-blur">
            <button
              type="button"
              onClick={() => setShowResolved(false)}
              className={cn("rounded-full px-3.5 py-1.5 font-medium transition-colors", !showResolved ? "bg-white text-primary-700" : "text-white/80 hover:text-white")}
            >
              Pending
            </button>
            <button
              type="button"
              onClick={() => setShowResolved(true)}
              className={cn("rounded-full px-3.5 py-1.5 font-medium transition-colors", showResolved ? "bg-white text-primary-700" : "text-white/80 hover:text-white")}
            >
              All
            </button>
          </div>
        </div>
      </div>

      {/* Group tabs */}
      <div className="flex flex-wrap gap-2">
        {GROUP_TABS.map((t) => {
          const activeTab = tab === t.id;
          const count = pendingCount(t.id);
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={cn(
                "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all",
                activeTab
                  ? "border-transparent bg-[rgba(122,77,255,0.12)] text-primary-700"
                  : "border-border/[0.09] bg-surface text-text-secondary hover:bg-surface-2 hover:text-text",
              )}
            >
              {t.label}
              {count > 0 ? (
                <span className={cn("rounded-full px-1.5 py-0.5 text-[10px] font-bold tabular-nums", activeTab ? "bg-primary-700 text-white" : "bg-surface-2 text-text-tertiary")}>{count}</span>
              ) : null}
            </button>
          );
        })}
      </div>

      {/* List */}
      <div className="overflow-hidden rounded-[22px] border border-border/[0.07] bg-surface shadow-[0_1px_2px_rgba(40,30,90,0.04)]">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#34D39918] text-[#0F9E6E]">
              <Check className="h-6 w-6" strokeWidth={2.5} />
            </span>
            <p className="text-sm font-medium text-text">Nothing to review here</p>
            <p className="text-xs text-text-tertiary">{showResolved ? "No requests in this category yet." : "No pending requests in this category."}</p>
          </div>
        ) : (
          <ul className="divide-y divide-border/[0.06]">
            {filtered.map((item) => {
              const Icon = item.icon;
              const st = STATUS_META[item.status];
              const isPending = item.status === "pending";
              return (
                <li
                  key={item.key}
                  className="flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-surface-2/40 sm:px-5"
                >
                  {/* Type icon */}
                  <span
                    className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-[12px] text-white shadow-sm sm:flex"
                    style={{ background: `linear-gradient(135deg, ${item.color}, ${item.color}B3)` }}
                    aria-hidden
                  >
                    <Icon className="h-[18px] w-[18px]" strokeWidth={2} />
                  </span>

                  {/* Person */}
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <PersonAvatar name={empName(item.employeeId)} src={empAvatar(item.employeeId)} size={34} />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-semibold text-text">{empName(item.employeeId)}</p>
                        <span className="hidden shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold md:inline-flex" style={{ color: item.color, backgroundColor: `${item.color}1F` }}>
                          {item.typeLabel}
                        </span>
                      </div>
                      <p className="truncate text-xs text-text-secondary">{item.title}</p>
                    </div>
                  </div>

                  {/* Date */}
                  <span className="hidden shrink-0 text-xs tabular-nums text-text-tertiary sm:block">{item.dateLabel}</span>

                  {/* Actions / status */}
                  <div className="flex shrink-0 items-center gap-1.5">
                    {isPending ? (
                      <>
                        <button
                          type="button"
                          onClick={() => { setOpenId(item.key); setNote(""); }}
                          className="hidden rounded-[9px] border border-border/[0.1] px-2.5 py-1.5 text-xs font-semibold text-text-secondary hover:bg-surface-2 lg:inline-flex"
                        >
                          Review
                        </button>
                        <button type="button" onClick={() => act(item, "approve")} aria-label="Approve" className="flex h-8 w-8 items-center justify-center rounded-[9px] bg-[#34D39922] text-[#0F9E6E] hover:bg-[#34D39933]"><Check className="h-4 w-4" strokeWidth={2.5} /></button>
                        <button type="button" onClick={() => act(item, "reject")} aria-label="Reject" className="flex h-8 w-8 items-center justify-center rounded-[9px] bg-[#F43F5E1A] text-[#E11D48] hover:bg-[#F43F5E2E]"><X className="h-4 w-4" strokeWidth={2.5} /></button>
                        <button type="button" onClick={() => { setOpenId(item.key); setNote(""); }} aria-label={item.thirdLabel} className="flex h-8 w-8 items-center justify-center rounded-[9px] bg-[#8B7CF61A] text-[#7C3AED] hover:bg-[#8B7CF62E]"><RotateCcw className="h-4 w-4" strokeWidth={2.2} /></button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => { setOpenId(item.key); setNote(""); }}
                        className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold"
                        style={{ color: st.color, backgroundColor: `${st.color}1F` }}
                      >
                        {st.label}
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Review drawer */}
      <Drawer anchor="right" open={active !== null} onClose={() => setOpenId(null)} slotProps={{ paper: { sx: { width: 420, maxWidth: "100vw", backgroundImage: "none" } } }}>
        {active ? (
          <div className="flex h-full flex-col p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-semibold text-text">Review request</h2>
              <button type="button" onClick={() => setOpenId(null)} aria-label="Close" className="flex h-8 w-8 items-center justify-center rounded-lg text-text-tertiary hover:bg-surface-2"><X className="h-4 w-4" /></button>
            </div>

            {/* Who */}
            <div className="flex items-center gap-3 rounded-[14px] border border-border/[0.06] bg-surface-2/40 p-3">
              <PersonAvatar name={empName(active.employeeId)} src={empAvatar(active.employeeId)} size={42} />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-text">{empName(active.employeeId)}</p>
                <p className="truncate text-xs text-text-tertiary">{empTitle(active.employeeId)}{empDept(active.employeeId) ? ` · ${empDept(active.employeeId)}` : ""}</p>
              </div>
            </div>

            {/* What */}
            <div className="mt-3 space-y-2.5">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold" style={{ color: active.color, backgroundColor: `${active.color}1F` }}>
                  <active.icon className="h-3.5 w-3.5" strokeWidth={2} />
                  {active.typeLabel}
                </span>
                <span className="text-xs tabular-nums text-text-tertiary">{active.dateLabel}</span>
                <span className="ml-auto inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold" style={{ color: STATUS_META[active.status].color, backgroundColor: `${STATUS_META[active.status].color}1F` }}>
                  {STATUS_META[active.status].label}
                </span>
              </div>
              <p className="text-sm font-medium text-text">{active.title}</p>
              <div className="rounded-[12px] bg-surface-2/40 p-3 text-sm text-text-secondary">{active.reason || "No reason provided."}</div>
            </div>

            {/* History */}
            {active.history.length > 0 ? (
              <div className="mt-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-tertiary">Activity</p>
                <ul className="space-y-2">
                  {active.history.map((c, i) => (
                    <li key={i} className="rounded-[12px] border border-border/[0.06] bg-surface p-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-text">{c.authorId ? empName(c.authorId) : "Note"}</span>
                        {c.at ? <span className="text-[11px] tabular-nums text-text-tertiary">{fmt(c.at)}</span> : null}
                      </div>
                      <p className="mt-1 text-sm text-text-secondary">{c.text}</p>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {/* Action footer — only for pending items */}
            {active.status === "pending" ? (
              <>
                <div className="mt-4">
                  <label className="mb-1.5 block text-xs font-medium text-text-secondary">Comment to employee <span className="text-text-tertiary">(optional)</span></label>
                  <MuiTextField value={note} onChange={(e) => setNote(e.target.value)} multiline minRows={3} fullWidth placeholder="Add a note…" sx={{ "& .MuiOutlinedInput-root": { borderRadius: "12px" } }} />
                </div>
                <div className="mt-auto flex flex-col gap-2 pt-4">
                  <div className="flex gap-2">
                    <Button className="flex-1" onClick={() => act(active, "approve", note)}>Approve</Button>
                    <Button variant="outline" className="flex-1 text-[#E11D48]" onClick={() => act(active, "reject", note)}>Reject</Button>
                  </div>
                  <Button variant="outline" className="gap-1.5" onClick={() => act(active, "send-back", note)}><Send className="h-4 w-4" /> {active.thirdLabel}</Button>
                </div>
              </>
            ) : (
              <p className="mt-auto pt-4 text-center text-xs text-text-tertiary">This request has been {STATUS_META[active.status].label.toLowerCase()}.</p>
            )}
          </div>
        ) : null}
      </Drawer>
    </div>
  );
}

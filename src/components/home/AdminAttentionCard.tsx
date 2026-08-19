"use client";

import { useEffect, useState } from "react";
import MuiTooltip from "@mui/material/Tooltip";
import { format, parseISO } from "date-fns";
import { AlertCircle, Bell, Check, CheckCircle2, X } from "lucide-react";
import { toast } from "sonner";
import { PanelCard, TINT } from "./HomeUI";
import { PersonAvatar } from "@/components/ui/person-avatar";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useTimeOffStore } from "@/store/timeOffStore";
import { getEmployee, leaveColor, leaveName } from "@/data/homeData";
import type { TimeOffRequest } from "@/data/timeOffData";
import { cn } from "@/lib/utils";

const REMINDER_COOLDOWN_MS = 12 * 60 * 1000;

type Tab = "leave" | "wfh";
const TAB_COLOR: Record<Tab, string> = { leave: "#F472B6", wfh: "#38BDF8" };

interface AdminAttentionCardProps {
  leavePending: TimeOffRequest[];
  wfhPending: TimeOffRequest[];
  href?: string;
  emailEnabled?: boolean;
  className?: string;
}

function rangeLabel(start: string, end: string): string {
  const s = parseISO(start);
  const e = parseISO(end);
  if (start === end) return format(s, "d MMM");
  if (format(s, "MMM") === format(e, "MMM")) return `${format(s, "d")}–${format(e, "d MMM")}`;
  return `${format(s, "d MMM")} – ${format(e, "d MMM")}`;
}

export function AdminAttentionCard({ leavePending, wfhPending, className }: AdminAttentionCardProps) {
  const { currentUser } = useCurrentUser();
  const setStatus = useTimeOffStore((s) => s.setStatus);

  const [tab, setTab] = useState<Tab>("leave");

  // Prefer showing the tab that has work; fall back to leave.
  useEffect(() => {
    if (leavePending.length === 0 && wfhPending.length > 0) setTab("wfh");
    else if (wfhPending.length === 0 && leavePending.length > 0) setTab("leave");
  }, [leavePending.length, wfhPending.length]);

  const active = tab === "leave" ? leavePending : wfhPending;
  const allClear = leavePending.length === 0 && wfhPending.length === 0;

  function decide(req: TimeOffRequest, status: "approved" | "rejected") {
    const name = getEmployee(req.employeeId)?.name ?? "the request";
    setStatus(req.id, status, currentUser.id, status === "approved" ? "Approved from Home" : "Declined from Home");
    toast.success(`${status === "approved" ? "Approved" : "Declined"} ${name}'s request`);
  }

  return (
    <PanelCard title="Needs your attention" icon={AlertCircle} tint={TINT.attention} className={className}>
      {allClear ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 py-10 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#34D3991A] text-[#0F9E6E]">
            <CheckCircle2 className="h-6 w-6" strokeWidth={2} />
          </span>
          <p className="text-sm font-medium text-text-secondary">You&apos;re all caught up</p>
        </div>
      ) : (
        <>
          {/* Tabs */}
          <div className="mb-3 flex items-center gap-1 rounded-[12px] border border-border/[0.06] bg-white/50 p-1">
            <TabButton label="Leave" count={leavePending.length} color={TAB_COLOR.leave} active={tab === "leave"} onClick={() => setTab("leave")} />
            <TabButton label="WFH" count={wfhPending.length} color={TAB_COLOR.wfh} active={tab === "wfh"} onClick={() => setTab("wfh")} />
          </div>

          {/* People list */}
          {active.length === 0 ? (
            <div className="flex items-center justify-center rounded-[14px] bg-white/50 px-4 py-8 text-center text-sm text-text-tertiary">
              No pending {tab === "leave" ? "leave" : "WFH"} requests
            </div>
          ) : (
            <ul className="max-h-[320px] space-y-2 overflow-y-auto pr-0.5">
              {active.map((req) => (
                <RequestRow key={req.id} req={req} tab={tab} onDecide={decide} />
              ))}
            </ul>
          )}
        </>
      )}
    </PanelCard>
  );
}

function TabButton({ label, count, color, active, onClick }: { label: string; count: number; color: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "flex h-9 flex-1 items-center justify-center gap-1.5 rounded-[9px] text-sm font-semibold transition-colors",
        active ? "bg-white shadow-sm text-text" : "text-text-secondary hover:text-text",
      )}
    >
      {label}
      <span
        className="flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[11px] font-bold tabular-nums"
        style={active ? { backgroundColor: color, color: "#fff" } : { backgroundColor: `${color}26`, color }}
      >
        {count}
      </span>
    </button>
  );
}

function RequestRow({
  req,
  tab,
  onDecide,
}: {
  req: TimeOffRequest;
  tab: Tab;
  onDecide: (req: TimeOffRequest, status: "approved" | "rejected") => void;
}) {
  const [notified, setNotified] = useState(false);
  const emp = getEmployee(req.employeeId);
  if (!emp) return null;

  function notifyManager() {
    if (notified) return;
    const names = Array.from(new Set(req.approverIds)).map((id) => getEmployee(id)?.name).filter(Boolean) as string[];
    const label = names.length === 1 ? names[0] : `${names.length} reporting managers`;
    toast.success(`Reminder sent to ${label}`);
    setNotified(true);
    setTimeout(() => setNotified(false), REMINDER_COOLDOWN_MS);
  }
  const color = tab === "leave" ? leaveColor(req.leaveTypeId ?? "") : TAB_COLOR.wfh;
  const typeLabel = tab === "leave" ? leaveName(req.leaveTypeId ?? "") : "Work From Home";
  const dur = `${req.durationDays}${req.durationDays === 1 ? " day" : req.durationType === "half-day" ? " day" : " days"}`;

  return (
    <li className="flex items-center gap-3 rounded-[14px] border border-border/[0.05] bg-white/60 p-2.5">
      <PersonAvatar name={emp.name} src={emp.avatarUrl} size={36} />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold text-text">{emp.name}</span>
        <span className="block truncate text-xs text-text-secondary">
          <span style={{ color }} className="font-medium">{typeLabel}</span>
          {" · "}{dur} · {rangeLabel(req.startDate, req.endDate)}
        </span>
      </span>

      <div className="flex shrink-0 items-center gap-1">
        <MuiTooltip title="Approve" placement="top" arrow>
          <button
            type="button"
            onClick={() => onDecide(req, "approved")}
            aria-label={`Approve ${emp.name}'s request`}
            className="inline-flex h-8 w-8 items-center justify-center rounded-[9px] bg-[#34D39922] text-[#0F9E6E] transition-colors hover:bg-[#34D39933] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/40"
          >
            <Check className="h-4 w-4" strokeWidth={2.5} />
          </button>
        </MuiTooltip>
        <MuiTooltip title="Decline" placement="top" arrow>
          <button
            type="button"
            onClick={() => onDecide(req, "rejected")}
            aria-label={`Decline ${emp.name}'s request`}
            className="inline-flex h-8 w-8 items-center justify-center rounded-[9px] bg-[#F43F5E1A] text-[#E11D48] transition-colors hover:bg-[#F43F5E2E] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400/40"
          >
            <X className="h-4 w-4" strokeWidth={2.5} />
          </button>
        </MuiTooltip>
        <MuiTooltip title={notified ? "Reminder sent" : "Send reminder to reporting manager"} placement="top" arrow>
          <span>
            <button
              type="button"
              onClick={notifyManager}
              disabled={notified}
              aria-label={`Send reminder about ${emp.name}'s request`}
              className="inline-flex h-8 w-8 items-center justify-center rounded-[9px] text-text-tertiary transition-colors hover:bg-white hover:text-primary-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400/40 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Bell className="h-4 w-4" strokeWidth={2} />
            </button>
          </span>
        </MuiTooltip>
      </div>
    </li>
  );
}

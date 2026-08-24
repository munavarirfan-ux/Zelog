"use client";

import { useState } from "react";
import Dialog from "@mui/material/Dialog";
import MuiTooltip from "@mui/material/Tooltip";
import { format, parseISO } from "date-fns";
import { AlertCircle, Bell, CalendarDays, Check, CheckCircle2, Clock, MessageSquareText, UserCheck, X } from "lucide-react";
import { toast } from "sonner";
import { PanelCard, TINT } from "./HomeUI";
import { PersonAvatar } from "@/components/ui/person-avatar";
import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useTimeOffStore } from "@/store/timeOffStore";
import { getEmployee, leaveColor, leaveName } from "@/data/homeData";
import type { TimeOffRequest } from "@/data/timeOffData";

const REMINDER_COOLDOWN_MS = 12 * 60 * 1000;

interface AdminAttentionCardProps {
  leavePending: TimeOffRequest[];
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

/** Type label + accent color for a leave request. */
function typeInfo(req: TimeOffRequest): { label: string; color: string } {
  return { label: leaveName(req.leaveTypeId ?? ""), color: leaveColor(req.leaveTypeId ?? "") };
}

function durationText(req: TimeOffRequest): string {
  return `${req.durationDays}${req.durationDays === 1 || req.durationType === "half-day" ? " day" : " days"}`;
}

function halfDayLabel(session?: string): string | null {
  if (session === "first-half") return "First half";
  if (session === "second-half") return "Second half";
  return null;
}

export function AdminAttentionCard({ leavePending, className }: AdminAttentionCardProps) {
  const { currentUser } = useCurrentUser();
  const setStatus = useTimeOffStore((s) => s.setStatus);

  const [detail, setDetail] = useState<TimeOffRequest | null>(null);

  const active = leavePending;
  const allClear = leavePending.length === 0;

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
        <ul className="max-h-[320px] space-y-2 overflow-y-auto pr-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {active.map((req) => (
            <RequestRow key={req.id} req={req} onDecide={decide} onOpen={() => setDetail(req)} />
          ))}
        </ul>
      )}

      <RequestDetailDialog
        req={detail}
        onClose={() => setDetail(null)}
        onDecide={(req, status) => {
          decide(req, status);
          setDetail(null);
        }}
      />
    </PanelCard>
  );
}

function RequestRow({
  req,
  onDecide,
  onOpen,
}: {
  req: TimeOffRequest;
  onDecide: (req: TimeOffRequest, status: "approved" | "rejected") => void;
  onOpen: () => void;
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
  const { label: typeLabel, color } = typeInfo(req);
  const dur = durationText(req);

  return (
    <li className="flex items-center gap-3 rounded-[14px] border border-border/[0.05] bg-white/60 p-2.5">
      <MuiTooltip title="View details" placement="top" arrow>
        <button
          type="button"
          onClick={onOpen}
          aria-label={`View ${emp.name}'s request details`}
          className="-m-1 flex min-w-0 flex-1 items-center gap-3 rounded-[12px] p-1 text-left transition-colors hover:bg-[rgba(122,77,255,0.05)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400/40"
        >
          <PersonAvatar name={emp.name} src={emp.avatarUrl} size={36} />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-semibold text-text">{emp.name}</span>
            <span className="mt-1 flex items-center gap-1.5">
              <span
                className="inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[10px] font-semibold"
                style={{ color, backgroundColor: `${color}1F` }}
              >
                {typeLabel}
              </span>
              <span className="truncate text-xs text-text-tertiary">{dur} · {rangeLabel(req.startDate, req.endDate)}</span>
            </span>
          </span>
        </button>
      </MuiTooltip>

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

/* ── Request detail dialog ── */

function DetailRow({ icon: Icon, label, children }: { icon: typeof CalendarDays; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-surface-2 text-text-tertiary">
        <Icon className="h-4 w-4" strokeWidth={2} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-medium uppercase tracking-wide text-text-tertiary">{label}</p>
        <div className="mt-0.5 text-sm text-text">{children}</div>
      </div>
    </div>
  );
}

function RequestDetailDialog({
  req,
  onClose,
  onDecide,
}: {
  req: TimeOffRequest | null;
  onClose: () => void;
  onDecide: (req: TimeOffRequest, status: "approved" | "rejected") => void;
}) {
  const emp = req ? getEmployee(req.employeeId) : null;
  const { label: typeLabel, color } = req ? typeInfo(req) : { label: "", color: "#999" };
  const approvers = req
    ? Array.from(new Set(req.approverIds)).map((id) => getEmployee(id)?.name).filter(Boolean).join(", ")
    : "";
  const half = req ? halfDayLabel(req.halfDaySession) : null;

  return (
    <Dialog
      open={req !== null}
      onClose={onClose}
      slotProps={{ paper: { sx: { borderRadius: "20px", maxWidth: 460, width: "100%", backgroundImage: "none" } } }}
    >
      {req && emp ? (
        <div className="p-5 sm:p-6">
          {/* Header */}
          <div className="mb-5 flex items-start gap-3">
            <PersonAvatar name={emp.name} src={emp.avatarUrl} size={44} />
            <div className="min-w-0 flex-1">
              <h2 className="truncate text-base font-semibold text-text">{emp.name}</h2>
              <p className="truncate text-sm text-text-secondary">{emp.jobTitle} · {emp.department}</p>
            </div>
            <span
              className="inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-[11px] font-semibold"
              style={{ color, backgroundColor: `${color}1F` }}
            >
              {typeLabel}
            </span>
            <button type="button" onClick={onClose} aria-label="Close" className="-mr-1 -mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-text-tertiary transition-colors hover:bg-surface-2">
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Details */}
          <div className="space-y-4">
            <DetailRow icon={CalendarDays} label="Dates">
              {rangeLabel(req.startDate, req.endDate)}
              {half ? <span className="text-text-tertiary"> · {half}</span> : null}
            </DetailRow>
            <DetailRow icon={Clock} label="Duration">{durationText(req)}</DetailRow>
            {approvers ? <DetailRow icon={UserCheck} label="Approver">{approvers}</DetailRow> : null}
            <DetailRow icon={MessageSquareText} label="Reason">
              {req.reason?.trim() ? req.reason : <span className="text-text-tertiary">No reason provided</span>}
            </DetailRow>
          </div>

          <p className="mt-4 text-[11px] text-text-tertiary">Requested on {format(parseISO(req.createdAt), "d MMM yyyy")}</p>

          {/* Actions */}
          <div className="mt-5 flex justify-end gap-2">
            <Button variant="outline" className="gap-1.5 text-[#E11D48] hover:bg-[#F43F5E12]" onClick={() => onDecide(req, "rejected")}>
              <X className="h-4 w-4" /> Decline
            </Button>
            <Button className="gap-1.5" onClick={() => onDecide(req, "approved")}>
              <Check className="h-4 w-4" /> Approve
            </Button>
          </div>
        </div>
      ) : null}
    </Dialog>
  );
}

"use client";

import { useState } from "react";
import Menu from "@mui/material/Menu";
import MuiMenuItem from "@mui/material/MenuItem";
import { format, parseISO } from "date-fns";
import { Eye, MoreHorizontal, Pencil, Ban } from "lucide-react";
import { requestColor, requestLabel, type TimeOffRequest } from "@/data/timeOffData";
import { StatusChip } from "./StatusChip";

function dateRange(r: TimeOffRequest): string {
  const s = parseISO(r.startDate);
  const e = parseISO(r.endDate);
  if (r.startDate === r.endDate) return format(s, "MMM d, yyyy");
  return `${format(s, "MMM d")} – ${format(e, "MMM d, yyyy")}`;
}

function duration(r: TimeOffRequest): string {
  if (r.durationType === "half-day") return `Half day (${r.halfDaySession === "second-half" ? "2nd" : "1st"})`;
  return `${r.durationDays} day${r.durationDays === 1 ? "" : "s"}`;
}

interface RequestHistoryTableProps {
  requests: TimeOffRequest[];
  onView: (r: TimeOffRequest) => void;
  onEdit: (r: TimeOffRequest) => void;
  onCancel: (r: TimeOffRequest) => void;
}

export function RequestHistoryTable({ requests, onView, onEdit, onCancel }: RequestHistoryTableProps) {
  const [menu, setMenu] = useState<{ anchor: HTMLElement; req: TimeOffRequest } | null>(null);

  return (
    <div className="overflow-x-auto rounded-[16px] border border-border/[0.07] bg-surface shadow-card dark:border-white/[0.06]">
      <div className="min-w-[820px]">
        <div className="grid grid-cols-[1.3fr_1.3fr_1fr_1.4fr_1fr_1fr_44px] items-center gap-3 border-b border-border/[0.06] bg-[#F3F0FF] px-5 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-text-secondary dark:bg-white/[0.04] dark:border-white/[0.05]">
          <span>Type</span>
          <span>Date range</span>
          <span>Duration</span>
          <span>Reason</span>
          <span>Status</span>
          <span>Applied on</span>
          <span />
        </div>
        <div className="divide-y divide-border/[0.06] dark:divide-white/[0.05]">
          {requests.length === 0 && <p className="px-5 py-8 text-center text-sm text-text-tertiary">No requests yet.</p>}
          {requests.map((r) => {
            const canEdit = r.status === "pending" || r.status === "changes-requested";
            const canCancel = r.status === "pending" || r.status === "approved" || r.status === "changes-requested";
            return (
              <div key={r.id} className="grid grid-cols-[1.3fr_1.3fr_1fr_1.4fr_1fr_1fr_44px] items-center gap-3 px-5 py-3 transition-colors hover:bg-[rgba(99,102,241,0.03)]">
                <span className="inline-flex items-center gap-2 text-sm font-medium text-text">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: requestColor(r) }} />
                  {requestLabel(r)}
                </span>
                <span className="text-sm text-text-secondary">{dateRange(r)}</span>
                <span className="text-sm tabular-nums text-text-secondary">{duration(r)}</span>
                <span className="truncate text-sm text-text-secondary" title={r.reason}>{r.reason}</span>
                <span><StatusChip status={r.status} /></span>
                <span className="text-xs text-text-tertiary">{format(parseISO(r.createdAt), "MMM d")}</span>
                <button
                  type="button"
                  onClick={(e) => setMenu({ anchor: e.currentTarget, req: r })}
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-text-tertiary hover:bg-surface-2"
                  aria-label="Actions"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <Menu
        anchorEl={menu?.anchor}
        open={Boolean(menu)}
        onClose={() => setMenu(null)}
        slotProps={{ paper: { className: "!rounded-[14px] !border !border-border/[0.07] !bg-surface !shadow-float dark:!border-white/[0.06]", sx: { backgroundImage: "none", minWidth: 180 } }, list: { className: "!p-1.5" } }}
      >
        <MuiMenuItem onClick={() => { if (menu) onView(menu.req); setMenu(null); }} sx={{ borderRadius: "8px", mx: 0.5, px: 1.5, py: 1, fontSize: "0.875rem", gap: 1.25 }}>
          <Eye className="h-4 w-4" /> View details
        </MuiMenuItem>
        {menu && (menu.req.status === "pending" || menu.req.status === "changes-requested") && (
          <MuiMenuItem onClick={() => { onEdit(menu.req); setMenu(null); }} sx={{ borderRadius: "8px", mx: 0.5, px: 1.5, py: 1, fontSize: "0.875rem", gap: 1.25 }}>
            <Pencil className="h-4 w-4" /> Edit request
          </MuiMenuItem>
        )}
        {menu && (menu.req.status === "pending" || menu.req.status === "approved" || menu.req.status === "changes-requested") && (
          <MuiMenuItem onClick={() => { onCancel(menu.req); setMenu(null); }} sx={{ borderRadius: "8px", mx: 0.5, px: 1.5, py: 1, fontSize: "0.875rem", gap: 1.25, color: "rgb(var(--danger-rgb))" }}>
            <Ban className="h-4 w-4" /> Cancel request
          </MuiMenuItem>
        )}
      </Menu>
    </div>
  );
}

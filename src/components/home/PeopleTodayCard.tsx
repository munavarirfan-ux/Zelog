"use client";

import { Palmtree, Laptop, PartyPopper, Sunrise } from "lucide-react";
import { PanelCard, TINT } from "./HomeUI";
import { PersonRow } from "./PersonRow";
import {
  getEmployee,
  leaveColor,
  leaveName,
  WFH_COLOR,
  type OnLeaveEntry,
  type WfhEntry,
} from "@/data/homeData";

function Badge({ label, color }: { label: string; color: string }) {
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold"
      style={{ color, backgroundColor: `${color}1F` }}
    >
      {label}
    </span>
  );
}

function personHref(canView: boolean, employeeId: string): string | undefined {
  return canView ? `/organization?employee=${employeeId}` : undefined;
}

/** Green for approved statuses, neutral WFH blue otherwise. */
const APPROVED_COLOR = "#0F9E6E";
function wfhStatusColor(label: string): string {
  return /approved/i.test(label) ? APPROVED_COLOR : WFH_COLOR;
}

/** List body: scrolls past ~5 people so the card stays a consistent height. */
const listClass = "max-h-[300px] space-y-1 overflow-y-auto pr-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden";

export function OnLeaveTodayCard({
  entries,
  canViewProfiles,
  title = "On Leave Today",
  emptyMessage = "Everyone is available today",
  className,
}: {
  entries: OnLeaveEntry[];
  canViewProfiles: boolean;
  title?: string;
  emptyMessage?: string;
  className?: string;
}) {
  return (
    <PanelCard
      title={title}
      icon={Palmtree}
      tint={TINT.leave}
      isEmpty={entries.length === 0}
      emptyMessage={emptyMessage}
      emptyIcon={Sunrise}
      className={className}
    >
      <div className={listClass}>
        {entries.map((e) => {
          const emp = getEmployee(e.employeeId);
          if (!emp) return null;
          return (
            <PersonRow
              key={e.employeeId}
              name={emp.name}
              avatarUrl={emp.avatarUrl}
              href={personHref(canViewProfiles, e.employeeId)}
              secondary={`${emp.department} · ${e.dayPart} · ${e.returnLabel}`}
              right={<Badge label={leaveName(e.leaveTypeId)} color={leaveColor(e.leaveTypeId)} />}
            />
          );
        })}
      </div>
    </PanelCard>
  );
}

export function WorkingFromHomeCard({
  entries,
  canViewProfiles,
  title = "Working From Home",
  emptyMessage = "No one is working remotely today",
  className,
}: {
  entries: WfhEntry[];
  canViewProfiles: boolean;
  title?: string;
  emptyMessage?: string;
  className?: string;
}) {
  return (
    <PanelCard
      title={title}
      icon={Laptop}
      tint={TINT.wfh}
      isEmpty={entries.length === 0}
      emptyMessage={emptyMessage}
      emptyIcon={PartyPopper}
      className={className}
    >
      <div className={listClass}>
        {entries.map((e) => {
          const emp = getEmployee(e.employeeId);
          if (!emp) return null;
          return (
            <PersonRow
              key={e.employeeId}
              name={emp.name}
              avatarUrl={emp.avatarUrl}
              href={personHref(canViewProfiles, e.employeeId)}
              secondary={`${emp.department} · WFH · ${e.dayPart}`}
              right={e.statusLabel ? <Badge label={e.statusLabel} color={wfhStatusColor(e.statusLabel)} /> : undefined}
            />
          );
        })}
      </div>
    </PanelCard>
  );
}

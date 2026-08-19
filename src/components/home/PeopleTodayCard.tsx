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

export function OnLeaveTodayCard({ entries, canViewProfiles }: { entries: OnLeaveEntry[]; canViewProfiles: boolean }) {
  return (
    <PanelCard
      title="On Leave Today"
      icon={Palmtree}
      tint={TINT.leave}
      isEmpty={entries.length === 0}
      emptyMessage="Everyone is available today"
      emptyIcon={Sunrise}
    >
      <div className="space-y-1">
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

export function WorkingFromHomeCard({ entries, canViewProfiles }: { entries: WfhEntry[]; canViewProfiles: boolean }) {
  return (
    <PanelCard
      title="Working From Home"
      icon={Laptop}
      tint={TINT.wfh}
      isEmpty={entries.length === 0}
      emptyMessage="No one is working remotely today"
      emptyIcon={PartyPopper}
    >
      <div className="space-y-1">
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
              right={e.statusLabel ? <Badge label={e.statusLabel} color={WFH_COLOR} /> : undefined}
            />
          );
        })}
      </div>
    </PanelCard>
  );
}

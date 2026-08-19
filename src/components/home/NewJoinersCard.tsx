"use client";

import { Sparkles, UserPlus } from "lucide-react";
import { PanelCard, TINT } from "./HomeUI";
import { PersonRow } from "./PersonRow";
import { getEmployee, formatJoinDate, type NewJoinerEntry } from "@/data/homeData";

export function NewJoinersCard({ entries, canViewProfiles, className }: { entries: NewJoinerEntry[]; canViewProfiles: boolean; className?: string }) {
  return (
    <PanelCard
      title="New Joiners"
      icon={Sparkles}
      tint={TINT.joiners}
      isEmpty={entries.length === 0}
      emptyMessage="No recent joiners"
      emptyIcon={UserPlus}
      className={className}
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
              href={canViewProfiles ? `/organization?employee=${e.employeeId}` : undefined}
              secondary={`${emp.jobTitle} · ${emp.department}`}
              right={
                <span className="flex flex-col items-end gap-1">
                  <span className="inline-flex items-center rounded-full bg-[#34D3991F] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#0F9E6E]">
                    New
                  </span>
                  <span className="text-[11px] text-text-tertiary">{formatJoinDate(e.joinDate)}</span>
                </span>
              }
            />
          );
        })}
      </div>
    </PanelCard>
  );
}

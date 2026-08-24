"use client";

import * as React from "react";
import { useMemo } from "react";
import { Briefcase, CalendarClock, Laptop, MapPin, Network, User } from "lucide-react";
import { computeBalances, MOCK_REQUESTS } from "@/data/timeOffData";
import { useDirectoryStore } from "@/store/directoryStore";
import { projectName, workModeLabel, employmentTypeLabel } from "@/data/directoryData";
import { departmentColor } from "@/data/orgData";
import { Avatar, type DirectoryPerson } from "../shared";
import { Section, InfoGrid, Info, Empty } from "./parts";

export function OverviewTab({
  person,
  nameById,
  onNavigate,
}: {
  person: DirectoryPerson;
  nameById: Map<string, string>;
  onNavigate: (tab: any) => void;
}) {
  const allAllocations = useDirectoryStore((s) => s.allocations);
  const allAssets = useDirectoryStore((s) => s.assets);
  const adjustments = useDirectoryStore((s) => s.leaveAdjustments);

  const allocations = useMemo(() => allAllocations.filter((a) => a.employeeId === person.id && a.status === "active"), [allAllocations, person.id]);
  const assets = useMemo(() => allAssets.filter((a) => a.employeeId === person.id && a.status === "assigned"), [allAssets, person.id]);

  const balances = useMemo(() => {
    const base = computeBalances(person.id, MOCK_REQUESTS);
    return base.map((b) => {
      const delta = adjustments.filter((a) => a.employeeId === person.id && a.leaveTypeId === b.key).reduce((s, a) => s + a.delta, 0);
      return { ...b, available: Math.max(0, b.available + delta) };
    });
  }, [person.id, adjustments]);

  const e = person.extra;

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {/* Profile summary */}
      <Section title="Profile Summary" icon={User}>
        <InfoGrid>
          <Info label="Work Email" value={person.email} />
          <Info label="Phone" value={e?.phone} />
          <Info label="Employment Type" value={employmentTypeLabel(e?.employmentType)} />
          <Info label="Work Mode" value={workModeLabel(e?.workMode)} />
          <Info label="Location" value={<span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5 text-text-tertiary" />{e?.workLocation}</span>} />
          <Info label="Joined" value={e?.joiningDate} />
        </InfoGrid>
      </Section>

      {/* Reporting */}
      <Section title="Reporting" icon={Network} tint="#38BDF8">
        <InfoGrid>
          <Info label="Manager" value={person.managerId ? nameById.get(person.managerId) : "—"} />
          <Info label="Additional Manager" value={person.additionalManagerId ? nameById.get(person.additionalManagerId) : "—"} />
          <Info label="HR Manager" value={person.hrManagerId ? nameById.get(person.hrManagerId) : "—"} />
          <Info label="Department Head" value={person.headId ? nameById.get(person.headId) : "—"} />
        </InfoGrid>
      </Section>

      {/* Today's status */}
      <Section title="Today's Status" icon={CalendarClock} tint="#34D399">
        <div className="flex items-center justify-between rounded-[12px] bg-surface-2/60 px-4 py-3">
          <div>
            <p className="text-sm font-semibold text-text">
              {person.employmentStatus === "on-leave" ? "On Leave" : person.employmentStatus === "inactive" ? "Inactive" : "Working"}
            </p>
            <p className="text-xs text-text-tertiary">{workModeLabel(e?.workMode)} · {e?.workLocation}</p>
          </div>
          <button onClick={() => onNavigate("Attendance")} className="text-xs font-medium text-primary-700 hover:underline">View attendance</button>
        </div>
      </Section>

      {/* Leave snapshot */}
      <Section title="Leave Snapshot" icon={CalendarClock} tint="#F59E0B" action={<button onClick={() => onNavigate("Leave")} className="text-xs font-medium text-primary-700 hover:underline">Details</button>}>
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          {balances.map((b) => (
            <div key={b.key} className="rounded-[12px] border border-border/[0.07] p-3">
              <p className="text-lg font-bold tabular-nums" style={{ color: b.color }}>{b.available}</p>
              <p className="text-[11px] text-text-tertiary">{b.label.replace(" Leave", "")}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Projects */}
      <Section title="Projects" icon={Briefcase} tint="#8B7CF6" action={<button onClick={() => onNavigate("Projects")} className="text-xs font-medium text-primary-700 hover:underline">All projects</button>}>
        {allocations.length === 0 ? (
          <Empty>No active projects.</Empty>
        ) : (
          <ul className="space-y-2.5">
            {allocations.slice(0, 3).map((a) => (
              <li key={a.id} className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-text">{projectName(a.projectId)}</p>
                  <p className="truncate text-xs text-text-tertiary">{a.role} · {a.allocationPct}%</p>
                </div>
                {a.billable ? <span className="shrink-0 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">Billable</span> : null}
              </li>
            ))}
          </ul>
        )}
      </Section>

      {/* Assets */}
      <Section title="Assets" icon={Laptop} tint="#FB7185" action={<button onClick={() => onNavigate("Assets")} className="text-xs font-medium text-primary-700 hover:underline">All assets</button>}>
        {assets.length === 0 ? (
          <Empty>No assets assigned.</Empty>
        ) : (
          <ul className="space-y-2.5">
            {assets.slice(0, 3).map((a) => (
              <li key={a.id} className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-text">{a.name}</p>
                  <p className="truncate text-xs text-text-tertiary">{a.category} · {a.assetId}</p>
                </div>
                <span className="shrink-0 text-[11px] text-text-tertiary">{a.condition}</span>
              </li>
            ))}
          </ul>
        )}
      </Section>
    </div>
  );
}

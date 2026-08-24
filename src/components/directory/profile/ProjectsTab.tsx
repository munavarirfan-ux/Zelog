"use client";

import * as React from "react";
import { useMemo } from "react";
import { Briefcase, CheckCircle2, Clock, Plus, X } from "lucide-react";
import { useDirectoryStore } from "@/store/directoryStore";
import { projectName, projectClient } from "@/data/directoryData";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import type { DirectoryPerson } from "../shared";
import { Section, Empty } from "./parts";

export function ProjectsTab({ person, canEdit, onAssign }: { person: DirectoryPerson; canEdit: boolean; onAssign: () => void }) {
  const { currentUser } = useCurrentUser();
  const allAllocations = useDirectoryStore((s) => s.allocations);
  const removeAllocation = useDirectoryStore((s) => s.removeAllocation);

  const allocations = useMemo(() => allAllocations.filter((a) => a.employeeId === person.id), [allAllocations, person.id]);
  const current = useMemo(() => allocations.filter((a) => a.status === "active"), [allocations]);
  const previous = useMemo(() => allocations.filter((a) => a.status === "completed"), [allocations]);

  return (
    <div className="space-y-4">
      <p className="text-xs text-text-tertiary">Project allocations sync to <span className="font-medium text-text-secondary">ZE[LOG]</span> for time tracking.</p>

      <Section
        title="Current Projects"
        icon={Briefcase}
        action={canEdit ? (
          <button onClick={onAssign} className="inline-flex items-center gap-1.5 rounded-[10px] bg-primary-gradient px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:opacity-95">
            <Plus className="h-3.5 w-3.5" /> Assign Project
          </button>
        ) : undefined}
      >
        {current.length === 0 ? (
          <Empty>No active project allocations.</Empty>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {current.map((a) => (
              <div key={a.id} className="rounded-[14px] border border-border/[0.08] p-4">
                <div className="mb-2 flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-text">{projectName(a.projectId)}</p>
                    {projectClient(a.projectId) ? <p className="truncate text-xs text-text-tertiary">{projectClient(a.projectId)}</p> : null}
                  </div>
                  {a.billable ? <span className="shrink-0 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">Billable</span> : <span className="shrink-0 rounded-full bg-surface-2 px-2 py-0.5 text-[11px] font-medium text-text-tertiary">Non-billable</span>}
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-text-secondary">
                  <span>{a.role}</span>
                  <span className="inline-flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-primary-400" />{a.allocationPct}% allocated</span>
                  <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5 text-text-tertiary" />{a.trackedHours}h tracked</span>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <p className="text-[11px] text-text-tertiary">Since {a.startDate}</p>
                  {canEdit ? (
                    <button onClick={() => removeAllocation(a.id, currentUser.id)} className="inline-flex items-center gap-1 text-[11px] font-medium text-rose-500 hover:underline">
                      <X className="h-3 w-3" /> Unassign
                    </button>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>

      <Section title="Previous Projects" icon={CheckCircle2} tint="#94A3B8">
        {previous.length === 0 ? (
          <Empty>No completed projects.</Empty>
        ) : (
          <ul className="space-y-2.5">
            {previous.map((a) => (
              <li key={a.id} className="flex items-center justify-between gap-3 rounded-[12px] border border-border/[0.07] p-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-text">{projectName(a.projectId)}</p>
                  <p className="truncate text-xs text-text-tertiary">{a.role} · {a.trackedHours}h · {a.startDate} → {a.endDate ?? "—"}</p>
                </div>
                <span className="shrink-0 rounded-full bg-surface-2 px-2 py-0.5 text-[11px] font-medium text-text-tertiary">Completed</span>
              </li>
            ))}
          </ul>
        )}
      </Section>
    </div>
  );
}

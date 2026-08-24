"use client";

import * as React from "react";
import { useMemo } from "react";
import { Clock, Timer } from "lucide-react";
import { useDirectoryStore } from "@/store/directoryStore";
import { projectName } from "@/data/directoryData";
import type { DirectoryPerson } from "../shared";
import { Section, Metric, Empty } from "./parts";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"];

export function TimeTab({ person }: { person: DirectoryPerson }) {
  const allAllocations = useDirectoryStore((s) => s.allocations);
  const allocations = useMemo(() => allAllocations.filter((a) => a.employeeId === person.id), [allAllocations, person.id]);

  // Deterministic weekly hours from the employee id.
  const weekly = useMemo(() => {
    let h = 0;
    for (const ch of person.id) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
    return DAYS.map((label, i) => ({ label, hours: 6 + ((h + i * 7) % 4) }));
  }, [person.id]);

  const weekTotal = weekly.reduce((s, d) => s + d.hours, 0);
  const today = weekly[Math.min(2, weekly.length - 1)].hours;
  const billableAllocs = allocations.filter((a) => a.billable);
  const billableHours = Math.round(weekTotal * (billableAllocs.length ? 0.7 : 0.3));
  const maxH = Math.max(...weekly.map((d) => d.hours), 1);

  const entries = useMemo(() => {
    return allocations.slice(0, 5).map((a, i) => ({
      id: a.id,
      project: projectName(a.projectId),
      task: ["Feature work", "Code review", "Bug fixes", "Design sync", "Planning"][i % 5],
      date: `2026-08-${String(24 - i).padStart(2, "0")}`,
      hours: 2 + ((i * 3) % 5),
      billable: a.billable,
    }));
  }, [allocations]);

  return (
    <div className="space-y-4">
      <p className="text-xs text-text-tertiary">Connected to <span className="font-medium text-text-secondary">ZE[LOG]</span> · timesheets</p>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Metric label="Today" value={`${today}h`} color="#8B7CF6" />
        <Metric label="This Week" value={`${weekTotal}h`} color="#38BDF8" />
        <Metric label="Billable" value={`${billableHours}h`} sub="this week" color="#34D399" />
        <Metric label="Non-billable" value={`${weekTotal - billableHours}h`} sub="this week" color="#FB923C" />
      </div>

      <Section title="This Week" icon={Timer}>
        <div className="flex items-end justify-between gap-3" style={{ height: 150 }}>
          {weekly.map((d) => (
            <div key={d.label} className="flex h-full flex-1 flex-col items-center gap-1.5">
              <div className="flex w-full flex-1 items-end justify-center">
                <div className="w-8 rounded-t-[6px] transition-[height] duration-500" style={{ height: `${(d.hours / maxH) * 100}%`, background: "linear-gradient(180deg, #7A4DFF, #7A4DFFB3)" }} title={`${d.hours}h`} />
              </div>
              <span className="text-[11px] text-text-tertiary">{d.label}</span>
              <span className="text-[11px] font-semibold tabular-nums text-text">{d.hours}h</span>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Timesheet Entries" icon={Clock} tint="#38BDF8">
        {entries.length === 0 ? (
          <Empty>No time logged yet.</Empty>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead>
                <tr className="border-b border-border/[0.08] text-[11px] uppercase tracking-wide text-text-tertiary">
                  <th className="py-2 pr-3 font-semibold">Date</th>
                  <th className="px-3 py-2 font-semibold">Project</th>
                  <th className="px-3 py-2 font-semibold">Task</th>
                  <th className="px-3 py-2 font-semibold">Hours</th>
                  <th className="px-3 py-2 font-semibold">Type</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((e) => (
                  <tr key={e.id} className="border-b border-border/[0.05] last:border-0">
                    <td className="py-2.5 pr-3 tabular-nums text-text-secondary">{e.date}</td>
                    <td className="px-3 py-2.5 font-medium text-text">{e.project}</td>
                    <td className="px-3 py-2.5 text-text-secondary">{e.task}</td>
                    <td className="px-3 py-2.5 tabular-nums text-text-secondary">{e.hours}h</td>
                    <td className="px-3 py-2.5">
                      <span className={e.billable ? "rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700" : "rounded-full bg-surface-2 px-2 py-0.5 text-[11px] font-medium text-text-tertiary"}>
                        {e.billable ? "Billable" : "Non-billable"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>
    </div>
  );
}

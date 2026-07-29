"use client";

import { useMemo, useState } from "react";
import {
  Calendar,
  ChevronDown,
  Clock,
  DollarSign,
  Download,
  Folder,
  MoreHorizontal,
  Users,
} from "lucide-react";
import { format, parseISO, formatDistanceToNow } from "date-fns";
import { useTrackerStore } from "@/store/trackerStore";
import { PROJECTS, projectById } from "@/data/mockEntries";
import { formatDuration, formatDurationShort } from "@/lib/time";
import { PROJECT_COLOR_DOT, PROJECT_COLOR_BADGE, PROJECT_COLOR_HEX } from "@/lib/projectColors";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { TimeEntry, ProjectColor } from "@/types/tracker";

const TEAM_MEMBERS = [
  { id: "irfan", name: "Irfan Alisha", initials: "IA", color: "bg-accent" },
  { id: "sarah", name: "Sarah Chen", initials: "SC", color: "bg-sky-500" },
  { id: "mike", name: "Mike Rodriguez", initials: "MR", color: "bg-emerald-500" },
  { id: "emily", name: "Emily Park", initials: "EP", color: "bg-amber-500" },
  { id: "john", name: "John Davis", initials: "JD", color: "bg-rose-500" },
];

function formatHoursShort(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.round((seconds % 3600) / 60);
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

export default function DashboardPage() {
  const entries = useTrackerStore((s) => s.entries);
  const [viewMode, setViewMode] = useState<"team" | "individual">("team");
  const [chartView, setChartView] = useState<"billability" | "projects">("billability");
  const [chartViewOpen, setChartViewOpen] = useState(false);
  const [hoveredProject, setHoveredProject] = useState<string | null>(null);

  const totalSeconds = entries.reduce((s, e) => s + e.durationSeconds, 0);
  const billableSeconds = entries.filter((e) => e.billable).reduce((s, e) => s + e.durationSeconds, 0);
  const nonBillableSeconds = totalSeconds - billableSeconds;

  const projectStats = useMemo(() => {
    const map = new Map<string, number>();
    entries.forEach((e) => {
      map.set(e.projectId, (map.get(e.projectId) || 0) + e.durationSeconds);
    });
    return Array.from(map.entries())
      .map(([id, seconds]) => ({ project: projectById(id), seconds }))
      .sort((a, b) => b.seconds - a.seconds);
  }, [entries]);

  const topProject = projectStats[0];
  const topClient = useMemo(() => {
    const map = new Map<string, number>();
    entries.forEach((e) => {
      const p = projectById(e.projectId);
      const client = p.client || "Internal";
      map.set(client, (map.get(client) || 0) + e.durationSeconds);
    });
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1])[0];
  }, [entries]);

  const dailyData = useMemo(() => {
    const map = new Map<string, { billable: number; nonBillable: number }>();
    entries.forEach((e) => {
      const prev = map.get(e.date) || { billable: 0, nonBillable: 0 };
      if (e.billable) prev.billable += e.durationSeconds;
      else prev.nonBillable += e.durationSeconds;
      map.set(e.date, prev);
    });
    return Array.from(map.entries())
      .map(([date, data]) => ({ date, ...data, total: data.billable + data.nonBillable }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [entries]);

  const dailyByProject = useMemo(() => {
    const map = new Map<string, Map<string, number>>();
    entries.forEach((e) => {
      if (!map.has(e.date)) map.set(e.date, new Map());
      const dayMap = map.get(e.date)!;
      dayMap.set(e.projectId, (dayMap.get(e.projectId) || 0) + e.durationSeconds);
    });
    return Array.from(map.entries())
      .map(([date, projMap]) => {
        const projects = Array.from(projMap.entries())
          .map(([id, seconds]) => ({ project: projectById(id), seconds }))
          .sort((a, b) => b.seconds - a.seconds);
        return { date, projects, total: projects.reduce((s, p) => s + p.seconds, 0) };
      })
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [entries]);

  const maxDaily = Math.max(...dailyData.map((d) => d.total), 1);

  const teamActivity = useMemo(() => {
    return TEAM_MEMBERS.map((member, idx) => {
      const memberEntries = entries.slice(idx * 8, idx * 8 + 8);
      const latest = memberEntries[0];
      const total = memberEntries.reduce((s, e) => s + e.durationSeconds, 0);
      const billable = memberEntries.filter((e) => e.billable).reduce((s, e) => s + e.durationSeconds, 0);
      return {
        ...member,
        latestTask: latest?.task || "No activity",
        latestProject: latest ? projectById(latest.projectId) : null,
        lastTracked: latest?.endTime || latest?.startTime || null,
        total,
        billable,
        nonBillable: total - billable,
      };
    });
  }, [entries]);

  return (
    <div className="space-y-5 pb-12">
      {/* Hero Header */}
      <section className="relative overflow-hidden rounded-shell bg-hero px-6 py-7 text-white shadow-[0_20px_60px_-20px_rgba(49,46,129,0.5)] sm:px-10 sm:py-8">
        <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-white/5 blur-3xl" />
        <div className="relative flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
            <p className="mt-0.5 text-sm text-white/60">Track team performance, billability, and project activity.</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <div className="flex flex-col gap-1 rounded-lg bg-white/[0.14] px-5 py-4 backdrop-blur-sm">
                <span className="text-[11px] font-medium text-white/50 uppercase tracking-wide">Tracked</span>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-white/60" />
                  <span className="text-xl font-bold text-white">{formatDuration(totalSeconds)}</span>
                </div>
                <span className="text-[11px] text-white/40">{entries.length} sessions</span>
              </div>
              <div className="flex flex-col gap-1 rounded-lg bg-white/[0.14] px-5 py-4 backdrop-blur-sm">
                <span className="text-[11px] font-medium text-white/50 uppercase tracking-wide">Billable</span>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-white/60" />
                  <span className="text-xl font-bold text-white">{formatDuration(billableSeconds)}</span>
                </div>
                <span className="text-[11px] text-white/40">{Math.round((billableSeconds / totalSeconds) * 100)}% of total</span>
              </div>
              <div className="flex flex-col gap-1 rounded-lg bg-white/[0.14] px-5 py-4 backdrop-blur-sm">
                <span className="text-[11px] font-medium text-white/50 uppercase tracking-wide">Non-billable</span>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-white/60" />
                  <span className="text-xl font-bold text-white">{formatDuration(nonBillableSeconds)}</span>
                </div>
                <span className="text-[11px] text-white/40">{Math.round((nonBillableSeconds / totalSeconds) * 100)}% of total</span>
              </div>
              <div className="flex flex-col gap-1 rounded-lg bg-white/[0.14] px-5 py-4 backdrop-blur-sm">
                <span className="text-[11px] font-medium text-white/50 uppercase tracking-wide">Top Project</span>
                <div className="flex items-center gap-2">
                  <Folder className="h-4 w-4 text-white/60" />
                  <span className="text-xl font-bold text-white">{topProject?.project.name || "—"}</span>
                </div>
                <span className="text-[11px] text-white/40">{topProject ? formatHoursShort(topProject.seconds) : ""}</span>
              </div>
              <div className="flex flex-col gap-1 rounded-lg bg-white/[0.14] px-5 py-4 backdrop-blur-sm">
                <span className="text-[11px] font-medium text-white/50 uppercase tracking-wide">Top Client</span>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-white/60" />
                  <span className="text-xl font-bold text-white">{topClient?.[0] || "—"}</span>
                </div>
                <span className="text-[11px] text-white/40">{topClient ? formatHoursShort(topClient[1]) : ""}</span>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {/* View Selector */}
            <div className="flex items-center rounded-[10px] border border-white/20 bg-white/10 p-0.5">
              <button
                type="button"
                onClick={() => setViewMode("team")}
                className={cn(
                  "rounded-[8px] px-3 py-1.5 text-xs font-medium transition-all",
                  viewMode === "team" ? "bg-white/20 text-white" : "text-white/60 hover:text-white",
                )}
              >
                <Users className="mr-1 inline h-3 w-3" /> Team
              </button>
              <button
                type="button"
                onClick={() => setViewMode("individual")}
                className={cn(
                  "rounded-[8px] px-3 py-1.5 text-xs font-medium transition-all",
                  viewMode === "individual" ? "bg-white/20 text-white" : "text-white/60 hover:text-white",
                )}
              >
                Individual
              </button>
            </div>
            {/* Date Range */}
            <button className="inline-flex items-center gap-1.5 rounded-[10px] border border-white/20 bg-white/10 px-3 py-2 text-xs font-medium text-white hover:bg-white/20 transition-colors">
              <Calendar className="h-3.5 w-3.5" /> This Month <ChevronDown className="h-3 w-3 opacity-60" />
            </button>
            {/* Export */}
            <Button variant="outline" size="sm" className="gap-1.5 border-white/20 bg-white/10 text-white hover:bg-white/20">
              <Download className="h-3.5 w-3.5" /> Export
            </Button>
          </div>
        </div>
      </section>


      {/* Time Tracked Chart */}
      <div className="rounded-card border border-border/[0.07] bg-surface p-5 shadow-card dark:border-white/[0.06]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-text">Time tracked</h3>
          <div className="flex items-center gap-4">
            {chartView === "billability" ? (
              <div className="flex items-center gap-4 text-[11px] text-text-tertiary">
                <span className="flex items-center gap-1.5"><span className="h-2.5 w-6 rounded-sm bg-accent/80" /> Billable</span>
                <span className="flex items-center gap-1.5"><span className="h-2.5 w-6 rounded-sm bg-accent/25" /> Non-billable</span>
              </div>
            ) : (
              <div className="flex items-center gap-3 text-[11px] text-text-tertiary">
                {projectStats.slice(0, 4).map(({ project }) => (
                  <span key={project.id} className="flex items-center gap-1">
                    <span className={cn("h-2 w-2 rounded-full", PROJECT_COLOR_DOT[project.color])} />
                    {project.name}
                  </span>
                ))}
              </div>
            )}
            {/* View by dropdown */}
            <div className="relative ml-2">
              <button
                type="button"
                onClick={() => setChartViewOpen(!chartViewOpen)}
                className="inline-flex h-10 items-center gap-1.5 rounded-[10px] border border-border/10 bg-surface-2/60 px-3 text-xs font-medium text-text-secondary hover:bg-surface-2 transition-colors dark:border-white/10"
              >
                <span className="text-text-tertiary">View by</span>
                <span className="text-text font-medium">{chartView === "billability" ? "Billability" : "Projects"}</span>
                <ChevronDown className="h-3 w-3 opacity-60" />
              </button>
              {chartViewOpen && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setChartViewOpen(false)} />
                  <div className="absolute right-0 top-full z-40 mt-1.5 w-44 rounded-card border border-border/10 bg-surface p-1.5 shadow-float dark:border-white/10">
                    <button
                      type="button"
                      onClick={() => { setChartView("billability"); setChartViewOpen(false); }}
                      className={cn(
                        "flex w-full items-center gap-2 rounded-md px-3 py-2 text-xs transition-colors",
                        chartView === "billability" ? "bg-accent/10 text-accent font-medium" : "text-text hover:bg-surface-2",
                      )}
                    >
                      Billability
                    </button>
                    <button
                      type="button"
                      onClick={() => { setChartView("projects"); setChartViewOpen(false); }}
                      className={cn(
                        "flex w-full items-center gap-2 rounded-md px-3 py-2 text-xs transition-colors",
                        chartView === "projects" ? "bg-accent/10 text-accent font-medium" : "text-text hover:bg-surface-2",
                      )}
                    >
                      Projects
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Chart Bars */}
        <div className="flex items-end gap-1.5 h-44 transition-all duration-300">
          {chartView === "billability" ? (
            dailyData.map((day) => {
              const totalH = day.total / 3600;
              const billablePct = day.total > 0 ? day.billable / day.total : 0;
              const heightPct = day.total / maxDaily;
              return (
                <div key={day.date} className="group/bar relative flex flex-1 flex-col items-center gap-1">
                  <div className="relative w-full flex flex-col justify-end" style={{ height: "140px" }}>
                    <div
                      className="w-full rounded-t-md bg-accent/25 transition-all duration-200"
                      style={{ height: `${heightPct * 100}%` }}
                    >
                      <div
                        className="w-full rounded-t-md bg-accent/80 transition-all duration-200"
                        style={{ height: `${billablePct * 100}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-[9px] text-text-tertiary tabular-nums">
                    {format(parseISO(day.date), "dd")}
                  </span>
                  <div className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 rounded-md bg-surface-3 px-2 py-1 text-[10px] font-medium text-text opacity-0 shadow-sm transition-opacity group-hover/bar:opacity-100 whitespace-nowrap">
                    {totalH.toFixed(1)}h
                  </div>
                </div>
              );
            })
          ) : (
            dailyByProject.map((day) => {
              const pct = day.total / maxDaily;
              return (
                <div key={day.date} className="relative flex flex-1 flex-col items-center gap-1 [&:hover>.chart-tooltip]:opacity-100">
                  <div className="relative w-full flex flex-col justify-end" style={{ height: "140px" }}>
                    <div className="w-full flex flex-col-reverse rounded-t-md overflow-hidden transition-all duration-200" style={{ height: `${pct * 100}%` }}>
                      {day.projects.map(({ project, seconds }) => {
                        const segPct = seconds / day.total;
                        return (
                          <div
                            key={project.id}
                            className="w-full transition-opacity hover:opacity-80"
                            style={{ height: `${segPct * 100}%`, backgroundColor: PROJECT_COLOR_HEX[project.color] + "cc" }}
                          />
                        );
                      })}
                    </div>
                  </div>
                  <span className="text-[9px] text-text-tertiary tabular-nums">
                    {format(parseISO(day.date), "dd")}
                  </span>
                  <div className="chart-tooltip pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 rounded-lg bg-surface px-3 py-2.5 text-[11px] text-text shadow-float border border-border/10 dark:border-white/10 dark:bg-surface-2 w-max max-w-[180px] opacity-0 transition-opacity">
                    <p className="font-semibold text-text-secondary mb-1.5">{format(parseISO(day.date), "MMM dd")}</p>
                    <div className="space-y-1">
                      {day.projects.map(({ project, seconds }) => (
                        <div key={project.id} className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: PROJECT_COLOR_HEX[project.color] }} />
                          <span className="flex-1 truncate text-text">{project.name}</span>
                          <span className="tabular-nums text-text-tertiary ml-1">{formatHoursShort(seconds)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-1.5 pt-1.5 border-t border-border/10 dark:border-white/10 flex items-center justify-between font-semibold text-text">
                      <span>Total</span>
                      <span className="tabular-nums">{formatHoursShort(day.total)}</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Two Column: Donut + Top Projects */}
      <div className="grid gap-5 lg:grid-cols-[320px_1fr]">
        {/* Donut Chart */}
        <div className="rounded-card border border-border/[0.07] bg-surface p-5 shadow-card dark:border-white/[0.06]">
          <h3 className="text-sm font-semibold text-text mb-4">Project Distribution</h3>
          <DonutChart data={projectStats} total={totalSeconds} hoveredProject={hoveredProject} onHover={setHoveredProject} />
          <div className="mt-4 space-y-2">
            {projectStats.map(({ project, seconds }) => {
              const pct = Math.round((seconds / totalSeconds) * 100);
              return (
                <div
                  key={project.id}
                  className={cn("flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors cursor-pointer", hoveredProject === project.id && "bg-accent/5")}
                  onMouseEnter={() => setHoveredProject(project.id)}
                  onMouseLeave={() => setHoveredProject(null)}
                >
                  <span className={cn("h-2.5 w-2.5 rounded-full shrink-0", PROJECT_COLOR_DOT[project.color])} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-text truncate">{project.name}</span>
                      <span className="text-[10px] text-text-tertiary ml-2">{pct}%</span>
                    </div>
                    <div className="mt-0.5 h-1 w-full rounded-full bg-border/10 dark:bg-white/10">
                      <div className={cn("h-full rounded-full", PROJECT_COLOR_DOT[project.color])} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                  <span className="text-[10px] tabular-nums text-text-secondary ml-1 shrink-0">{formatDurationShort(seconds)}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Projects */}
        <div className="rounded-card border border-border/[0.07] bg-surface shadow-card dark:border-white/[0.06]">
          <div className="flex items-center justify-between border-b border-border/[0.06] px-5 py-3.5 dark:border-white/[0.05]">
            <h3 className="text-sm font-semibold text-text">Top Projects</h3>
          </div>
          <div className="grid h-9 items-center gap-3 bg-[#F3F0FF] px-5 text-[10px] font-semibold uppercase tracking-wider text-text-secondary dark:bg-accent/[0.06] grid-cols-[1fr_120px_90px_50px_100px]">
            <span>Project</span>
            <span>Client</span>
            <span>Duration</span>
            <span className="text-right">%</span>
            <span>Progress</span>
          </div>
          <div className="divide-y divide-border/[0.06] dark:divide-white/[0.05]">
            {projectStats.map(({ project, seconds }) => {
              const pct = Math.round((seconds / totalSeconds) * 100);
              return (
                <div
                  key={project.id}
                  className="grid h-14 items-center gap-3 px-5 transition-colors hover:bg-accent/[0.03] dark:hover:bg-accent/[0.05] grid-cols-[1fr_120px_90px_50px_100px] cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className={cn("h-2.5 w-2.5 shrink-0 rounded-full", PROJECT_COLOR_DOT[project.color])} />
                    <span className="truncate text-sm font-medium text-text">{project.name}</span>
                  </div>
                  <span className="text-xs text-text-secondary truncate">{project.client || "Internal"}</span>
                  <span className="text-sm tabular-nums text-text-secondary">{formatDuration(seconds)}</span>
                  <span className="text-right text-xs tabular-nums text-text-tertiary">{pct}%</span>
                  <div className="h-1.5 w-full rounded-full bg-border/10 dark:bg-white/10">
                    <div className={cn("h-full rounded-full", PROJECT_COLOR_DOT[project.color])} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Team Activity */}
      <div className="rounded-card border border-border/[0.07] bg-surface shadow-card dark:border-white/[0.06]">
        <div className="flex items-center justify-between border-b border-border/[0.06] px-5 py-3.5 dark:border-white/[0.05]">
          <h3 className="text-sm font-semibold text-text">Team activity</h3>
          <span className="text-xs text-text-tertiary">{TEAM_MEMBERS.length} members</span>
        </div>
        {/* Header */}
        <div className="sticky top-0 z-10 grid h-9 items-center gap-3 bg-[#F3F0FF] px-5 text-[10px] font-semibold uppercase tracking-wider text-text-secondary dark:bg-accent/[0.06] grid-cols-[180px_1fr_120px_100px_100px_120px_40px]">
          <span>Member</span>
          <span>Latest activity</span>
          <span>Project</span>
          <span>Last tracked</span>
          <span>Total tracked</span>
          <span>Billable split</span>
          <span />
        </div>
        {/* Rows */}
        <div className="divide-y divide-border/[0.06] dark:divide-white/[0.05]">
          {teamActivity.map((member) => (
            <div key={member.id} className="grid h-[60px] items-center gap-3 px-5 transition-colors hover:bg-accent/[0.03] dark:hover:bg-accent/[0.05] grid-cols-[180px_1fr_120px_100px_100px_120px_40px]">
              {/* Avatar + Name */}
              <div className="flex items-center gap-2.5 min-w-0">
                <div className={cn("flex h-8 w-8 items-center justify-center rounded-full text-[10px] font-bold text-white shrink-0", member.color)}>
                  {member.initials}
                </div>
                <span className="truncate text-sm font-medium text-text">{member.name}</span>
              </div>
              {/* Latest Task */}
              <span className="truncate text-xs text-text-secondary">{member.latestTask}</span>
              {/* Project Pill */}
              {member.latestProject ? (
                <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium w-fit", PROJECT_COLOR_BADGE[member.latestProject.color])}>
                  {member.latestProject.name}
                </span>
              ) : (
                <span className="text-xs text-text-tertiary">—</span>
              )}
              {/* Last Tracked */}
              <span className="text-xs text-text-tertiary">
                {member.lastTracked ? formatDistanceToNow(parseISO(member.lastTracked), { addSuffix: true }) : "—"}
              </span>
              {/* Total */}
              <span className="text-sm tabular-nums font-medium text-text">{formatDuration(member.total)}</span>
              {/* Billable Split Bar */}
              <div className="flex items-center gap-1.5">
                <div className="h-1.5 flex-1 rounded-full bg-border/10 dark:bg-white/10 overflow-hidden flex">
                  {member.total > 0 && (
                    <>
                      <div className="h-full bg-accent/80 rounded-l-full" style={{ width: `${(member.billable / member.total) * 100}%` }} />
                      <div className="h-full bg-accent/25 rounded-r-full" style={{ width: `${(member.nonBillable / member.total) * 100}%` }} />
                    </>
                  )}
                </div>
              </div>
              {/* Actions */}
              <button type="button" className="flex h-7 w-7 items-center justify-center rounded-md text-text-tertiary hover:bg-surface-2 hover:text-text transition-colors">
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


/* ─── Donut Chart ─── */
function DonutChart({
  data,
  total,
  hoveredProject,
  onHover,
}: {
  data: { project: { id: string; color: ProjectColor }; seconds: number }[];
  total: number;
  hoveredProject: string | null;
  onHover: (id: string | null) => void;
}) {
  const size = 180;
  const strokeWidth = 28;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let offset = 0;
  const segments = data.map(({ project, seconds }) => {
    const pct = seconds / total;
    const dashLen = pct * circumference;
    const seg = { id: project.id, color: PROJECT_COLOR_HEX[project.color], dashLen, offset, pct };
    offset += dashLen;
    return seg;
  });

  return (
    <div className="flex justify-center">
      <svg width={size} height={size} className="transform -rotate-90" onMouseLeave={() => onHover(null)}>
        {segments.map((seg) => (
          <circle
            key={seg.id}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={seg.color}
            strokeWidth={strokeWidth}
            strokeDasharray={`${seg.dashLen} ${circumference - seg.dashLen}`}
            strokeDashoffset={-seg.offset}
            className="transition-opacity duration-150"
            opacity={hoveredProject && hoveredProject !== seg.id ? 0.3 : 1}
            onMouseEnter={() => onHover(seg.id)}
          />
        ))}
        <text
          x={size / 2}
          y={size / 2}
          textAnchor="middle"
          dominantBaseline="central"
          className="fill-text text-sm font-bold rotate-90 origin-center"
        >
          {formatDuration(total)}
        </text>
      </svg>
    </div>
  );
}

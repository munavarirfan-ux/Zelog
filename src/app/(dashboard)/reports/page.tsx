"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowDownRight,
  ArrowUpRight,
  Calendar,
  CheckCircle2,
  ChevronDown,
  Clock,
  Download,
  AlertCircle,
  Plus,
  Search,
  Sparkles,
  Timer,
  X,
  XCircle,
} from "lucide-react";
import { format, parseISO, startOfWeek, addDays, isSameDay } from "date-fns";
import { useTrackerStore } from "@/store/trackerStore";
import { PROJECTS, projectById } from "@/data/mockEntries";
import { formatDuration, formatTimeRange } from "@/lib/time";
import { PROJECT_COLOR_DOT, PROJECT_COLOR_BADGE, PROJECT_COLOR_HEX } from "@/lib/projectColors";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FilterDropdown } from "@/components/ui/filter-dropdown";
import { DailyBarChart } from "@/components/charts/DailyBarChart";
import { cn } from "@/lib/utils";
import type { TimeEntry, ProjectColor } from "@/types/tracker";

type Tab = "summary" | "detailed" | "weekly";
type QualityStatus = "good" | "review" | "bad" | "pending";

function getQuality(entry: TimeEntry): QualityStatus {
  if (entry.durationSeconds < 60) return "bad";
  if (!entry.task || entry.task === "Untitled session") return "review";
  if (entry.durationSeconds > 14400) return "review";
  if (entry.tags.length === 0) return "pending";
  return "good";
}

const TEAM_MEMBERS = [
  { value: "irfan", label: "Irfan Alisha" },
  { value: "sarah", label: "Sarah Chen" },
  { value: "mike", label: "Mike Rodriguez" },
  { value: "emily", label: "Emily Park" },
  { value: "john", label: "John Davis" },
];

const STATUS_OPTIONS = [
  { value: "billable", label: "Billable" },
  { value: "non-billable", label: "Non-billable" },
];

export default function ReportsPage() {
  const entries = useTrackerStore((s) => s.entries);
  const [activeTab, setActiveTab] = useState<Tab>("summary");
  const router = useRouter();
  const [selectedTeam, setSelectedTeam] = useState<string[]>([]);
  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string[]>([]);
  const [selectedDescriptions, setSelectedDescriptions] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState("This Month");
  const [selectedQuality, setSelectedQuality] = useState<QualityStatus | null>(null);

  const uniqueDescriptions = useMemo(() => {
    const descs = Array.from(new Set(entries.map((e) => e.task))).sort();
    return descs.map((d) => ({ value: d, label: d }));
  }, [entries]);

  const filteredEntries = useMemo(() => {
    let result = entries;
    if (selectedProjects.length > 0) {
      result = result.filter((e) => selectedProjects.includes(e.projectId));
    }
    if (selectedClients.length > 0) {
      result = result.filter((e) => {
        const p = projectById(e.projectId);
        return selectedClients.includes(p.client || "No Client");
      });
    }
    if (selectedStatus.length > 0) {
      result = result.filter((e) => {
        if (selectedStatus.includes("billable") && e.billable) return true;
        if (selectedStatus.includes("non-billable") && !e.billable) return true;
        return false;
      });
    }
    if (selectedDescriptions.length > 0) {
      result = result.filter((e) => selectedDescriptions.includes(e.task));
    }
    if (selectedQuality) {
      result = result.filter((e) => getQuality(e) === selectedQuality);
    }
    return result;
  }, [entries, selectedProjects, selectedClients, selectedStatus, selectedDescriptions, selectedQuality]);

  const totalSeconds = filteredEntries.reduce((s, e) => s + e.durationSeconds, 0);
  const billableEntries = filteredEntries.filter((e) => e.billable);
  const billableSeconds = billableEntries.reduce((s, e) => s + e.durationSeconds, 0);

  const qualityCounts = useMemo(() => {
    const counts: Record<QualityStatus, number> = { good: 0, review: 0, bad: 0, pending: 0 };
    filteredEntries.forEach((e) => { counts[getQuality(e)]++; });
    return counts;
  }, [filteredEntries]);

  const hasFilters = selectedTeam.length > 0 || selectedProjects.length > 0 || selectedClients.length > 0 || selectedStatus.length > 0 || selectedDescriptions.length > 0 || selectedQuality !== null;

  function clearFilters() {
    setSelectedTeam([]);
    setSelectedClients([]);
    setSelectedProjects([]);
    setSelectedStatus([]);
    setSelectedDescriptions([]);
    setSelectedQuality(null);
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: "summary", label: "Summary" },
    { key: "detailed", label: "Detailed" },
    { key: "weekly", label: "Weekly" },
  ];

  return (
    <div className="space-y-5 pb-12">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-shell bg-hero px-6 py-7 text-white shadow-[0_20px_60px_-20px_rgba(49,46,129,0.5)] sm:px-10 sm:py-8">
        <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-white/5 blur-3xl" />
        <div className="relative flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-semibold tracking-tight">Reports</h1>
            <p className="mt-0.5 text-sm text-white/60">Analyze productivity, billable hours, and team performance.</p>
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="flex flex-col gap-1 rounded-lg bg-white/[0.14] px-5 py-4 backdrop-blur-sm">
                <span className="text-[11px] font-medium text-white/50 uppercase tracking-wide">Total</span>
                <div className="flex items-center gap-2">
                  <Timer className="h-4 w-4 text-white/60" />
                  <span className="text-xl font-bold text-white">{formatDuration(totalSeconds)}</span>
                </div>
                <span className="text-[11px] text-white/40">{filteredEntries.length} sessions</span>
              </div>
              <div className="flex flex-col gap-1 rounded-lg bg-white/[0.14] px-5 py-4 backdrop-blur-sm">
                <span className="text-[11px] font-medium text-white/50 uppercase tracking-wide">Billable</span>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-white/60" />
                  <span className="text-xl font-bold text-white">{formatDuration(billableSeconds)}</span>
                </div>
                <span className="text-[11px] text-white/40">{billableEntries.length} billable sessions</span>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {activeTab === "detailed" && (
              <Button variant="white" size="sm" className="gap-1.5" onClick={() => router.push("/tracker")}>
                <Plus className="h-3.5 w-3.5" /> Add entry
              </Button>
            )}
            <button className="inline-flex h-8 items-center gap-1.5 rounded-[10px] border border-white/20 bg-white/10 px-3 text-xs font-medium text-white hover:bg-white/20 transition-colors">
              <Calendar className="h-3.5 w-3.5" /> {dateRange} <ChevronDown className="h-3 w-3 opacity-60" />
            </button>
            <Button variant="outline" size="sm" className="gap-1.5 border-white/20 bg-white/10 text-white hover:bg-white/20">
              <Download className="h-3.5 w-3.5" /> Export
            </Button>
          </div>
        </div>
      </section>

      {/* Tab Switcher */}
      <div className="flex h-10 w-fit items-center gap-0.5 rounded-lg bg-surface-2/80 p-0.5 dark:bg-surface-2">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "rounded-md px-4 py-1.5 text-sm font-medium transition-all duration-150",
              activeTab === tab.key
                ? "bg-surface text-text shadow-sm dark:bg-surface-3"
                : "text-text-tertiary hover:text-text",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="sticky top-0 z-20 rounded-card border border-border/[0.07] bg-surface px-4 py-3 shadow-card dark:border-white/[0.06]">
        <div className="flex flex-wrap items-center gap-2">
          <FilterDropdown
            label="Team"
            options={TEAM_MEMBERS}
            selected={selectedTeam}
            onChange={setSelectedTeam}
          />
          <FilterDropdown
            label="Client"
            options={[
              { value: "No Client", label: "No Client" },
              ...Array.from(new Set(PROJECTS.filter((p) => p.client).map((p) => p.client!))).map((c) => ({ value: c, label: c })),
            ]}
            selected={selectedClients}
            onChange={setSelectedClients}
          />
          <FilterDropdown
            label="Projects"
            options={PROJECTS.map((p) => ({ value: p.id, label: p.name }))}
            selected={selectedProjects}
            onChange={setSelectedProjects}
          />
          <FilterDropdown
            label="Status"
            options={STATUS_OPTIONS}
            selected={selectedStatus}
            onChange={setSelectedStatus}
          />
          <FilterDropdown
            label="Description"
            options={uniqueDescriptions}
            selected={selectedDescriptions}
            onChange={setSelectedDescriptions}
          />

          <div className="ml-auto flex items-center gap-2">
            {hasFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="flex items-center gap-1 rounded-[10px] px-3 py-2 text-xs font-medium text-text-tertiary hover:bg-surface-2 hover:text-text transition-colors"
              >
                Clear Filters
              </button>
            )}
            <Button size="sm" className="rounded-[10px] px-4 text-xs" disabled={!hasFilters}>
              Apply
            </Button>
          </div>
        </div>

        {/* Selected filter chips */}
        {hasFilters && (
          <div className="mt-2 flex flex-wrap items-center gap-1.5 border-t border-border/[0.06] pt-2 dark:border-white/[0.05]">
            {selectedTeam.map((id) => {
              const member = TEAM_MEMBERS.find((m) => m.value === id);
              return (
                <span key={id} className="inline-flex items-center gap-1 rounded-full bg-violet-500/10 px-2.5 py-1 text-[11px] font-medium text-violet-600 dark:text-violet-400">
                  {member?.label || id}
                  <button type="button" onClick={() => setSelectedTeam((prev) => prev.filter((t) => t !== id))} className="ml-0.5 hover:text-violet-700"><X className="h-3 w-3" /></button>
                </span>
              );
            })}
            {selectedClients.map((c) => (
              <span key={c} className="inline-flex items-center gap-1 rounded-full bg-sky-500/10 px-2.5 py-1 text-[11px] font-medium text-sky-600 dark:text-sky-400">
                {c}
                <button type="button" onClick={() => setSelectedClients((prev) => prev.filter((x) => x !== c))} className="ml-0.5 hover:text-sky-700"><X className="h-3 w-3" /></button>
              </span>
            ))}
            {selectedProjects.map((id) => (
              <span key={id} className="inline-flex items-center gap-1 rounded-full bg-accent/10 px-2.5 py-1 text-[11px] font-medium text-accent">
                {projectById(id).name}
                <button type="button" onClick={() => setSelectedProjects((prev) => prev.filter((p) => p !== id))} className="ml-0.5 hover:text-accent-700"><X className="h-3 w-3" /></button>
              </span>
            ))}
            {selectedStatus.map((s) => (
              <span key={s} className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                {s === "billable" ? "Billable" : "Non-billable"}
                <button type="button" onClick={() => setSelectedStatus((prev) => prev.filter((x) => x !== s))} className="ml-0.5 hover:text-emerald-700"><X className="h-3 w-3" /></button>
              </span>
            ))}
            {selectedDescriptions.map((d) => (
              <span key={d} className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-1 text-[11px] font-medium text-amber-600 dark:text-amber-400 max-w-[200px]">
                <span className="truncate">{d}</span>
                <button type="button" onClick={() => setSelectedDescriptions((prev) => prev.filter((x) => x !== d))} className="ml-0.5 shrink-0 hover:text-amber-700"><X className="h-3 w-3" /></button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Work-log Quality Strip */}
      <div className="flex flex-wrap items-center gap-3 rounded-card border border-border/[0.07] bg-surface px-5 py-3.5 shadow-card dark:border-white/[0.06] sm:h-[68px] sm:flex-nowrap">
        <div className="flex items-center gap-2 shrink-0">
          <Sparkles className="h-4 w-4 text-accent" />
          <span className="text-sm font-semibold text-text whitespace-nowrap">Work-log quality</span>
        </div>

        <div className="h-6 w-px bg-border/10 dark:bg-white/10 hidden sm:block shrink-0" />

        <div className="flex items-center gap-0 divide-x divide-border/10 dark:divide-white/10">
          <QualityMetric status="good" label="Good" count={qualityCounts.good} active={selectedQuality === "good"} onClick={() => setSelectedQuality(selectedQuality === "good" ? null : "good")} />
          <QualityMetric status="review" label="Needs Review" count={qualityCounts.review} active={selectedQuality === "review"} onClick={() => setSelectedQuality(selectedQuality === "review" ? null : "review")} />
          <QualityMetric status="bad" label="Bad" count={qualityCounts.bad} active={selectedQuality === "bad"} onClick={() => setSelectedQuality(selectedQuality === "bad" ? null : "bad")} />
          <QualityMetric status="pending" label="Pending" count={qualityCounts.pending} active={selectedQuality === "pending"} onClick={() => setSelectedQuality(selectedQuality === "pending" ? null : "pending")} />
        </div>

        <Button variant="outline" size="sm" className="ml-auto shrink-0 gap-1.5 rounded-[10px] text-xs">
          <Sparkles className="h-3.5 w-3.5" /> View Smart Report
        </Button>
      </div>


      {/* Tab Content */}
      {activeTab === "summary" && <SummaryTab entries={filteredEntries} />}
      {activeTab === "detailed" && <DetailedTab entries={filteredEntries} />}
      {activeTab === "weekly" && <WeeklyTab entries={filteredEntries} />}
    </div>
  );
}

/* ─── Filter Dropdown ─── */
/* ─── Quality Metric (inline strip item) ─── */
const QUALITY_DOT: Record<QualityStatus, string> = {
  good: "bg-emerald-500",
  review: "bg-amber-500",
  bad: "bg-rose-500",
  pending: "bg-sky-500",
};
const QUALITY_LABEL_COLOR: Record<QualityStatus, string> = {
  good: "text-emerald-600 dark:text-emerald-400",
  review: "text-amber-600 dark:text-amber-400",
  bad: "text-rose-600 dark:text-rose-400",
  pending: "text-sky-600 dark:text-sky-400",
};

function QualityMetric({ status, label, count, active, onClick }: {
  status: QualityStatus; label: string; count: number; active: boolean; onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 px-3 py-1 rounded-md transition-colors",
        active ? "bg-accent/8" : "hover:bg-surface-2/80",
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", QUALITY_DOT[status])} />
      <span className="text-sm font-bold tabular-nums text-text">{count}</span>
      <span className={cn("text-[11px] font-medium whitespace-nowrap", QUALITY_LABEL_COLOR[status])}>{label}</span>
    </button>
  );
}


/* ─── Daily Hours Chart (MUI X Charts) ─── */
function DailyHoursChart({
  chartView,
  setChartView,
  chartViewOpen,
  setChartViewOpen,
  dailyData,
  dailyByProject,
  projectStats,
}: {
  chartView: "billability" | "projects";
  setChartView: (v: "billability" | "projects") => void;
  chartViewOpen: boolean;
  setChartViewOpen: (v: boolean) => void;
  dailyData: { date: string; billable: number; nonBillable: number }[];
  dailyByProject: { date: string; projects: { project: { id: string; name: string; color: ProjectColor }; seconds: number }[]; total: number }[];
  projectStats: { project: { id: string; name: string; color: ProjectColor }; seconds: number }[];
}) {
  const billabilityDataset = useMemo(
    () => dailyData.map((d) => ({
      date: format(parseISO(d.date), "MMM dd"),
      billable: d.billable,
      nonBillable: d.nonBillable,
    })),
    [dailyData],
  );

  const uniqueProjects = useMemo(() => {
    const seen = new Map<string, { id: string; name: string; color: ProjectColor }>();
    dailyByProject.forEach((day) => {
      day.projects.forEach(({ project }) => {
        if (!seen.has(project.id)) seen.set(project.id, project);
      });
    });
    return Array.from(seen.values());
  }, [dailyByProject]);

  const projectDataset = useMemo(
    () => dailyByProject.map((day) => {
      const row: Record<string, any> = { date: format(parseISO(day.date), "MMM dd") };
      uniqueProjects.forEach((p) => { row[p.id] = 0; });
      day.projects.forEach(({ project, seconds }) => { row[project.id] = seconds; });
      return row;
    }),
    [dailyByProject, uniqueProjects],
  );

  const projectSeries = useMemo(
    () => uniqueProjects.map((p) => ({
      dataKey: p.id,
      name: p.name,
      color: PROJECT_COLOR_HEX[p.color],
    })),
    [uniqueProjects],
  );

  return (
    <div className="rounded-card border border-border/[0.07] bg-surface p-5 shadow-card dark:border-white/[0.06]">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-text">Daily Hours</h3>
        <div className="flex items-center gap-4">
          {/* View by dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setChartViewOpen(!chartViewOpen)}
              className="inline-flex h-9 items-center gap-1.5 rounded-[10px] border border-border/10 bg-surface-2/60 px-3 text-xs font-medium text-text-secondary hover:bg-surface-2 transition-colors dark:border-white/10"
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
                      chartView === "billability" ? "bg-primary-100/60 text-primary-600 font-medium" : "text-text hover:bg-surface-2",
                    )}
                  >
                    Billability
                  </button>
                  <button
                    type="button"
                    onClick={() => { setChartView("projects"); setChartViewOpen(false); }}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-md px-3 py-2 text-xs transition-colors",
                      chartView === "projects" ? "bg-primary-100/60 text-primary-600 font-medium" : "text-text hover:bg-surface-2",
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

      {chartView === "billability" ? (
        <DailyBarChart
          data={billabilityDataset}
          height={320}
          series={[
            { dataKey: "billable", name: "Billable", color: "#5A43D5" },
            { dataKey: "nonBillable", name: "Non-billable", color: "#C9B6FF" },
          ]}
        />
      ) : (
        <DailyBarChart data={projectDataset} series={projectSeries} height={320} />
      )}
    </div>
  );
}


/* ─── Summary Tab ─── */
function SummaryTab({ entries }: { entries: TimeEntry[] }) {
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [chartView, setChartView] = useState<"billability" | "projects">("billability");
  const [chartViewOpen, setChartViewOpen] = useState(false);
  const [primaryGroup, setPrimaryGroup] = useState("project");
  const [secondaryGroup, setSecondaryGroup] = useState("none");

  const dailyData = useMemo(() => {
    const map = new Map<string, { billable: number; nonBillable: number }>();
    entries.forEach((e) => {
      const day = e.date;
      const prev = map.get(day) || { billable: 0, nonBillable: 0 };
      if (e.billable) prev.billable += e.durationSeconds;
      else prev.nonBillable += e.durationSeconds;
      map.set(day, prev);
    });
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-14)
      .map(([date, data]) => ({ date, ...data }));
  }, [entries]);

  const dailyByProject = useMemo(() => {
    const dayMap = new Map<string, Map<string, number>>();
    entries.forEach((e) => {
      if (!dayMap.has(e.date)) dayMap.set(e.date, new Map());
      const projMap = dayMap.get(e.date)!;
      projMap.set(e.projectId, (projMap.get(e.projectId) || 0) + e.durationSeconds);
    });
    return Array.from(dayMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-14)
      .map(([date, projMap]) => ({
        date,
        projects: Array.from(projMap.entries()).map(([id, seconds]) => ({
          project: projectById(id),
          seconds,
        })),
        total: Array.from(projMap.values()).reduce((s, v) => s + v, 0),
      }));
  }, [entries]);

  const projectStats = useMemo(() => {
    const map = new Map<string, number>();
    entries.forEach((e) => {
      map.set(e.projectId, (map.get(e.projectId) || 0) + e.durationSeconds);
    });
    return Array.from(map.entries())
      .map(([id, seconds]) => ({ project: projectById(id), seconds }))
      .sort((a, b) => b.seconds - a.seconds);
  }, [entries]);

  const totalProjectSeconds = projectStats.reduce((s, p) => s + p.seconds, 0);

  const displayedProjects = selectedProject
    ? projectStats.filter((p) => p.project.id === selectedProject)
    : projectStats;

  return (
    <div className="space-y-5">
      {/* Daily Hours Chart */}
      <DailyHoursChart
        chartView={chartView}
        setChartView={setChartView}
        chartViewOpen={chartViewOpen}
        setChartViewOpen={setChartViewOpen}
        dailyData={dailyData}
        dailyByProject={dailyByProject}
        projectStats={projectStats}
      />

      {/* Group By Toolbar */}
      <div className="flex items-center gap-3 rounded-card border border-border/[0.07] bg-surface px-5 py-3 shadow-card dark:border-white/[0.06]">
        <span className="text-xs font-medium text-text-secondary whitespace-nowrap">Group by:</span>
        <div className="w-40 shrink-0">
          <Select
            value={primaryGroup}
            onValueChange={(val) => {
              setPrimaryGroup(val);
              if (val === secondaryGroup) setSecondaryGroup("none");
            }}
          >
            <SelectTrigger className="h-10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {["project", "client", "team", "user", "status", "billability", "description"].map((opt) => (
                <SelectItem key={opt} value={opt} disabled={opt === secondaryGroup}>
                  {opt.charAt(0).toUpperCase() + opt.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="w-40 shrink-0">
          <Select
            value={secondaryGroup}
            onValueChange={(val) => setSecondaryGroup(val)}
          >
            <SelectTrigger className="h-10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              {["project", "client", "team", "user", "status", "billability", "description"].map((opt) => (
                <SelectItem key={opt} value={opt} disabled={opt === primaryGroup}>
                  {opt.charAt(0).toUpperCase() + opt.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Two Column: Projects Table + Donut */}
      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        {/* Top Projects Table */}
        <div className="rounded-card border border-border/[0.07] bg-surface shadow-card dark:border-white/[0.06]">
          <div className="flex items-center justify-between border-b border-border/[0.06] px-5 py-3.5 dark:border-white/[0.05]">
            <h3 className="text-sm font-semibold text-text">Top Projects</h3>
            {selectedProject && (
              <button type="button" onClick={() => setSelectedProject(null)} className="text-xs text-accent hover:underline">
                Show all
              </button>
            )}
          </div>
          <div className="grid h-9 items-center gap-3 bg-[#F3F0FF] px-5 text-[10px] font-semibold uppercase tracking-wider text-text-secondary dark:bg-accent/[0.06] grid-cols-[1fr_120px]">
            <span>Project</span>
            <span className="text-right">Duration</span>
          </div>
          <div className="divide-y divide-border/[0.06] dark:divide-white/[0.05]">
            {displayedProjects.map(({ project, seconds }) => (
              <button
                key={project.id}
                type="button"
                onClick={() => setSelectedProject(selectedProject === project.id ? null : project.id)}
                className={cn(
                  "grid w-full h-14 items-center gap-3 px-5 text-left transition-colors duration-150 hover:bg-accent/[0.03] dark:hover:bg-accent/[0.05] grid-cols-[1fr_120px]",
                  selectedProject === project.id && "bg-accent/[0.05]",
                )}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className={cn("h-2.5 w-2.5 shrink-0 rounded-full", PROJECT_COLOR_DOT[project.color])} />
                  <span className="truncate text-sm font-medium text-text">{project.name}</span>
                </div>
                <span className="text-right text-sm tabular-nums text-text-secondary">{formatDuration(seconds)}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Donut Chart */}
        <div className="rounded-card border border-border/[0.07] bg-surface p-5 shadow-card dark:border-white/[0.06]">
          <h3 className="text-sm font-semibold text-text mb-4">Project Distribution</h3>
          <DonutChart
            data={projectStats.map(({ project, seconds }) => ({
              id: project.id,
              label: project.name,
              value: seconds,
              color: PROJECT_COLOR_HEX[project.color],
            }))}
            selected={selectedProject}
            onSelect={(id) => setSelectedProject(selectedProject === id ? null : id)}
            total={totalProjectSeconds}
          />
        </div>
      </div>
    </div>
  );
}

/* ─── Donut Chart ─── */
function DonutChart({ data, selected, onSelect, total }: {
  data: { id: string; label: string; value: number; color: string }[];
  selected: string | null;
  onSelect: (id: string) => void;
  total: number;
}) {
  const size = 180;
  const strokeWidth = 28;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let offset = 0;
  const segments = data.map((d) => {
    const pct = d.value / (total || 1);
    const segment = { ...d, pct, offset, length: pct * circumference };
    offset += segment.length;
    return segment;
  });

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <svg width={size} height={size} className="rotate-[-90deg]">
          {segments.map((seg) => (
            <circle
              key={seg.id}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={seg.color}
              strokeWidth={strokeWidth}
              strokeDasharray={`${seg.length} ${circumference - seg.length}`}
              strokeDashoffset={-seg.offset}
              className={cn("transition-opacity duration-150 cursor-pointer", selected && selected !== seg.id ? "opacity-30" : "opacity-100")}
              onClick={() => onSelect(seg.id)}
            />
          ))}
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <p className="text-lg font-bold tabular-nums text-text">{formatDuration(total)}</p>
            <p className="text-[10px] text-text-tertiary">Total</p>
          </div>
        </div>
      </div>
      <div className="w-full space-y-1.5">
        {data.slice(0, 6).map((d) => (
          <button
            key={d.id}
            type="button"
            onClick={() => onSelect(d.id)}
            className={cn(
              "flex w-full items-center gap-2 rounded-md px-2 py-1 text-xs transition-colors hover:bg-surface-2",
              selected === d.id && "bg-accent/5",
            )}
          >
            <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
            <span className="flex-1 truncate text-left text-text-secondary">{d.label}</span>
            <span className="tabular-nums text-text-tertiary">{((d.value / (total || 1)) * 100).toFixed(0)}%</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ─── Detailed Tab ─── */
function DetailedTab({ entries }: { entries: TimeEntry[] }) {
  const sorted = useMemo(() => [...entries].sort((a, b) => b.date.localeCompare(a.date) || b.startTime.localeCompare(a.startTime)), [entries]);

  return (
    <div className="rounded-card border border-border/[0.07] bg-surface shadow-card dark:border-white/[0.06] overflow-x-auto">
      <div className="min-w-[780px]">
      {/* Header */}
      <div className="grid h-11 items-center gap-3 rounded-t-card bg-[#F3F0FF] px-5 text-[10px] font-semibold uppercase tracking-wider text-text-secondary dark:bg-accent/[0.06] grid-cols-[minmax(200px,1.5fr)_130px_100px_140px_90px_80px]">
        <span>Task</span>
        <span>Project</span>
        <span>User</span>
        <span>Time Range</span>
        <span>Date</span>
        <span className="text-right">Duration</span>
      </div>

      {/* Rows */}
      <div className="divide-y divide-border/[0.06] dark:divide-white/[0.05]">
        {sorted.length ? sorted.map((entry) => {
          const project = projectById(entry.projectId);
          return (
            <div key={entry.id} className="group grid h-14 items-center gap-3 px-5 transition-colors duration-150 hover:bg-accent/[0.03] dark:hover:bg-accent/[0.05] grid-cols-[minmax(200px,1.5fr)_130px_100px_140px_90px_80px]">
              <span className="truncate text-sm font-medium text-text">{entry.task}</span>
              <span className={cn("inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium leading-4", PROJECT_COLOR_BADGE[project.color])}>
                <span className={cn("h-1.5 w-1.5 rounded-full", PROJECT_COLOR_DOT[project.color])} />
                {project.name}
              </span>
              <div className="flex items-center gap-1.5">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent/10 text-[9px] font-bold text-accent">IA</span>
                <span className="text-xs text-text-secondary">Irfan</span>
              </div>
              <span className="text-xs tabular-nums text-text-tertiary">{formatTimeRange(entry.startTime, entry.endTime)}</span>
              <span className="text-xs text-text-tertiary">{format(parseISO(entry.date), "MMM dd")}</span>
              <span className="text-right text-sm font-bold tabular-nums text-text">{formatDuration(entry.durationSeconds)}</span>
            </div>
          );
        }) : (
          <div className="flex h-32 items-center justify-center text-sm text-text-tertiary">No entries match your filters.</div>
        )}
      </div>
      </div>
    </div>
  );
}

/* ─── Weekly Tab ─── */
function WeeklyTab({ entries }: { entries: TimeEntry[] }) {
  const [expandedProject, setExpandedProject] = useState<string | null>(null);

  const weekStart = useMemo(() => {
    const dates = entries.map((e) => parseISO(e.date));
    if (dates.length === 0) return startOfWeek(new Date(), { weekStartsOn: 1 });
    const latest = dates.sort((a, b) => b.getTime() - a.getTime())[0];
    return startOfWeek(latest, { weekStartsOn: 1 });
  }, [entries]);

  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const projectWeekly = useMemo(() => {
    const map = new Map<string, number[]>();
    entries.forEach((e) => {
      const entryDate = parseISO(e.date);
      const dayIndex = days.findIndex((d) => isSameDay(d, entryDate));
      if (dayIndex === -1) return;
      if (!map.has(e.projectId)) map.set(e.projectId, Array(7).fill(0));
      map.get(e.projectId)![dayIndex] += e.durationSeconds;
    });
    return Array.from(map.entries()).map(([id, daySecs]) => ({
      project: projectById(id),
      days: daySecs,
      total: daySecs.reduce((s, d) => s + d, 0),
    })).sort((a, b) => b.total - a.total);
  }, [entries, days]);


  const projectEntries = useMemo(() => {
    if (!expandedProject) return [];
    return entries
      .filter((e) => e.projectId === expandedProject)
      .filter((e) => days.some((d) => isSameDay(d, parseISO(e.date))));
  }, [entries, expandedProject, days]);

  return (
    <div className="rounded-card border border-border/[0.07] bg-surface shadow-card overflow-x-auto dark:border-white/[0.06]">
      {/* Header */}
      <div className="grid min-w-[700px] h-11 items-center gap-px rounded-t-card bg-[#F3F0FF] px-5 text-[10px] font-semibold uppercase tracking-wider text-text-secondary dark:bg-accent/[0.06] grid-cols-[minmax(160px,1.3fr)_repeat(7,1fr)]">
        <span className="sticky left-0 bg-[#F3F0FF] dark:bg-accent/[0.06] pl-0">Project</span>
        {dayLabels.map((d, i) => (
          <span key={d} className={cn("text-center", i >= 5 && "text-accent/60")}>{d}</span>
        ))}
      </div>

      {/* Rows */}
      <div className="divide-y divide-border/[0.06] dark:divide-white/[0.05] min-w-[700px]">
        {projectWeekly.map(({ project, days: daySecs }) => (
          <div key={project.id}>
            <button
              type="button"
              onClick={() => setExpandedProject(expandedProject === project.id ? null : project.id)}
              className={cn(
                "grid w-full h-12 items-center gap-px px-5 text-left transition-colors duration-150 hover:bg-accent/[0.03] dark:hover:bg-accent/[0.05] grid-cols-[minmax(160px,1.3fr)_repeat(7,1fr)]",
                expandedProject === project.id && "bg-accent/[0.03]",
              )}
            >
              <div className="flex items-center gap-2 sticky left-0">
                <span className={cn("h-2 w-2 rounded-full shrink-0", PROJECT_COLOR_DOT[project.color])} />
                <span className="truncate text-sm font-medium text-text">{project.name}</span>
              </div>
              {daySecs.map((sec, i) => (
                <span key={i} className={cn("text-center text-xs tabular-nums", sec > 0 ? "text-text" : "text-text-tertiary/40", i >= 5 && "bg-accent/[0.02] rounded")}>
                  {sec > 0 ? formatHoursShort(sec) : "—"}
                </span>
              ))}
            </button>

            {/* Expanded tasks */}
            {expandedProject === project.id && (
              <div className="border-t border-dashed border-border/[0.06] bg-surface-2/30 dark:border-white/[0.04]">
                {projectEntries.map((entry) => {
                  const dayIdx = days.findIndex((d) => isSameDay(d, parseISO(entry.date)));
                  return (
                    <div key={entry.id} className="grid h-10 items-center gap-px px-5 grid-cols-[minmax(160px,1.3fr)_repeat(7,1fr)]">
                      <span className="truncate text-xs text-text-secondary pl-4">{entry.task}</span>
                      {Array.from({ length: 7 }, (_, i) => (
                        <span key={i} className="text-center text-[11px] tabular-nums text-text-tertiary">
                          {i === dayIdx ? formatHoursShort(entry.durationSeconds) : ""}
                        </span>
                      ))}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function formatHoursShort(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.round((seconds % 3600) / 60);
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

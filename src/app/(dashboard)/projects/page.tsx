"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { MoreHorizontal, Plus, Search, X } from "lucide-react";
import { useTrackerStore } from "@/store/trackerStore";
import { PROJECTS } from "@/data/mockEntries";
import { formatDuration } from "@/lib/time";
import { PROJECT_COLOR_DOT } from "@/lib/projectColors";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { Project } from "@/types/tracker";

type StatusFilter = "all" | "active" | "archived";
type AccessFilter = "all" | "public" | "private";
type BillingFilter = "all" | "billable" | "non-billable";

function getProjectTrackedSeconds(projectId: string, entries: { projectId: string; durationSeconds: number }[]): number {
  return entries.filter((e) => e.projectId === projectId).reduce((sum, e) => sum + e.durationSeconds, 0);
}

export default function ProjectsPage() {
  const entries = useTrackerStore((s) => s.entries);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [accessFilter, setAccessFilter] = useState<AccessFilter>("all");
  const [billingFilter, setBillingFilter] = useState<BillingFilter>("all");

  const hasFilters = search || statusFilter !== "all" || accessFilter !== "all" || billingFilter !== "all";

  const filteredProjects = useMemo(() => {
    let result = PROJECTS;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((p) => p.name.toLowerCase().includes(q) || p.client?.toLowerCase().includes(q));
    }
    if (billingFilter === "billable") result = result.filter((p) => p.billableDefault);
    if (billingFilter === "non-billable") result = result.filter((p) => !p.billableDefault);
    return result;
  }, [search, statusFilter, accessFilter, billingFilter]);

  function clearFilters() {
    setSearch("");
    setStatusFilter("all");
    setAccessFilter("all");
    setBillingFilter("all");
  }

  return (
    <div className="space-y-5 pb-12">
      {/* Hero card */}
      <section className="relative overflow-hidden rounded-shell bg-hero px-6 py-7 text-white shadow-[0_20px_60px_-20px_rgba(49,46,129,0.5)] sm:px-10 sm:py-8">
        <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-white/5 blur-3xl" />

        <div className="relative space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Projects</h1>
              <p className="mt-0.5 text-sm text-white/60">Manage projects, clients, access, and billing</p>
            </div>
            <Button
              size="lg"
              className="gap-2 rounded-[10px] bg-white px-6 text-sm font-semibold text-accent-900 shadow-lg hover:bg-white/90"
            >
              <Plus className="h-4 w-4" /> New project
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative min-w-0 flex-1 sm:max-w-xs">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search projects..."
                className="h-9 w-full rounded-[10px] border border-white/10 bg-white/10 pl-9 pr-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-white/15"
              />
            </div>

            <FilterPillHero label="Status" value={statusFilter} onChange={(v) => setStatusFilter(v as StatusFilter)} options={[
              { value: "all", label: "All" },
              { value: "active", label: "Active" },
              { value: "archived", label: "Archived" },
            ]} />
            <FilterPillHero label="Access" value={accessFilter} onChange={(v) => setAccessFilter(v as AccessFilter)} options={[
              { value: "all", label: "All" },
              { value: "public", label: "Public" },
              { value: "private", label: "Private" },
            ]} />
            <FilterPillHero label="Billing" value={billingFilter} onChange={(v) => setBillingFilter(v as BillingFilter)} options={[
              { value: "all", label: "All" },
              { value: "billable", label: "Billable" },
              { value: "non-billable", label: "Non-billable" },
            ]} />

            {hasFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium text-white/50 hover:bg-white/10 hover:text-white"
              >
              <X className="h-3 w-3" /> Clear filters
            </button>
            )}
          </div>
        </div>
      </section>

      {/* Projects table card */}
      <div className="rounded-card border border-border/[0.07] bg-surface shadow-card dark:border-white/[0.06]">
        {/* Table header */}
        <div className="grid h-11 items-center gap-3 rounded-t-card bg-[#F3F0FF] px-6 text-[11px] font-semibold uppercase tracking-wider text-text-secondary dark:bg-accent/[0.08] grid-cols-[minmax(200px,1.8fr)_160px_120px_100px_110px_90px_40px]">
          <span>Project</span>
          <span>Client</span>
          <span>Tracked</span>
          <span>Access</span>
          <span>Billing</span>
          <span>Status</span>
          <span />
        </div>

        {/* Table rows */}
        <div className="divide-y divide-border/[0.06] dark:divide-white/[0.05]">
          {filteredProjects.length ? (
            filteredProjects.map((project) => (
              <ProjectRow key={project.id} project={project} trackedSeconds={getProjectTrackedSeconds(project.id, entries)} />
            ))
          ) : (
            <div className="flex h-32 items-center justify-center text-sm text-text-tertiary">
              No projects match your filters.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ProjectRow({ project, trackedSeconds }: { project: Project; trackedSeconds: number }) {
  return (
    <Link href={`/projects/${project.id}`} className="contents">
    <div className="group grid h-14 items-center gap-3 px-6 transition-colors duration-150 hover:bg-accent/[0.03] dark:hover:bg-accent/[0.05] grid-cols-[minmax(200px,1.8fr)_160px_120px_100px_110px_90px_40px]">
      {/* Project name with color dot */}
      <div className="flex items-center gap-2.5 min-w-0">
        <span className={cn("h-2.5 w-2.5 shrink-0 rounded-full", PROJECT_COLOR_DOT[project.color])} />
        <span className="truncate text-sm font-medium text-text">{project.name}</span>
      </div>

      {/* Client */}
      <span className="truncate text-sm text-text-secondary">{project.client || "—"}</span>

      {/* Tracked time */}
      <span className="text-sm font-bold tabular-nums text-text">{formatDuration(trackedSeconds)}</span>

      {/* Access */}
      <Badge variant="secondary" className="w-fit text-[10px] px-2 py-0.5">
        {project.client ? "Private" : "Public"}
      </Badge>

      {/* Billing */}
      <span className={cn(
        "inline-flex w-fit items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium leading-4",
        project.billableDefault
          ? "bg-success/10 text-success ring-1 ring-inset ring-success/20"
          : "bg-surface-2 text-text-tertiary ring-1 ring-inset ring-border/10",
      )}>
        <span className="text-[11px]">$</span>
        {project.billableDefault ? "Billable" : "Non-billable"}
      </span>

      {/* Status */}
      <Badge variant="default" className="w-fit text-[10px] px-2 py-0.5">Active</Badge>

      {/* More actions */}
      <div className="justify-self-end opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7" aria-label="More actions">
              <MoreHorizontal className="h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Edit project</DropdownMenuItem>
            <DropdownMenuItem>View entries</DropdownMenuItem>
            <DropdownMenuItem>Manage access</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem destructive>Archive project</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
    </Link>
  );
}

function FilterPillHero({ label, value, onChange, options }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  const active = value !== "all";
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={cn(
        "h-9 cursor-pointer appearance-none rounded-[10px] border px-3 pr-8 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-white/15",
        active
          ? "border-white/25 bg-white/20 text-white"
          : "border-white/10 bg-white/10 text-white/60",
      )}
      style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23ffffff' stroke-width='2' opacity='0.5'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 8px center" }}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.value === "all" ? label : opt.label}
        </option>
      ))}
    </select>
  );
}


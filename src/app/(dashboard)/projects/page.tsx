"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { MoreHorizontal, Plus, Search, X } from "lucide-react";
import MuiTextField from "@mui/material/TextField";
import MuiSwitch from "@mui/material/Switch";
import { useTrackerStore } from "@/store/trackerStore";
import { PROJECTS } from "@/data/mockEntries";
import { formatDuration } from "@/lib/time";
import { PROJECT_COLOR_DOT } from "@/lib/projectColors";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { Project, ProjectColor } from "@/types/tracker";

type StatusFilter = "all" | "active" | "archived";
type AccessFilter = "all" | "public" | "private";
type BillingFilter = "all" | "billable" | "non-billable";

const COLOR_OPTIONS: { value: ProjectColor; hex: string }[] = [
  { value: "indigo", hex: "#5A43D5" },
  { value: "violet", hex: "#7C3AED" },
  { value: "sky", hex: "#4664BE" },
  { value: "emerald", hex: "#2D8C64" },
  { value: "amber", hex: "#9B6E28" },
  { value: "rose", hex: "#A5415F" },
];

const EXTENDED_COLORS = [
  { hex: "#5A43D5", label: "Indigo" },
  { hex: "#7C3AED", label: "Violet" },
  { hex: "#3b82f6", label: "Blue" },
  { hex: "#0ea5e9", label: "Sky" },
  { hex: "#06b6d4", label: "Cyan" },
  { hex: "#10b981", label: "Emerald" },
  { hex: "#22c55e", label: "Green" },
  { hex: "#84cc16", label: "Lime" },
  { hex: "#f59e0b", label: "Amber" },
  { hex: "#f97316", label: "Orange" },
  { hex: "#ef4444", label: "Red" },
  { hex: "#f43f5e", label: "Rose" },
  { hex: "#ec4899", label: "Pink" },
  { hex: "#a855f7", label: "Purple" },
  { hex: "#6b7280", label: "Gray" },
  { hex: "#14b8a6", label: "Teal" },
];

const CLIENT_OPTIONS = [
  "Acme Corp",
  "TechStart Inc",
  "Global Media",
  "Design Studio",
  "Internal",
];

function getProjectTrackedSeconds(projectId: string, entries: { projectId: string; durationSeconds: number }[]): number {
  return entries.filter((e) => e.projectId === projectId).reduce((sum, e) => sum + e.durationSeconds, 0);
}

export default function ProjectsPage() {
  const entries = useTrackerStore((s) => s.entries);
  const [createOpen, setCreateOpen] = useState(false);

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
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="white"
                  size="lg"
                  className="gap-2 rounded-[10px] px-6"
                >
                  <Plus className="h-4 w-4" /> New project
                </Button>
              </DialogTrigger>
              <CreateProjectDialog onClose={() => setCreateOpen(false)} />
            </Dialog>
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

/* ─── Create Project Dialog ─── */
function CreateProjectDialog({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState("");
  const [selectedColor, setSelectedColor] = useState("#5A43D5");
  const [client, setClient] = useState("");
  const [note, setNote] = useState("");
  const [estimatedHours, setEstimatedHours] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [isBillable, setIsBillable] = useState(false);

  function handleCreate() {
    onClose();
  }

  return (
    <DialogContent className="sm:max-w-[480px]">
      <DialogHeader>
        <DialogTitle>Create new project</DialogTitle>
        <DialogDescription className="sr-only">Fill in the details to create a new project.</DialogDescription>
      </DialogHeader>

      <div className="space-y-5 py-2">
        {/* Name */}
        <div>
          <label className="mb-1.5 block text-xs font-medium text-text-secondary">
            Name <span className="text-rose-500">*</span>
          </label>
          <MuiTextField
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Project name"
            fullWidth
            size="small"
            autoFocus
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px" } }}
          />
        </div>

        {/* Color */}
        <div>
          <label className="mb-2 block text-xs font-medium text-text-secondary">Color</label>
          <div className="flex flex-wrap gap-2">
            {EXTENDED_COLORS.map((color) => {
              const isSelected = selectedColor === color.hex;
              return (
                <button
                  key={color.hex}
                  type="button"
                  onClick={() => setSelectedColor(color.hex)}
                  className={cn(
                    "h-7 w-7 rounded-full transition-all duration-150",
                    isSelected ? "ring-2 ring-offset-2 ring-offset-surface scale-110" : "hover:scale-110",
                  )}
                  style={{ backgroundColor: color.hex, ...(isSelected ? { boxShadow: `0 0 0 2px var(--tw-ring-offset-color), 0 0 0 4px ${color.hex}` } : {}) }}
                  title={color.label}
                />
              );
            })}
          </div>
        </div>

        {/* Client */}
        <div>
          <label className="mb-1.5 block text-xs font-medium text-text-secondary">Client</label>
          <Select value={client} onValueChange={setClient}>
            <SelectTrigger className="h-10">
              <SelectValue placeholder="Select a client" />
            </SelectTrigger>
            <SelectContent>
              {CLIENT_OPTIONS.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Note */}
        <div>
          <label className="mb-1.5 block text-xs font-medium text-text-secondary">Note</label>
          <MuiTextField
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add a note about this project..."
            fullWidth
            size="small"
            multiline
            rows={3}
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px" } }}
          />
        </div>

        {/* Estimated Hours */}
        <div>
          <label className="mb-1.5 block text-xs font-medium text-text-secondary">Estimated Hours</label>
          <MuiTextField
            type="number"
            value={estimatedHours}
            onChange={(e) => setEstimatedHours(e.target.value)}
            placeholder="e.g. 120"
            fullWidth
            size="small"
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px" } }}
          />
        </div>

        {/* Toggles */}
        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <MuiSwitch
              checked={isPublic}
              onChange={(_, v) => setIsPublic(v)}
              size="small"
              sx={{
                width: 36, height: 20, padding: 0,
                "& .MuiSwitch-switchBase": { padding: "2px", "&.Mui-checked": { transform: "translateX(16px)", color: "#fff", "& + .MuiSwitch-track": { background: "linear-gradient(135deg, #4133A5, #7A4DFF)", opacity: 1 } } },
                "& .MuiSwitch-thumb": { width: 16, height: 16 },
                "& .MuiSwitch-track": { borderRadius: 10, opacity: 1, backgroundColor: "var(--color-surface-3)" },
              }}
            />
            <span className="text-sm text-text">Public — visible to all workspace members</span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <MuiSwitch
              checked={isBillable}
              onChange={(_, v) => setIsBillable(v)}
              size="small"
              sx={{
                width: 36, height: 20, padding: 0,
                "& .MuiSwitch-switchBase": { padding: "2px", "&.Mui-checked": { transform: "translateX(16px)", color: "#fff", "& + .MuiSwitch-track": { background: "linear-gradient(135deg, #4133A5, #7A4DFF)", opacity: 1 } } },
                "& .MuiSwitch-thumb": { width: 16, height: 16 },
                "& .MuiSwitch-track": { borderRadius: 10, opacity: 1, backgroundColor: "var(--color-surface-3)" },
              }}
            />
            <span className="text-sm text-text">Billable</span>
          </label>
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onClose} className="rounded-[10px]">
          Cancel
        </Button>
        <Button
          onClick={handleCreate}
          disabled={!name.trim()}
          className="rounded-[10px] px-5"
        >
          Create Project
        </Button>
      </DialogFooter>
    </DialogContent>
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
  const MuiSelectImport = require("@mui/material/Select").default;
  const MuiMenuItemImport = require("@mui/material/MenuItem").default;
  const active = value !== "all";
  return (
    <MuiSelectImport
      value={value}
      onChange={(e: any) => onChange(e.target.value)}
      size="small"
      displayEmpty
      renderValue={() => <span className="text-xs font-medium">{value === "all" ? label : options.find(o => o.value === value)?.label}</span>}
      sx={{
        height: 36,
        borderRadius: "10px",
        fontSize: "0.75rem",
        fontWeight: 500,
        color: active ? "white" : "rgba(255,255,255,0.6)",
        backgroundColor: active ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.1)",
        "& .MuiOutlinedInput-notchedOutline": { borderColor: active ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.1)" },
        "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.3)" },
        "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.15)" },
        "& .MuiSelect-icon": { color: "rgba(255,255,255,0.5)" },
        "& .MuiSelect-select": { paddingRight: "28px !important", paddingLeft: "12px" },
      }}
      MenuProps={{
        PaperProps: {
          className: "!rounded-[14px] !border !border-border/[0.07] !bg-surface !shadow-float dark:!border-white/[0.06]",
          sx: { backgroundImage: "none" },
        },
      }}
    >
      {options.map((opt) => (
        <MuiMenuItemImport key={opt.value} value={opt.value} sx={{ fontSize: "0.75rem" }}>
          {opt.value === "all" ? label : opt.label}
        </MuiMenuItemImport>
      ))}
    </MuiSelectImport>
  );
}

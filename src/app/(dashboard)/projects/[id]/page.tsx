"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Check,
  ChevronRight,
  MoreHorizontal,
  Plus,
  Search,
  UserPlus,
} from "lucide-react";
import { PROJECTS } from "@/data/mockEntries";
import { useTrackerStore } from "@/store/trackerStore";
import { formatDuration } from "@/lib/time";
import { PROJECT_COLOR_DOT } from "@/lib/projectColors";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

type Tab = "members" | "settings";

const MOCK_MEMBERS = [
  { id: "m1", name: "Irfan Alisha", email: "irfan@zessta.com", role: "Admin" as const, status: "Active" as const, lastActive: "Just now", avatar: "IA" },
  { id: "m2", name: "Sarah Chen", email: "sarah@zessta.com", role: "Manager" as const, status: "Active" as const, lastActive: "2h ago", avatar: "SC" },
  { id: "m3", name: "Mike Rodriguez", email: "mike@zessta.com", role: "Member" as const, status: "Active" as const, lastActive: "1d ago", avatar: "MR" },
  { id: "m4", name: "Emily Park", email: "emily@zessta.com", role: "Member" as const, status: "Pending" as const, lastActive: "—", avatar: "EP" },
  { id: "m5", name: "John Davis", email: "john@zessta.com", role: "Viewer" as const, status: "Active" as const, lastActive: "3h ago", avatar: "JD" },
];


const ROLE_STYLES: Record<string, string> = {
  Admin: "bg-accent/10 text-accent ring-1 ring-inset ring-accent/20",
  Manager: "bg-amber-500/10 text-amber-600 ring-1 ring-inset ring-amber-500/20",
  Member: "bg-sky-500/10 text-sky-600 ring-1 ring-inset ring-sky-500/20",
  Viewer: "bg-surface-2 text-text-tertiary ring-1 ring-inset ring-border/10",
};

export default function ProjectDetailPage() {
  const params = useParams();
  const projectId = params.id as string;
  const project = PROJECTS.find((p) => p.id === projectId);
  const entries = useTrackerStore((s) => s.entries);
  const [activeTab, setActiveTab] = useState<Tab>("members");

  if (!project) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-sm text-text-tertiary">Project not found.</p>
      </div>
    );
  }

  const trackedSeconds = entries
    .filter((e) => e.projectId === project.id)
    .reduce((sum, e) => sum + e.durationSeconds, 0);
  const entryCount = entries.filter((e) => e.projectId === project.id).length;
  const isPrivate = Boolean(project.client);

  const tabs: { key: Tab; label: string }[] = [
    { key: "members", label: "Members" },
    { key: "settings", label: "Settings" },
  ];

  return (
    <div className="space-y-5 pb-12">
      {/* Hero card */}
      <section className="relative overflow-hidden rounded-shell bg-hero px-6 py-8 text-white shadow-[0_20px_60px_-20px_rgba(49,46,129,0.5)] sm:px-10 sm:py-10">
        <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-white/5 blur-3xl" />

        <div className="relative space-y-4">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-sm text-white/60">
            <Link href="/projects" className="hover:text-white transition-colors">Projects</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="font-medium text-white">{project.name}</span>
          </nav>

          {/* Header row */}
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className={cn("h-4 w-4 rounded-full ring-2 ring-white/20", PROJECT_COLOR_DOT[project.color])} />
              <div>
                <h1 className="text-2xl font-bold tracking-tight">{project.name}</h1>
                <p className="mt-0.5 text-sm text-white/60">{project.client || "Internal project"}</p>
              </div>
              <div className="ml-2 flex items-center gap-1.5">
                <span className="rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-semibold text-white">Active</span>
                <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-semibold text-white/70">
                  {isPrivate ? "Private" : "Public"}
                </span>
              </div>
            </div>
          </div>

          {/* Stats row — KPI cards */}
          <div className="grid grid-cols-2 gap-3 pt-2 sm:grid-cols-4">
            <div className="flex flex-col gap-1 rounded-lg bg-white/[0.14] px-5 py-4 backdrop-blur-sm">
              <span className="text-[11px] font-medium uppercase tracking-wide text-white/50">Total Tracked</span>
              <span className="text-xl font-bold tabular-nums text-white">{formatDuration(trackedSeconds)}</span>
            </div>
            <div className="flex flex-col gap-1 rounded-lg bg-white/[0.14] px-5 py-4 backdrop-blur-sm">
              <span className="text-[11px] font-medium uppercase tracking-wide text-white/50">Sessions</span>
              <span className="text-xl font-bold text-white">{entryCount}</span>
            </div>
            <div className="flex flex-col gap-1 rounded-lg bg-white/[0.14] px-5 py-4 backdrop-blur-sm">
              <span className="text-[11px] font-medium uppercase tracking-wide text-white/50">Members</span>
              <span className="text-xl font-bold text-white">{MOCK_MEMBERS.length}</span>
            </div>
            <div className="flex flex-col gap-1 rounded-lg bg-white/[0.14] px-5 py-4 backdrop-blur-sm">
              <span className="text-[11px] font-medium uppercase tracking-wide text-white/50">Billing</span>
              <span className="text-xl font-bold text-white">{project.billableDefault ? "Billable" : "Non-billable"}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Tab switcher */}
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

      {/* Tab content */}
      {activeTab === "members" && <MembersTab />}
      {activeTab === "settings" && <SettingsTab project={project} />}
    </div>
  );
}

/* ─── Members Tab ─── */
function MembersTab() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const filtered = MOCK_MEMBERS.filter((m) => {
    if (search) {
      const q = search.toLowerCase();
      if (!m.name.toLowerCase().includes(q) && !m.email.toLowerCase().includes(q)) return false;
    }
    if (roleFilter !== "all" && m.role.toLowerCase() !== roleFilter) return false;
    return true;
  });

  return (
    <div className="rounded-card border border-border/[0.07] bg-surface shadow-card dark:border-white/[0.06]">
      {/* Card header */}
      <div className="flex flex-wrap items-center gap-3 border-b border-border/[0.06] px-5 py-3.5 dark:border-white/[0.05]">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-text">Members</h2>
          <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-accent/10 px-1.5 text-[10px] font-bold text-accent">
            {MOCK_MEMBERS.length}
          </span>
        </div>
        <div className="relative ml-auto min-w-0 sm:w-56">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-tertiary" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search members..."
            className="h-10 w-full rounded-[10px] border border-border/10 bg-surface-2/60 pl-8 pr-3 text-sm text-text placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent/20 dark:border-white/10"
          />
        </div>
        <div className="w-40 shrink-0">
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger>
              <SelectValue placeholder="All roles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All roles</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="manager">Manager</SelectItem>
              <SelectItem value="member">Member</SelectItem>
              <SelectItem value="viewer">Viewer</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button variant="white" size="sm" className="gap-1.5">
          <UserPlus className="h-3.5 w-3.5" /> Invite Member
        </Button>
      </div>

      <div className="overflow-x-auto">
      <div className="min-w-[560px]">
      {/* Table header */}
      <div className="grid h-9 items-center gap-3 bg-[#F3F0FF] px-5 text-[10px] font-semibold uppercase tracking-wider text-text-secondary dark:bg-accent/[0.06] grid-cols-[40px_minmax(200px,1fr)_120px_100px_40px]">
        <span />
        <span>Name</span>
        <span>Role</span>
        <span>Status</span>
        <span />
      </div>

      {/* Member rows */}
      <div className="divide-y divide-border/[0.06] dark:divide-white/[0.05]">
        {filtered.length ? filtered.map((member) => (
          <div key={member.id} className="group grid h-14 items-center gap-3 px-5 transition-colors duration-150 hover:bg-accent/[0.03] dark:hover:bg-accent/[0.05] grid-cols-[40px_minmax(200px,1fr)_120px_100px_40px]">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/10 text-[11px] font-bold text-accent">
              {member.avatar}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-text">{member.name}</p>
              <p className="truncate text-xs text-text-tertiary">{member.email}</p>
            </div>
            <span className={cn("inline-flex w-fit items-center rounded-full px-2 py-0.5 text-[10px] font-semibold leading-4", ROLE_STYLES[member.role])}>
              {member.role}
            </span>
            <Badge variant={member.status === "Active" ? "success" : "warning"} className="w-fit text-[10px] px-2 py-0.5">
              {member.status}
            </Badge>
            <div className="justify-self-end opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7">
                    <MoreHorizontal className="h-3.5 w-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Change role</DropdownMenuItem>
                  <DropdownMenuItem>Resend invite</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem destructive>Remove member</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        )) : (
          <div className="flex h-24 items-center justify-center text-sm text-text-tertiary">No members match your search.</div>
        )}
      </div>
      </div>
      </div>
    </div>
  );
}

/* ─── Settings Tab ─── */
const PROJECT_COLORS = [
  { value: "indigo", label: "Indigo", class: "bg-indigo-500" },
  { value: "violet", label: "Violet", class: "bg-violet-500" },
  { value: "sky", label: "Sky", class: "bg-sky-500" },
  { value: "emerald", label: "Emerald", class: "bg-emerald-500" },
  { value: "amber", label: "Amber", class: "bg-amber-500" },
  { value: "rose", label: "Rose", class: "bg-rose-500" },
];

const CLIENTS = ["None", "Meridian Health", "Atlas Robotics", "Zessta Software Solutions"];

function SettingsTab({ project }: { project: (typeof PROJECTS)[number] }) {
  const [name, setName] = useState(project.name);
  const [client, setClient] = useState(project.client || "None");
  const [color, setColor] = useState<string>(project.color);
  const [visibility, setVisibility] = useState<"private" | "public">(project.client ? "private" : "public");
  const [billable, setBillable] = useState(project.billableDefault);
  const [rate, setRate] = useState("");
  const [estimate, setEstimate] = useState("");
  const [saved, setSaved] = useState(false);
  const [nameError, setNameError] = useState("");

  const isDirty =
    name !== project.name ||
    client !== (project.client || "None") ||
    color !== project.color ||
    visibility !== (project.client ? "private" : "public") ||
    billable !== project.billableDefault ||
    rate !== "" ||
    estimate !== "";

  function handleSave() {
    setNameError("");
    if (!name.trim()) {
      setNameError("Project name is required.");
      return;
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div className="rounded-card border border-border/[0.07] bg-surface p-6 shadow-card dark:border-white/[0.06]">
      <div className="space-y-6">
        {/* Name */}
        <div>
          <label className="text-sm font-medium text-text">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => { setName(e.target.value); setNameError(""); }}
            className={cn(
              "mt-1.5 h-10 w-full rounded-[10px] border bg-surface-2/60 px-3 text-sm text-text placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent/20 dark:border-white/10",
              nameError ? "border-danger/50" : "border-border/10",
            )}
          />
          {nameError && <p className="mt-1 text-xs font-medium text-danger">{nameError}</p>}
        </div>

        <div className="border-t border-border/[0.06] dark:border-white/[0.05]" />

        {/* Client */}
        <div>
          <label className="text-sm font-medium text-text">Client</label>
          <div className="mt-1.5 w-full max-w-sm">
            <Select value={client} onValueChange={setClient}>
              <SelectTrigger>
                <SelectValue placeholder="Select client" />
              </SelectTrigger>
              <SelectContent>
                {CLIENTS.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <p className="mt-1.5 text-xs text-text-tertiary">Used for grouping similar projects together.</p>
        </div>

        <div className="border-t border-border/[0.06] dark:border-white/[0.05]" />

        {/* Color */}
        <div>
          <label className="text-sm font-medium text-text">Color</label>
          <div className="mt-1.5 flex items-center gap-2">
            {PROJECT_COLORS.map((c) => (
              <button
                key={c.value}
                type="button"
                onClick={() => setColor(c.value)}
                className={cn(
                  "h-7 w-7 rounded-full transition-all",
                  c.class,
                  color === c.value
                    ? "ring-2 ring-accent ring-offset-2 ring-offset-surface"
                    : "opacity-60 hover:opacity-100",
                )}
                aria-label={c.label}
                title={c.label}
              />
            ))}
          </div>
          <p className="mt-1.5 text-xs text-text-tertiary">Use color to visually differentiate projects.</p>
        </div>

        <div className="border-t border-border/[0.06] dark:border-white/[0.05]" />

        {/* Visibility */}
        <div>
          <label className="text-sm font-medium text-text">Visibility</label>
          <p className="mt-0.5 text-xs text-text-tertiary">Only people you add to the Project can track time on it.</p>
          <div className="mt-3 flex items-center gap-5">
            <button type="button" onClick={() => setVisibility("private")} className="flex cursor-pointer items-center gap-2">
              <span
                className={cn(
                  "flex h-[18px] w-[18px] items-center justify-center rounded-full border-2 transition-colors",
                  visibility === "private"
                    ? "border-accent"
                    : "border-border/40 dark:border-white/20",
                )}
              >
                {visibility === "private" && <span className="h-2.5 w-2.5 rounded-full bg-accent" />}
              </span>
              <span className="text-sm text-text">Private</span>
            </button>
            <button type="button" onClick={() => setVisibility("public")} className="flex cursor-pointer items-center gap-2">
              <span
                className={cn(
                  "flex h-[18px] w-[18px] items-center justify-center rounded-full border-2 transition-colors",
                  visibility === "public"
                    ? "border-accent"
                    : "border-border/40 dark:border-white/20",
                )}
              >
                {visibility === "public" && <span className="h-2.5 w-2.5 rounded-full bg-accent" />}
              </span>
              <span className="text-sm text-text">Public</span>
            </button>
          </div>
        </div>

        <div className="border-t border-border/[0.06] dark:border-white/[0.05]" />

        {/* Billable by default */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-text">Billable by default</p>
            <p className="mt-0.5 text-xs text-text-tertiary">All new entries on this project will initially be set as billable.</p>
          </div>
          <Switch
            checked={billable}
            onCheckedChange={setBillable}
            className="data-[state=checked]:bg-accent"
          />
        </div>

        <div className="border-t border-border/[0.06] dark:border-white/[0.05]" />

        {/* Project billable rate */}
        <div>
          <label className="text-sm font-medium text-text">Project billable rate</label>
          <div className="mt-1.5 flex items-center gap-2">
            <div className="relative w-full max-w-[200px]">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-text-tertiary">$</span>
              <input
                type="number"
                value={rate}
                onChange={(e) => setRate(e.target.value)}
                placeholder="0.00"
                className="h-10 w-full rounded-[10px] border border-border/10 bg-surface-2/60 pl-7 pr-3 text-sm text-text placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent/20 dark:border-white/10 [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>
            <span className="text-xs text-text-tertiary">/hr</span>
            <Button
              size="sm"
              className="ml-2 rounded-[10px]"
              disabled={!rate}
            >
              Set rate
            </Button>
          </div>
          <p className="mt-1.5 text-xs text-text-tertiary">Billable rate used for calculating billable amount for this project.</p>
        </div>

        <div className="border-t border-border/[0.06] dark:border-white/[0.05]" />

        {/* Project estimate */}
        <div>
          <label className="text-sm font-medium text-text">Project estimate</label>
          <div className="mt-1.5 relative w-full max-w-[200px]">
            <input
              type="number"
              value={estimate}
              onChange={(e) => setEstimate(e.target.value)}
              placeholder="0"
              className="h-10 w-full rounded-[10px] border border-border/10 bg-surface-2/60 px-3 pr-12 text-sm text-text placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent/20 dark:border-white/10 [&::-webkit-inner-spin-button]:appearance-none"
            />
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-text-tertiary">hrs</span>
          </div>
          <p className="mt-1.5 text-xs text-text-tertiary">Choose how you wish to track project progress.</p>
        </div>
      </div>

      {/* Footer with save button */}
      <div className="mt-8 flex items-center justify-end gap-3 border-t border-border/[0.06] pt-5 dark:border-white/[0.05]">
        {saved && (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-success animate-in fade-in slide-in-from-right-2 duration-200">
            <Check className="h-3.5 w-3.5" /> Changes saved
          </span>
        )}
        <Button
          onClick={handleSave}
          disabled={!isDirty}
          className="rounded-[10px] px-5"
        >
          Save changes
        </Button>
      </div>
    </div>
  );
}


"use client";

import { useMemo, useState } from "react";
import {
  Calendar,
  ChevronDown,
  Download,
  Mail,
  MoreHorizontal,
  Plus,
  Search,
  Shield,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import Box from "@mui/material/Box";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

type Role = "admin" | "project_manager" | "team_member";
type Status = "active" | "inactive" | "pending";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  initials: string;
  color: string;
  role: Role;
  status: Status;
  billableRate: number | null;
  currency: string;
  projects: number;
  lastActive: string;
}

const ROLE_LABELS: Record<Role, string> = {
  admin: "Admin",
  project_manager: "Project Manager",
  team_member: "Team Member",
};

const ROLE_STYLES: Record<Role, string> = {
  admin: "bg-violet-500/10 text-violet-600 ring-1 ring-inset ring-violet-500/20 dark:bg-violet-400/10 dark:text-violet-300",
  project_manager: "bg-sky-500/10 text-sky-600 ring-1 ring-inset ring-sky-500/20 dark:bg-sky-400/10 dark:text-sky-300",
  team_member: "bg-emerald-500/10 text-emerald-600 ring-1 ring-inset ring-emerald-500/20 dark:bg-emerald-400/10 dark:text-emerald-300",
};

const STATUS_STYLES: Record<Status, string> = {
  active: "bg-emerald-500/10 text-emerald-600 ring-1 ring-inset ring-emerald-500/20",
  inactive: "bg-zinc-500/10 text-zinc-500 ring-1 ring-inset ring-zinc-500/20",
  pending: "bg-amber-500/10 text-amber-600 ring-1 ring-inset ring-amber-500/20",
};

const MOCK_MEMBERS: TeamMember[] = [
  { id: "1", name: "Irfan Alisha", email: "irfan@zelog.io", initials: "IA", color: "bg-accent", role: "admin", status: "active", billableRate: 1500, currency: "₹", projects: 6, lastActive: "2h ago" },
  { id: "2", name: "Sarah Chen", email: "sarah.chen@zelog.io", initials: "SC", color: "bg-sky-500", role: "project_manager", status: "active", billableRate: 125, currency: "$", projects: 4, lastActive: "5h ago" },
  { id: "3", name: "Mike Rodriguez", email: "mike.r@zelog.io", initials: "MR", color: "bg-emerald-500", role: "team_member", status: "active", billableRate: 95, currency: "$", projects: 3, lastActive: "1d ago" },
  { id: "4", name: "Emily Park", email: "emily.park@zelog.io", initials: "EP", color: "bg-amber-500", role: "team_member", status: "active", billableRate: 110, currency: "$", projects: 2, lastActive: "3h ago" },
  { id: "5", name: "John Davis", email: "john.d@zelog.io", initials: "JD", color: "bg-rose-500", role: "team_member", status: "active", billableRate: null, currency: "$", projects: 3, lastActive: "12h ago" },
  { id: "6", name: "Priya Sharma", email: "priya@zelog.io", initials: "PS", color: "bg-violet-500", role: "project_manager", status: "active", billableRate: 1200, currency: "₹", projects: 5, lastActive: "30m ago" },
  { id: "7", name: "Alex Thompson", email: "alex.t@zelog.io", initials: "AT", color: "bg-indigo-500", role: "team_member", status: "inactive", billableRate: 85, currency: "$", projects: 0, lastActive: "2w ago" },
  { id: "8", name: "Lisa Wang", email: "lisa.wang@zelog.io", initials: "LW", color: "bg-pink-500", role: "team_member", status: "pending", billableRate: null, currency: "$", projects: 0, lastActive: "—" },
  { id: "9", name: "David Kim", email: "david.kim@zelog.io", initials: "DK", color: "bg-teal-500", role: "team_member", status: "active", billableRate: 100, currency: "$", projects: 2, lastActive: "6h ago" },
  { id: "10", name: "Raj Patel", email: "raj.p@zelog.io", initials: "RP", color: "bg-orange-500", role: "admin", status: "active", billableRate: 1800, currency: "₹", projects: 6, lastActive: "1h ago" },
];

export default function TeamPage() {
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<Role>("team_member");
  const [actionsOpen, setActionsOpen] = useState<string | null>(null);
  const [rateMember, setRateMember] = useState<TeamMember | null>(null);
  const [rateValue, setRateValue] = useState("");

  const filteredMembers = useMemo(() => {
    let result = MOCK_MEMBERS;
    if (statusFilter !== "all") {
      result = result.filter((m) => m.status === statusFilter);
    }
    if (roleFilter !== "all") {
      result = result.filter((m) => m.role === roleFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((m) => m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q));
    }
    return result;
  }, [statusFilter, roleFilter, searchQuery]);

  const activeCount = MOCK_MEMBERS.filter((m) => m.status === "active").length;
  const inactiveCount = MOCK_MEMBERS.filter((m) => m.status === "inactive").length;
  const hasFilters = statusFilter !== "all" || roleFilter !== "all" || searchQuery.trim().length > 0;

  return (
    <div className="space-y-5 pb-12">
      {/* Hero Header */}
      <section className="relative overflow-hidden rounded-shell bg-hero px-6 py-7 text-white shadow-[0_20px_60px_-20px_rgba(49,46,129,0.5)] sm:px-10 sm:py-8">
        <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-white/5 blur-3xl" />
        <div className="relative flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-semibold tracking-tight">Team</h1>
            <p className="mt-0.5 text-sm text-white/60">Manage members, roles, access, and billing rates.</p>
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="flex flex-col gap-1 rounded-lg bg-white/[0.14] px-5 py-4 backdrop-blur-sm">
                <span className="text-[11px] font-medium text-white/50 uppercase tracking-wide">Active</span>
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                  <span className="text-xl font-bold text-white">{activeCount}</span>
                </div>
                <span className="text-[11px] text-white/40">Team members</span>
              </div>
              <div className="flex flex-col gap-1 rounded-lg bg-white/[0.14] px-5 py-4 backdrop-blur-sm">
                <span className="text-[11px] font-medium text-white/50 uppercase tracking-wide">All Members</span>
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-white/60" />
                  <span className="text-xl font-bold text-white">{MOCK_MEMBERS.length}</span>
                </div>
                <span className="text-[11px] text-white/40">Total count</span>
              </div>
              <div className="flex flex-col gap-1 rounded-lg bg-white/[0.14] px-5 py-4 backdrop-blur-sm">
                <span className="text-[11px] font-medium text-white/50 uppercase tracking-wide">Inactive</span>
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-white/30" />
                  <span className="text-xl font-bold text-white">{inactiveCount}</span>
                </div>
                <span className="text-[11px] text-white/40">Deactivated</span>
              </div>
            </div>
          </div>
          <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
            <DialogTrigger asChild>
              <Button variant="white" size="lg" className="gap-2">
                <UserPlus className="h-4 w-4" /> Invite member
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invite new member</DialogTitle>
                <DialogDescription>Send an invitation to join your team workspace.</DialogDescription>
              </DialogHeader>
              <div className="mt-4 space-y-4">
                <div>
                  <label className="text-xs font-medium text-text-secondary mb-1.5 block">Email address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary" />
                    <input
                      type="email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder="colleague@company.com"
                      className="h-10 w-full rounded-[10px] border border-border/10 bg-surface-2/50 pl-10 pr-3 text-sm text-text placeholder:text-text-tertiary focus:border-accent/30 focus:outline-none focus:ring-2 focus:ring-accent/20 dark:border-white/10"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-text-secondary mb-1.5 block">Role</label>
                  <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as Role)}>
                    <SelectTrigger className="h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="project_manager">Project Manager</SelectItem>
                      <SelectItem value="team_member">Team Member</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs font-medium text-text-secondary mb-1.5 block">Billable rate (optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. 125"
                    className="h-10 w-full rounded-[10px] border border-border/10 bg-surface-2/50 px-3 text-sm text-text placeholder:text-text-tertiary focus:border-accent/30 focus:outline-none focus:ring-2 focus:ring-accent/20 dark:border-white/10"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setInviteOpen(false)}>Cancel</Button>
                <Button disabled={!inviteEmail.includes("@")} onClick={() => setInviteOpen(false)}>
                  Send invite
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </section>

      {/* Filter Toolbar */}
      <div className="rounded-card border border-border/[0.07] bg-surface px-5 py-3 shadow-card dark:border-white/[0.06]">
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            width: "100%",
            flexWrap: { xs: "wrap", md: "nowrap" },
          }}
        >
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or email"
              className="h-10 w-full rounded-[10px] border border-border/10 bg-surface-2/60 pl-9 pr-3 text-sm text-text placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent/20 dark:border-white/10"
            />
          </div>

          <Box sx={{ width: { xs: "100%", md: 180 }, flexShrink: 0 }}>
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as "all" | "active" | "inactive")}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All members</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </Box>

          <Box sx={{ width: { xs: "100%", md: 200 }, flexShrink: 0 }}>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All roles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="project_manager">Project Manager</SelectItem>
                <SelectItem value="team_member">Team Member</SelectItem>
              </SelectContent>
            </Select>
          </Box>

          {hasFilters && (
            <button
              type="button"
              onClick={() => { setStatusFilter("all"); setRoleFilter("all"); setSearchQuery(""); }}
              className="shrink-0 text-xs font-medium text-text-tertiary hover:text-text transition-colors whitespace-nowrap"
            >
              Clear filters
            </button>
          )}
        </Box>
      </div>


      {/* Team Table */}
      <div className="rounded-card border border-border/[0.07] bg-surface shadow-card dark:border-white/[0.06] overflow-hidden">
        {/* Header */}
        <div className="sticky top-0 z-10 grid h-9 items-center gap-3 bg-[#F3F0FF] px-5 text-[10px] font-semibold uppercase tracking-wider text-text-secondary dark:bg-accent/[0.06] grid-cols-[minmax(180px,1.2fr)_minmax(200px,1.4fr)_140px_130px_40px]">
          <span>Member</span>
          <span>Email</span>
          <span>Role</span>
          <span>Billable rate</span>
          <span />
        </div>
        {/* Rows */}
        <div className="divide-y divide-border/[0.06] dark:divide-white/[0.05]">
          {filteredMembers.map((member) => (
            <div
              key={member.id}
              className="grid h-[58px] items-center gap-3 px-5 transition-colors hover:bg-accent/[0.03] dark:hover:bg-accent/[0.05] grid-cols-[minmax(180px,1.2fr)_minmax(200px,1.4fr)_140px_130px_40px]"
            >
              {/* Member */}
              <div className="flex items-center gap-2.5 min-w-0">
                <div className={cn("flex h-8 w-8 items-center justify-center rounded-full text-[10px] font-bold text-white shrink-0", member.color)}>
                  {member.initials}
                </div>
                <span className="truncate text-sm font-medium text-text">{member.name}</span>
              </div>
              {/* Email */}
              <span className="truncate text-xs text-text-secondary">{member.email}</span>
              {/* Role */}
              <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium w-fit", ROLE_STYLES[member.role])}>
                {ROLE_LABELS[member.role]}
              </span>
              {/* Billable Rate */}
              <div>
                <button
                  type="button"
                  onClick={() => { setRateMember(member); setRateValue(member.billableRate ? String(member.billableRate) : ""); }}
                  className="inline-flex items-center gap-1 rounded-[8px] border border-dashed border-border/25 px-2.5 py-1 text-xs font-medium text-text-secondary transition-colors hover:border-accent/40 hover:bg-accent/5 hover:text-accent dark:border-white/15"
                >
                  <Plus className="h-3 w-3" /> Add rate
                </button>
              </div>
              {/* Actions */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setActionsOpen(actionsOpen === member.id ? null : member.id)}
                  className="flex h-7 w-7 items-center justify-center rounded-md text-text-tertiary hover:bg-surface-2 hover:text-text transition-colors"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </button>
                {actionsOpen === member.id && (
                  <>
                    <div className="fixed inset-0 z-30" onClick={() => setActionsOpen(null)} />
                    <div className="absolute right-0 top-full z-40 mt-1 w-48 rounded-card border border-border/10 bg-surface p-1 shadow-float dark:border-white/10">
                      <ActionItem label="Edit role" onClick={() => setActionsOpen(null)} />
                      <ActionItem label="Edit billable rate" onClick={() => setActionsOpen(null)} />
                      <ActionItem label="View assigned projects" onClick={() => setActionsOpen(null)} />
                      {member.status === "pending" && <ActionItem label="Resend invite" onClick={() => setActionsOpen(null)} />}
                      {member.status === "active" && <ActionItem label="Deactivate member" onClick={() => setActionsOpen(null)} destructive />}
                      {member.status === "inactive" && <ActionItem label="Reactivate member" onClick={() => setActionsOpen(null)} />}
                      <ActionItem label="Remove member" onClick={() => setActionsOpen(null)} destructive />
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
          {filteredMembers.length === 0 && (
            <div className="flex items-center justify-center h-32 text-sm text-text-tertiary">
              No members match your filters.
            </div>
          )}
        </div>
        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-border/[0.06] px-5 py-3 dark:border-white/[0.05]">
          <span className="text-xs text-text-tertiary">
            Showing {filteredMembers.length} of {MOCK_MEMBERS.length} members
          </span>
          <div className="flex items-center gap-1">
            <button type="button" className="h-7 min-w-[28px] rounded-md bg-accent/10 px-2 text-xs font-medium text-accent">1</button>
            <button type="button" className="h-7 min-w-[28px] rounded-md px-2 text-xs text-text-tertiary hover:bg-surface-2 transition-colors">2</button>
            <button type="button" className="h-7 min-w-[28px] rounded-md px-2 text-xs text-text-tertiary hover:bg-surface-2 transition-colors">3</button>
          </div>
        </div>
      </div>

      {/* Set rate dialog */}
      <Dialog open={Boolean(rateMember)} onOpenChange={(open) => { if (!open) setRateMember(null); }}>
        <DialogContent className="sm:max-w-[440px]">
          <DialogHeader>
            <DialogTitle>Set rate</DialogTitle>
            <DialogDescription className="sr-only">Set the billable rate for this member.</DialogDescription>
          </DialogHeader>
          <div className="mt-2 space-y-4">
            <div className="rounded-lg bg-accent/10 px-4 py-3 text-sm leading-relaxed text-text-secondary">
              This rate will be applied to all entries made by{" "}
              <span className="font-medium text-text">{rateMember?.name}</span>, unless projects have their own rate.
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-text-secondary">What is the new billable rate</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-text-tertiary">$</span>
                <input
                  type="number"
                  value={rateValue}
                  onChange={(e) => setRateValue(e.target.value)}
                  placeholder="0"
                  autoFocus
                  className="h-11 w-full rounded-[10px] border border-border/10 bg-surface-2/50 pl-7 pr-3 text-sm text-text placeholder:text-text-tertiary focus:border-accent/30 focus:outline-none focus:ring-2 focus:ring-accent/20 dark:border-white/10"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <button
              type="button"
              onClick={() => setRateMember(null)}
              className="h-10 rounded-[10px] px-4 text-sm font-semibold text-text-secondary transition-colors hover:text-text"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!rateValue.trim()}
              onClick={() => setRateMember(null)}
              className="h-10 rounded-[10px] bg-[#84cc16] px-5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#74b814] disabled:opacity-50"
            >
              Save
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ActionItem({ label, onClick, destructive }: { label: string; onClick: () => void; destructive?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center rounded-md px-3 py-2 text-xs transition-colors",
        destructive ? "text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10" : "text-text hover:bg-surface-2",
      )}
    >
      {label}
    </button>
  );
}

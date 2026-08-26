"use client";

import { useEffect, useMemo, useState } from "react";
import Switch from "@mui/material/Switch";
import {
  BarChart3, Building2, CalendarClock, ChevronRight, Fingerprint, FolderKanban,
  HeartHandshake, Inbox, Lock, Plus, RotateCcw, Settings2, Shield, ShieldCheck,
  Trash2, User, UserCog, UserPlus, Users, type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import { type Permission } from "@/config/permissions";
import {
  type RoleDef, type NewRoleInput, useRoleSettingsStore, useHydratedRoleSettings, isRoleAtDefault,
} from "@/store/roleSettingsStore";
import { MOCK_EMPLOYEES } from "@/data/orgData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const MUI_SWITCH_SX = {
  "& .Mui-checked": { color: "#7A4DFF" },
  "& .Mui-checked + .MuiSwitch-track": { backgroundColor: "#7A4DFF !important" },
} as const;

/** Icons for the built-in roles; custom roles share a neutral icon. */
const ROLE_ICONS: Record<string, LucideIcon> = {
  "account-admin": ShieldCheck,
  admin: Shield,
  "hr-partner": HeartHandshake,
  "onboarding-specialist": UserPlus,
  employee: User,
};

function roleIcon(role: RoleDef): LucideIcon {
  return (role.builtIn && ROLE_ICONS[role.id]) || UserCog;
}

const ROLE_COLORS = [
  "#7A4DFF", "#38BDF8", "#34D399", "#F472B6",
  "#FBBF24", "#FB7185", "#22D3EE", "#8B5CF6",
];

/* ── permissions grouped by module, within each product area ── */
type ProductArea = "ZE[LOG]" | "ZE[TEAMS]" | "Workspace";

/** Section labels shown above each product's permission groups. */
const PRODUCT_META: Record<ProductArea, { label: string; blurb: string }> = {
  "ZE[LOG]": { label: "ZE[LOG]", blurb: "Work tracking, projects & reporting" },
  "ZE[TEAMS]": { label: "ZE[TEAMS]", blurb: "People, attendance & time off" },
  Workspace: { label: "Workspace", blurb: "Applies across the whole application" },
};

const PRODUCT_ORDER: ProductArea[] = ["ZE[LOG]", "ZE[TEAMS]", "Workspace"];

interface PermGroup {
  title: string;
  product: ProductArea;
  icon: LucideIcon;
  color: string;
  permissions: { key: Permission; label: string; description: string }[];
}

const PERMISSION_GROUPS: PermGroup[] = [
  // ── ZE[LOG] ──
  {
    title: "Projects & Tracker", product: "ZE[LOG]", icon: FolderKanban, color: "#38BDF8",
    permissions: [
      { key: "projects.manage", label: "Manage projects & tracking", description: "Create and manage projects, tasks and time entries." },
    ],
  },
  {
    title: "Clients", product: "ZE[LOG]", icon: Building2, color: "#818CF8",
    permissions: [
      { key: "clients.view", label: "View clients", description: "Access the client list and details." },
    ],
  },
  {
    title: "Reports & Dashboards", product: "ZE[LOG]", icon: BarChart3, color: "#FBBF24",
    permissions: [
      { key: "reports.view", label: "View reports & dashboards", description: "Open analytics dashboards and reports." },
    ],
  },
  // ── ZE[TEAMS] ──
  {
    title: "People & Directory", product: "ZE[TEAMS]", icon: Users, color: "#8B5CF6",
    permissions: [
      { key: "employees.view", label: "View directory & profiles", description: "Browse the org chart and open employee profiles." },
      { key: "employees.edit", label: "Add & edit employees", description: "Create records and change employee details." },
    ],
  },
  {
    title: "Attendance", product: "ZE[TEAMS]", icon: Fingerprint, color: "#34D399",
    permissions: [
      { key: "attendance.view", label: "View attendance", description: "See own and team attendance." },
      { key: "attendance.manage", label: "Manage attendance", description: "Regularize entries and approve requests." },
    ],
  },
  {
    title: "Time Off", product: "ZE[TEAMS]", icon: CalendarClock, color: "#F472B6",
    permissions: [
      { key: "timeoff.view", label: "View time off", description: "See leave balances and the team calendar." },
      { key: "timeoff.approve", label: "Approve time off", description: "Approve or decline leave requests." },
    ],
  },
  {
    title: "Inbox", product: "ZE[TEAMS]", icon: Inbox, color: "#22D3EE",
    permissions: [
      { key: "inbox.view", label: "Access inbox", description: "Read and act on the shared inbox." },
    ],
  },
  // ── Workspace (whole application) ──
  {
    title: "Workspace & Roles", product: "Workspace", icon: Settings2, color: "#FB7185",
    permissions: [
      { key: "settings.manage", label: "Manage settings & roles", description: "Configure modules and edit these user roles." },
    ],
  },
];

const TOTAL_PERMISSIONS = PERMISSION_GROUPS.reduce((n, g) => n + g.permissions.length, 0);

/** Enabled permission count for a role (the locked owner always holds all). */
function enabledCount(role: RoleDef): number {
  return role.locked ? TOTAL_PERMISSIONS : role.permissions.length;
}

type EditorState = { mode: "create" } | { mode: "customize"; roleId: string };

export function RoleSettings() {
  const ready = useHydratedRoleSettings();
  const roles = useRoleSettingsStore((s) => s.roles);
  const removeRole = useRoleSettingsStore((s) => s.removeRole);

  const [editor, setEditor] = useState<EditorState | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<RoleDef | null>(null);

  // Illustrative member counts: the org's single top node is the account admin,
  // anyone who manages someone is an admin, everyone else is an employee. The
  // specialist roles start empty until people are assigned.
  const memberCounts = useMemo(() => {
    const active = MOCK_EMPLOYEES.filter((e) => e.status === "active");
    const managerIds = new Set(active.map((e) => e.managerId).filter(Boolean));
    const counts: Record<string, number> = {
      "account-admin": 0, admin: 0, "hr-partner": 0, "onboarding-specialist": 0, employee: 0,
    };
    for (const e of active) {
      if (!e.managerId) counts["account-admin"] += 1;
      else if (managerIds.has(e.id)) counts.admin += 1;
      else counts.employee += 1;
    }
    return counts;
  }, []);

  if (!ready) {
    return (
      <div className="space-y-5">
        <div className="h-64 animate-pulse rounded-card border border-border/[0.07] bg-surface shadow-card dark:border-white/[0.06]" />
      </div>
    );
  }

  const editingRole = editor?.mode === "customize" ? roles.find((r) => r.id === editor.roleId) ?? null : null;

  function handleDelete() {
    if (!confirmDelete) return;
    const name = confirmDelete.name;
    removeRole(confirmDelete.id);
    setConfirmDelete(null);
    toast.success(`${name} role deleted`);
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-text-tertiary">
          These roles apply across the whole application — ZE[LOG] and ZE[TEAMS]. Select a role to customize what it can do, or create your own.
        </p>
        <Button size="sm" className="gap-1.5 rounded-[10px] text-xs" onClick={() => setEditor({ mode: "create" })}>
          <Plus className="h-4 w-4" /> New role
        </Button>
      </div>

      {/* Role list — click a row to customize */}
      <div className="overflow-hidden rounded-card border border-border/[0.07] bg-surface shadow-card dark:border-white/[0.06]">
        {roles.map((role, i) => {
          const Icon = roleIcon(role);
          const members = memberCounts[role.id] ?? 0;
          const count = enabledCount(role);
          return (
            <button
              key={role.id}
              type="button"
              onClick={() => setEditor({ mode: "customize", roleId: role.id })}
              className={cn(
                "group flex w-full items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-surface-2/60",
                i > 0 && "border-t border-border/[0.06] dark:border-white/[0.05]",
              )}
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[11px]" style={{ backgroundColor: `${role.accent}1F`, color: role.accent }}>
                <Icon className="h-5 w-5" strokeWidth={2} />
              </span>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-semibold text-text">{role.name}</p>
                  {role.locked ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-surface-2 px-2 py-0.5 text-[10px] font-medium text-text-tertiary">
                      <Lock className="h-3 w-3" /> Owner
                    </span>
                  ) : role.builtIn ? (
                    <span className="rounded-full bg-surface-2 px-2 py-0.5 text-[10px] font-medium text-text-tertiary">Default</span>
                  ) : (
                    <span className="rounded-full bg-primary-soft px-2 py-0.5 text-[10px] font-medium text-primary-700 dark:bg-primary-100/10 dark:text-primary-300">Custom</span>
                  )}
                </div>
                <p className="mt-0.5 text-xs leading-snug text-text-tertiary line-clamp-2">{role.description || "No description yet."}</p>
                <p className="mt-1 text-[11px] font-medium text-text-secondary">{count}/{TOTAL_PERMISSIONS} permissions</p>
              </div>

              <span
                className={cn(
                  "inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
                  members > 0
                    ? "bg-primary-soft text-primary-700 dark:bg-primary-100/10 dark:text-primary-300"
                    : "bg-surface-2 text-text-tertiary",
                )}
              >
                <Users className="h-3.5 w-3.5" /> {members}
              </span>
              <ChevronRight className="h-4 w-4 shrink-0 text-text-tertiary transition-transform group-hover:translate-x-0.5" />
            </button>
          );
        })}
      </div>

      <div className="flex items-start gap-2 rounded-[12px] bg-surface-2/50 px-3 py-2.5">
        <Lock className="mt-0.5 h-4 w-4 shrink-0 text-text-tertiary" />
        <p className="text-xs text-text-secondary">
          <span className="font-semibold text-text">Prototype</span> — roles and permissions are saved to this browser only. Live access across the app still follows the built-in defaults until roles are wired to a backend.
        </p>
      </div>

      {editor && (
        <RoleEditor
          key={editor.mode === "customize" ? editor.roleId : "new"}
          mode={editor.mode}
          role={editingRole}
          roles={roles}
          onClose={() => setEditor(null)}
          onCreated={(name) => {
            setEditor(null);
            toast.success(`${name} role created`);
          }}
          onRequestDelete={(role) => {
            setEditor(null);
            setConfirmDelete(role);
          }}
        />
      )}

      <Dialog open={!!confirmDelete} onOpenChange={(v) => { if (!v) setConfirmDelete(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete {confirmDelete?.name}?</DialogTitle>
            <DialogDescription>
              This removes the role and its permission set. This can&apos;t be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDelete(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete role</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ── the permission matrix, shared by create + customize ── */
function PermMatrix({ isEnabled, disabled, onToggle }: {
  isEnabled: (p: Permission) => boolean;
  disabled?: boolean;
  onToggle: (p: Permission, value: boolean) => void;
}) {
  return (
    <div className="space-y-5">
      {PRODUCT_ORDER.map((product) => {
        const groups = PERMISSION_GROUPS.filter((g) => g.product === product);
        if (groups.length === 0) return null;
        const meta = PRODUCT_META[product];
        return (
          <div key={product} className="space-y-2.5">
            <div className="flex items-center gap-3">
              <div className="flex items-baseline gap-2">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-text-secondary">{meta.label}</span>
                <span className="text-[11px] text-text-tertiary">{meta.blurb}</span>
              </div>
              <span className="h-px flex-1 bg-border/[0.08] dark:bg-white/[0.06]" />
            </div>
            <div className="space-y-3">
              {groups.map((group) => {
                const Icon = group.icon;
                return (
                  <div key={group.title} className="rounded-card border border-border/[0.07] bg-surface-2/40 p-4 dark:border-white/[0.06]">
                    <div className="mb-1.5 flex items-center gap-2">
                      <span className="flex h-7 w-7 items-center justify-center rounded-[8px]" style={{ backgroundColor: `${group.color}18`, color: group.color }}>
                        <Icon className="h-3.5 w-3.5" strokeWidth={2} />
                      </span>
                      <h4 className="text-sm font-semibold text-text">{group.title}</h4>
                    </div>
                    <div>
                      {group.permissions.map((p) => (
                        <div key={p.key} className="flex items-center justify-between gap-3 border-b border-border/[0.05] py-2 last:border-0">
                          <div className="min-w-0">
                            <p className="text-[13px] font-medium text-text">{p.label}</p>
                            <p className="text-[11px] leading-snug text-text-tertiary">{p.description}</p>
                          </div>
                          <Switch
                            checked={isEnabled(p.key)}
                            disabled={disabled}
                            onChange={(e) => onToggle(p.key, e.target.checked)}
                            size="small"
                            sx={MUI_SWITCH_SX}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ── create / customize dialog ── */
function RoleEditor({ mode, role, roles, onClose, onCreated, onRequestDelete }: {
  mode: "create" | "customize";
  role: RoleDef | null;
  roles: RoleDef[];
  onClose: () => void;
  onCreated: (name: string) => void;
  onRequestDelete: (role: RoleDef) => void;
}) {
  const setPermission = useRoleSettingsStore((s) => s.setPermission);
  const addRole = useRoleSettingsStore((s) => s.addRole);
  const updateRole = useRoleSettingsStore((s) => s.updateRole);
  const resetRole = useRoleSettingsStore((s) => s.resetRole);

  const isCreate = mode === "create";
  const locked = !!role?.locked;
  // Name / description / color are editable when creating, or customizing a custom role.
  const editableDetails = isCreate || (!!role && !role.builtIn);

  const [name, setName] = useState(role?.name ?? "");
  const [description, setDescription] = useState(role?.description ?? "");
  const [accent, setAccent] = useState(role?.accent ?? ROLE_COLORS[0]);
  const [startFrom, setStartFrom] = useState("employee");
  const [draft, setDraft] = useState<Permission[]>(() => {
    if (!isCreate) return [];
    const base = roles.find((r) => r.id === "employee");
    return base ? [...base.permissions] : [];
  });

  function handleStartFrom(v: string) {
    setStartFrom(v);
    if (v === "__blank") setDraft([]);
    else {
      const base = roles.find((r) => r.id === v);
      setDraft(base ? [...base.permissions] : []);
    }
  }

  // Live detail edits for existing custom roles.
  function patchName(v: string) {
    setName(v);
    if (!isCreate && role && !role.builtIn) updateRole(role.id, { name: v });
  }
  function patchDescription(v: string) {
    setDescription(v);
    if (!isCreate && role && !role.builtIn) updateRole(role.id, { description: v });
  }
  function patchAccent(v: string) {
    setAccent(v);
    if (!isCreate && role && !role.builtIn) updateRole(role.id, { accent: v });
  }

  const isEnabled = (p: Permission) =>
    isCreate ? draft.includes(p) : locked || !!role?.permissions.includes(p);

  const onToggle = (p: Permission, value: boolean) => {
    if (isCreate) {
      setDraft((d) => (value ? Array.from(new Set([...d, p])) : d.filter((x) => x !== p)));
    } else if (role) {
      setPermission(role.id, p, value);
    }
  };

  const count = isCreate ? draft.length : role ? enabledCount(role) : 0;

  function submit() {
    const trimmed = name.trim();
    if (!trimmed) {
      toast.error("Give the role a name");
      return;
    }
    const clash = roles.some((r) => r.name.trim().toLowerCase() === trimmed.toLowerCase());
    if (clash) {
      toast.error("A role with that name already exists");
      return;
    }
    addRole({ name: trimmed, description, accent, permissions: draft });
    onCreated(trimmed);
  }

  const title = isCreate ? "New role" : editableDetails ? name || "Custom role" : role?.name ?? "Role";

  return (
    <Dialog open onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="!max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {isCreate
              ? "Name the role, pick a starting point, then switch on exactly what it can do."
              : locked
              ? "The owner role always holds every permission and can't be limited."
              : "Toggle capabilities to change what this role can do across ZE[LOG] and ZE[TEAMS]."}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-1 max-h-[62vh] space-y-5 overflow-y-auto pr-1">
          {editableDetails && (
            <div className="space-y-4 rounded-card border border-border/[0.07] bg-surface-2/40 p-4 dark:border-white/[0.06]">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-text-secondary">Role name</label>
                <Input value={name} onChange={(e) => patchName(e.target.value)} placeholder="e.g. Team Lead" autoFocus={isCreate} />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-text-secondary">Description</label>
                <Textarea value={description} onChange={(e) => patchDescription(e.target.value)} placeholder="Optional — what this role is for." rows={2} />
              </div>
              <div>
                <label className="mb-2 block text-xs font-medium text-text-secondary">Color</label>
                <div className="flex flex-wrap gap-2.5">
                  {ROLE_COLORS.map((hex) => (
                    <button
                      key={hex}
                      type="button"
                      onClick={() => patchAccent(hex)}
                      className={cn(
                        "h-8 w-8 rounded-full transition-all duration-150",
                        accent.toLowerCase() === hex.toLowerCase() ? "ring-2 ring-offset-2 ring-offset-surface" : "hover:scale-110",
                      )}
                      style={{ backgroundColor: hex, ...(accent.toLowerCase() === hex.toLowerCase() ? { ["--tw-ring-color" as string]: hex } : {}) }}
                      aria-label={`Color ${hex}`}
                    />
                  ))}
                </div>
              </div>
              {isCreate && (
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-text-secondary">Start from</label>
                  <Select value={startFrom} onValueChange={handleStartFrom}>
                    <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__blank">Blank — no permissions</SelectItem>
                      {roles.map((r) => (
                        <SelectItem key={r.id} value={r.id}>Copy from {r.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="mt-1 text-[11px] text-text-tertiary">Pre-fills the toggles below; adjust anything you like.</p>
                </div>
              )}
            </div>
          )}

          {locked && (
            <div className="flex items-start gap-2.5 rounded-card border border-primary-200/60 bg-primary-soft/60 px-4 py-3 dark:border-primary-300/20 dark:bg-primary-100/10">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary-600 dark:text-primary-300" />
              <p className="text-xs text-text-secondary">
                <span className="font-semibold text-text">{role?.name}</span> is the workspace owner — every capability is granted and locked on. Use another role to fine-tune access.
              </p>
            </div>
          )}

          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wide text-text-tertiary">Permissions</span>
            <span className="rounded-full bg-primary-soft px-2 py-0.5 text-[11px] font-medium text-primary-700 dark:bg-primary-100/10 dark:text-primary-300">
              {count} of {TOTAL_PERMISSIONS} enabled
            </span>
          </div>

          <PermMatrix isEnabled={isEnabled} disabled={locked} onToggle={onToggle} />
        </div>

        <div className="mt-6 flex items-center justify-between gap-2">
          <div>
            {!isCreate && role && !role.builtIn && (
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 rounded-[10px] text-xs text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-500/10"
                onClick={() => onRequestDelete(role)}
              >
                <Trash2 className="h-3.5 w-3.5" /> Delete role
              </Button>
            )}
            {!isCreate && role && role.builtIn && !locked && (
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 rounded-[10px] text-xs"
                onClick={() => { resetRole(role.id); toast.success(`${role.name} reset to defaults`); }}
                disabled={isRoleAtDefault(role)}
              >
                <RotateCcw className="h-3.5 w-3.5" /> Reset to defaults
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>{isCreate ? "Cancel" : "Done"}</Button>
            {isCreate && <Button onClick={submit}>Create role</Button>}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

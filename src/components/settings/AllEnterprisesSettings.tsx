"use client";

import { useMemo, useState } from "react";
import Switch from "@mui/material/Switch";
import Menu from "@mui/material/Menu";
import MuiMenuItem from "@mui/material/MenuItem";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";
import {
  Briefcase, Building2, Eye, LayoutGrid, List as ListIcon, MoreHorizontal,
  Pencil, Plus, Power, Search, ShieldCheck, SlidersHorizontal, Trash2, Users2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { MOCK_ENTERPRISES, type Enterprise } from "@/data/enterprisesData";

const MUI_SWITCH_SX = {
  "& .Mui-checked": { color: "#7A4DFF" },
  "& .Mui-checked + .MuiSwitch-track": { backgroundColor: "#7A4DFF !important" },
};

const MENU_SLOT_PROPS = {
  paper: { className: "!rounded-[14px] !border !border-border/[0.07] !bg-surface !shadow-float dark:!border-white/[0.06]", sx: { backgroundImage: "none", minWidth: 190 } },
  list: { className: "!p-1.5" },
} as const;
const MENU_ITEM_SX = { borderRadius: "8px", mx: 0.5, px: 1.5, py: 1, fontSize: "0.875rem", gap: 1.25 };

type StatusFilter = "all" | "active" | "disabled";
type SortKey = "joined-desc" | "joined-asc" | "name" | "users";

/* Colored avatar seed from the enterprise name — subtle, theme-adjacent palette. */
const AVATAR_TINTS = [
  { bg: "#EDE9FE", ink: "#6D3BEB" },
  { bg: "#DBEAFE", ink: "#2563EB" },
  { bg: "#FCE7F3", ink: "#DB2777" },
  { bg: "#DCFCE7", ink: "#059669" },
  { bg: "#FEF3C7", ink: "#B45309" },
  { bg: "#E0F2FE", ink: "#0891B2" },
];
function tintFor(name: string) {
  let sum = 0;
  for (let i = 0; i < name.length; i++) sum += name.charCodeAt(i);
  return AVATAR_TINTS[sum % AVATAR_TINTS.length];
}
function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "?";
}
const fmtJoined = (iso: string) => format(parseISO(iso), "do MMM yyyy");

const GRID_COLS = "grid-cols-[2fr_2fr_1.2fr_1fr_0.6fr_0.6fr_0.9fr_84px]";

export function AllEnterprisesSettings() {
  const [rows, setRows] = useState<Enterprise[]>(MOCK_ENTERPRISES);
  const [status, setStatus] = useState<StatusFilter>("all");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("joined-desc");
  const [view, setView] = useState<"list" | "grid">("list");
  const [menu, setMenu] = useState<{ anchor: HTMLElement; ent: Enterprise } | null>(null);

  const counts = useMemo(() => ({
    all: rows.length,
    active: rows.filter((r) => r.active).length,
    disabled: rows.filter((r) => !r.active).length,
  }), [rows]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = rows.filter((r) => {
      if (status === "active" && !r.active) return false;
      if (status === "disabled" && r.active) return false;
      if (q && !(`${r.name} ${r.domain} ${r.email} ${r.location}`.toLowerCase().includes(q))) return false;
      return true;
    });
    list = [...list].sort((a, b) => {
      switch (sort) {
        case "joined-asc": return a.joined.localeCompare(b.joined);
        case "name": return a.name.localeCompare(b.name);
        case "users": return b.users - a.users;
        default: return b.joined.localeCompare(a.joined);
      }
    });
    return list;
  }, [rows, status, query, sort]);

  function toggleActive(id: string) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, active: !r.active } : r)));
    const ent = rows.find((r) => r.id === id);
    if (ent) toast.success(`${ent.name} ${ent.active ? "disabled" : "enabled"}`);
  }
  function removeEnterprise(id: string) {
    const ent = rows.find((r) => r.id === id);
    setRows((prev) => prev.filter((r) => r.id !== id));
    if (ent) toast.success(`Removed “${ent.name}”`);
  }

  const PILLS: { key: StatusFilter; label: string; count: number }[] = [
    { key: "all", label: "All", count: counts.all },
    { key: "active", label: "Active", count: counts.active },
    { key: "disabled", label: "Disabled", count: counts.disabled },
  ];

  return (
    <div className="space-y-5">
      {/* ── Header actions ─────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-end gap-3">
        <span className="hidden items-center gap-1.5 rounded-full bg-primary-soft px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-primary-700 dark:bg-primary-100 dark:text-primary-300 sm:inline-flex">
          <ShieldCheck className="h-3.5 w-3.5" /> Platform · Super Admin Only
        </span>
        <Button size="sm" className="gap-1.5" onClick={() => toast.success("Create enterprise")}>
          <Plus className="h-4 w-4" /> Create enterprise
        </Button>
      </div>

      {/* ── Toolbar ────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Status pills */}
        <div className="inline-flex items-center gap-1.5">
          {PILLS.map((p) => {
            const on = status === p.key;
            return (
              <button
                key={p.key}
                type="button"
                onClick={() => setStatus(p.key)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[13px] font-medium transition-colors",
                  on
                    ? "border-primary-300 bg-primary-soft text-primary-700 dark:border-primary-500/40 dark:bg-primary-500/10 dark:text-primary-300"
                    : "border-border/[0.1] bg-surface text-text-secondary hover:bg-surface-2 dark:border-white/[0.08]",
                )}
              >
                {p.label}
                <span className={cn("rounded-full px-1.5 text-[11px] font-semibold tabular-nums", on ? "bg-white/70 text-primary-700 dark:bg-white/10 dark:text-primary-300" : "bg-surface-2 text-text-tertiary")}>
                  {p.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search + sort + view + filter */}
        <div className="flex flex-1 items-center justify-end gap-2 sm:flex-none">
          <div className="relative w-full sm:w-64">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search enterprises..." className="h-9 pl-8" />
          </div>

          <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
            <SelectTrigger className="h-9 w-auto gap-2 whitespace-nowrap">
              <span className="text-text-tertiary">Sort</span>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="joined-desc">Joined · newest</SelectItem>
              <SelectItem value="joined-asc">Joined · oldest</SelectItem>
              <SelectItem value="name">Name · A–Z</SelectItem>
              <SelectItem value="users">Most users</SelectItem>
            </SelectContent>
          </Select>

          {/* List / Grid toggle */}
          <div className="inline-flex shrink-0 rounded-[10px] border border-border/[0.1] bg-surface p-0.5 dark:border-white/[0.08]">
            {([["list", ListIcon], ["grid", LayoutGrid]] as const).map(([key, Icon]) => (
              <button
                key={key}
                type="button"
                onClick={() => setView(key)}
                aria-label={`${key} view`}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-[8px] px-2.5 py-1.5 text-[13px] font-medium capitalize transition-colors",
                  view === key ? "bg-primary-soft text-primary-700 dark:bg-primary-500/15 dark:text-primary-300" : "text-text-tertiary hover:text-text-secondary",
                )}
              >
                <Icon className="h-4 w-4" /> {key}
              </button>
            ))}
          </div>

          <button
            type="button"
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] border border-border/[0.1] bg-surface text-text-tertiary transition-colors hover:bg-surface-2 hover:text-text dark:border-white/[0.08]"
            aria-label="Filters"
            onClick={() => toast.success("More filters")}
          >
            <SlidersHorizontal className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* ── List view ──────────────────────────────────────────── */}
      {view === "list" ? (
        <div className="overflow-x-auto rounded-[16px] border border-border/[0.07] bg-surface shadow-card dark:border-white/[0.06]">
          <div className="min-w-[940px]">
            <div className={cn("grid items-center gap-3 border-b border-border/[0.06] bg-[#F3F0FF] px-5 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-text-secondary dark:bg-white/[0.04] dark:border-white/[0.05]", GRID_COLS)}>
              <span>Enterprise</span>
              <span>Email</span>
              <span>Location</span>
              <span>Joined</span>
              <span className="text-center">Users</span>
              <span className="text-center">Jobs</span>
              <span className="text-center">Candidates</span>
              <span className="text-right">Actions</span>
            </div>

            <div className="divide-y divide-border/[0.06] dark:divide-white/[0.05]">
              {visible.length === 0 && <p className="px-5 py-10 text-center text-sm text-text-tertiary">No enterprises match your filters.</p>}
              {visible.map((e) => {
                const t = tintFor(e.name);
                return (
                  <div key={e.id} className={cn("grid items-center gap-3 px-5 py-3 transition-colors hover:bg-[rgba(99,102,241,0.03)]", GRID_COLS)}>
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] text-[12px] font-bold" style={{ backgroundColor: t.bg, color: t.ink }}>
                        {initials(e.name)}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-text">{e.name}</p>
                        <p className="truncate text-xs text-text-tertiary">{e.domain}</p>
                      </div>
                    </div>
                    <span className="truncate text-sm text-text-secondary" title={e.email}>{e.email}</span>
                    <span className="truncate text-sm text-text-secondary">{e.location || "--"}</span>
                    <span className="whitespace-nowrap text-sm text-text-secondary">{fmtJoined(e.joined)}</span>
                    <span className="text-center text-sm tabular-nums text-text-secondary">{e.users}</span>
                    <span className="text-center text-sm tabular-nums text-text-secondary">{e.jobs}</span>
                    <span className="text-center text-sm tabular-nums text-text-secondary">{e.candidates}</span>
                    <div className="flex items-center justify-end gap-0.5">
                      <Switch checked={e.active} onChange={() => toggleActive(e.id)} size="small" sx={MUI_SWITCH_SX} />
                      <button
                        type="button"
                        onClick={(ev) => setMenu({ anchor: ev.currentTarget, ent: e })}
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-text-tertiary hover:bg-surface-2"
                        aria-label={`${e.name} actions`}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* ── Grid view ────────────────────────────────────────── */
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {visible.length === 0 && <p className="col-span-full rounded-[16px] border border-border/[0.07] bg-surface px-5 py-10 text-center text-sm text-text-tertiary dark:border-white/[0.06]">No enterprises match your filters.</p>}
          {visible.map((e) => {
            const t = tintFor(e.name);
            return (
              <div key={e.id} className="rounded-[16px] border border-border/[0.07] bg-surface p-4 shadow-card transition-shadow hover:shadow-float dark:border-white/[0.06]">
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[11px] text-[13px] font-bold" style={{ backgroundColor: t.bg, color: t.ink }}>
                    {initials(e.name)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-text">{e.name}</p>
                    <p className="truncate text-xs text-text-tertiary">{e.domain}</p>
                  </div>
                  <button
                    type="button"
                    onClick={(ev) => setMenu({ anchor: ev.currentTarget, ent: e })}
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-text-tertiary hover:bg-surface-2"
                    aria-label={`${e.name} actions`}
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </div>

                <p className="mt-3 truncate text-xs text-text-secondary" title={e.email}>{e.email}</p>
                <p className="mt-0.5 text-xs text-text-tertiary">{e.location || "--"} · Joined {fmtJoined(e.joined)}</p>

                <div className="mt-3 grid grid-cols-3 gap-2 rounded-[12px] bg-surface-2/60 p-2.5 text-center">
                  <Stat icon={Users2} value={e.users} label="Users" />
                  <Stat icon={Briefcase} value={e.jobs} label="Jobs" />
                  <Stat icon={Building2} value={e.candidates} label="Cand." />
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium", e.active ? "bg-[#34D39922] text-[#0F9E6E]" : "bg-surface-2 text-text-tertiary")}>
                    <span className={cn("h-1.5 w-1.5 rounded-full", e.active ? "bg-[#0F9E6E]" : "bg-text-tertiary")} />
                    {e.active ? "Active" : "Disabled"}
                  </span>
                  <Switch checked={e.active} onChange={() => toggleActive(e.id)} size="small" sx={MUI_SWITCH_SX} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Row / card actions menu ────────────────────────────── */}
      <Menu anchorEl={menu?.anchor} open={Boolean(menu)} onClose={() => setMenu(null)} slotProps={MENU_SLOT_PROPS}>
        <MuiMenuItem onClick={() => { if (menu) toast.success(`Viewing ${menu.ent.name}`); setMenu(null); }} sx={MENU_ITEM_SX}>
          <Eye className="h-4 w-4" /> View workspace
        </MuiMenuItem>
        <MuiMenuItem onClick={() => { if (menu) toast.success(`Editing ${menu.ent.name}`); setMenu(null); }} sx={MENU_ITEM_SX}>
          <Pencil className="h-4 w-4" /> Edit details
        </MuiMenuItem>
        <MuiMenuItem onClick={() => { if (menu) toggleActive(menu.ent.id); setMenu(null); }} sx={MENU_ITEM_SX}>
          <Power className="h-4 w-4" /> {menu?.ent.active ? "Disable" : "Enable"}
        </MuiMenuItem>
        <MuiMenuItem onClick={() => { if (menu) removeEnterprise(menu.ent.id); setMenu(null); }} sx={{ ...MENU_ITEM_SX, color: "rgb(var(--danger-rgb))" }}>
          <Trash2 className="h-4 w-4" /> Delete
        </MuiMenuItem>
      </Menu>
    </div>
  );
}

function Stat({ icon: Icon, value, label }: { icon: typeof Users2; value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <Icon className="h-3.5 w-3.5 text-text-tertiary" />
      <span className="mt-0.5 text-sm font-semibold tabular-nums text-text">{value}</span>
      <span className="text-[10px] uppercase tracking-wide text-text-tertiary">{label}</span>
    </div>
  );
}

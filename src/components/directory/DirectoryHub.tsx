"use client";

import * as React from "react";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Briefcase, Download, MoreVertical, Users, X,
} from "lucide-react";
import { departmentColor, DEPARTMENTS } from "@/data/orgData";
import { useOrgStore } from "@/store/orgStore";
import { EMPLOYMENT_TYPES, employmentTypeLabel, EMPLOYMENT_STATUS, type EmploymentStatus } from "@/data/directoryData";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { cn } from "@/lib/utils";
import { Avatar, DirStatusPill, useDirectoryPeople, useHydratedDirectoryPage, type DirectoryPerson } from "./shared";
import { EmployeeCard } from "./EmployeeCard";
import { DirectoryToolbar, type FilterDef, type ViewMode } from "./DirectoryToolbar";
import { EmployeeActionsMenu, type EmployeeAction } from "./EmployeeActionsMenu";
import { AssignProjectDialog, AdjustLeaveDialog, AssignAssetDialog } from "./dialogs";
import { AddEmployeeDialog } from "./AddEmployeeDialog";
import { EmployeeProfileDialog } from "./EmployeeProfileDialog";
import { type ProfileTabId } from "./EmployeeProfile";
import { DirectoryHero } from "./DirectoryHero";

type Tab = "all" | "inactive";

const TABS: { id: Tab; label: string }[] = [
  { id: "all", label: "All Employees" },
  { id: "inactive", label: "Inactive" },
];

export function DirectoryHub() {
  const hydrated = useHydratedDirectoryPage();
  const router = useRouter();
  const { hasPermission } = useCurrentUser();
  const canEdit = hasPermission("employees.edit");

  const people = useDirectoryPeople();
  const employees = useOrgStore((s) => s.employees);
  const deactivate = useOrgStore((s) => s.deactivateEmployee);

  const nameById = useMemo(() => new Map(employees.map((e) => [e.id, e.name])), [employees]);

  const [tab, setTab] = useState<Tab>("all");
  const [view, setView] = useState<ViewMode>("grid");
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [selected, setSelected] = useState<Set<string>>(new Set());

  // Action state
  const [kebab, setKebab] = useState<{ anchor: HTMLElement; person: DirectoryPerson } | null>(null);
  const [dialog, setDialog] = useState<{ type: EmployeeAction; person: DirectoryPerson } | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [addTab, setAddTab] = useState<"quick" | "import">("quick");
  // Profile popup — opens the full employee record without leaving the directory.
  const [profile, setProfile] = useState<{ id: string; tab?: ProfileTabId } | null>(null);

  // Filter option sets derived from the roster.
  const filterDefs: FilterDef[] = useMemo(() => {
    const depts = Array.from(new Set(people.map((p) => p.department))).sort();
    const teams = Array.from(new Set(people.map((p) => p.extra?.team).filter(Boolean) as string[])).sort();
    const managerIds = Array.from(new Set(people.map((p) => p.managerId).filter(Boolean) as string[]));
    return [
      { key: "department", label: "Department", options: depts.map((d) => ({ value: d, label: d })) },
      { key: "team", label: "Team", options: teams.map((t) => ({ value: t, label: t })) },
      { key: "manager", label: "Manager", options: managerIds.map((id) => ({ value: id, label: nameById.get(id) ?? id })) },
      { key: "employmentType", label: "Employment Type", options: EMPLOYMENT_TYPES.map((t) => ({ value: t.id, label: t.label })) },
      { key: "status", label: "Status", options: (Object.keys(EMPLOYMENT_STATUS) as EmploymentStatus[]).map((s) => ({ value: s, label: EMPLOYMENT_STATUS[s].label })) },
    ];
  }, [people, nameById]);

  // Tab scoping + search + filters.
  const filtered = useMemo(() => {
    let list = people;
    if (tab === "inactive") list = list.filter((p) => p.employmentStatus === "inactive");
    // "all" = the active roster: everyone except inactive leavers.
    else list = list.filter((p) => p.employmentStatus !== "inactive");

    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter((p) => {
        const mgr = p.managerId ? nameById.get(p.managerId) ?? "" : "";
        return [p.name, p.extra?.employeeCode, p.email, p.jobTitle, p.department, p.extra?.team, mgr]
          .filter(Boolean)
          .some((v) => (v as string).toLowerCase().includes(q));
      });
    }
    if (filters.department) list = list.filter((p) => p.department === filters.department);
    if (filters.team) list = list.filter((p) => p.extra?.team === filters.team);
    if (filters.manager) list = list.filter((p) => p.managerId === filters.manager);
    if (filters.employmentType) list = list.filter((p) => p.extra?.employmentType === filters.employmentType);
    if (filters.status) list = list.filter((p) => p.employmentStatus === filters.status);

    return list.sort((a, b) => a.name.localeCompare(b.name));
  }, [people, tab, search, filters, nameById]);

  const activeChips = useMemo(() => {
    const chips: { key: string; label: string }[] = [];
    if (filters.department) chips.push({ key: "department", label: filters.department });
    if (filters.team) chips.push({ key: "team", label: filters.team });
    if (filters.manager) chips.push({ key: "manager", label: nameById.get(filters.manager) ?? filters.manager });
    if (filters.employmentType) chips.push({ key: "employmentType", label: employmentTypeLabel(filters.employmentType as never) });
    if (filters.status) chips.push({ key: "status", label: EMPLOYMENT_STATUS[filters.status as EmploymentStatus].label });
    return chips;
  }, [filters, nameById]);

  const setFilter = (key: string, v: string) => setFilters((f) => ({ ...f, [key]: v }));
  const clearFilter = (key: string) => setFilters((f) => { const n = { ...f }; delete n[key]; return n; });
  const clearAll = () => setFilters({});

  const openProfile = (id: string) => setProfile({ id });

  const runAction = (action: EmployeeAction, person: DirectoryPerson) => {
    if (action === "view") {
      setProfile({ id: person.id });
      return;
    }
    if (action === "edit") {
      router.push(`/directory/${person.id}/edit`);
      return;
    }
    if (action === "deactivate") {
      deactivate(person.id);
      return;
    }
    setDialog({ type: action, person });
  };

  const toggleSelect = (id: string, checked: boolean) =>
    setSelected((s) => {
      const n = new Set(s);
      if (checked) n.add(id);
      else n.delete(id);
      return n;
    });

  if (!hydrated) {
    return <div className="h-64 animate-pulse rounded-[22px] bg-surface-2/60" />;
  }

  return (
    <div className="space-y-5 pb-6">
      {/* Hero */}
      <DirectoryHero
        people={people}
        canEdit={canEdit}
        onImport={() => { setAddTab("import"); setAddOpen(true); }}
        onAdd={() => router.push("/directory/new")}
      />

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-border/[0.08]">
        {TABS.map((t) => {
          const active = tab === t.id;
          const count =
            t.id === "all" ? people.filter((p) => p.employmentStatus !== "inactive").length :
            people.filter((p) => p.employmentStatus === "inactive").length;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => { setTab(t.id); setSelected(new Set()); }}
              className={cn(
                "relative -mb-px flex items-center gap-2 border-b-2 px-3 pb-2.5 pt-1 text-sm font-medium transition-colors",
                active ? "border-primary-600 text-text" : "border-transparent text-text-tertiary hover:text-text-secondary",
              )}
            >
              {t.label}
              <span className={cn("rounded-full px-1.5 py-0.5 text-[11px] font-semibold", active ? "bg-primary-100 text-primary-700" : "bg-surface-2 text-text-tertiary")}>{count}</span>
            </button>
          );
        })}
      </div>

      {/* Toolbar */}
      <DirectoryToolbar
        search={search}
        onSearch={setSearch}
        filters={filterDefs}
        values={filters}
        onFilterChange={setFilter}
        view={view}
        onViewChange={setView}
      />

      {/* Active filter chips */}
      {activeChips.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2">
          {activeChips.map((c) => (
            <button
              key={c.key}
              type="button"
              onClick={() => clearFilter(c.key)}
              className="inline-flex items-center gap-1 rounded-full bg-primary-50 px-2.5 py-1 text-xs font-medium text-primary-700 hover:bg-primary-100"
            >
              {c.label}
              <X className="h-3 w-3" />
            </button>
          ))}
          <button type="button" onClick={clearAll} className="text-xs font-medium text-text-tertiary hover:text-text">
            Clear all
          </button>
        </div>
      ) : null}

      {/* Bulk toolbar */}
      {canEdit && selected.size > 0 ? <BulkBar count={selected.size} onClear={() => setSelected(new Set())} /> : null}

      {/* Results */}
      {filtered.length === 0 ? (
        <EmptyState tab={tab} />
      ) : view === "grid" ? (
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((p) => (
            <EmployeeCard
              key={p.id}
              person={p}
              managerName={p.managerId ? nameById.get(p.managerId) : undefined}
              selected={selected.has(p.id)}
              showSelect={canEdit}
              onSelect={(c) => toggleSelect(p.id, c)}
              onOpen={() => openProfile(p.id)}
              onKebab={(anchor) => setKebab({ anchor, person: p })}
            />
          ))}
        </div>
      ) : (
        <ListView
          people={filtered}
          nameById={nameById}
          canEdit={canEdit}
          selected={selected}
          onToggle={toggleSelect}
          onToggleAll={(checked) => setSelected(checked ? new Set(filtered.map((p) => p.id)) : new Set())}
          onOpen={openProfile}
          onKebab={(anchor, person) => setKebab({ anchor, person })}
        />
      )}

      {/* Kebab menu */}
      <EmployeeActionsMenu
        anchor={kebab?.anchor ?? null}
        person={kebab?.person ?? null}
        canEdit={canEdit}
        onClose={() => setKebab(null)}
        onAction={runAction}
      />

      {/* Action dialogs */}
      {dialog?.type === "assign-project" ? <AssignProjectDialog person={dialog.person} open onClose={() => setDialog(null)} /> : null}
      {dialog?.type === "manage-leave" ? <AdjustLeaveDialog person={dialog.person} open onClose={() => setDialog(null)} /> : null}
      {dialog?.type === "assign-asset" ? <AssignAssetDialog person={dialog.person} open onClose={() => setDialog(null)} /> : null}

      {/* Add employee */}
      {canEdit ? <AddEmployeeDialog open={addOpen} onClose={() => setAddOpen(false)} initialTab={addTab} /> : null}

      {/* Employee record popup */}
      <EmployeeProfileDialog
        employeeId={profile?.id ?? null}
        open={!!profile}
        onClose={() => setProfile(null)}
        initialTab={profile?.tab}
      />
    </div>
  );
}

/* ── List view (dense) ── */

function ListView({
  people,
  nameById,
  canEdit,
  selected,
  onToggle,
  onToggleAll,
  onOpen,
  onKebab,
}: {
  people: DirectoryPerson[];
  nameById: Map<string, string>;
  canEdit: boolean;
  selected: Set<string>;
  onToggle: (id: string, checked: boolean) => void;
  onToggleAll: (checked: boolean) => void;
  onOpen: (id: string) => void;
  onKebab: (anchor: HTMLElement, person: DirectoryPerson) => void;
}) {
  const allChecked = people.length > 0 && people.every((p) => selected.has(p.id));
  return (
    <div className="overflow-hidden rounded-[18px] border border-border/[0.08] bg-surface">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[860px] text-left text-sm">
          <thead>
            <tr className="border-b border-border/[0.08] text-[11px] uppercase tracking-wide text-text-tertiary">
              {canEdit ? (
                <th className="w-10 px-4 py-3">
                  <input type="checkbox" checked={allChecked} onChange={(e) => onToggleAll(e.target.checked)} className="h-4 w-4 rounded accent-primary-600" aria-label="Select all" />
                </th>
              ) : null}
              <th className="px-4 py-3 font-semibold">Employee</th>
              <th className="px-4 py-3 font-semibold">Employee ID</th>
              <th className="px-4 py-3 font-semibold">Job Title</th>
              <th className="px-4 py-3 font-semibold">Department</th>
              <th className="px-4 py-3 font-semibold">Manager</th>
              <th className="px-4 py-3 font-semibold">Type</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Joined</th>
              <th className="w-10 px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {people.map((p) => {
              const dc = departmentColor(p.department);
              return (
                <tr
                  key={p.id}
                  onClick={() => onOpen(p.id)}
                  className="cursor-pointer border-b border-border/[0.05] transition-colors last:border-0 hover:bg-surface-2/50"
                >
                  {canEdit ? (
                    <td className="px-4 py-2.5" onClick={(e) => e.stopPropagation()}>
                      <input type="checkbox" checked={selected.has(p.id)} onChange={(e) => onToggle(p.id, e.target.checked)} className="h-4 w-4 rounded accent-primary-600" aria-label={`Select ${p.name}`} />
                    </td>
                  ) : null}
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2.5">
                      <Avatar person={p} size={34} />
                      <div className="min-w-0">
                        <p className="truncate font-medium text-text">{p.name}</p>
                        <p className="truncate text-xs text-text-tertiary">{p.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-2.5 tabular-nums text-text-secondary">{p.extra?.employeeCode}</td>
                  <td className="px-4 py-2.5 text-text-secondary">{p.jobTitle}</td>
                  <td className="px-4 py-2.5">
                    <span className="inline-flex items-center gap-1.5 text-text-secondary">
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: dc }} />
                      {p.department}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-text-secondary">{p.managerId ? nameById.get(p.managerId) : "—"}</td>
                  <td className="px-4 py-2.5 text-text-secondary">{employmentTypeLabel(p.extra?.employmentType)}</td>
                  <td className="px-4 py-2.5"><DirStatusPill status={p.employmentStatus} /></td>
                  <td className="px-4 py-2.5 tabular-nums text-text-tertiary">{p.extra?.joiningDate}</td>
                  <td className="px-4 py-2.5" onClick={(e) => e.stopPropagation()}>
                    <button type="button" onClick={(e) => onKebab(e.currentTarget, p)} className="flex h-7 w-7 items-center justify-center rounded-full text-text-tertiary hover:bg-surface-2 hover:text-text" aria-label={`Actions for ${p.name}`}>
                      <MoreVertical className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ── Bulk toolbar (only after selection) ── */

function BulkBar({ count, onClear }: { count: number; onClear: () => void }) {
  const actions = [
    { label: "Change Department", icon: Users },
    { label: "Change Manager", icon: Users },
    { label: "Assign Policy", icon: Briefcase },
    { label: "Assign Project", icon: Briefcase },
    { label: "Export", icon: Download },
  ];
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-[14px] border border-primary-200 bg-primary-50/70 px-3.5 py-2.5">
      <span className="text-sm font-semibold text-primary-800">{count} selected</span>
      <span className="mx-1 h-4 w-px bg-primary-200" />
      {actions.map((a) => {
        const Icon = a.icon;
        return (
          <button key={a.label} type="button" className="inline-flex items-center gap-1.5 rounded-[10px] bg-surface px-2.5 py-1.5 text-xs font-medium text-text-secondary shadow-sm hover:text-text">
            <Icon className="h-3.5 w-3.5" /> {a.label}
          </button>
        );
      })}
      <button type="button" className="inline-flex items-center gap-1.5 rounded-[10px] bg-surface px-2.5 py-1.5 text-xs font-medium text-rose-600 shadow-sm hover:bg-rose-50">
        Deactivate
      </button>
      <button type="button" onClick={onClear} className="ml-auto text-xs font-medium text-text-tertiary hover:text-text">Clear</button>
    </div>
  );
}

function EmptyState({ tab }: { tab: Tab }) {
  const msg =
    tab === "inactive" ? "No inactive employees." :
    "No people match your search or filters.";
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-[18px] border border-dashed border-border/20 bg-surface py-16 text-center">
      <Users className="h-7 w-7 text-text-tertiary" />
      <p className="text-sm text-text-secondary">{msg}</p>
    </div>
  );
}

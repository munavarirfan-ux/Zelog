"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import { toast } from "sonner";
import { FolderPlus, Plus, Users } from "lucide-react";
import {
  buildTree,
  getAncestorIds,
  type Employee,
  type EmployeeNode,
} from "@/data/orgData";
import { useOrgStore, useHydratedOrg, type EmployeePatch, type NewEmployeeInput } from "@/store/orgStore";
import { useRoleStore, useHydratedRole } from "@/store/roleStore";
import { OrgTree } from "@/components/org/OrgTree";
import { EmployeeDrawer } from "@/components/org/EmployeeDrawer";
import { EmployeeFormDialog } from "@/components/org/EmployeeFormDialog";
import { AddDepartmentDialog } from "@/components/org/AddDepartmentDialog";
import { ReassignManagerDialog } from "@/components/org/ReassignManagerDialog";
import { cn } from "@/lib/utils";

const ZOOM = 0.85;

export default function OrganizationPage() {
  const hydrated = useHydratedOrg();
  useHydratedRole();
  const role = useRoleStore((s) => s.role);
  const canManage = role === "super-admin";

  const employees = useOrgStore((s) => s.employees);
  const departments = useOrgStore((s) => s.departments);
  const addDepartment = useOrgStore((s) => s.addDepartment);
  const addEmployee = useOrgStore((s) => s.addEmployee);
  const updateEmployee = useOrgStore((s) => s.updateEmployee);
  const reassignManager = useOrgStore((s) => s.reassignManager);
  const deactivateEmployee = useOrgStore((s) => s.deactivateEmployee);
  const removeEmployee = useOrgStore((s) => s.removeEmployee);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const [collapsedIds, setCollapsedIds] = useState<Set<string>>(new Set());
  const [deptFilter, setDeptFilter] = useState<string>("all");

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"add" | "edit">("add");
  const [formInitial, setFormInitial] = useState<Employee | null>(null);
  const [reassignId, setReassignId] = useState<string | null>(null);
  const [deptDialogOpen, setDeptDialogOpen] = useState(false);

  const viewportRef = useRef<HTMLDivElement>(null);
  const pan = useRef<{ x: number; y: number; left: number; top: number } | null>(null);

  const tree = useMemo(() => buildTree(employees), [employees]);
  const nodeMap = useMemo(() => {
    const m = new Map<string, EmployeeNode>();
    const walk = (nodes: EmployeeNode[]) => nodes.forEach((n) => { m.set(n.id, n); walk(n.children); });
    walk(tree);
    return m;
  }, [tree]);
  const selectedEmployee = employees.find((e) => e.id === selectedId) ?? null;
  const reassignEmployee = employees.find((e) => e.id === reassignId) ?? null;

  const orgRootId = useMemo(() => employees.find((e) => !e.managerId)?.id, [employees]);
  // Which person the current viewer "is" (mock mapping for the role-scoped default view).
  const viewerId = role === "super-admin" ? orgRootId : role === "admin" ? "eng1" : "eng4";

  /**
   * Role-scoped starting view:
   * - Company Head: the head + its direct reports (deeper levels collapsed — expand to see individuals).
   * - Manager: their reporting head → themselves → their team.
   * - Employee: their reporting manager → themselves (+ any reports).
   */
  const roleView = useMemo(() => {
    const byId = new Map(employees.map((e) => [e.id, e]));
    if (role === "super-admin") {
      const directReports = employees.filter((e) => e.managerId === orgRootId).map((e) => e.id);
      return { rootIds: orgRootId ? [orgRootId] : [], visibleIds: null as Set<string> | null, defaultCollapsed: new Set(directReports) };
    }
    const viewer = viewerId ? byId.get(viewerId) : undefined;
    if (!viewer) return { rootIds: orgRootId ? [orgRootId] : [], visibleIds: null as Set<string> | null, defaultCollapsed: new Set<string>() };
    const topId = viewer.managerId ?? viewer.id;
    const reports = employees.filter((e) => e.managerId === viewer.id).map((e) => e.id);
    return { rootIds: [topId], visibleIds: new Set<string>([topId, viewer.id, ...reports]), defaultCollapsed: new Set<string>() };
  }, [role, employees, orgRootId, viewerId]);

  const deptVisibleIds = useMemo(() => {
    if (deptFilter === "all") return null;
    const set = new Set<string>();
    employees
      .filter((e) => e.department === deptFilter)
      .forEach((e) => {
        set.add(e.id);
        getAncestorIds(employees, e.id).forEach((a) => set.add(a));
      });
    return set;
  }, [deptFilter, employees]);

  const usingDept = deptFilter !== "all";
  const displayRoots = (usingDept ? tree.map((n) => n.id) : roleView.rootIds)
    .map((id) => nodeMap.get(id))
    .filter((n): n is EmployeeNode => Boolean(n));
  const effectiveVisibleIds = usingDept ? deptVisibleIds : roleView.visibleIds;

  // Seed the collapsed state whenever the scoped view changes (role or department filter).
  useEffect(() => {
    if (!hydrated) return;
    setCollapsedIds(usingDept ? new Set() : new Set(roleView.defaultCollapsed));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role, hydrated, deptFilter]);

  // Center the tree horizontally when the view changes.
  useEffect(() => {
    if (!hydrated) return;
    const vp = viewportRef.current;
    if (vp) window.setTimeout(() => (vp.scrollLeft = (vp.scrollWidth - vp.clientWidth) / 2), 80);
  }, [hydrated, role, deptFilter]);

  function focusEmployee(id: string) {
    const emps = useOrgStore.getState().employees;
    const ancestors = getAncestorIds(emps, id);
    setCollapsedIds((prev) => {
      const next = new Set(prev);
      ancestors.forEach((a) => next.delete(a));
      return next;
    });
    setSelectedId(id);
    setHighlightId(id);
    window.setTimeout(() => setHighlightId(null), 2600);
    window.setTimeout(() => {
      document.querySelector(`[data-emp-id="${id}"]`)?.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
    }, 70);
  }

  function toggleCollapse(id: string) {
    setCollapsedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  // Drag-to-pan on empty canvas areas (cards/buttons keep their own clicks).
  function onCanvasMouseDown(e: React.MouseEvent) {
    if ((e.target as HTMLElement).closest("[data-emp-id], button, a")) return;
    const vp = viewportRef.current;
    if (!vp) return;
    pan.current = { x: e.clientX, y: e.clientY, left: vp.scrollLeft, top: vp.scrollTop };
    const move = (ev: MouseEvent) => {
      if (!pan.current || !vp) return;
      vp.scrollLeft = pan.current.left - (ev.clientX - pan.current.x);
      vp.scrollTop = pan.current.top - (ev.clientY - pan.current.y);
    };
    const up = () => {
      pan.current = null;
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
    };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
  }

  function handleFormSubmit(input: NewEmployeeInput | EmployeePatch, id?: string) {
    if (formMode === "add") {
      const newId = addEmployee(input as NewEmployeeInput);
      setFormOpen(false);
      focusEmployee(newId);
      toast.success("Employee added to the organization");
    } else if (id) {
      updateEmployee(id, input as EmployeePatch);
      setFormOpen(false);
      toast.success("Employee updated");
    }
  }

  function handleReassignConfirm(newManagerId: string) {
    if (!reassignId) return;
    const ok = reassignManager(reassignId, newManagerId);
    if (!ok) {
      toast.error("That would create a circular reporting line");
      return;
    }
    const id = reassignId;
    setReassignId(null);
    focusEmployee(id);
    toast.success("Manager reassigned — the reporting branch moved");
  }

  const openAdd = () => {
    setFormMode("add");
    setFormInitial(null);
    setFormOpen(true);
  };
  const openEdit = (id: string) => {
    setFormMode("edit");
    setFormInitial(employees.find((e) => e.id === id) ?? null);
    setFormOpen(true);
  };

  return (
    <div className="flex h-full flex-col gap-4 pb-2">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-shell bg-hero px-6 py-6 text-white shadow-[0_20px_60px_-20px_rgba(49,46,129,0.5)] sm:px-8">
        <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute -bottom-24 left-1/3 h-56 w-56 rounded-full bg-white/5 blur-3xl" />
        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-2xl font-semibold tracking-tight">Organization</h1>
            <p className="mt-0.5 text-sm text-white/60">View and manage your organization structure.</p>
          </div>
          {canManage && (
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setDeptDialogOpen(true)}
                className="inline-flex h-10 items-center gap-1.5 rounded-[12px] border border-white/25 bg-white/10 px-4 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/20"
              >
                <FolderPlus className="h-4 w-4" /> Add department
              </button>
              <button
                type="button"
                onClick={openAdd}
                className="inline-flex h-10 items-center gap-1.5 rounded-[12px] bg-white/90 px-4 text-sm font-semibold text-primary-800 shadow-sm transition-colors hover:bg-white"
              >
                <Plus className="h-4 w-4" /> Add employee
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 rounded-[16px] border border-border/[0.06] bg-surface px-4 py-3 shadow-xs dark:border-white/[0.06]">
        <span className="mr-auto text-xs font-medium text-text-tertiary">
          {employees.length} employee{employees.length === 1 ? "" : "s"}
        </span>

        <TextField
          select
          size="small"
          value={deptFilter}
          onChange={(e) => {
            setDeptFilter(e.target.value);
            if (e.target.value !== "all") setCollapsedIds(new Set());
          }}
          sx={{ width: 150 }}
        >
          <MenuItem value="all">All</MenuItem>
          {departments.map((d) => (
            <MenuItem key={d.name} value={d.name}>{d.name}</MenuItem>
          ))}
        </TextField>
      </div>

      {/* Tree viewport */}
      {!hydrated ? (
        <div className="flex flex-1 items-center justify-center rounded-[16px] border border-border/[0.06] bg-surface text-sm text-text-tertiary dark:border-white/[0.06]">
          Loading organization…
        </div>
      ) : employees.length === 0 ? (
        <EmptyOrg canManage={canManage} onAdd={openAdd} />
      ) : (
        <div
          ref={viewportRef}
          onMouseDown={onCanvasMouseDown}
          className="relative min-h-0 flex-1 cursor-grab overflow-auto rounded-[16px] border border-border/[0.06] bg-[radial-gradient(rgba(99,102,241,0.08)_1px,transparent_1px)] [background-size:22px_22px] active:cursor-grabbing dark:border-white/[0.06]"
        >
          <div className="mx-auto w-max px-16 py-12" style={{ zoom: ZOOM }}>
            <OrgTree
              roots={displayRoots}
              employees={employees}
              collapsedIds={collapsedIds}
              visibleIds={effectiveVisibleIds}
              selectedId={selectedId}
              highlightId={highlightId}
              onSelect={setSelectedId}
              onToggleCollapse={toggleCollapse}
            />
          </div>
        </div>
      )}

      {/* Drawer */}
      <EmployeeDrawer
        employee={selectedEmployee}
        employees={employees}
        canManage={canManage}
        onClose={() => setSelectedId(null)}
        onEdit={openEdit}
        onReassign={(id) => setReassignId(id)}
        onDeactivate={(id) => { deactivateEmployee(id); toast.success("Employee deactivated"); }}
        onRemove={(id) => { removeEmployee(id); setSelectedId(null); toast.success("Employee removed"); }}
        onSelectEmployee={(id) => setSelectedId(id)}
      />

      {/* Dialogs */}
      <EmployeeFormDialog
        open={formOpen}
        mode={formMode}
        initial={formInitial}
        employees={employees}
        onClose={() => setFormOpen(false)}
        onSubmit={handleFormSubmit}
      />
      <ReassignManagerDialog
        open={Boolean(reassignId)}
        employee={reassignEmployee}
        employees={employees}
        onClose={() => setReassignId(null)}
        onConfirm={handleReassignConfirm}
      />
      <AddDepartmentDialog
        open={deptDialogOpen}
        departments={departments}
        onClose={() => setDeptDialogOpen(false)}
        onSubmit={(name, color) => {
          addDepartment(name, color);
          setDeptDialogOpen(false);
          toast.success(`Department “${name}” created`);
        }}
      />
    </div>
  );
}

function EmptyOrg({ canManage, onAdd }: { canManage: boolean; onAdd: () => void }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center rounded-[16px] border border-dashed border-border/15 bg-surface p-10 text-center dark:border-white/[0.08]">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-100/60 text-primary-600 dark:bg-primary-100/40">
        <Users className="h-7 w-7" />
      </div>
      <h2 className="mt-4 text-base font-semibold text-text">Start building your organization</h2>
      <p className="mt-1 max-w-sm text-sm text-text-secondary">
        Add your first employee and define their reporting structure.
      </p>
      {canManage && (
        <button type="button" onClick={onAdd} className={cn("mt-5 inline-flex h-10 items-center gap-2 rounded-[12px] bg-primary-gradient px-4 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-95")}>
          <Plus className="h-4 w-4" /> Add employee
        </button>
      )}
    </div>
  );
}

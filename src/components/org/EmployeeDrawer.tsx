"use client";

import { useState } from "react";
import Drawer from "@mui/material/Drawer";
import Menu from "@mui/material/Menu";
import MuiMenuItem from "@mui/material/MenuItem";
import { Mail, MoreHorizontal, Pencil, Trash2, UserCog, UserMinus, X } from "lucide-react";
import { departmentColor, initials, type Employee } from "@/data/orgData";
import { useOrgStore } from "@/store/orgStore";
import { cn } from "@/lib/utils";

interface EmployeeDrawerProps {
  employee: Employee | null;
  employees: Employee[];
  canManage: boolean;
  onClose: () => void;
  onEdit: (id: string) => void;
  onReassign: (id: string) => void;
  onDeactivate: (id: string) => void;
  onRemove: (id: string) => void;
  onSelectEmployee: (id: string) => void;
}

export function EmployeeDrawer({
  employee,
  employees,
  canManage,
  onClose,
  onEdit,
  onReassign,
  onDeactivate,
  onRemove,
  onSelectEmployee,
}: EmployeeDrawerProps) {
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const departments = useOrgStore((s) => s.departments);
  const byId = (id?: string) => (id ? employees.find((e) => e.id === id) : undefined);

  const open = Boolean(employee);
  const directReports = employee ? employees.filter((e) => e.managerId === employee.id) : [];

  function relationRow(label: string, id?: string) {
    const person = byId(id);
    return (
      <div className="flex items-center justify-between gap-3 py-2">
        <span className="text-xs text-text-tertiary">{label}</span>
        {person ? (
          <button
            type="button"
            onClick={() => onSelectEmployee(person.id)}
            className="flex min-w-0 items-center gap-2 rounded-lg px-1.5 py-1 transition-colors hover:bg-surface-2"
          >
            <span
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
              style={{ backgroundColor: departmentColor(person.department, departments) }}
            >
              {initials(person.name)}
            </span>
            <span className="truncate text-sm font-medium text-text">{person.name}</span>
          </button>
        ) : (
          <span className="text-sm text-text-tertiary">—</span>
        )}
      </div>
    );
  }

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      slotProps={{ paper: { sx: { width: 400, maxWidth: "100vw", borderRadius: "0", backgroundImage: "none" } } }}
    >
      {employee && (
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-start justify-between gap-3 border-b border-border/[0.07] p-5 dark:border-white/[0.06]">
            <div className="flex min-w-0 items-center gap-3">
              <div className="relative shrink-0">
                <div
                  className="flex h-14 w-14 items-center justify-center rounded-full text-base font-bold text-white"
                  style={{ backgroundColor: departmentColor(employee.department, departments) }}
                >
                  {initials(employee.name)}
                </div>
                <span
                  className={cn(
                    "absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-surface",
                    employee.status === "active" ? "bg-success" : "bg-text-disabled",
                  )}
                />
              </div>
              <div className="min-w-0">
                <h3 className="truncate text-base font-semibold text-text">{employee.name}</h3>
                <p className="truncate text-sm text-text-secondary">{employee.jobTitle}</p>
                <span className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-surface-2 px-2 py-0.5 text-[11px] font-medium text-text-secondary dark:bg-white/[0.04]">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: departmentColor(employee.department, departments) }} />
                  {employee.department}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-text-tertiary transition-colors hover:bg-surface-2 hover:text-text"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-5">
            <a
              href={`mailto:${employee.email}`}
              className="flex items-center gap-2.5 rounded-xl border border-border/[0.07] bg-surface-2/50 px-3 py-2.5 text-sm text-text-secondary transition-colors hover:bg-surface-2 dark:border-white/[0.06]"
            >
              <Mail className="h-4 w-4 shrink-0 text-text-tertiary" />
              <span className="truncate">{employee.email}</span>
            </a>

            <div className="mt-5">
              <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-text-tertiary">Reporting relationships</p>
              <div className="divide-y divide-border/[0.06] dark:divide-white/[0.05]">
                {relationRow("Manager", employee.managerId)}
                {relationRow("Additional Manager", employee.additionalManagerId)}
                {relationRow("HR Manager", employee.hrManagerId)}
                {relationRow("Head", employee.headId)}
              </div>
            </div>

            <div className="mt-5">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-text-tertiary">
                Direct reports ({directReports.length})
              </p>
              {directReports.length ? (
                <div className="space-y-1">
                  {directReports.map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => onSelectEmployee(r.id)}
                      className="flex w-full items-center gap-2.5 rounded-xl px-2 py-2 text-left transition-colors hover:bg-surface-2 dark:hover:bg-white/[0.03]"
                    >
                      <span
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white"
                        style={{ backgroundColor: departmentColor(r.department, departments) }}
                      >
                        {initials(r.name)}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-text">{r.name}</span>
                        <span className="block truncate text-[11px] text-text-tertiary">{r.jobTitle}</span>
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-text-tertiary">No direct reports.</p>
              )}
            </div>
          </div>

          {/* Footer actions */}
          {canManage && (
            <div className="flex items-center gap-2 border-t border-border/[0.07] p-4 dark:border-white/[0.06]">
              <button
                type="button"
                onClick={() => onEdit(employee.id)}
                className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-[12px] bg-primary-gradient text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-95"
              >
                <Pencil className="h-4 w-4" /> Edit employee
              </button>
              <button
                type="button"
                onClick={(e) => setMenuAnchor(e.currentTarget)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-[12px] border border-border/[0.1] bg-surface text-text-secondary transition-colors hover:bg-surface-2 dark:border-white/10"
                aria-label="More actions"
              >
                <MoreHorizontal className="h-4.5 w-4.5" />
              </button>
              <Menu
                anchorEl={menuAnchor}
                open={Boolean(menuAnchor)}
                onClose={() => setMenuAnchor(null)}
                anchorOrigin={{ vertical: "top", horizontal: "right" }}
                transformOrigin={{ vertical: "bottom", horizontal: "right" }}
                slotProps={{
                  paper: { className: "!rounded-[14px] !border !border-border/[0.07] !bg-surface !shadow-float dark:!border-white/[0.06]", sx: { backgroundImage: "none", minWidth: 220, mb: 1 } },
                  list: { className: "!p-1.5" },
                }}
              >
                <MuiMenuItem
                  onClick={() => { setMenuAnchor(null); onReassign(employee.id); }}
                  sx={{ borderRadius: "8px", mx: 0.5, px: 1.5, py: 1, fontSize: "0.875rem", gap: 1.25 }}
                >
                  <UserCog className="h-4 w-4" /> Change manager
                </MuiMenuItem>
                <MuiMenuItem
                  onClick={() => { setMenuAnchor(null); onEdit(employee.id); }}
                  sx={{ borderRadius: "8px", mx: 0.5, px: 1.5, py: 1, fontSize: "0.875rem", gap: 1.25 }}
                >
                  <UserCog className="h-4 w-4" /> Edit relationships
                </MuiMenuItem>
                {employee.status === "active" && (
                  <MuiMenuItem
                    onClick={() => { setMenuAnchor(null); onDeactivate(employee.id); }}
                    sx={{ borderRadius: "8px", mx: 0.5, px: 1.5, py: 1, fontSize: "0.875rem", gap: 1.25 }}
                  >
                    <UserMinus className="h-4 w-4" /> Deactivate
                  </MuiMenuItem>
                )}
                <MuiMenuItem
                  onClick={() => { setMenuAnchor(null); onRemove(employee.id); }}
                  sx={{ borderRadius: "8px", mx: 0.5, px: 1.5, py: 1, fontSize: "0.875rem", gap: 1.25, color: "rgb(var(--danger-rgb))", "&:hover": { backgroundColor: "rgba(239,68,68,0.08)" } }}
                >
                  <Trash2 className="h-4 w-4" /> Remove employee
                </MuiMenuItem>
              </Menu>
            </div>
          )}
        </div>
      )}
    </Drawer>
  );
}

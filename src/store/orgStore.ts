"use client";

import { useEffect, useState } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DEPARTMENTS, DEPARTMENT_PALETTE, MOCK_EMPLOYEES, wouldCreateCycle, type Department, type Employee } from "@/data/orgData";

function genId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `e_${Math.random().toString(36).slice(2, 10)}`;
}

export type NewEmployeeInput = Omit<Employee, "id" | "status"> & { status?: Employee["status"] };
export type EmployeePatch = Partial<Omit<Employee, "id">>;

/** Trim, drop blanks, and de-duplicate a set of sub-department names (case-insensitive). */
function dedupeSubs(subs: string[]): string[] {
  const out: string[] = [];
  for (const s of subs) {
    const t = s.trim();
    if (t && !out.some((x) => x.toLowerCase() === t.toLowerCase())) out.push(t);
  }
  return out;
}

interface OrgState {
  employees: Employee[];
  departments: Department[];
  addDepartment: (name: string, subDepartments: string[], color?: string) => void;
  addSubDepartment: (department: string, sub: string) => void;
  removeSubDepartment: (department: string, sub: string) => void;
  addEmployee: (input: NewEmployeeInput) => string;
  updateEmployee: (id: string, patch: EmployeePatch) => void;
  reassignManager: (id: string, newManagerId: string) => boolean;
  deactivateEmployee: (id: string) => void;
  removeEmployee: (id: string) => void;
}

export const useOrgStore = create<OrgState>()(
  persist(
    (set, get) => ({
      employees: MOCK_EMPLOYEES,
      departments: DEPARTMENTS,

      addDepartment: (name, subDepartments, color) => {
        const trimmed = name.trim();
        if (!trimmed) return;
        // A department must be created with at least one sub-department.
        const subs = dedupeSubs(subDepartments);
        if (subs.length === 0) return;
        set((state) => {
          if (state.departments.some((d) => d.name.toLowerCase() === trimmed.toLowerCase())) return {};
          const used = new Set(state.departments.map((d) => d.color));
          const nextColor =
            color ?? DEPARTMENT_PALETTE.find((c) => !used.has(c)) ?? DEPARTMENT_PALETTE[state.departments.length % DEPARTMENT_PALETTE.length];
          return { departments: [...state.departments, { name: trimmed, color: nextColor, subDepartments: subs }] };
        });
      },

      addSubDepartment: (department, sub) => {
        const t = sub.trim();
        if (!t) return;
        set((state) => ({
          departments: state.departments.map((d) =>
            d.name === department && !d.subDepartments.some((s) => s.toLowerCase() === t.toLowerCase())
              ? { ...d, subDepartments: [...d.subDepartments, t] }
              : d,
          ),
        }));
      },

      removeSubDepartment: (department, sub) => {
        set((state) => ({
          departments: state.departments.map((d) =>
            // Keep at least one sub-department on every department.
            d.name === department && d.subDepartments.length > 1
              ? { ...d, subDepartments: d.subDepartments.filter((s) => s !== sub) }
              : d,
          ),
        }));
      },

      addEmployee: (input) => {
        const id = genId();
        const employee: Employee = { id, status: "active", ...input };
        set((state) => ({ employees: [...state.employees, employee] }));
        return id;
      },

      updateEmployee: (id, patch) => {
        set((state) => ({
          employees: state.employees.map((e) => (e.id === id ? { ...e, ...patch } : e)),
        }));
      },

      reassignManager: (id, newManagerId) => {
        if (wouldCreateCycle(get().employees, id, newManagerId)) return false;
        set((state) => ({
          employees: state.employees.map((e) => (e.id === id ? { ...e, managerId: newManagerId } : e)),
        }));
        return true;
      },

      deactivateEmployee: (id) => {
        set((state) => ({
          employees: state.employees.map((e) => (e.id === id ? { ...e, status: "inactive" } : e)),
        }));
      },

      removeEmployee: (id) => {
        set((state) => {
          const removed = state.employees.find((e) => e.id === id);
          const newManagerId = removed?.managerId;
          return {
            employees: state.employees
              .filter((e) => e.id !== id)
              // Reparent the removed employee's direct reports onto their grandparent,
              // and clear any dangling secondary relationships pointing at the removed id.
              .map((e) => {
                let next = e;
                if (e.managerId === id) next = { ...next, managerId: newManagerId };
                if (next.additionalManagerId === id) next = { ...next, additionalManagerId: undefined };
                if (next.hrManagerId === id) next = { ...next, hrManagerId: undefined };
                if (next.headId === id) next = { ...next, headId: undefined };
                return next;
              }),
          };
        });
      },
    }),
    {
      name: "zelog-org-v2",
      version: 1,
      skipHydration: true,
      // v0 → v1: departments gained a `subDepartments` array. Backfill from the
      // seed by name (falling back to empty) so older saves don't crash on render.
      migrate: (persisted: unknown, _version: number) => {
        const state = persisted as Partial<OrgState> | undefined;
        if (state?.departments) {
          state.departments = state.departments.map((d) => ({
            ...d,
            subDepartments: Array.isArray((d as Department).subDepartments)
              ? (d as Department).subDepartments
              : DEPARTMENTS.find((seed) => seed.name === d.name)?.subDepartments ?? [],
          }));
        }
        return state as OrgState;
      },
    },
  ),
);

export function useHydratedOrg() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    useOrgStore.persist.rehydrate();
    setHydrated(true);
  }, []);
  return hydrated;
}

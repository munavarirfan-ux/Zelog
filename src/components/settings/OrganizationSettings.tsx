"use client";

import { useMemo, useState } from "react";
import { Building2, MapPin, Plus, Users } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useOrgStore, useHydratedOrg } from "@/store/orgStore";

/* ── white settings panel ── */
function Panel({ title, sub, action, children }: {
  title: string; sub?: string; action?: React.ReactNode; children: React.ReactNode;
}) {
  return (
    <section className="rounded-card border border-border/[0.07] bg-surface p-6 shadow-card dark:border-white/[0.06]">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-[15px] font-semibold text-text">{title}</h3>
          {sub ? <p className="mt-0.5 text-xs text-text-tertiary">{sub}</p> : null}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

export function OrganizationSettings() {
  const hydrated = useHydratedOrg();
  const departments = useOrgStore((s) => s.departments);
  const employees = useOrgStore((s) => s.employees);
  const addDepartment = useOrgStore((s) => s.addDepartment);
  const [newDept, setNewDept] = useState("");

  // Member counts per department, and locations derived from active employees.
  const deptCounts = useMemo(() => {
    const map = new Map<string, number>();
    employees.forEach((e) => {
      if (e.status !== "active") return;
      map.set(e.department, (map.get(e.department) ?? 0) + 1);
    });
    return map;
  }, [employees]);

  const locations = useMemo(() => {
    const map = new Map<string, number>();
    employees.forEach((e) => {
      if (e.status !== "active" || !e.location) return;
      map.set(e.location, (map.get(e.location) ?? 0) + 1);
    });
    return [...map.entries()].sort((a, b) => b[1] - a[1]);
  }, [employees]);

  function handleAdd() {
    const trimmed = newDept.trim();
    if (!trimmed) return;
    if (departments.some((d) => d.name.toLowerCase() === trimmed.toLowerCase())) {
      toast.error(`“${trimmed}” already exists`);
      return;
    }
    addDepartment(trimmed);
    toast.success(`Added department “${trimmed}”`);
    setNewDept("");
  }

  return (
    <div className="space-y-5">
      {!hydrated ? (
        <div className="h-40 rounded-card border border-border/[0.07] bg-surface shadow-card dark:border-white/[0.06]" />
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          <Panel title="Departments" sub={`${departments.length} departments`}>
            <div className="mb-4 flex items-end gap-2">
              <div className="flex-1">
                <label className="mb-1.5 block text-xs font-medium text-text-secondary">New department</label>
                <Input
                  value={newDept}
                  onChange={(e) => setNewDept(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleAdd(); }}
                  placeholder="e.g. Customer Success"
                />
              </div>
              <Button className="gap-1.5" onClick={handleAdd}><Plus className="h-4 w-4" /> Add</Button>
            </div>

            <div className="divide-y divide-border/[0.06]">
              {departments.map((d) => (
                <div key={d.name} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
                  <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: d.color }} />
                  <p className="flex-1 truncate text-sm font-medium text-text">{d.name}</p>
                  <span className="inline-flex items-center gap-1 rounded-full bg-surface-2 px-2 py-0.5 text-[11px] font-medium text-text-secondary">
                    <Users className="h-3 w-3" /> {deptCounts.get(d.name) ?? 0}
                  </span>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="Locations" sub="Derived from active employee records">
            {locations.length === 0 ? (
              <p className="py-6 text-center text-sm text-text-tertiary">No locations on record.</p>
            ) : (
              <div className="divide-y divide-border/[0.06]">
                {locations.map(([loc, count]) => (
                  <div key={loc} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px] bg-surface-2 text-text-tertiary">
                      <MapPin className="h-4 w-4" />
                    </span>
                    <p className="flex-1 truncate text-sm font-medium text-text">{loc}</p>
                    <span className="inline-flex items-center gap-1 rounded-full bg-surface-2 px-2 py-0.5 text-[11px] font-medium text-text-secondary">
                      <Users className="h-3 w-3" /> {count}
                    </span>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-4 flex items-start gap-2 rounded-[12px] bg-surface-2/50 px-3 py-2.5">
              <Building2 className="mt-0.5 h-4 w-4 shrink-0 text-text-tertiary" />
              <p className="text-xs text-text-secondary">Locations are read from where people work today. Assign a location on an employee&apos;s profile to add one here.</p>
            </div>
          </Panel>
        </div>
      )}
    </div>
  );
}

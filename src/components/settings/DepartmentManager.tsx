"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useOrgStore } from "@/store/orgStore";

type Mode = "existing" | "new";

/**
 * Inline department control backed by the org store. Two flows:
 *  - "existing": pick a department that already exists and add a sub-department to it.
 *  - "new": create a brand-new department (which needs at least one sub-department).
 */
export function DepartmentManager() {
  const departments = useOrgStore((s) => s.departments);
  const addDepartment = useOrgStore((s) => s.addDepartment);
  const addSubDepartment = useOrgStore((s) => s.addSubDepartment);

  const [mode, setMode] = useState<Mode>("existing");

  // "new" department fields
  const [name, setName] = useState("");
  const [subs, setSubs] = useState<string[]>([]);

  // shared sub-department text box (used by both modes)
  const [subInput, setSubInput] = useState("");

  // "existing" department target
  const [target, setTarget] = useState<string>(departments[0]?.name ?? "");

  function stageSub() {
    const t = subInput.trim();
    if (!t) return;
    if (subs.some((s) => s.toLowerCase() === t.toLowerCase())) {
      setSubInput("");
      return;
    }
    setSubs((prev) => [...prev, t]);
    setSubInput("");
  }

  function handleAddToExisting() {
    const dept = target || departments[0]?.name;
    if (!dept) {
      toast.error("Pick a department first");
      return;
    }
    const t = subInput.trim();
    if (!t) {
      toast.error("Type a sub-department name (e.g. UX Designer)");
      return;
    }
    const existing = departments.find((d) => d.name === dept);
    if (existing?.subDepartments.some((s) => s.toLowerCase() === t.toLowerCase())) {
      toast.error(`“${t}” already exists under ${dept}`);
      return;
    }
    addSubDepartment(dept, t);
    toast.success(`Added “${t}” under ${dept}`);
    setSubInput("");
  }

  function handleCreateNew() {
    const trimmed = name.trim();
    if (!trimmed) {
      toast.error("Give the department a name");
      return;
    }
    // Fold in any text still sitting in the sub-department box.
    const pending = subInput.trim();
    const finalSubs = pending && !subs.some((s) => s.toLowerCase() === pending.toLowerCase()) ? [...subs, pending] : subs;
    if (finalSubs.length === 0) {
      toast.error("Add at least one sub-department (e.g. UX Designer)");
      return;
    }
    if (departments.some((d) => d.name.toLowerCase() === trimmed.toLowerCase())) {
      toast.error(`“${trimmed}” already exists`);
      return;
    }
    addDepartment(trimmed, finalSubs);
    toast.success(`Added “${trimmed}” with ${finalSubs.length} sub-department${finalSubs.length > 1 ? "s" : ""}`);
    setName("");
    setSubs([]);
    setSubInput("");
  }

  return (
    <div className="rounded-[12px] border border-dashed border-border/[0.12] bg-surface-2/40 p-3.5">
      {/* Mode toggle */}
      <div className="mb-3.5 inline-flex rounded-[10px] border border-border/[0.08] bg-surface p-0.5 dark:border-white/[0.06]">
        {(["existing", "new"] as Mode[]).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => { setMode(m); setSubInput(""); }}
            className={cn(
              "rounded-[8px] px-3 py-1.5 text-xs font-semibold transition-colors",
              mode === m
                ? "bg-primary-soft text-primary-700 dark:bg-primary-100/10 dark:text-primary-300"
                : "text-text-tertiary hover:text-text-secondary",
            )}
          >
            {m === "existing" ? "Add to existing" : "New department"}
          </button>
        ))}
      </div>

      {mode === "existing" ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-text-secondary">Department</label>
            {departments.length > 0 ? (
              <Select value={target} onValueChange={setTarget}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((d) => (
                    <SelectItem key={d.name} value={d.name}>{d.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <p className="text-xs text-text-tertiary">No departments yet — create one first.</p>
            )}
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-text-secondary">New sub-department</label>
            <div className="flex items-center gap-2">
              <Input
                value={subInput}
                onChange={(e) => setSubInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddToExisting(); } }}
                placeholder="e.g. UX Designer"
              />
              <Button size="sm" className="shrink-0 gap-1 rounded-[10px]" onClick={handleAddToExisting} disabled={departments.length === 0}>
                <Plus className="h-3.5 w-3.5" /> Add
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-text-secondary">Department</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Design" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-text-secondary">Sub-department</label>
              <div className="flex items-center gap-2">
                <Input
                  value={subInput}
                  onChange={(e) => setSubInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); stageSub(); } }}
                  placeholder="e.g. UX Designer"
                />
                <Button size="sm" variant="outline" className="shrink-0 gap-1 rounded-[10px]" onClick={stageSub}>
                  <Plus className="h-3.5 w-3.5" /> Add
                </Button>
              </div>
            </div>
          </div>

          {subs.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {subs.map((s) => (
                <span key={s} className="inline-flex items-center gap-1.5 rounded-full bg-surface py-1 pl-3 pr-1.5 text-xs font-medium text-text-secondary shadow-card">
                  {s}
                  <button
                    type="button"
                    onClick={() => setSubs((prev) => prev.filter((x) => x !== s))}
                    className="flex h-4 w-4 items-center justify-center rounded-full text-text-tertiary transition-colors hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-500/20"
                    aria-label={`Remove ${s}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}

          <div className="mt-3 flex items-center justify-between gap-3">
            <p className="text-[11px] text-text-tertiary">A department needs at least one sub-department.</p>
            <Button size="sm" className="gap-1.5" onClick={handleCreateNew}>
              <Plus className="h-4 w-4" /> Add department
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

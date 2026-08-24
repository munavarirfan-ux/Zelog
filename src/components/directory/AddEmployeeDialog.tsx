"use client";

import * as React from "react";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Dialog from "@mui/material/Dialog";
import { ArrowRight, FileSpreadsheet, Users, X, Zap } from "lucide-react";
import { DEPARTMENTS } from "@/data/orgData";
import { useOrgStore } from "@/store/orgStore";
import { useDirectoryStore } from "@/store/directoryStore";
import { buildExtra } from "@/data/directoryData";
import { cn } from "@/lib/utils";
import { inputCls, labelCls, BtnGhost, BtnPrimary } from "./dialogs";
import { useDirectoryPeople } from "./shared";

type Tab = "quick" | "import";

interface Draft {
  firstName: string;
  lastName: string;
  email: string;
  jobTitle: string;
  department: string;
  location: string;
  managerId: string;
  joiningDate: string;
}

const emptyDraft: Draft = {
  firstName: "",
  lastName: "",
  email: "",
  jobTitle: "",
  department: "Engineering",
  location: "Hyderabad",
  managerId: "",
  joiningDate: "2026-09-01",
};

export function AddEmployeeDialog({ open, onClose, initialTab = "quick" }: { open: boolean; onClose: () => void; initialTab?: Tab }) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>(initialTab);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [csv, setCsv] = useState("");

  // Sync the active tab whenever the dialog is (re)opened from a specific entry point.
  React.useEffect(() => {
    if (open) setTab(initialTab);
  }, [open, initialTab]);

  const people = useDirectoryPeople();
  const addEmployee = useOrgStore((s) => s.addEmployee);
  const employeeCount = useOrgStore((s) => s.employees.length);
  const dirStore = useDirectoryStore();

  const managers = useMemo(
    () => people.filter((p) => p.employmentStatus !== "inactive").sort((a, b) => a.name.localeCompare(b.name)),
    [people],
  );

  const set = (patch: Partial<Draft>) => setDraft((d) => ({ ...d, ...patch }));

  const reset = () => {
    setDraft(emptyDraft);
    setCsv("");
  };

  const close = () => {
    reset();
    onClose();
  };

  const goFullSetup = () => {
    close();
    router.push("/directory/new");
  };

  const commit = () => {
    const name = `${draft.firstName} ${draft.lastName}`.trim();
    const id = addEmployee({
      name, email: draft.email, jobTitle: draft.jobTitle, department: draft.department, location: draft.location, managerId: draft.managerId || undefined, hrManagerId: "hrhead", status: "active",
    });
    const seed = buildExtra({ id, name, email: draft.email, jobTitle: draft.jobTitle, department: draft.department, location: draft.location, status: "active", managerId: draft.managerId || undefined }, employeeCount);
    useDirectoryStore.setState((s) => ({
      extras: { ...s.extras, [id]: { ...seed, joiningDate: draft.joiningDate, employmentStatus: "active" } },
    }));
    dirStore.logActivity({ employeeId: id, category: "general", title: "Employee created", detail: name });
    close();
  };

  const importCsv = () => {
    const lines = csv.trim().split(/\r?\n/).filter(Boolean);
    const rows = lines[0]?.toLowerCase().includes("name") ? lines.slice(1) : lines;
    rows.forEach((line, i) => {
      const [first, last, email, jobTitle, department] = line.split(",").map((s) => s.trim());
      if (!first || !email) return;
      const name = `${first} ${last ?? ""}`.trim();
      const id = addEmployee({
        name, email, jobTitle: jobTitle || "New Hire", department: department || "Engineering", location: "Hyderabad", hrManagerId: "hrhead", status: "active",
      });
      const seed = buildExtra({ id, name, email, jobTitle: jobTitle || "New Hire", department: department || "Engineering", location: "Hyderabad", status: "active" }, employeeCount + i);
      useDirectoryStore.setState((s) => ({
        extras: { ...s.extras, [id]: { ...seed, employmentStatus: "active" } },
      }));
      dirStore.logActivity({ employeeId: id, category: "general", title: "Employee created", detail: name });
    });
    close();
  };

  const basicValid = draft.firstName.trim() && draft.email.trim() && draft.jobTitle.trim();

  return (
    <Dialog open={open} onClose={close} fullWidth slotProps={{ paper: { className: "!rounded-[20px] !bg-surface max-w-none w-full", style: { maxWidth: 500 } } }}>
      <div className="flex items-start justify-between gap-4 border-b border-border/[0.08] px-5 py-4">
        <div>
          <h2 className="text-[16px] font-semibold text-text">Add Employee</h2>
          <p className="mt-0.5 text-xs text-text-tertiary">Quick-add a hire, or bulk-import from a list.</p>
        </div>
        <button type="button" onClick={close} className="-mr-1 -mt-1 flex h-8 w-8 items-center justify-center rounded-full text-text-tertiary hover:bg-surface-2 hover:text-text" aria-label="Close">
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Mode tabs */}
      <div className="flex gap-1 border-b border-border/[0.08] px-5 pt-3">
        {([
          { id: "quick", label: "Quick Add", icon: Zap },
          { id: "import", label: "Import CSV", icon: FileSpreadsheet },
        ] as { id: Tab; label: string; icon: typeof Zap }[]).map((t) => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-t-[10px] border-b-2 px-3 pb-2.5 pt-1.5 text-sm font-medium transition-colors",
                active ? "border-primary-600 text-primary-700" : "border-transparent text-text-tertiary hover:text-text-secondary",
              )}
            >
              <Icon className="h-4 w-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      <div className="max-h-[72vh] overflow-y-auto px-5 py-5">
        {tab === "quick" ? (
          <>
            <QuickForm draft={draft} set={set} managers={managers} />
            <button
              type="button"
              onClick={goFullSetup}
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary-700 transition-colors hover:underline"
            >
              Need the full record? Open detailed setup <ArrowRight className="h-4 w-4" />
            </button>
          </>
        ) : null}

        {tab === "import" ? (
          <div className="space-y-3">
            <p className="text-sm text-text-secondary">
              Paste rows as <code className="rounded bg-surface-2 px-1 py-0.5 text-xs">First, Last, Email, Job Title, Department</code>. Each imported person is added as an active employee.
            </p>
            <textarea
              className={cn(inputCls, "min-h-[180px] resize-y font-mono text-xs")}
              placeholder={"Ava, Stone, ava.stone@zessta.com, Backend Engineer, Engineering\nLiam, Ford, liam.ford@zessta.com, SDR, Sales"}
              value={csv}
              onChange={(e) => setCsv(e.target.value)}
            />
          </div>
        ) : null}
      </div>

      <div className="flex items-center justify-between gap-2 border-t border-border/[0.08] px-5 py-3.5">
        <span className="inline-flex items-center gap-1.5 text-xs text-text-tertiary">
          {tab === "import" ? <><Users className="h-3.5 w-3.5" /> Bulk import</> : <>Added as an active employee</>}
        </span>

        <div className="flex items-center gap-2">
          <BtnGhost onClick={close}>Cancel</BtnGhost>

          {tab === "quick" ? (
            <BtnPrimary onClick={commit} disabled={!basicValid}>Add Employee</BtnPrimary>
          ) : (
            <BtnPrimary onClick={importCsv} disabled={!csv.trim()}>Import Employees</BtnPrimary>
          )}
        </div>
      </div>
    </Dialog>
  );
}

function QuickForm({ draft, set, managers }: { draft: Draft; set: (p: Partial<Draft>) => void; managers: { id: string; name: string }[] }) {
  return (
    <div className="grid grid-cols-2 gap-3.5">
      <div>
        <label className={labelCls}>First Name</label>
        <input className={inputCls} value={draft.firstName} onChange={(e) => set({ firstName: e.target.value })} />
      </div>
      <div>
        <label className={labelCls}>Last Name</label>
        <input className={inputCls} value={draft.lastName} onChange={(e) => set({ lastName: e.target.value })} />
      </div>
      <div className="col-span-2">
        <label className={labelCls}>Work Email</label>
        <input className={inputCls} value={draft.email} onChange={(e) => set({ email: e.target.value })} placeholder="name@zessta.com" />
      </div>
      <div className="col-span-2">
        <label className={labelCls}>Job Title</label>
        <input className={inputCls} value={draft.jobTitle} onChange={(e) => set({ jobTitle: e.target.value })} />
      </div>
      <div>
        <label className={labelCls}>Department</label>
        <select className={inputCls} value={draft.department} onChange={(e) => set({ department: e.target.value })}>
          {DEPARTMENTS.map((d) => <option key={d.name} value={d.name}>{d.name}</option>)}
        </select>
      </div>
      <div>
        <label className={labelCls}>Manager</label>
        <select className={inputCls} value={draft.managerId} onChange={(e) => set({ managerId: e.target.value })}>
          <option value="">— None —</option>
          {managers.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
        </select>
      </div>
      <div className="col-span-2">
        <label className={labelCls}>Joining Date</label>
        <input type="date" className={inputCls} value={draft.joiningDate} onChange={(e) => set({ joiningDate: e.target.value })} />
      </div>
    </div>
  );
}

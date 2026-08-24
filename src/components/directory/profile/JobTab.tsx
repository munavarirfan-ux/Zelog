"use client";

import * as React from "react";
import { useState } from "react";
import { Briefcase, Check, Network, Pencil, X } from "lucide-react";
import { DEPARTMENTS } from "@/data/orgData";
import { useOrgStore } from "@/store/orgStore";
import { useDirectoryStore } from "@/store/directoryStore";
import { EMPLOYMENT_TYPES, WORK_MODES, employmentTypeLabel, workModeLabel, type EmploymentType, type WorkMode } from "@/data/directoryData";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { cn } from "@/lib/utils";
import type { DirectoryPerson } from "../shared";
import { Section, InfoGrid, Info } from "./parts";

const inputCls = "w-full rounded-[10px] border border-border/[0.14] bg-surface px-3 py-2 text-sm text-text outline-none focus:border-primary-300";
const labelCls = "mb-1 block text-[11px] font-medium uppercase tracking-wide text-text-tertiary";

export function JobTab({ person, canEdit, nameById }: { person: DirectoryPerson; canEdit: boolean; nameById: Map<string, string> }) {
  const { currentUser } = useCurrentUser();
  const updateEmployee = useOrgStore((s) => s.updateEmployee);
  const reassignManager = useOrgStore((s) => s.reassignManager);
  const employees = useOrgStore((s) => s.employees);
  const updateExtra = useDirectoryStore((s) => s.updateExtra);
  const e = person.extra;

  const [editing, setEditing] = useState(false);
  const [jobTitle, setJobTitle] = useState(person.jobTitle);
  const [department, setDepartment] = useState(person.department);
  const [team, setTeam] = useState(e?.team ?? "");
  const [managerId, setManagerId] = useState(person.managerId ?? "");
  const [employmentType, setEmploymentType] = useState<EmploymentType>(e?.employmentType ?? "full-time");
  const [workMode, setWorkMode] = useState<WorkMode>(e?.workMode ?? "hybrid");
  const [workLocation, setWorkLocation] = useState(e?.workLocation ?? "");
  const [error, setError] = useState<string | null>(null);

  const managerOptions = employees.filter((emp) => emp.id !== person.id).sort((a, b) => a.name.localeCompare(b.name));

  const startEdit = () => {
    setJobTitle(person.jobTitle);
    setDepartment(person.department);
    setTeam(e?.team ?? "");
    setManagerId(person.managerId ?? "");
    setEmploymentType(e?.employmentType ?? "full-time");
    setWorkMode(e?.workMode ?? "hybrid");
    setWorkLocation(e?.workLocation ?? "");
    setError(null);
    setEditing(true);
  };

  const save = () => {
    // Manager change is cycle-guarded through the org store.
    if (managerId !== (person.managerId ?? "")) {
      if (managerId) {
        const ok = reassignManager(person.id, managerId);
        if (!ok) {
          setError("That manager would create a reporting cycle. Pick someone else.");
          return;
        }
      } else {
        updateEmployee(person.id, { managerId: undefined });
      }
    }
    // Identity/reporting fields → org store (propagate to org chart, routing, reports).
    updateEmployee(person.id, { jobTitle, department });
    // Extended fields → directory store (logs an activity entry).
    updateExtra(person.id, { team, employmentType, workMode, workLocation }, currentUser.id);
    setEditing(false);
  };

  if (!canEdit || !editing) {
    return (
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Section
          title="Job Details"
          icon={Briefcase}
          action={canEdit ? <button onClick={startEdit} className="inline-flex items-center gap-1.5 text-xs font-medium text-primary-700 hover:underline"><Pencil className="h-3.5 w-3.5" /> Edit</button> : undefined}
        >
          <InfoGrid>
            <Info label="Job Title" value={person.jobTitle} />
            <Info label="Department" value={person.department} />
            <Info label="Team" value={e?.team} />
            <Info label="Employment Type" value={employmentTypeLabel(e?.employmentType)} />
            <Info label="Work Mode" value={workModeLabel(e?.workMode)} />
            <Info label="Work Location" value={e?.workLocation} />
            <Info label="Joining Date" value={e?.joiningDate} />
            <Info label="Confirmation Date" value={e?.confirmationDate} />
            <Info label="Notice Period" value={e?.noticePeriodDays ? `${e.noticePeriodDays} days` : undefined} />
          </InfoGrid>
        </Section>

        <Section title="Reporting" icon={Network} tint="#38BDF8">
          <InfoGrid cols={1}>
            <Info label="Reporting Manager" value={person.managerId ? nameById.get(person.managerId) : "—"} />
            <Info label="Additional Manager" value={person.additionalManagerId ? nameById.get(person.additionalManagerId) : "—"} />
            <Info label="HR Manager" value={person.hrManagerId ? nameById.get(person.hrManagerId) : "—"} />
          </InfoGrid>
          <p className="mt-4 rounded-[10px] bg-surface-2/60 px-3 py-2 text-[11px] text-text-tertiary">
            Job & reporting changes here update the org chart, approval routing, team views, directory and reports automatically.
          </p>
        </Section>
      </div>
    );
  }

  // Edit mode
  return (
    <Section
      title="Edit Job & Reporting"
      icon={Briefcase}
      action={
        <div className="flex items-center gap-2">
          <button onClick={() => setEditing(false)} className="inline-flex items-center gap-1 rounded-[10px] px-3 py-1.5 text-xs font-medium text-text-secondary hover:bg-surface-2"><X className="h-3.5 w-3.5" /> Cancel</button>
          <button onClick={save} className="inline-flex items-center gap-1 rounded-[10px] bg-primary-gradient px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:opacity-95"><Check className="h-3.5 w-3.5" /> Save Changes</button>
        </div>
      }
    >
      {error ? <p className="mb-3 rounded-[10px] bg-rose-50 px-3 py-2 text-xs font-medium text-rose-600">{error}</p> : null}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={labelCls}>Job Title</label>
          <input className={inputCls} value={jobTitle} onChange={(ev) => setJobTitle(ev.target.value)} />
        </div>
        <div>
          <label className={labelCls}>Department</label>
          <select className={inputCls} value={department} onChange={(ev) => setDepartment(ev.target.value)}>
            {DEPARTMENTS.map((d) => <option key={d.name} value={d.name}>{d.name}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls}>Team</label>
          <input className={inputCls} value={team} onChange={(ev) => setTeam(ev.target.value)} />
        </div>
        <div>
          <label className={labelCls}>Reporting Manager</label>
          <select className={inputCls} value={managerId} onChange={(ev) => setManagerId(ev.target.value)}>
            <option value="">— None —</option>
            {managerOptions.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls}>Employment Type</label>
          <select className={inputCls} value={employmentType} onChange={(ev) => setEmploymentType(ev.target.value as EmploymentType)}>
            {EMPLOYMENT_TYPES.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls}>Work Mode</label>
          <select className={inputCls} value={workMode} onChange={(ev) => setWorkMode(ev.target.value as WorkMode)}>
            {WORK_MODES.map((w) => <option key={w.id} value={w.id}>{w.label}</option>)}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className={labelCls}>Work Location</label>
          <input className={inputCls} value={workLocation} onChange={(ev) => setWorkLocation(ev.target.value)} />
        </div>
      </div>
    </Section>
  );
}

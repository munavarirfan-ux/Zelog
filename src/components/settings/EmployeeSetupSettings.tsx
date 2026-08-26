"use client";

import { useRef } from "react";
import { Briefcase, ClipboardList, Clock, EyeOff, FileText, Hash, IdCard, Layers, Trash2, Upload, Wallet } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  useEmployeeSetupStore, useHydratedEmployeeSetup, formatEmployeeCode, type ListKey,
} from "@/store/employeeSetupStore";
import { Panel, Field, ManagedChips, ToggleRow } from "./settingsKit";

const PADDING_OPTIONS = ["2", "3", "4", "5", "6"];

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function EmployeeSetupSettings() {
  const ready = useHydratedEmployeeSetup();
  const code = useEmployeeSetupStore((s) => s.code);
  const lists = useEmployeeSetupStore((s) => s.lists);
  const onboarding = useEmployeeSetupStore((s) => s.onboarding);
  const fieldVisibility = useEmployeeSetupStore((s) => s.fieldVisibility);
  const updateCode = useEmployeeSetupStore((s) => s.updateCode);
  const addListItem = useEmployeeSetupStore((s) => s.addListItem);
  const removeListItem = useEmployeeSetupStore((s) => s.removeListItem);
  const setOnboarding = useEmployeeSetupStore((s) => s.setOnboarding);
  const toggleOnboarding = useEmployeeSetupStore((s) => s.toggleOnboarding);
  const toggleFieldVisibility = useEmployeeSetupStore((s) => s.toggleFieldVisibility);
  const policyDocuments = useEmployeeSetupStore((s) => s.policyDocuments);
  const addPolicyDocument = useEmployeeSetupStore((s) => s.addPolicyDocument);
  const removePolicyDocument = useEmployeeSetupStore((s) => s.removePolicyDocument);
  const fileRef = useRef<HTMLInputElement>(null);

  function onFilesPicked(files: FileList | null) {
    if (!files || files.length === 0) return;
    let added = 0;
    Array.from(files).forEach((f) => {
      addPolicyDocument({ name: f.name, size: f.size });
      added += 1;
    });
    if (fileRef.current) fileRef.current.value = "";
    toast.success(added === 1 ? "Document uploaded" : `${added} documents uploaded`);
  }

  if (!ready) {
    return (
      <div className="space-y-5">
        <div className="h-64 animate-pulse rounded-card border border-border/[0.07] bg-surface shadow-card dark:border-white/[0.06]" />
      </div>
    );
  }

  const chips = (key: ListKey) => ({
    items: lists[key],
    onAdd: (v: string) => addListItem(key, v),
    onRemove: (v: string) => removeListItem(key, v),
  });

  return (
    <div className="space-y-5">
      <Panel title="Employee code" sub="How new employee IDs are generated." icon={Hash} color="#FBBF24">
        <div className="grid gap-4 sm:grid-cols-4">
          <Field label="Prefix">
            <Input value={code.prefix} onChange={(e) => updateCode({ prefix: e.target.value })} />
          </Field>
          <Field label="Separator">
            <Input value={code.separator} onChange={(e) => updateCode({ separator: e.target.value })} />
          </Field>
          <Field label="Number length">
            <Select value={String(code.padding)} onValueChange={(v) => updateCode({ padding: Number(v) })}>
              <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
              <SelectContent>{PADDING_OPTIONS.map((v) => <SelectItem key={v} value={v}>{v} digits</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <Field label="Next number">
            <Input
              type="number"
              value={String(code.next)}
              onChange={(e) => updateCode({ next: Math.max(0, Number(e.target.value) || 0) })}
            />
          </Field>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3 rounded-[12px] bg-surface-2/50 px-4 py-3">
          <span className="text-xs text-text-secondary">Next employee code</span>
          <span className="rounded-[10px] bg-surface px-3 py-1.5 font-mono text-sm font-semibold text-text shadow-card">{formatEmployeeCode(code)}</span>
        </div>
      </Panel>

      <div className="grid gap-5 lg:grid-cols-2">
        <Panel title="Employment classification" sub="Options offered when hiring or editing an employee." icon={Briefcase} color="#8B5CF6">
          <div className="space-y-4">
            <Field label="Employment type"><ManagedChips {...chips("employmentTypes")} placeholder="e.g. Apprentice" /></Field>
            <Field label="Worker type"><ManagedChips {...chips("workerTypes")} placeholder="e.g. Freelancer" /></Field>
            <Field label="Time type"><ManagedChips {...chips("timeTypes")} placeholder="e.g. Flexible" /></Field>
            <Field label="Work mode"><ManagedChips {...chips("workModes")} placeholder="e.g. Field" /></Field>
          </div>
        </Panel>

        <Panel title="Levels & grades" sub="Seniority levels used across the org structure." icon={Layers} color="#38BDF8">
          <div className="space-y-4">
            <Field label="Level / grade"><ManagedChips {...chips("levels")} placeholder="e.g. L7 — VP" /></Field>
          </div>
        </Panel>

        <Panel title="Shifts & pay" sub="Work shifts and payroll cadences." icon={Clock} color="#34D399">
          <div className="space-y-4">
            <Field label="Shift"><ManagedChips {...chips("shifts")} placeholder="e.g. Flexi (10:00–19:00)" /></Field>
            <Field label="Pay frequency"><ManagedChips {...chips("payFrequencies")} placeholder="e.g. Weekly" /></Field>
          </div>
        </Panel>

        <Panel title="Policies" sub="Probation and notice options, plus your policy documents." icon={IdCard} color="#F472B6">
          <div className="space-y-4">
            <Field label="Probation policy"><ManagedChips {...chips("probationPolicies")} placeholder="e.g. 1 month" /></Field>
            <Field label="Notice period"><ManagedChips {...chips("noticePeriods")} placeholder="e.g. 15 days" /></Field>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label className="text-xs font-medium text-text-secondary">Policy documents</label>
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="inline-flex items-center gap-1.5 rounded-[9px] bg-primary-soft px-2.5 py-1 text-[11px] font-semibold text-primary-700 transition-colors hover:bg-primary-100 dark:bg-primary-100/10 dark:text-primary-300"
                >
                  <Upload className="h-3.5 w-3.5" /> Upload
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg"
                  className="hidden"
                  onChange={(e) => onFilesPicked(e.target.files)}
                />
              </div>

              {policyDocuments.length === 0 ? (
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="flex w-full flex-col items-center gap-1.5 rounded-[12px] border border-dashed border-border/[0.16] bg-surface-2/40 px-4 py-6 text-center transition-colors hover:border-primary-300 hover:bg-surface-2"
                >
                  <Upload className="h-5 w-5 text-text-tertiary" />
                  <span className="text-xs font-medium text-text-secondary">Upload custom documents</span>
                  <span className="text-[11px] text-text-tertiary">Leave policy, code of conduct, handbook… PDF, DOC or image.</span>
                </button>
              ) : (
                <div className="space-y-1.5">
                  {policyDocuments.map((doc) => (
                    <div key={doc.id} className="flex items-center gap-2.5 rounded-[10px] border border-border/[0.07] bg-surface-2/50 px-3 py-2 dark:border-white/[0.05]">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] bg-surface text-primary-600 shadow-card">
                        <FileText className="h-4 w-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-text">{doc.name}</p>
                        <p className="text-[11px] text-text-tertiary">{formatBytes(doc.size)}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removePolicyDocument(doc.id)}
                        className="flex h-7 w-7 items-center justify-center rounded-full text-text-tertiary transition-colors hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-500/20"
                        aria-label={`Remove ${doc.name}`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Panel>
      </div>

      <Panel title="Onboarding defaults" sub="Applied automatically when a new employee is added." icon={ClipboardList} color="#22D3EE">
        <div className="mb-4 grid gap-4 sm:grid-cols-2">
          <Field label="Default probation policy">
            <Select value={onboarding.probationPolicy} onValueChange={(v) => setOnboarding({ probationPolicy: v })}>
              <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
              <SelectContent>{lists.probationPolicies.map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <Field label="Default work mode">
            <Select value={onboarding.workMode} onValueChange={(v) => setOnboarding({ workMode: v })}>
              <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
              <SelectContent>{lists.workModes.map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
        </div>
        <div>
          <ToggleRow label="Add to directory" description="Make the new hire visible in the org chart and directory immediately." checked={onboarding.addToDirectory} onChange={() => toggleOnboarding("addToDirectory")} />
          <ToggleRow label="Send welcome email" description="Email the joiner their login and first-day details." checked={onboarding.welcomeEmail} onChange={() => toggleOnboarding("welcomeEmail")} />
          <ToggleRow label="Assign an onboarding buddy" description="Pair the new hire with a buddy from their team." checked={onboarding.assignBuddy} onChange={() => toggleOnboarding("assignBuddy")} />
          <ToggleRow label="Raise an asset request" description="Kick off a laptop / equipment request for IT." checked={onboarding.assetRequest} onChange={() => toggleOnboarding("assetRequest")} />
          <ToggleRow label="Create IT account" description="Provision email and workspace accounts on day one." checked={onboarding.itAccount} onChange={() => toggleOnboarding("itAccount")} />
        </div>
      </Panel>

      <Panel title="Profile field visibility" sub="What ordinary employees can see on a colleague's profile." icon={EyeOff} color="#FB7185">
        <div>
          <ToggleRow label="Compensation & CTC" description="Salary, CTC and pay details." checked={fieldVisibility.compensation} onChange={() => toggleFieldVisibility("compensation")} />
          <ToggleRow label="Documents" description="Uploaded personal and HR documents." checked={fieldVisibility.documents} onChange={() => toggleFieldVisibility("documents")} />
          <ToggleRow label="Personal contact details" description="Home address and personal phone number." checked={fieldVisibility.personalContact} onChange={() => toggleFieldVisibility("personalContact")} />
          <ToggleRow label="Bank details" description="Account and payroll banking information." checked={fieldVisibility.bankDetails} onChange={() => toggleFieldVisibility("bankDetails")} />
        </div>
        <div className="mt-4 flex items-start gap-2 rounded-[12px] bg-surface-2/50 px-3 py-2.5">
          <Wallet className="mt-0.5 h-4 w-4 shrink-0 text-text-tertiary" />
          <p className="text-xs text-text-secondary">
            <span className="font-semibold text-text">Off by default</span> — sensitive fields stay hidden from peers regardless of role. Managers and HR always retain access.
          </p>
        </div>
      </Panel>
    </div>
  );
}

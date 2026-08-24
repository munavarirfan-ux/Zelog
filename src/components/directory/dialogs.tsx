"use client";

import * as React from "react";
import { useMemo, useState } from "react";
import Dialog from "@mui/material/Dialog";
import { ArrowRight, X } from "lucide-react";
import { LEAVE_TYPES, MOCK_REQUESTS, computeBalances } from "@/data/timeOffData";
import { ALL_PROJECTS, ASSET_CATEGORIES, ASSET_CONDITIONS, type AssetCategory, type AssetCondition } from "@/data/directoryData";
import { useDirectoryStore } from "@/store/directoryStore";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { cn } from "@/lib/utils";
import type { DirectoryPerson } from "./shared";

/* ── Shared dialog chrome ── */

function DialogShell({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  maxWidth = 460,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer: React.ReactNode;
  maxWidth?: number;
}) {
  return (
    <Dialog open={open} onClose={onClose} slotProps={{ paper: { className: "!rounded-[20px] !bg-surface !max-w-none w-full", style: { maxWidth } } }}>
      <div className="flex items-start justify-between gap-4 border-b border-border/[0.08] px-5 py-4">
        <div className="min-w-0">
          <h2 className="text-[16px] font-semibold text-text">{title}</h2>
          {subtitle ? <p className="mt-0.5 text-xs text-text-tertiary">{subtitle}</p> : null}
        </div>
        <button type="button" onClick={onClose} className="-mr-1 -mt-1 flex h-8 w-8 items-center justify-center rounded-full text-text-tertiary hover:bg-surface-2 hover:text-text" aria-label="Close">
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="max-h-[62vh] overflow-y-auto px-5 py-4">{children}</div>
      <div className="flex items-center justify-end gap-2 border-t border-border/[0.08] px-5 py-3.5">{footer}</div>
    </Dialog>
  );
}

const inputCls =
  "w-full rounded-[10px] border border-border/[0.14] bg-surface px-3 py-2 text-sm text-text outline-none transition-colors placeholder:text-text-tertiary focus:border-primary-300";
const labelCls = "mb-1 block text-xs font-medium text-text-secondary";

function BtnPrimary({ children, disabled, onClick }: { children: React.ReactNode; disabled?: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="whitespace-nowrap rounded-[10px] bg-primary-gradient px-4 py-2 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-40"
    >
      {children}
    </button>
  );
}
function BtnGhost({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="rounded-[10px] px-4 py-2 text-sm font-medium text-text-secondary hover:bg-surface-2 hover:text-text">
      {children}
    </button>
  );
}

/* ── Assign Project ── */

export function AssignProjectDialog({ person, open, onClose }: { person: DirectoryPerson; open: boolean; onClose: () => void }) {
  const assignProject = useDirectoryStore((s) => s.assignProject);
  const [projectId, setProjectId] = useState(ALL_PROJECTS[0]?.id ?? "");
  const [role, setRole] = useState("Contributor");
  const [allocationPct, setAllocationPct] = useState(50);
  const [billable, setBillable] = useState(false);
  const [startDate, setStartDate] = useState("2026-08-24");

  const submit = () => {
    assignProject({ employeeId: person.id, projectId, role, allocationPct, billable, startDate });
    onClose();
  };

  return (
    <DialogShell
      open={open}
      onClose={onClose}
      title="Assign Project"
      subtitle={`${person.name} will appear on this project in ZE[LOG]`}
      footer={
        <>
          <BtnGhost onClick={onClose}>Cancel</BtnGhost>
          <BtnPrimary onClick={submit} disabled={!projectId || !role}>Assign Project</BtnPrimary>
        </>
      }
    >
      <div className="space-y-3.5">
        <div>
          <label className={labelCls}>Project</label>
          <select className={inputCls} value={projectId} onChange={(e) => setProjectId(e.target.value)}>
            {ALL_PROJECTS.map((p) => (
              <option key={p.id} value={p.id}>{p.name}{p.client ? ` · ${p.client}` : ""}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelCls}>Role on Project</label>
          <input className={inputCls} value={role} onChange={(e) => setRole(e.target.value)} placeholder="e.g. Tech Lead" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Allocation %</label>
            <input type="number" min={0} max={100} className={inputCls} value={allocationPct} onChange={(e) => setAllocationPct(Number(e.target.value))} />
          </div>
          <div>
            <label className={labelCls}>Start Date</label>
            <input type="date" className={inputCls} value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm text-text-secondary">
          <input type="checkbox" checked={billable} onChange={(e) => setBillable(e.target.checked)} className="h-4 w-4 rounded accent-primary-600" />
          Billable allocation
        </label>
      </div>
    </DialogShell>
  );
}

/* ── Adjust Leave Balance (audited) ── */

export function AdjustLeaveDialog({ person, open, onClose }: { person: DirectoryPerson; open: boolean; onClose: () => void }) {
  const { currentUser } = useCurrentUser();
  const adjustLeave = useDirectoryStore((s) => s.adjustLeave);
  const leaveAdjustments = useDirectoryStore((s) => s.leaveAdjustments);

  const [leaveTypeId, setLeaveTypeId] = useState("annual");
  const [mode, setMode] = useState<"add" | "deduct">("add");
  const [days, setDays] = useState(1);
  const [effectiveDate, setEffectiveDate] = useState("2026-08-24");
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");

  // Current balance = base computed balance + net of prior manual adjustments.
  const currentBalance = useMemo(() => {
    const base = computeBalances(person.id, MOCK_REQUESTS).find((b) => b.key === leaveTypeId)?.available ?? 0;
    const adj = leaveAdjustments
      .filter((a) => a.employeeId === person.id && a.leaveTypeId === leaveTypeId)
      .reduce((s, a) => s + a.delta, 0);
    return Math.max(0, base + adj);
  }, [person.id, leaveTypeId, leaveAdjustments]);

  const delta = mode === "add" ? days : -days;
  const newBalance = Math.max(0, currentBalance + delta);

  const submit = () => {
    adjustLeave({ employeeId: person.id, leaveTypeId, delta, previousBalance: currentBalance, effectiveDate, reason, notes, byId: currentUser.id });
    onClose();
  };

  return (
    <DialogShell
      open={open}
      onClose={onClose}
      title="Adjust Leave Balance"
      subtitle={`Every adjustment is recorded in ${person.name}'s activity log`}
      footer={
        <>
          <BtnGhost onClick={onClose}>Cancel</BtnGhost>
          <BtnPrimary onClick={submit} disabled={!reason.trim() || days <= 0}>Save Adjustment</BtnPrimary>
        </>
      }
    >
      <div className="space-y-3.5">
        <div>
          <label className={labelCls}>Leave Type</label>
          <select className={inputCls} value={leaveTypeId} onChange={(e) => setLeaveTypeId(e.target.value)}>
            {LEAVE_TYPES.filter((t) => t.tracksBalance).map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Adjustment</label>
            <div className="inline-flex w-full rounded-[10px] bg-surface-2 p-1">
              {(["add", "deduct"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMode(m)}
                  className={cn(
                    "flex-1 rounded-[8px] px-2 py-1.5 text-sm font-medium capitalize transition-all",
                    mode === m ? "bg-surface text-text shadow-sm" : "text-text-tertiary",
                  )}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className={labelCls}>Days</label>
            <input type="number" min={0.5} step={0.5} className={inputCls} value={days} onChange={(e) => setDays(Number(e.target.value))} />
          </div>
        </div>
        <div>
          <label className={labelCls}>Effective Date</label>
          <input type="date" className={inputCls} value={effectiveDate} onChange={(e) => setEffectiveDate(e.target.value)} />
        </div>
        <div>
          <label className={labelCls}>Reason</label>
          <input className={inputCls} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Carry-forward correction" />
        </div>
        <div>
          <label className={labelCls}>Notes (optional)</label>
          <textarea className={cn(inputCls, "min-h-[64px] resize-none")} value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>

        {/* Preview */}
        <div className="flex items-center justify-between rounded-[12px] border border-border/[0.1] bg-surface-2/60 px-4 py-3">
          <div className="text-center">
            <p className="text-[11px] text-text-tertiary">Current</p>
            <p className="text-lg font-bold tabular-nums text-text">{currentBalance}</p>
          </div>
          <div className="text-center">
            <p className="text-[11px] text-text-tertiary">Adjustment</p>
            <p className={cn("text-lg font-bold tabular-nums", delta >= 0 ? "text-emerald-600" : "text-rose-600")}>
              {delta >= 0 ? "+" : ""}{delta}
            </p>
          </div>
          <ArrowRight className="h-4 w-4 text-text-tertiary" />
          <div className="text-center">
            <p className="text-[11px] text-text-tertiary">New Balance</p>
            <p className="text-lg font-bold tabular-nums text-primary-700">{newBalance}</p>
          </div>
        </div>
      </div>
    </DialogShell>
  );
}

/* ── Assign Asset ── */

export function AssignAssetDialog({ person, open, onClose }: { person: DirectoryPerson; open: boolean; onClose: () => void }) {
  const { currentUser } = useCurrentUser();
  const assignAsset = useDirectoryStore((s) => s.assignAsset);
  const [name, setName] = useState("");
  const [category, setCategory] = useState<AssetCategory>("Laptop");
  const [assetId, setAssetId] = useState("");
  const [manufacturer, setManufacturer] = useState("");
  const [model, setModel] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [condition, setCondition] = useState<AssetCondition>("New");
  const [warrantyExpiry, setWarrantyExpiry] = useState("");
  const [notes, setNotes] = useState("");

  const submit = () => {
    assignAsset({ employeeId: person.id, name, category, assetId, manufacturer, model, serialNumber, condition, warrantyExpiry: warrantyExpiry || undefined, notes, assignedById: currentUser.id });
    onClose();
  };

  return (
    <DialogShell
      open={open}
      onClose={onClose}
      title="Assign Asset"
      subtitle={`Tracked against ${person.name} with full history`}
      maxWidth={520}
      footer={
        <>
          <BtnGhost onClick={onClose}>Cancel</BtnGhost>
          <BtnPrimary onClick={submit} disabled={!name.trim() || !assetId.trim()}>Assign Asset</BtnPrimary>
        </>
      }
    >
      <div className="grid grid-cols-2 gap-3.5">
        <div className="col-span-2">
          <label className={labelCls}>Asset Name</label>
          <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} placeholder='e.g. MacBook Pro 14"' />
        </div>
        <div>
          <label className={labelCls}>Category</label>
          <select className={inputCls} value={category} onChange={(e) => setCategory(e.target.value as AssetCategory)}>
            {ASSET_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls}>Asset ID</label>
          <input className={inputCls} value={assetId} onChange={(e) => setAssetId(e.target.value)} placeholder="ZES-LAP-0212" />
        </div>
        <div>
          <label className={labelCls}>Manufacturer</label>
          <input className={inputCls} value={manufacturer} onChange={(e) => setManufacturer(e.target.value)} />
        </div>
        <div>
          <label className={labelCls}>Model</label>
          <input className={inputCls} value={model} onChange={(e) => setModel(e.target.value)} />
        </div>
        <div>
          <label className={labelCls}>Serial Number</label>
          <input className={inputCls} value={serialNumber} onChange={(e) => setSerialNumber(e.target.value)} />
        </div>
        <div>
          <label className={labelCls}>Condition</label>
          <select className={inputCls} value={condition} onChange={(e) => setCondition(e.target.value as AssetCondition)}>
            {ASSET_CONDITIONS.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="col-span-2">
          <label className={labelCls}>Warranty Expiry (optional)</label>
          <input type="date" className={inputCls} value={warrantyExpiry} onChange={(e) => setWarrantyExpiry(e.target.value)} />
        </div>
        <div className="col-span-2">
          <label className={labelCls}>Notes (optional)</label>
          <textarea className={cn(inputCls, "min-h-[56px] resize-none")} value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>
      </div>
    </DialogShell>
  );
}

export { DialogShell, inputCls, labelCls, BtnPrimary, BtnGhost };

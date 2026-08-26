"use client";

import { useMemo, useState } from "react";
import { useOrgStore } from "@/store/orgStore";
import { useDirectoryStore } from "@/store/directoryStore";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import {
  ASSET_CATEGORIES, ASSET_CONDITIONS,
  type Asset, type AssetCategory, type AssetCondition,
  type EmployeeProfileExtra,
} from "@/data/directoryData";
import type { Employee } from "@/data/orgData";
import { cn } from "@/lib/utils";
import { PersonAvatar } from "@/components/ui/person-avatar";
import { DialogShell, inputCls, labelCls, BtnPrimary, BtnGhost } from "@/components/directory/dialogs";

/**
 * Type-ahead employee picker. Filters the roster by name, email, employee ID,
 * phone, or employee code, so a long company roster is searchable rather than
 * a scroll-forever <select>. Phone/code come from the directory `extras`.
 */
function EmployeePicker({
  roster,
  extras,
  value,
  onChange,
}: {
  roster: Employee[];
  extras: Record<string, EmployeeProfileExtra>;
  value: string;
  onChange: (id: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const selected = roster.find((e) => e.id === value);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    const scored = roster.filter((e) => {
      if (!q) return true;
      const ex = extras[e.id];
      return [e.name, e.email, e.id, ex?.phone, ex?.employeeCode]
        .filter(Boolean)
        .some((f) => (f as string).toLowerCase().includes(q));
    });
    return scored.slice(0, 60);
  }, [query, roster, extras]);

  return (
    <div className="relative">
      <input
        className={inputCls}
        placeholder="Search by name, email, phone or ID…"
        aria-label="Search employees to assign"
        value={open ? query : selected ? `${selected.name} · ${selected.department}` : query}
        onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
        onFocus={() => { setQuery(""); setOpen(true); }}
        onBlur={() => window.setTimeout(() => setOpen(false), 120)}
      />
      {open && (
        <div className="absolute z-[60] mt-1 max-h-64 w-full overflow-auto rounded-[10px] border border-border/[0.14] bg-surface py-1 shadow-lg">
          {matches.length === 0 ? (
            <div className="px-3 py-2.5 text-sm text-text-tertiary">No matching employees</div>
          ) : (
            matches.map((e) => {
              const ex = extras[e.id];
              return (
                <button
                  key={e.id}
                  type="button"
                  onMouseDown={(ev) => ev.preventDefault()}
                  onClick={() => { onChange(e.id); setQuery(""); setOpen(false); }}
                  className={cn(
                    "flex w-full items-center gap-2.5 px-3 py-2 text-left transition-colors hover:bg-surface-2",
                    e.id === value && "bg-primary-50",
                  )}
                >
                  <PersonAvatar name={e.name} src={e.avatarUrl} size={30} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium text-text">{e.name}</div>
                    <div className="truncate text-xs text-text-tertiary">
                      {e.email}{ex?.phone ? ` · ${ex.phone}` : ""}
                    </div>
                  </div>
                  <span className="shrink-0 text-xs text-text-tertiary">{e.department}</span>
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Company-wide asset dialog. In "assign" mode it registers a brand-new asset
 * against a chosen employee; in "reassign" mode it transfers an existing asset
 * to a different employee. Both are audited via the directory store.
 */
export function AssetAssignDialog({
  open,
  onClose,
  mode,
  asset,
}: {
  open: boolean;
  onClose: () => void;
  mode: "assign" | "reassign";
  /** The asset being transferred (reassign mode only). */
  asset?: Asset;
}) {
  const { currentUser } = useCurrentUser();
  const employees = useOrgStore((s) => s.employees);
  const extras = useDirectoryStore((s) => s.extras);
  const assignAsset = useDirectoryStore((s) => s.assignAsset);
  const reassignAsset = useDirectoryStore((s) => s.reassignAsset);

  // Only active people can hold assets. In reassign mode, exclude the current holder.
  const roster = useMemo(
    () =>
      employees
        .filter((e) => e.status === "active" && e.id !== asset?.employeeId)
        .sort((a, b) => a.name.localeCompare(b.name)),
    [employees, asset?.employeeId],
  );

  const [employeeId, setEmployeeId] = useState(roster[0]?.id ?? "");
  const [name, setName] = useState("");
  const [category, setCategory] = useState<AssetCategory>("Laptop");
  const [assetId, setAssetId] = useState("");
  const [manufacturer, setManufacturer] = useState("");
  const [model, setModel] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [condition, setCondition] = useState<AssetCondition>("New");
  const [warrantyExpiry, setWarrantyExpiry] = useState("");
  const [notes, setNotes] = useState("");

  const isReassign = mode === "reassign";
  const canSubmit = isReassign ? Boolean(employeeId) : Boolean(name.trim() && assetId.trim() && employeeId);

  const submit = () => {
    if (!canSubmit) return;
    if (isReassign && asset) {
      const toName = roster.find((e) => e.id === employeeId)?.name;
      reassignAsset(asset.id, employeeId, currentUser.id, toName, notes.trim() || undefined);
    } else {
      assignAsset({
        employeeId, name, category, assetId: assetId.trim(),
        manufacturer, model, serialNumber, condition,
        warrantyExpiry: warrantyExpiry || undefined, notes,
        assignedById: currentUser.id,
      });
    }
    onClose();
  };

  return (
    <DialogShell
      open={open}
      onClose={onClose}
      title={isReassign ? "Reassign Asset" : "Assign Asset"}
      subtitle={
        isReassign
          ? `Transfer ${asset?.name ?? "this asset"} (${asset?.assetId ?? ""}) to another employee`
          : "Register a company asset against an employee — tracked with full history"
      }
      maxWidth={520}
      footer={
        <>
          <BtnGhost onClick={onClose}>Cancel</BtnGhost>
          <BtnPrimary onClick={submit} disabled={!canSubmit}>{isReassign ? "Reassign" : "Assign Asset"}</BtnPrimary>
        </>
      }
    >
      <div className="grid grid-cols-2 gap-3.5">
        <div className="col-span-2">
          <label className={labelCls}>{isReassign ? "New Owner" : "Assign To"} <span className="text-rose-500">*</span></label>
          <EmployeePicker roster={roster} extras={extras} value={employeeId} onChange={setEmployeeId} />
        </div>

        {isReassign ? (
          <div className="col-span-2">
            <label className={labelCls}>Note (optional)</label>
            <textarea className={cn(inputCls, "min-h-[56px] resize-none")} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="e.g. Handover for project rotation" />
          </div>
        ) : (
          <>
            <div className="col-span-2">
              <label className={labelCls}>Asset Name <span className="text-rose-500">*</span></label>
              <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} placeholder='e.g. MacBook Pro 14"' />
            </div>
            <div>
              <label className={labelCls}>Category</label>
              <select className={inputCls} value={category} onChange={(e) => setCategory(e.target.value as AssetCategory)}>
                {ASSET_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Asset ID <span className="text-rose-500">*</span></label>
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
          </>
        )}
      </div>
    </DialogShell>
  );
}

"use client";

import * as React from "react";
import { useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
import {
  Check, CreditCard, History, Laptop, Monitor, Package, Plus, RefreshCw,
  ShieldCheck, Smartphone, X,
} from "lucide-react";
import { useDirectoryStore } from "@/store/directoryStore";
import {
  ASSET_REQUEST_STATUS, ASSET_STATUS, REQUESTABLE_ASSETS, REQUESTABLE_CATEGORIES,
  type Asset, type AssetCategory, type AssetRequest, type AssetStatus,
} from "@/data/directoryData";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { cn } from "@/lib/utils";
import type { DirectoryPerson } from "../shared";
import { Section, Empty } from "./parts";

const CATEGORY_ICON: Record<AssetCategory, typeof Laptop> = {
  Laptop,
  Monitor,
  Phone: Smartphone,
  "Access Card": CreditCard,
  Accessory: Package,
};

const NEXT_STATUS: { value: AssetStatus; label: string }[] = [
  { value: "assigned", label: "Assigned" },
  { value: "repair", label: "In Repair" },
  { value: "returned", label: "Returned" },
  { value: "lost", label: "Lost" },
  { value: "retired", label: "Retired" },
];

const inputCls = "w-full rounded-[10px] border border-border/[0.14] bg-surface px-3 py-2 text-sm text-text outline-none focus:border-primary-300";
const labelCls = "mb-1 block text-[11px] font-medium uppercase tracking-wide text-text-tertiary";

type SelfTab = "assigned" | "request" | "change";
const SELF_TABS: { id: SelfTab; label: string; icon: typeof Laptop }[] = [
  { id: "assigned", label: "Assigned Assets", icon: Laptop },
  { id: "request", label: "Request an Asset", icon: Plus },
  { id: "change", label: "Request a Change", icon: RefreshCw },
];

export function AssetsTab({
  person,
  canEdit,
  selfService = false,
  nameById,
  onAssign,
}: {
  person: DirectoryPerson;
  canEdit: boolean;
  /** Employee viewing their own record — may add / request assets but not edit status. */
  selfService?: boolean;
  nameById: Map<string, string>;
  onAssign: () => void;
}) {
  const { currentUser } = useCurrentUser();
  const allAssets = useDirectoryStore((s) => s.assets);
  const updateAssetStatus = useDirectoryStore((s) => s.updateAssetStatus);
  const allRequests = useDirectoryStore((s) => s.assetRequests);
  const decideAssetRequest = useDirectoryStore((s) => s.decideAssetRequest);

  const assets = useMemo(() => allAssets.filter((a) => a.employeeId === person.id), [allAssets, person.id]);
  const requests = useMemo(
    () => allRequests.filter((r) => r.employeeId === person.id).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)),
    [allRequests, person.id],
  );

  // Merge every asset's history into one reverse-chronological timeline.
  const timeline = useMemo(() => {
    return assets
      .flatMap((a) => a.history.map((ev) => ({ ...ev, assetName: a.name })))
      .sort((x, y) => (x.at < y.at ? 1 : -1));
  }, [assets]);

  const [subTab, setSubTab] = useState<SelfTab>("assigned");

  const assignedSection = (
    <Section
      title="Assigned Assets"
      icon={Laptop}
      action={canEdit || selfService ? (
        <button onClick={onAssign} className="inline-flex items-center gap-1.5 rounded-[10px] bg-primary-gradient px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:opacity-95">
          <Plus className="h-3.5 w-3.5" /> {selfService && !canEdit ? "Add Asset" : "Assign Asset"}
        </button>
      ) : undefined}
    >
      {assets.length === 0 ? (
        <Empty>No assets assigned.</Empty>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {assets.map((a) => (
            <AssetCard key={a.id} asset={a} canEdit={canEdit} onStatus={(s) => updateAssetStatus(a.id, s, currentUser.id)} />
          ))}
        </div>
      )}
    </Section>
  );

  const historySection = (
    <Section title="Asset History" icon={History} tint="#38BDF8">
      {timeline.length === 0 ? (
        <Empty>No asset activity.</Empty>
      ) : (
        <ol className="relative space-y-4 border-l border-border/[0.1] pl-5">
          {timeline.map((ev) => (
            <li key={ev.id} className="relative">
              <span className="absolute -left-[26px] top-1 flex h-3 w-3 items-center justify-center rounded-full bg-primary-gradient ring-4 ring-surface" />
              <p className="text-sm font-medium text-text">{ev.assetName} · <span className="font-normal text-text-secondary">{ev.detail}</span></p>
              <p className="text-[11px] text-text-tertiary">
                {safeDate(ev.at)}{ev.byId ? ` · ${nameById.get(ev.byId) ?? ev.byId}` : ""}
              </p>
            </li>
          ))}
        </ol>
      )}
    </Section>
  );

  // ── Employee self-service view: three tabs ──
  if (selfService && !canEdit) {
    return (
      <div className="space-y-4">
        <div className="inline-flex flex-wrap items-center gap-1 rounded-full border border-border/[0.09] bg-surface p-1">
          {SELF_TABS.map((t) => {
            const active = subTab === t.id;
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setSubTab(t.id)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition-all",
                  active ? "bg-primary-gradient text-white shadow-sm" : "text-text-secondary hover:bg-surface-2 hover:text-text",
                )}
              >
                <Icon className="h-4 w-4" strokeWidth={2} /> {t.label}
              </button>
            );
          })}
        </div>

        {subTab === "assigned" ? (
          <>
            {assignedSection}
            {historySection}
          </>
        ) : subTab === "request" ? (
          <>
            <RequestAssetForm employeeId={person.id} />
            <Section title="Your Asset Requests" icon={Plus}>
              <RequestList requests={requests.filter((r) => r.kind === "new")} assets={assets} nameById={nameById} />
            </Section>
          </>
        ) : (
          <>
            <RequestChangeForm employeeId={person.id} assets={assets} />
            <Section title="Your Change Requests" icon={RefreshCw} tint="#F59E0B">
              <RequestList requests={requests.filter((r) => r.kind === "change")} assets={assets} nameById={nameById} />
            </Section>
          </>
        )}
      </div>
    );
  }

  // ── Admin / viewer view: assigned assets, pending requests to action, history ──
  const pendingRequests = requests.filter((r) => r.status === "pending");
  return (
    <div className="space-y-4">
      {assignedSection}

      {canEdit && requests.length > 0 ? (
        <Section
          title="Asset Requests"
          icon={Plus}
          tint="#8B7CF6"
          action={pendingRequests.length > 0 ? (
            <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-semibold text-amber-700">{pendingRequests.length} pending</span>
          ) : undefined}
        >
          <RequestList
            requests={requests}
            assets={assets}
            nameById={nameById}
            onDecide={canEdit ? (id, status) => decideAssetRequest(id, status, currentUser.id) : undefined}
          />
        </Section>
      ) : null}

      {historySection}
    </div>
  );
}

/* ── Request forms ── */

function RequestAssetForm({ employeeId }: { employeeId: string }) {
  const requestAsset = useDirectoryStore((s) => s.requestAsset);
  const [choice, setChoice] = useState(REQUESTABLE_ASSETS[0].label);
  const [reason, setReason] = useState("");
  const [done, setDone] = useState(false);

  const submit = () => {
    const item = REQUESTABLE_ASSETS.find((r) => r.label === choice);
    if (!item || !reason.trim()) return;
    requestAsset({ employeeId, kind: "new", label: item.label, category: item.category, reason: reason.trim() });
    setReason("");
    setDone(true);
  };

  return (
    <div className="rounded-[16px] border border-primary-200 bg-primary-50/40 p-4">
      <p className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-text"><Plus className="h-4 w-4 text-primary-700" /> Request an Asset</p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className={labelCls}>Asset</label>
          <select className={inputCls} value={choice} onChange={(e) => { setChoice(e.target.value); setDone(false); }}>
            {REQUESTABLE_ASSETS.map((r) => <option key={r.label} value={r.label}>{r.label}</option>)}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className={labelCls}>Reason</label>
          <textarea className={cn(inputCls, "min-h-[72px] resize-y")} value={reason} onChange={(e) => { setReason(e.target.value); setDone(false); }} placeholder="Why do you need this? e.g. Starting a new project, current one is failing…" />
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between gap-2">
        <p className="text-xs text-emerald-600">{done ? "Request submitted — it's now pending approval." : ""}</p>
        <button onClick={submit} disabled={!reason.trim()} className="rounded-[10px] bg-primary-gradient px-4 py-2 text-sm font-semibold text-white shadow-sm hover:opacity-95 disabled:opacity-40">Submit Request</button>
      </div>
    </div>
  );
}

function RequestChangeForm({ employeeId, assets }: { employeeId: string; assets: Asset[] }) {
  const requestAsset = useDirectoryStore((s) => s.requestAsset);
  // Only the everyday hardware an employee can ask to swap or repair.
  const changeable = useMemo(
    () => assets.filter((a) => REQUESTABLE_CATEGORIES.includes(a.category) && (a.status === "assigned" || a.status === "repair")),
    [assets],
  );
  const [assetId, setAssetId] = useState(changeable[0]?.id ?? "");
  const [reason, setReason] = useState("");
  const [done, setDone] = useState(false);

  if (changeable.length === 0) {
    return (
      <div className="rounded-[16px] border border-border/[0.1] bg-surface-2/40 p-5 text-center">
        <RefreshCw className="mx-auto mb-2 h-6 w-6 text-text-tertiary" />
        <p className="text-sm font-medium text-text">Nothing to change yet</p>
        <p className="text-xs text-text-tertiary">You can request a change once you have a laptop, monitor, phone, or charger assigned.</p>
      </div>
    );
  }

  const submit = () => {
    const asset = changeable.find((a) => a.id === assetId);
    if (!asset || !reason.trim()) return;
    requestAsset({ employeeId, kind: "change", label: asset.name, category: asset.category, currentAssetId: asset.id, reason: reason.trim() });
    setReason("");
    setDone(true);
  };

  return (
    <div className="rounded-[16px] border border-amber-200 bg-amber-50/50 p-4">
      <p className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-text"><RefreshCw className="h-4 w-4 text-amber-600" /> Request a Change</p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className={labelCls}>Which asset</label>
          <select className={inputCls} value={assetId} onChange={(e) => { setAssetId(e.target.value); setDone(false); }}>
            {changeable.map((a) => <option key={a.id} value={a.id}>{a.name} · {a.assetId}</option>)}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className={labelCls}>What's the issue?</label>
          <textarea className={cn(inputCls, "min-h-[72px] resize-y")} value={reason} onChange={(e) => { setReason(e.target.value); setDone(false); }} placeholder="e.g. Battery drains in an hour, screen has dead pixels, charger stopped working…" />
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between gap-2">
        <p className="text-xs text-emerald-600">{done ? "Change request submitted — it's now pending approval." : ""}</p>
        <button onClick={submit} disabled={!reason.trim()} className="rounded-[10px] bg-primary-gradient px-4 py-2 text-sm font-semibold text-white shadow-sm hover:opacity-95 disabled:opacity-40">Submit Request</button>
      </div>
    </div>
  );
}

function RequestList({
  requests,
  assets,
  nameById,
  onDecide,
}: {
  requests: AssetRequest[];
  assets: Asset[];
  nameById: Map<string, string>;
  onDecide?: (id: string, status: "approved" | "rejected") => void;
}) {
  if (requests.length === 0) return <Empty>No requests yet.</Empty>;
  return (
    <ul className="divide-y divide-border/[0.06]">
      {requests.map((r) => {
        const st = ASSET_REQUEST_STATUS[r.status];
        const Icon = CATEGORY_ICON[r.category] ?? Package;
        const current = r.currentAssetId ? assets.find((a) => a.id === r.currentAssetId) : undefined;
        return (
          <li key={r.id} className="flex items-start gap-3 py-3">
            <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-surface-2 text-text-secondary">
              <Icon className="h-[18px] w-[18px]" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-medium text-text">
                  {r.kind === "new" ? "New" : "Change"} · {r.label}
                </p>
                <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{ color: st.color, backgroundColor: `${st.color}1F` }}>{st.label}</span>
              </div>
              {current ? <p className="text-[11px] text-text-tertiary">Current: {current.assetId}</p> : null}
              <p className="mt-0.5 text-xs text-text-secondary">{r.reason}</p>
              <p className="mt-0.5 text-[11px] text-text-tertiary">
                {safeDate(r.createdAt)}
                {r.decidedById ? ` · ${st.label} by ${nameById.get(r.decidedById) ?? r.decidedById}` : ""}
              </p>
            </div>
            {onDecide && r.status === "pending" ? (
              <div className="flex shrink-0 items-center gap-1.5">
                <button type="button" onClick={() => onDecide(r.id, "approved")} aria-label="Approve" className="flex h-8 w-8 items-center justify-center rounded-[9px] bg-[#34D39922] text-[#0F9E6E] hover:bg-[#34D39933]"><Check className="h-4 w-4" strokeWidth={2.5} /></button>
                <button type="button" onClick={() => onDecide(r.id, "rejected")} aria-label="Reject" className="flex h-8 w-8 items-center justify-center rounded-[9px] bg-[#F43F5E1A] text-[#E11D48] hover:bg-[#F43F5E2E]"><X className="h-4 w-4" strokeWidth={2.5} /></button>
              </div>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}

/* ── Asset card ── */

function AssetCard({ asset, canEdit, onStatus }: { asset: Asset; canEdit: boolean; onStatus: (s: AssetStatus) => void }) {
  const Icon = CATEGORY_ICON[asset.category] ?? Package;
  const st = ASSET_STATUS[asset.status];
  return (
    <div className="rounded-[14px] border border-border/[0.08] p-4">
      <div className="mb-3 flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[11px] bg-surface-2 text-text-secondary">
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <p className="truncate text-sm font-semibold text-text">{asset.name}</p>
            {asset.selfReported ? (
              <span className="shrink-0 rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700">Self-reported</span>
            ) : null}
          </div>
          <p className="truncate text-xs text-text-tertiary">{asset.category} · {asset.assetId}</p>
        </div>
        <span className="shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold" style={{ color: st.color, backgroundColor: `${st.color}1F` }}>{st.label}</span>
      </div>
      <dl className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
        {asset.manufacturer ? <Line label="Make" value={`${asset.manufacturer}${asset.model ? ` ${asset.model}` : ""}`} /> : null}
        {asset.serialNumber ? <Line label="Serial" value={asset.serialNumber} /> : null}
        <Line label="Condition" value={asset.condition} />
        <Line label="Assigned" value={asset.assignedDate} />
        {asset.warrantyExpiry ? <Line label="Warranty" value={<span className="inline-flex items-center gap-1"><ShieldCheck className="h-3 w-3 text-emerald-500" />{asset.warrantyExpiry}</span>} /> : null}
      </dl>
      {canEdit ? (
        <div className="mt-3 flex items-center gap-2 border-t border-border/[0.06] pt-3">
          <label className="text-[11px] text-text-tertiary">Status</label>
          <select
            value={asset.status}
            onChange={(e) => onStatus(e.target.value as AssetStatus)}
            className="rounded-[8px] border border-border/[0.14] bg-surface px-2 py-1 text-xs text-text outline-none focus:border-primary-300"
          >
            {NEXT_STATUS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>
      ) : null}
    </div>
  );
}

function Line({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="text-text-tertiary">{label}</dt>
      <dd className="truncate font-medium text-text-secondary">{value}</dd>
    </div>
  );
}

function safeDate(iso: string): string {
  try {
    return format(parseISO(iso), "d MMM yyyy, h:mm a");
  } catch {
    return iso;
  }
}

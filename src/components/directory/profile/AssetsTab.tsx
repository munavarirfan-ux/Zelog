"use client";

import * as React from "react";
import { useMemo } from "react";
import { format, parseISO } from "date-fns";
import { History, Laptop, Monitor, Package, Plus, ShieldCheck, Smartphone, CreditCard } from "lucide-react";
import { useDirectoryStore } from "@/store/directoryStore";
import { ASSET_STATUS, type Asset, type AssetCategory, type AssetStatus } from "@/data/directoryData";
import { useCurrentUser } from "@/hooks/useCurrentUser";
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

export function AssetsTab({
  person,
  canEdit,
  nameById,
  onAssign,
}: {
  person: DirectoryPerson;
  canEdit: boolean;
  nameById: Map<string, string>;
  onAssign: () => void;
}) {
  const { currentUser } = useCurrentUser();
  const allAssets = useDirectoryStore((s) => s.assets);
  const updateAssetStatus = useDirectoryStore((s) => s.updateAssetStatus);

  const assets = useMemo(() => allAssets.filter((a) => a.employeeId === person.id), [allAssets, person.id]);

  // Merge every asset's history into one reverse-chronological timeline.
  const timeline = useMemo(() => {
    return assets
      .flatMap((a) => a.history.map((ev) => ({ ...ev, assetName: a.name })))
      .sort((x, y) => (x.at < y.at ? 1 : -1));
  }, [assets]);

  return (
    <div className="space-y-4">
      <Section
        title="Assigned Assets"
        icon={Laptop}
        action={canEdit ? (
          <button onClick={onAssign} className="inline-flex items-center gap-1.5 rounded-[10px] bg-primary-gradient px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:opacity-95">
            <Plus className="h-3.5 w-3.5" /> Assign Asset
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
    </div>
  );
}

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
          <p className="truncate text-sm font-semibold text-text">{asset.name}</p>
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

"use client";

import { Laptop, PackageCheck, ShieldCheck, Tag } from "lucide-react";
import {
  ASSET_CATEGORIES, ASSET_CONDITIONS, ASSET_STATUS,
  REQUESTABLE_ASSETS, REQUESTABLE_CATEGORIES,
} from "@/data/directoryData";

function Panel({ title, sub, icon: Icon, color = "#7A4DFF", children }: {
  title: string; sub?: string; icon: typeof Laptop; color?: string; children: React.ReactNode;
}) {
  return (
    <section className="rounded-card border border-border/[0.07] bg-surface p-6 shadow-card dark:border-white/[0.06]">
      <div className="mb-4 flex items-center gap-2.5">
        <span className="flex h-8 w-8 items-center justify-center rounded-[10px]" style={{ backgroundColor: `${color}18`, color }}>
          <Icon className="h-4 w-4" strokeWidth={2} />
        </span>
        <div className="min-w-0">
          <h3 className="text-[15px] font-semibold text-text">{title}</h3>
          {sub ? <p className="text-xs text-text-tertiary">{sub}</p> : null}
        </div>
      </div>
      {children}
    </section>
  );
}

function Chip({ label, color }: { label: string; color?: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-2 px-3 py-1 text-xs font-medium text-text-secondary">
      {color ? <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} /> : null}
      {label}
    </span>
  );
}

export function AssetSettings() {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-base font-semibold text-text">Assets</h2>
        <p className="mt-0.5 text-xs text-text-tertiary">Categories, condition grades, lifecycle statuses and the self-service request catalog.</p>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Panel title="Categories" sub="Types of asset the company tracks" icon={Tag} color="#8B5CF6">
          <div className="flex flex-wrap gap-2">
            {ASSET_CATEGORIES.map((c) => <Chip key={c} label={c} />)}
          </div>
        </Panel>

        <Panel title="Condition grades" sub="Used when assigning or returning an asset" icon={PackageCheck} color="#34D399">
          <div className="flex flex-wrap gap-2">
            {ASSET_CONDITIONS.map((c) => <Chip key={c} label={c} />)}
          </div>
        </Panel>

        <Panel title="Lifecycle statuses" sub="How an asset's state is labelled" icon={ShieldCheck} color="#38BDF8">
          <div className="flex flex-wrap gap-2">
            {Object.entries(ASSET_STATUS).map(([key, s]) => (
              <Chip key={key} label={s.label} color={s.color} />
            ))}
          </div>
        </Panel>

        <Panel title="Request catalog" sub="What employees can self-service" icon={Laptop} color="#F472B6">
          <div className="mb-3">
            <p className="mb-2 text-xs font-medium text-text-secondary">Requestable items</p>
            <div className="flex flex-wrap gap-2">
              {REQUESTABLE_ASSETS.map((a) => <Chip key={a.label} label={a.label} />)}
            </div>
          </div>
          <div>
            <p className="mb-2 text-xs font-medium text-text-secondary">Replaceable categories</p>
            <div className="flex flex-wrap gap-2">
              {REQUESTABLE_CATEGORIES.map((c) => <Chip key={c} label={c} />)}
            </div>
          </div>
        </Panel>
      </div>

      <div className="flex items-start gap-2 rounded-[12px] bg-surface-2/50 px-3 py-2.5">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-text-tertiary" />
        <p className="text-xs text-text-secondary"><span className="font-semibold text-text">Reference</span> — these option sets are defined in code and drive the Assets module. Shown here so admins can see what&apos;s configured.</p>
      </div>
    </div>
  );
}

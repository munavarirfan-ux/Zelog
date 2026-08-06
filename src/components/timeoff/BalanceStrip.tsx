"use client";

import type { BalanceRow } from "@/data/timeOffData";

export function BalanceStrip({ balances }: { balances: BalanceRow[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {balances.map((b) => (
        <div key={b.key} className="rounded-[14px] border border-border/[0.07] bg-surface p-4 shadow-card dark:border-white/[0.06]">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: b.color }} />
            <span className="truncate text-xs font-medium text-text-secondary">{b.label}</span>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-bold tabular-nums text-text">{b.available}</span>
            <span className="text-xs text-text-tertiary">/ {b.total} avail.</span>
          </div>
          <div className="mt-2 flex items-center gap-3 text-[11px] text-text-tertiary">
            <span>Used <span className="font-semibold text-text-secondary tabular-nums">{b.used}</span></span>
            <span>Pending <span className="font-semibold text-warning tabular-nums">{b.pending}</span></span>
          </div>
        </div>
      ))}
    </div>
  );
}

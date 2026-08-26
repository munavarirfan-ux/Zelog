"use client";

import type { BalanceRow } from "@/data/timeOffData";

const dayLabel = (n: number) => `${n} day${n > 1 ? "s" : ""}`;

/** Donut ring — the colored arc is the still-available share of the annual quota. */
function BalanceDonut({ available, total, color }: { available: number; total: number; color: string }) {
  const r = 42;
  const c = 2 * Math.PI * r;
  const frac = total > 0 ? Math.min(1, Math.max(0, available / total)) : 0;
  return (
    <div className="relative mx-auto h-[132px] w-[132px]">
      <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
        <circle cx="50" cy="50" r={r} fill="none" stroke={`${color}26`} strokeWidth="9" />
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray={`${c * frac} ${c}`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-lg font-bold tabular-nums text-text">{available}</span>
        <span className="text-[11px] font-medium leading-tight text-text-secondary">Days<br />Available</span>
      </div>
    </div>
  );
}

function BalanceStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-text-tertiary">{label}</p>
      <p className="mt-0.5 text-sm font-medium text-text">{value}</p>
    </div>
  );
}

/** Ring-style leave balance cards (Available / Consumed / Annual Quota) shared by
 *  the Time Off page and the directory profile Leave tab. */
export function LeaveBalanceRings({
  balances,
  onViewDetails,
}: {
  balances: BalanceRow[];
  onViewDetails?: (key: string) => void;
}) {
  // Only show a ring for leave types that carry an annual quota (or have usage).
  const shown = balances.filter((b) => b.total > 0 || b.used > 0);

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {shown.map((b) => (
        <div key={b.key} className="rounded-[16px] border border-border/[0.07] bg-surface p-5">
          <div className="mb-3 flex items-center justify-between gap-2">
            <p className="truncate text-sm font-semibold text-text">{b.label}</p>
            {onViewDetails ? (
              <button
                onClick={() => onViewDetails(b.key)}
                className="shrink-0 text-xs font-medium text-primary-600 transition-colors hover:text-primary-700"
              >
                View details
              </button>
            ) : null}
          </div>
          <BalanceDonut available={b.available} total={b.total} color={b.color} />
          <div className="mt-4 grid grid-cols-2 gap-3 border-t border-border/[0.07] pt-3">
            <BalanceStat label="Available" value={dayLabel(b.available)} />
            <BalanceStat label="Consumed" value={dayLabel(b.used)} />
          </div>
          <div className="mt-3">
            <BalanceStat label="Annual Quota" value={dayLabel(b.total)} />
          </div>
        </div>
      ))}
    </div>
  );
}

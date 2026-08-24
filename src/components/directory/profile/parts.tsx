"use client";

import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/** A titled white section card used across profile tabs. */
export function Section({
  title,
  icon: Icon,
  tint = "#7A4DFF",
  action,
  className,
  children,
}: {
  title: string;
  icon?: LucideIcon;
  tint?: string;
  action?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={cn("rounded-[18px] border border-border/[0.08] bg-surface p-5 shadow-[0_1px_2px_rgba(40,30,90,0.04)]", className)}>
      <div className="mb-4 flex items-center gap-2.5">
        {Icon ? (
          <span className="flex h-8 w-8 items-center justify-center rounded-[10px]" style={{ backgroundColor: `${tint}18`, color: tint }}>
            <Icon className="h-[17px] w-[17px]" strokeWidth={2} />
          </span>
        ) : null}
        <h3 className="flex-1 text-[15px] font-semibold tracking-tight text-text">{title}</h3>
        {action}
      </div>
      {children}
    </section>
  );
}

/** Label/value grid used for info blocks. */
export function InfoGrid({ children, cols = 2 }: { children: React.ReactNode; cols?: 1 | 2 | 3 }) {
  return <dl className={cn("grid gap-x-6 gap-y-4", cols === 1 ? "grid-cols-1" : cols === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2")}>{children}</dl>;
}

export function Info({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="text-[11px] font-medium uppercase tracking-wide text-text-tertiary">{label}</dt>
      <dd className="mt-1 break-words text-sm font-medium text-text">{value || <span className="text-text-tertiary">—</span>}</dd>
    </div>
  );
}

/** Small metric tile. */
export function Metric({ label, value, sub, color = "#7A4DFF" }: { label: string; value: React.ReactNode; sub?: string; color?: string }) {
  return (
    <div className="rounded-[14px] border border-border/[0.07] bg-surface p-3.5">
      <p className="text-[11px] font-medium text-text-tertiary">{label}</p>
      <p className="mt-1 text-xl font-bold leading-none tabular-nums" style={{ color }}>{value}</p>
      {sub ? <p className="mt-1 text-[11px] text-text-tertiary">{sub}</p> : null}
    </div>
  );
}

/** Empty-state row inside a section. */
export function Empty({ children }: { children: React.ReactNode }) {
  return <p className="py-6 text-center text-sm text-text-tertiary">{children}</p>;
}

/** Small pill button (secondary action). */
export function PillButton({ children, onClick, disabled }: { children: React.ReactNode; onClick?: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center gap-1.5 rounded-[10px] bg-primary-gradient px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:opacity-95 disabled:opacity-40"
    >
      {children}
    </button>
  );
}

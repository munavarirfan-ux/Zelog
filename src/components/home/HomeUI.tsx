"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/** Section tint palette (very subtle surfaces + colorful accents). */
export const TINT = {
  leave: "#F472B6",
  wfh: "#38BDF8",
  joiners: "#34D399",
  holidays: "#8B7CF6",
  anniversary: "#FBBF24",
  attention: "#FB923C",
  activity: "#A78BFA",
  availability: "#22D3EE",
  insights: "#7A4DFF",
  present: "#34D399",
  pending: "#8B7CF6",
} as const;

/* ── Panel card ── */

interface PanelCardProps {
  title: string;
  icon: LucideIcon;
  tint: string;
  action?: { label: string; href: string };
  headerRight?: React.ReactNode;
  isEmpty?: boolean;
  emptyMessage?: string;
  emptyIcon?: LucideIcon;
  className?: string;
  children?: React.ReactNode;
}

/** Premium tinted section card: soft tint surface, gradient icon chip, hover lift. */
export function PanelCard({
  title,
  icon: Icon,
  tint,
  action,
  headerRight,
  isEmpty,
  emptyMessage,
  emptyIcon: EmptyIcon,
  className,
  children,
}: PanelCardProps) {
  return (
    <section
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-[22px] border border-border/[0.07] bg-surface p-5 transition-all duration-200 ease-out dark:border-white/[0.06]",
        "shadow-[0_1px_2px_rgba(40,30,90,0.04)] hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-20px_rgba(49,46,129,0.35)]",
        className,
      )}
    >
      {/* gradient header accent */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-24 opacity-60"
        style={{ background: `radial-gradient(120% 80% at 0% 0%, ${tint}26 0%, transparent 60%)` }}
      />
      <div className="relative mb-4 flex items-center gap-3">
        <span
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px] text-white shadow-sm transition-transform duration-200 group-hover:scale-105"
          style={{ background: `linear-gradient(135deg, ${tint}, ${tint}B3)` }}
          aria-hidden
        >
          <Icon className="h-[18px] w-[18px]" strokeWidth={2} />
        </span>
        <h2 className="min-w-0 flex-1 truncate text-[15px] font-semibold tracking-tight text-text">{title}</h2>
        {headerRight}
        {action ? (
          <Link
            href={action.href}
            className="inline-flex shrink-0 items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-primary-600 transition-colors hover:bg-white/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400/40"
          >
            {action.label}
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        ) : null}
      </div>

      {isEmpty ? (
        <div className="relative flex flex-1 flex-col items-center justify-center gap-3 px-4 py-8 text-center">
          {EmptyIcon ? (
            <span
              className="flex h-12 w-12 items-center justify-center rounded-2xl"
              style={{ color: tint, backgroundColor: `${tint}1A` }}
              aria-hidden
            >
              <EmptyIcon className="h-6 w-6" strokeWidth={1.75} />
            </span>
          ) : null}
          <p className="text-sm text-text-tertiary">{emptyMessage}</p>
        </div>
      ) : (
        <div className="relative flex-1">{children}</div>
      )}
    </section>
  );
}

/* ── Animated counter ── */

export function CountUp({ value, className }: { value: number; className?: string }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef(0);

  useEffect(() => {
    const from = ref.current;
    const to = value;
    if (from === to) return;
    // Respect the OS "Reduce motion" preference — skip the count animation.
    if (typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      setDisplay(to);
      ref.current = to;
      return;
    }
    const duration = 650;
    let raf = 0;
    let start: number | null = null;
    const step = (ts: number) => {
      if (start === null) start = ts;
      const t = Math.min(1, (ts - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const current = Math.round(from + (to - from) * eased);
      setDisplay(current);
      ref.current = current;
      if (t < 1) raf = requestAnimationFrame(step);
      else ref.current = to;
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value]);

  return <span className={cn("tabular-nums", className)}>{display}</span>;
}

/* ── Radial percentage ring ── */

export function RadialStat({ percent, color, size = 56, children }: { percent: number; color: string; size?: number; children?: React.ReactNode }) {
  const p = Math.max(0, Math.min(100, percent));
  return (
    <span
      className="relative flex shrink-0 items-center justify-center rounded-full"
      style={{
        width: size,
        height: size,
        background: `conic-gradient(${color} ${p * 3.6}deg, ${color}22 0deg)`,
      }}
      aria-hidden
    >
      <span
        className="flex items-center justify-center rounded-full bg-surface"
        style={{ width: size - 12, height: size - 12 }}
      >
        {children}
      </span>
    </span>
  );
}

/* ── Progress bar ── */

export function ProgressBar({ percent, color }: { percent: number; color: string }) {
  const p = Math.max(0, Math.min(100, percent));
  return (
    <span className="block h-2 w-full overflow-hidden rounded-full" style={{ backgroundColor: `${color}22` }}>
      <span
        className="block h-full rounded-full transition-[width] duration-700 ease-out"
        style={{ width: `${p}%`, background: `linear-gradient(90deg, ${color}, ${color}CC)` }}
      />
    </span>
  );
}

/* ── Sparkline ── */

export function Sparkline({ data, color, width = 104, height = 34 }: { data: number[]; color: string; width?: number; height?: number }) {
  if (data.length < 2) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const step = width / (data.length - 1);
  const pts = data.map((v, i) => [i * step, height - ((v - min) / range) * (height - 6) - 3]);
  const line = pts.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const area = `${line} L${width},${height} L0,${height} Z`;
  const id = `spark-${color.replace("#", "")}`;
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible" aria-hidden>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.28" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${id})`} />
      <path d={line} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r={2.5} fill={color} />
    </svg>
  );
}

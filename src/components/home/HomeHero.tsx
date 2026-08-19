"use client";

import { CalendarPlus, Laptop, TrendingDown, TrendingUp, type LucideIcon } from "lucide-react";
import { CountUp } from "./HomeUI";

export interface KpiItem {
  label: string;
  count: number;
  delta: number; // percent, +/-
  icon: LucideIcon;
  color: string;
}

function greetingFor(hour: number): string {
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

interface HomeHeroProps {
  firstName: string;
  hour: number;
  onApplyLeave: () => void;
  onApplyWfh: () => void;
  kpis: KpiItem[];
}

export function HomeHero({ firstName, hour, onApplyLeave, onApplyWfh, kpis }: HomeHeroProps) {
  return (
    <section className="relative overflow-hidden rounded-[28px] bg-hero px-6 py-7 text-white shadow-[0_30px_80px_-32px_rgba(49,46,129,0.65)] sm:px-8 sm:py-8">
      {/* Mesh gradient glow */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -right-16 -top-24 h-72 w-72 rounded-full bg-[#B197FF]/30 blur-[90px]" />
        <div className="absolute right-1/3 top-1/2 h-64 w-64 rounded-full bg-[#5B8DEF]/25 blur-[90px]" />
        <div className="absolute -bottom-24 left-1/4 h-64 w-64 rounded-full bg-[#7A4DFF]/25 blur-[90px]" />
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{ backgroundImage: "radial-gradient(circle at 1px 1px, #fff 1px, transparent 0)", backgroundSize: "22px 22px" }}
        />
      </div>

      <div className="relative">
        {/* Greeting + actions */}
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-sm font-medium text-white/60">{greetingFor(hour)},</p>
            <h1 className="mt-0.5 text-[26px] font-semibold leading-tight tracking-tight sm:text-[30px]">
              {firstName} 👋
            </h1>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap">
            <HeroAction icon={CalendarPlus} label="Apply Leave" onClick={onApplyLeave} primary />
            <HeroAction icon={Laptop} label="Apply WFH" onClick={onApplyWfh} />
          </div>
        </div>

        {/* KPI tiles */}
        <div className="mt-6 grid grid-cols-2 gap-3 border-t border-white/10 pt-6 sm:grid-cols-4">
          {kpis.map((k) => (
            <HeroKpi key={k.label} {...k} />
          ))}
        </div>
      </div>
    </section>
  );
}

function HeroAction({
  icon: Icon,
  label,
  onClick,
  primary,
}: {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  primary?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "inline-flex min-h-[46px] items-center justify-center gap-2 rounded-[14px] px-5 text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 active:scale-[0.98] " +
        (primary
          ? "bg-white text-primary-700 shadow-[0_8px_24px_-8px_rgba(0,0,0,0.4)] hover:bg-white/90"
          : "border border-white/20 bg-white/10 text-white backdrop-blur hover:bg-white/20")
      }
    >
      <Icon className="h-[18px] w-[18px]" strokeWidth={2} />
      {label}
    </button>
  );
}

function HeroKpi({ label, count, delta, icon: Icon, color }: KpiItem) {
  const up = delta >= 0;
  const Trend = up ? TrendingUp : TrendingDown;
  return (
    <div className="group rounded-[16px] border border-white/15 bg-white/10 p-3.5 backdrop-blur transition-colors hover:bg-white/[0.15]">
      <div className="flex items-center justify-between">
        <span
          className="flex h-8 w-8 items-center justify-center rounded-[10px] text-white shadow-sm transition-transform duration-200 group-hover:scale-105"
          style={{ background: `linear-gradient(135deg, ${color}, ${color}B3)` }}
          aria-hidden
        >
          <Icon className="h-[17px] w-[17px]" strokeWidth={2} />
        </span>
        <span
          className={
            "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[11px] font-semibold " +
            (up ? "bg-emerald-400/20 text-emerald-200" : "bg-rose-400/20 text-rose-200")
          }
        >
          <Trend className="h-3 w-3" strokeWidth={2.5} />
          {up ? "+" : ""}
          {delta.toFixed(2)}%
        </span>
      </div>
      <div className="mt-3">
        <CountUp value={count} className="text-2xl font-bold leading-none text-white" />
      </div>
      <p className="mt-1 text-xs font-medium text-white/70">{label}</p>
    </div>
  );
}

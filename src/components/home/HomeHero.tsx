"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Building2, CalendarPlus, ChevronDown, FolderPlus, Laptop, Plus, TrendingDown, TrendingUp, UserPlus, type LucideIcon } from "lucide-react";
import { CountUp } from "./HomeUI";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
  /** Override the default Apply Leave / Apply WFH buttons (e.g. Quick Add for super admins). */
  actions?: React.ReactNode;
}

export function HomeHero({ firstName, hour, onApplyLeave, onApplyWfh, kpis, actions }: HomeHeroProps) {
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
        {/* Greeting + clock + actions */}
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-[26px] font-semibold leading-tight tracking-tight sm:text-[30px]">
              {greetingFor(hour)}, {firstName} 👋
            </h1>
            <HeroClock />
          </div>
          <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap sm:justify-end">
            {actions ?? (
              <>
                <HeroAction icon={CalendarPlus} label="Apply Leave" onClick={onApplyLeave} primary />
                <HeroAction icon={Laptop} label="Apply WFH" onClick={onApplyWfh} />
              </>
            )}
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

/* ── Live clock: current day, date & time ── */

function HeroClock() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  // Render nothing until mounted to avoid a server/client time mismatch.
  if (!now) return <div className="mt-3 h-[52px]" aria-hidden />;

  return (
    <div className="mt-3 text-left">
      <p className="text-xs font-medium uppercase tracking-wide text-white/55">
        {format(now, "EEEE")} · {format(now, "d MMM yyyy")}
      </p>
      <p className="mt-0.5 text-3xl font-bold leading-none tabular-nums text-white">
        {format(now, "hh:mm")}
        <span className="text-lg font-semibold text-white/70">:{format(now, "ss")} {format(now, "a")}</span>
      </p>
    </div>
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

/* ── Quick Add dropdown (super admins) ── */

export type QuickAddKind = "employee" | "holiday" | "client" | "project";

const QUICK_ADD_ITEMS: { kind: QuickAddKind; label: string; icon: LucideIcon }[] = [
  { kind: "employee", label: "New Employee", icon: UserPlus },
  { kind: "holiday", label: "New Holiday", icon: CalendarPlus },
  { kind: "client", label: "New Client", icon: Building2 },
  { kind: "project", label: "New Project", icon: FolderPlus },
];

export function HeroQuickAdd({ onSelect }: { onSelect: (kind: QuickAddKind) => void }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="inline-flex min-h-[46px] items-center justify-center gap-2 rounded-[14px] bg-white px-5 text-sm font-semibold text-primary-700 shadow-[0_8px_24px_-8px_rgba(0,0,0,0.4)] transition-all duration-200 hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 active:scale-[0.98]"
        >
          <Plus className="h-[18px] w-[18px]" strokeWidth={2.5} />
          Quick Add
          <ChevronDown className="h-4 w-4 opacity-70" strokeWidth={2.5} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="!min-w-[13rem]">
        <DropdownMenuLabel>Quick add</DropdownMenuLabel>
        {QUICK_ADD_ITEMS.map((item) => (
          <DropdownMenuItem key={item.kind} onClick={() => onSelect(item.kind)}>
            <item.icon className="h-4 w-4 text-text-tertiary" strokeWidth={2} />
            {item.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function HeroKpi({ label, count, delta, icon: Icon, color }: KpiItem) {
  const up = delta >= 0;
  const Trend = up ? TrendingUp : TrendingDown;
  return (
    <div className="group rounded-[16px] border border-white/15 bg-white/10 p-3.5 backdrop-blur transition-colors hover:bg-white/[0.15]">
      <div className="flex items-center justify-between">
        <span
          className="flex h-8 w-8 items-center justify-center rounded-[10px] border border-white/15 bg-white/10 text-white transition-transform duration-200 group-hover:scale-105"
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

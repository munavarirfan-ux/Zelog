"use client";

import * as React from "react";
import MuiTooltip from "@mui/material/Tooltip";
import {
  Battery, CheckCircle2, ChevronRight, Circle, Coffee, LogIn, LogOut, MapPin, Navigation, ShieldCheck, XCircle,
  type LucideIcon,
} from "lucide-react";
import {
  SEGMENT_COLORS, SEGMENT_LABELS, STATUS,
  type AttendanceSegment, type DayStatus, type TimelineEvent, type TimelineKind,
} from "@/data/attendanceData";
import { cn } from "@/lib/utils";

/* ── Premium white card ── */

export function ACard({
  title,
  subtitle,
  icon: Icon,
  tint = "#7A4DFF",
  action,
  className,
  bodyClassName,
  children,
}: {
  title?: string;
  subtitle?: string;
  icon?: LucideIcon;
  tint?: string;
  action?: React.ReactNode;
  className?: string;
  bodyClassName?: string;
  children?: React.ReactNode;
}) {
  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-[22px] border border-border/[0.07] bg-surface p-5 shadow-[0_1px_2px_rgba(40,30,90,0.04)] dark:border-white/[0.06]",
        className,
      )}
    >
      {title ? (
        <div className="mb-4 flex items-center gap-3">
          {Icon ? (
            <span
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px] text-white shadow-sm"
              style={{ background: `linear-gradient(135deg, ${tint}, ${tint}B3)` }}
              aria-hidden
            >
              <Icon className="h-[18px] w-[18px]" strokeWidth={2} />
            </span>
          ) : null}
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-[15px] font-semibold tracking-tight text-text">{title}</h3>
            {subtitle ? <p className="truncate text-xs text-text-tertiary">{subtitle}</p> : null}
          </div>
          {action}
        </div>
      ) : null}
      <div className={bodyClassName}>{children}</div>
    </section>
  );
}

/* ── Status + verification pills ── */

export function StatusPill({ status, className }: { status: DayStatus; className?: string }) {
  const s = STATUS[status];
  return (
    <span
      className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold", className)}
      style={{ color: s.color, backgroundColor: `${s.color}1F` }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: s.color }} />
      {s.label}
    </span>
  );
}

export function VerifyBadge({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold",
        ok ? "bg-[#34D3991F] text-[#0F9E6E]" : "bg-surface-2 text-text-tertiary",
      )}
    >
      {ok ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
      {label}
    </span>
  );
}

/* ── KPI card ── */

export function KpiCard({
  icon: Icon,
  label,
  value,
  sub,
  color,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  value: React.ReactNode;
  sub?: string;
  color: string;
  onClick?: () => void;
}) {
  const Tag = onClick ? "button" : "div";
  return (
    <Tag
      onClick={onClick}
      className={cn(
        "group flex flex-col rounded-[18px] border border-border/[0.07] bg-surface p-4 text-left shadow-[0_1px_2px_rgba(40,30,90,0.04)] transition-all",
        onClick && "hover:-translate-y-0.5 hover:shadow-[0_14px_30px_-18px_rgba(49,46,129,0.35)]",
      )}
    >
      <span
        className="flex h-9 w-9 items-center justify-center rounded-[11px] text-white shadow-sm"
        style={{ background: `linear-gradient(135deg, ${color}, ${color}B3)` }}
        aria-hidden
      >
        <Icon className="h-[18px] w-[18px]" strokeWidth={2} />
      </span>
      <span className="mt-3 text-2xl font-bold leading-none text-text">{value}</span>
      <span className="mt-1 text-xs font-medium text-text-secondary">{label}</span>
      {sub ? <span className="mt-0.5 text-[11px] text-text-tertiary">{sub}</span> : null}
    </Tag>
  );
}

/* ── Compact stat tile (dashboard KPI grids + summary strips) ── */

export function StatTile({
  label,
  value,
  color,
  icon: Icon,
  sub,
  onClick,
  active,
}: {
  label: string;
  value: React.ReactNode;
  color: string;
  icon?: LucideIcon;
  sub?: string;
  onClick?: () => void;
  active?: boolean;
}) {
  const Tag = onClick ? "button" : "div";
  return (
    <Tag
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 rounded-[16px] border bg-surface px-3.5 py-3 text-left shadow-[0_1px_2px_rgba(40,30,90,0.04)] transition-all",
        active ? "border-transparent ring-2" : "border-border/[0.07]",
        onClick && "hover:-translate-y-0.5 hover:shadow-[0_10px_24px_-16px_rgba(49,46,129,0.35)]",
      )}
      style={active ? ({ ["--tw-ring-color" as string]: color } as React.CSSProperties) : undefined}
    >
      {Icon ? (
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[11px]" style={{ backgroundColor: `${color}18`, color }} aria-hidden>
          <Icon className="h-[18px] w-[18px]" strokeWidth={2} />
        </span>
      ) : (
        <span className="h-9 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: color }} aria-hidden />
      )}
      <div className="min-w-0">
        <p className="text-xl font-bold leading-none tabular-nums text-text">{value}</p>
        <p className="mt-1 truncate text-xs font-medium text-text-secondary">{label}</p>
        {sub ? <p className="mt-0.5 truncate text-[11px] text-text-tertiary">{sub}</p> : null}
      </div>
    </Tag>
  );
}

/* ── Rich horizontal attendance timeline bar (color-coded, hover reveals event) ── */

export function TimelineBar({ segments, height = 26 }: { segments: AttendanceSegment[]; height?: number }) {
  if (!segments || segments.length === 0) {
    return <span className="block w-full rounded-full bg-surface-2" style={{ height }} />;
  }
  return (
    <div className="relative w-full overflow-hidden rounded-full bg-surface-2" style={{ height }}>
      {segments.map((seg, i) => (
        <MuiTooltip
          key={i}
          arrow
          placement="top"
          title={
            <span className="text-[11px] leading-tight">
              <span className="font-semibold">{SEGMENT_LABELS[seg.kind]}</span>
              <br />
              {seg.time}
            </span>
          }
        >
          <span
            className="absolute top-0 h-full cursor-pointer transition-opacity hover:opacity-80"
            style={{
              left: `${seg.start}%`,
              width: `${Math.max(seg.end - seg.start, 1)}%`,
              backgroundColor: SEGMENT_COLORS[seg.kind],
              borderRight: i < segments.length - 1 ? "1px solid rgb(var(--surface-rgb))" : undefined,
            }}
          />
        </MuiTooltip>
      ))}
    </div>
  );
}

/* ── Timeline ── */

const TL_CONFIG: Record<TimelineKind, { icon: LucideIcon; color: string }> = {
  "check-in": { icon: LogIn, color: "#34D399" },
  "break-start": { icon: Coffee, color: "#FB923C" },
  "break-end": { icon: Navigation, color: "#38BDF8" },
  "check-out": { icon: LogOut, color: "#8B7CF6" },
};

export function Timeline({ events }: { events: TimelineEvent[] }) {
  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
        <Circle className="h-6 w-6 text-text-tertiary" />
        <p className="text-sm text-text-tertiary">No activity yet today</p>
      </div>
    );
  }
  return (
    <ol className="relative ml-1">
      {events.map((e, i) => {
        const cfg = TL_CONFIG[e.kind];
        const Icon = cfg.icon;
        const last = i === events.length - 1;
        return (
          <li key={i} className="relative flex gap-3 pb-5 last:pb-0">
            {!last ? <span className="absolute left-[15px] top-8 h-[calc(100%-1rem)] w-px bg-border/[0.12]" aria-hidden /> : null}
            <span
              className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white shadow-sm"
              style={{ background: `linear-gradient(135deg, ${cfg.color}, ${cfg.color}CC)` }}
            >
              <Icon className="h-4 w-4" strokeWidth={2} />
            </span>
            <div className="min-w-0 flex-1 pt-0.5">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-text">{e.label}</p>
                <span className="shrink-0 text-xs font-medium tabular-nums text-text-secondary">{e.time}</span>
              </div>
              {e.detail ? <p className="mt-0.5 truncate text-xs text-text-tertiary">{e.detail}</p> : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

/* ── Donut chart ── */

export function Donut({
  segments,
  size = 132,
  thickness = 16,
  centerLabel,
  centerSub,
}: {
  segments: { label: string; value: number; color: string }[];
  size?: number;
  thickness?: number;
  centerLabel?: React.ReactNode;
  centerSub?: string;
}) {
  const total = segments.reduce((s, x) => s + x.value, 0) || 1;
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  let offset = 0;
  return (
    <div className="flex items-center gap-5">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgb(var(--border-rgb)/0.1)" strokeWidth={thickness} />
          {segments.map((seg, i) => {
            const len = (seg.value / total) * c;
            const el = (
              <circle
                key={i}
                cx={size / 2}
                cy={size / 2}
                r={r}
                fill="none"
                stroke={seg.color}
                strokeWidth={thickness}
                strokeDasharray={`${len} ${c - len}`}
                strokeDashoffset={-offset}
                strokeLinecap="round"
              />
            );
            offset += len;
            return el;
          })}
        </svg>
        {centerLabel != null ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold leading-none text-text">{centerLabel}</span>
            {centerSub ? <span className="mt-0.5 text-[11px] text-text-tertiary">{centerSub}</span> : null}
          </div>
        ) : null}
      </div>
      <ul className="space-y-2">
        {segments.map((seg) => (
          <li key={seg.label} className="flex items-center gap-2 text-sm">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: seg.color }} />
            <span className="text-text-secondary">{seg.label}</span>
            <span className="ml-auto font-semibold tabular-nums text-text">{seg.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ── Grouped bar chart (office vs wfh vs client trend) ── */

export function GroupedBars({
  data,
  keys,
  max,
}: {
  data: { label: string; [k: string]: number | string }[];
  keys: { key: string; color: string; label: string }[];
  max?: number;
}) {
  const top = (max ?? Math.max(...data.flatMap((d) => keys.map((k) => Number(d[k.key]))))) || 1;
  return (
    <div>
      <div className="flex items-end justify-between gap-3" style={{ height: 150 }}>
        {data.map((d) => (
          <div key={d.label} className="flex h-full flex-1 flex-col items-center gap-1.5">
            <div className="flex w-full flex-1 items-end justify-center gap-1">
              {keys.map((k) => (
                <div
                  key={k.key}
                  className="w-2.5 rounded-t-[4px] transition-[height] duration-500"
                  style={{ height: `${(Number(d[k.key]) / top) * 100}%`, background: `linear-gradient(180deg, ${k.color}, ${k.color}B3)` }}
                  title={`${k.label}: ${d[k.key]}`}
                />
              ))}
            </div>
            <span className="text-[11px] text-text-tertiary">{d.label}</span>
          </div>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-3">
        {keys.map((k) => (
          <span key={k.key} className="inline-flex items-center gap-1.5 text-[11px] text-text-secondary">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: k.color }} />
            {k.label}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ── Horizontal % bars (department attendance) ── */

export function BarList({ items }: { items: { label: string; pct: number; color: string }[] }) {
  return (
    <ul className="space-y-3">
      {items.map((it) => (
        <li key={it.label}>
          <div className="mb-1 flex items-center justify-between text-xs">
            <span className="font-medium text-text-secondary">{it.label}</span>
            <span className="font-semibold tabular-nums text-text">{it.pct}%</span>
          </div>
          <span className="block h-2 w-full overflow-hidden rounded-full" style={{ backgroundColor: `${it.color}22` }}>
            <span className="block h-full rounded-full transition-[width] duration-700" style={{ width: `${it.pct}%`, background: `linear-gradient(90deg, ${it.color}, ${it.color}CC)` }} />
          </span>
        </li>
      ))}
    </ul>
  );
}

/* ── Heatmap ── */

export function Heatmap({ data, color = "#7A4DFF" }: { data: number[][]; color?: string }) {
  const rows = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  return (
    <div className="flex gap-2">
      <div className="flex flex-col justify-between py-0.5 pr-1 text-[10px] text-text-tertiary">
        {rows.map((r) => <span key={r} className="h-3.5 leading-[14px]">{r}</span>)}
      </div>
      <div className="flex-1 space-y-1">
        {data.map((row, ri) => (
          <div key={ri} className="flex gap-1">
            {row.map((v, ci) => (
              <span
                key={ci}
                className="h-3.5 flex-1 rounded-[3px]"
                style={{ backgroundColor: v === 0 ? "rgb(var(--border-rgb)/0.08)" : color, opacity: v === 0 ? 1 : 0.25 + v * 0.19 }}
                title={`Intensity ${v}`}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Segmented sub navigation ── */

export interface SubNavItem {
  id: string;
  label: string;
  icon: LucideIcon;
}

export function SubNav({ items, value, onChange }: { items: SubNavItem[]; value: string; onChange: (id: string) => void }) {
  return (
    <div className="inline-flex max-w-full items-center gap-1 overflow-x-auto rounded-[14px] bg-surface-2 p-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {items.map((it) => {
        const active = it.id === value;
        return (
          <button
            key={it.id}
            type="button"
            onClick={() => onChange(it.id)}
            aria-current={active}
            className={cn(
              "shrink-0 rounded-[10px] px-4 py-1.5 text-sm font-medium transition-all duration-200",
              active
                ? "bg-surface text-text shadow-[0_1px_3px_rgba(40,30,90,0.12)]"
                : "text-text-tertiary hover:text-text-secondary",
            )}
          >
            {it.label}
          </button>
        );
      })}
    </div>
  );
}

/* ── Stylized map surface (no real map / geolocation) ── */

export interface MapPin {
  x: number; // 0–100 %
  y: number; // 0–100 %
  label: string;
  color: string;
  photo?: string;
}

export function MapSurface({
  pins,
  route,
  height = 300,
  className,
}: {
  pins: MapPin[];
  route?: { x: number; y: number }[];
  height?: number;
  className?: string;
}) {
  return (
    <div
      className={cn("relative overflow-hidden rounded-[18px] border border-border/[0.07]", className)}
      style={{
        height,
        backgroundColor: "#EEF1FA",
        backgroundImage:
          "radial-gradient(120% 120% at 10% 10%, rgba(122,77,255,0.08), transparent 45%), radial-gradient(120% 120% at 90% 90%, rgba(56,189,248,0.08), transparent 45%), linear-gradient(rgba(80,90,140,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(80,90,140,0.06) 1px, transparent 1px)",
        backgroundSize: "auto, auto, 34px 34px, 34px 34px",
      }}
    >
      {/* faux roads */}
      <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none" aria-hidden>
        <path d="M0,60 C120,20 260,120 400,70 S680,10 900,80" fill="none" stroke="rgba(120,130,170,0.18)" strokeWidth={10} />
        <path d="M120,0 C160,140 90,240 200,360" fill="none" stroke="rgba(120,130,170,0.14)" strokeWidth={8} />
      </svg>

      {route && route.length > 1 ? (
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
          <polyline
            points={route.map((p) => `${p.x},${p.y}`).join(" ")}
            fill="none"
            stroke="#7A4DFF"
            strokeWidth={0.8}
            strokeDasharray="2 1.4"
            strokeLinecap="round"
          />
        </svg>
      ) : null}

      {pins.map((p, i) => (
        <div key={i} className="absolute -translate-x-1/2 -translate-y-full" style={{ left: `${p.x}%`, top: `${p.y}%` }}>
          <div className="flex flex-col items-center">
            <span className="mb-1 whitespace-nowrap rounded-full bg-surface/95 px-2 py-0.5 text-[10px] font-semibold text-text shadow-sm backdrop-blur">
              {p.label}
            </span>
            {p.photo ? (
              <img src={p.photo} alt="" className="h-8 w-8 rounded-full border-2 object-cover shadow-md" style={{ borderColor: p.color }} />
            ) : (
              <span className="flex h-6 w-6 items-center justify-center rounded-full text-white shadow-md" style={{ backgroundColor: p.color }}>
                <MapPin className="h-3.5 w-3.5" strokeWidth={2.5} />
              </span>
            )}
            <span className="mt-0.5 h-2 w-2 rotate-45 rounded-[1px]" style={{ backgroundColor: p.color }} />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Small labeled meta row (used in detail panels) ── */

export function MetaRow({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[8px] bg-surface-2 text-text-tertiary">
        <Icon className="h-3.5 w-3.5" strokeWidth={2} />
      </span>
      <span className="text-xs text-text-tertiary">{label}</span>
      <span className="ml-auto truncate text-sm font-medium text-text">{value}</span>
    </div>
  );
}

export { Battery, ChevronRight, ShieldCheck };

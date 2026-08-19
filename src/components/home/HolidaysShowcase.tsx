"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, CalendarDays, CalendarHeart, MapPin } from "lucide-react";
import { getHolidayTheme } from "@/data/holidayThemes";
import { holidayMeta } from "@/data/homeData";
import type { Holiday } from "@/data/timeOffData";
import { cn } from "@/lib/utils";

function countdownLabel(daysAway: number): string {
  if (daysAway <= 0) return "Today";
  if (daysAway === 1) return "Tomorrow";
  return `${daysAway} Days Away`;
}

/**
 * Full-bleed festival photo. Stays invisible until it actually loads (so a slow
 * or blocked image never flashes a broken icon), and the dark/accent gradient
 * behind it remains the graceful fallback.
 */
/** Detect images that finished loading (e.g. from cache) before onLoad attached. */
function useImageState(src: string) {
  const [state, setState] = useState<"loading" | "ok" | "error">("loading");
  const ref = useRef<HTMLImageElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (el?.complete) setState(el.naturalWidth > 0 ? "ok" : "error");
  }, [src]);
  return { state, setState, ref };
}

function BannerImage({ src }: { src: string }) {
  const { state, setState, ref } = useImageState(src);
  if (state === "error") return null;
  return (
    <img
      ref={ref}
      src={src}
      alt=""
      aria-hidden
      onLoad={() => setState("ok")}
      onError={() => setState("error")}
      className={cn(
        "absolute inset-0 h-full w-full object-cover transition-[transform,opacity] duration-500 ease-out group-hover:scale-105",
        state === "ok" ? "opacity-100" : "opacity-0",
      )}
    />
  );
}

function Thumb({ src, accent }: { src: string; accent: string }) {
  const { state, setState, ref } = useImageState(src);
  return (
    <span
      className="relative h-11 w-11 shrink-0 overflow-hidden rounded-[10px]"
      style={{ background: `linear-gradient(135deg, ${accent}, ${accent}99)` }}
    >
      {state !== "error" ? (
        <img
          ref={ref}
          src={src}
          alt=""
          aria-hidden
          onLoad={() => setState("ok")}
          onError={() => setState("error")}
          className={cn("h-full w-full object-cover transition-opacity duration-300", state === "ok" ? "opacity-100" : "opacity-0")}
        />
      ) : null}
    </span>
  );
}

/* ── Featured banner ── */

function FeaturedHoliday({ holiday }: { holiday: Holiday }) {
  const theme = getHolidayTheme(holiday.name);
  const meta = holidayMeta(holiday.date);

  return (
    <Link
      href="/time-off"
      className="group relative min-h-[210px] flex-1 overflow-hidden rounded-[18px] transition-shadow duration-[250ms] hover:shadow-[0_20px_44px_-24px_rgba(49,46,129,0.5)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400/40"
      style={{ background: "linear-gradient(140deg, #2a2340, #14111f)" }}
      aria-label={`${holiday.name}, ${meta.dayName} ${meta.dateLabel}, ${countdownLabel(meta.daysAway)}`}
    >
      <BannerImage src={theme.image} />
      <div
        aria-hidden
        className="absolute inset-0"
        style={{ background: "linear-gradient(to top, rgba(10,8,20,0.86) 0%, rgba(10,8,20,0.42) 52%, rgba(10,8,20,0.12) 100%)" }}
      />

      <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/15 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur">
        {theme.type}
        {theme.region ? (
          <>
            <span className="text-white/60">·</span>
            <MapPin className="h-3 w-3" /> {theme.region}
          </>
        ) : null}
      </span>
      <span
        className="absolute right-4 top-4 rounded-full bg-white/95 px-3 py-1 text-xs font-bold transition-transform duration-[250ms] group-hover:scale-105"
        style={{ color: theme.badge }}
      >
        {countdownLabel(meta.daysAway)}
      </span>

      <div className="absolute inset-x-0 bottom-0 p-5 text-white">
        <h3 className="text-2xl font-bold tracking-tight drop-shadow-sm">{holiday.name}</h3>
        <p className="mt-1 flex items-center gap-1.5 text-sm text-white/85">
          <CalendarDays className="h-4 w-4" />
          {meta.dayName} · {meta.dateLabel}
        </p>
      </div>
    </Link>
  );
}

/* ── Compact row ── */

function CompactHoliday({ holiday }: { holiday: Holiday }) {
  const theme = getHolidayTheme(holiday.name);
  const meta = holidayMeta(holiday.date);
  return (
    <Link
      href="/time-off"
      className="flex items-center gap-3 rounded-[12px] border border-border/[0.06] p-2 transition-colors hover:bg-surface-2/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400/40"
    >
      <Thumb src={theme.image} accent={theme.accent} />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold text-text">{holiday.name}</span>
        <span className="block truncate text-xs text-text-tertiary">{meta.dayName} · {meta.dateLabel}</span>
      </span>
      <span
        className="shrink-0 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-semibold"
        style={{ color: theme.badge, backgroundColor: `${theme.badge}1A` }}
      >
        {countdownLabel(meta.daysAway)}
      </span>
    </Link>
  );
}

/* ── Section ── */

export function HolidaysShowcase({ holidays, className }: { holidays: Holiday[]; className?: string }) {
  const featured = holidays[0];
  const rest = holidays.slice(1, 4);

  return (
    <section className={`flex flex-col rounded-[22px] border border-border/[0.07] bg-surface p-5 shadow-card dark:border-white/[0.06] ${className ?? ""}`}>
      <div className="mb-4 flex items-center gap-3">
        <span
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px] text-white shadow-sm"
          style={{ background: "linear-gradient(135deg, #8B7CF6, #8B7CF6B3)" }}
          aria-hidden
        >
          <CalendarHeart className="h-[18px] w-[18px]" strokeWidth={2} />
        </span>
        <h2 className="flex-1 text-[15px] font-semibold tracking-tight text-text">Upcoming Holidays</h2>
        <Link
          href="/time-off"
          className="inline-flex shrink-0 items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-primary-600 transition-colors hover:bg-[rgba(122,77,255,0.06)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400/40"
        >
          View Calendar <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {featured ? (
        <div className="flex flex-1 flex-col gap-3 overflow-hidden">
          <FeaturedHoliday holiday={featured} />
          {rest.length > 0 ? (
            <div className="space-y-2">
              {rest.map((h) => (
                <CompactHoliday key={h.date} holiday={h} />
              ))}
            </div>
          ) : null}
        </div>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[rgba(122,77,255,0.08)] text-primary-500">
            <CalendarHeart className="h-7 w-7" strokeWidth={1.5} />
          </span>
          <p className="text-sm text-text-tertiary">No upcoming holidays</p>
        </div>
      )}
    </section>
  );
}

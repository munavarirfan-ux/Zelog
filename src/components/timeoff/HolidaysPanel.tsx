"use client";

import { useEffect, useMemo, useState } from "react";
import { differenceInCalendarDays, format, parseISO } from "date-fns";
import { Check, MapPin, Sparkles } from "lucide-react";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import type { Holiday, HolidayCalendar } from "@/data/timeOffData";

// Soft, decorative badge palette — assigned deterministically per holiday so the
// grid reads as a colorful calendar (like a printed holiday list) rather than a table.
type Hue = { head: string; body: string; ink: string; soft: string; line: string };
const HUES: Hue[] = [
  { head: "#5FB3B8", body: "#DBEEEF", ink: "#0E7490", soft: "#F1F9F9", line: "#CFE8E9" }, // teal
  { head: "#7BA9E3", body: "#DEEAF9", ink: "#2563EB", soft: "#F1F5FD", line: "#D6E4F8" }, // blue
  { head: "#E4B84D", body: "#FBF0D2", ink: "#B7791F", soft: "#FBF6E7", line: "#F0E3BC" }, // amber
  { head: "#E37B7B", body: "#F9DFDF", ink: "#DC2626", soft: "#FDF1F1", line: "#F5D2D2" }, // red
  { head: "#A48FDD", body: "#E8E1F7", ink: "#7C3AED", soft: "#F4F0FC", line: "#DED2F3" }, // violet
];
const TAN: Hue = { head: "#BFB19A", body: "#ECE6DB", ink: "#8A7B63", soft: "#F6F3ED", line: "#E3DACB" }; // optional

function hueFor(date: string, optional?: boolean): Hue {
  if (optional) return TAN;
  const month = parseInt(date.slice(5, 7), 10) || 1;
  return HUES[month % HUES.length];
}

const QUARTERS = [
  { label: "Jan – Mar", tag: "Q1", months: [1, 2, 3] },
  { label: "Apr – Jun", tag: "Q2", months: [4, 5, 6] },
  { label: "Jul – Sep", tag: "Q3", months: [7, 8, 9] },
  { label: "Oct – Dec", tag: "Q4", months: [10, 11, 12] },
];

function countdownLabel(days: number): string {
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  return `in ${days} days`;
}

/**
 * View-only holiday browser. Management lives in Settings → Time Off → Holiday Calendar.
 * Shows the calendar mapped to the viewer's office by default, with a switcher to
 * browse other locations/countries.
 */
export function HolidaysPanel({ calendars, initialCalendarId }: {
  calendars: HolidayCalendar[];
  initialCalendarId?: string;
}) {
  const [selectedId, setSelectedId] = useState(
    () => initialCalendarId ?? calendars.find((c) => c.isDefault)?.id ?? calendars[0]?.id ?? "",
  );
  const selected = calendars.find((c) => c.id === selectedId) ?? calendars[0];
  const holidays = useMemo(() => selected?.holidays ?? [], [selected]);

  // Compute "today"-relative info only after mount to avoid SSR/hydration mismatch.
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => { setNow(new Date()); }, []);

  const daysAway = (h: Holiday) => (now ? differenceInCalendarDays(parseISO(h.date), now) : null);
  const nextHoliday = now ? holidays.find((h) => differenceInCalendarDays(parseISO(h.date), now) >= 0) : undefined;
  const optionalCount = holidays.filter((h) => h.optional).length;
  const upcomingCount = now ? holidays.filter((h) => differenceInCalendarDays(parseISO(h.date), now) >= 0).length : 0;

  if (!selected) {
    return <p className="py-8 text-center text-sm text-text-tertiary">No holiday calendars configured.</p>;
  }

  return (
    <div className="space-y-5">
      {/* ── Location / country switcher ───────────────────────────── */}
      {calendars.length > 1 && (
        <div className="flex flex-wrap items-center gap-2.5 rounded-[14px] border border-border/[0.06] bg-surface px-3.5 py-2.5 shadow-xs dark:border-white/[0.06]">
          <MapPin className="h-4 w-4 shrink-0 text-text-tertiary" />
          <span className="text-[13px] text-text-secondary">Showing holidays for</span>
          <Select value={selectedId} onValueChange={setSelectedId}>
            <SelectTrigger className="h-9 w-auto min-w-[190px] gap-2"><SelectValue /></SelectTrigger>
            <SelectContent>
              {calendars.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.flag} {c.name}{c.locations.length ? ` · ${c.locations.join(", ")}` : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* ── Next-holiday spotlight ────────────────────────────────── */}
      {nextHoliday && (() => {
        const nd = parseISO(nextHoliday.date);
        const d = daysAway(nextHoliday) ?? 0;
        const c = hueFor(nextHoliday.date, nextHoliday.optional);
        return (
          <div
            className="relative flex items-center justify-between gap-4 overflow-hidden rounded-[18px] border bg-surface p-5 shadow-card dark:bg-surface sm:p-6"
            style={{ borderColor: c.line }}
          >
            {/* accent wash tied to the holiday's own color, not the app theme */}
            <span className="pointer-events-none absolute inset-y-0 left-0 w-1.5" style={{ backgroundColor: c.head }} />
            <div className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full" style={{ backgroundColor: c.soft }} />
            <div className="relative min-w-0">
              <p className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.16em]" style={{ color: c.ink }}>
                <Sparkles className="h-3.5 w-3.5" /> Next holiday
              </p>
              <h3 className="mt-1.5 truncate text-xl font-bold text-text sm:text-2xl">{nextHoliday.name}</h3>
              <p className="mt-1 flex items-center gap-2 text-sm text-text-secondary">
                {format(nd, "EEEE, d MMMM yyyy")}
                {nextHoliday.optional && (
                  <span className="rounded-full px-2 py-0.5 text-[11px] font-medium" style={{ backgroundColor: TAN.body, color: TAN.ink }}>Optional</span>
                )}
              </p>
            </div>
            <div
              className="relative shrink-0 rounded-[16px] px-5 py-3 text-center"
              style={{ backgroundColor: c.body, color: c.ink }}
            >
              {d <= 1 ? (
                <div className="text-lg font-bold leading-tight">{d === 0 ? "Today" : "Tomorrow"}</div>
              ) : (
                <>
                  <div className="text-3xl font-bold leading-none tabular-nums">{d}</div>
                  <div className="mt-1 text-[11px] font-medium uppercase tracking-wide opacity-80">days away</div>
                </>
              )}
            </div>
          </div>
        );
      })()}

      {/* ── Holidays, grouped by quarter ──────────────────────────── */}
      <div className="rounded-[18px] border border-border/[0.07] bg-surface p-5 shadow-card dark:border-white/[0.06] sm:p-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
          <h3 className="inline-flex items-center gap-2 text-sm font-semibold text-text">
            <span className="text-base leading-none">{selected.flag}</span> {selected.name} holidays
          </h3>
          <div className="flex items-center gap-3 text-xs text-text-tertiary">
            <span><span className="font-semibold text-text-secondary">{holidays.length}</span> total</span>
            <span className="h-3 w-px bg-border/20" />
            <span><span className="font-semibold text-text-secondary">{optionalCount}</span> optional</span>
            {now && (
              <>
                <span className="h-3 w-px bg-border/20" />
                <span><span className="font-semibold text-text-secondary">{upcomingCount}</span> upcoming</span>
              </>
            )}
          </div>
        </div>

        {holidays.length === 0 ? (
          <p className="py-8 text-center text-sm text-text-tertiary">No holidays configured for this calendar.</p>
        ) : (
          <div className="space-y-7">
            {QUARTERS.map((q) => {
              const items = holidays.filter((h) => q.months.includes(parseInt(h.date.slice(5, 7), 10)));
              if (!items.length) return null;
              return (
                <section key={q.tag}>
                  <div className="mb-3 flex items-center gap-3">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-2 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-text-secondary dark:bg-white/[0.06]">
                      <span className="text-primary-500">{q.tag}</span> {q.label}
                    </span>
                    <span className="h-px flex-1 bg-border/[0.08] dark:bg-white/[0.06]" />
                    <span className="text-[11px] text-text-tertiary">{items.length}</span>
                  </div>

                  <div className="grid gap-2.5 sm:grid-cols-2">
                    {items.map((h) => {
                      const c = hueFor(h.date, h.optional);
                      const d = parseISO(h.date);
                      const away = daysAway(h);
                      const isPast = away !== null && away < 0;
                      const isNext = nextHoliday?.date === h.date;
                      return (
                        <div
                          key={h.date}
                          className={`group relative flex items-center gap-3.5 rounded-[14px] border p-2.5 pr-3 transition-all ${isPast ? "opacity-60" : "hover:-translate-y-0.5 hover:shadow-card"}`}
                          style={{
                            backgroundColor: isPast ? "transparent" : c.soft,
                            borderColor: isNext ? c.head : c.line,
                            boxShadow: isNext ? `0 0 0 1.5px ${c.head}` : undefined,
                          }}
                        >
                          {/* Colored date badge */}
                          <div className="w-[50px] shrink-0 overflow-hidden rounded-[10px] bg-white/70 text-center dark:bg-white/10">
                            <div className="py-0.5 text-[10px] font-bold uppercase tracking-wide text-white" style={{ backgroundColor: c.head }}>
                              {format(d, "MMM")}
                            </div>
                            <div className="py-1 text-[19px] font-bold leading-none tabular-nums" style={{ color: c.ink }}>
                              {format(d, "dd")}
                            </div>
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                              <span className="text-sm font-semibold text-text">{h.name}</span>
                              {h.optional && (
                                <span className="rounded-[5px] px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide" style={{ backgroundColor: TAN.body, color: TAN.ink }}>
                                  Optional
                                </span>
                              )}
                            </div>
                            <p className="mt-0.5 text-xs text-text-tertiary">{format(d, "EEEE")}</p>
                          </div>

                          {/* Status */}
                          {now && (
                            isPast ? (
                              <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-surface-2 px-2 py-0.5 text-[11px] font-medium text-text-tertiary dark:bg-white/[0.06]">
                                <Check className="h-3 w-3" /> Passed
                              </span>
                            ) : (
                              <span
                                className="shrink-0 whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-semibold"
                                style={{ backgroundColor: c.body, color: c.ink }}
                              >
                                {countdownLabel(away as number)}
                              </span>
                            )
                          )}
                        </div>
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

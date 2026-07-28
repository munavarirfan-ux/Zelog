"use client";

import { format } from "date-fns";
import { Play } from "lucide-react";
import { useTrackerStore } from "@/store/trackerStore";
import { useNow } from "@/hooks/useNow";
import { totalForDate, totalForRange } from "@/lib/trackerSelectors";
import { formatDuration, formatDurationShort, runningTimerElapsedSeconds } from "@/lib/time";
import { ProgressRing } from "@/components/ui/progress-ring";
import { Button } from "@/components/ui/button";

const WEEKLY_GOAL_HOURS = 40;

function greetingFor(now: Date): string {
  const h = now.getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

export function Hero({ onStartClick }: { onStartClick: () => void }) {
  const entries = useTrackerStore((s) => s.entries);
  const runningTimer = useTrackerStore((s) => s.runningTimer);
  const now = useNow(1000, Boolean(runningTimer && !runningTimer.isPaused));

  const todaySeconds = totalForDate(entries, format(now, "yyyy-MM-dd"));
  const weekSeconds = totalForRange(entries, "week", now);
  const weekHours = weekSeconds / 3600;
  const weekPercent = Math.min(100, Math.round((weekHours / WEEKLY_GOAL_HOURS) * 100));

  return (
    <section className="relative overflow-hidden rounded-shell bg-hero px-6 py-8 text-white shadow-[0_20px_60px_-20px_rgba(49,46,129,0.5)] sm:px-10 sm:py-10">
      <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-white/5 blur-3xl" />

      <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-medium text-white/70">{format(now, "EEEE, MMMM d")}</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">{greetingFor(now)}, Irfan</h1>
          <p className="mt-2 max-w-md text-sm text-white/70">
            {runningTimer
              ? `You're tracking "${runningTimer.task}" right now.`
              : todaySeconds > 0
                ? `You've logged ${formatDurationShort(todaySeconds)} today. Keep the momentum going.`
                : "Nothing logged yet today — start your first session below."}
          </p>

          {!runningTimer ? (
            <Button
              size="lg"
              onClick={onStartClick}
              className="mt-6 gap-2 bg-white text-accent-900 shadow-lg hover:bg-white/90"
            >
              <Play className="h-4 w-4 fill-current" /> Start Tracking
            </Button>
          ) : (
            <div className="mt-6 inline-flex items-center gap-3 rounded-full bg-white/10 px-5 py-2.5 backdrop-blur">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-300" />
              <span className="tabular-nums text-lg font-semibold">
                {formatDuration(runningTimerElapsedSeconds(runningTimer, now))}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-6 sm:gap-10">
          <div className="text-right">
            <p className="text-[11px] font-medium uppercase tracking-wider text-white/60">Today</p>
            <p className="text-3xl font-bold tabular-nums">{formatDurationShort(todaySeconds)}</p>
          </div>
          <ProgressRing value={weekPercent} size={104} strokeWidth={8} trackClassName="stroke-white/15" indicatorClassName="stroke-white">
            <span className="text-lg font-bold">{weekPercent}%</span>
            <span className="text-[10px] font-medium text-white/70">of {WEEKLY_GOAL_HOURS}h week</span>
          </ProgressRing>
        </div>
      </div>
    </section>
  );
}

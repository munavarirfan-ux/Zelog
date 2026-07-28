"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Pause, Play, Square } from "lucide-react";
import { useTrackerStore } from "@/store/trackerStore";
import { useNow } from "@/hooks/useNow";
import { formatDuration, runningTimerElapsedSeconds } from "@/lib/time";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function StickyMiniTimer() {
  const runningTimer = useTrackerStore((s) => s.runningTimer);
  const pauseTimer = useTrackerStore((s) => s.pauseTimer);
  const resumeTimer = useTrackerStore((s) => s.resumeTimer);
  const stopTimer = useTrackerStore((s) => s.stopTimer);
  const now = useNow(1000, Boolean(runningTimer && !runningTimer.isPaused));

  return (
    <AnimatePresence>
      {runningTimer ? (
        <motion.div
          initial={{ opacity: 0, x: 16, scale: 0.96 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 16, scale: 0.96 }}
          transition={{ type: "spring", stiffness: 340, damping: 30 }}
          className="flex items-center gap-2 rounded-full border border-accent/20 bg-accent/[0.06] py-1 pl-3 pr-1.5 shadow-glow"
        >
          <span
            className={cn(
              "h-2 w-2 shrink-0 rounded-full",
              runningTimer.isPaused ? "bg-text-tertiary" : "animate-pulse bg-accent",
            )}
          />
          <span className="max-w-[140px] truncate text-xs font-medium text-text sm:max-w-[200px]">
            {runningTimer.task}
          </span>
          <span className="tabular-nums text-sm font-semibold text-accent">
            {formatDuration(runningTimerElapsedSeconds(runningTimer, now))}
          </span>
          <div className="flex items-center gap-0.5">
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7"
              onClick={() => (runningTimer.isPaused ? resumeTimer() : pauseTimer())}
              aria-label={runningTimer.isPaused ? "Resume timer" : "Pause timer"}
            >
              {runningTimer.isPaused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7 text-danger hover:bg-danger/10 hover:text-danger"
              onClick={stopTimer}
              aria-label="Stop timer"
            >
              <Square className="h-3.5 w-3.5" />
            </Button>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

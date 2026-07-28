"use client";

import { useMemo } from "react";
import { format, isSameDay, isToday, subDays } from "date-fns";
import { cn } from "@/lib/utils";

interface DateStripProps {
  selectedDate: Date;
  onSelect: (date: Date) => void;
  daysBack?: number;
}

export function DateStrip({ selectedDate, onSelect, daysBack = 13 }: DateStripProps) {
  const today = useMemo(() => new Date(), []);
  const days = useMemo(() => {
    const arr: Date[] = [];
    for (let i = daysBack; i >= 0; i--) arr.push(subDays(today, i));
    return arr;
  }, [today, daysBack]);

  return (
    <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
      {days.map((d) => {
        const active = isSameDay(d, selectedDate);
        const todayMarker = isToday(d);
        return (
          <button
            key={d.toISOString()}
            type="button"
            onClick={() => onSelect(d)}
            className={cn(
              "flex w-14 shrink-0 flex-col items-center gap-0.5 rounded-[14px] border py-2 transition-all duration-150 ease-out",
              active
                ? "border-accent bg-accent text-white shadow-glow"
                : "border-border/10 bg-surface text-text-secondary hover:border-border/25 hover:bg-surface-2",
            )}
          >
            <span className={cn("text-[10px] font-medium uppercase tracking-wide", active ? "text-white/80" : "text-text-tertiary")}>
              {format(d, "EEE")}
            </span>
            <span className="text-base font-semibold">{format(d, "d")}</span>
            <span className={cn("h-1 w-1 rounded-full", todayMarker ? (active ? "bg-white" : "bg-accent") : "bg-transparent")} />
          </button>
        );
      })}
    </div>
  );
}

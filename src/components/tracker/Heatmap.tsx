"use client";

import { format, getDay, parseISO } from "date-fns";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import type { HeatmapCell } from "@/lib/trackerSelectors";
import { cn } from "@/lib/utils";

const LEVEL_CLASSES = ["bg-surface-3", "bg-accent/25", "bg-accent/50", "bg-accent/75", "bg-accent"];

export function Heatmap({ cells }: { cells: HeatmapCell[] }) {
  if (!cells.length) return null;

  const weeks: (HeatmapCell | null)[][] = [];
  let currentWeek: (HeatmapCell | null)[] = [];

  const firstDow = getDay(parseISO(cells[0].date));
  for (let i = 0; i < firstDow; i++) currentWeek.push(null);

  for (const cell of cells) {
    currentWeek.push(cell);
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }
  if (currentWeek.length) {
    while (currentWeek.length < 7) currentWeek.push(null);
    weeks.push(currentWeek);
  }

  return (
    <div className="flex items-start gap-3">
      <div className="no-scrollbar flex gap-[3px] overflow-x-auto">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-[3px]">
            {week.map((cell, di) =>
              cell ? (
                <HoverCard key={cell.date} openDelay={80}>
                  <HoverCardTrigger asChild>
                    <div className={cn("h-3 w-3 rounded-[3px] transition-transform hover:scale-125", LEVEL_CLASSES[cell.level])} />
                  </HoverCardTrigger>
                  <HoverCardContent className="w-auto p-2.5 text-xs">
                    <p className="font-medium text-text">{format(parseISO(cell.date), "MMM d, yyyy")}</p>
                    <p className="text-text-secondary">{cell.hours}h logged</p>
                  </HoverCardContent>
                </HoverCard>
              ) : (
                <div key={di} className="h-3 w-3" />
              ),
            )}
          </div>
        ))}
      </div>
      <div className="flex shrink-0 items-center gap-1 self-end pb-0.5 text-[10px] text-text-tertiary">
        Less
        {LEVEL_CLASSES.map((c) => (
          <span key={c} className={cn("h-2.5 w-2.5 rounded-[2px]", c)} />
        ))}
        More
      </div>
    </div>
  );
}

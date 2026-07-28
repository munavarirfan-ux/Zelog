"use client";

import { useState } from "react";
import { format, isToday, isYesterday, parseISO } from "date-fns";
import { motion } from "framer-motion";
import { ChevronDown, MoreHorizontal } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { SessionRow } from "./SessionRow";
import { formatDuration } from "@/lib/time";
import { cn } from "@/lib/utils";
import type { DayGroupData } from "@/lib/trackerSelectors";

function dayLabel(dateStr: string): string {
  const d = parseISO(dateStr);
  if (isToday(d)) return `Today · ${format(d, "MMMM d")}`;
  if (isYesterday(d)) return `Yesterday · ${format(d, "MMMM d")}`;
  return format(d, "EEEE · MMMM d");
}

export function DayGroup({ group, defaultOpen = true }: { group: DayGroupData; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <Collapsible
      open={open}
      onOpenChange={setOpen}
      id={`day-${group.date}`}
      className="rounded-card border border-border/[0.07] bg-surface shadow-card dark:border-white/[0.06]"
    >
      {/* Header row — 48px, light purple tint */}
      <CollapsibleTrigger asChild>
        <button
          type="button"
          className="flex h-12 w-full items-center gap-3 rounded-t-card bg-[#F3F0FF] px-4 dark:bg-accent/[0.08]"
        >
          <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded border border-border/20 bg-surface dark:border-white/10">
            <ChevronDown
              className={cn(
                "h-3 w-3 text-text-tertiary transition-transform duration-200",
                open && "rotate-180",
              )}
            />
          </span>
          <span className="text-sm font-semibold text-text">{dayLabel(group.date)}</span>
          <span className="text-xs text-text-tertiary">
            {group.entries.length} session{group.entries.length === 1 ? "" : "s"}
          </span>
          <span className="ml-auto text-sm font-bold tabular-nums text-accent">
            {formatDuration(group.totalSeconds)}
          </span>
          <span className="flex h-6 w-6 items-center justify-center rounded-md text-text-tertiary hover:bg-surface-2">
            <MoreHorizontal className="h-3.5 w-3.5" />
          </span>
        </button>
      </CollapsibleTrigger>

      <CollapsibleContent className="overflow-hidden data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up">
        <div className="divide-y divide-border/[0.06] dark:divide-white/[0.05]">
          {group.entries.map((entry, i) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03, duration: 0.18 }}
            >
              <SessionRow entry={entry} />
            </motion.div>
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

"use client";

import { useState } from "react";
import { format, isToday, isYesterday, parseISO } from "date-fns";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { SessionCard } from "./SessionCard";
import { formatDurationShort } from "@/lib/time";
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
      <CollapsibleTrigger asChild>
        <button type="button" className="flex w-full items-center justify-between gap-3 px-4 py-3.5 sm:px-5">
          <div className="flex items-center gap-2.5">
            <ChevronDown className={cn("h-4 w-4 shrink-0 text-text-tertiary transition-transform duration-200", open && "rotate-180")} />
            <span className="text-sm font-semibold text-text">{dayLabel(group.date)}</span>
            <span className="hidden text-xs text-text-tertiary sm:inline">
              {group.entries.length} session{group.entries.length === 1 ? "" : "s"}
            </span>
          </div>
          <span className="text-sm font-bold tabular-nums text-accent">{formatDurationShort(group.totalSeconds)}</span>
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent className="overflow-hidden data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up">
        <div className="space-y-1 px-2 pb-3 sm:px-3">
          {group.entries.map((entry, i) => (
            <motion.div key={entry.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04, duration: 0.2 }}>
              <SessionCard entry={entry} />
            </motion.div>
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

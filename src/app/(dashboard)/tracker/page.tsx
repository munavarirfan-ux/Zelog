"use client";

import { useMemo, useRef, useState } from "react";
import { format } from "date-fns";
import { useHydratedTracker, useTrackerStore } from "@/store/trackerStore";
import { applyFilters, groupEntriesByDay } from "@/lib/trackerSelectors";
import { Hero } from "@/components/tracker/Hero";
import { TimerCard } from "@/components/tracker/TimerCard";
import { DateStrip } from "@/components/tracker/DateStrip";
import { FilterChips } from "@/components/tracker/FilterChips";
import { DayGroup } from "@/components/tracker/DayGroup";
import { AnalyticsBento } from "@/components/tracker/AnalyticsBento";
import { EmptyState } from "@/components/empty-states/EmptyState";
import { TrackerSkeleton } from "@/components/skeletons/primitives";

export default function TrackerPage() {
  const hydrated = useHydratedTracker();
  const entries = useTrackerStore((s) => s.entries);
  const filters = useTrackerStore((s) => s.filters);
  const taskInputRef = useRef<HTMLInputElement>(null);
  const [selectedDate, setSelectedDate] = useState(() => new Date());

  const filtered = useMemo(() => applyFilters(entries, filters), [entries, filters]);
  const groups = useMemo(() => groupEntriesByDay(filtered), [filtered]);

  function handleStartClick() {
    taskInputRef.current?.focus();
    taskInputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function handleDateSelect(date: Date) {
    setSelectedDate(date);
    document.getElementById(`day-${format(date, "yyyy-MM-dd")}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  if (!hydrated) {
    return <TrackerSkeleton />;
  }

  return (
    <div className="space-y-6 pb-12">
      <Hero onStartClick={handleStartClick} />
      <TimerCard ref={taskInputRef} />

      <div className="space-y-3">
        <DateStrip selectedDate={selectedDate} onSelect={handleDateSelect} />
        <FilterChips />
      </div>

      <div className="space-y-3">
        {groups.length ? (
          groups.map((group) => <DayGroup key={group.date} group={group} />)
        ) : (
          <EmptyState
            title="No sessions in this range"
            description="Try a different filter, or start tracking above to fill this in."
            className="rounded-card border border-dashed border-border/15 bg-surface"
          />
        )}
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold text-text">Analytics</h2>
        <AnalyticsBento />
      </div>
    </div>
  );
}

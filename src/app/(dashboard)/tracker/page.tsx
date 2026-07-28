"use client";

import { useMemo, useRef } from "react";
import { useHydratedTracker, useTrackerStore } from "@/store/trackerStore";
import { applyFilters, groupEntriesByDay } from "@/lib/trackerSelectors";
import { Hero } from "@/components/tracker/Hero";
import { DayGroup } from "@/components/tracker/DayGroup";
import { EmptyState } from "@/components/empty-states/EmptyState";
import { TrackerSkeleton } from "@/components/skeletons/primitives";

export default function TrackerPage() {
  const hydrated = useHydratedTracker();
  const entries = useTrackerStore((s) => s.entries);
  const filters = useTrackerStore((s) => s.filters);
  const taskInputRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => applyFilters(entries, filters), [entries, filters]);
  const groups = useMemo(() => groupEntriesByDay(filtered), [filtered]);

  if (!hydrated) {
    return <TrackerSkeleton />;
  }

  return (
    <div className="space-y-6 pb-12">
      <Hero ref={taskInputRef} />

      <div className="space-y-3">
        {groups.length ? (
          groups.map((group) => <DayGroup key={group.date} group={group} />)
        ) : (
          <EmptyState
            title="No sessions yet"
            description="Start tracking above to fill this in."
            className="rounded-card border border-dashed border-border/15 bg-surface"
          />
        )}
      </div>
    </div>
  );
}

"use client";

import { useMemo, useRef, useState } from "react";
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
  const [selectedEntryIds, setSelectedEntryIds] = useState<string[]>([]);

  const filtered = useMemo(() => applyFilters(entries, filters), [entries, filters]);
  const groups = useMemo(() => groupEntriesByDay(filtered), [filtered]);

  function toggleEntrySelection(id: string) {
    setSelectedEntryIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  function toggleGroupSelection(groupEntryIds: string[]) {
    const allSelected = groupEntryIds.every((id) => selectedEntryIds.includes(id));
    if (allSelected) {
      setSelectedEntryIds((prev) => prev.filter((id) => !groupEntryIds.includes(id)));
    } else {
      setSelectedEntryIds((prev) => [...new Set([...prev, ...groupEntryIds])]);
    }
  }

  function clearSelection() {
    setSelectedEntryIds([]);
  }

  if (!hydrated) {
    return <TrackerSkeleton />;
  }

  return (
    <div className="space-y-6 pb-12">
      <Hero ref={taskInputRef} />

      <div className="space-y-3">
        {groups.length ? (
          groups.map((group) => (
            <DayGroup
              key={group.date}
              group={group}
              selectedEntryIds={selectedEntryIds}
              onToggleEntry={toggleEntrySelection}
              onToggleGroup={toggleGroupSelection}
              onClearSelection={clearSelection}
            />
          ))
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

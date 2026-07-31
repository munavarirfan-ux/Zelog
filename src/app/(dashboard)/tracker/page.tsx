"use client";

import { useMemo, useRef, useState } from "react";
import { useHydratedTracker, useTrackerStore } from "@/store/trackerStore";
import { applyFilters, groupEntriesByDay, groupEntriesByWeek } from "@/lib/trackerSelectors";
import { formatDuration } from "@/lib/time";
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
  const dayGroups = useMemo(() => groupEntriesByDay(filtered), [filtered]);
  const weekGroups = useMemo(() => groupEntriesByWeek(dayGroups), [dayGroups]);

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

      <div className="space-y-5">
        {weekGroups.length ? (
          weekGroups.map((week) => (
            <div key={`${week.weekStart}-${week.weekEnd}`}>
              {/* Week header */}
              <div className="flex items-center justify-between px-1 pb-2">
                <span className="text-xs font-medium text-text-tertiary">
                  {week.weekStart} – {week.weekEnd}
                </span>
                <span className="text-xs font-medium text-text-tertiary">
                  Week total{" "}
                  <span className="font-semibold text-text-secondary">{formatDuration(week.totalSeconds)}</span>
                </span>
              </div>

              {/* Day groups within the week */}
              <div className="space-y-3">
                {week.days.map((group) => (
                  <DayGroup
                    key={group.date}
                    group={group}
                    selectedEntryIds={selectedEntryIds}
                    onToggleEntry={toggleEntrySelection}
                    onToggleGroup={toggleGroupSelection}
                    onClearSelection={clearSelection}
                  />
                ))}
              </div>
            </div>
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

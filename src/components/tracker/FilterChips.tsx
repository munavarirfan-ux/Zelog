"use client";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useTrackerStore } from "@/store/trackerStore";
import { PROJECT_COLOR_DOT } from "@/lib/projectColors";
import { cn } from "@/lib/utils";
import type { TimeRangeFilter } from "@/types/tracker";

const RANGE_OPTIONS: { value: TimeRangeFilter; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "week", label: "This week" },
  { value: "month", label: "This month" },
  { value: "all", label: "All time" },
];

export function FilterChips() {
  const projects = useTrackerStore((s) => s.projects);
  const filters = useTrackerStore((s) => s.filters);
  const setFilters = useTrackerStore((s) => s.setFilters);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <ToggleGroup
        type="single"
        value={filters.range}
        onValueChange={(v) => {
          if (v) setFilters({ range: v as TimeRangeFilter });
        }}
      >
        {RANGE_OPTIONS.map((opt) => (
          <ToggleGroupItem key={opt.value} value={opt.value}>
            {opt.label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>

      <ToggleGroup
        type="multiple"
        value={filters.projectIds}
        onValueChange={(v) => setFilters({ projectIds: v })}
        className="sm:justify-end"
      >
        {projects.map((p) => (
          <ToggleGroupItem key={p.id} value={p.id}>
            <span className={cn("h-1.5 w-1.5 rounded-full", PROJECT_COLOR_DOT[p.color])} />
            {p.name}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  );
}

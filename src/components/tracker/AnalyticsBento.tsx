"use client";

import { useMemo } from "react";
import { useTrackerStore } from "@/store/trackerStore";
import {
  billablePercent,
  heatmapData,
  productivityTrend,
  projectDistribution,
  recentActivity,
  weeklyHoursSeries,
} from "@/lib/trackerSelectors";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProgressRing } from "@/components/ui/progress-ring";
import { WeeklyHoursChart } from "./charts/WeeklyHoursChart";
import { ProductivityTrendChart } from "./charts/ProductivityTrendChart";
import { ProjectDistributionChart } from "./charts/ProjectDistributionChart";
import { Heatmap } from "./Heatmap";
import { EmptyState } from "@/components/empty-states/EmptyState";
import { projectById } from "@/data/mockEntries";
import { PROJECT_COLOR_DOT } from "@/lib/projectColors";
import { formatDuration, formatTimeRange } from "@/lib/time";
import { cn } from "@/lib/utils";

export function AnalyticsBento() {
  const entries = useTrackerStore((s) => s.entries);

  const weekly = useMemo(() => weeklyHoursSeries(entries), [entries]);
  const trend = useMemo(() => productivityTrend(entries), [entries]);
  const distribution = useMemo(() => projectDistribution(entries), [entries]);
  const billable = useMemo(() => billablePercent(entries), [entries]);
  const heatmap = useMemo(() => heatmapData(entries, 10), [entries]);
  const recent = useMemo(() => recentActivity(entries, 5), [entries]);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Weekly hours</CardTitle>
        </CardHeader>
        <CardContent>
          <WeeklyHoursChart data={weekly} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Billable time</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-2">
          <ProgressRing value={billable} size={112} strokeWidth={10}>
            <span className="text-2xl font-bold text-text">{billable}%</span>
            <span className="text-[10px] text-text-tertiary">billable</span>
          </ProgressRing>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Productivity trend</CardTitle>
        </CardHeader>
        <CardContent>
          <ProductivityTrendChart data={trend} />
          <p className="mt-1 text-xs text-text-secondary">Last 14 days</p>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Project distribution</CardTitle>
        </CardHeader>
        <CardContent>
          {distribution.length ? (
            <ProjectDistributionChart rows={distribution} />
          ) : (
            <EmptyState title="No time logged yet" className="py-4" />
          )}
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Recent activity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {recent.length ? (
            recent.map((entry) => {
              const project = projectById(entry.projectId);
              return (
                <div key={entry.id} className="flex items-center gap-3">
                  <span className={cn("h-2 w-2 shrink-0 rounded-full", PROJECT_COLOR_DOT[project.color])} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium text-text">{entry.task}</p>
                    <p className="truncate text-[11px] text-text-tertiary">
                      {project.name} · {formatTimeRange(entry.startTime, entry.endTime)}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs font-semibold tabular-nums text-text-secondary">
                    {formatDuration(entry.durationSeconds)}
                  </span>
                </div>
              );
            })
          ) : (
            <EmptyState title="Nothing tracked yet" className="py-4" />
          )}
        </CardContent>
      </Card>

      <Card className="lg:col-span-4">
        <CardHeader>
          <CardTitle>Activity heatmap</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Heatmap cells={heatmap} />
        </CardContent>
      </Card>
    </div>
  );
}

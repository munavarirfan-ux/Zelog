"use client";

import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import { PROJECT_COLOR_HEX } from "@/lib/projectColors";
import { projectById } from "@/data/mockEntries";
import type { ProjectDistributionRow } from "@/lib/trackerSelectors";

export function ProjectDistributionChart({ rows }: { rows: ProjectDistributionRow[] }) {
  return (
    <div className="flex items-center gap-4">
      <div className="h-[140px] w-[140px] shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={rows} dataKey="seconds" nameKey="projectId" innerRadius={42} outerRadius={62} paddingAngle={3} stroke="none">
              {rows.map((r) => (
                <Cell key={r.projectId} fill={PROJECT_COLOR_HEX[projectById(r.projectId).color]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="min-w-0 flex-1 space-y-2">
        {rows.map((r) => {
          const project = projectById(r.projectId);
          return (
            <div key={r.projectId} className="flex items-center gap-2 text-xs">
              <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: PROJECT_COLOR_HEX[project.color] }} />
              <span className="min-w-0 flex-1 truncate text-text-secondary">{project.name}</span>
              <span className="shrink-0 font-medium tabular-nums text-text">{r.percent}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

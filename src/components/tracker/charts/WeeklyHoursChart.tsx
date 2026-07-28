"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { CHART_AXIS_TICK, CHART_GRID_STROKE } from "@/lib/chartColors";

interface TooltipPayload {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}

function ChartTooltip({ active, payload, label }: TooltipPayload) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-[10px] border border-border/10 bg-surface px-3 py-2 text-xs shadow-card">
      <p className="font-medium text-text-secondary">{label}</p>
      <p className="font-semibold text-text">{payload[0].value}h</p>
    </div>
  );
}

export function WeeklyHoursChart({ data }: { data: { label: string; hours: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <CartesianGrid stroke={CHART_GRID_STROKE} vertical={false} strokeDasharray="4 4" />
        <XAxis dataKey="label" axisLine={false} tickLine={false} tick={CHART_AXIS_TICK} />
        <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgb(var(--accent-500-rgb) / 0.06)" }} />
        <Bar dataKey="hours" radius={[8, 8, 0, 0]} maxBarSize={28} fill="rgb(var(--accent-500-rgb))" />
      </BarChart>
    </ResponsiveContainer>
  );
}

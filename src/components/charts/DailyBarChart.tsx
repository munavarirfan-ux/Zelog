"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

export interface BarSeries {
  dataKey: string;
  name: string;
  color: string;
}

function secondsToHms(value: number): string {
  const v = Math.max(0, Math.round(value));
  const h = Math.floor(v / 3600);
  const m = Math.floor((v % 3600) / 60);
  const s = v % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

const AXIS_TICK = { fill: "rgb(var(--text-tertiary-rgb))", fontSize: 12 };

/**
 * Stacked bar chart (Recharts) for daily tracked time.
 * `data` rows contain a `date` label plus one numeric key per series (seconds).
 */
export function DailyBarChart({
  data,
  series,
  height = 280,
}: {
  data: Record<string, unknown>[];
  series: BarSeries[];
  height?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -8 }} barCategoryGap="30%">
        <CartesianGrid vertical={false} stroke="rgb(var(--primary-main-rgb) / 0.1)" strokeDasharray="4 4" />
        <XAxis dataKey="date" tickLine={false} axisLine={false} tick={AXIS_TICK} dy={6} />
        <YAxis
          width={44}
          tickLine={false}
          axisLine={false}
          tick={AXIS_TICK}
          tickFormatter={(v: number) => `${Math.round(v / 3600)}h`}
        />
        <Tooltip
          cursor={{ fill: "rgb(var(--primary-main-rgb) / 0.06)" }}
          formatter={(value: number, name: string) => [secondsToHms(value), name]}
          contentStyle={{
            backgroundColor: "rgb(var(--surface-rgb))",
            border: "1px solid rgb(var(--border-rgb) / 0.12)",
            borderRadius: 12,
            boxShadow: "0 8px 32px rgba(15,23,42,0.12)",
            padding: "8px 12px",
            fontSize: 12,
          }}
          labelStyle={{ color: "rgb(var(--text-rgb))", fontWeight: 600, marginBottom: 4 }}
          itemStyle={{ color: "rgb(var(--text-secondary-rgb))", padding: 0 }}
        />
        <Legend
          verticalAlign="top"
          align="right"
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ fontSize: 12, paddingBottom: 12, color: "rgb(var(--text-secondary-rgb))" }}
        />
        {series.map((s, i) => (
          <Bar
            key={s.dataKey}
            dataKey={s.dataKey}
            name={s.name}
            stackId="total"
            fill={s.color}
            radius={i === series.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
            maxBarSize={48}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}

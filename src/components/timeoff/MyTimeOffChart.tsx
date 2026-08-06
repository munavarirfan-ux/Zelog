"use client";

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import type { BalanceRow } from "@/data/timeOffData";

const AXIS_TICK = { fill: "rgb(var(--text-tertiary-rgb))", fontSize: 12 };

const SERIES = [
  { key: "Used", color: "#5A43D5" },
  { key: "Pending", color: "#FDBA74" },
  { key: "Available", color: "#C9B6FF" },
];

function shortLabel(label: string): string {
  return label.replace("Work From Home", "WFH").replace(" Leave", "").replace("Comp Off", "Comp");
}

/** Stacked bar chart of leave/WFH balance composition per type (in days). */
export function MyTimeOffChart({ balances, height = 300 }: { balances: BalanceRow[]; height?: number }) {
  const data = balances.map((b) => ({ name: shortLabel(b.label), Used: b.used, Pending: b.pending, Available: b.available }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -12 }} barCategoryGap="28%">
        <CartesianGrid vertical={false} stroke="rgb(var(--primary-main-rgb) / 0.1)" strokeDasharray="4 4" />
        <XAxis dataKey="name" tickLine={false} axisLine={false} tick={AXIS_TICK} dy={6} />
        <YAxis width={40} tickLine={false} axisLine={false} tick={AXIS_TICK} allowDecimals={false} tickFormatter={(v: number) => `${v}d`} />
        <Tooltip
          cursor={{ fill: "rgb(var(--primary-main-rgb) / 0.06)" }}
          formatter={(value: number, name: string) => [`${value} day${value === 1 ? "" : "s"}`, name]}
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
        <Legend verticalAlign="top" align="right" iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, paddingBottom: 12, color: "rgb(var(--text-secondary-rgb))" }} />
        {SERIES.map((s, i) => (
          <Bar key={s.key} dataKey={s.key} name={s.key} stackId="total" fill={s.color} radius={i === SERIES.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]} maxBarSize={44} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}

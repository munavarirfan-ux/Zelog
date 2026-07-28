"use client";

import { useId } from "react";
import { Area, AreaChart, ResponsiveContainer } from "recharts";

export function ProductivityTrendChart({ data }: { data: { date: string; hours: number }[] }) {
  const gradientId = `trend-fill-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;

  return (
    <ResponsiveContainer width="100%" height={72}>
      <AreaChart data={data} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgb(var(--accent-500-rgb))" stopOpacity={0.35} />
            <stop offset="100%" stopColor="rgb(var(--accent-500-rgb))" stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area type="monotone" dataKey="hours" stroke="rgb(var(--accent-500-rgb))" strokeWidth={2} fill={`url(#${gradientId})`} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

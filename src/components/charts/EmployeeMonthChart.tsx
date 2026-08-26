"use client";

import { useMemo } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { formatWorkedHours, type EmployeeDay } from "@/data/employeeMonthData";

/* Colors — aligned with the app's attendance palette. */
const OFFICE = "#5A43D5"; // purple — office hours
const WFH = "#38BDF8"; // blue — work from home
const LEAVE_WORKED = "#F59E0B"; // amber — hours logged during approved leave (the anomaly)
const LEAVE_FALLBACK = "#8B7CF6";

const AXIS_TICK = { fill: "rgb(var(--text-tertiary-rgb))", fontSize: 11 };

interface Row {
  label: string;
  office: number;
  wfh: number;
  workedOnLeave: number;
  leave: number; // nominal marker height (seconds) for pure-leave days
  _day: EmployeeDay;
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: { payload: Row }[] }) {
  if (!active || !payload?.length) return null;
  const day = payload[0].payload._day;

  let heading: string;
  let tone = "text-text-secondary";
  switch (day.kind) {
    case "holiday":
      heading = `Holiday${day.holidayName ? ` — ${day.holidayName}` : ""}`;
      break;
    case "weekend":
      heading = "Weekend";
      break;
    case "future":
      heading = "Scheduled";
      break;
    case "absent":
      heading = "Absent";
      tone = "text-rose-500";
      break;
    case "leave":
      heading = `On leave — ${day.leaveLabel}${day.leaveHalfDay ? " (half day)" : ""}`;
      break;
    case "leave-worked":
      heading = `On ${day.leaveLabel}${day.leaveHalfDay ? " (half day)" : ""} — logged hours`;
      tone = "text-amber-600 dark:text-amber-400";
      break;
    case "wfh":
      heading = "Work from home";
      break;
    case "half-day":
      heading = "Half day";
      break;
    default:
      heading = "In office";
  }

  return (
    <div className="rounded-xl border border-border/[0.12] bg-surface px-3 py-2 text-xs shadow-float dark:border-white/10">
      <p className="mb-0.5 font-semibold text-text">
        {day.weekday}, {day.label}
      </p>
      <p className={`font-medium ${tone}`}>{heading}</p>
      {day.workedSeconds > 0 && (
        <p className="mt-1 flex items-center gap-1.5 text-text-secondary">
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: day.kind === "leave-worked" ? LEAVE_WORKED : day.mode === "wfh" ? WFH : OFFICE }}
          />
          Logged {formatWorkedHours(day.workedSeconds)}
          {day.mode ? ` · ${day.mode === "wfh" ? "WFH" : "Office"}` : ""}
        </p>
      )}
      {day.kind === "leave-worked" && (
        <p className="mt-1 text-[11px] font-medium text-amber-600 dark:text-amber-400">
          ⚠ Hours logged during approved leave
        </p>
      )}
    </div>
  );
}

/**
 * Per-employee monthly attendance bar chart. Each bar is one day; the stack
 * shows office vs WFH hours, pure-leave days as a leave-colored marker, and
 * hours logged *during* leave in an amber highlight.
 */
export function EmployeeMonthChart({ days, height = 300 }: { days: EmployeeDay[]; height?: number }) {
  const data = useMemo<Row[]>(
    () =>
      days.map((d) => ({
        label: String(d.dayNum),
        office: !d.onLeave && d.mode === "office" ? d.workedSeconds : 0,
        wfh: !d.onLeave && d.mode === "wfh" ? d.workedSeconds : 0,
        workedOnLeave: d.kind === "leave-worked" ? d.workedSeconds : 0,
        // Pure-leave days get a nominal marker so a day off is still visible.
        leave: d.kind === "leave" ? (d.leaveHalfDay ? 4 * 3600 : 8 * 3600) : 0,
        _day: d,
      })),
    [days],
  );

  return (
    <div>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -8 }} barCategoryGap="18%">
          <CartesianGrid vertical={false} stroke="rgb(var(--primary-main-rgb) / 0.1)" strokeDasharray="4 4" />
          <XAxis dataKey="label" tickLine={false} axisLine={false} tick={AXIS_TICK} dy={6} interval={0} minTickGap={0} />
          <YAxis
            width={40}
            tickLine={false}
            axisLine={false}
            tick={AXIS_TICK}
            tickFormatter={(v: number) => `${Math.round(v / 3600)}h`}
          />
          <Tooltip cursor={{ fill: "rgb(var(--primary-main-rgb) / 0.06)" }} content={<CustomTooltip />} />
          <Bar dataKey="office" name="Office" stackId="d" fill={OFFICE} radius={[3, 3, 0, 0]} maxBarSize={26} />
          <Bar dataKey="wfh" name="WFH" stackId="d" fill={WFH} radius={[3, 3, 0, 0]} maxBarSize={26} />
          <Bar dataKey="workedOnLeave" name="Logged on leave" stackId="d" fill={LEAVE_WORKED} radius={[3, 3, 0, 0]} maxBarSize={26} />
          <Bar dataKey="leave" name="On leave" stackId="d" radius={[3, 3, 0, 0]} maxBarSize={26}>
            {data.map((row, i) => (
              <Cell key={i} fill={row._day.leaveColor ?? LEAVE_FALLBACK} fillOpacity={0.5} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 px-1 text-[11px] text-text-secondary">
        <LegendChip color={OFFICE} label="Office" />
        <LegendChip color={WFH} label="Work from home" />
        <LegendChip color={LEAVE_FALLBACK} label="On leave" faded />
        <LegendChip color={LEAVE_WORKED} label="Logged hours while on leave" />
      </div>
    </div>
  );
}

function LegendChip({ color, label, faded }: { color: string; label: string; faded?: boolean }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className="h-2.5 w-2.5 rounded-[3px]"
        style={{ backgroundColor: color, opacity: faded ? 0.5 : 1 }}
      />
      {label}
    </span>
  );
}

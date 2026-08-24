"use client";

import { useState } from "react";
import Tooltip from "@mui/material/Tooltip";
import {
  addMonths,
  addWeeks,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isWeekend,
  parseISO,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { AlertTriangle, ChevronLeft, ChevronRight } from "lucide-react";
import { holidayName, isHoliday, requestColor, requestLabel, type TimeOffRequest } from "@/data/timeOffData";
import { initials, type Employee } from "@/data/orgData";
import { cn } from "@/lib/utils";

const TODAY = parseISO("2026-08-06");
const CAPACITY_THRESHOLD = 3;
const EMP_COL = 220;

interface TeamCalendarProps {
  employees: Employee[];
  requests: TimeOffRequest[];
  includeInactive: boolean;
  onEventClick: (r: TimeOffRequest) => void;
}

export function TeamCalendar({ employees, requests, includeInactive, onEventClick }: TeamCalendarProps) {
  const [view, setView] = useState<"month" | "week">("month");
  const [anchor, setAnchor] = useState(TODAY);

  const rangeStart = view === "month" ? startOfMonth(anchor) : startOfWeek(anchor, { weekStartsOn: 1 });
  const rangeEnd = view === "month" ? endOfMonth(anchor) : endOfWeek(anchor, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: rangeStart, end: rangeEnd });
  const dayW = view === "month" ? 42 : 108;

  const shownStatuses = includeInactive
    ? ["approved", "pending", "changes-requested", "rejected", "cancelled"]
    : ["approved", "pending", "changes-requested"];
  const visible = requests.filter((r) => shownStatuses.includes(r.status));

  const label = view === "month" ? format(anchor, "MMMM yyyy") : `${format(rangeStart, "MMM d")} – ${format(rangeEnd, "MMM d, yyyy")}`;
  const step = (dir: number) => setAnchor((a) => (view === "month" ? addMonths(a, dir) : addWeeks(a, dir)));

  const dayIndex = (d: Date) => days.findIndex((x) => isSameDay(x, d));

  // Daily count of employees off (active requests overlapping that day).
  const dailyCount = days.map((day) =>
    employees.filter((e) =>
      visible.some((r) => r.employeeId === e.id && r.status !== "rejected" && r.status !== "cancelled" && parseISO(r.startDate) <= day && day <= parseISO(r.endDate)),
    ).length,
  );

  function rowRequests(empId: string) {
    return visible
      .filter((r) => r.employeeId === empId && parseISO(r.endDate) >= rangeStart && parseISO(r.startDate) <= rangeEnd)
      .map((r) => {
        const s = parseISO(r.startDate) < rangeStart ? rangeStart : parseISO(r.startDate);
        const e = parseISO(r.endDate) > rangeEnd ? rangeEnd : parseISO(r.endDate);
        return { r, start: Math.max(0, dayIndex(s)), span: Math.max(1, dayIndex(e) - dayIndex(s) + 1) };
      });
  }

  const totalWidth = EMP_COL + days.length * dayW;
  const colTemplate = `repeat(${days.length}, ${dayW}px)`;

  return (
    <div className="rounded-[16px] border border-border/[0.07] bg-surface shadow-card dark:border-white/[0.06]">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3 border-b border-border/[0.06] p-3 dark:border-white/[0.05]">
        <div className="flex h-9 items-center rounded-[10px] border border-border/10 bg-surface-2/60 p-0.5 dark:border-white/10">
          {(["month", "week"] as const).map((v) => (
            <button key={v} type="button" onClick={() => setView(v)} className={cn("rounded-[8px] px-3 py-1 text-xs font-medium capitalize transition-colors", view === v ? "bg-surface text-text shadow-xs" : "text-text-secondary")}>{v}</button>
          ))}
        </div>
        <div className="flex items-center gap-1">
          <button type="button" onClick={() => step(-1)} className="flex h-8 w-8 items-center justify-center rounded-lg text-text-secondary hover:bg-surface-2" aria-label="Previous"><ChevronLeft className="h-4 w-4" /></button>
          <button type="button" onClick={() => step(1)} className="flex h-8 w-8 items-center justify-center rounded-lg text-text-secondary hover:bg-surface-2" aria-label="Next"><ChevronRight className="h-4 w-4" /></button>
          <button type="button" onClick={() => setAnchor(TODAY)} className="ml-1 rounded-lg border border-border/10 px-2.5 py-1 text-xs font-medium text-text-secondary hover:bg-surface-2 dark:border-white/10">Today</button>
        </div>
        <span className="text-sm font-semibold text-text">{label}</span>
      </div>

      {/* Grid */}
      <div className="max-h-[560px] overflow-auto">
        <div style={{ width: totalWidth }}>
          {/* Header */}
          <div className="sticky top-0 z-20 flex border-b border-border/[0.07] bg-surface dark:border-white/[0.06]">
            <div className="sticky left-0 z-30 flex items-center bg-surface px-4 text-[11px] font-semibold uppercase tracking-wider text-text-tertiary" style={{ width: EMP_COL }}>Team member</div>
            {days.map((day, i) => {
              const today = isSameDay(day, TODAY);
              const holiday = isHoliday(day);
              return (
                <Tooltip key={i} title={holiday ? holidayName(day)! : ""} arrow={false} disableHoverListener={!holiday}>
                  <div className={cn("flex flex-col items-center justify-center border-l border-border/[0.05] py-1.5 dark:border-white/[0.04]", isWeekend(day) && "bg-surface-2/50", holiday && "bg-primary-50/70 dark:bg-primary-100/20", today && "bg-primary-100/50")} style={{ width: dayW }}>
                    <span className="text-[10px] font-medium uppercase text-text-tertiary">{format(day, "EEEEE")}</span>
                    <span className={cn("text-xs font-semibold", today ? "text-primary-600" : "text-text-secondary")}>{format(day, "d")}</span>
                  </div>
                </Tooltip>
              );
            })}
          </div>

          {/* Employee rows */}
          {employees.map((emp) => (
            <div key={emp.id} className="flex border-b border-border/[0.05] dark:border-white/[0.04]">
              <div className="sticky left-0 z-10 flex items-center gap-2.5 bg-surface px-4 py-2" style={{ width: EMP_COL }}>
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-500 text-[10px] font-bold text-white">{initials(emp.name)}</span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium text-text">{emp.name}</span>
                  <span className="block truncate text-[11px] text-text-tertiary">{emp.jobTitle}</span>
                </span>
              </div>
              <div className="relative" style={{ width: days.length * dayW, height: 52 }}>
                {/* background cells */}
                <div className="absolute inset-0 grid" style={{ gridTemplateColumns: colTemplate }}>
                  {days.map((day, i) => (
                    <div key={i} className={cn("border-l border-border/[0.05] dark:border-white/[0.04]", isWeekend(day) && "bg-surface-2/40", isHoliday(day) && "bg-primary-50/60 dark:bg-primary-100/15", isSameDay(day, TODAY) && "bg-primary-100/40")} />
                  ))}
                </div>
                {/* bars */}
                <div className="absolute inset-0 grid items-center px-0.5" style={{ gridTemplateColumns: colTemplate }}>
                  {rowRequests(emp.id).map(({ r, start, span }) => {
                    const pending = r.status === "pending" || r.status === "changes-requested";
                    return (
                      <Tooltip
                        key={r.id}
                        arrow={false}
                        title={
                          <div className="px-0.5 py-0.5 text-xs">
                            <div className="font-semibold">{emp.name}</div>
                            <div className="mt-0.5 text-white/80">{requestLabel(r)} · {r.durationType === "half-day" ? "Half day" : `${r.durationDays}d`} · {r.status}</div>
                            <div className="text-white/70">{format(parseISO(r.startDate), "MMM d")} – {format(parseISO(r.endDate), "MMM d")}</div>
                            <div className="mt-0.5 text-white/70">{r.reason}</div>
                          </div>
                        }
                        slotProps={{ tooltip: { sx: { borderRadius: "10px", px: 1.5, py: 1, backgroundColor: "rgba(30,25,60,0.94)" } } }}
                      >
                        <button
                          type="button"
                          onClick={() => onEventClick(r)}
                          className="mx-0.5 flex h-7 items-center overflow-hidden rounded-md px-2 text-[10px] font-semibold text-white"
                          style={{
                            gridColumn: `${start + 1} / span ${span}`,
                            backgroundColor: requestColor(r),
                            opacity: pending ? 0.55 : 1,
                            backgroundImage: pending ? "repeating-linear-gradient(45deg, rgba(255,255,255,0.25) 0 4px, transparent 4px 8px)" : undefined,
                            border: r.status === "rejected" || r.status === "cancelled" ? "1px dashed rgba(0,0,0,0.25)" : undefined,
                          }}
                        >
                          <span className="truncate">{requestLabel(r)}</span>
                        </button>
                      </Tooltip>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}

          {/* Daily count footer */}
          <div className="sticky bottom-0 z-10 flex border-t border-border/[0.07] bg-surface dark:border-white/[0.06]">
            <div className="sticky left-0 z-20 flex items-center bg-surface px-4 py-2 text-[11px] font-semibold uppercase tracking-wider text-text-tertiary" style={{ width: EMP_COL }}>On leave</div>
            {days.map((day, i) => {
              const count = dailyCount[i];
              const over = count >= CAPACITY_THRESHOLD;
              return (
                <div key={i} className={cn("flex items-center justify-center gap-0.5 border-l border-border/[0.05] py-2 text-xs font-semibold tabular-nums dark:border-white/[0.04]", over ? "text-danger" : count > 0 ? "text-text-secondary" : "text-text-disabled")} style={{ width: dayW }}>
                  {over && <AlertTriangle className="h-3 w-3" />}
                  {count}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

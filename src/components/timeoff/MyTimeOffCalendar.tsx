"use client";

import { useState } from "react";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isWeekend,
  parseISO,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { holidayName, isHoliday, requestColor, requestLabel, type TimeOffRequest } from "@/data/timeOffData";
import { cn } from "@/lib/utils";

const TODAY = parseISO("2026-08-06");
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function MyTimeOffCalendar({ requests, onView }: { requests: TimeOffRequest[]; onView: (r: TimeOffRequest) => void }) {
  const [month, setMonth] = useState(startOfMonth(TODAY));

  const gridStart = startOfWeek(startOfMonth(month));
  const gridEnd = endOfWeek(endOfMonth(month));
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd });

  const visible = requests.filter((r) => r.status !== "rejected" && r.status !== "cancelled");
  const forDay = (day: Date) =>
    visible.filter((r) => parseISO(r.startDate) <= day && day <= parseISO(r.endDate));

  return (
    <div className="rounded-[16px] border border-border/[0.07] bg-surface p-4 shadow-card dark:border-white/[0.06]">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-text">{format(month, "MMMM yyyy")}</h3>
        <div className="flex items-center gap-1">
          <button type="button" onClick={() => setMonth((m) => startOfMonth(TODAY))} className="mr-1 rounded-lg border border-border/10 px-2.5 py-1 text-xs font-medium text-text-secondary hover:bg-surface-2 dark:border-white/10">Today</button>
          <button type="button" onClick={() => setMonth((m) => addMonths(m, -1))} className="flex h-7 w-7 items-center justify-center rounded-lg text-text-secondary hover:bg-surface-2" aria-label="Previous month"><ChevronLeft className="h-4 w-4" /></button>
          <button type="button" onClick={() => setMonth((m) => addMonths(m, 1))} className="flex h-7 w-7 items-center justify-center rounded-lg text-text-secondary hover:bg-surface-2" aria-label="Next month"><ChevronRight className="h-4 w-4" /></button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {WEEKDAYS.map((w) => (
          <div key={w} className="pb-1 text-center text-[11px] font-semibold uppercase tracking-wider text-text-tertiary">{w}</div>
        ))}
        {days.map((day) => {
          const inMonth = isSameMonth(day, month);
          const today = isSameDay(day, TODAY);
          const holiday = isHoliday(day);
          const items = forDay(day);
          return (
            <div
              key={day.toISOString()}
              title={holiday ? holidayName(day) : undefined}
              className={cn(
                "min-h-[74px] rounded-lg border p-1.5 transition-colors",
                inMonth ? "border-border/[0.06] dark:border-white/[0.05]" : "border-transparent opacity-40",
                isWeekend(day) && "bg-surface-2/40",
                holiday && "bg-primary-50/70 dark:bg-primary-100/20",
              )}
            >
              <div className="flex items-center justify-between">
                <span className={cn(
                  "flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-medium",
                  today ? "bg-primary-500 font-bold text-white" : "text-text-secondary",
                )}>
                  {format(day, "d")}
                </span>
              </div>
              <div className="mt-1 space-y-1">
                {items.slice(0, 2).map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => onView(r)}
                    className="block w-full truncate rounded px-1 py-0.5 text-left text-[10px] font-medium text-white"
                    style={{ backgroundColor: requestColor(r), opacity: r.status === "pending" || r.status === "changes-requested" ? 0.6 : 1 }}
                  >
                    {requestLabel(r)}
                  </button>
                ))}
                {items.length > 2 && <span className="block px-1 text-[10px] text-text-tertiary">+{items.length - 2} more</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

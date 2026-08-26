"use client";

import { useMemo, useState } from "react";
import { addMonths, format, startOfMonth } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { MOCK_EMPLOYEES } from "@/data/orgData";
import { useHydratedTimeOff, useTimeOffStore } from "@/store/timeOffStore";
import {
  buildEmployeeMonth,
  formatWorkedHours,
  summarizeEmployeeMonth,
} from "@/data/employeeMonthData";
import { EmployeeMonthChart } from "@/components/charts/EmployeeMonthChart";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

const ACTIVE_EMPLOYEES = MOCK_EMPLOYEES.filter((e) => e.status === "active");

/**
 * A drop-in card showing one employee's month of attendance — worked hours,
 * office vs WFH, approved leave, and any hours logged during leave. Manages its
 * own employee + month selection so pages can render it with no wiring.
 */
export function EmployeeMonthCard({ defaultEmployeeId = "eng1" }: { defaultEmployeeId?: string }) {
  const hydrated = useHydratedTimeOff();
  const requests = useTimeOffStore((s) => s.requests);
  const [employeeId, setEmployeeId] = useState(defaultEmployeeId);
  const [monthOffset, setMonthOffset] = useState(0);

  const { days, summary, monthLabel } = useMemo(() => {
    // Computed client-side only (guarded by `hydrated`) to avoid SSR date drift.
    const now = new Date();
    const month = addMonths(startOfMonth(now), monthOffset);
    const built = buildEmployeeMonth(employeeId, month, now, requests);
    return {
      days: built,
      summary: summarizeEmployeeMonth(built),
      monthLabel: format(month, "MMMM yyyy"),
    };
  }, [employeeId, monthOffset, requests]);

  const employee = ACTIVE_EMPLOYEES.find((e) => e.id === employeeId);

  return (
    <div className="rounded-card border border-border/[0.07] bg-surface p-5 shadow-card dark:border-white/[0.06]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-text">Monthly attendance</h3>
          <p className="mt-0.5 text-xs text-text-tertiary">
            Worked hours, work-from-home, and leave — per employee
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="w-52">
            <Select value={employeeId} onValueChange={setEmployeeId}>
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ACTIVE_EMPLOYEES.map((e) => (
                  <SelectItem key={e.id} value={e.id}>
                    {e.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {/* Month navigation */}
          <div className="flex h-9 items-center gap-1 rounded-[10px] border border-border/10 bg-surface-2/60 px-1 dark:border-white/10">
            <button
              type="button"
              onClick={() => setMonthOffset((m) => m - 1)}
              className="flex h-7 w-7 items-center justify-center rounded-md text-text-secondary transition-colors hover:bg-surface-2 hover:text-text"
              aria-label="Previous month"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="min-w-[104px] text-center text-xs font-medium text-text tabular-nums">{monthLabel}</span>
            <button
              type="button"
              onClick={() => setMonthOffset((m) => Math.min(0, m + 1))}
              disabled={monthOffset >= 0}
              className="flex h-7 w-7 items-center justify-center rounded-md text-text-secondary transition-colors hover:bg-surface-2 hover:text-text disabled:cursor-not-allowed disabled:opacity-30"
              aria-label="Next month"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Summary strip */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Stat label="Hours logged" value={formatWorkedHours(summary.workedSeconds)} />
        <Stat label="Office days" value={String(summary.officeDays)} />
        <Stat label="WFH days" value={String(summary.wfhDays)} />
        <Stat label="Leave" value={`${summary.leaveDays} ${summary.leaveDays === 1 ? "day" : "days"}`} />
        {summary.absentDays > 0 && <Stat label="Absent" value={String(summary.absentDays)} />}
        {summary.leaveWorkedDays > 0 && (
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500/10 px-3 py-1.5 text-xs font-medium text-amber-600 dark:text-amber-400">
            ⚠ Logged hours on {summary.leaveWorkedDays} leave{" "}
            {summary.leaveWorkedDays === 1 ? "day" : "days"}
          </span>
        )}
      </div>

      {employee && (
        <p className="mt-3 text-[11px] text-text-tertiary">
          {employee.jobTitle} · {employee.department}
        </p>
      )}

      <div className={cn("mt-3", !hydrated && "opacity-0")}>
        {hydrated ? (
          <EmployeeMonthChart days={days} />
        ) : (
          <div className="h-[300px]" aria-hidden />
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col rounded-lg bg-surface-2/60 px-3 py-1.5 dark:bg-white/[0.04]">
      <span className="text-[10px] font-medium uppercase tracking-wide text-text-tertiary">{label}</span>
      <span className="text-sm font-bold tabular-nums text-text">{value}</span>
    </div>
  );
}

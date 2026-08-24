"use client";

import * as React from "react";
import { useMemo, useState } from "react";
import { parseISO } from "date-fns";
import { CalendarDays, CheckCircle2, Clock, MapPin, Pencil, Radio, XCircle } from "lucide-react";
import { buildMonthCalendar, STATUS, STATUS_LEGEND, type DayStatus } from "@/data/attendanceData";
import { DIR_TODAY } from "@/data/directoryData";
import { cn } from "@/lib/utils";
import type { DirectoryPerson } from "../shared";
import { Section, Metric, Empty } from "./parts";

const TODAY = parseISO(DIR_TODAY);

export function AttendanceTab({ person, canEdit }: { person: DirectoryPerson; canEdit: boolean }) {
  const [correcting, setCorrecting] = useState<string | null>(null);

  const days = useMemo(() => buildMonthCalendar(TODAY, TODAY), []);
  const worked = days.filter((d) => ["present", "wfh", "client", "late", "half-day"].includes(d.status));
  const workingDays = days.filter((d) => !["weekend", "holiday"].includes(d.status));
  const attendancePct = workingDays.length ? Math.round((worked.length / workingDays.length) * 100) : 0;
  const lateCount = days.filter((d) => d.status === "late").length;
  const wfhCount = days.filter((d) => d.status === "wfh").length;
  const officeCount = days.filter((d) => d.status === "present" || d.status === "late").length;

  const recent = [...worked].reverse().slice(0, 8);

  const todayStatus: DayStatus = person.employmentStatus === "on-leave" ? "leave" : "present";

  return (
    <div className="space-y-4">
      <p className="text-xs text-text-tertiary">Connected to <span className="font-medium text-text-secondary">ZE[TEAMS]</span> · {DIR_TODAY}</p>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <Metric label="Today" value={<span className="text-base" style={{ color: STATUS[todayStatus].color }}>{STATUS[todayStatus].label}</span>} color="#34D399" />
        <Metric label="Attendance" value={`${attendancePct}%`} color="#8B7CF6" />
        <Metric label="Avg Hours" value="8.2h" color="#38BDF8" />
        <Metric label="Late" value={lateCount} color="#FB923C" />
        <Metric label="WFH Days" value={wfhCount} color="#38BDF8" />
        <Metric label="Office Days" value={officeCount} color="#34D399" />
      </div>

      {/* Calendar */}
      <Section title="This Month" icon={CalendarDays}>
        <div className="grid grid-cols-7 gap-1.5">
          {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
            <div key={i} className="pb-1 text-center text-[11px] font-medium text-text-tertiary">{d}</div>
          ))}
          {(() => {
            const first = parseISO(days[0].date).getDay();
            return Array.from({ length: first }).map((_, i) => <div key={`pad-${i}`} />);
          })()}
          {days.map((d) => {
            const c = STATUS[d.status];
            const isToday = d.date === DIR_TODAY;
            return (
              <div
                key={d.date}
                title={`${d.date} · ${c.label}`}
                className={cn("flex aspect-square flex-col items-center justify-center rounded-[9px] text-[11px]", isToday && "ring-2 ring-primary-400")}
                style={{ backgroundColor: `${c.color}1A`, color: c.color }}
              >
                <span className="font-semibold">{parseISO(d.date).getDate()}</span>
              </div>
            );
          })}
        </div>
        <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1.5">
          {STATUS_LEGEND.map((s) => (
            <span key={s} className="inline-flex items-center gap-1 text-[11px] text-text-tertiary">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: STATUS[s].color }} />
              {STATUS[s].label}
            </span>
          ))}
        </div>
      </Section>

      {/* Recent attendance table */}
      <Section title="Recent Attendance" icon={Clock} tint="#38BDF8">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-border/[0.08] text-[11px] uppercase tracking-wide text-text-tertiary">
                <th className="py-2 pr-3 font-semibold">Date</th>
                <th className="px-3 py-2 font-semibold">Status</th>
                <th className="px-3 py-2 font-semibold">In</th>
                <th className="px-3 py-2 font-semibold">Out</th>
                <th className="px-3 py-2 font-semibold">Hours</th>
                <th className="px-3 py-2 font-semibold">Verification</th>
                {canEdit ? <th className="px-3 py-2 font-semibold" /> : null}
              </tr>
            </thead>
            <tbody>
              {recent.map((d) => (
                <tr key={d.date} className="border-b border-border/[0.05] last:border-0">
                  <td className="py-2.5 pr-3 tabular-nums text-text-secondary">{d.date}</td>
                  <td className="px-3 py-2.5">
                    <span className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold" style={{ color: STATUS[d.status].color, backgroundColor: `${STATUS[d.status].color}1F` }}>
                      {STATUS[d.status].label}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 tabular-nums text-text-secondary">{d.checkIn ?? "—"}</td>
                  <td className="px-3 py-2.5 tabular-nums text-text-secondary">{d.checkOut ?? "—"}</td>
                  <td className="px-3 py-2.5 tabular-nums text-text-secondary">{d.effectiveHours ?? "—"}</td>
                  <td className="px-3 py-2.5">
                    <span className="inline-flex items-center gap-2">
                      <Verify ok={!!d.gps} label="GPS" />
                      <Verify ok={!!d.photo} label="Photo" />
                    </span>
                  </td>
                  {canEdit ? (
                    <td className="px-3 py-2.5">
                      <button onClick={() => setCorrecting(correcting === d.date ? null : d.date)} className="inline-flex items-center gap-1 text-xs font-medium text-primary-700 hover:underline">
                        <Pencil className="h-3.5 w-3.5" /> Correct
                      </button>
                    </td>
                  ) : null}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {correcting ? (
          <p className="mt-3 rounded-[10px] bg-primary-50 px-3 py-2 text-xs text-primary-800">
            Correcting attendance for {correcting}. In production this opens the correction form; the change is logged to the activity trail.
          </p>
        ) : null}
      </Section>
    </div>
  );
}

function Verify({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1 text-[11px] font-medium", ok ? "text-emerald-600" : "text-text-tertiary")}>
      {ok ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
      {label}
    </span>
  );
}

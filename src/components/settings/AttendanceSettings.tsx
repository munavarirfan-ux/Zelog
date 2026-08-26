"use client";

import { useState } from "react";
import Switch from "@mui/material/Switch";
import { Building2, Clock, Home, Palmtree, ShieldCheck, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/* ── white settings panel ── */
function Panel({ title, sub, icon: Icon, color = "#7A4DFF", children }: {
  title: string; sub?: string; icon: LucideIcon; color?: string; children: React.ReactNode;
}) {
  return (
    <section className="rounded-card border border-border/[0.07] bg-surface p-6 shadow-card dark:border-white/[0.06]">
      <div className="mb-4 flex items-center gap-2.5">
        <span className="flex h-8 w-8 items-center justify-center rounded-[10px]" style={{ backgroundColor: `${color}18`, color }}><Icon className="h-4 w-4" strokeWidth={2} /></span>
        <div className="min-w-0">
          <h3 className="text-[15px] font-semibold text-text">{title}</h3>
          {sub ? <p className="text-xs text-text-tertiary">{sub}</p> : null}
        </div>
      </div>
      {children}
    </section>
  );
}

/**
 * Attendance policy settings — relocated from the Attendance module's own tab
 * into Settings › Attendance. Prototype only: changes are local, not persisted.
 */
export function AttendanceSettings() {
  return (
    <div className="space-y-5">
      <div className="grid gap-5 lg:grid-cols-2">
        <Panel title="Office Rules" sub="Geofence & timing" icon={Building2} color="#34D399">
          <div className="space-y-1">
            <PolicyText label="Office radius" defaultValue="150" suffix="meters" />
            <PolicyText label="Grace time" defaultValue="10" suffix="minutes" />
            <PolicyText label="Late after" defaultValue="09:15" suffix="AM" />
            <PolicyText label="Half day if under" defaultValue="04:00" suffix="hours" />
            <PolicyText label="Full day at" defaultValue="08:30" suffix="hours" />
            <PolicyToggle label="Multiple office locations" defaultChecked />
            <PolicyToggle label="Flexible working hours" defaultChecked />
            <PolicyToggle label="Allow night shift" />
          </div>
        </Panel>

        <Panel title="Work From Home Policy" sub="Verification & limits" icon={Home} color="#38BDF8">
          <div className="space-y-1">
            <PolicyToggle label="Require GPS" defaultChecked />
            <PolicyToggle label="Require selfie" defaultChecked />
            <PolicyToggle label="Mock location detection" defaultChecked />
            <PolicyText label="Location refresh" defaultValue="30" suffix="minutes" />
            <PolicyText label="Photo refresh" defaultValue="120" suffix="minutes" />
            <PolicyText label="Minimum working hours" defaultValue="08:00" suffix="hours" />
            <PolicyText label="Max distance allowed" defaultValue="50" suffix="km" />
            <PolicyToggle label="Auto checkout at end of day" defaultChecked />
          </div>
        </Panel>

        <Panel title="Overtime & Breaks" icon={Clock} color="#F472B6">
          <div className="space-y-1">
            <PolicyToggle label="Overtime tracking" defaultChecked />
            <PolicyText label="Overtime after" defaultValue="08:30" suffix="hours" />
            <PolicyText label="Max break duration" defaultValue="60" suffix="minutes" />
            <PolicyToggle label="Paid breaks" />
          </div>
        </Panel>

        <Panel title="Weekend & Holiday Rules" icon={Palmtree} color="#8B5CF6">
          <div className="space-y-1">
            <PolicyToggle label="Weekend attendance counts" />
            <PolicyToggle label="Holiday work as overtime" defaultChecked />
            <PolicyToggle label="Auto-mark holidays" defaultChecked />
            <PolicyText label="Weekly off days" defaultValue="Sat, Sun" />
          </div>
          <div className="mt-4 flex items-start gap-2 rounded-[12px] bg-surface-2/50 px-3 py-2.5">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-text-tertiary" />
            <p className="text-xs text-text-secondary"><span className="font-semibold text-text">Prototype</span> — policy changes are local only and not persisted to a backend.</p>
          </div>
        </Panel>
      </div>
    </div>
  );
}

function PolicyToggle({ label, defaultChecked }: { label: string; defaultChecked?: boolean }) {
  const [on, setOn] = useState(!!defaultChecked);
  return (
    <div className="flex items-center justify-between border-b border-border/[0.05] py-2 last:border-0">
      <span className="text-sm text-text-secondary">{label}</span>
      <Switch checked={on} onChange={(e) => setOn(e.target.checked)} size="small" sx={{ "& .Mui-checked": { color: "#7A4DFF" }, "& .Mui-checked + .MuiSwitch-track": { backgroundColor: "#7A4DFF !important" } }} />
    </div>
  );
}

function PolicyText({ label, defaultValue, suffix }: { label: string; defaultValue: string; suffix?: string }) {
  const [v, setV] = useState(defaultValue);
  return (
    <div className={cn("flex items-center justify-between gap-3 border-b border-border/[0.05] py-2 last:border-0")}>
      <span className="text-sm text-text-secondary">{label}</span>
      <div className="flex items-center gap-1.5">
        <input value={v} onChange={(e) => setV(e.target.value)} className="w-20 rounded-[8px] border border-border/[0.12] bg-surface px-2 py-1 text-right text-sm text-text focus:border-primary-400 focus:outline-none" />
        {suffix ? <span className="w-14 text-xs text-text-tertiary">{suffix}</span> : null}
      </div>
    </div>
  );
}

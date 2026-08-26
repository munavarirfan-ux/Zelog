"use client";

import { useState } from "react";
import Switch from "@mui/material/Switch";
import { Check } from "lucide-react";
import { MUI_SWITCH_SX } from "./settingsKit";

type Channel = "inApp" | "email" | "chat";
const CHANNELS: { key: Channel; label: string }[] = [
  { key: "inApp", label: "In App" },
  { key: "email", label: "Email" },
  { key: "chat", label: "Google Chat" },
];

interface Row {
  id: string;
  label: string;
  /** Channels that don't apply render as a muted dash. */
  unavailable?: Channel[];
}

const GROUPS: { title: string; rows: Row[] }[] = [
  {
    title: "Employee notifications",
    rows: [
      { id: "leave-update", label: "Leave request updates" },
      { id: "wfh-update", label: "WFH request updates" },
      { id: "attendance-reminder", label: "Attendance reminders", unavailable: ["chat"] },
      { id: "timesheet-reminder", label: "Timesheet reminders", unavailable: ["chat"] },
      { id: "holiday-reminder", label: "Holiday reminders", unavailable: ["email"] },
    ],
  },
  {
    title: "Admin notifications",
    rows: [
      { id: "pending-approvals", label: "Pending approvals" },
      { id: "attendance-exceptions", label: "Attendance exceptions", unavailable: ["chat"] },
      { id: "new-joining", label: "New employee joining" },
    ],
  },
];

const DEFAULTS: Record<string, Record<Channel, boolean>> = {};
for (const g of GROUPS) {
  for (const r of g.rows) {
    DEFAULTS[r.id] = {
      inApp: !r.unavailable?.includes("inApp"),
      email: !r.unavailable?.includes("email") && r.id !== "holiday-reminder",
      chat: !r.unavailable?.includes("chat") && (r.id === "leave-update" || r.id === "wfh-update" || r.id === "new-joining" || r.id === "holiday-reminder"),
    };
  }
}

export function NotificationsSettings() {
  const [matrix, setMatrix] = useState<Record<string, Record<Channel, boolean>>>(() =>
    JSON.parse(JSON.stringify(DEFAULTS)),
  );

  function toggle(rowId: string, channel: Channel) {
    setMatrix((m) => ({ ...m, [rowId]: { ...m[rowId], [channel]: !m[rowId][channel] } }));
  }

  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
          <Check className="h-3 w-3" /> Changes save automatically
        </span>
      </div>

      <section className="overflow-hidden rounded-card border border-border/[0.07] bg-surface shadow-card dark:border-white/[0.06]">
        {/* Column header */}
        <div className="grid grid-cols-[1fr_repeat(3,84px)] items-center gap-2 border-b border-border/[0.06] bg-surface-2/50 px-6 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-text-secondary sm:grid-cols-[1fr_repeat(3,110px)]">
          <span>Event</span>
          {CHANNELS.map((c) => <span key={c.key} className="text-center">{c.label}</span>)}
        </div>

        {GROUPS.map((group) => (
          <div key={group.title}>
            <div className="bg-surface-2/30 px-6 py-2 text-[12px] font-semibold text-text-secondary">{group.title}</div>
            <div className="divide-y divide-border/[0.06]">
              {group.rows.map((row) => (
                <div
                  key={row.id}
                  className="grid grid-cols-[1fr_repeat(3,84px)] items-center gap-2 px-6 py-2.5 transition-colors hover:bg-[rgba(99,102,241,0.03)] sm:grid-cols-[1fr_repeat(3,110px)]"
                >
                  <span className="text-sm text-text">{row.label}</span>
                  {CHANNELS.map((c) => {
                    const off = row.unavailable?.includes(c.key);
                    return (
                      <span key={c.key} className="flex justify-center">
                        {off ? (
                          <span className="text-text-tertiary/50" aria-label="Not available">—</span>
                        ) : (
                          <Switch
                            size="small"
                            checked={!!matrix[row.id]?.[c.key]}
                            onChange={() => toggle(row.id, c.key)}
                            sx={MUI_SWITCH_SX}
                            slotProps={{ input: { "aria-label": `${row.label} via ${c.label}` } }}
                          />
                        )}
                      </span>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}

"use client";

import { useState } from "react";
import { MessageSquare, Calendar, HardDrive, Check, ChevronDown, type LucideIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ToggleRow } from "./settingsKit";

interface Integration {
  id: string;
  name: string;
  desc: string;
  icon: LucideIcon;
  color: string;
  /** Chat exposes per-event notification configuration. */
  configurable?: boolean;
}

const GOOGLE_WORKSPACE: Integration[] = [
  { id: "chat", name: "Google Chat", desc: "Send celebration, leave and approval messages to Chat spaces.", icon: MessageSquare, color: "#25A56A", configurable: true },
  { id: "calendar", name: "Google Calendar", desc: "Sync holidays and approved time off to team calendars.", icon: Calendar, color: "#4285F4" },
  { id: "drive", name: "Google Drive", desc: "Store employee documents and generated reports.", icon: HardDrive, color: "#F4B400" },
];

const CHAT_EVENTS = [
  { key: "birthday", label: "Birthday wishes", desc: "Post a birthday message to the team space." },
  { key: "anniversary", label: "Anniversary wishes", desc: "Celebrate work anniversaries automatically." },
  { key: "leave", label: "Leave notifications", desc: "Notify the space when leave is approved." },
  { key: "wfh", label: "WFH notifications", desc: "Announce who is working from home today." },
  { key: "approval", label: "Approval reminders", desc: "Nudge approvers about pending requests." },
] as const;

export function IntegrationsSettings() {
  const [connected, setConnected] = useState<Record<string, boolean>>({ chat: true });
  const [expanded, setExpanded] = useState<string | null>(null);
  const [chatEvents, setChatEvents] = useState<Record<string, boolean>>({
    birthday: true, anniversary: true, leave: true, wfh: false, approval: true,
  });

  function toggleConnection(it: Integration) {
    const next = !connected[it.id];
    setConnected((c) => ({ ...c, [it.id]: next }));
    if (!next) setExpanded((e) => (e === it.id ? null : e));
    toast.success(next ? `${it.name} connected` : `${it.name} disconnected`);
  }

  return (
    <div className="space-y-5">
      <section className="overflow-hidden rounded-card border border-border/[0.07] bg-surface shadow-card dark:border-white/[0.06]">
        <div className="border-b border-border/[0.06] px-6 py-3.5">
          <h3 className="text-[13px] font-semibold uppercase tracking-wide text-text-tertiary">Google Workspace</h3>
        </div>

        <div className="divide-y divide-border/[0.06]">
          {GOOGLE_WORKSPACE.map((it) => {
            const Icon = it.icon;
            const isConnected = !!connected[it.id];
            const isOpen = expanded === it.id;
            return (
              <div key={it.id}>
                <div className="flex items-center gap-4 px-6 py-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px]" style={{ backgroundColor: `${it.color}18`, color: it.color }}>
                    <Icon className="h-5 w-5" strokeWidth={2} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-semibold text-text">{it.name}</p>
                      {isConnected && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                          <Check className="h-3 w-3" /> Connected
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 truncate text-xs text-text-tertiary">{it.desc}</p>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    {isConnected && it.configurable && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1 rounded-[10px]"
                        onClick={() => setExpanded((e) => (e === it.id ? null : it.id))}
                        aria-expanded={isOpen}
                      >
                        Configure
                        <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", isOpen && "rotate-180")} />
                      </Button>
                    )}
                    <Button
                      variant={isConnected ? "ghost" : "default"}
                      size="sm"
                      className="rounded-[10px]"
                      onClick={() => toggleConnection(it)}
                    >
                      {isConnected ? "Disconnect" : "Connect"}
                    </Button>
                  </div>
                </div>

                {/* Google Chat event configuration */}
                {it.configurable && isConnected && isOpen && (
                  <div className="border-t border-border/[0.06] bg-surface-2/40 px-6 py-2">
                    {CHAT_EVENTS.map((ev) => (
                      <ToggleRow
                        key={ev.key}
                        label={ev.label}
                        description={ev.desc}
                        checked={!!chatEvents[ev.key]}
                        onChange={(v) => setChatEvents((c) => ({ ...c, [ev.key]: v }))}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

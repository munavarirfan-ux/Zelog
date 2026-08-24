"use client";

import * as React from "react";
import { useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
import { Activity, Briefcase, CalendarClock, CalendarDays, FileText, Laptop, Network } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useDirectoryStore } from "@/store/directoryStore";
import { ACTIVITY_FILTERS, type ActivityCategory } from "@/data/directoryData";
import { cn } from "@/lib/utils";
import type { DirectoryPerson } from "../shared";
import { Section, Empty } from "./parts";

const CATEGORY_META: Record<ActivityCategory, { icon: LucideIcon; color: string }> = {
  job: { icon: Briefcase, color: "#8B7CF6" },
  attendance: { icon: CalendarDays, color: "#38BDF8" },
  leave: { icon: CalendarClock, color: "#F59E0B" },
  projects: { icon: Network, color: "#34D399" },
  documents: { icon: FileText, color: "#FB7185" },
  assets: { icon: Laptop, color: "#64748B" },
  general: { icon: Activity, color: "#7A4DFF" },
};

export function ActivityTab({ person, nameById }: { person: DirectoryPerson; nameById: Map<string, string> }) {
  const [filter, setFilter] = useState<"all" | ActivityCategory>("all");
  const allActivity = useDirectoryStore((s) => s.activity);
  const activity = useMemo(() => allActivity.filter((a) => a.employeeId === person.id), [allActivity, person.id]);

  const sorted = useMemo(() => [...activity].sort((x, y) => (x.at < y.at ? 1 : -1)), [activity]);
  const filtered = filter === "all" ? sorted : sorted.filter((a) => a.category === filter);

  return (
    <Section title="Activity & Audit Trail" icon={Activity}>
      <div className="mb-4 flex flex-wrap gap-1.5">
        {ACTIVITY_FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={cn(
              "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
              filter === f.id ? "bg-primary-gradient text-white shadow-sm" : "bg-surface-2 text-text-secondary hover:text-text",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <Empty>No activity in this category.</Empty>
      ) : (
        <ol className="relative space-y-4 border-l border-border/[0.1] pl-6">
          {filtered.map((ev) => {
            const meta = CATEGORY_META[ev.category] ?? CATEGORY_META.general;
            const Icon = meta.icon;
            return (
              <li key={ev.id} className="relative">
                <span
                  className="absolute -left-[31px] top-0 flex h-6 w-6 items-center justify-center rounded-full ring-4 ring-surface"
                  style={{ backgroundColor: `${meta.color}1F`, color: meta.color }}
                >
                  <Icon className="h-3.5 w-3.5" />
                </span>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-text">{ev.title}</p>
                    {ev.detail ? <p className="text-xs text-text-secondary">{ev.detail}</p> : null}
                    <p className="mt-0.5 text-[11px] text-text-tertiary">
                      {ev.byId ? `by ${nameById.get(ev.byId) ?? ev.byId} · ` : ""}{safeDate(ev.at)}
                    </p>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </Section>
  );
}

function safeDate(iso: string): string {
  try {
    return format(parseISO(iso), "d MMM yyyy, h:mm a");
  } catch {
    return iso;
  }
}

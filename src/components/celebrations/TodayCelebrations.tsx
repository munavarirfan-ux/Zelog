"use client";

import { useState } from "react";
import { Cake, Sparkles, UserPlus, type LucideIcon } from "lucide-react";
import { toast } from "sonner";
import { PersonAvatar } from "@/components/ui/person-avatar";
import { CelebrationWishDialog } from "./CelebrationWishDialog";
import { useHydratedCelebrations } from "@/store/celebrationStore";
import {
  ANNIVERSARIES_TODAY, BIRTHDAYS_TODAY, NEW_JOINEES_TODAY,
  UPCOMING_ANNIVERSARIES, UPCOMING_BIRTHDAYS, UPCOMING_JOINEES,
  type CelebrationEmployee, type CelebrationKind, type UpcomingCelebration,
} from "@/data/celebrationsData";
import { cn } from "@/lib/utils";

type TabKey = "birthday" | "anniversary" | "joinee";

interface TabConfig {
  key: TabKey;
  label: string;
  icon: LucideIcon;
  today: CelebrationEmployee[];
  upcoming: UpcomingCelebration[];
  todayHeading: string;
  upcomingHeading: string;
  action: string;
}

const TABS: TabConfig[] = [
  {
    key: "birthday", label: "Birthdays", icon: Cake,
    today: BIRTHDAYS_TODAY, upcoming: UPCOMING_BIRTHDAYS,
    todayHeading: "Birthdays today", upcomingHeading: "Upcoming Birthdays", action: "Wish",
  },
  {
    key: "anniversary", label: "Work Anniversaries", icon: Sparkles,
    today: ANNIVERSARIES_TODAY, upcoming: UPCOMING_ANNIVERSARIES,
    todayHeading: "Anniversaries today", upcomingHeading: "Upcoming Anniversaries", action: "Wish",
  },
  {
    key: "joinee", label: "New joinees", icon: UserPlus,
    today: NEW_JOINEES_TODAY, upcoming: UPCOMING_JOINEES,
    todayHeading: "Joined today", upcomingHeading: "Starting soon", action: "Welcome",
  },
];

/* ── One person tile: avatar + name + action link or date ── */
function PersonTile({
  employee, action, sublabel, onAction,
}: {
  employee: CelebrationEmployee; action?: string; sublabel?: string; onAction?: () => void;
}) {
  return (
    <div className="flex w-[84px] flex-col items-center text-center">
      <PersonAvatar name={employee.name} src={employee.photo} size={56} />
      <p className="mt-2 line-clamp-1 w-full text-xs font-medium text-text">{employee.name}</p>
      {action ? (
        <button
          type="button"
          onClick={onAction}
          className="mt-0.5 text-xs font-semibold text-[#0F9E6E] transition-colors hover:text-[#0B7A55]"
        >
          {action}
        </button>
      ) : (
        <p className="mt-0.5 text-[11px] text-text-tertiary">{sublabel}</p>
      )}
    </div>
  );
}

/* ── Section ── */

export function TodayCelebrations({ className }: { className?: string }) {
  useHydratedCelebrations();

  const [active, setActive] = useState<TabKey>("birthday");
  const [wish, setWish] = useState<{ employee: CelebrationEmployee; kind: CelebrationKind } | null>(null);

  const tab = TABS.find((t) => t.key === active)!;

  function handleAction(employee: CelebrationEmployee) {
    if (tab.key === "joinee") {
      toast.success(`Welcome message sent to ${employee.name.split(" ")[0]}`);
      return;
    }
    setWish({ employee, kind: tab.key });
  }

  return (
    <section className={cn("flex flex-col overflow-hidden rounded-[20px] border border-border/[0.08] bg-surface shadow-[0_1px_3px_rgba(40,30,90,0.05)]", className)}>
      {/* Tab bar — segmented control */}
      <div className="flex items-center justify-between gap-3 px-5 pt-5">
        <div className="inline-flex max-w-full items-center gap-1 overflow-x-auto rounded-[14px] bg-surface-2 p-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {TABS.map((t) => {
            const isActive = t.key === active;
            const Icon = t.icon;
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => setActive(t.key)}
                aria-current={isActive}
                className={cn(
                  "inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-[10px] px-4 py-1.5 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-surface text-text shadow-[0_1px_3px_rgba(40,30,90,0.12)]"
                    : "text-text-tertiary hover:text-text-secondary",
                )}
              >
                <Icon className="h-4 w-4" strokeWidth={2} />
                <span className="tabular-nums">{t.today.length}</span> {t.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-1 flex-col px-5 pb-5 pt-5">
        {/* Today */}
        <p className="mb-4 text-sm font-medium text-text">{tab.todayHeading}</p>
        {tab.today.length > 0 ? (
          <div className="flex flex-wrap gap-x-5 gap-y-4">
            {tab.today.map((e) => (
              <PersonTile key={e.id} employee={e} action={tab.action} onAction={() => handleAction(e)} />
            ))}
          </div>
        ) : (
          <p className="text-xs text-text-tertiary">Nothing to celebrate today.</p>
        )}

        {/* Upcoming */}
        {tab.upcoming.length > 0 ? (
          <>
            <p className="mb-4 mt-7 text-sm font-medium text-text">{tab.upcomingHeading}</p>
            <div className="flex flex-wrap gap-x-5 gap-y-4">
              {tab.upcoming.map((e) => (
                <PersonTile key={e.id} employee={e} sublabel={e.whenLabel} />
              ))}
            </div>
          </>
        ) : null}
      </div>

      <CelebrationWishDialog
        open={wish !== null}
        employee={wish?.employee ?? null}
        kind={wish?.kind ?? "birthday"}
        onClose={() => setWish(null)}
      />
    </section>
  );
}

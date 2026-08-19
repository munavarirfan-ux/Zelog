"use client";

import { useMemo, useState } from "react";
import { Building2, Laptop, Palmtree, Users } from "lucide-react";
import { toast } from "sonner";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useHydratedTimeOff, useTimeOffStore } from "@/store/timeOffStore";
import { useHydratedHolidays, useHolidayStore } from "@/store/holidayStore";
import { HomeHero, type KpiItem } from "@/components/home/HomeHero";
import { OnLeaveTodayCard, WorkingFromHomeCard } from "@/components/home/PeopleTodayCard";
import { NewJoinersCard } from "@/components/home/NewJoinersCard";
import { TodayCelebrations } from "@/components/celebrations/TodayCelebrations";
import { HolidaysShowcase } from "@/components/home/HolidaysShowcase";
import { AdminAttentionCard } from "@/components/home/AdminAttentionCard";
import { RequestTimeOffDialog } from "@/components/timeoff/RequestTimeOffDialog";
import {
  ON_LEAVE_TODAY,
  WFH_TODAY,
  NEW_JOINERS,
  PRESENT_COUNT,
  ON_LEAVE_COUNT,
  WFH_COUNT,
  WORKFORCE_TOTAL,
  upcomingHolidays,
} from "@/data/homeData";
import type { RequestCategory } from "@/data/timeOffData";

export default function HomePage() {
  const { currentUser, activeRole } = useCurrentUser();
  const isStaff = activeRole === "admin" || activeRole === "super-admin";
  const isSuperAdmin = activeRole === "super-admin";
  const canViewProfiles = true;

  const firstName = currentUser.name.split(" ")[0];
  const hour = new Date().getHours();

  useHydratedTimeOff();
  useHydratedHolidays();
  const requests = useTimeOffStore((s) => s.requests);
  const holidays = useHolidayStore((s) => s.holidays);

  const { leavePending, wfhPending } = useMemo(() => {
    const open = requests.filter((r) => r.status === "pending" || r.status === "changes-requested");
    const scoped = isSuperAdmin ? open : open.filter((r) => r.approverIds.includes(currentUser.id));
    return {
      leavePending: scoped.filter((r) => r.requestCategory === "leave"),
      wfhPending: scoped.filter((r) => r.requestCategory === "wfh"),
    };
  }, [requests, isSuperAdmin, currentUser.id]);

  const nextHolidays = useMemo(() => upcomingHolidays(holidays, 8), [holidays]);

  const kpis: KpiItem[] = [
    { label: "Total Employees", count: WORKFORCE_TOTAL, delta: 3.72, icon: Users, color: "#7A4DFF" },
    { label: "Present Today", count: PRESENT_COUNT, delta: 5.02, icon: Building2, color: "#34D399" },
    { label: "On Leave", count: ON_LEAVE_COUNT, delta: -1.72, icon: Palmtree, color: "#F472B6" },
    { label: "Working Remotely", count: WFH_COUNT, delta: 2.4, icon: Laptop, color: "#38BDF8" },
  ];

  const [dialogCategory, setDialogCategory] = useState<RequestCategory | null>(null);

  return (
    <div className="space-y-5 pb-4">
      <HomeHero
        firstName={firstName}
        hour={hour}
        onApplyLeave={() => setDialogCategory("leave")}
        onApplyWfh={() => setDialogCategory("wfh")}
        kpis={kpis}
      />

      {/* Row: people today + attention */}
      <div className={`grid gap-4 ${isStaff ? "lg:grid-cols-3" : "lg:grid-cols-2"}`}>
        <OnLeaveTodayCard entries={ON_LEAVE_TODAY} canViewProfiles={canViewProfiles} />
        <WorkingFromHomeCard entries={WFH_TODAY} canViewProfiles={canViewProfiles} />
        {isStaff ? <AdminAttentionCard leavePending={leavePending} wfhPending={wfhPending} /> : null}
      </div>

      {/* Signature celebrations widget */}
      <TodayCelebrations />

      {/* New joiners + holiday showcase, equal height */}
      <div className="grid gap-4 lg:grid-cols-2 lg:items-stretch">
        <NewJoinersCard entries={NEW_JOINERS} canViewProfiles={canViewProfiles} className="lg:h-[460px]" />
        <HolidaysShowcase holidays={nextHolidays} className="lg:h-[460px]" />
      </div>

      <RequestTimeOffDialog
        open={dialogCategory !== null}
        employeeId={currentUser.id}
        initialCategory={dialogCategory ?? "leave"}
        onClose={() => setDialogCategory(null)}
        onSaved={() => {
          toast.success(dialogCategory === "wfh" ? "Work from home request submitted" : "Leave request submitted");
          setDialogCategory(null);
        }}
      />
    </div>
  );
}

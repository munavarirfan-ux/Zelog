"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, Laptop, Palmtree, Users } from "lucide-react";
import { toast } from "sonner";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useHydratedTimeOff, useTimeOffStore } from "@/store/timeOffStore";
import { useHydratedHolidays, useHolidayStore } from "@/store/holidayStore";
import { HomeHero, HeroQuickAdd, type KpiItem, type QuickAddKind } from "@/components/home/HomeHero";
import { OnLeaveTodayCard, WorkingFromHomeCard } from "@/components/home/PeopleTodayCard";
import { TodayCelebrations } from "@/components/celebrations/TodayCelebrations";
import { HolidaysShowcase } from "@/components/home/HolidaysShowcase";
import { AdminAttentionCard } from "@/components/home/AdminAttentionCard";
import { AttendanceOverviewCard } from "@/components/attendance/AdminViews";
import { RequestTimeOffDialog } from "@/components/timeoff/RequestTimeOffDialog";
import {
  ON_LEAVE_TODAY,
  WFH_TODAY,
  PRESENT_COUNT,
  ON_LEAVE_COUNT,
  WFH_COUNT,
  WORKFORCE_TOTAL,
  getEmployee,
  upcomingHolidays,
} from "@/data/homeData";

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

  const leavePending = useMemo(() => {
    const open = requests.filter((r) => r.status === "pending" || r.status === "changes-requested");
    return isSuperAdmin ? open : open.filter((r) => r.approverIds.includes(currentUser.id));
  }, [requests, isSuperAdmin, currentUser.id]);

  const nextHolidays = useMemo(() => upcomingHolidays(holidays, 8), [holidays]);

  // Employee view scopes the people cards to the current user's own team.
  const myDept = getEmployee(currentUser.id)?.department;
  const teamOnLeave = useMemo(() => ON_LEAVE_TODAY.filter((e) => getEmployee(e.employeeId)?.department === myDept), [myDept]);
  const teamWfh = useMemo(() => WFH_TODAY.filter((e) => getEmployee(e.employeeId)?.department === myDept), [myDept]);

  const kpis: KpiItem[] = [
    { label: "Total Employees", count: WORKFORCE_TOTAL, delta: 3.72, icon: Users, color: "#7A4DFF" },
    { label: "Present Today", count: PRESENT_COUNT, delta: 5.02, icon: Building2, color: "#34D399" },
    { label: "On Leave", count: ON_LEAVE_COUNT, delta: -1.72, icon: Palmtree, color: "#F472B6" },
    { label: "Working Remotely", count: WFH_COUNT, delta: 2.4, icon: Laptop, color: "#38BDF8" },
  ];

  const [leaveOpen, setLeaveOpen] = useState(false);

  const router = useRouter();
  const QUICK_ADD_ROUTES: Record<QuickAddKind, { href: string; label: string }> = {
    employee: { href: "/directory?new=1", label: "employee" },
    holiday: { href: "/time-off?new=holiday", label: "holiday" },
    client: { href: "/clients?new=1", label: "client" },
    project: { href: "/projects?new=1", label: "project" },
  };
  function handleQuickAdd(kind: QuickAddKind) {
    const { href, label } = QUICK_ADD_ROUTES[kind];
    router.push(href);
    toast.success(`Add a new ${label}`);
  }

  return (
    <div className="space-y-5 pb-4">
      <HomeHero
        firstName={firstName}
        hour={hour}
        onApplyLeave={() => setLeaveOpen(true)}
        kpis={kpis}
        actions={isSuperAdmin ? <HeroQuickAdd onSelect={handleQuickAdd} /> : undefined}
      />

      {isStaff ? (
        <>
          {/* Row: attention + people today */}
          <div className="grid gap-4 lg:grid-cols-3">
            <AdminAttentionCard leavePending={leavePending} />
            <WorkingFromHomeCard entries={WFH_TODAY} canViewProfiles={canViewProfiles} />
            <OnLeaveTodayCard entries={ON_LEAVE_TODAY} canViewProfiles={canViewProfiles} />
          </div>

          {/* Today's attendance snapshot */}
          <AttendanceOverviewCard onOpenTracking={() => router.push("/attendance")} />

          {/* Celebrations + holidays bento */}
          <div className="grid gap-4 lg:grid-cols-3 lg:items-stretch">
            <TodayCelebrations className="lg:col-span-2" />
            <HolidaysShowcase holidays={nextHolidays} />
          </div>
        </>
      ) : (
        <>
          {/* Employee: celebrations first, then their team, then holidays + new joiners */}
          <TodayCelebrations />

          <div className="grid gap-4 lg:grid-cols-2 lg:items-stretch">
            <OnLeaveTodayCard
              entries={teamOnLeave}
              canViewProfiles={canViewProfiles}
              title="Team on Leave"
              emptyMessage="No one on your team is on leave today"
            />
            <WorkingFromHomeCard
              entries={teamWfh}
              canViewProfiles={canViewProfiles}
              title="Team Working Remotely"
              emptyMessage="No one on your team is working remotely today"
            />
          </div>

          <HolidaysShowcase holidays={nextHolidays} />
        </>
      )}

      <RequestTimeOffDialog
        open={leaveOpen}
        employeeId={currentUser.id}
        onClose={() => setLeaveOpen(false)}
        onSaved={() => {
          toast.success("Leave request submitted");
          setLeaveOpen(false);
        }}
      />
    </div>
  );
}

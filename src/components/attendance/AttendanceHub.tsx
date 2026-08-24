"use client";

import { useEffect, useState } from "react";
import {
  CalendarDays, Clock, LayoutDashboard, ListChecks, Radio,
} from "lucide-react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useHydratedAttendance } from "@/store/attendanceStore";
import { countByStatus } from "@/data/attendanceData";
import { SubNav, type SubNavItem } from "./shared";
import {
  EmployeeAttendanceHero, EmployeeCalendar, EmployeeHistory, EmployeeRequests,
} from "./EmployeeViews";
import {
  AdminApprovals, AdminDashboard, AdminTracking, AttendanceHero,
} from "./AdminViews";

const EMPLOYEE_TABS: SubNavItem[] = [
  { id: "history", label: "Attendance Log", icon: Clock },
  { id: "calendar", label: "Calendar", icon: CalendarDays },
  { id: "requests", label: "Attendance Request", icon: ListChecks },
];

const ADMIN_TABS: SubNavItem[] = [
  { id: "tracking", label: "Attendance Tracking", icon: Radio },
  { id: "approvals", label: "Attendance Log Requests", icon: ListChecks },
  { id: "dashboard", label: "Attendance Analytics", icon: LayoutDashboard },
];

export function AttendanceHub() {
  useHydratedAttendance();
  const { activeRole } = useCurrentUser();
  const isStaff = activeRole === "admin" || activeRole === "super-admin";
  const tabs = isStaff ? ADMIN_TABS : EMPLOYEE_TABS;
  const [tab, setTab] = useState(isStaff ? "tracking" : "history");

  // The role store hydrates on the client, so the very first render may assume a
  // different role than the persisted one. If the active tab isn't valid for the
  // resolved role's tab set, fall back to that set's first tab.
  useEffect(() => {
    if (!tabs.some((t) => t.id === tab)) setTab(tabs[0].id);
  }, [tabs, tab]);

  if (isStaff) {
    return (
      <div className="space-y-6 pb-6">
        {/* Hero (with KPIs) → Tabs → Content */}
        <AttendanceHero
          present={countByStatus("present")}
          wfh={countByStatus("wfh")}
          leave={countByStatus("leave")}
          late={countByStatus("late")}
        />
        <SubNav items={tabs} value={tab} onChange={setTab} />
        <div>
          {tab === "dashboard" && <AdminDashboard onNavigate={setTab} />}
          {tab === "approvals" && <AdminApprovals />}
          {tab === "tracking" && <AdminTracking />}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-6">
      <EmployeeAttendanceHero />

      <SubNav items={tabs} value={tab} onChange={setTab} />

      <div>
        {tab === "history" && <EmployeeHistory />}
        {tab === "calendar" && <EmployeeCalendar />}
        {tab === "requests" && <EmployeeRequests />}
      </div>
    </div>
  );
}

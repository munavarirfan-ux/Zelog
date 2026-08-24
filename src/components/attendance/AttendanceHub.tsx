"use client";

import { useEffect, useState } from "react";
import {
  CalendarDays, Clock, LayoutDashboard, ListChecks, MapPin, Radio,
} from "lucide-react";
import { toast } from "sonner";
import { RequestTimeOffDialog } from "@/components/timeoff/RequestTimeOffDialog";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useHydratedAttendance } from "@/store/attendanceStore";
import { countByStatus } from "@/data/attendanceData";
import { SubNav, type SubNavItem } from "./shared";
import {
  EmployeeAttendanceHero, EmployeeCalendar, EmployeeDashboard, EmployeeHistory, EmployeeLocation, EmployeeRequests,
} from "./EmployeeViews";
import {
  AdminApprovals, AdminDashboard, AdminTracking, AttendanceHero,
} from "./AdminViews";

const EMPLOYEE_TABS: SubNavItem[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "history", label: "My Attendance", icon: Clock },
  { id: "calendar", label: "Calendar", icon: CalendarDays },
  { id: "requests", label: "Requests", icon: ListChecks },
  { id: "location", label: "Location", icon: MapPin },
];

const ADMIN_TABS: SubNavItem[] = [
  { id: "tracking", label: "Attendance Tracking", icon: Radio },
  { id: "approvals", label: "Attendance Log Requests", icon: ListChecks },
  { id: "dashboard", label: "Attendance Analytics", icon: LayoutDashboard },
];

export function AttendanceHub() {
  useHydratedAttendance();
  const { currentUser, activeRole } = useCurrentUser();
  const isStaff = activeRole === "admin" || activeRole === "super-admin";
  const tabs = isStaff ? ADMIN_TABS : EMPLOYEE_TABS;
  const [tab, setTab] = useState(isStaff ? "tracking" : "dashboard");
  const [wfhOpen, setWfhOpen] = useState(false);

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
          onApplyWfh={() => setWfhOpen(true)}
        />
        <SubNav items={tabs} value={tab} onChange={setTab} />
        <div>
          {tab === "dashboard" && <AdminDashboard onNavigate={setTab} />}
          {tab === "approvals" && <AdminApprovals />}
          {tab === "tracking" && <AdminTracking />}
        </div>

        <RequestTimeOffDialog
          open={wfhOpen}
          employeeId={currentUser.id}
          initialCategory="wfh"
          onClose={() => setWfhOpen(false)}
          onSaved={() => {
            toast.success("Work from home request submitted");
            setWfhOpen(false);
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-6">
      <EmployeeAttendanceHero />

      <SubNav items={tabs} value={tab} onChange={setTab} />

      <div>
        {tab === "dashboard" && <EmployeeDashboard />}
        {tab === "history" && <EmployeeHistory />}
        {tab === "calendar" && <EmployeeCalendar />}
        {tab === "requests" && <EmployeeRequests />}
        {tab === "location" && <EmployeeLocation />}
      </div>
    </div>
  );
}

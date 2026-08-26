"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Bell, CalendarDays, ChevronDown, IdCard, Landmark, ListChecks,
  Palette, Palmtree, ShieldCheck, User,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { type Permission } from "@/config/permissions";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { MyProfileSettings } from "./MyProfileSettings";
import { AppearanceSettings } from "./AppearanceSettings";
import { NotificationsSettings } from "./NotificationsSettings";
import { TimeOffSettings } from "./TimeOffSettings";
import { AttendanceSettings } from "./AttendanceSettings";
import { RoleSettings } from "./RoleSettings";
import { HolidayCalendarSettings } from "./HolidayCalendarSettings";
import { EnterpriseSettings } from "./EnterpriseSettings";
import { EmployeeSetupSettings } from "./EmployeeSetupSettings";

interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  /** Subtitle shown under the title in the tinted page-header band. */
  desc?: string;
  /** Extra terms the settings search should match (GPS → Attendance, etc.). */
  keywords?: string[];
  /** Staff-only (admin / super-admin). */
  staff?: boolean;
  /** Super-admin only (platform-level). */
  superAdmin?: boolean;
  /** Optional capability gate layered on top of the role check. */
  permission?: Permission;
  render: () => React.ReactNode;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const NAV: NavGroup[] = [
  {
    label: "Workspace",
    items: [
      { id: "enterprise", label: "Enterprise Setup", icon: Landmark, superAdmin: true, desc: "Company profile, regional defaults and the shared org structure.", keywords: ["company", "profile", "legal entity", "business unit", "fiscal", "brand", "locations", "departments"], render: () => <EnterpriseSettings /> },
    ],
  },
  {
    label: "Workforce",
    items: [
      { id: "employee-setup", label: "Employee Setup", icon: IdCard, staff: true, desc: "Employee codes, record option sets and onboarding defaults.", keywords: ["employee code", "id", "designation", "grade", "documents", "onboarding", "fields"], render: () => <EmployeeSetupSettings /> },
      { id: "attendance", label: "Attendance", icon: ListChecks, staff: true, desc: "Working hours, attendance rules and location verification.", keywords: ["gps", "geofence", "clock in", "working hours", "wfh", "regularization", "location"], render: () => <AttendanceSettings /> },
      { id: "time-off", label: "Time Off", icon: Palmtree, staff: true, desc: "Leave types, policies, accrual and balances.", keywords: ["leave", "accrual", "carry forward", "balance", "policy", "approval", "wfh"], render: () => <TimeOffSettings /> },
      { id: "holidays", label: "Holidays", icon: CalendarDays, staff: true, desc: "Holiday calendars and location-aware holiday lists.", keywords: ["calendar", "public holiday", "optional", "location", "region"], render: () => <HolidayCalendarSettings /> },
    ],
  },
  {
    label: "Access",
    items: [
      { id: "roles", label: "Roles & Permissions", icon: ShieldCheck, superAdmin: true, desc: "Roles and the permissions granted to each.", keywords: ["role", "permission", "access", "admin", "matrix"], render: () => <RoleSettings /> },
      { id: "notifications", label: "Notifications", icon: Bell, desc: "Choose how each event reaches you.", keywords: ["email", "reminder", "alert", "chat", "in app"], render: () => <NotificationsSettings /> },
    ],
  },
  {
    label: "Personal",
    items: [
      { id: "profile", label: "My Profile", icon: User, desc: "Your personal details and account security.", keywords: ["account", "password", "photo", "security", "phone"], render: () => <MyProfileSettings /> },
      { id: "appearance", label: "Appearance", icon: Palette, desc: "Personalize how ZE[FLOW] looks for you.", keywords: ["theme", "dark", "light", "accent", "color", "density"], render: () => <AppearanceSettings /> },
    ],
  },
];

export function SettingsHub() {
  const { activeRole, hasPermission } = useCurrentUser();
  const isStaff = activeRole === "admin" || activeRole === "super-admin";
  const isSuperAdmin = activeRole === "super-admin";

  // Role-gated groups (empty groups drop out entirely).
  const groups = useMemo(() => {
    const canSee = (i: NavItem) =>
      (!i.staff || isStaff) && (!i.superAdmin || isSuperAdmin) && (!i.permission || hasPermission(i.permission));
    return NAV
      .map((g) => ({ ...g, items: g.items.filter(canSee) }))
      .filter((g) => g.items.length > 0);
  }, [isStaff, isSuperAdmin, hasPermission]);

  const allItems = useMemo(() => groups.flatMap((g) => g.items), [groups]);

  const [active, setActive] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);

  // Land on (and stay on) a category the current role can actually see.
  useEffect(() => {
    if (allItems.length === 0) return;
    if (!allItems.some((i) => i.id === active)) setActive(allItems[0].id);
  }, [allItems, active]);

  const current = allItems.find((i) => i.id === active) ?? allItems[0];

  function choose(id: string) {
    setActive(id);
    setMobileOpen(false);
  }

  const nav = (
    <>
      {/* Header */}
      <div className="px-1 pb-3">
        <p className="text-[15px] font-semibold text-text">Settings</p>
        <p className="text-xs text-text-tertiary">Workspace preferences</p>
      </div>

      {/* Grouped items */}
      <div className="space-y-4">
        {groups.map((group) => (
          <div key={group.label}>
            <p className="px-2 pb-1 text-[11px] font-semibold uppercase tracking-wide text-text-tertiary">{group.label}</p>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = item.id === current?.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => choose(item.id)}
                    aria-current={isActive}
                    className={cn(
                      "flex min-h-[42px] w-full items-center gap-2.5 rounded-[10px] px-2.5 py-2 text-left text-sm font-medium transition-colors duration-150",
                      isActive
                        ? "bg-primary-soft text-primary-700 dark:bg-primary-100 dark:text-primary-300"
                        : "text-text-secondary hover:bg-primary-soft/50 hover:text-text dark:hover:bg-primary-100/50",
                    )}
                  >
                    <Icon className={cn("h-[18px] w-[18px] shrink-0", isActive ? "" : "text-text-tertiary")} strokeWidth={2} />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </>
  );

  return (
    <div className="pb-12">
      {/* Mobile: disclosure instead of a permanent rail */}
      <div className="lg:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen((o) => !o)}
          aria-expanded={mobileOpen}
          className="flex w-full items-center justify-between gap-2 rounded-card border border-border/[0.07] bg-surface px-4 py-3 shadow-card dark:border-white/[0.06]"
        >
          <span className="flex items-center gap-2.5">
            {current && <current.icon className="h-[18px] w-[18px] text-primary-700" strokeWidth={2} />}
            <span className="text-sm font-semibold text-text">{current?.label ?? "Settings"}</span>
          </span>
          <ChevronDown className={cn("h-4 w-4 text-text-tertiary transition-transform", mobileOpen && "rotate-180")} />
        </button>
        {mobileOpen && (
          <div className="mt-2 rounded-card border border-border/[0.07] bg-surface p-3 shadow-float dark:border-white/[0.06]">
            {nav}
          </div>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-[236px_1fr]">
        {/* Desktop: two-column settings workspace */}
        <aside className="hidden lg:block">
          <nav className="sticky top-4 rounded-card border border-border/[0.07] bg-surface p-3 shadow-card dark:border-white/[0.06]">
            {nav}
          </nav>
        </aside>

        {/* Selected settings content */}
        <div className="min-w-0 space-y-5">
          {/* Page-header band — bold purple hero */}
          <section className="relative overflow-hidden rounded-shell bg-hero px-6 py-6 text-white shadow-[0_20px_60px_-24px_rgba(49,46,129,0.55)] sm:px-8">
            <div aria-hidden className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full bg-white/10 blur-3xl" />
            <div aria-hidden className="pointer-events-none absolute -bottom-20 left-1/3 h-44 w-44 rounded-full bg-white/5 blur-3xl" />
            <div className="relative flex items-center gap-3.5">
              {current && (
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] bg-white/15">
                  <current.icon className="h-5 w-5" strokeWidth={2} />
                </span>
              )}
              <div className="min-w-0">
                <h1 className="text-xl font-semibold tracking-tight">{current?.label}</h1>
                {current?.desc && <p className="mt-0.5 text-sm text-white/65">{current.desc}</p>}
              </div>
            </div>
          </section>

          {current?.render()}
        </div>
      </div>
    </div>
  );
}

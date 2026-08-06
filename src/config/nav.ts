import {
  BarChart3,
  Briefcase,
  Building2,
  Contact,
  FolderKanban,
  LayoutDashboard,
  Network,
  Settings,
  Timer,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export interface NavGroup {
  /** Uppercase section header. Omit for a standalone/global group with no divider label. */
  label?: string;
  items: NavItem[];
}

export const NAV_GROUPS: NavGroup[] = [
  {
    label: "Ze[log]",
    items: [
      { href: "/tracker", label: "Tracker", icon: Timer },
      { href: "/projects", label: "Projects", icon: FolderKanban },
      { href: "/clients", label: "Clients", icon: Building2 },
      { href: "/team", label: "Team", icon: Users },
      { href: "/reports", label: "Reports", icon: BarChart3 },
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    ],
  },
  {
    label: "Ze[teams]",
    items: [
      { href: "/workplace", label: "Time-off", icon: Briefcase },
      { href: "/directory", label: "Directory", icon: Contact },
      { href: "/organization", label: "Organization", icon: Network },
    ],
  },
  {
    items: [{ href: "/settings", label: "Settings", icon: Settings }],
  },
];

/** Flat list of every navigable item, derived from the grouped structure. */
export const NAV_ITEMS: NavItem[] = NAV_GROUPS.flatMap((group) => group.items);

export const APP_NAME = "zelog";
export const COMPANY_NAME = "Zessta Software Solutions";

/* ─── Roles & navigation permissions ─── */

export type Role = "super-admin" | "admin" | "employee";

export interface RoleOption {
  id: Role;
  name: string;
  description: string;
}

export const ROLE_OPTIONS: RoleOption[] = [
  { id: "super-admin", name: "Company Head", description: "Full access to every module and setting." },
  { id: "admin", name: "Manager", description: "Manage the workspace, teams, and projects." },
  { id: "employee", name: "Employee", description: "Your personal tracking and information." },
];

export const DEFAULT_ROLE: Role = "super-admin";

/** Personal features an Employee can reach, with personal-scope label overrides. */
const EMPLOYEE_HREFS = new Set(["/tracker", "/projects", "/reports", "/directory", "/workplace", "/organization"]);
const EMPLOYEE_LABELS: Record<string, string> = {
  "/projects": "My Projects",
  "/reports": "My Reports",
};

/** Returns the navigation groups visible for a given role (empty groups dropped). */
export function getNavGroupsForRole(role: Role): NavGroup[] {
  if (role === "super-admin") return NAV_GROUPS;

  if (role === "admin") {
    // Full workspace management, but platform-level settings are hidden.
    return NAV_GROUPS
      .map((group) => ({ ...group, items: group.items.filter((item) => item.href !== "/settings") }))
      .filter((group) => group.items.length > 0);
  }

  // Employee — personal features only.
  return NAV_GROUPS
    .map((group) => ({
      ...group,
      items: group.items
        .filter((item) => EMPLOYEE_HREFS.has(item.href))
        .map((item) => (EMPLOYEE_LABELS[item.href] ? { ...item, label: EMPLOYEE_LABELS[item.href] } : item)),
    }))
    .filter((group) => group.items.length > 0);
}

/** Whether a pathname is reachable for the given role. */
export function isHrefAllowedForRole(role: Role, pathname: string): boolean {
  return getNavGroupsForRole(role).some((group) =>
    group.items.some((item) => pathname === item.href || pathname.startsWith(`${item.href}/`)),
  );
}

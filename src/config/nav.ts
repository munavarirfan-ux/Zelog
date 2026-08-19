import {
  BarChart3,
  Building2,
  Contact,
  FolderKanban,
  Home,
  Inbox,
  LayoutDashboard,
  ListChecks,
  MoreHorizontal,
  Network,
  Palmtree,
  Settings,
  Timer,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  hasPermission,
  permissionsForRole,
  ROLE_PERMISSIONS,
  type Permission,
  type Role,
} from "./permissions";

export type { Role, Permission } from "./permissions";
export { hasPermission, permissionsForRole, ROLE_PERMISSIONS } from "./permissions";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Roles that may see/reach this destination. */
  roles: Role[];
  /** Optional permission gate layered on top of the role check. */
  permission?: Permission;
}

export interface NavGroup {
  /** Uppercase section header. Omit for a standalone/global group (no label). */
  label?: string;
  items: NavItem[];
}

const ALL: Role[] = ["super-admin", "admin", "employee"];
const STAFF: Role[] = ["super-admin", "admin"];

/**
 * The Ze[flow] information architecture — the single source of truth consumed
 * by the desktop sidebar, the mobile navigation, and the route guard alike.
 */
export const NAV_GROUPS: NavGroup[] = [
  {
    // Standalone Home (no section header).
    items: [{ href: "/", label: "Home", icon: Home, roles: ALL }],
  },
  {
    label: "Ze[log]",
    items: [
      { href: "/tracker", label: "Tracker", icon: Timer, roles: ALL },
      { href: "/projects", label: "Projects", icon: FolderKanban, roles: ALL },
      { href: "/clients", label: "Clients", icon: Building2, roles: STAFF, permission: "clients.view" },
      { href: "/reports", label: "Reports", icon: BarChart3, roles: STAFF, permission: "reports.view" },
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: STAFF, permission: "reports.view" },
    ],
  },
  {
    label: "Ze[teams]",
    items: [
      { href: "/attendance", label: "Attendance", icon: ListChecks, roles: ALL, permission: "attendance.view" },
      { href: "/time-off", label: "Time Off", icon: Palmtree, roles: ALL, permission: "timeoff.view" },
      { href: "/inbox", label: "Inbox", icon: Inbox, roles: STAFF, permission: "inbox.view" },
      { href: "/directory", label: "Directory", icon: Contact, roles: ALL, permission: "employees.view" },
      { href: "/organization", label: "Organization", icon: Network, roles: ALL, permission: "employees.view" },
    ],
  },
  {
    // Standalone Settings (no section header). Employee sees personal settings;
    // broader management is gated by "settings.manage" inside the page later.
    items: [{ href: "/settings", label: "Settings", icon: Settings, roles: ALL }],
  },
];

/** Flat list of every navigable item, derived from the grouped structure. */
export const NAV_ITEMS: NavItem[] = NAV_GROUPS.flatMap((group) => group.items);

export const APP_NAME = "zeflow";
export const COMPANY_NAME = "Zessta Software Solutions";

/* ─── Roles ─── */

export interface RoleOption {
  id: Role;
  name: string;
  description: string;
}

export const ROLE_OPTIONS: RoleOption[] = [
  { id: "super-admin", name: "Super Admin", description: "Full access to every module and setting." },
  { id: "admin", name: "Admin", description: "Manage the workspace, teams, and projects." },
  { id: "employee", name: "Employee", description: "Your personal tracking and information." },
];

export const DEFAULT_ROLE: Role = "super-admin";

/* ─── Role + permission resolution ─── */

/** Whether a single item is visible to a role holding the given permissions. */
function itemAllowed(item: NavItem, role: Role, permissions: readonly string[]): boolean {
  return item.roles.includes(role) && hasPermission(permissions, item.permission);
}

/**
 * Navigation groups visible for a role. Empty groups are dropped so no section
 * header (Ze[log] / Ze[teams]) ever renders without items beneath it.
 */
export function getNavGroupsForRole(
  role: Role,
  permissions: readonly string[] = permissionsForRole(role),
): NavGroup[] {
  return NAV_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter((item) => itemAllowed(item, role, permissions)),
  })).filter((group) => group.items.length > 0);
}

/** Flat, role-filtered list of items in navigation order. */
export function getNavItemsForRole(
  role: Role,
  permissions: readonly string[] = permissionsForRole(role),
): NavItem[] {
  return getNavGroupsForRole(role, permissions).flatMap((g) => g.items);
}

/** Find the nav item whose href owns the given pathname (longest match wins). */
export function findNavItemByPath(pathname: string): NavItem | undefined {
  return [...NAV_ITEMS]
    .filter((item) =>
      item.href === "/" ? pathname === "/" : pathname === item.href || pathname.startsWith(`${item.href}/`),
    )
    .sort((a, b) => b.href.length - a.href.length)[0];
}

/**
 * Whether a pathname is reachable for a role/permission set. Paths not owned by
 * any nav item (legacy or detail routes) are permitted — the guard only blocks
 * destinations it explicitly knows to be restricted.
 */
export function isHrefAllowedForRole(
  role: Role,
  pathname: string,
  permissions: readonly string[] = permissionsForRole(role),
): boolean {
  const item = findNavItemByPath(pathname);
  if (!item) return true;
  return itemAllowed(item, role, permissions);
}

/* ─── Mobile navigation (derived from the same config) ─── */

/** Primary destinations pinned to the mobile bottom bar. */
export const MOBILE_PRIMARY_HREFS = ["/", "/tracker", "/time-off", "/directory"] as const;

export const MOBILE_MORE = { label: "More", icon: MoreHorizontal } as const;

/** Role-filtered primary items, in the order defined above. */
export function getMobilePrimaryItems(
  role: Role,
  permissions: readonly string[] = permissionsForRole(role),
): NavItem[] {
  const visible = getNavItemsForRole(role, permissions);
  return MOBILE_PRIMARY_HREFS.map((href) => visible.find((i) => i.href === href)).filter(
    (i): i is NavItem => Boolean(i),
  );
}

/** Everything visible that isn't already a primary tab → shown in "More". */
export function getMobileMoreItems(
  role: Role,
  permissions: readonly string[] = permissionsForRole(role),
): NavItem[] {
  const primary = new Set<string>(MOBILE_PRIMARY_HREFS);
  return getNavItemsForRole(role, permissions).filter((i) => !primary.has(i.href));
}

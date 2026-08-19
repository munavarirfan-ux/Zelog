/**
 * Ze[flow] permission layer.
 *
 * Roles are a coarse grouping; permissions are the real access primitive. This
 * lets us later introduce finer roles (HR Admin, Manager, Team Lead, Finance,
 * Project Manager, custom roles) without touching navigation or route guards —
 * they only ever ask "does this user hold permission X?".
 */

export type Role = "super-admin" | "admin" | "employee";

export type Permission =
  | "employees.view"
  | "employees.edit"
  | "attendance.view"
  | "attendance.manage"
  | "timeoff.view"
  | "timeoff.approve"
  | "projects.manage"
  | "reports.view"
  | "clients.view"
  | "inbox.view"
  | "settings.manage";

/** All permissions, used to grant the Super Admin everything. */
export const ALL_PERMISSIONS: Permission[] = [
  "employees.view",
  "employees.edit",
  "attendance.view",
  "attendance.manage",
  "timeoff.view",
  "timeoff.approve",
  "projects.manage",
  "reports.view",
  "clients.view",
  "inbox.view",
  "settings.manage",
];

/**
 * Default permission grants per role. This is a seed/demo mapping — a real
 * backend would return the user's resolved permission set directly.
 */
export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  "super-admin": ALL_PERMISSIONS,
  admin: [
    "employees.view",
    "employees.edit",
    "attendance.view",
    "attendance.manage",
    "timeoff.view",
    "timeoff.approve",
    "projects.manage",
    "reports.view",
    "clients.view",
    "inbox.view",
    // Note: no "settings.manage" — global settings stay Super-Admin only.
  ],
  employee: [
    "employees.view", // read-only directory / org chart
    "attendance.view",
    "timeoff.view",
  ],
};

export function permissionsForRole(role: Role): Permission[] {
  return ROLE_PERMISSIONS[role] ?? [];
}

/**
 * True when the user holds the permission. An item with no permission
 * requirement is always allowed (visibility is then decided by role alone).
 */
export function hasPermission(userPermissions: readonly string[], permission?: Permission): boolean {
  if (!permission) return true;
  return userPermissions.includes(permission);
}

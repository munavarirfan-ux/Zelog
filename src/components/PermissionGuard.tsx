"use client";

import { useCurrentUser } from "@/hooks/useCurrentUser";
import type { Permission, Role } from "@/config/permissions";

interface PermissionGuardProps {
  /** Allowed roles. Omit to allow any role. */
  roles?: Role[];
  /** Required permission. Omit to skip the permission check. */
  permission?: Permission;
  /** Rendered when the check fails (defaults to nothing). */
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Conditionally renders UI based on role/permission. Use for in-page controls
 * (buttons, sections) — not full-page access, which is `ProtectedRoute`'s job.
 */
export function PermissionGuard({ roles, permission, fallback = null, children }: PermissionGuardProps) {
  const { activeRole, hasPermission } = useCurrentUser();
  const roleOk = !roles || roles.includes(activeRole);
  const permOk = hasPermission(permission);
  if (!roleOk || !permOk) return <>{fallback}</>;
  return <>{children}</>;
}

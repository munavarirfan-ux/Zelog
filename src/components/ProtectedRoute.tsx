"use client";

import { useCurrentUser } from "@/hooks/useCurrentUser";
import { Unauthorized } from "@/components/Unauthorized";
import type { Permission, Role } from "@/config/permissions";

interface ProtectedRouteProps {
  /** Roles allowed to view the page. Omit to allow any role. */
  roles?: Role[];
  /** Permission required to view the page. */
  permission?: Permission;
  children: React.ReactNode;
}

/**
 * Full-page access guard. Renders an explanatory unauthorized state (never a
 * silent redirect) when the current user lacks the role/permission. Wrap a page
 * body with this when you want per-page control; the shell's RouteGuard already
 * enforces the centralized nav config for every route.
 */
export function ProtectedRoute({ roles, permission, children }: ProtectedRouteProps) {
  const { activeRole, hasPermission } = useCurrentUser();
  const roleOk = !roles || roles.includes(activeRole);
  const permOk = hasPermission(permission);
  if (!roleOk || !permOk) return <Unauthorized />;
  return <>{children}</>;
}

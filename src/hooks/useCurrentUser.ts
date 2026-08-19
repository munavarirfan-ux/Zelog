"use client";

import { useCallback, useMemo } from "react";
import { useRoleStore } from "@/store/roleStore";
import { permissionsForRole, type Permission, type Role } from "@/config/permissions";

export interface CurrentUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  permissions: Permission[];
}

/** Mock identity for the demo. A real app would hydrate this from the session. */
const BASE_USER = {
  id: "eng1",
  name: "Irfan Alisha",
  email: "irfan.alisha@zessta.com",
} as const;

export interface UseCurrentUser {
  currentUser: CurrentUser;
  activeRole: Role;
  setActiveRole: (role: Role) => void;
  permissions: Permission[];
  hasPermission: (permission?: Permission) => boolean;
}

/**
 * Centralized access to the current user, their active role, and resolved
 * permissions. Built on the existing role store so role selection persists.
 */
export function useCurrentUser(): UseCurrentUser {
  const role = useRoleStore((s) => s.role);
  const setRole = useRoleStore((s) => s.setRole);

  const permissions = useMemo(() => permissionsForRole(role), [role]);

  const currentUser = useMemo<CurrentUser>(
    () => ({ ...BASE_USER, role, permissions }),
    [role, permissions],
  );

  const can = useCallback(
    (permission?: Permission) => (permission ? permissions.includes(permission) : true),
    [permissions],
  );

  return {
    currentUser,
    activeRole: role,
    setActiveRole: setRole,
    permissions,
    hasPermission: can,
  };
}

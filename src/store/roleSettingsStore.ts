"use client";

import { useEffect, useState } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { type Permission, ALL_PERMISSIONS } from "@/config/permissions";

/** A role definition — either one of the default built-ins or a custom role. */
export interface RoleDef {
  id: string;
  name: string;
  description: string;
  /** Accent hex used for the role's icon chip and selected state. */
  accent: string;
  /** Built-in roles can't be renamed or deleted; their permissions can still be tuned. */
  builtIn: boolean;
  /** The owner role (Account Admin) — always full access, permissions locked on. */
  locked?: boolean;
  permissions: Permission[];
}

/**
 * The default roles the workspace ships with. Descriptions are adapted from the
 * product's role model — each maps onto our real permission primitives. These
 * cover both ZE[LOG] and ZE[TEAMS]; the owner (Account Admin) always holds
 * everything. All others are editable starting points.
 */
interface BuiltinDef {
  id: string;
  name: string;
  description: string;
  accent: string;
  locked?: boolean;
  permissions: Permission[];
}

const BUILTIN_DEFS: BuiltinDef[] = [
  {
    id: "account-admin",
    name: "Account Admin",
    description: "Full owner access — every module across ZE[LOG] and ZE[TEAMS], plus account, roles and workspace settings.",
    accent: "#7A4DFF",
    locked: true,
    permissions: [...ALL_PERMISSIONS],
  },
  {
    id: "admin",
    name: "Admin",
    description: "Complete access to all modules and their configuration — restricted only from account-level administration.",
    accent: "#38BDF8",
    permissions: ALL_PERMISSIONS.filter((p) => p !== "settings.manage"),
  },
  {
    id: "hr-partner",
    name: "HR Partner",
    description: "Can access and modify complete employee information — including attendance, time off and team workflows for any employee.",
    accent: "#F472B6",
    permissions: [
      "employees.view",
      "employees.edit",
      "attendance.view",
      "attendance.manage",
      "timeoff.view",
      "timeoff.approve",
      "inbox.view",
    ],
  },
  {
    id: "onboarding-specialist",
    name: "Onboarding Specialist",
    description: "Manages onboarding and can add new employees, with limited profile access. No access to time off or other sensitive team data.",
    accent: "#FBBF24",
    permissions: ["employees.view", "employees.edit", "inbox.view"],
  },
  {
    id: "employee",
    name: "Employee",
    description: "View a limited set of colleague information, track own attendance and request time off.",
    accent: "#34D399",
    permissions: ["employees.view", "attendance.view", "timeoff.view", "inbox.view"],
  },
];

/** Frozen snapshot of each built-in's shipped permissions, for reset / at-default checks. */
const BUILTIN_DEFAULTS: Record<string, Permission[]> = Object.fromEntries(
  BUILTIN_DEFS.map((d) => [d.id, [...d.permissions]]),
);

function seedRoles(): RoleDef[] {
  return BUILTIN_DEFS.map((d) => ({
    id: d.id,
    name: d.name,
    description: d.description,
    accent: d.accent,
    builtIn: true,
    locked: d.locked ?? false,
    permissions: [...d.permissions],
  }));
}

function genId(): string {
  try {
    if (typeof crypto !== "undefined" && crypto.randomUUID) return `role-${crypto.randomUUID()}`;
  } catch {
    /* fall through */
  }
  return `role-${Math.random().toString(36).slice(2, 10)}`;
}

export interface NewRoleInput {
  name: string;
  description?: string;
  accent: string;
  permissions?: Permission[];
}

interface RoleSettingsState {
  roles: RoleDef[];
  /** Add or remove a single permission on any role (no-op on the locked owner). */
  setPermission: (roleId: string, permission: Permission, enabled: boolean) => void;
  /** Restore a built-in role to its shipped defaults. No-op for custom roles. */
  resetRole: (roleId: string) => void;
  /** Create a custom role; returns its generated id. */
  addRole: (input: NewRoleInput) => string;
  /** Rename / recolor a custom role. Built-ins are left untouched. */
  updateRole: (roleId: string, patch: Partial<Pick<RoleDef, "name" | "description" | "accent">>) => void;
  /** Delete a custom role. Built-ins can't be removed. */
  removeRole: (roleId: string) => void;
}

export const useRoleSettingsStore = create<RoleSettingsState>()(
  persist(
    (set) => ({
      roles: seedRoles(),
      setPermission: (roleId, permission, enabled) =>
        set((s) => ({
          roles: s.roles.map((r) => {
            if (r.id !== roleId || r.locked) return r;
            const has = r.permissions.includes(permission);
            if (enabled === has) return r;
            return {
              ...r,
              permissions: enabled
                ? [...r.permissions, permission]
                : r.permissions.filter((p) => p !== permission),
            };
          }),
        })),
      resetRole: (roleId) =>
        set((s) => ({
          roles: s.roles.map((r) =>
            r.id === roleId && r.builtIn && BUILTIN_DEFAULTS[r.id]
              ? { ...r, permissions: [...BUILTIN_DEFAULTS[r.id]] }
              : r,
          ),
        })),
      addRole: (input) => {
        const id = genId();
        set((s) => ({
          roles: [
            ...s.roles,
            {
              id,
              name: input.name.trim(),
              description: (input.description ?? "").trim(),
              accent: input.accent,
              builtIn: false,
              locked: false,
              permissions: input.permissions ? [...input.permissions] : [],
            },
          ],
        }));
        return id;
      },
      updateRole: (roleId, patch) =>
        set((s) => ({
          roles: s.roles.map((r) =>
            r.id === roleId && !r.builtIn
              ? {
                  ...r,
                  ...(patch.name !== undefined ? { name: patch.name.trim() } : {}),
                  ...(patch.description !== undefined ? { description: patch.description.trim() } : {}),
                  ...(patch.accent !== undefined ? { accent: patch.accent } : {}),
                }
              : r,
          ),
        })),
      removeRole: (roleId) =>
        set((s) => ({ roles: s.roles.filter((r) => !(r.id === roleId && !r.builtIn)) })),
    }),
    { name: "zelog-role-settings-v3", skipHydration: true },
  ),
);

/** True when a built-in role still matches its shipped defaults (order-independent). */
export function isRoleAtDefault(role: RoleDef): boolean {
  if (!role.builtIn) return false;
  const base = BUILTIN_DEFAULTS[role.id];
  if (!base) return false;
  return role.permissions.length === base.length && role.permissions.every((p) => base.includes(p));
}

/** Rehydrate the persisted roles on the client; returns whether it's ready. */
export function useHydratedRoleSettings() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    useRoleSettingsStore.persist.rehydrate();
    setHydrated(true);
  }, []);
  return hydrated;
}

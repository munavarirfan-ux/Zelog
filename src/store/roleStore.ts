"use client";

import { useEffect, useState } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DEFAULT_ROLE, type Role } from "@/config/nav";

interface RoleState {
  /** The active (simulated) role. Demo/testing switch — not a security boundary. */
  role: Role;
  setRole: (role: Role) => void;
}

const VALID_ROLES: Role[] = ["super-admin", "admin", "employee"];

export const useRoleStore = create<RoleState>()(
  persist(
    (set) => ({
      role: DEFAULT_ROLE,
      setRole: (role) => set({ role }),
    }),
    {
      name: "zelog-role-v1",
      skipHydration: true,
      // Coerce any stale/removed persisted role (e.g. an old preview role) back to the default.
      merge: (persisted, current) => {
        const saved = (persisted as Partial<RoleState> | undefined)?.role;
        return { ...current, ...(persisted as object), role: saved && VALID_ROLES.includes(saved) ? saved : DEFAULT_ROLE };
      },
    },
  ),
);

/** Rehydrate the persisted role on the client to avoid SSR mismatch. */
export function useHydratedRole() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    useRoleStore.persist.rehydrate();
    setHydrated(true);
  }, []);
  return hydrated;
}

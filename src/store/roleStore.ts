"use client";

import { useEffect, useState } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DEFAULT_ROLE, type Role } from "@/config/nav";

interface RoleState {
  role: Role;
  setRole: (role: Role) => void;
}

export const useRoleStore = create<RoleState>()(
  persist(
    (set) => ({
      role: DEFAULT_ROLE,
      setRole: (role) => set({ role }),
    }),
    { name: "zelog-role-v1", skipHydration: true },
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

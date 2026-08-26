"use client";

import { useEffect, useState } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { LEAVE_TYPES, type LeaveType } from "@/data/timeOffData";

/**
 * Configuration for the Time Off module — leave (time-off) types, the company
 * workweek, and the policy period. Distinct from `timeOffStore` (which holds the
 * actual leave *requests*) and `holidayStore` (the holiday calendar).
 *
 * Prototype: persisted locally in the browser, not to a backend.
 */

/** A configurable leave type. Extends the request-facing LeaveType with the
 *  bits that only matter while *editing* the policy (notes, description). */
export interface SettingsLeaveType extends LeaveType {
  description?: string;
  /** Force employees to add a note when requesting this type. */
  noteMandatory: boolean;
}

export type TimeOffUnit = "days" | "hours";

/** Sun … Sat, matching JS getDay(). true = working day. */
export type Workweek = [boolean, boolean, boolean, boolean, boolean, boolean, boolean];

export interface TimeOffPolicy {
  title: string;
  isDefault: boolean;
  unit: TimeOffUnit;
  /** Calendar-year month the accrual period starts on (1–12). */
  startMonth: number;
  /** yyyy-MM-dd the policy applies from. */
  applicableFrom: string;
  /** Label of the holiday calendar this policy uses. */
  holidayCalendar: string;
}

function genId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `lt_${Math.random().toString(36).slice(2, 10)}`;
}

const SEED_TYPES: SettingsLeaveType[] = LEAVE_TYPES.map((t) => ({
  ...t,
  description: "",
  noteMandatory: false,
}));

const DEFAULT_WORKWEEK: Workweek = [false, true, true, true, true, true, false]; // Mon–Fri

const DEFAULT_POLICY: TimeOffPolicy = {
  title: "Default Time Off Policy",
  isDefault: true,
  unit: "days",
  startMonth: 1,
  applicableFrom: "2026-01-01",
  holidayCalendar: "India Holidays 2026",
};

interface TimeOffSettingsState {
  leaveTypes: SettingsLeaveType[];
  workweek: Workweek;
  policy: TimeOffPolicy;
  addLeaveType: (input: Omit<SettingsLeaveType, "id">) => string;
  updateLeaveType: (id: string, patch: Partial<Omit<SettingsLeaveType, "id">>) => void;
  removeLeaveType: (id: string) => void;
  toggleWorkday: (day: number) => void;
  updatePolicy: (patch: Partial<TimeOffPolicy>) => void;
}

export const useTimeOffSettingsStore = create<TimeOffSettingsState>()(
  persist(
    (set) => ({
      leaveTypes: SEED_TYPES,
      workweek: DEFAULT_WORKWEEK,
      policy: DEFAULT_POLICY,

      addLeaveType: (input) => {
        const id = genId();
        set((state) => ({ leaveTypes: [...state.leaveTypes, { id, ...input }] }));
        return id;
      },

      updateLeaveType: (id, patch) => {
        set((state) => ({
          leaveTypes: state.leaveTypes.map((t) => (t.id === id ? { ...t, ...patch } : t)),
        }));
      },

      removeLeaveType: (id) => {
        set((state) => ({ leaveTypes: state.leaveTypes.filter((t) => t.id !== id) }));
      },

      toggleWorkday: (day) => {
        set((state) => {
          const next = [...state.workweek] as Workweek;
          next[day] = !next[day];
          return { workweek: next };
        });
      },

      updatePolicy: (patch) => {
        set((state) => ({ policy: { ...state.policy, ...patch } }));
      },
    }),
    { name: "zelog-timeoff-settings-v1", skipHydration: true },
  ),
);

export function useHydratedTimeOffSettings() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    useTimeOffSettingsStore.persist.rehydrate();
    setHydrated(true);
  }, []);
  return hydrated;
}

export const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;
export const WEEKDAY_DOTS = ["S", "M", "T", "W", "T", "F", "S"] as const;
export const MONTH_LABELS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
] as const;

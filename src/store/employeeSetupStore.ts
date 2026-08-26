"use client";

import { useEffect, useState } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  EMPLOYMENT_TYPES, WORK_MODES, WORKER_TYPES, TIME_TYPES, PAY_FREQUENCIES,
  LEVELS, SHIFTS, PROBATION_POLICIES, NOTICE_PERIODS,
} from "@/data/directoryData";

/** The editable option lists that power the Add / Edit Employee forms. */
export type ListKey =
  | "employmentTypes"
  | "workerTypes"
  | "timeTypes"
  | "workModes"
  | "levels"
  | "probationPolicies"
  | "noticePeriods"
  | "shifts"
  | "payFrequencies";

/** A policy document uploaded under Employee Setup → Policies. */
export interface PolicyDocument {
  id: string;
  name: string;
  size: number;
  uploadedAt: string;
}

export interface CodeFormat {
  prefix: string;
  separator: string;
  padding: number;
  next: number;
}

export interface OnboardingDefaults {
  addToDirectory: boolean;
  welcomeEmail: boolean;
  assignBuddy: boolean;
  assetRequest: boolean;
  itAccount: boolean;
  probationPolicy: string;
  workMode: string;
}

/** Whether ordinary peers (Employee role) can see these fields on *other* people. */
export interface FieldVisibility {
  compensation: boolean;
  documents: boolean;
  personalContact: boolean;
  bankDetails: boolean;
}

export type OnboardingToggleKey = "addToDirectory" | "welcomeEmail" | "assignBuddy" | "assetRequest" | "itAccount";

interface EmployeeSetupState {
  code: CodeFormat;
  lists: Record<ListKey, string[]>;
  onboarding: OnboardingDefaults;
  fieldVisibility: FieldVisibility;
  policyDocuments: PolicyDocument[];
  updateCode: (patch: Partial<CodeFormat>) => void;
  addListItem: (key: ListKey, value: string) => void;
  removeListItem: (key: ListKey, value: string) => void;
  setOnboarding: (patch: Partial<Pick<OnboardingDefaults, "probationPolicy" | "workMode">>) => void;
  toggleOnboarding: (key: OnboardingToggleKey) => void;
  toggleFieldVisibility: (key: keyof FieldVisibility) => void;
  addPolicyDocument: (doc: { name: string; size: number }) => void;
  removePolicyDocument: (id: string) => void;
}

function genId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `doc_${Math.random().toString(36).slice(2, 10)}`;
}

function withAdded(list: string[], value: string): string[] {
  const t = value.trim();
  if (!t || list.some((x) => x.toLowerCase() === t.toLowerCase())) return list;
  return [...list, t];
}

export const useEmployeeSetupStore = create<EmployeeSetupState>()(
  persist(
    (set) => ({
      code: { prefix: "ZES", separator: "-", padding: 4, next: 1049 },
      lists: {
        employmentTypes: EMPLOYMENT_TYPES.map((t) => t.label),
        workModes: WORK_MODES.map((m) => m.label),
        workerTypes: [...WORKER_TYPES],
        timeTypes: [...TIME_TYPES],
        levels: [...LEVELS],
        probationPolicies: [...PROBATION_POLICIES],
        noticePeriods: [...NOTICE_PERIODS],
        shifts: [...SHIFTS],
        payFrequencies: [...PAY_FREQUENCIES],
      },
      onboarding: {
        addToDirectory: true,
        welcomeEmail: true,
        assignBuddy: true,
        assetRequest: true,
        itAccount: true,
        probationPolicy: PROBATION_POLICIES[0],
        workMode: "Office",
      },
      fieldVisibility: {
        compensation: false,
        documents: false,
        personalContact: false,
        bankDetails: false,
      },
      policyDocuments: [],

      updateCode: (patch) => set((s) => ({ code: { ...s.code, ...patch } })),
      addListItem: (key, value) => set((s) => ({ lists: { ...s.lists, [key]: withAdded(s.lists[key], value) } })),
      removeListItem: (key, value) => set((s) => ({ lists: { ...s.lists, [key]: s.lists[key].filter((x) => x !== value) } })),
      setOnboarding: (patch) => set((s) => ({ onboarding: { ...s.onboarding, ...patch } })),
      toggleOnboarding: (key) => set((s) => ({ onboarding: { ...s.onboarding, [key]: !s.onboarding[key] } })),
      toggleFieldVisibility: (key) => set((s) => ({ fieldVisibility: { ...s.fieldVisibility, [key]: !s.fieldVisibility[key] } })),
      addPolicyDocument: ({ name, size }) =>
        set((s) => ({
          policyDocuments: [
            ...s.policyDocuments,
            { id: genId(), name, size, uploadedAt: new Date().toISOString() },
          ],
        })),
      removePolicyDocument: (id) => set((s) => ({ policyDocuments: s.policyDocuments.filter((d) => d.id !== id) })),
    }),
    { name: "zelog-employee-setup-v1", skipHydration: true },
  ),
);

/** Preview of the next employee code, e.g. "ZES-1049". */
export function formatEmployeeCode(code: CodeFormat): string {
  return `${code.prefix}${code.separator}${String(code.next).padStart(code.padding, "0")}`;
}

export function useHydratedEmployeeSetup() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    useEmployeeSetupStore.persist.rehydrate();
    setHydrated(true);
  }, []);
  return hydrated;
}

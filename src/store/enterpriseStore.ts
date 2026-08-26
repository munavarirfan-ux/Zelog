"use client";

import { useEffect, useState } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { LEGAL_ENTITIES, BUSINESS_UNITS } from "@/data/directoryData";
import { MOCK_EMPLOYEES } from "@/data/orgData";

/** Distinct office locations Zessta staff work from today — used to seed the editable list. */
const SEED_LOCATIONS = Array.from(new Set(MOCK_EMPLOYEES.map((e) => e.location).filter((l): l is string => Boolean(l))));

/* ── option sets used by the enterprise selects ── */
export const INDUSTRIES = [
  "Information Technology & Services",
  "Software Development",
  "Financial Services",
  "Healthcare",
  "Manufacturing",
  "Retail & E-commerce",
  "Consulting",
  "Education",
];
export const COMPANY_SIZES = ["1–10", "11–50", "51–200", "201–500", "501–1000", "1000+"];
export const TIMEZONES = [
  "Asia/Kolkata (GMT+5:30)",
  "Asia/Dubai (GMT+4:00)",
  "Europe/London (GMT+0:00)",
  "America/New_York (GMT−5:00)",
  "America/Los_Angeles (GMT−8:00)",
  "Asia/Singapore (GMT+8:00)",
];
export const CURRENCIES = ["INR — Indian Rupee", "USD — US Dollar", "EUR — Euro", "GBP — Pound Sterling", "SGD — Singapore Dollar", "AED — UAE Dirham"];
export const DATE_FORMATS = ["DD MMM YYYY", "DD/MM/YYYY", "MM/DD/YYYY", "YYYY-MM-DD"];
export const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
export const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export const BRAND_COLORS = ["#7A4DFF", "#38BDF8", "#34D399", "#F472B6", "#FBBF24", "#FB7185", "#22D3EE", "#8B5CF6"];

export interface CompanyProfile {
  legalName: string;
  displayName: string;
  industry: string;
  size: string;
  website: string;
  founded: string;
  email: string;
  phone: string;
  taxId: string;
}

export interface RegionalSettings {
  timezone: string;
  currency: string;
  dateFormat: string;
  fiscalYearStart: string;
  workweek: string[];
}

interface EnterpriseState {
  profile: CompanyProfile;
  regional: RegionalSettings;
  accent: string;
  /** Company logo as a data URL (empty until one is uploaded). */
  logo: string;
  legalEntities: string[];
  businessUnits: string[];
  officeLocations: string[];
  updateProfile: (patch: Partial<CompanyProfile>) => void;
  updateRegional: (patch: Partial<Omit<RegionalSettings, "workweek">>) => void;
  toggleWorkweekDay: (day: string) => void;
  setAccent: (hex: string) => void;
  setLogo: (dataUrl: string) => void;
  addLegalEntity: (name: string) => void;
  removeLegalEntity: (name: string) => void;
  addBusinessUnit: (name: string) => void;
  removeBusinessUnit: (name: string) => void;
  addOfficeLocation: (name: string) => void;
  removeOfficeLocation: (name: string) => void;
}

/** Add a trimmed value to a list, de-duplicated case-insensitively. */
function withAdded(list: string[], value: string): string[] {
  const t = value.trim();
  if (!t || list.some((x) => x.toLowerCase() === t.toLowerCase())) return list;
  return [...list, t];
}

export const useEnterpriseStore = create<EnterpriseState>()(
  persist(
    (set) => ({
      profile: {
        legalName: "Zessta Software Services Pvt Ltd",
        displayName: "Zessta Software Solutions",
        industry: "Information Technology & Services",
        size: "51–200",
        website: "https://www.zessta.com",
        founded: "2014",
        email: "hello@zessta.com",
        phone: "+91 40 1234 5678",
        taxId: "GSTIN 36ABCDE1234F1Z5",
      },
      regional: {
        timezone: "Asia/Kolkata (GMT+5:30)",
        currency: "INR — Indian Rupee",
        dateFormat: "DD MMM YYYY",
        fiscalYearStart: "April",
        workweek: ["Mon", "Tue", "Wed", "Thu", "Fri"],
      },
      accent: "#7A4DFF",
      logo: "",
      legalEntities: [...LEGAL_ENTITIES],
      businessUnits: [...BUSINESS_UNITS],
      officeLocations: SEED_LOCATIONS,

      updateProfile: (patch) => set((s) => ({ profile: { ...s.profile, ...patch } })),
      updateRegional: (patch) => set((s) => ({ regional: { ...s.regional, ...patch } })),
      toggleWorkweekDay: (day) =>
        set((s) => {
          const has = s.regional.workweek.includes(day);
          const workweek = has
            ? s.regional.workweek.filter((d) => d !== day)
            : [...s.regional.workweek, day].sort((a, b) => WEEKDAYS.indexOf(a) - WEEKDAYS.indexOf(b));
          return { regional: { ...s.regional, workweek } };
        }),
      setAccent: (hex) => set({ accent: hex }),
      setLogo: (dataUrl) => set({ logo: dataUrl }),
      addLegalEntity: (name) => set((s) => ({ legalEntities: withAdded(s.legalEntities, name) })),
      removeLegalEntity: (name) => set((s) => ({ legalEntities: s.legalEntities.filter((x) => x !== name) })),
      addBusinessUnit: (name) => set((s) => ({ businessUnits: withAdded(s.businessUnits, name) })),
      removeBusinessUnit: (name) => set((s) => ({ businessUnits: s.businessUnits.filter((x) => x !== name) })),
      addOfficeLocation: (name) => set((s) => ({ officeLocations: withAdded(s.officeLocations, name) })),
      removeOfficeLocation: (name) => set((s) => ({ officeLocations: s.officeLocations.filter((x) => x !== name) })),
    }),
    { name: "zelog-enterprise-v1", skipHydration: true },
  ),
);

export function useHydratedEnterprise() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    useEnterpriseStore.persist.rehydrate();
    setHydrated(true);
  }, []);
  return hydrated;
}

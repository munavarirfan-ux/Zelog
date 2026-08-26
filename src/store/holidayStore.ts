"use client";

import { useEffect, useMemo, useState } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  DEFAULT_CALENDARS,
  holidaysForLocation,
  syncHolidays,
  type Holiday,
  type HolidayCalendar,
} from "@/data/timeOffData";

interface NewCalendarInput {
  name: string;
  country: string;
  flag: string;
  locations?: string[];
  holidays?: Holiday[];
}

interface HolidayState {
  calendars: HolidayCalendar[];
  activeId: string;
  setActive: (id: string) => void;

  addCalendar: (input: NewCalendarInput) => string;
  updateCalendar: (id: string, patch: Partial<Pick<HolidayCalendar, "name" | "country" | "flag">>) => void;
  setDefaultCalendar: (id: string) => void;
  duplicateCalendar: (id: string) => string | null;
  removeCalendar: (id: string) => void;
  /** Map office locations to a calendar (each location follows exactly one). */
  assignLocations: (id: string, locations: string[]) => void;

  addHoliday: (calId: string, date: string, name: string, optional?: boolean) => void;
  removeHoliday: (calId: string, date: string) => void;
  /** Parse "date,name[,optional]" CSV rows into a calendar; returns rows imported. */
  importCsv: (calId: string, text: string) => number;
}

const sortByDate = (list: Holiday[]) => [...list].sort((a, b) => a.date.localeCompare(b.date));

// The global date helpers (isHoliday/computeWorkingDays) use a single flat lookup.
// Keep it pointed at the default calendar so leave-duration math stays consistent.
function syncDefault(calendars: HolidayCalendar[]) {
  const primary = calendars.find((c) => c.isDefault) ?? calendars[0];
  syncHolidays(primary?.holidays ?? []);
}

let seq = 0;
const genId = () => `cal-${Date.now().toString(36)}-${(seq++).toString(36)}`;

export const useHolidayStore = create<HolidayState>()(
  persist(
    (set, get) => ({
      calendars: DEFAULT_CALENDARS,
      activeId: DEFAULT_CALENDARS[0].id,

      setActive: (id) => set({ activeId: id }),

      addCalendar: (input) => {
        const id = genId();
        const cal: HolidayCalendar = {
          id,
          name: input.name.trim() || "Untitled calendar",
          country: input.country.trim() || input.name.trim(),
          flag: input.flag || "🗓️",
          locations: [],
          holidays: sortByDate(input.holidays ?? []),
        };
        const requested = input.locations ?? [];
        // A location follows exactly one calendar — take ownership from any others.
        const calendars = [...get().calendars.map((c) => ({
          ...c,
          locations: c.locations.filter((l) => !requested.includes(l)),
        })), { ...cal, locations: requested }];
        set({ calendars, activeId: id });
        syncDefault(calendars);
        return id;
      },

      updateCalendar: (id, patch) => {
        const calendars = get().calendars.map((c) => (c.id === id ? { ...c, ...patch } : c));
        set({ calendars });
        syncDefault(calendars);
      },

      setDefaultCalendar: (id) => {
        const calendars = get().calendars.map((c) => ({ ...c, isDefault: c.id === id }));
        set({ calendars });
        syncDefault(calendars);
      },

      duplicateCalendar: (id) => {
        const src = get().calendars.find((c) => c.id === id);
        if (!src) return null;
        const newId = genId();
        const copy: HolidayCalendar = {
          ...src,
          id: newId,
          name: `${src.name} (copy)`,
          isDefault: false,
          locations: [], // a duplicate starts unmapped so it never steals locations
          holidays: src.holidays.map((h) => ({ ...h })),
        };
        const calendars = [...get().calendars, copy];
        set({ calendars, activeId: newId });
        syncDefault(calendars);
        return newId;
      },

      removeCalendar: (id) => {
        const { calendars: current } = get();
        if (current.length <= 1) return; // never remove the last calendar
        const removed = current.find((c) => c.id === id);
        let calendars = current.filter((c) => c.id !== id);
        // Ensure a default still exists; adopt the orphaned locations into it.
        if (!calendars.some((c) => c.isDefault)) calendars = calendars.map((c, i) => ({ ...c, isDefault: i === 0 }));
        if (removed?.locations.length) {
          const defIdx = calendars.findIndex((c) => c.isDefault);
          if (defIdx >= 0) {
            calendars = calendars.map((c, i) =>
              i === defIdx ? { ...c, locations: Array.from(new Set([...c.locations, ...removed.locations])) } : c,
            );
          }
        }
        const activeId = get().activeId === id ? (calendars.find((c) => c.isDefault)?.id ?? calendars[0].id) : get().activeId;
        set({ calendars, activeId });
        syncDefault(calendars);
      },

      assignLocations: (id, locations) => {
        const calendars = get().calendars.map((c) => {
          if (c.id === id) return { ...c, locations: Array.from(new Set(locations)) };
          // Strip these locations from every other calendar.
          return { ...c, locations: c.locations.filter((l) => !locations.includes(l)) };
        });
        set({ calendars });
        syncDefault(calendars);
      },

      addHoliday: (calId, date, name, optional) => {
        if (!date || !name.trim()) return;
        const calendars = get().calendars.map((c) =>
          c.id === calId
            ? { ...c, holidays: sortByDate([...c.holidays.filter((h) => h.date !== date), { date, name: name.trim(), optional: optional || undefined }]) }
            : c,
        );
        set({ calendars });
        syncDefault(calendars);
      },

      removeHoliday: (calId, date) => {
        const calendars = get().calendars.map((c) =>
          c.id === calId ? { ...c, holidays: c.holidays.filter((h) => h.date !== date) } : c,
        );
        set({ calendars });
        syncDefault(calendars);
      },

      importCsv: (calId, text) => {
        const parsed: Holiday[] = [];
        for (const raw of text.split(/\r?\n/)) {
          const row = raw.trim();
          if (!row) continue;
          const cols = row.split(",");
          const date = (cols[0] ?? "").trim();
          const name = (cols[1] ?? "").trim().replace(/^"|"$/g, "");
          const flag = (cols[2] ?? "").trim().toLowerCase();
          const optional = flag === "optional" || flag === "true" || flag === "1";
          if (/^\d{4}-\d{2}-\d{2}$/.test(date) && name) parsed.push({ date, name, optional: optional || undefined });
        }
        if (!parsed.length) return 0;
        const calendars = get().calendars.map((c) => {
          if (c.id !== calId) return c;
          const map = new Map(c.holidays.map((h) => [h.date, h]));
          parsed.forEach((h) => map.set(h.date, h));
          return { ...c, holidays: sortByDate(Array.from(map.values())) };
        });
        set({ calendars });
        syncDefault(calendars);
        return parsed.length;
      },
    }),
    { name: "zelog-holidays-v3", skipHydration: true },
  ),
);

export function useHydratedHolidays() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    useHolidayStore.persist.rehydrate();
    syncDefault(useHolidayStore.getState().calendars);
    setHydrated(true);
  }, []);
  return hydrated;
}

/** Holidays that apply to a given office location (reactive). */
export function useResolvedHolidays(location?: string): Holiday[] {
  const calendars = useHolidayStore((s) => s.calendars);
  return useMemo(() => holidaysForLocation(calendars, location), [calendars, location]);
}

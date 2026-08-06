"use client";

import { useEffect, useState } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DEFAULT_HOLIDAYS, syncHolidays, type Holiday } from "@/data/timeOffData";

interface HolidayState {
  holidays: Holiday[];
  addHoliday: (date: string, name: string) => void;
  removeHoliday: (date: string) => void;
  /** Parse "date,name" CSV rows; returns how many were imported. */
  importCsv: (text: string) => number;
}

const sortByDate = (list: Holiday[]) => [...list].sort((a, b) => a.date.localeCompare(b.date));

export const useHolidayStore = create<HolidayState>()(
  persist(
    (set, get) => ({
      holidays: DEFAULT_HOLIDAYS,

      addHoliday: (date, name) => {
        if (!date || !name.trim()) return;
        const list = sortByDate([...get().holidays.filter((h) => h.date !== date), { date, name: name.trim() }]);
        syncHolidays(list);
        set({ holidays: list });
      },

      removeHoliday: (date) => {
        const list = get().holidays.filter((h) => h.date !== date);
        syncHolidays(list);
        set({ holidays: list });
      },

      importCsv: (text) => {
        const parsed: Holiday[] = [];
        for (const raw of text.split(/\r?\n/)) {
          const row = raw.trim();
          if (!row) continue;
          const comma = row.indexOf(",");
          if (comma < 0) continue;
          const date = row.slice(0, comma).trim();
          const name = row.slice(comma + 1).trim().replace(/^"|"$/g, "");
          if (/^\d{4}-\d{2}-\d{2}$/.test(date) && name) parsed.push({ date, name });
        }
        if (!parsed.length) return 0;
        const map = new Map(get().holidays.map((h) => [h.date, h]));
        parsed.forEach((h) => map.set(h.date, h));
        const list = sortByDate(Array.from(map.values()));
        syncHolidays(list);
        set({ holidays: list });
        return parsed.length;
      },
    }),
    { name: "zelog-holidays-v1", skipHydration: true },
  ),
);

export function useHydratedHolidays() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    useHolidayStore.persist.rehydrate();
    syncHolidays(useHolidayStore.getState().holidays);
    setHydrated(true);
  }, []);
  return hydrated;
}

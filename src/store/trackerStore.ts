"use client";

import { useEffect, useState } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { format } from "date-fns";
import type { Project, RunningTimer, TimeEntry, TrackerFilters } from "@/types/tracker";
import { MOCK_ENTRIES, PROJECTS } from "@/data/mockEntries";

function genId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `t_${Math.random().toString(36).slice(2, 10)}_${Math.random().toString(36).slice(2, 6)}`;
}

interface NewTimerInput {
  task: string;
  projectId: string;
  billable: boolean;
  tags: string[];
}

interface TrackerState {
  entries: TimeEntry[];
  projects: Project[];
  runningTimer: RunningTimer | null;
  filters: TrackerFilters;
  startTimer: (input: NewTimerInput) => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  stopTimer: () => void;
  discardTimer: () => void;
  continueEntry: (entryId: string) => void;
  updateEntry: (id: string, patch: Partial<Omit<TimeEntry, "id">>) => void;
  deleteEntry: (id: string) => void;
  duplicateEntry: (id: string) => void;
  setFilters: (patch: Partial<TrackerFilters>) => void;
}

export const useTrackerStore = create<TrackerState>()(
  persist(
    (set, get) => ({
      entries: MOCK_ENTRIES,
      projects: PROJECTS,
      runningTimer: null,
      filters: { projectIds: [], range: "week" },

      startTimer: (input) => {
        if (get().runningTimer) get().stopTimer();
        set({
          runningTimer: {
            id: genId(),
            task: input.task.trim() || "Untitled session",
            projectId: input.projectId,
            billable: input.billable,
            tags: input.tags,
            startedAt: new Date().toISOString(),
            accumulatedSeconds: 0,
            isPaused: false,
          },
        });
      },

      pauseTimer: () => {
        const running = get().runningTimer;
        if (!running || running.isPaused) return;
        const segmentSeconds = Math.max(0, Math.round((Date.now() - new Date(running.startedAt).getTime()) / 1000));
        set({
          runningTimer: {
            ...running,
            isPaused: true,
            accumulatedSeconds: running.accumulatedSeconds + segmentSeconds,
          },
        });
      },

      resumeTimer: () => {
        const running = get().runningTimer;
        if (!running || !running.isPaused) return;
        set({ runningTimer: { ...running, isPaused: false, startedAt: new Date().toISOString() } });
      },

      stopTimer: () => {
        const running = get().runningTimer;
        if (!running) return;
        const segmentSeconds = running.isPaused
          ? 0
          : Math.max(0, Math.round((Date.now() - new Date(running.startedAt).getTime()) / 1000));
        const durationSeconds = running.accumulatedSeconds + segmentSeconds;
        if (durationSeconds < 3) {
          set({ runningTimer: null });
          return;
        }
        const end = new Date();
        const start = new Date(end.getTime() - durationSeconds * 1000);
        const entry: TimeEntry = {
          id: running.id,
          task: running.task,
          projectId: running.projectId,
          billable: running.billable,
          tags: running.tags,
          date: format(start, "yyyy-MM-dd"),
          startTime: start.toISOString(),
          endTime: end.toISOString(),
          durationSeconds,
        };
        set((state) => ({ entries: [entry, ...state.entries], runningTimer: null }));
      },

      discardTimer: () => set({ runningTimer: null }),

      continueEntry: (entryId) => {
        const entry = get().entries.find((e) => e.id === entryId);
        if (!entry) return;
        get().startTimer({
          task: entry.task,
          projectId: entry.projectId,
          billable: entry.billable,
          tags: entry.tags,
        });
      },

      updateEntry: (id, patch) =>
        set((state) => ({
          entries: state.entries.map((e) => {
            if (e.id !== id) return e;
            const next = { ...e, ...patch };
            if (patch.startTime || patch.endTime) {
              const durationSeconds = Math.max(
                1,
                Math.round((new Date(next.endTime).getTime() - new Date(next.startTime).getTime()) / 1000),
              );
              next.durationSeconds = durationSeconds;
              next.date = format(new Date(next.startTime), "yyyy-MM-dd");
            }
            return next;
          }),
        })),

      deleteEntry: (id) => set((state) => ({ entries: state.entries.filter((e) => e.id !== id) })),

      duplicateEntry: (id) => {
        const entry = get().entries.find((e) => e.id === id);
        if (!entry) return;
        const end = new Date();
        const start = new Date(end.getTime() - entry.durationSeconds * 1000);
        const copy: TimeEntry = {
          ...entry,
          id: genId(),
          date: format(start, "yyyy-MM-dd"),
          startTime: start.toISOString(),
          endTime: end.toISOString(),
        };
        set((state) => ({ entries: [copy, ...state.entries] }));
      },

      setFilters: (patch) => set((state) => ({ filters: { ...state.filters, ...patch } })),
    }),
    {
      name: "zelog-tracker-store-v2",
      skipHydration: true,
      partialize: (state) => ({ entries: state.entries, runningTimer: state.runningTimer, filters: state.filters }),
    },
  ),
);

export function useHydratedTracker() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    useTrackerStore.persist.rehydrate();
    setHydrated(true);
  }, []);
  return hydrated;
}

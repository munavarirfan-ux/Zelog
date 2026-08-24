"use client";

import { useEffect, useState } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  SEED_REQUESTS,
  type AttendanceMode,
  type AttendanceRequest,
  type RequestStatus,
  type RequestType,
  type TimelineEvent,
  type VerificationMeta,
} from "@/data/attendanceData";

function genId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `at_${Math.random().toString(36).slice(2, 10)}`;
}

export interface CheckInPayload {
  mode: AttendanceMode;
  timeLabel: string; // "09:02 AM"
  verification: VerificationMeta;
  clientId?: string;
}

interface AttendanceState {
  /** Live "today" state for the current employee. */
  mode: AttendanceMode;
  checkedIn: boolean;
  checkedOut: boolean;
  checkInAt: string | null; // ISO — for the live timer
  checkInLabel: string | null;
  checkOutLabel: string | null;
  onBreak: boolean;
  clientId?: string;
  events: TimelineEvent[];
  verification: VerificationMeta | null;

  requests: AttendanceRequest[];

  setMode: (mode: AttendanceMode) => void;
  checkIn: (payload: CheckInPayload) => void;
  checkOut: (timeLabel: string) => void;
  toggleBreak: (timeLabel: string) => void;
  resetDay: () => void;

  submitRequest: (input: { employeeId: string; type: RequestType; date: string; detail: string; reason: string }) => void;
  decideRequest: (id: string, status: RequestStatus, comment?: string) => void;
}

export const useAttendanceStore = create<AttendanceState>()(
  persist(
    (set) => ({
      mode: "office",
      checkedIn: false,
      checkedOut: false,
      checkInAt: null,
      checkInLabel: null,
      checkOutLabel: null,
      onBreak: false,
      events: [],
      verification: null,
      requests: SEED_REQUESTS,

      setMode: (mode) => set({ mode }),

      checkIn: ({ mode, timeLabel, verification, clientId }) =>
        set({
          mode,
          clientId,
          checkedIn: true,
          checkedOut: false,
          onBreak: false,
          checkInAt: new Date().toISOString(),
          checkInLabel: timeLabel,
          checkOutLabel: null,
          verification,
          events: [{ kind: "check-in", time: timeLabel, label: "Checked in", detail: verification.address }],
        }),

      toggleBreak: (timeLabel) =>
        set((s) => {
          if (!s.checkedIn) return s;
          if (s.onBreak) {
            return { onBreak: false, events: [...s.events, { kind: "break-end", time: timeLabel, label: "Break ended" }] };
          }
          return { onBreak: true, events: [...s.events, { kind: "break-start", time: timeLabel, label: "Break started" }] };
        }),

      checkOut: (timeLabel) =>
        set((s) => ({
          checkedIn: false,
          checkedOut: true,
          onBreak: false,
          checkOutLabel: timeLabel,
          events: [...s.events, { kind: "check-out", time: timeLabel, label: "Checked out", detail: s.verification?.address }],
        })),

      resetDay: () =>
        set({
          checkedIn: false,
          checkedOut: false,
          onBreak: false,
          checkInAt: null,
          checkInLabel: null,
          checkOutLabel: null,
          events: [],
          verification: null,
          clientId: undefined,
        }),

      submitRequest: (input) =>
        set((s) => ({
          requests: [
            {
              id: genId(),
              status: "pending",
              createdAt: new Date().toISOString(),
              ...input,
            },
            ...s.requests,
          ],
        })),

      decideRequest: (id, status, comment) =>
        set((s) => ({
          requests: s.requests.map((r) => (r.id === id ? { ...r, status, comment: comment ?? r.comment } : r)),
        })),
    }),
    { name: "zelog-attendance-v2", skipHydration: true },
  ),
);

export function useHydratedAttendance() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    useAttendanceStore.persist.rehydrate();
    setHydrated(true);
  }, []);
  return hydrated;
}

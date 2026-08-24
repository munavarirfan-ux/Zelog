"use client";

import { useEffect, useState } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  computeWorkingDays,
  MOCK_REQUESTS,
  type RequestComment,
  type RequestStatus,
  type TimeOffRequest,
} from "@/data/timeOffData";

function genId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `to_${Math.random().toString(36).slice(2, 10)}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

export type NewRequestInput = Omit<TimeOffRequest, "id" | "status" | "createdAt" | "durationDays" | "comments">;
export type RequestPatch = Partial<Pick<TimeOffRequest, "requestCategory" | "leaveTypeId" | "startDate" | "endDate" | "durationType" | "halfDaySession" | "reason" | "attachmentUrl" | "recurring" | "notifyIds">>;

interface TimeOffState {
  requests: TimeOffRequest[];
  createRequest: (input: NewRequestInput) => string;
  updateRequest: (id: string, patch: RequestPatch) => void;
  cancelRequest: (id: string, byId: string) => void;
  setStatus: (id: string, status: RequestStatus, byId: string, comment?: string) => void;
  bulkSetStatus: (ids: string[], status: RequestStatus, byId: string) => void;
  addComment: (id: string, byId: string, text: string) => void;
}

function comment(byId: string, text: string, action?: RequestComment["action"]): RequestComment {
  return { id: genId(), authorId: byId, text, at: nowIso(), action };
}

export const useTimeOffStore = create<TimeOffState>()(
  persist(
    (set) => ({
      requests: MOCK_REQUESTS,

      createRequest: (input) => {
        const id = genId();
        const req: TimeOffRequest = {
          ...input,
          id,
          status: "pending",
          createdAt: nowIso(),
          durationDays: computeWorkingDays(input.startDate, input.endDate, input.durationType),
          comments: [],
        };
        set((s) => ({ requests: [req, ...s.requests] }));
        return id;
      },

      updateRequest: (id, patch) => {
        set((s) => ({
          requests: s.requests.map((r) => {
            if (r.id !== id) return r;
            const next = { ...r, ...patch };
            next.durationDays = computeWorkingDays(next.startDate, next.endDate, next.durationType);
            // Re-open a changes-requested item back to pending on edit.
            if (r.status === "changes-requested") next.status = "pending";
            return next;
          }),
        }));
      },

      cancelRequest: (id, byId) => {
        set((s) => ({
          requests: s.requests.map((r) =>
            r.id === id ? { ...r, status: "cancelled", comments: [...r.comments, comment(byId, "Request cancelled", "cancelled")] } : r,
          ),
        }));
      },

      setStatus: (id, status, byId, text) => {
        set((s) => ({
          requests: s.requests.map((r) => {
            if (r.id !== id) return r;
            const comments = text ? [...r.comments, comment(byId, text, status === "approved" || status === "rejected" || status === "changes-requested" ? status : "comment")] : r.comments;
            return { ...r, status, comments };
          }),
        }));
      },

      bulkSetStatus: (ids, status, byId) => {
        const set0 = new Set(ids);
        set((s) => ({
          requests: s.requests.map((r) =>
            set0.has(r.id) ? { ...r, status, comments: [...r.comments, comment(byId, `Bulk ${status}`, status === "approved" || status === "rejected" ? status : "comment")] } : r,
          ),
        }));
      },

      addComment: (id, byId, text) => {
        set((s) => ({
          requests: s.requests.map((r) => (r.id === id ? { ...r, comments: [...r.comments, comment(byId, text, "comment")] } : r)),
        }));
      },
    }),
    { name: "zelog-timeoff-v2", skipHydration: true },
  ),
);

export function useHydratedTimeOff() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    useTimeOffStore.persist.rehydrate();
    setHydrated(true);
  }, []);
  return hydrated;
}

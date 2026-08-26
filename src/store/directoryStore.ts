"use client";

import { useEffect, useState } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  SEED_ACTIVITY,
  SEED_ALLOCATIONS,
  SEED_ASSETS,
  SEED_ASSET_REQUESTS,
  SEED_DOCUMENTS,
  SEED_EXTRAS,
  documentStatus,
  type ActivityCategory,
  type ActivityEvent,
  type Asset,
  type AssetCondition,
  type AssetRequest,
  type AssetRequestKind,
  type AssetRequestStatus,
  type AssetStatus,
  type EmployeeDocument,
  type EmployeeProfileExtra,
  type LeaveAdjustment,
  type ProjectAllocation,
} from "@/data/directoryData";

function genId(prefix: string): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return `${prefix}_${crypto.randomUUID().slice(0, 8)}`;
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

/** Stable "now" for freshly created records (SSR-safe at module load; called only in handlers). */
function nowIso(): string {
  return new Date().toISOString();
}

export interface AssignAssetInput {
  employeeId: string;
  name: string;
  category: Asset["category"];
  assetId: string;
  manufacturer?: string;
  model?: string;
  serialNumber?: string;
  condition: AssetCondition;
  warrantyExpiry?: string;
  notes?: string;
  assignedById: string;
  /** Set when the employee is registering an asset the company issued to them (self-service). */
  selfReported?: boolean;
}

export interface RequestAssetInput {
  employeeId: string;
  kind: AssetRequestKind;
  label: string;
  category: Asset["category"];
  currentAssetId?: string;
  reason: string;
}

export interface UploadDocumentInput {
  employeeId: string;
  name: string;
  group: EmployeeDocument["group"];
  category: string;
  expiry?: string;
  private?: boolean;
  uploadedById: string;
}

export interface AssignProjectInput {
  employeeId: string;
  projectId: string;
  role: string;
  allocationPct: number;
  billable: boolean;
  startDate: string;
}

export interface AdjustLeaveInput {
  employeeId: string;
  leaveTypeId: string;
  delta: number;
  previousBalance: number;
  effectiveDate: string;
  reason: string;
  notes?: string;
  byId: string;
}

interface DirectoryState {
  extras: Record<string, EmployeeProfileExtra>;
  assets: Asset[];
  assetRequests: AssetRequest[];
  documents: EmployeeDocument[];
  allocations: ProjectAllocation[];
  leaveAdjustments: LeaveAdjustment[];
  activity: ActivityEvent[];

  logActivity: (e: Omit<ActivityEvent, "id" | "at"> & { at?: string }) => void;
  updateExtra: (employeeId: string, patch: Partial<EmployeeProfileExtra>, byId?: string) => void;

  assignAsset: (input: AssignAssetInput) => void;
  reassignAsset: (assetId: string, toEmployeeId: string, byId: string, toName?: string, note?: string) => void;
  updateAssetStatus: (assetId: string, status: AssetStatus, byId: string, note?: string) => void;
  updateAssetCondition: (assetId: string, condition: AssetCondition, byId: string) => void;

  requestAsset: (input: RequestAssetInput) => void;
  decideAssetRequest: (requestId: string, status: AssetRequestStatus, byId: string, note?: string) => void;

  uploadDocument: (input: UploadDocumentInput) => void;
  deleteDocument: (docId: string, byId: string) => void;

  assignProject: (input: AssignProjectInput) => void;
  removeAllocation: (allocationId: string, byId: string) => void;

  adjustLeave: (input: AdjustLeaveInput) => LeaveAdjustment;
}

export const useDirectoryStore = create<DirectoryState>()(
  persist(
    (set, get) => ({
      extras: SEED_EXTRAS,
      assets: SEED_ASSETS,
      assetRequests: SEED_ASSET_REQUESTS,
      documents: SEED_DOCUMENTS,
      allocations: SEED_ALLOCATIONS,
      leaveAdjustments: [],
      activity: SEED_ACTIVITY,

      logActivity: (e) =>
        set((s) => ({
          activity: [{ ...e, id: genId("act"), at: e.at ?? nowIso() }, ...s.activity],
        })),

      updateExtra: (employeeId, patch, byId) => {
        set((s) => ({
          extras: { ...s.extras, [employeeId]: { ...s.extras[employeeId], ...patch } },
        }));
        get().logActivity({
          employeeId,
          category: "job",
          title: "Profile updated",
          detail: Object.keys(patch).join(", "),
          byId,
        });
      },

      assignAsset: (input) => {
        const asset: Asset = {
          id: genId("as"),
          employeeId: input.employeeId,
          name: input.name,
          category: input.category,
          assetId: input.assetId,
          manufacturer: input.manufacturer,
          model: input.model,
          serialNumber: input.serialNumber,
          assignedDate: nowIso().slice(0, 10),
          assignedById: input.assignedById,
          condition: input.condition,
          warrantyExpiry: input.warrantyExpiry,
          status: "assigned",
          notes: input.notes,
          selfReported: input.selfReported || undefined,
          history: [
            {
              id: genId("ae"),
              at: nowIso(),
              kind: "assigned",
              detail: `${input.selfReported ? "Self-reported" : "Assigned"} · ${input.condition}`,
              byId: input.assignedById,
            },
          ],
        };
        set((s) => ({ assets: [asset, ...s.assets] }));
        get().logActivity({
          employeeId: input.employeeId,
          category: "assets",
          title: input.selfReported ? "Asset added" : "Asset assigned",
          detail: `${input.name} (${input.assetId})`,
          byId: input.assignedById,
        });
      },

      reassignAsset: (assetId, toEmployeeId, byId, toName, note) => {
        const prev = get().assets.find((a) => a.id === assetId);
        if (!prev || prev.employeeId === toEmployeeId) return;
        set((s) => ({
          assets: s.assets.map((a) =>
            a.id === assetId
              ? {
                  ...a,
                  employeeId: toEmployeeId,
                  status: "assigned",
                  history: [
                    ...a.history,
                    { id: genId("ae"), at: nowIso(), kind: "reassigned", detail: note ?? `Reassigned to ${toName ?? toEmployeeId}`, byId },
                  ],
                }
              : a,
          ),
        }));
        // Log against both records so the transfer shows on each employee's timeline.
        get().logActivity({ employeeId: prev.employeeId, category: "assets", title: "Asset reassigned", detail: `${prev.name} → ${toName ?? toEmployeeId}`, byId });
        get().logActivity({ employeeId: toEmployeeId, category: "assets", title: "Asset assigned", detail: `${prev.name} (${prev.assetId})`, byId });
      },

      updateAssetStatus: (assetId, status, byId, note) => {
        set((s) => ({
          assets: s.assets.map((a) =>
            a.id === assetId
              ? {
                  ...a,
                  status,
                  history: [
                    ...a.history,
                    { id: genId("ae"), at: nowIso(), kind: status === "returned" ? "returned" : "condition", detail: note ?? `Status → ${status}`, byId },
                  ],
                }
              : a,
          ),
        }));
        const asset = get().assets.find((a) => a.id === assetId);
        if (asset) get().logActivity({ employeeId: asset.employeeId, category: "assets", title: "Asset status changed", detail: `${asset.name} → ${status}`, byId });
      },

      updateAssetCondition: (assetId, condition, byId) => {
        set((s) => ({
          assets: s.assets.map((a) =>
            a.id === assetId
              ? { ...a, condition, history: [...a.history, { id: genId("ae"), at: nowIso(), kind: "condition", detail: `Condition → ${condition}`, byId }] }
              : a,
          ),
        }));
      },

      requestAsset: (input) => {
        const req: AssetRequest = {
          id: genId("areq"),
          employeeId: input.employeeId,
          kind: input.kind,
          label: input.label,
          category: input.category,
          currentAssetId: input.currentAssetId,
          reason: input.reason,
          status: "pending",
          createdAt: nowIso(),
        };
        set((s) => ({ assetRequests: [req, ...s.assetRequests] }));
        get().logActivity({
          employeeId: input.employeeId,
          category: "assets",
          title: input.kind === "new" ? "Asset requested" : "Asset change requested",
          detail: input.kind === "new" ? input.label : `${input.label} · change`,
          byId: input.employeeId,
        });
      },

      decideAssetRequest: (requestId, status, byId, note) => {
        const req = get().assetRequests.find((r) => r.id === requestId);
        set((s) => ({
          assetRequests: s.assetRequests.map((r) =>
            r.id === requestId ? { ...r, status, decidedById: byId, decidedAt: nowIso(), note: note ?? r.note } : r,
          ),
        }));
        if (req) {
          get().logActivity({
            employeeId: req.employeeId,
            category: "assets",
            title: `Asset request ${status}`,
            detail: `${req.label}${req.kind === "change" ? " · change" : ""}`,
            byId,
          });
        }
      },

      uploadDocument: (input) => {
        const doc: EmployeeDocument = {
          id: genId("doc"),
          employeeId: input.employeeId,
          name: input.name,
          group: input.group,
          category: input.category,
          uploadedById: input.uploadedById,
          uploadedAt: nowIso().slice(0, 10),
          expiry: input.expiry,
          status: documentStatus(input.expiry),
          private: input.private,
        };
        set((s) => ({ documents: [doc, ...s.documents] }));
        get().logActivity({ employeeId: input.employeeId, category: "documents", title: "Document uploaded", detail: input.name, byId: input.uploadedById });
      },

      deleteDocument: (docId, byId) => {
        const doc = get().documents.find((d) => d.id === docId);
        set((s) => ({ documents: s.documents.filter((d) => d.id !== docId) }));
        if (doc) get().logActivity({ employeeId: doc.employeeId, category: "documents", title: "Document deleted", detail: doc.name, byId });
      },

      assignProject: (input) => {
        const alloc: ProjectAllocation = {
          id: genId("al"),
          employeeId: input.employeeId,
          projectId: input.projectId,
          role: input.role,
          allocationPct: input.allocationPct,
          billable: input.billable,
          startDate: input.startDate,
          trackedHours: 0,
          status: "active",
        };
        set((s) => ({ allocations: [alloc, ...s.allocations] }));
        get().logActivity({ employeeId: input.employeeId, category: "projects", title: "Project assigned", detail: `${input.role} · ${input.allocationPct}%`, byId: input.employeeId });
      },

      removeAllocation: (allocationId, byId) => {
        const alloc = get().allocations.find((a) => a.id === allocationId);
        set((s) => ({
          allocations: s.allocations.map((a) => (a.id === allocationId ? { ...a, status: "completed", endDate: nowIso().slice(0, 10) } : a)),
        }));
        if (alloc) get().logActivity({ employeeId: alloc.employeeId, category: "projects", title: "Project unassigned", byId });
      },

      adjustLeave: (input) => {
        const newBalance = Math.max(0, input.previousBalance + input.delta);
        const record: LeaveAdjustment = {
          id: genId("lv"),
          employeeId: input.employeeId,
          leaveTypeId: input.leaveTypeId,
          delta: input.delta,
          previousBalance: input.previousBalance,
          newBalance,
          effectiveDate: input.effectiveDate,
          reason: input.reason,
          notes: input.notes,
          byId: input.byId,
          at: nowIso(),
        };
        set((s) => ({ leaveAdjustments: [record, ...s.leaveAdjustments] }));
        get().logActivity({
          employeeId: input.employeeId,
          category: "leave",
          title: "Leave balance adjusted",
          detail: `${input.delta >= 0 ? "+" : ""}${input.delta} · ${input.reason}`,
          byId: input.byId,
        });
        return record;
      },
    }),
    {
      name: "zelog-directory-v1",
      skipHydration: true,
      version: 3,
      // Older persisted state predates the seeded request queue. Merge the seeds
      // in (keeping any real requests the user already raised, deduped by id) so
      // the Assets → Requests tab has a representative queue to triage.
      migrate: (persisted, version) => {
        const state = persisted as Partial<DirectoryState> | undefined;
        if (state && version < 2) {
          const existing = state.assetRequests ?? [];
          const have = new Set(existing.map((r) => r.id));
          state.assetRequests = [...existing, ...SEED_ASSET_REQUESTS.filter((r) => !have.has(r.id))];
        }
        if (state && version < 3) {
          // The activity trail no longer surfaces asset assignments — show the
          // project allocation instead. Drop asset events and merge the new seeds.
          const kept = (state.activity ?? []).filter((a) => a.category !== "assets");
          const have = new Set(kept.map((a) => a.id));
          state.activity = [...kept, ...SEED_ACTIVITY.filter((a) => !have.has(a.id))];
        }
        return state as DirectoryState;
      },
    },
  ),
);

export function useHydratedDirectory() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    useDirectoryStore.persist.rehydrate();
    setHydrated(true);
  }, []);
  return hydrated;
}

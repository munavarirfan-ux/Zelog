"use client";

import * as React from "react";
import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Boxes, Check, CheckCircle2, ClipboardList, CreditCard, HardDrive, Inbox, Laptop, Monitor, MoreVertical,
  Package, Plus, RefreshCw, RotateCw, Search, Smartphone, Wrench, X, type LucideIcon,
} from "lucide-react";
import { useOrgStore } from "@/store/orgStore";
import { useDirectoryStore, useHydratedDirectory } from "@/store/directoryStore";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { departmentColor, type Employee } from "@/data/orgData";
import {
  ASSET_CATEGORIES, ASSET_CONDITIONS, ASSET_REQUEST_STATUS, ASSET_STATUS,
  type Asset, type AssetCategory, type AssetCondition, type AssetRequest, type AssetStatus,
} from "@/data/directoryData";
import { PersonAvatar } from "@/components/ui/person-avatar";
import { CountUp } from "@/components/home/HomeUI";
import { SubNav } from "@/components/attendance/shared";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { AssetAssignDialog } from "./AssetAssignDialog";

const CATEGORY_ICON: Record<AssetCategory, LucideIcon> = {
  Laptop,
  Monitor,
  Phone: Smartphone,
  "Access Card": CreditCard,
  Accessory: Package,
};

const STATUS_OPTIONS: { value: AssetStatus; label: string }[] = [
  { value: "assigned", label: "Assigned" },
  { value: "repair", label: "In Repair" },
  { value: "returned", label: "Returned" },
  { value: "lost", label: "Lost" },
  { value: "retired", label: "Retired" },
];

export function AssetsHub() {
  const hydrated = useHydratedDirectory();
  const { currentUser, activeRole } = useCurrentUser();
  const canManage = activeRole !== "employee";

  const employees = useOrgStore((s) => s.employees);
  const assets = useDirectoryStore((s) => s.assets);
  const requests = useDirectoryStore((s) => s.assetRequests);
  const updateAssetStatus = useDirectoryStore((s) => s.updateAssetStatus);
  const updateAssetCondition = useDirectoryStore((s) => s.updateAssetCondition);
  const decideAssetRequest = useDirectoryStore((s) => s.decideAssetRequest);

  const empById = useMemo(() => new Map(employees.map((e) => [e.id, e])), [employees]);

  const [tab, setTab] = useState<"assigned" | "requests">("assigned");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<"all" | AssetCategory>("all");
  const [status, setStatus] = useState<"all" | AssetStatus>("all");
  const [dialog, setDialog] = useState<{ mode: "assign" | "reassign"; asset?: Asset } | null>(null);

  const stats = useMemo(() => {
    const by = (s: AssetStatus) => assets.filter((a) => a.status === s).length;
    return { total: assets.length, assigned: by("assigned"), repair: by("repair"), returned: by("returned") };
  }, [assets]);

  const pendingCount = useMemo(() => requests.filter((r) => r.status === "pending").length, [requests]);

  // Pending first, then most-recently requested.
  const sortedRequests = useMemo(
    () =>
      [...requests].sort((a, b) => {
        if (a.status === "pending" && b.status !== "pending") return -1;
        if (b.status === "pending" && a.status !== "pending") return 1;
        return a.createdAt < b.createdAt ? 1 : -1;
      }),
    [requests],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return assets
      .filter((a) => (category === "all" ? true : a.category === category))
      .filter((a) => (status === "all" ? true : a.status === status))
      .filter((a) => {
        if (!q) return true;
        const owner = empById.get(a.employeeId)?.name ?? "";
        return [a.name, a.assetId, a.serialNumber, a.manufacturer, a.model, owner]
          .filter(Boolean)
          .some((v) => (v as string).toLowerCase().includes(q));
      })
      .sort((a, b) => (a.assignedDate < b.assignedDate ? 1 : -1));
  }, [assets, category, status, search, empById]);

  if (!hydrated) {
    return <div className="h-64 animate-pulse rounded-[22px] bg-surface-2/60" />;
  }

  return (
    <div className="space-y-5 pb-6">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-[28px] bg-hero px-6 py-7 text-white shadow-[0_30px_80px_-32px_rgba(49,46,129,0.65)] sm:px-8 sm:py-8">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute -right-16 -top-24 h-72 w-72 rounded-full bg-[#B197FF]/30 blur-[90px]" />
          <div className="absolute right-1/3 top-1/2 h-64 w-64 rounded-full bg-[#5B8DEF]/25 blur-[90px]" />
          <div className="absolute -bottom-24 left-1/4 h-64 w-64 rounded-full bg-[#7A4DFF]/25 blur-[90px]" />
          <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, #fff 1px, transparent 0)", backgroundSize: "22px 22px" }} />
        </div>
        <div className="relative">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h1 className="text-[26px] font-semibold leading-tight tracking-tight sm:text-[30px]">Assets</h1>
              <p className="mt-2 max-w-md text-sm text-white/65">Track company equipment and who it's assigned to across the organization.</p>
            </div>
            {canManage ? (
              <button
                type="button"
                onClick={() => setDialog({ mode: "assign" })}
                className="inline-flex min-h-[44px] items-center gap-1.5 rounded-[13px] bg-white px-4 text-sm font-semibold text-primary-700 shadow-[0_8px_24px_-8px_rgba(0,0,0,0.4)] transition-colors hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
              >
                <Plus className="h-4 w-4" /> Assign Asset
              </button>
            ) : null}
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3 border-t border-white/10 pt-6 sm:grid-cols-4">
            <HeroStatTile label="Total Assets" value={stats.total} icon={Boxes} accent="#C4B5FF" />
            <HeroStatTile label="Assigned" value={stats.assigned} icon={CheckCircle2} accent="#6EE7B7" />
            <HeroStatTile label="In Repair" value={stats.repair} icon={Wrench} accent="#FCD34D" />
            <HeroStatTile label="Returned" value={stats.returned} icon={RotateCw} accent="#93C5FD" />
          </div>
        </div>
      </section>

      {/* Tabs */}
      <SubNav
        items={[
          { id: "assigned", label: "Assigned", icon: HardDrive },
          { id: "requests", label: "Requests", icon: ClipboardList, count: pendingCount },
        ]}
        value={tab}
        onChange={(id) => setTab(id as "assigned" | "requests")}
        showIcons
      />

      {tab === "requests" ? (
        <RequestsTable
          requests={sortedRequests}
          empById={empById}
          canManage={canManage}
          onDecide={(id, status) => decideAssetRequest(id, status, currentUser.id)}
        />
      ) : (
      <>
      {/* Toolbar */}
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by asset, ID, serial or owner…"
            aria-label="Search assets"
            className="w-full rounded-[12px] border border-border/[0.09] bg-surface py-2.5 pl-9 pr-3 text-sm text-text outline-none transition-colors placeholder:text-text-tertiary focus:border-primary-300"
          />
        </div>
        <select value={category} onChange={(e) => setCategory(e.target.value as never)} className={selectCls}>
          <option value="all">All categories</option>
          {ASSET_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value as never)} className={selectCls}>
          <option value="all">All statuses</option>
          {STATUS_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-[18px] border border-dashed border-border/20 bg-surface py-16 text-center">
          <HardDrive className="h-7 w-7 text-text-tertiary" />
          <p className="text-sm text-text-secondary">No assets match your search or filters.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-[18px] border border-border/[0.08] bg-surface">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead>
                <tr className="border-b border-border/[0.08] text-[11px] uppercase tracking-wide text-text-tertiary">
                  <th className="px-4 py-3 font-semibold">Asset</th>
                  <th className="px-4 py-3 font-semibold">Category</th>
                  <th className="px-4 py-3 font-semibold">Assigned To</th>
                  <th className="px-4 py-3 font-semibold">Condition</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Assigned</th>
                  <th className="w-10 px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((a) => {
                  const Icon = CATEGORY_ICON[a.category] ?? Package;
                  const owner = empById.get(a.employeeId);
                  const st = ASSET_STATUS[a.status];
                  const dc = owner ? departmentColor(owner.department) : "#94A3B8";
                  return (
                    <tr key={a.id} className="border-b border-border/[0.05] transition-colors last:border-0 hover:bg-surface-2/40">
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-2.5">
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-surface-2 text-text-secondary">
                            <Icon className="h-[18px] w-[18px]" />
                          </span>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <p className="truncate font-medium text-text">{a.name}</p>
                              {a.selfReported ? (
                                <span className="shrink-0 rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700">Self-reported</span>
                              ) : null}
                            </div>
                            <p className="truncate text-xs text-text-tertiary tabular-nums">{a.assetId}{a.serialNumber ? ` · SN ${a.serialNumber}` : ""}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-2.5 text-text-secondary">{a.category}</td>
                      <td className="px-4 py-2.5">
                        {owner ? (
                          <Link href={`/directory/${owner.id}`} className="flex items-center gap-2 hover:underline">
                            <PersonAvatar name={owner.name} src={owner.avatarUrl} size={26} />
                            <span className="min-w-0">
                              <span className="block truncate font-medium text-text">{owner.name}</span>
                              <span className="flex items-center gap-1 text-xs text-text-tertiary">
                                <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: dc }} />
                                {owner.department}
                              </span>
                            </span>
                          </Link>
                        ) : (
                          <span className="text-text-tertiary">Unassigned</span>
                        )}
                      </td>
                      <td className="px-4 py-2.5">
                        {canManage ? (
                          <select
                            value={a.condition}
                            onChange={(e) => updateAssetCondition(a.id, e.target.value as AssetCondition, currentUser.id)}
                            className="rounded-[8px] border border-border/[0.14] bg-surface px-2 py-1 text-xs text-text outline-none focus:border-primary-300"
                          >
                            {ASSET_CONDITIONS.map((c) => <option key={c} value={c}>{c}</option>)}
                          </select>
                        ) : (
                          <span className="text-text-secondary">{a.condition}</span>
                        )}
                      </td>
                      <td className="px-4 py-2.5">
                        {canManage ? (
                          <select
                            value={a.status}
                            onChange={(e) => updateAssetStatus(a.id, e.target.value as AssetStatus, currentUser.id)}
                            className="rounded-[8px] border px-2 py-1 text-xs font-semibold outline-none focus:border-primary-300"
                            style={{ color: st.color, backgroundColor: `${st.color}14`, borderColor: `${st.color}33` }}
                          >
                            {STATUS_OPTIONS.map((s) => <option key={s.value} value={s.value} className="bg-surface text-text">{s.label}</option>)}
                          </select>
                        ) : (
                          <span className="rounded-full px-2 py-0.5 text-[11px] font-semibold" style={{ color: st.color, backgroundColor: `${st.color}1F` }}>{st.label}</span>
                        )}
                      </td>
                      <td className="px-4 py-2.5 tabular-nums text-text-tertiary">{a.assignedDate}</td>
                      <td className="px-4 py-2.5">
                        {canManage ? (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button type="button" className="flex h-7 w-7 items-center justify-center rounded-full text-text-tertiary hover:bg-surface-2 hover:text-text" aria-label={`Actions for ${a.name}`}>
                                <MoreVertical className="h-4 w-4" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="min-w-[12rem]">
                              <DropdownMenuLabel>Manage asset</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => setDialog({ mode: "reassign", asset: a })}>
                                <RotateCw className="h-4 w-4 text-text-tertiary" /> Reassign to…
                              </DropdownMenuItem>
                              {owner ? (
                                <DropdownMenuItem onClick={() => { window.location.href = `/directory/${owner.id}`; }}>
                                  <PersonAvatar name={owner.name} src={owner.avatarUrl} size={16} /> Open owner profile
                                </DropdownMenuItem>
                              ) : null}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        ) : null}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
      </>
      )}

      {dialog ? (
        <AssetAssignDialog open mode={dialog.mode} asset={dialog.asset} onClose={() => setDialog(null)} />
      ) : null}
    </div>
  );
}

/* ── Requests queue ── */

function RequestsTable({
  requests,
  empById,
  canManage,
  onDecide,
}: {
  requests: AssetRequest[];
  empById: Map<string, Employee>;
  canManage: boolean;
  onDecide: (id: string, status: "approved" | "rejected") => void;
}) {
  if (requests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-[18px] border border-dashed border-border/20 bg-surface py-16 text-center">
        <Inbox className="h-7 w-7 text-text-tertiary" />
        <p className="text-sm text-text-secondary">No asset requests right now.</p>
        <p className="text-xs text-text-tertiary">Requests employees raise for new or replacement equipment show up here.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-[18px] border border-border/[0.08] bg-surface">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[860px] text-left text-sm">
          <thead>
            <tr className="border-b border-border/[0.08] text-[11px] uppercase tracking-wide text-text-tertiary">
              <th className="px-4 py-3 font-semibold">Requested By</th>
              <th className="px-4 py-3 font-semibold">Request</th>
              <th className="px-4 py-3 font-semibold">Reason</th>
              <th className="px-4 py-3 font-semibold">Requested</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="w-32 px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {requests.map((r) => {
              const emp = empById.get(r.employeeId);
              const rs = ASSET_REQUEST_STATUS[r.status];
              const dc = emp ? departmentColor(emp.department) : "#94A3B8";
              const Icon = CATEGORY_ICON[r.category] ?? Package;
              return (
                <tr key={r.id} className="border-b border-border/[0.05] align-top transition-colors last:border-0 hover:bg-surface-2/40">
                  <td className="px-4 py-3">
                    {emp ? (
                      <Link href={`/directory/${emp.id}`} className="flex items-center gap-2 hover:underline">
                        <PersonAvatar name={emp.name} src={emp.avatarUrl} size={26} />
                        <span className="min-w-0">
                          <span className="block truncate font-medium text-text">{emp.name}</span>
                          <span className="flex items-center gap-1 text-xs text-text-tertiary">
                            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: dc }} />
                            {emp.department}
                          </span>
                        </span>
                      </Link>
                    ) : (
                      <span className="text-text-tertiary">Unknown</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px] bg-surface-2 text-text-secondary">
                        <Icon className="h-4 w-4" />
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="truncate font-medium text-text">{r.label}</p>
                          <span
                            className={cn(
                              "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold",
                              r.kind === "change" ? "bg-amber-100 text-amber-700" : "bg-primary-50 text-primary-700",
                            )}
                          >
                            {r.kind === "change" ? <><RefreshCw className="h-2.5 w-2.5" /> Replacement</> : "New"}
                          </span>
                        </div>
                        <p className="text-xs text-text-tertiary">{r.category}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-text-secondary"><span className="line-clamp-2 max-w-[280px]">{r.reason}</span></td>
                  <td className="px-4 py-3 tabular-nums text-text-tertiary">{r.createdAt.slice(0, 10)}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold" style={{ color: rs.color, backgroundColor: `${rs.color}1F` }}>
                      {rs.label}
                    </span>
                    {r.note && r.status !== "pending" ? <p className="mt-1 max-w-[180px] text-[11px] text-text-tertiary">{r.note}</p> : null}
                  </td>
                  <td className="px-4 py-3">
                    {canManage && r.status === "pending" ? (
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => onDecide(r.id, "approved")}
                          className="inline-flex items-center gap-1 rounded-[9px] bg-emerald-50 px-2.5 py-1.5 text-xs font-semibold text-emerald-700 transition-colors hover:bg-emerald-100"
                        >
                          <Check className="h-3.5 w-3.5" /> Approve
                        </button>
                        <button
                          type="button"
                          onClick={() => onDecide(r.id, "rejected")}
                          className="inline-flex items-center gap-1 rounded-[9px] bg-rose-50 px-2.5 py-1.5 text-xs font-semibold text-rose-600 transition-colors hover:bg-rose-100"
                          aria-label="Reject request"
                        >
                          <X className="h-3.5 w-3.5" /> Reject
                        </button>
                      </div>
                    ) : null}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const selectCls =
  "rounded-[12px] border border-border/[0.09] bg-surface px-3 py-2.5 text-sm text-text outline-none transition-colors focus:border-primary-300";

function HeroStatTile({ label, value, icon: Icon, accent }: { label: string; value: number; icon: LucideIcon; accent: string }) {
  return (
    <div className="group rounded-[16px] border border-white/15 bg-white/10 p-3.5 backdrop-blur transition-colors hover:bg-white/[0.15]">
      <span className="flex h-8 w-8 items-center justify-center rounded-[10px] border border-white/15 bg-white/10 transition-transform duration-200 group-hover:scale-105" style={{ color: accent }} aria-hidden>
        <Icon className="h-[17px] w-[17px]" strokeWidth={2} />
      </span>
      <div className="mt-3">
        <CountUp value={value} className="text-2xl font-bold leading-none text-white" />
      </div>
      <p className="mt-1 text-xs font-medium text-white/70">{label}</p>
    </div>
  );
}

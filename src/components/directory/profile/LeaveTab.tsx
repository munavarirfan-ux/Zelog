"use client";

import * as React from "react";
import { useMemo, useState } from "react";
import { parseISO } from "date-fns";
import { CalendarClock, History, Plus } from "lucide-react";
import { computeBalances, leaveTypeById, MOCK_REQUESTS, requestLabel, type RequestStatus } from "@/data/timeOffData";
import { DIR_TODAY } from "@/data/directoryData";
import { useDirectoryStore } from "@/store/directoryStore";
import { LeaveBalanceRings } from "@/components/timeoff/LeaveBalanceRings";
import { cn } from "@/lib/utils";
import type { DirectoryPerson } from "../shared";
import { Section, Empty } from "./parts";

const SUBTABS = ["Upcoming", "Pending", "History", "Adjustments"] as const;
type Sub = (typeof SUBTABS)[number];

const STATUS_STYLE: Record<RequestStatus, { label: string; color: string }> = {
  approved: { label: "Approved", color: "#10B981" },
  pending: { label: "Pending", color: "#F59E0B" },
  rejected: { label: "Rejected", color: "#EF4444" },
  cancelled: { label: "Cancelled", color: "#94A3B8" },
  "changes-requested": { label: "Changes Requested", color: "#8B7CF6" },
};

export function LeaveTab({ person, canEdit, onAdjust }: { person: DirectoryPerson; canEdit: boolean; onAdjust: () => void }) {
  const [sub, setSub] = useState<Sub>("Upcoming");
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const requestsRef = React.useRef<HTMLDivElement>(null);
  const allAdjustments = useDirectoryStore((s) => s.leaveAdjustments);
  const adjustments = useMemo(() => allAdjustments.filter((a) => a.employeeId === person.id), [allAdjustments, person.id]);

  const balances = useMemo(() => {
    const base = computeBalances(person.id, MOCK_REQUESTS);
    return base
      .map((b) => {
        const delta = adjustments.filter((a) => a.leaveTypeId === b.key).reduce((s, a) => s + a.delta, 0);
        return { ...b, available: Math.max(0, b.available + delta) };
      })
      // Show a ring per leave type that carries an annual quota.
      .filter((b) => b.total > 0 || b.used > 0);
  }, [person.id, adjustments]);

  function viewDetails(key: string) {
    setTypeFilter(key);
    setSub("History");
    requestsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const mine = useMemo(() => {
    const all = MOCK_REQUESTS.filter((r) => r.employeeId === person.id);
    return typeFilter ? all.filter((r) => r.leaveTypeId === typeFilter) : all;
  }, [person.id, typeFilter]);
  const today = parseISO(DIR_TODAY);
  const upcoming = mine.filter((r) => r.status === "approved" && parseISO(r.startDate) >= today);
  const pending = mine.filter((r) => r.status === "pending" || r.status === "changes-requested");
  const history = mine.filter((r) => parseISO(r.endDate) < today || r.status === "rejected" || r.status === "cancelled");
  const filterLabel = typeFilter ? leaveTypeById(typeFilter)?.name ?? typeFilter : null;

  return (
    <div className="space-y-4">
      {/* Balances */}
      <Section
        title="Leave Balances"
        icon={CalendarClock}
        action={canEdit ? (
          <button onClick={onAdjust} className="inline-flex items-center gap-1.5 rounded-[10px] bg-primary-gradient px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:opacity-95">
            <Plus className="h-3.5 w-3.5" /> Adjust Leave Balance
          </button>
        ) : undefined}
      >
        <LeaveBalanceRings balances={balances} onViewDetails={viewDetails} />
        {canEdit ? (
          <p className="mt-3 rounded-[10px] bg-surface-2/60 px-3 py-2 text-[11px] text-text-tertiary">
            Manual adjustments are always recorded with reason, actor and before/after balance in the Adjustments tab and activity log.
          </p>
        ) : null}
      </Section>

      {/* Requests */}
      <div ref={requestsRef}>
      <Section
        title="Leave Requests"
        icon={History}
        tint="#38BDF8"
        action={filterLabel ? (
          <button
            onClick={() => setTypeFilter(null)}
            className="inline-flex items-center gap-1.5 rounded-full bg-surface-2 px-3 py-1 text-xs font-medium text-text-secondary transition-colors hover:text-text"
          >
            {filterLabel} ✕
          </button>
        ) : undefined}
      >
        <div className="mb-4 inline-flex items-center gap-1 rounded-[12px] bg-surface-2 p-1">
          {SUBTABS.map((s) => (
            <button
              key={s}
              onClick={() => setSub(s)}
              className={cn("rounded-[9px] px-3 py-1.5 text-sm font-medium transition-all", sub === s ? "bg-surface text-text shadow-sm" : "text-text-tertiary hover:text-text-secondary")}
            >
              {s}
            </button>
          ))}
        </div>

        {sub === "Adjustments" ? (
          adjustments.length === 0 ? <Empty>No manual adjustments recorded.</Empty> : (
            <ul className="space-y-2.5">
              {adjustments.map((a) => (
                <li key={a.id} className="flex items-start justify-between gap-3 rounded-[12px] border border-border/[0.07] p-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-text">
                      {leaveTypeById(a.leaveTypeId)?.name ?? a.leaveTypeId} · <span className={a.delta >= 0 ? "text-emerald-600" : "text-rose-600"}>{a.delta >= 0 ? "+" : ""}{a.delta} days</span>
                    </p>
                    <p className="text-xs text-text-tertiary">{a.reason}{a.notes ? ` — ${a.notes}` : ""}</p>
                    <p className="mt-0.5 text-[11px] text-text-tertiary">Effective {a.effectiveDate}</p>
                  </div>
                  <div className="shrink-0 text-right text-[11px] text-text-tertiary">
                    <p>{a.previousBalance} → <span className="font-semibold text-text">{a.newBalance}</span></p>
                  </div>
                </li>
              ))}
            </ul>
          )
        ) : (
          (() => {
            const list = sub === "Upcoming" ? upcoming : sub === "Pending" ? pending : history;
            if (list.length === 0) return <Empty>No {sub.toLowerCase()} leave.</Empty>;
            return (
              <ul className="space-y-2.5">
                {list.map((r) => {
                  const st = STATUS_STYLE[r.status];
                  const color = leaveTypeById(r.leaveTypeId)?.color ?? "#93C5FD";
                  return (
                    <li key={r.id} className="flex items-center justify-between gap-3 rounded-[12px] border border-border/[0.07] p-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="h-8 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: color }} />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-text">{requestLabel(r)} · {r.durationDays} day{r.durationDays !== 1 ? "s" : ""}</p>
                          <p className="truncate text-xs text-text-tertiary">{r.startDate} → {r.endDate} · {r.reason}</p>
                        </div>
                      </div>
                      <span className="shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold" style={{ color: st.color, backgroundColor: `${st.color}1F` }}>{st.label}</span>
                    </li>
                  );
                })}
              </ul>
            );
          })()
        )}
      </Section>
      </div>
    </div>
  );
}

"use client";

import { ChevronDown, ChevronUp, MapPin, Users } from "lucide-react";
import { departmentColor, initials, type EmployeeNode } from "@/data/orgData";
import { useOrgStore } from "@/store/orgStore";
import { cn } from "@/lib/utils";

interface EmployeeNodeCardProps {
  node: EmployeeNode;
  directReports: number;
  hiddenCount: number;
  collapsed: boolean;
  selected: boolean;
  highlighted: boolean;
  onSelect: () => void;
  onToggleCollapse: () => void;
}

export function EmployeeNodeCard({
  node,
  directReports,
  hiddenCount,
  collapsed,
  selected,
  highlighted,
  onSelect,
  onToggleCollapse,
}: EmployeeNodeCardProps) {
  const departments = useOrgStore((s) => s.departments);
  const color = departmentColor(node.department, departments);
  const hasChildren = directReports > 0;

  return (
    <div
      data-emp-id={node.id}
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
      }}
      className={cn(
        "relative w-[240px] cursor-pointer rounded-[14px] border bg-surface p-3.5 text-left transition-all duration-150",
        "shadow-[0_2px_8px_rgba(40,30,90,0.06)] hover:shadow-[0_8px_24px_rgba(40,30,90,0.12)]",
        selected
          ? "border-primary-400 ring-2 ring-primary-400/40"
          : highlighted
            ? "border-primary-500 ring-2 ring-primary-500/60"
            : "border-border/[0.08] dark:border-white/[0.06]",
        node.status === "inactive" && "opacity-70",
      )}
    >
      <div className="flex items-center gap-3">
        <div className="relative shrink-0">
          <div
            className="flex h-11 w-11 items-center justify-center rounded-full text-[13px] font-bold text-white"
            style={{ backgroundColor: color }}
          >
            {initials(node.name)}
          </div>
          <span
            className={cn(
              "absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-surface",
              node.status === "active" ? "bg-success" : "bg-text-disabled",
            )}
            title={node.status === "active" ? "Active" : "Inactive"}
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-text">{node.name}</p>
          <p className="truncate text-xs text-text-secondary">{node.jobTitle}</p>
          {node.location && (
            <p className="mt-0.5 flex items-center gap-1 truncate text-[11px] text-text-tertiary">
              <MapPin className="h-3 w-3 shrink-0" strokeWidth={2} /> {node.location}
            </p>
          )}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-2 px-2 py-0.5 text-[11px] font-medium text-text-secondary dark:bg-white/[0.04]">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
          {node.department}
        </span>
        {node.status === "inactive" && (
          <span className="rounded-full bg-text-disabled/15 px-2 py-0.5 text-[11px] font-medium text-text-tertiary">
            Inactive
          </span>
        )}
      </div>

      {hasChildren && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleCollapse();
          }}
          className="mt-3 flex w-full items-center justify-between rounded-lg border border-border/[0.07] bg-surface-2/60 px-2.5 py-1.5 text-[11px] font-medium text-text-secondary transition-colors hover:bg-surface-2 dark:border-white/[0.06]"
        >
          <span className="inline-flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5" strokeWidth={2} />
            {collapsed ? `${hiddenCount} hidden` : `${directReports} direct report${directReports === 1 ? "" : "s"}`}
          </span>
          {collapsed ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronUp className="h-3.5 w-3.5" />}
        </button>
      )}
    </div>
  );
}

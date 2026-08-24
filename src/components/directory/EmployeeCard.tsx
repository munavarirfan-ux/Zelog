"use client";

import * as React from "react";
import { Mail, MoreVertical } from "lucide-react";
import { departmentColor } from "@/data/orgData";
import { cn } from "@/lib/utils";
import { Avatar, DirStatusPill, type DirectoryPerson } from "./shared";

/** Grid card — compact, premium, not a giant avatar. */
export function EmployeeCard({
  person,
  managerName,
  selected,
  showSelect,
  onSelect,
  onOpen,
  onKebab,
}: {
  person: DirectoryPerson;
  managerName?: string;
  selected?: boolean;
  showSelect?: boolean;
  onSelect?: (checked: boolean) => void;
  onOpen: () => void;
  onKebab: (anchor: HTMLElement) => void;
}) {
  const deptColor = departmentColor(person.department);
  const showStatus = person.employmentStatus !== "active";

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen();
        }
      }}
      className={cn(
        "group relative flex flex-col rounded-[18px] border bg-surface p-4 text-left shadow-[0_1px_2px_rgba(40,30,90,0.04)] transition-all",
        "cursor-pointer hover:-translate-y-0.5 hover:shadow-[0_16px_34px_-20px_rgba(49,46,129,0.4)]",
        selected ? "border-transparent ring-2 ring-primary-500" : "border-border/[0.07]",
      )}
    >
      {/* top row: select + kebab */}
      <div className="mb-1 flex items-start justify-between">
        {showSelect ? (
          <input
            type="checkbox"
            checked={!!selected}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => onSelect?.(e.target.checked)}
            className="h-4 w-4 shrink-0 cursor-pointer rounded border-border/40 accent-primary-600"
            aria-label={`Select ${person.name}`}
          />
        ) : (
          <span />
        )}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onKebab(e.currentTarget);
          }}
          className="-mr-1 -mt-1 flex h-7 w-7 items-center justify-center rounded-full text-text-tertiary opacity-0 transition-all hover:bg-surface-2 hover:text-text group-hover:opacity-100"
          aria-label={`Actions for ${person.name}`}
        >
          <MoreVertical className="h-4 w-4" />
        </button>
      </div>

      <div className="flex items-center gap-3">
        <Avatar person={person} size={52} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[15px] font-semibold tracking-tight text-text">{person.name}</p>
          <p className="truncate text-xs text-text-secondary">{person.jobTitle}</p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        <span
          className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium"
          style={{ color: deptColor, backgroundColor: `${deptColor}24` }}
        >
          <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: deptColor }} />
          {person.department}
        </span>
        {person.extra?.team ? (
          <span className="rounded-full bg-surface-2 px-2 py-0.5 text-[11px] font-medium text-text-tertiary">
            {person.extra.team}
          </span>
        ) : null}
      </div>

      <div className="mt-3 flex items-center gap-1.5 text-xs text-text-tertiary">
        <Mail className="h-3.5 w-3.5 shrink-0" />
        <span className="truncate">{person.email}</span>
      </div>

      <div className="mt-3 flex items-center justify-between gap-2 border-t border-border/[0.06] pt-3">
        <span className="min-w-0 truncate text-[11px] text-text-tertiary">
          {managerName ? `Reports to ${managerName}` : "No manager"}
        </span>
        {showStatus ? <DirStatusPill status={person.employmentStatus} /> : <span className="text-[11px] text-text-tertiary">{person.extra?.employeeCode}</span>}
      </div>
    </div>
  );
}

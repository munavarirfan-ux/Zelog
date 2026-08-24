"use client";

import * as React from "react";
import { useMemo } from "react";
import { avatarGradient, initials, type Employee } from "@/data/orgData";
import { useOrgStore, useHydratedOrg } from "@/store/orgStore";
import { useDirectoryStore, useHydratedDirectory } from "@/store/directoryStore";
import {
  EMPLOYMENT_STATUS,
  type EmployeeProfileExtra,
  type EmploymentStatus,
} from "@/data/directoryData";
import { cn } from "@/lib/utils";

/** A merged directory person: org identity + directory extras. */
export interface DirectoryPerson extends Employee {
  extra: EmployeeProfileExtra;
  /** Convenience mirror of extra.employmentStatus. */
  employmentStatus: EmploymentStatus;
}

/**
 * Merge the org roster (identity/reporting source of truth) with directory
 * extras into one people list. Status resolves to active / inactive (with the
 * richer on-leave / notice-period views coming from the extras record).
 */
export function useDirectoryPeople(): DirectoryPerson[] {
  const employees = useOrgStore((s) => s.employees);
  const extras = useDirectoryStore((s) => s.extras);

  return useMemo(() => {
    return employees
      .map((e) => {
        const extra = extras[e.id];
        const employmentStatus: EmploymentStatus =
          extra?.employmentStatus ?? (e.status === "inactive" ? "inactive" : "active");
        return { ...e, extra: extra as EmployeeProfileExtra, employmentStatus };
      })
      .filter((p) => p.extra);
  }, [employees, extras]);
}

/** Look up one person by id. */
export function useDirectoryPerson(id: string): DirectoryPerson | undefined {
  const people = useDirectoryPeople();
  return people.find((p) => p.id === id);
}

/** Both stores hydrated. */
export function useHydratedDirectoryPage(): boolean {
  const orgReady = useHydratedOrg();
  const dirReady = useHydratedDirectory();
  return orgReady && dirReady;
}

/* ── Avatar ── */

export function Avatar({
  person,
  size = 44,
  className,
}: {
  person: Pick<Employee, "name" | "avatarUrl" | "id">;
  size?: number;
  className?: string;
}) {
  const dim = { width: size, height: size } as React.CSSProperties;
  if (person.avatarUrl) {
    return (
      <img
        src={person.avatarUrl}
        alt=""
        style={dim}
        className={cn("shrink-0 rounded-full object-cover", className)}
      />
    );
  }
  return (
    <span
      style={{ ...dim, background: avatarGradient(person.id || person.name), fontSize: size * 0.36 }}
      className={cn("flex shrink-0 items-center justify-center rounded-full font-semibold text-white", className)}
      aria-hidden
    >
      {initials(person.name)}
    </span>
  );
}

/* ── Status pill ── */

export function DirStatusPill({ status, className }: { status: EmploymentStatus; className?: string }) {
  const s = EMPLOYMENT_STATUS[status];
  return (
    <span
      className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold", className)}
      style={{ color: s.color, backgroundColor: `${s.color}1F` }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: s.color }} />
      {s.label}
    </span>
  );
}

/* ── Small labeled field (profile detail rows) ── */

export function Field({
  label,
  value,
  className,
}: {
  label: string;
  value: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("min-w-0", className)}>
      <dt className="text-[11px] font-medium uppercase tracking-wide text-text-tertiary">{label}</dt>
      <dd className="mt-1 truncate text-sm font-medium text-text">{value || <span className="text-text-tertiary">—</span>}</dd>
    </div>
  );
}

"use client";

import * as React from "react";
import { useMemo } from "react";
import { Building2, Layers, Upload, UserMinus, UserPlus, Users, type LucideIcon } from "lucide-react";
import { CountUp } from "@/components/home/HomeUI";
import type { DirectoryPerson } from "./shared";

interface HeroStat {
  label: string;
  value: number;
  icon: LucideIcon;
  accent: string;
}

/**
 * Directory hero — brings the module in line with the rest of Ze[flow]'s pages
 * (same `bg-hero` gradient card) while surfacing an at-a-glance people summary.
 * Kept deliberately calm: a few counts, not an analytics dashboard.
 */
export function DirectoryHero({
  people,
  canEdit,
  onImport,
  onAdd,
}: {
  people: DirectoryPerson[];
  canEdit: boolean;
  onImport: () => void;
  onAdd: () => void;
}) {
  const stats = useMemo<HeroStat[]>(() => {
    const roster = people.filter((p) => p.employmentStatus !== "inactive");
    const departments = new Set(roster.map((p) => p.department));
    const subDepartments = new Set(roster.map((p) => p.extra?.team).filter(Boolean));
    return [
      { label: "Total People", value: roster.length, icon: Users, accent: "#C4B5FF" },
      { label: "Departments", value: departments.size, icon: Building2, accent: "#93C5FD" },
      { label: "Sub Departments", value: subDepartments.size, icon: Layers, accent: "#FCD34D" },
      { label: "Inactive", value: people.filter((p) => p.employmentStatus === "inactive").length, icon: UserMinus, accent: "#94A3B8" },
    ];
  }, [people]);

  return (
    <section className="relative overflow-hidden rounded-[28px] bg-hero px-6 py-7 text-white shadow-[0_30px_80px_-32px_rgba(49,46,129,0.65)] sm:px-8 sm:py-8">
      {/* Mesh gradient glow */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -right-16 -top-24 h-72 w-72 rounded-full bg-[#B197FF]/30 blur-[90px]" />
        <div className="absolute right-1/3 top-1/2 h-64 w-64 rounded-full bg-[#5B8DEF]/25 blur-[90px]" />
        <div className="absolute -bottom-24 left-1/4 h-64 w-64 rounded-full bg-[#7A4DFF]/25 blur-[90px]" />
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{ backgroundImage: "radial-gradient(circle at 1px 1px, #fff 1px, transparent 0)", backgroundSize: "22px 22px" }}
        />
      </div>

      <div className="relative">
        {/* Title + actions */}
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-[26px] font-semibold leading-tight tracking-tight sm:text-[30px]">Directory</h1>
            <p className="mt-2 max-w-md text-sm text-white/65">Find and manage people across your organization.</p>
          </div>
          {canEdit ? (
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={onImport}
                className="inline-flex min-h-[44px] items-center gap-1.5 rounded-[13px] border border-white/25 bg-white/10 px-4 text-sm font-semibold text-white backdrop-blur transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
              >
                <Upload className="h-4 w-4" /> Import
              </button>
              <button
                type="button"
                onClick={onAdd}
                className="inline-flex min-h-[44px] items-center gap-1.5 rounded-[13px] bg-white px-4 text-sm font-semibold text-primary-700 shadow-[0_8px_24px_-8px_rgba(0,0,0,0.4)] transition-colors hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
              >
                <UserPlus className="h-4 w-4" /> Add Employee
              </button>
            </div>
          ) : null}
        </div>

        {/* Stat tiles */}
        <div className="mt-6 grid grid-cols-2 gap-3 border-t border-white/10 pt-6 sm:grid-cols-4">
          {stats.map((s) => (
            <HeroStatTile key={s.label} {...s} />
          ))}
        </div>
      </div>
    </section>
  );
}

function HeroStatTile({ label, value, icon: Icon, accent }: HeroStat) {
  return (
    <div className="group rounded-[16px] border border-white/15 bg-white/10 p-3.5 backdrop-blur transition-colors hover:bg-white/[0.15]">
      <span
        className="flex h-8 w-8 items-center justify-center rounded-[10px] border border-white/15 bg-white/10 transition-transform duration-200 group-hover:scale-105"
        style={{ color: accent }}
        aria-hidden
      >
        <Icon className="h-[17px] w-[17px]" strokeWidth={2} />
      </span>
      <div className="mt-3">
        <CountUp value={value} className="text-2xl font-bold leading-none text-white" />
      </div>
      <p className="mt-1 text-xs font-medium text-white/70">{label}</p>
    </div>
  );
}

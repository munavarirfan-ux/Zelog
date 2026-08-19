"use client";

import { Search } from "lucide-react";

/**
 * Global search entry point in the top toolbar. Prepared for future search
 * across employees, projects, clients, and timesheets — currently a non-wired
 * placeholder so behavior is unchanged.
 */
export function GlobalSearch({ className }: { className?: string }) {
  return (
    <div className={className}>
      <label className="relative block">
        <span className="sr-only">Search</span>
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
        <input
          type="search"
          placeholder="Search…"
          aria-label="Global search"
          className="h-11 w-full rounded-[12px] border border-[rgb(var(--primary-main-rgb)/0.3)] bg-transparent pl-9 pr-3 text-sm text-text placeholder:text-text-tertiary focus:border-[rgb(var(--primary-main-rgb)/0.5)] focus:outline-none focus:ring-2 focus:ring-primary-400/40 dark:border-white/15"
        />
      </label>
    </div>
  );
}

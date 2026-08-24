"use client";

import * as React from "react";
import { useState } from "react";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { Check, ChevronDown, LayoutGrid, List, Search, SlidersHorizontal, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FilterOption {
  value: string;
  label: string;
}

/** A compact dropdown filter that fits inline in the toolbar row. */
export function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string; // "" = all
  options: FilterOption[];
  onChange: (v: string) => void;
}) {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const active = value !== "";
  const current = options.find((o) => o.value === value);

  return (
    <>
      <button
        type="button"
        onClick={(e) => setAnchor(e.currentTarget)}
        className={cn(
          "inline-flex items-center gap-1.5 whitespace-nowrap rounded-[12px] border px-3 py-2 text-sm font-medium transition-colors",
          active
            ? "border-primary-300 bg-primary-50 text-primary-700"
            : "border-border/[0.1] bg-surface text-text-secondary hover:border-border/25 hover:text-text",
        )}
      >
        {active ? current?.label : label}
        <ChevronDown className="h-3.5 w-3.5 opacity-60" />
      </button>
      <Menu
        anchorEl={anchor}
        open={!!anchor}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        slotProps={{ paper: { className: "mt-1 min-w-[180px] max-h-[320px] rounded-[14px] shadow-lg" } }}
      >
        <MenuItem
          onClick={() => {
            onChange("");
            setAnchor(null);
          }}
          className="text-sm"
        >
          <span className="flex-1">All {label}</span>
          {value === "" ? <Check className="h-4 w-4 text-primary-600" /> : null}
        </MenuItem>
        {options.map((o) => (
          <MenuItem
            key={o.value}
            onClick={() => {
              onChange(o.value);
              setAnchor(null);
            }}
            className="text-sm"
          >
            <span className="flex-1">{o.label}</span>
            {value === o.value ? <Check className="h-4 w-4 text-primary-600" /> : null}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}

export type ViewMode = "grid" | "list";

export interface FilterDef {
  key: string;
  label: string;
  options: FilterOption[];
}

export function DirectoryToolbar({
  search,
  onSearch,
  filters,
  values,
  onFilterChange,
  view,
  onViewChange,
}: {
  search: string;
  onSearch: (v: string) => void;
  filters: FilterDef[];
  values: Record<string, string>;
  onFilterChange: (key: string, v: string) => void;
  view: ViewMode;
  onViewChange: (v: ViewMode) => void;
}) {
  const [moreAnchor, setMoreAnchor] = useState<HTMLElement | null>(null);

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Search */}
      <div className="relative min-w-[220px] flex-1 lg:max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
        <input
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Search name, ID, email, title, team…"
          className="h-[38px] w-full rounded-[12px] border border-border/[0.1] bg-surface pl-9 pr-8 text-sm text-text outline-none transition-colors placeholder:text-text-tertiary focus:border-primary-300"
        />
        {search ? (
          <button
            type="button"
            onClick={() => onSearch("")}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      {/* Inline filters (desktop) */}
      <div className="hidden items-center gap-2 lg:flex">
        {filters.map((f) => (
          <FilterSelect
            key={f.key}
            label={f.label}
            value={values[f.key] ?? ""}
            options={f.options}
            onChange={(v) => onFilterChange(f.key, v)}
          />
        ))}
      </div>

      {/* Compact "Filters" button (mobile / tablet) */}
      <button
        type="button"
        onClick={(e) => setMoreAnchor(e.currentTarget)}
        className="inline-flex items-center gap-1.5 rounded-[12px] border border-border/[0.1] bg-surface px-3 py-2 text-sm font-medium text-text-secondary hover:text-text lg:hidden"
      >
        <SlidersHorizontal className="h-4 w-4" />
        Filters
      </button>
      <Menu
        anchorEl={moreAnchor}
        open={!!moreAnchor}
        onClose={() => setMoreAnchor(null)}
        slotProps={{ paper: { className: "mt-1 w-[240px] rounded-[14px] p-2 shadow-lg" } }}
      >
        <div className="flex flex-col gap-2 p-1">
          {filters.map((f) => (
            <div key={f.key}>
              <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-text-tertiary">{f.label}</p>
              <select
                value={values[f.key] ?? ""}
                onChange={(e) => onFilterChange(f.key, e.target.value)}
                className="w-full rounded-[10px] border border-border/[0.12] bg-surface px-2.5 py-1.5 text-sm text-text outline-none"
              >
                <option value="">All {f.label}</option>
                {f.options.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </Menu>

      {/* View toggle */}
      <div className="ml-auto inline-flex items-center gap-0.5 rounded-[12px] bg-surface-2 p-1">
        {(["grid", "list"] as ViewMode[]).map((m) => {
          const Icon = m === "grid" ? LayoutGrid : List;
          const active = view === m;
          return (
            <button
              key={m}
              type="button"
              onClick={() => onViewChange(m)}
              aria-label={`${m} view`}
              aria-pressed={active}
              className={cn(
                "flex h-7 w-8 items-center justify-center rounded-[9px] transition-all",
                active ? "bg-surface text-text shadow-[0_1px_3px_rgba(40,30,90,0.12)]" : "text-text-tertiary hover:text-text-secondary",
              )}
            >
              <Icon className="h-4 w-4" />
            </button>
          );
        })}
      </div>
    </div>
  );
}

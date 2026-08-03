"use client";

import { useState } from "react";
import { ChevronDown, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FilterOption {
  value: string;
  label: string;
}

export function FilterDropdown({ label, options, selected, onChange }: {
  label: string;
  options: FilterOption[];
  selected: string[];
  onChange: (v: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = options.filter((o) => o.label.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          "inline-flex h-10 items-center gap-1.5 rounded-[10px] border px-3.5 text-xs font-medium transition-colors",
          selected.length > 0
            ? "border-accent/30 bg-accent/5 text-accent"
            : "border-border/10 bg-surface-2/60 text-text-secondary hover:bg-surface-2 dark:border-white/10",
        )}
      >
        {label} {selected.length > 0 && <span className="rounded-full bg-accent/15 px-1.5 text-[10px] font-bold">{selected.length}</span>}
        <ChevronDown className="h-3 w-3 opacity-60" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => { setOpen(false); setSearch(""); }} />
          <div className="absolute left-0 top-full z-40 mt-1.5 w-60 rounded-card border border-border/10 bg-surface p-2 shadow-float dark:border-white/10">
            <div className="relative mb-2">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-tertiary" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={`Search ${label.toLowerCase()}...`}
                className="h-8 w-full rounded-[8px] border-0 bg-surface-2/80 pl-8 pr-2 text-xs text-text placeholder:text-text-tertiary focus:outline-none focus:ring-1 focus:ring-accent/20"
                autoFocus
              />
            </div>
            {selected.length > 0 && (
              <button
                type="button"
                onClick={() => onChange([])}
                className="mb-1.5 flex w-full items-center gap-1.5 rounded-md px-2 py-1.5 text-[11px] font-medium text-text-tertiary hover:bg-surface-2 hover:text-text transition-colors"
              >
                <X className="h-3 w-3" /> Clear All
              </button>
            )}
            <div className="max-h-52 overflow-y-auto space-y-0.5">
              {filtered.map((opt) => {
                const isSelected = selected.includes(opt.value);
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      onChange(isSelected ? selected.filter((v) => v !== opt.value) : [...selected, opt.value]);
                    }}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs transition-colors",
                      isSelected ? "bg-accent/10 text-accent font-medium" : "text-text hover:bg-surface-2",
                    )}
                  >
                    <span className={cn("h-3.5 w-3.5 rounded border flex items-center justify-center shrink-0 transition-colors", isSelected ? "border-accent bg-accent" : "border-border/30 dark:border-white/20")}>
                      {isSelected && <span className="text-white text-[9px] font-bold">✓</span>}
                    </span>
                    <span className="truncate">{opt.label}</span>
                  </button>
                );
              })}
              {filtered.length === 0 && <p className="px-2 py-3 text-center text-xs text-text-tertiary">No results</p>}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

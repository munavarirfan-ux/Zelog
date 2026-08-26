"use client";

import { useState } from "react";
import Switch from "@mui/material/Switch";
import { Plus, X, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/** Shared "purple on" styling for MUI switches across the settings pages. */
export const MUI_SWITCH_SX = {
  "& .Mui-checked": { color: "#7A4DFF" },
  "& .Mui-checked + .MuiSwitch-track": { backgroundColor: "#7A4DFF !important" },
} as const;

/** Page-level heading used at the top of each settings category. */
export function SettingsHeader({ title, description }: { title: string; description: string }) {
  return (
    <div>
      <h2 className="text-base font-semibold text-text">{title}</h2>
      <p className="mt-0.5 text-xs text-text-tertiary">{description}</p>
    </div>
  );
}

/** A white card section, optionally with an accent icon chip + trailing action. */
export function Panel({ title, sub, icon: Icon, color = "#7A4DFF", action, children, className }: {
  title: string;
  sub?: string;
  icon?: LucideIcon;
  color?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("rounded-card border border-border/[0.07] bg-surface p-6 shadow-card dark:border-white/[0.06]", className)}>
      <div className="mb-5 flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-2.5">
          {Icon && (
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px]" style={{ backgroundColor: `${color}18`, color }}>
              <Icon className="h-4 w-4" strokeWidth={2} />
            </span>
          )}
          <div className="min-w-0">
            <h3 className="text-[15px] font-semibold text-text">{title}</h3>
            {sub ? <p className="mt-0.5 text-xs text-text-tertiary">{sub}</p> : null}
          </div>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

/** Labelled form field wrapper with an optional hint below the control. */
export function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-text-secondary">{label}</label>
      {children}
      {hint ? <p className="mt-1 text-[11px] text-text-tertiary">{hint}</p> : null}
    </div>
  );
}

/** A divided label/switch row — the standard policy toggle. */
export function ToggleRow({ label, description, checked, onChange, disabled }: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border/[0.05] py-3 last:border-0">
      <div className="min-w-0">
        <p className="text-sm font-medium text-text">{label}</p>
        {description ? <p className="text-[11px] leading-snug text-text-tertiary">{description}</p> : null}
      </div>
      <Switch checked={checked} disabled={disabled} onChange={(e) => onChange(e.target.checked)} size="small" sx={MUI_SWITCH_SX} />
    </div>
  );
}

/** Editable set of removable chips with an inline add box. */
export function ManagedChips({ items, onAdd, onRemove, placeholder = "Add an option…" }: {
  items: string[];
  onAdd: (value: string) => void;
  onRemove: (value: string) => void;
  placeholder?: string;
}) {
  const [value, setValue] = useState("");
  function commit() {
    const t = value.trim();
    if (!t) return;
    onAdd(t);
    setValue("");
  }
  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {items.length === 0 && <p className="py-1 text-xs text-text-tertiary">None yet.</p>}
        {items.map((it) => (
          <span key={it} className="inline-flex items-center gap-1.5 rounded-full bg-surface-2 py-1 pl-3 pr-1.5 text-xs font-medium text-text-secondary">
            {it}
            <button
              type="button"
              onClick={() => onRemove(it)}
              className="flex h-4 w-4 items-center justify-center rounded-full text-text-tertiary transition-colors hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-500/20"
              aria-label={`Remove ${it}`}
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
      </div>
      <div className="mt-3 flex items-center gap-2">
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); commit(); } }}
          placeholder={placeholder}
        />
        <Button size="sm" variant="outline" className="shrink-0 gap-1 rounded-[10px]" onClick={commit}>
          <Plus className="h-3.5 w-3.5" /> Add
        </Button>
      </div>
    </div>
  );
}

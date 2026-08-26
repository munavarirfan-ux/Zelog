"use client";

import { useState } from "react";
import { Sun, Moon, Monitor, Check, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Panel } from "./settingsKit";

const PRESET_COLORS = [
  { hex: "#7A4DFF", label: "Violet" },
  { hex: "#6366F1", label: "Indigo" },
  { hex: "#EC4899", label: "Pink" },
  { hex: "#F97316", label: "Orange" },
  { hex: "#22C55E", label: "Green" },
  { hex: "#14B8A6", label: "Teal" },
  { hex: "#3B82F6", label: "Blue" },
];

const THEMES: { value: string; label: string; icon: LucideIcon }[] = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
];

export function AppearanceSettings() {
  const [theme, setTheme] = useState("light");
  const [accent, setAccent] = useState("#7A4DFF");
  const [density, setDensity] = useState("comfortable");

  return (
    <div className="space-y-5">
      <Panel title="Theme" sub="Applies to your account on this device.">
        <div className="grid grid-cols-3 gap-3">
          {THEMES.map((t) => {
            const Icon = t.icon;
            const active = theme === t.value;
            return (
              <button
                key={t.value}
                type="button"
                onClick={() => setTheme(t.value)}
                aria-pressed={active}
                className={cn(
                  "flex flex-col items-center gap-2 rounded-[12px] border px-3 py-4 text-sm font-medium transition-all duration-200",
                  active
                    ? "border-primary-300 bg-primary-soft text-primary-700"
                    : "border-border/[0.08] bg-surface text-text-secondary hover:border-border/[0.14] hover:bg-surface-2",
                )}
              >
                <Icon className="h-5 w-5" strokeWidth={2} />
                {t.label}
              </button>
            );
          })}
        </div>
      </Panel>

      <Panel title="Accent color" sub="Used for highlights, links and primary actions.">
        <div className="flex flex-wrap gap-2.5">
          {PRESET_COLORS.map((c) => {
            const active = accent.toLowerCase() === c.hex.toLowerCase();
            return (
              <button
                key={c.hex}
                type="button"
                onClick={() => setAccent(c.hex)}
                aria-label={c.label}
                aria-pressed={active}
                title={c.label}
                className={cn("relative h-9 w-9 rounded-full transition-transform", active ? "ring-2 ring-offset-2 ring-offset-surface" : "hover:scale-110")}
                style={{ backgroundColor: c.hex, ...(active ? { ["--tw-ring-color" as string]: c.hex } : {}) }}
              >
                {active && <Check className="absolute inset-0 m-auto h-4 w-4 text-white drop-shadow" strokeWidth={3} />}
              </button>
            );
          })}
        </div>
      </Panel>

      <Panel title="Density" sub="Controls spacing in tables and lists.">
        <div className="grid grid-cols-2 gap-3 sm:max-w-md">
          {[
            { value: "comfortable", label: "Comfortable", desc: "More breathing room" },
            { value: "compact", label: "Compact", desc: "Fit more on screen" },
          ].map((d) => {
            const active = density === d.value;
            return (
              <button
                key={d.value}
                type="button"
                onClick={() => setDensity(d.value)}
                aria-pressed={active}
                className={cn(
                  "rounded-[12px] border px-4 py-3 text-left transition-all duration-200",
                  active ? "border-primary-300 bg-primary-soft" : "border-border/[0.08] bg-surface hover:border-border/[0.14] hover:bg-surface-2",
                )}
              >
                <p className={cn("text-sm font-medium", active ? "text-primary-700" : "text-text")}>{d.label}</p>
                <p className="mt-0.5 text-xs text-text-tertiary">{d.desc}</p>
              </button>
            );
          })}
        </div>
      </Panel>
    </div>
  );
}

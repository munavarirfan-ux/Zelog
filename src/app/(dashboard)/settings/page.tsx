"use client";

import { useState, useEffect } from "react";
import { Check, Monitor, Moon, RotateCcw, Sun, User } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/ThemeProvider";
import { cn } from "@/lib/utils";

type SettingsTab = "profile" | "time" | "appearance";

const TABS: { key: SettingsTab; label: string }[] = [
  { key: "profile", label: "Profile" },
  { key: "time", label: "Time settings" },
  { key: "appearance", label: "Appearance" },
];

const TIME_ZONES = [
  { value: "Asia/Kolkata", label: "Asia/Kolkata (IST, UTC+5:30)" },
  { value: "America/New_York", label: "America/New_York (EST, UTC-5)" },
  { value: "America/Chicago", label: "America/Chicago (CST, UTC-6)" },
  { value: "America/Los_Angeles", label: "America/Los_Angeles (PST, UTC-8)" },
  { value: "Europe/London", label: "Europe/London (GMT, UTC+0)" },
  { value: "Europe/Paris", label: "Europe/Paris (CET, UTC+1)" },
  { value: "Europe/Berlin", label: "Europe/Berlin (CET, UTC+1)" },
  { value: "Asia/Tokyo", label: "Asia/Tokyo (JST, UTC+9)" },
  { value: "Australia/Sydney", label: "Australia/Sydney (AEST, UTC+10)" },
  { value: "Pacific/Auckland", label: "Pacific/Auckland (NZST, UTC+12)" },
];

const PRESET_COLORS = [
  { hex: "#6366F1", label: "Indigo" },
  { hex: "#8B5CF6", label: "Violet" },
  { hex: "#EC4899", label: "Pink" },
  { hex: "#F43F5E", label: "Rose" },
  { hex: "#F97316", label: "Orange" },
  { hex: "#EAB308", label: "Yellow" },
  { hex: "#22C55E", label: "Green" },
  { hex: "#14B8A6", label: "Teal" },
  { hex: "#06B6D4", label: "Cyan" },
  { hex: "#3B82F6", label: "Blue" },
];

const DEFAULT_COLOR = "#6366F1";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");

  return (
    <div className="space-y-5 pb-12">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-shell bg-hero px-6 py-7 text-white shadow-[0_20px_60px_-20px_rgba(49,46,129,0.5)] sm:px-10 sm:py-8">
        <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-white/5 blur-3xl" />
        <div className="relative">
          <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
          <p className="mt-0.5 text-sm text-white/60">Manage your profile, time preferences, and workspace appearance.</p>
        </div>
      </section>

      {/* Content */}
      <div className="flex flex-col gap-5 lg:flex-row">
        {/* Desktop Left Nav */}
        <nav className="hidden shrink-0 lg:block lg:w-52">
          <div className="sticky top-4 space-y-0.5 rounded-card border border-border/[0.07] bg-surface p-2 shadow-card dark:border-white/[0.06]">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  "flex w-full items-center rounded-[10px] px-3 py-2.5 text-[13px] font-medium transition-colors duration-150",
                  activeTab === tab.key
                    ? "bg-accent/10 text-accent"
                    : "text-text-secondary hover:bg-surface-2 hover:text-text",
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </nav>

        {/* Mobile/Tablet Top Segmented Control */}
        <div className="flex h-10 w-fit items-center gap-0.5 rounded-lg bg-surface-2/80 p-0.5 dark:bg-surface-2 lg:hidden">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "rounded-md px-4 py-1.5 text-sm font-medium transition-all duration-150",
                activeTab === tab.key
                  ? "bg-surface text-text shadow-sm dark:bg-surface-3"
                  : "text-text-tertiary hover:text-text",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Right Content */}
        <div className="min-w-0 flex-1">
          {activeTab === "profile" && <ProfileSection />}
          {activeTab === "time" && <TimeSection />}
          {activeTab === "appearance" && <AppearanceSection />}
        </div>
      </div>
    </div>
  );
}

/* ─── Profile Section ─── */
function ProfileSection() {
  const [name, setName] = useState("Irfan Alisha");
  const [savedName, setSavedName] = useState("Irfan Alisha");
  const isDirty = name !== savedName;

  function handleSave() {
    setSavedName(name);
  }

  return (
    <div className="rounded-card border border-border/[0.07] bg-surface p-6 shadow-card dark:border-white/[0.06]">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-base font-semibold text-text">Profile</h2>
        <Button
          size="sm"
          className="rounded-[10px] px-4 text-xs"
          disabled={!isDirty}
          onClick={handleSave}
        >
          Save changes
        </Button>
      </div>

      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-8">
        {/* Avatar */}
        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-accent/10 text-xl font-bold text-accent">
          IA
        </div>

        {/* Fields */}
        <div className="flex-1 space-y-5">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-text-secondary">Full name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-10 w-full rounded-[10px] border border-border/10 bg-surface-2/60 px-3 text-sm text-text placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent/20 dark:border-white/10"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-text-secondary">Email</label>
            <input
              type="email"
              value="irfan@zelog.io"
              readOnly
              className="h-10 w-full rounded-[10px] border border-border/10 bg-surface-2/30 px-3 text-sm text-text-secondary cursor-not-allowed dark:border-white/10"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-text-secondary">Role</label>
            <input
              type="text"
              value="Admin"
              readOnly
              className="h-10 w-full rounded-[10px] border border-border/10 bg-surface-2/30 px-3 text-sm text-text-secondary cursor-not-allowed dark:border-white/10"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Time Settings Section ─── */
function TimeSection() {
  const [timeFormat, setTimeFormat] = useState("24h");
  const [weekStart, setWeekStart] = useState("monday");
  const [timezone, setTimezone] = useState("Asia/Kolkata");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (saved) {
      const t = setTimeout(() => setSaved(false), 2000);
      return () => clearTimeout(t);
    }
  }, [saved]);

  function handleChange(setter: (v: string) => void) {
    return (v: string) => {
      setter(v);
      setSaved(true);
    };
  }

  return (
    <div className="rounded-card border border-border/[0.07] bg-surface p-6 shadow-card dark:border-white/[0.06]">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-base font-semibold text-text">Time settings</h2>
        {saved && (
          <span className="flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
            <Check className="h-3.5 w-3.5" /> Saved
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-text-secondary">Time format</label>
          <Select value={timeFormat} onValueChange={handleChange(setTimeFormat)}>
            <SelectTrigger className="h-10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="12h">12-hour (1:30 PM)</SelectItem>
              <SelectItem value="24h">24-hour (13:30)</SelectItem>
            </SelectContent>
          </Select>
          <p className="mt-1 text-[11px] text-text-tertiary">How times are displayed across the app.</p>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-text-secondary">Week starts on</label>
          <Select value={weekStart} onValueChange={handleChange(setWeekStart)}>
            <SelectTrigger className="h-10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="monday">Monday</SelectItem>
              <SelectItem value="tuesday">Tuesday</SelectItem>
              <SelectItem value="wednesday">Wednesday</SelectItem>
              <SelectItem value="thursday">Thursday</SelectItem>
              <SelectItem value="friday">Friday</SelectItem>
              <SelectItem value="saturday">Saturday</SelectItem>
              <SelectItem value="sunday">Sunday</SelectItem>
            </SelectContent>
          </Select>
          <p className="mt-1 text-[11px] text-text-tertiary">First day shown in weekly reports and calendars.</p>
        </div>
      </div>

      <div className="mt-5">
        <label className="mb-1.5 block text-xs font-medium text-text-secondary">Time zone</label>
        <Select value={timezone} onValueChange={handleChange(setTimezone)}>
          <SelectTrigger className="h-10">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TIME_ZONES.map((tz) => (
              <SelectItem key={tz.value} value={tz.value}>
                {tz.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="mt-1 text-[11px] text-text-tertiary">Used for scheduling and time entry calculations.</p>
      </div>
    </div>
  );
}

/* ─── Appearance Section ─── */
function AppearanceSection() {
  const { theme, setTheme } = useTheme();
  const [themeColor, setThemeColor] = useState(DEFAULT_COLOR);
  const [hexInput, setHexInput] = useState(DEFAULT_COLOR);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  function handleColorSelect(hex: string) {
    setThemeColor(hex);
    setHexInput(hex);
  }

  function handleHexChange(value: string) {
    setHexInput(value);
    if (/^#[0-9A-Fa-f]{6}$/.test(value)) {
      setThemeColor(value);
    }
  }

  function handleReset() {
    setThemeColor(DEFAULT_COLOR);
    setHexInput(DEFAULT_COLOR);
  }

  const themeOptions: { key: string; label: string; icon: React.ReactNode }[] = [
    { key: "light", label: "Light", icon: <Sun className="h-3.5 w-3.5" /> },
    { key: "dark", label: "Dark", icon: <Moon className="h-3.5 w-3.5" /> },
    { key: "system", label: "System", icon: <Monitor className="h-3.5 w-3.5" /> },
  ];

  return (
    <div className="space-y-5">
      {/* App Theme */}
      <div className="rounded-card border border-border/[0.07] bg-surface p-6 shadow-card dark:border-white/[0.06]">
        <h2 className="text-base font-semibold text-text mb-1">App theme</h2>
        <p className="text-xs text-text-tertiary mb-4">Choose how ZeLog looks on your device.</p>

        <div className="flex items-center gap-0.5 rounded-lg bg-surface-2/80 p-0.5 w-fit dark:bg-surface-2">
          {themeOptions.map((opt) => (
            <button
              key={opt.key}
              type="button"
              onClick={() => setTheme(opt.key)}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-4 py-2 text-sm font-medium transition-all duration-150",
                mounted && theme === opt.key
                  ? "bg-surface text-text shadow-sm dark:bg-surface-3"
                  : "text-text-tertiary hover:text-text",
              )}
            >
              {opt.icon}
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Theme Color */}
      <div className="rounded-card border border-border/[0.07] bg-surface p-6 shadow-card dark:border-white/[0.06]">
        <h2 className="text-base font-semibold text-text mb-1">Theme color</h2>
        <p className="text-xs text-text-tertiary mb-5">Pick a color and ZeLog will generate matching tints across the app.</p>

        {/* Current color preview + hex input */}
        <div className="flex items-center gap-4 mb-5">
          <div
            className="h-12 w-12 shrink-0 rounded-xl shadow-sm"
            style={{ backgroundColor: themeColor }}
          />
          <div className="flex-1">
            <label className="mb-1.5 block text-xs font-medium text-text-secondary">HEX code</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={hexInput}
                onChange={(e) => handleHexChange(e.target.value)}
                className="h-10 w-36 rounded-[10px] border border-border/10 bg-surface-2/60 px-3 text-sm font-mono text-text placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent/20 dark:border-white/10"
                placeholder="#6366F1"
              />
              {themeColor !== DEFAULT_COLOR && (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 rounded-[10px] text-xs"
                  onClick={handleReset}
                >
                  <RotateCcw className="h-3 w-3" /> Reset
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Preset Swatches */}
        <div>
          <label className="mb-2 block text-xs font-medium text-text-secondary">Presets</label>
          <div className="flex flex-wrap gap-2.5">
            {PRESET_COLORS.map((color) => {
              const isSelected = themeColor.toLowerCase() === color.hex.toLowerCase();
              return (
                <button
                  key={color.hex}
                  type="button"
                  onClick={() => handleColorSelect(color.hex)}
                  className={cn(
                    "relative h-9 w-9 rounded-full transition-all duration-150",
                    isSelected ? "ring-2 ring-offset-2 ring-offset-surface" : "hover:scale-110",
                  )}
                  style={{
                    backgroundColor: color.hex,
                    ...(isSelected ? { ringColor: color.hex } : {}),
                  }}
                  title={color.label}
                >
                  {isSelected && (
                    <Check className="absolute inset-0 m-auto h-4 w-4 text-white drop-shadow-sm" strokeWidth={3} />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

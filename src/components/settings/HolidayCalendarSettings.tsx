"use client";

import { useMemo, useRef, useState } from "react";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Checkbox from "@mui/material/Checkbox";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";
import {
  CalendarDays, Check, Copy, Download, FileDown, MapPin, MoreVertical, Pencil,
  Plus, Search, Star, Trash2, Upload, Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useHolidayStore } from "@/store/holidayStore";
import { COUNTRY_PRESETS, type Holiday, type HolidayCalendar } from "@/data/timeOffData";
import { MOCK_EMPLOYEES } from "@/data/orgData";

/* Office locations known to the org — the pool a calendar can be mapped to. */
const OFFICE_LOCATIONS = Array.from(
  new Set(MOCK_EMPLOYEES.map((e) => e.location).filter((l): l is string => Boolean(l))),
).sort();

const HUES = [
  { bg: "#DBEEEF", ink: "#0E7490" },
  { bg: "#DEEAF9", ink: "#2563EB" },
  { bg: "#FBF0D2", ink: "#B7791F" },
  { bg: "#F9DFDF", ink: "#DC2626" },
  { bg: "#E8E1F7", ink: "#7C3AED" },
];
const TAN = { bg: "#ECE6DB", ink: "#8A7B63" };
function hue(date: string, optional?: boolean) {
  if (optional) return TAN;
  return HUES[(parseInt(date.slice(5, 7), 10) || 1) % HUES.length];
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function employeesAt(locations: string[]): number {
  if (!locations.length) return 0;
  return MOCK_EMPLOYEES.filter((e) => e.location && locations.includes(e.location)).length;
}

/* ═══════════════════════════════════════════════════════════════ */

export function HolidayCalendarSettings() {
  const calendars = useHolidayStore((s) => s.calendars);
  const activeId = useHolidayStore((s) => s.activeId);
  const setActive = useHolidayStore((s) => s.setActive);

  const [creating, setCreating] = useState(false);
  const [renaming, setRenaming] = useState<HolidayCalendar | null>(null);
  const [managingLocations, setManagingLocations] = useState<HolidayCalendar | null>(null);

  const active = calendars.find((c) => c.id === activeId) ?? calendars[0];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-text-tertiary">
          Separate holiday lists per country / office. Employees see the calendar mapped to their work location.
        </p>
        <Button size="sm" className="shrink-0 gap-1.5" onClick={() => setCreating(true)}>
          <Plus className="h-4 w-4" /> New calendar
        </Button>
      </div>

      <div className="grid gap-5 lg:grid-cols-[260px_1fr]">
        <CalendarRail
          calendars={calendars}
          activeId={active?.id}
          onSelect={setActive}
          onRename={setRenaming}
          onManageLocations={setManagingLocations}
        />
        {active ? (
          <CalendarDetail
            key={active.id}
            calendar={active}
            onManageLocations={() => setManagingLocations(active)}
          />
        ) : null}
      </div>

      <NewCalendarDialog open={creating} onClose={() => setCreating(false)} />
      <RenameDialog calendar={renaming} onClose={() => setRenaming(null)} />
      <LocationsDialog calendar={managingLocations} onClose={() => setManagingLocations(null)} />
    </div>
  );
}

/* ─────────────── Calendar rail ─────────────── */

function CalendarRail({ calendars, activeId, onSelect, onRename, onManageLocations }: {
  calendars: HolidayCalendar[];
  activeId?: string;
  onSelect: (id: string) => void;
  onRename: (c: HolidayCalendar) => void;
  onManageLocations: (c: HolidayCalendar) => void;
}) {
  const setDefaultCalendar = useHolidayStore((s) => s.setDefaultCalendar);
  const duplicateCalendar = useHolidayStore((s) => s.duplicateCalendar);
  const removeCalendar = useHolidayStore((s) => s.removeCalendar);
  const [menuFor, setMenuFor] = useState<{ el: HTMLElement; cal: HolidayCalendar } | null>(null);

  return (
    <div className="space-y-2">
      {calendars.map((c) => {
        const active = c.id === activeId;
        return (
          <div
            key={c.id}
            className={cn(
              "group flex items-start gap-2.5 rounded-[14px] border p-3 transition-all",
              active
                ? "border-primary-300 bg-primary-soft/60 dark:border-primary-500/40 dark:bg-primary-500/10"
                : "border-border/[0.07] bg-surface hover:border-border/20 dark:border-white/[0.06]",
            )}
          >
            <button type="button" onClick={() => onSelect(c.id)} className="flex min-w-0 flex-1 items-start gap-2.5 text-left">
              <span className="text-xl leading-none">{c.flag}</span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="truncate text-sm font-semibold text-text">{c.name}</span>
                  {c.isDefault && (
                    <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-100 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-amber-700 dark:bg-amber-500/15 dark:text-amber-400">
                      <Star className="h-2.5 w-2.5 fill-current" /> Default
                    </span>
                  )}
                </div>
                <p className="mt-0.5 truncate text-[11px] text-text-tertiary">
                  {c.holidays.length} holidays · {c.locations.length} {c.locations.length === 1 ? "location" : "locations"}
                </p>
              </div>
            </button>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setMenuFor({ el: e.currentTarget, cal: c }); }}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-text-tertiary transition-colors hover:bg-surface-2 hover:text-text"
              aria-label={`${c.name} options`}
            >
              <MoreVertical className="h-4 w-4" />
            </button>
          </div>
        );
      })}

      <Menu
        anchorEl={menuFor?.el ?? null}
        open={Boolean(menuFor)}
        onClose={() => setMenuFor(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <MenuItem
          disabled={menuFor?.cal.isDefault}
          onClick={() => { if (menuFor) { setDefaultCalendar(menuFor.cal.id); toast.success(`“${menuFor.cal.name}” is now the default`); } setMenuFor(null); }}
        >
          <Star className="mr-2 h-4 w-4" /> Set as default
        </MenuItem>
        <MenuItem onClick={() => { if (menuFor) onManageLocations(menuFor.cal); setMenuFor(null); }}>
          <MapPin className="mr-2 h-4 w-4" /> Manage locations
        </MenuItem>
        <MenuItem onClick={() => { if (menuFor) onRename(menuFor.cal); setMenuFor(null); }}>
          <Pencil className="mr-2 h-4 w-4" /> Rename
        </MenuItem>
        <MenuItem onClick={() => { if (menuFor) { const id = duplicateCalendar(menuFor.cal.id); if (id) toast.success("Calendar duplicated"); } setMenuFor(null); }}>
          <Copy className="mr-2 h-4 w-4" /> Duplicate
        </MenuItem>
        <MenuItem
          disabled={calendars.length <= 1}
          onClick={() => { if (menuFor) { removeCalendar(menuFor.cal.id); toast.success(`Removed “${menuFor.cal.name}”`); } setMenuFor(null); }}
          sx={{ color: "#e11d48" }}
        >
          <Trash2 className="mr-2 h-4 w-4" /> Delete
        </MenuItem>
      </Menu>
    </div>
  );
}

/* ─────────────── Calendar detail ─────────────── */

function CalendarDetail({ calendar, onManageLocations }: { calendar: HolidayCalendar; onManageLocations: () => void }) {
  const addHoliday = useHolidayStore((s) => s.addHoliday);
  const removeHoliday = useHolidayStore((s) => s.removeHoliday);
  const importCsv = useHolidayStore((s) => s.importCsv);
  const fileRef = useRef<HTMLInputElement>(null);

  const [date, setDate] = useState("");
  const [name, setName] = useState("");
  const [optional, setOptional] = useState(false);
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "public" | "optional">("all");

  const years = useMemo(() => {
    const set = new Set(calendar.holidays.map((h) => h.date.slice(0, 4)));
    return Array.from(set).sort();
  }, [calendar.holidays]);
  const [year, setYear] = useState<string>(() => (years.includes("2026") ? "2026" : years[0] ?? "2026"));
  const activeYear = years.includes(year) ? year : (years[0] ?? "2026");

  const filtered = useMemo(() => {
    return calendar.holidays.filter((h) => {
      if (!h.date.startsWith(activeYear)) return false;
      if (typeFilter === "public" && h.optional) return false;
      if (typeFilter === "optional" && !h.optional) return false;
      if (query.trim() && !h.name.toLowerCase().includes(query.trim().toLowerCase())) return false;
      return true;
    });
  }, [calendar.holidays, activeYear, typeFilter, query]);

  const byMonth = useMemo(() => {
    const groups: Record<number, Holiday[]> = {};
    filtered.forEach((h) => {
      const m = parseInt(h.date.slice(5, 7), 10) - 1;
      (groups[m] ??= []).push(h);
    });
    return groups;
  }, [filtered]);

  const optionalCount = calendar.holidays.filter((h) => h.optional).length;
  const empCount = employeesAt(calendar.locations);

  function handleAdd() {
    if (!date || !name.trim()) { toast.error("Pick a date and enter a name"); return; }
    addHoliday(calendar.id, date, name.trim(), optional);
    toast.success(`Added “${name.trim()}”`);
    setDate(""); setName(""); setOptional(false);
  }

  function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const count = importCsv(calendar.id, String(reader.result ?? ""));
      if (count > 0) toast.success(`Imported ${count} ${count === 1 ? "holiday" : "holidays"} into ${calendar.name}`);
      else toast.error("No valid rows found. Use: 2026-01-26,Republic Day,optional");
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  function downloadTemplate() {
    const sample = "2026-01-01,New Year's Day\n2026-01-26,Republic Day\n2026-03-04,Holi,optional\n";
    const blob = new Blob([sample], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "holiday-template.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <section className="rounded-card border border-border/[0.07] bg-surface p-5 shadow-card dark:border-white/[0.06] sm:p-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-[13px] bg-surface-2 text-2xl">{calendar.flag}</span>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-[15px] font-semibold text-text">{calendar.name}</h3>
              {calendar.isDefault && (
                <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-100 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-amber-700 dark:bg-amber-500/15 dark:text-amber-400">
                  <Star className="h-2.5 w-2.5 fill-current" /> Default
                </span>
              )}
            </div>
            <p className="text-xs text-text-tertiary">{calendar.country}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" className="gap-1.5" onClick={downloadTemplate}>
            <FileDown className="h-4 w-4" /> Template
          </Button>
          <Button size="sm" variant="outline" className="gap-1.5" asChild>
            <label className="cursor-pointer">
              <Upload className="h-4 w-4" /> Import CSV
              <input ref={fileRef} type="file" accept=".csv,text/csv" className="hidden" onChange={handleImport} />
            </label>
          </Button>
        </div>
      </div>

      {/* Locations */}
      <div className="mt-4 flex flex-wrap items-center gap-2 rounded-[12px] bg-surface-2/50 px-3 py-2.5">
        <MapPin className="h-4 w-4 shrink-0 text-text-tertiary" />
        {calendar.locations.length ? (
          calendar.locations.map((l) => (
            <span key={l} className="rounded-full bg-surface px-2.5 py-0.5 text-xs font-medium text-text-secondary shadow-xs">{l}</span>
          ))
        ) : (
          <span className="text-xs text-text-tertiary">No locations mapped yet</span>
        )}
        <button type="button" onClick={onManageLocations} className="ml-auto inline-flex items-center gap-1 text-xs font-semibold text-primary-600 hover:text-primary-700">
          <Pencil className="h-3 w-3" /> Manage
        </button>
        {empCount > 0 && (
          <span className="inline-flex items-center gap-1 text-[11px] text-text-tertiary">
            <Users className="h-3 w-3" /> {empCount} {empCount === 1 ? "employee" : "employees"}
          </span>
        )}
      </div>

      {/* Add holiday */}
      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-end">
        <div className="sm:w-44">
          <label className="mb-1.5 block text-xs font-medium text-text-secondary">Date</label>
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div className="flex-1">
          <label className="mb-1.5 block text-xs font-medium text-text-secondary">Holiday name</label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Republic Day" onKeyDown={(e) => { if (e.key === "Enter") handleAdd(); }} />
        </div>
        <label className="flex h-10 cursor-pointer select-none items-center gap-1 rounded-[10px] border border-border/10 px-2.5 text-[13px] text-text-secondary dark:border-white/10">
          <Checkbox size="small" checked={optional} onChange={(e) => setOptional(e.target.checked)} sx={{ p: 0.5 }} /> Optional
        </label>
        <Button className="gap-1.5" onClick={handleAdd}><Plus className="h-4 w-4" /> Add</Button>
      </div>

      {/* Toolbar: year / search / type filter */}
      <div className="mt-5 flex flex-wrap items-center gap-2">
        {years.length > 1 && (
          <Select value={activeYear} onValueChange={setYear}>
            <SelectTrigger className="h-9 w-[110px]"><SelectValue /></SelectTrigger>
            <SelectContent>{years.map((y) => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent>
          </Select>
        )}
        <div className="relative flex-1 sm:max-w-[240px]">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search holidays" className="h-9 pl-8" />
        </div>
        <div className="inline-flex rounded-[10px] bg-surface-2 p-0.5 text-xs font-medium">
          {(["all", "public", "optional"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTypeFilter(t)}
              className={cn("rounded-[8px] px-3 py-1.5 capitalize transition-colors", typeFilter === t ? "bg-surface text-text shadow-xs" : "text-text-tertiary hover:text-text-secondary")}
            >
              {t}
            </button>
          ))}
        </div>
        <span className="ml-auto text-xs text-text-tertiary">
          <span className="font-semibold text-text-secondary">{calendar.holidays.length}</span> total · <span className="font-semibold text-text-secondary">{optionalCount}</span> optional
        </span>
      </div>

      {/* Holidays grouped by month */}
      <div className="mt-4">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
            <CalendarDays className="h-8 w-8 text-text-tertiary/50" />
            <p className="text-sm text-text-tertiary">{calendar.holidays.length === 0 ? "No holidays yet — add one above or import a CSV." : "No holidays match your filters."}</p>
          </div>
        ) : (
          <div className="space-y-5">
            {Object.keys(byMonth).map((k) => {
              const m = Number(k);
              return (
                <div key={m}>
                  <div className="mb-2 flex items-center gap-3">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-text-tertiary">{MONTHS[m]}</span>
                    <span className="h-px flex-1 bg-border/[0.08] dark:bg-white/[0.06]" />
                  </div>
                  <div className="space-y-1.5">
                    {byMonth[m].map((h) => {
                      const c = hue(h.date, h.optional);
                      const d = parseISO(h.date);
                      return (
                        <div key={h.date} className="group flex items-center gap-3 rounded-[11px] px-2 py-1.5 transition-colors hover:bg-surface-2/60">
                          <span className="flex h-9 w-9 shrink-0 flex-col items-center justify-center rounded-[9px] text-center" style={{ backgroundColor: c.bg, color: c.ink }}>
                            <span className="text-[13px] font-bold leading-none tabular-nums">{format(d, "dd")}</span>
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                              <span className="text-sm font-medium text-text">{h.name}</span>
                              {h.optional && (
                                <span className="rounded-[5px] px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide" style={{ backgroundColor: TAN.bg, color: TAN.ink }}>Optional</span>
                              )}
                            </div>
                            <p className="text-[11px] text-text-tertiary">{format(d, "EEEE, d MMM yyyy")}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => { removeHoliday(calendar.id, h.date); toast.success(`Removed “${h.name}”`); }}
                            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-text-tertiary opacity-0 transition-all hover:bg-danger/10 hover:text-danger group-hover:opacity-100"
                            aria-label={`Remove ${h.name}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

/* ─────────────── New calendar dialog ─────────────── */

function NewCalendarDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const addCalendar = useHolidayStore((s) => s.addCalendar);
  const calendars = useHolidayStore((s) => s.calendars);

  const [presetCode, setPresetCode] = useState(COUNTRY_PRESETS[0].code);
  const [name, setName] = useState(COUNTRY_PRESETS[0].name);
  const [flag, setFlag] = useState(COUNTRY_PRESETS[0].flag);
  const [locations, setLocations] = useState<string[]>([]);

  const preset = COUNTRY_PRESETS.find((p) => p.code === presetCode) ?? COUNTRY_PRESETS[0];

  // Which calendar currently owns each location (for the "moving from" hint).
  const ownerOf = useMemo(() => {
    const map: Record<string, string> = {};
    calendars.forEach((c) => c.locations.forEach((l) => { map[l] = c.name; }));
    return map;
  }, [calendars]);

  function choosePreset(code: string) {
    const p = COUNTRY_PRESETS.find((x) => x.code === code) ?? COUNTRY_PRESETS[0];
    setPresetCode(code);
    setName(p.name);
    setFlag(p.flag);
  }

  function toggleLocation(l: string) {
    setLocations((prev) => (prev.includes(l) ? prev.filter((x) => x !== l) : [...prev, l]));
  }

  function handleCreate() {
    if (!name.trim()) { toast.error("Name the calendar"); return; }
    addCalendar({ name: name.trim(), country: preset.name === "Blank calendar" ? name.trim() : preset.name, flag, locations, holidays: preset.holidays.map((h) => ({ ...h })) });
    toast.success(`Created “${name.trim()}”${preset.holidays.length ? ` with ${preset.holidays.length} holidays` : ""}`);
    reset();
    onClose();
  }

  function reset() {
    setPresetCode(COUNTRY_PRESETS[0].code);
    setName(COUNTRY_PRESETS[0].name);
    setFlag(COUNTRY_PRESETS[0].flag);
    setLocations([]);
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) { reset(); onClose(); } }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>New holiday calendar</DialogTitle>
          <DialogDescription>Start from a country preset, then map the offices that follow it.</DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-text-secondary">Start from</label>
            <Select value={presetCode} onValueChange={choosePreset}>
              <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
              <SelectContent>
                {COUNTRY_PRESETS.map((p) => (
                  <SelectItem key={p.code} value={p.code}>
                    {p.flag} {p.name}{p.holidays.length ? ` · ${p.holidays.length} holidays` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-3">
            <div className="w-20">
              <label className="mb-1.5 block text-xs font-medium text-text-secondary">Flag</label>
              <Input value={flag} onChange={(e) => setFlag(e.target.value)} className="text-center text-lg" maxLength={4} />
            </div>
            <div className="flex-1">
              <label className="mb-1.5 block text-xs font-medium text-text-secondary">Calendar name</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. India" />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-xs font-medium text-text-secondary">Map office locations</label>
            <div className="grid max-h-44 grid-cols-2 gap-1 overflow-auto rounded-[12px] border border-border/[0.08] p-2 dark:border-white/[0.06]">
              {OFFICE_LOCATIONS.map((l) => {
                const checked = locations.includes(l);
                const owner = ownerOf[l];
                return (
                  <label key={l} className="flex cursor-pointer items-center gap-1.5 rounded-[8px] px-2 py-1 hover:bg-surface-2">
                    <Checkbox size="small" checked={checked} onChange={() => toggleLocation(l)} sx={{ p: 0.5 }} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13px] text-text">{l}</span>
                      {owner && !checked && <span className="block truncate text-[10px] text-text-tertiary">now: {owner}</span>}
                    </span>
                  </label>
                );
              })}
            </div>
            <p className="mt-1.5 text-[11px] text-text-tertiary">A location follows one calendar — selecting it here moves it here.</p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => { reset(); onClose(); }}>Cancel</Button>
          <Button onClick={handleCreate}>Create calendar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ─────────────── Rename dialog ─────────────── */

function RenameDialog({ calendar, onClose }: { calendar: HolidayCalendar | null; onClose: () => void }) {
  const updateCalendar = useHolidayStore((s) => s.updateCalendar);
  const [name, setName] = useState("");
  const [flag, setFlag] = useState("");
  const [country, setCountry] = useState("");

  // Sync fields when a calendar is opened.
  const openId = calendar?.id;
  useMemo(() => {
    if (calendar) { setName(calendar.name); setFlag(calendar.flag); setCountry(calendar.country); }
  }, [openId]); // eslint-disable-line react-hooks/exhaustive-deps

  function handleSave() {
    if (!calendar) return;
    if (!name.trim()) { toast.error("Name can't be empty"); return; }
    updateCalendar(calendar.id, { name: name.trim(), flag: flag || "🗓️", country: country.trim() || name.trim() });
    toast.success("Calendar updated");
    onClose();
  }

  return (
    <Dialog open={Boolean(calendar)} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rename calendar</DialogTitle>
        </DialogHeader>
        <div className="mt-4 flex gap-3">
          <div className="w-20">
            <label className="mb-1.5 block text-xs font-medium text-text-secondary">Flag</label>
            <Input value={flag} onChange={(e) => setFlag(e.target.value)} className="text-center text-lg" maxLength={4} />
          </div>
          <div className="flex-1">
            <label className="mb-1.5 block text-xs font-medium text-text-secondary">Name</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} autoFocus />
          </div>
        </div>
        <div className="mt-3">
          <label className="mb-1.5 block text-xs font-medium text-text-secondary">Country / region</label>
          <Input value={country} onChange={(e) => setCountry(e.target.value)} />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ─────────────── Manage locations dialog ─────────────── */

function LocationsDialog({ calendar, onClose }: { calendar: HolidayCalendar | null; onClose: () => void }) {
  const assignLocations = useHolidayStore((s) => s.assignLocations);
  const calendars = useHolidayStore((s) => s.calendars);
  const [selected, setSelected] = useState<string[]>([]);

  const openId = calendar?.id;
  useMemo(() => { if (calendar) setSelected(calendar.locations); }, [openId]); // eslint-disable-line react-hooks/exhaustive-deps

  const ownerOf = useMemo(() => {
    const map: Record<string, string> = {};
    calendars.forEach((c) => c.locations.forEach((l) => { map[l] = c.name; }));
    return map;
  }, [calendars]);

  function toggle(l: string) {
    setSelected((prev) => (prev.includes(l) ? prev.filter((x) => x !== l) : [...prev, l]));
  }

  function handleSave() {
    if (!calendar) return;
    assignLocations(calendar.id, selected);
    toast.success(`Updated locations for “${calendar.name}”`);
    onClose();
  }

  return (
    <Dialog open={Boolean(calendar)} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Map locations to {calendar?.name}</DialogTitle>
          <DialogDescription>Employees at these offices will follow this holiday calendar.</DialogDescription>
        </DialogHeader>
        <div className="mt-4 grid max-h-64 grid-cols-2 gap-1 overflow-auto rounded-[12px] border border-border/[0.08] p-2 dark:border-white/[0.06]">
          {OFFICE_LOCATIONS.map((l) => {
            const checked = selected.includes(l);
            const owner = ownerOf[l];
            const movingFrom = owner && owner !== calendar?.name && checked;
            return (
              <label key={l} className="flex cursor-pointer items-center gap-1.5 rounded-[8px] px-2 py-1 hover:bg-surface-2">
                <Checkbox size="small" checked={checked} onChange={() => toggle(l)} sx={{ p: 0.5 }} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] text-text">{l}</span>
                  {owner && owner !== calendar?.name && (
                    <span className="block truncate text-[10px] text-text-tertiary">{movingFrom ? `moving from ${owner}` : `now: ${owner}`}</span>
                  )}
                </span>
              </label>
            );
          })}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Save locations</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

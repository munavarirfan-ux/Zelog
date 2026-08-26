"use client";

import { useMemo, useRef, useState } from "react";
import { Building2, Globe2, MapPin, Network, Palette, Plus, Scale, Trash2, Upload, Users, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useOrgStore, useHydratedOrg } from "@/store/orgStore";
import {
  useEnterpriseStore, useHydratedEnterprise,
  INDUSTRIES, COMPANY_SIZES, TIMEZONES, CURRENCIES, DATE_FORMATS, MONTHS, WEEKDAYS, BRAND_COLORS,
} from "@/store/enterpriseStore";
import { Panel, Field, ManagedChips } from "./settingsKit";
import { DepartmentManager } from "./DepartmentManager";
import { cn } from "@/lib/utils";

export function EnterpriseSettings() {
  const ready = useHydratedEnterprise();
  const profile = useEnterpriseStore((s) => s.profile);
  const regional = useEnterpriseStore((s) => s.regional);
  const accent = useEnterpriseStore((s) => s.accent);
  const logo = useEnterpriseStore((s) => s.logo);
  const setLogo = useEnterpriseStore((s) => s.setLogo);
  const legalEntities = useEnterpriseStore((s) => s.legalEntities);
  const businessUnits = useEnterpriseStore((s) => s.businessUnits);
  const updateProfile = useEnterpriseStore((s) => s.updateProfile);
  const updateRegional = useEnterpriseStore((s) => s.updateRegional);
  const toggleWorkweekDay = useEnterpriseStore((s) => s.toggleWorkweekDay);
  const setAccent = useEnterpriseStore((s) => s.setAccent);
  const addLegalEntity = useEnterpriseStore((s) => s.addLegalEntity);
  const removeLegalEntity = useEnterpriseStore((s) => s.removeLegalEntity);
  const addBusinessUnit = useEnterpriseStore((s) => s.addBusinessUnit);
  const removeBusinessUnit = useEnterpriseStore((s) => s.removeBusinessUnit);

  const logoInputRef = useRef<HTMLInputElement>(null);

  function onLogoPicked(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file (PNG or SVG).");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Logo must be under 2 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setLogo(String(reader.result));
      toast.success("Logo updated");
    };
    reader.readAsDataURL(file);
    if (logoInputRef.current) logoInputRef.current.value = "";
  }

  if (!ready) {
    return (
      <div className="space-y-5">
        <div className="h-64 animate-pulse rounded-card border border-border/[0.07] bg-surface shadow-card dark:border-white/[0.06]" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <Panel title="Company profile" sub="The identity used on documents, emails and the workspace header." icon={Building2} color="#7A4DFF">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Legal name">
            <Input value={profile.legalName} onChange={(e) => updateProfile({ legalName: e.target.value })} />
          </Field>
          <Field label="Display name" hint="Shown in the app header and to employees.">
            <Input value={profile.displayName} onChange={(e) => updateProfile({ displayName: e.target.value })} />
          </Field>
          <Field label="Industry">
            <Select value={profile.industry} onValueChange={(v) => updateProfile({ industry: v })}>
              <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
              <SelectContent>
                {INDUSTRIES.map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Company size">
            <Select value={profile.size} onValueChange={(v) => updateProfile({ size: v })}>
              <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
              <SelectContent>
                {COMPANY_SIZES.map((v) => <SelectItem key={v} value={v}>{v} employees</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Website">
            <Input value={profile.website} onChange={(e) => updateProfile({ website: e.target.value })} />
          </Field>
          <Field label="Founded">
            <Input value={profile.founded} onChange={(e) => updateProfile({ founded: e.target.value })} />
          </Field>
          <Field label="Primary email">
            <Input value={profile.email} onChange={(e) => updateProfile({ email: e.target.value })} />
          </Field>
          <Field label="Phone">
            <Input value={profile.phone} onChange={(e) => updateProfile({ phone: e.target.value })} />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Tax / registration ID">
              <Input value={profile.taxId} onChange={(e) => updateProfile({ taxId: e.target.value })} />
            </Field>
          </div>
        </div>
      </Panel>

      <div className="grid gap-5 lg:grid-cols-2">
        <Panel title="Regional & fiscal" sub="Defaults for dates, currency and the working week." icon={Globe2} color="#38BDF8">
          <div className="space-y-4">
            <Field label="Time zone">
              <Select value={regional.timezone} onValueChange={(v) => updateRegional({ timezone: v })}>
                <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                <SelectContent>{TIMEZONES.map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Currency">
                <Select value={regional.currency} onValueChange={(v) => updateRegional({ currency: v })}>
                  <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                  <SelectContent>{CURRENCIES.map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent>
                </Select>
              </Field>
              <Field label="Date format">
                <Select value={regional.dateFormat} onValueChange={(v) => updateRegional({ dateFormat: v })}>
                  <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                  <SelectContent>{DATE_FORMATS.map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent>
                </Select>
              </Field>
            </div>
            <Field label="Fiscal year starts">
              <Select value={regional.fiscalYearStart} onValueChange={(v) => updateRegional({ fiscalYearStart: v })}>
                <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                <SelectContent>{MONTHS.map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="Working week" hint="Days marked on are counted as working days across attendance and time off.">
              <div className="flex flex-wrap gap-1.5">
                {WEEKDAYS.map((day) => {
                  const on = regional.workweek.includes(day);
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleWorkweekDay(day)}
                      aria-pressed={on}
                      className={cn(
                        "h-9 w-11 rounded-[10px] text-xs font-medium transition-all duration-150",
                        on
                          ? "bg-primary-soft text-primary-700 ring-1 ring-primary-400/40 dark:bg-primary-100/10 dark:text-primary-300"
                          : "bg-surface-2 text-text-tertiary hover:text-text-secondary",
                      )}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </Field>
          </div>
        </Panel>

        <Panel title="Brand" sub="The logo and accent used across the workspace." icon={Palette} color="#F472B6">
          {/* Company logo */}
          <div className="mb-5 flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-[14px] bg-primary-soft text-lg font-semibold text-primary-700">
              {logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logo} alt="Company logo" className="h-full w-full object-contain" />
              ) : (
                profile.displayName.slice(0, 2).toUpperCase()
              )}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-text">Company logo</p>
              <p className="mb-2 text-xs text-text-tertiary">PNG or SVG, up to 2&nbsp;MB.</p>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="gap-1.5 rounded-[10px]" onClick={() => logoInputRef.current?.click()}>
                  <Upload className="h-3.5 w-3.5" /> {logo ? "Replace" : "Upload"}
                </Button>
                {logo && (
                  <Button variant="ghost" size="sm" className="gap-1.5 rounded-[10px] text-danger" onClick={() => { setLogo(""); toast.success("Logo removed"); }}>
                    <Trash2 className="h-3.5 w-3.5" /> Remove
                  </Button>
                )}
              </div>
              <input
                ref={logoInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => onLogoPicked(e.target.files)}
              />
            </div>
          </div>

          <p className="mb-2 text-xs font-medium text-text-secondary">Accent color</p>
          <div className="flex flex-wrap gap-2.5">
            {BRAND_COLORS.map((hex) => (
              <button
                key={hex}
                type="button"
                onClick={() => setAccent(hex)}
                className={cn(
                  "h-9 w-9 rounded-full transition-all duration-150",
                  accent.toLowerCase() === hex.toLowerCase() ? "ring-2 ring-offset-2 ring-offset-surface" : "hover:scale-110",
                )}
                style={{ backgroundColor: hex, ...(accent.toLowerCase() === hex.toLowerCase() ? { ["--tw-ring-color" as string]: hex } : {}) }}
                aria-label={`Brand color ${hex}`}
              />
            ))}
          </div>
          <div className="mt-5 flex items-center gap-3 rounded-[12px] bg-surface-2/50 p-4">
            <span className="flex h-10 w-10 items-center justify-center rounded-[11px] text-white" style={{ backgroundColor: accent }}>
              <Building2 className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-text">{profile.displayName}</p>
              <p className="text-[11px] text-text-tertiary">Preview of the accent on brand surfaces.</p>
            </div>
          </div>
        </Panel>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Panel title="Legal entities" sub="The registered companies employees can be hired under." icon={Scale} color="#8B5CF6">
          <ManagedChips items={legalEntities} onAdd={addLegalEntity} onRemove={removeLegalEntity} placeholder="e.g. Zessta LLC (UAE)" />
        </Panel>
        <Panel title="Business units" sub="Top-level groupings above departments." icon={Network} color="#22D3EE">
          <ManagedChips items={businessUnits} onAdd={addBusinessUnit} onRemove={removeBusinessUnit} placeholder="e.g. Platform" />
        </Panel>
      </div>

      <DepartmentsAndLocations />
    </div>
  );
}

/* ── departments (with sub-departments) + editable office locations ── */
function DepartmentsAndLocations() {
  const hydrated = useHydratedOrg();
  const departments = useOrgStore((s) => s.departments);
  const employees = useOrgStore((s) => s.employees);
  const addSubDepartment = useOrgStore((s) => s.addSubDepartment);
  const removeSubDepartment = useOrgStore((s) => s.removeSubDepartment);

  const officeLocations = useEnterpriseStore((s) => s.officeLocations);
  const addOfficeLocation = useEnterpriseStore((s) => s.addOfficeLocation);
  const removeOfficeLocation = useEnterpriseStore((s) => s.removeOfficeLocation);
  const [newLoc, setNewLoc] = useState("");

  const deptCounts = useMemo(() => {
    const map = new Map<string, number>();
    employees.forEach((e) => {
      if (e.status !== "active") return;
      map.set(e.department, (map.get(e.department) ?? 0) + 1);
    });
    return map;
  }, [employees]);

  const locCounts = useMemo(() => {
    const map = new Map<string, number>();
    employees.forEach((e) => {
      if (e.status !== "active" || !e.location) return;
      map.set(e.location, (map.get(e.location) ?? 0) + 1);
    });
    return map;
  }, [employees]);

  if (!hydrated) {
    return <div className="h-40 animate-pulse rounded-card border border-border/[0.07] bg-surface shadow-card dark:border-white/[0.06]" />;
  }

  function commitLoc() {
    const t = newLoc.trim();
    if (!t) return;
    addOfficeLocation(t);
    setNewLoc("");
  }

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <Panel title="Departments" sub={`${departments.length} departments — each with its own sub-departments`} icon={Users} color="#34D399">
        <DepartmentManager />
        <div className="mt-4 space-y-3">
          {departments.map((d) => (
            <div key={d.name} className="rounded-[12px] border border-border/[0.07] bg-surface-2/40 p-3 dark:border-white/[0.05]">
              <div className="flex items-center gap-3">
                <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: d.color }} />
                <p className="flex-1 truncate text-sm font-semibold text-text">{d.name}</p>
                <span className="inline-flex items-center gap-1 rounded-full bg-surface px-2 py-0.5 text-[11px] font-medium text-text-secondary shadow-card">
                  <Users className="h-3 w-3" /> {deptCounts.get(d.name) ?? 0}
                </span>
              </div>
              <SubDepartmentEditor
                dept={d.name}
                subs={d.subDepartments}
                onAdd={(v) => addSubDepartment(d.name, v)}
                onRemove={(v) => removeSubDepartment(d.name, v)}
              />
            </div>
          ))}
        </div>
      </Panel>

      <Panel title="Office locations" sub="Where the company operates — edit freely." icon={MapPin} color="#FB7185">
        <div className="divide-y divide-border/[0.06]">
          {officeLocations.length === 0 && <p className="py-6 text-center text-sm text-text-tertiary">No locations yet.</p>}
          {officeLocations.map((loc) => (
            <div key={loc} className="flex items-center gap-3 py-2.5 first:pt-0">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px] bg-surface-2 text-text-tertiary">
                <MapPin className="h-4 w-4" />
              </span>
              <p className="flex-1 truncate text-sm font-medium text-text">{loc}</p>
              <span className="inline-flex items-center gap-1 rounded-full bg-surface-2 px-2 py-0.5 text-[11px] font-medium text-text-secondary">
                <Users className="h-3 w-3" /> {locCounts.get(loc) ?? 0}
              </span>
              <button
                type="button"
                onClick={() => removeOfficeLocation(loc)}
                className="flex h-6 w-6 items-center justify-center rounded-full text-text-tertiary transition-colors hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-500/20"
                aria-label={`Remove ${loc}`}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center gap-2">
          <Input
            value={newLoc}
            onChange={(e) => setNewLoc(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); commitLoc(); } }}
            placeholder="e.g. Pune, India"
          />
          <Button size="sm" variant="outline" className="shrink-0 gap-1 rounded-[10px]" onClick={commitLoc}>
            <Plus className="h-3.5 w-3.5" /> Add
          </Button>
        </div>
        <p className="mt-2 text-[11px] text-text-tertiary">The number shows how many active employees currently work at each location.</p>
      </Panel>
    </div>
  );
}

/** Inline chip editor for a department's sub-departments (keeps at least one). */
function SubDepartmentEditor({ dept, subs, onAdd, onRemove }: {
  dept: string;
  subs: string[];
  onAdd: (value: string) => void;
  onRemove: (value: string) => void;
}) {
  const [value, setValue] = useState("");
  function commit() {
    const t = value.trim();
    if (!t) return;
    onAdd(t);
    setValue("");
  }
  return (
    <div className="mt-2.5 pl-6">
      <div className="flex flex-wrap items-center gap-1.5">
        {subs.map((s) => (
          <span key={s} className="inline-flex items-center gap-1 rounded-full bg-surface py-0.5 pl-2.5 pr-1 text-[11px] font-medium text-text-secondary shadow-card">
            {s}
            {subs.length > 1 && (
              <button
                type="button"
                onClick={() => onRemove(s)}
                className="flex h-3.5 w-3.5 items-center justify-center rounded-full text-text-tertiary transition-colors hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-500/20"
                aria-label={`Remove ${s} from ${dept}`}
              >
                <X className="h-2.5 w-2.5" />
              </button>
            )}
          </span>
        ))}
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); commit(); } }}
          placeholder="+ sub-department"
          className="h-6 w-32 rounded-full border border-dashed border-border/[0.16] bg-transparent px-2.5 text-[11px] text-text placeholder:text-text-tertiary focus:border-primary-300 focus:outline-none"
        />
      </div>
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";
import { Building2, Globe2, Upload } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Panel, Field } from "./settingsKit";

const INITIAL = {
  companyName: "Zessta Software Solutions",
  companyEmail: "hello@zessta.com",
  website: "https://zessta.com",
  timezone: "Asia/Kolkata",
  currency: "INR",
  dateFormat: "DD/MM/YYYY",
  timeFormat: "24h",
  language: "en",
  weekStart: "monday",
  fyStart: "april",
  country: "IN",
};

type Form = typeof INITIAL;

const TIMEZONES = [
  { value: "Asia/Kolkata", label: "Asia/Kolkata (IST, UTC+5:30)" },
  { value: "America/New_York", label: "America/New_York (EST, UTC-5)" },
  { value: "Europe/London", label: "Europe/London (GMT, UTC+0)" },
  { value: "Europe/Berlin", label: "Europe/Berlin (CET, UTC+1)" },
  { value: "Asia/Dubai", label: "Asia/Dubai (GST, UTC+4)" },
];

export function GeneralSettings() {
  const [form, setForm] = useState<Form>(INITIAL);
  const dirty = useMemo(() => JSON.stringify(form) !== JSON.stringify(INITIAL), [form]);

  const set = <K extends keyof Form>(key: K) => (value: Form[K]) => setForm((f) => ({ ...f, [key]: value }));

  function save() {
    // Prototype: no backend — just acknowledge.
    toast.success("Changes saved");
    Object.assign(INITIAL, form); // reset the baseline so the bar hides
    setForm({ ...form });
  }
  function discard() {
    setForm({ ...INITIAL });
  }

  return (
    <div className="space-y-5 pb-24">
      {/* Company Information */}
      <Panel title="Company Information" sub="Details shown on documents, invites and reports." icon={Building2}>
        {/* Logo */}
        <div className="mb-6 flex items-center gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[14px] bg-primary-soft text-lg font-semibold text-primary-700">
            {form.companyName.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-medium text-text">Company logo</p>
            <p className="mb-2 text-xs text-text-tertiary">PNG or SVG, up to 2&nbsp;MB.</p>
            <Button variant="outline" size="sm" className="gap-1.5 rounded-[10px]">
              <Upload className="h-3.5 w-3.5" /> Upload
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
          <Field label="Company name">
            <Input value={form.companyName} onChange={(e) => set("companyName")(e.target.value)} />
          </Field>
          <Field label="Company email">
            <Input type="email" value={form.companyEmail} onChange={(e) => set("companyEmail")(e.target.value)} />
          </Field>
          <Field label="Website">
            <Input value={form.website} onChange={(e) => set("website")(e.target.value)} />
          </Field>
          <Field label="Timezone">
            <Select value={form.timezone} onValueChange={set("timezone")}>
              <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
              <SelectContent>
                {TIMEZONES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Default currency">
            <Select value={form.currency} onValueChange={set("currency")}>
              <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="INR">INR — Indian Rupee (₹)</SelectItem>
                <SelectItem value="USD">USD — US Dollar ($)</SelectItem>
                <SelectItem value="EUR">EUR — Euro (€)</SelectItem>
                <SelectItem value="GBP">GBP — Pound (£)</SelectItem>
                <SelectItem value="AED">AED — Dirham (د.إ)</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Date format">
            <Select value={form.dateFormat} onValueChange={set("dateFormat")}>
              <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Time format">
            <Select value={form.timeFormat} onValueChange={set("timeFormat")}>
              <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="12h">12-hour</SelectItem>
                <SelectItem value="24h">24-hour</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </div>
      </Panel>

      {/* Workspace Preferences */}
      <Panel title="Workspace Preferences" sub="Defaults applied across the workspace." icon={Globe2}>
        <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
          <Field label="Default language">
            <Select value={form.language} onValueChange={set("language")}>
              <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="hi">Hindi</SelectItem>
                <SelectItem value="de">German</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Week starts on">
            <Select value={form.weekStart} onValueChange={set("weekStart")}>
              <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="monday">Monday</SelectItem>
                <SelectItem value="sunday">Sunday</SelectItem>
                <SelectItem value="saturday">Saturday</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Financial year start">
            <Select value={form.fyStart} onValueChange={set("fyStart")}>
              <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="april">April</SelectItem>
                <SelectItem value="january">January</SelectItem>
                <SelectItem value="july">July</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Default country">
            <Select value={form.country} onValueChange={set("country")}>
              <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="IN">India</SelectItem>
                <SelectItem value="US">United States</SelectItem>
                <SelectItem value="DE">Germany</SelectItem>
                <SelectItem value="GB">United Kingdom</SelectItem>
                <SelectItem value="AE">United Arab Emirates</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </div>
      </Panel>

      {/* Sticky save bar — appears only when there are unsaved changes */}
      {dirty && (
        <div className="sticky bottom-4 z-10 mx-auto flex max-w-2xl items-center justify-between gap-4 rounded-[14px] border border-border/[0.09] bg-surface/95 px-4 py-3 shadow-float backdrop-blur dark:border-white/[0.08]">
          <span className="flex items-center gap-2 text-sm font-medium text-text">
            <span className="h-2 w-2 rounded-full bg-amber-400" aria-hidden />
            Unsaved changes
          </span>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="rounded-[10px]" onClick={discard}>Discard</Button>
            <Button size="sm" className="rounded-[10px]" onClick={save}>Save changes</Button>
          </div>
        </div>
      )}
    </div>
  );
}

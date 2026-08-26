"use client";

import { useState } from "react";
import Switch from "@mui/material/Switch";
import {
  CalendarDays, CalendarRange, Layers, Pencil, Plus, ShieldCheck, Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { SubNav, type SubNavItem } from "@/components/attendance/shared";
import {
  useTimeOffSettingsStore, useHydratedTimeOffSettings,
  WEEKDAY_LABELS, WEEKDAY_DOTS, MONTH_LABELS,
  type SettingsLeaveType,
} from "@/store/timeOffSettingsStore";
import { useHydratedHolidays } from "@/store/holidayStore";
import { HolidayCalendarSettings } from "@/components/settings/HolidayCalendarSettings";

const MUI_SWITCH_SX = {
  "& .Mui-checked": { color: "#7A4DFF" },
  "& .Mui-checked + .MuiSwitch-track": { backgroundColor: "#7A4DFF !important" },
};

const TABS: SubNavItem[] = [
  { id: "types", label: "Time Off Types", icon: Layers },
  { id: "workweek", label: "Workweek", icon: CalendarRange },
  { id: "holidays", label: "Holiday Calendar", icon: CalendarDays },
  { id: "policy", label: "Policy Period", icon: ShieldCheck },
];

const TYPE_COLORS = [
  "#8B7CF6", "#F9A8D4", "#FDBA74", "#6EE7B7", "#C4B5FD", "#93C5FD",
  "#7DD3FC", "#A7F3D0", "#FCD34D", "#FDA4AF", "#5EEAD4", "#C7D2FE",
];

/* ── Reusable white panel ── */
function Panel({ title, sub, action, children }: {
  title: string; sub?: string; action?: React.ReactNode; children: React.ReactNode;
}) {
  return (
    <section className="rounded-card border border-border/[0.07] bg-surface p-6 shadow-card dark:border-white/[0.06]">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-[15px] font-semibold text-text">{title}</h3>
          {sub ? <p className="mt-0.5 text-xs text-text-tertiary">{sub}</p> : null}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function PrototypeNote({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-5 flex items-start gap-2 rounded-[12px] bg-surface-2/50 px-3 py-2.5">
      <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-text-tertiary" />
      <p className="text-xs text-text-secondary">{children}</p>
    </div>
  );
}

export function TimeOffSettings() {
  const hydratedSettings = useHydratedTimeOffSettings();
  const hydratedHolidays = useHydratedHolidays();
  const [tab, setTab] = useState("types");

  const ready = hydratedSettings && hydratedHolidays;

  return (
    <div className="space-y-5">
      <SubNav items={TABS} value={tab} onChange={setTab} showIcons />

      {!ready ? (
        <div className="h-40 rounded-card border border-border/[0.07] bg-surface shadow-card dark:border-white/[0.06]" />
      ) : (
        <>
          {tab === "types" && <LeaveTypesTab />}
          {tab === "workweek" && <WorkweekTab />}
          {tab === "holidays" && <HolidaysTab />}
          {tab === "policy" && <PolicyTab />}
        </>
      )}
    </div>
  );
}

/* ─────────────── Leave (Time Off) Types ─────────────── */

function LeaveTypesTab() {
  const leaveTypes = useTimeOffSettingsStore((s) => s.leaveTypes);
  const removeLeaveType = useTimeOffSettingsStore((s) => s.removeLeaveType);
  const [editing, setEditing] = useState<SettingsLeaveType | null>(null);
  const [creating, setCreating] = useState(false);

  return (
    <Panel
      title="Time Off Types"
      sub="The kinds of leave employees can request. Balance-tracked types count against an annual allocation."
      action={
        <Button size="sm" className="gap-1.5" onClick={() => setCreating(true)}>
          <Plus className="h-4 w-4" /> Create New
        </Button>
      }
    >
      <div className="divide-y divide-border/[0.06]">
        {leaveTypes.map((t) => (
          <div key={t.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
            <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: t.color }} />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="truncate text-sm font-medium text-text">{t.name}</p>
                {t.tracksBalance ? (
                  <span className="rounded-full bg-surface-2 px-2 py-0.5 text-[11px] font-medium text-text-secondary">
                    {t.allocation} {t.allocation === 1 ? "day" : "days"} / year
                  </span>
                ) : (
                  <span className="rounded-full bg-surface-2 px-2 py-0.5 text-[11px] font-medium text-text-tertiary">
                    Unlimited
                  </span>
                )}
                {t.noteMandatory ? (
                  <span className="rounded-full bg-primary-soft px-2 py-0.5 text-[11px] font-medium text-primary-700 dark:bg-primary-100 dark:text-primary-300">
                    Note required
                  </span>
                ) : null}
              </div>
              {t.description ? <p className="mt-0.5 truncate text-xs text-text-tertiary">{t.description}</p> : null}
            </div>
            <button
              type="button"
              onClick={() => setEditing(t)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-[9px] text-text-tertiary transition-colors hover:bg-surface-2 hover:text-text"
              aria-label={`Edit ${t.name}`}
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => {
                removeLeaveType(t.id);
                toast.success(`Removed “${t.name}”`);
              }}
              className="inline-flex h-8 w-8 items-center justify-center rounded-[9px] text-text-tertiary transition-colors hover:bg-danger/10 hover:text-danger"
              aria-label={`Delete ${t.name}`}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      <PrototypeNote>
        <span className="font-semibold text-text">Prototype</span> — time-off types are saved to this browser only, not a backend.
      </PrototypeNote>

      <LeaveTypeDialog
        key={editing?.id ?? (creating ? "new" : "closed")}
        open={creating || !!editing}
        existing={editing}
        onClose={() => { setCreating(false); setEditing(null); }}
      />
    </Panel>
  );
}

function LeaveTypeDialog({ open, existing, onClose }: {
  open: boolean; existing: SettingsLeaveType | null; onClose: () => void;
}) {
  const addLeaveType = useTimeOffSettingsStore((s) => s.addLeaveType);
  const updateLeaveType = useTimeOffSettingsStore((s) => s.updateLeaveType);

  const [name, setName] = useState(existing?.name ?? "");
  const [color, setColor] = useState(existing?.color ?? TYPE_COLORS[0]);
  const [description, setDescription] = useState(existing?.description ?? "");
  const [tracksBalance, setTracksBalance] = useState(existing?.tracksBalance ?? true);
  const [allocation, setAllocation] = useState(String(existing?.allocation ?? 12));
  const [noteMandatory, setNoteMandatory] = useState(existing?.noteMandatory ?? false);

  function handleSave() {
    const trimmed = name.trim();
    if (!trimmed) {
      toast.error("Give the time-off type a title");
      return;
    }
    const alloc = tracksBalance ? Math.max(0, parseInt(allocation, 10) || 0) : 0;
    const payload = { name: trimmed, color, description: description.trim(), tracksBalance, allocation: alloc, noteMandatory };
    if (existing) {
      updateLeaveType(existing.id, payload);
      toast.success(`Updated “${trimmed}”`);
    } else {
      addLeaveType(payload);
      toast.success(`Created “${trimmed}”`);
    }
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{existing ? "Edit Time Off Type" : "New Time Off Type"}</DialogTitle>
          <DialogDescription>Define how this leave appears and behaves when employees request it.</DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-text-secondary">Title</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Wedding Leave" autoFocus />
          </div>

          <div>
            <label className="mb-2 block text-xs font-medium text-text-secondary">Color</label>
            <div className="flex flex-wrap items-center gap-2">
              {TYPE_COLORS.map((c) => {
                const selected = color.toLowerCase() === c.toLowerCase();
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={cn(
                      "h-7 w-7 rounded-full transition-all",
                      selected ? "ring-2 ring-offset-2 ring-offset-surface ring-primary-500" : "hover:scale-110",
                    )}
                    style={{ backgroundColor: c }}
                    aria-label={`Color ${c}`}
                  />
                );
              })}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-text-secondary">Description</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional — what this leave is for."
              rows={2}
            />
          </div>

          <div className="flex items-center justify-between rounded-[12px] bg-surface-2/60 px-3 py-2.5">
            <div>
              <p className="text-sm font-medium text-text">Track a yearly balance</p>
              <p className="text-xs text-text-tertiary">Off = unlimited (e.g. unpaid or WFH).</p>
            </div>
            <Switch checked={tracksBalance} onChange={(e) => setTracksBalance(e.target.checked)} size="small" sx={MUI_SWITCH_SX} />
          </div>

          {tracksBalance ? (
            <div>
              <label className="mb-1.5 block text-xs font-medium text-text-secondary">Days allocated per year</label>
              <Input
                type="number"
                value={allocation}
                onChange={(e) => setAllocation(e.target.value)}
                className="max-w-[140px]"
              />
            </div>
          ) : null}

          <div className="flex items-center justify-between rounded-[12px] bg-surface-2/60 px-3 py-2.5">
            <div>
              <p className="text-sm font-medium text-text">Make “Add a Note” mandatory</p>
              <p className="text-xs text-text-tertiary">Employees must explain the request.</p>
            </div>
            <Switch checked={noteMandatory} onChange={(e) => setNoteMandatory(e.target.checked)} size="small" sx={MUI_SWITCH_SX} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>{existing ? "Save changes" : "Create type"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ─────────────── Workweek ─────────────── */

function WorkweekTab() {
  const workweek = useTimeOffSettingsStore((s) => s.workweek);
  const toggleWorkday = useTimeOffSettingsStore((s) => s.toggleWorkday);
  const workingCount = workweek.filter(Boolean).length;

  return (
    <Panel
      title="Workweek"
      sub="Which days count as working days. Non-working days are skipped when leave duration is calculated."
    >
      <div className="flex flex-wrap gap-2.5">
        {WEEKDAY_LABELS.map((label, i) => {
          const on = workweek[i];
          return (
            <button
              key={label}
              type="button"
              onClick={() => toggleWorkday(i)}
              className={cn(
                "flex h-16 w-16 flex-col items-center justify-center gap-1 rounded-[14px] border text-sm font-semibold transition-all",
                on
                  ? "border-transparent bg-primary-600 text-white shadow-[0_4px_12px_-4px_rgba(90,67,213,0.5)]"
                  : "border-border/[0.1] bg-surface-2 text-text-tertiary hover:text-text-secondary dark:border-white/[0.06]",
              )}
              aria-pressed={on}
            >
              <span className="text-lg">{WEEKDAY_DOTS[i]}</span>
              <span className="text-[10px] font-medium opacity-80">{label}</span>
            </button>
          );
        })}
      </div>
      <p className="mt-4 text-sm text-text-secondary">
        <span className="font-semibold text-text">{workingCount}</span> working {workingCount === 1 ? "day" : "days"} per week
        {" · "}
        <span className="text-text-tertiary">{7 - workingCount} weekly off</span>
      </p>
      <PrototypeNote>
        <span className="font-semibold text-text">Prototype</span> — the workweek is saved locally. Leave-duration math elsewhere still treats Sat &amp; Sun as the weekend.
      </PrototypeNote>
    </Panel>
  );
}

/* ─────────────── Holiday Calendar ─────────────── */

function HolidaysTab() {
  return <HolidayCalendarSettings />;
}

/* ─────────────── Policy Period ─────────────── */

function PolicyTab() {
  const policy = useTimeOffSettingsStore((s) => s.policy);
  const updatePolicy = useTimeOffSettingsStore((s) => s.updatePolicy);

  return (
    <Panel
      title="Policy Period"
      sub="How the accrual cycle is defined and when this policy takes effect."
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-xs font-medium text-text-secondary">Policy title</label>
          <Input value={policy.title} onChange={(e) => updatePolicy({ title: e.target.value })} />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-text-secondary">Calculate time off in</label>
          <Select value={policy.unit} onValueChange={(v) => updatePolicy({ unit: v as "days" | "hours" })}>
            <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="days">Days</SelectItem>
              <SelectItem value="hours">Hours</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-text-secondary">Period start month</label>
          <Select value={String(policy.startMonth)} onValueChange={(v) => updatePolicy({ startMonth: Number(v) })}>
            <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
            <SelectContent>
              {MONTH_LABELS.map((m, i) => (
                <SelectItem key={m} value={String(i + 1)}>{m}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-text-secondary">Applicable from</label>
          <Input type="date" value={policy.applicableFrom} onChange={(e) => updatePolicy({ applicableFrom: e.target.value })} />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-text-secondary">Holiday calendar</label>
          <Input value={policy.holidayCalendar} onChange={(e) => updatePolicy({ holidayCalendar: e.target.value })} />
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between rounded-[12px] bg-surface-2/60 px-3 py-2.5">
        <div>
          <p className="text-sm font-medium text-text">Mark as default policy</p>
          <p className="text-xs text-text-tertiary">Applied to new employees automatically.</p>
        </div>
        <Switch checked={policy.isDefault} onChange={(e) => updatePolicy({ isDefault: e.target.checked })} size="small" sx={MUI_SWITCH_SX} />
      </div>

      <PrototypeNote>
        <span className="font-semibold text-text">Prototype</span> — policy settings are saved to this browser only.
      </PrototypeNote>
    </Panel>
  );
}

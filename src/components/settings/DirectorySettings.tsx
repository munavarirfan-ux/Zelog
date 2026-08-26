"use client";

import { Briefcase, Building, Clock, Hash, IdCard } from "lucide-react";
import {
  WORKER_TYPES, TIME_TYPES, PAY_FREQUENCIES, LEGAL_ENTITIES, BUSINESS_UNITS,
  LEVELS, COST_CENTERS, SHIFTS, PROBATION_POLICIES, NOTICE_PERIODS,
  EMPLOYMENT_TYPES, WORK_MODES,
} from "@/data/directoryData";

function Panel({ title, icon: Icon, color = "#7A4DFF", children }: {
  title: string; icon: typeof Briefcase; color?: string; children: React.ReactNode;
}) {
  return (
    <section className="rounded-card border border-border/[0.07] bg-surface p-6 shadow-card dark:border-white/[0.06]">
      <div className="mb-4 flex items-center gap-2.5">
        <span className="flex h-8 w-8 items-center justify-center rounded-[10px]" style={{ backgroundColor: `${color}18`, color }}>
          <Icon className="h-4 w-4" strokeWidth={2} />
        </span>
        <h3 className="text-[15px] font-semibold text-text">{title}</h3>
      </div>
      {children}
    </section>
  );
}

function OptionRow({ label, values }: { label: string; values: string[] }) {
  return (
    <div className="border-b border-border/[0.05] py-3 last:border-0">
      <p className="mb-2 text-xs font-medium text-text-secondary">{label}</p>
      <div className="flex flex-wrap gap-2">
        {values.map((v) => (
          <span key={v} className="inline-flex items-center rounded-full bg-surface-2 px-3 py-1 text-xs font-medium text-text-secondary">
            {v}
          </span>
        ))}
      </div>
    </div>
  );
}

export function DirectorySettings() {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-base font-semibold text-text">Directory &amp; People</h2>
        <p className="mt-0.5 text-xs text-text-tertiary">The option sets available when creating or editing an employee record.</p>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Panel title="Employment" icon={Briefcase} color="#8B5CF6">
          <OptionRow label="Employment type" values={EMPLOYMENT_TYPES.map((t) => t.label)} />
          <OptionRow label="Worker type" values={WORKER_TYPES} />
          <OptionRow label="Time type" values={TIME_TYPES} />
          <OptionRow label="Work mode" values={WORK_MODES.map((m) => m.label)} />
        </Panel>

        <Panel title="Organization structure" icon={Building} color="#38BDF8">
          <OptionRow label="Legal entity" values={LEGAL_ENTITIES} />
          <OptionRow label="Business unit" values={BUSINESS_UNITS} />
          <OptionRow label="Level / grade" values={LEVELS} />
          <OptionRow label="Cost center" values={COST_CENTERS} />
        </Panel>

        <Panel title="Time & compensation" icon={Clock} color="#34D399">
          <OptionRow label="Shift" values={SHIFTS} />
          <OptionRow label="Pay frequency" values={PAY_FREQUENCIES} />
        </Panel>

        <Panel title="Policies" icon={IdCard} color="#F472B6">
          <OptionRow label="Probation policy" values={PROBATION_POLICIES} />
          <OptionRow label="Notice period" values={NOTICE_PERIODS} />
        </Panel>
      </div>

      <Panel title="Employee code format" icon={Hash} color="#FBBF24">
        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded-[10px] bg-surface-2 px-3 py-2 font-mono text-sm text-text">ZES-####</span>
          <p className="text-xs text-text-tertiary">Prefix <span className="font-medium text-text-secondary">ZES</span> followed by a sequential number, e.g. <span className="font-mono">ZES-1048</span>.</p>
        </div>
        <div className="mt-4 flex items-start gap-2 rounded-[12px] bg-surface-2/50 px-3 py-2.5">
          <IdCard className="mt-0.5 h-4 w-4 shrink-0 text-text-tertiary" />
          <p className="text-xs text-text-secondary"><span className="font-semibold text-text">Reference</span> — these option sets power the Add / Edit Employee forms. Editing them lives in code for now.</p>
        </div>
      </Panel>
    </div>
  );
}

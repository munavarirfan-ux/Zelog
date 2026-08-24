"use client";

import * as React from "react";
import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft, CalendarDays, IdCard, MoreVertical, Pencil, Users,
} from "lucide-react";
import { useOrgStore } from "@/store/orgStore";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { EMPLOYMENT_STATUS } from "@/data/directoryData";
import { departmentColor } from "@/data/orgData";
import { cn } from "@/lib/utils";
import {
  Avatar, DirStatusPill, useDirectoryPerson, useHydratedDirectoryPage,
} from "./shared";
import { EmployeeActionsMenu, type EmployeeAction } from "./EmployeeActionsMenu";
import { AssignProjectDialog, AdjustLeaveDialog, AssignAssetDialog } from "./dialogs";
import { OverviewTab } from "./profile/OverviewTab";
import { AboutTab } from "./profile/AboutTab";
import { JobTab } from "./profile/JobTab";
import { AttendanceTab } from "./profile/AttendanceTab";
import { LeaveTab } from "./profile/LeaveTab";
import { ProjectsTab } from "./profile/ProjectsTab";
import { DocumentsTab } from "./profile/DocumentsTab";
import { AssetsTab } from "./profile/AssetsTab";
import { ActivityTab } from "./profile/ActivityTab";

const TABS = [
  "Overview", "About", "Job", "Attendance", "Leave", "Projects", "Documents", "Assets", "Activity",
] as const;
export type ProfileTabId = (typeof TABS)[number];
type TabId = ProfileTabId;

/**
 * Tabs a regular employee (no `employees.edit`) may see on someone's record.
 * Everything else — attendance, leave, projects, documents, assets, activity,
 * and the overview snapshot — stays gated to admins/HR so we don't expose
 * sensitive fields across the org.
 */
const EMPLOYEE_VISIBLE_TABS: readonly TabId[] = ["About", "Job"];

export function EmployeeProfile({
  employeeId,
  onClose,
  initialTab: initialTabProp,
}: {
  employeeId: string;
  /** When provided the profile renders inside a popup; the back link closes it instead of navigating. */
  onClose?: () => void;
  initialTab?: TabId;
}) {
  const hydrated = useHydratedDirectoryPage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { hasPermission } = useCurrentUser();
  const canEdit = hasPermission("employees.edit");

  const person = useDirectoryPerson(employeeId);
  const employees = useOrgStore((s) => s.employees);
  const deactivate = useOrgStore((s) => s.deactivateEmployee);
  const nameById = useMemo(() => new Map(employees.map((e) => [e.id, e.name])), [employees]);

  // Close the popup when embedded; otherwise fall back to route navigation.
  const goBack = onClose ?? (() => router.push("/directory"));

  // Non-editors (regular employees) only get the About & Job tabs.
  const visibleTabs = useMemo<TabId[]>(
    () => (canEdit ? [...TABS] : TABS.filter((t) => EMPLOYEE_VISIBLE_TABS.includes(t))),
    [canEdit],
  );

  const initialTab: TabId = (() => {
    const requested =
      initialTabProp ?? TABS.find((x) => x.toLowerCase() === (searchParams.get("tab") ?? "").toLowerCase());
    if (requested && visibleTabs.includes(requested)) return requested;
    return visibleTabs[0];
  })();
  const [tab, setTab] = useState<TabId>(initialTab);
  const [kebab, setKebab] = useState<HTMLElement | null>(null);
  const [dialog, setDialog] = useState<EmployeeAction | null>(null);

  if (!hydrated) return <div className="h-64 animate-pulse rounded-[22px] bg-surface-2/60" />;

  if (!person) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
        <Users className="h-8 w-8 text-text-tertiary" />
        <p className="text-sm text-text-secondary">This employee could not be found.</p>
        <button onClick={goBack} className="text-sm font-medium text-primary-700 hover:underline">
          Back to Directory
        </button>
      </div>
    );
  }

  const managerName = person.managerId ? nameById.get(person.managerId) : undefined;
  const deptColor = departmentColor(person.department);

  // Editing opens the full Add/Edit Employee page (prefilled); close the popup first if embedded.
  const goEdit = () => {
    onClose?.();
    router.push(`/directory/${employeeId}/edit`);
  };

  const runAction = (action: EmployeeAction) => {
    if (action === "view") return;
    if (action === "edit") { goEdit(); return; }
    if (action === "deactivate") { deactivate(person.id); return; }
    setDialog(action);
  };

  return (
    <div className="pb-6">
      {/* Hero identity card — same gradient language as Directory / Add Employee */}
      <section className="relative overflow-hidden rounded-[28px] bg-hero px-6 py-7 text-white shadow-[0_30px_80px_-32px_rgba(49,46,129,0.65)] sm:px-8 sm:py-8">
        {/* Mesh gradient glow */}
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute -right-16 -top-24 h-72 w-72 rounded-full bg-[#B197FF]/30 blur-[90px]" />
          <div className="absolute right-1/3 top-1/2 h-64 w-64 rounded-full bg-[#5B8DEF]/25 blur-[90px]" />
          <div className="absolute -bottom-24 left-1/4 h-64 w-64 rounded-full bg-[#7A4DFF]/25 blur-[90px]" />
          <div
            className="absolute inset-0 opacity-[0.06]"
            style={{ backgroundImage: "radial-gradient(circle at 1px 1px, #fff 1px, transparent 0)", backgroundSize: "22px 22px" }}
          />
        </div>

        <div className="relative">
          {/* Back link chip — only on the full-page route; the popup has its own corner close */}
          {onClose ? null : (
            <button
              onClick={goBack}
              className="mb-5 inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-sm font-medium text-white/80 backdrop-blur transition-colors hover:bg-white/20 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
            >
              <ArrowLeft className="h-4 w-4" /> Directory
            </button>
          )}

          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex min-w-0 items-start gap-4">
              <Avatar person={person} size={64} className="ring-2 ring-white/25" />
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="truncate text-[24px] font-semibold leading-tight tracking-tight sm:text-[28px]">{person.name}</h1>
                  <DirStatusPill status={person.employmentStatus} className="!bg-white/15 !text-white" />
                </div>
                <p className="mt-1 text-sm text-white/70">{person.jobTitle}</p>
                <div className="mt-2.5 flex flex-wrap items-center gap-x-3.5 gap-y-1 text-xs text-white/65">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: deptColor }} />
                    {person.department}
                    {person.extra?.team ? ` · ${person.extra.team}` : ""}
                  </span>
                  <span className="inline-flex items-center gap-1"><IdCard className="h-3.5 w-3.5" /> {person.extra?.employeeCode}</span>
                  {managerName ? <span className="inline-flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {managerName}</span> : null}
                  <span className="inline-flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" /> Joined {person.extra?.joiningDate}</span>
                </div>
              </div>
            </div>
            {canEdit ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={goEdit}
                  className="inline-flex min-h-[44px] items-center gap-1.5 rounded-[13px] bg-white px-4 text-sm font-semibold text-primary-700 shadow-[0_8px_24px_-8px_rgba(0,0,0,0.4)] transition-colors hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                >
                  <Pencil className="h-4 w-4" /> Edit Employee
                </button>
                <button
                  onClick={(e) => setKebab(e.currentTarget)}
                  className="flex h-11 w-11 items-center justify-center rounded-[13px] border border-white/25 bg-white/10 text-white backdrop-blur transition-colors hover:bg-white/20"
                  aria-label="More actions"
                >
                  <MoreVertical className="h-4 w-4" />
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      {/* Tabs — sticky, horizontally scrollable */}
      <div className="sticky top-0 z-20 -mx-1 mt-4 rounded-[16px] border border-border/[0.08] bg-surface/95 px-3 py-2 shadow-[0_1px_2px_rgba(40,30,90,0.04)] backdrop-blur">
        <div className="flex items-center gap-0.5 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {visibleTabs.map((t) => {
            const active = tab === t;
            return (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={cn(
                  "relative shrink-0 rounded-[9px] px-3 py-1.5 text-sm font-medium transition-colors",
                  active ? "bg-primary-50 text-primary-700" : "text-text-tertiary hover:text-text-secondary",
                )}
              >
                {t}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab content */}
      <div className="mt-5">
        {tab === "Overview" && <OverviewTab person={person} nameById={nameById} onNavigate={setTab} />}
        {tab === "About" && <AboutTab person={person} />}
        {tab === "Job" && <JobTab person={person} canEdit={canEdit} nameById={nameById} />}
        {tab === "Attendance" && <AttendanceTab person={person} canEdit={canEdit} />}
        {tab === "Leave" && <LeaveTab person={person} canEdit={canEdit} onAdjust={() => setDialog("manage-leave")} />}
        {tab === "Projects" && <ProjectsTab person={person} canEdit={canEdit} onAssign={() => setDialog("assign-project")} />}
        {tab === "Documents" && <DocumentsTab person={person} canEdit={canEdit} />}
        {tab === "Assets" && <AssetsTab person={person} canEdit={canEdit} nameById={nameById} onAssign={() => setDialog("assign-asset")} />}
        {tab === "Activity" && <ActivityTab person={person} nameById={nameById} />}
      </div>

      {/* Kebab + dialogs */}
      <EmployeeActionsMenu anchor={kebab} person={person} canEdit={canEdit} onClose={() => setKebab(null)} onAction={runAction} />
      {dialog === "assign-project" ? <AssignProjectDialog person={person} open onClose={() => setDialog(null)} /> : null}
      {dialog === "manage-leave" ? <AdjustLeaveDialog person={person} open onClose={() => setDialog(null)} /> : null}
      {dialog === "assign-asset" ? <AssignAssetDialog person={person} open onClose={() => setDialog(null)} /> : null}
    </div>
  );
}

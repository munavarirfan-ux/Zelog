"use client";

import * as React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, Briefcase, Check, GraduationCap, Info, Plus, Trash2, User, Wallet,
} from "lucide-react";
import { DEPARTMENTS } from "@/data/orgData";
import { useOrgStore } from "@/store/orgStore";
import { useDirectoryStore } from "@/store/directoryStore";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import {
  buildExtra, teamsForDepartment,
  EMPLOYMENT_TYPES, WORK_MODES, WORKER_TYPES, TIME_TYPES, PAY_FREQUENCIES, CTC_CURRENCIES,
  WORK_COUNTRIES, NATIONALITIES, GENDERS, MARITAL_STATUSES, BLOOD_GROUPS,
  LEGAL_ENTITIES, BUSINESS_UNITS, LEVELS, COST_CENTERS, SHIFTS, PROBATION_POLICIES, NOTICE_PERIODS, RELATIONSHIPS,
  type EmploymentStatus, type EmploymentType, type WorkMode,
  type Address, type Dependent, type EmergencyContact, type SocialProfile, type EducationEntry, type WorkExperienceEntry,
} from "@/data/directoryData";
import { cn } from "@/lib/utils";
import { inputCls, labelCls } from "./dialogs";
import { useDirectoryPeople, useDirectoryPerson, useHydratedDirectoryPage, type DirectoryPerson } from "./shared";
import { SubNav } from "@/components/attendance/shared";

const TABS = [
  { id: "job", label: "Job", icon: Briefcase },
  { id: "personal", label: "Personal", icon: User },
  { id: "education", label: "Employment & Education", icon: GraduationCap },
  { id: "compensation", label: "Compensation", icon: Wallet },
] as const;
type TabId = (typeof TABS)[number]["id"];

interface Draft {
  // Identity
  workCountry: string;
  firstName: string;
  middleName: string;
  lastName: string;
  displayName: string;
  officialEmail: string;
  gender: string;
  dateOfBirth: string;
  nationality: string;
  // Employment
  joiningDate: string;
  jobTitle: string;
  secondaryJobTitle: string;
  timeType: string;
  employmentType: EmploymentType;
  workerType: string;
  // Organisational
  legalEntity: string;
  businessUnit: string;
  department: string;
  subDepartment: string;
  location: string;
  primaryTeam: string;
  additionalTeams: string;
  level: string;
  costCenter: string;
  managerId: string;
  isManager: boolean;
  workMode: WorkMode;
  // Employment terms
  probationPolicy: string;
  noticePeriod: string;
  probationStartDate: string;
  probationEndDate: string;
  // Additional work
  shift: string;
  idCardNumber: string;
  // Personal
  bloodGroup: string;
  maritalStatus: string;
  languagesSpoken: string;
  phone: string;
  personalEmail: string;
  homeAddress: Address;
  communicationAddress: Address;
  commSameAsHome: boolean;
  dependents: Dependent[];
  emergencyContacts: EmergencyContact[];
  socialProfiles: SocialProfile[];
  // Employment & Education
  totalExperience: string;
  education: EducationEntry[];
  workExperience: WorkExperienceEntry[];
  // Compensation
  annualCtc: string;
  currency: string;
  payFrequency: string;
  ctcEffectiveFrom: string;
  // Status
  status: EmployeeLifecycle;
}

type EmployeeLifecycle = "active" | "inactive";

const emptyAddress: Address = { street: "", city: "", state: "", country: "India", zip: "" };

const emptyDraft: Draft = {
  workCountry: "India",
  firstName: "", middleName: "", lastName: "", displayName: "",
  officialEmail: "", gender: "", dateOfBirth: "", nationality: "Indian",
  joiningDate: "2026-09-01", jobTitle: "", secondaryJobTitle: "",
  timeType: "Full Time", employmentType: "full-time", workerType: "Permanent",
  legalEntity: LEGAL_ENTITIES[0], businessUnit: "",
  department: "Engineering", subDepartment: "", location: "Hyderabad",
  primaryTeam: "", additionalTeams: "", level: "", costCenter: "",
  managerId: "", isManager: false, workMode: "hybrid",
  probationPolicy: PROBATION_POLICIES[0], noticePeriod: NOTICE_PERIODS[0],
  probationStartDate: "", probationEndDate: "",
  shift: SHIFTS[0], idCardNumber: "",
  bloodGroup: "", maritalStatus: "", languagesSpoken: "",
  phone: "", personalEmail: "",
  homeAddress: { ...emptyAddress }, communicationAddress: { ...emptyAddress }, commSameAsHome: true,
  dependents: [], emergencyContacts: [], socialProfiles: [],
  totalExperience: "", education: [], workExperience: [],
  annualCtc: "", currency: "INR", payFrequency: "Monthly", ctcEffectiveFrom: "",
  status: "active",
};

/* ── Small helpers ── */

function addressEmpty(a: Address) {
  return !a.street && !a.city && !a.state && !a.zip;
}
function addressToString(a: Address) {
  return [a.street, a.city, a.state, a.zip, a.country].filter(Boolean).join(", ");
}
function stripUndefined<T extends Record<string, unknown>>(obj: T) {
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined && v !== "" && !(Array.isArray(v) && v.length === 0)));
}

/** Hydrate the edit form from an existing employee record (identity + extras). */
function draftFromPerson(person: DirectoryPerson, isManagerDefault: boolean): Draft {
  const x = person.extra;
  const parts = person.name.trim().split(/\s+/).filter(Boolean);
  const firstName = parts[0] ?? "";
  const lastName = parts.length > 1 ? parts[parts.length - 1] : "";
  const middleName = x.middleName ?? (parts.length > 2 ? parts.slice(1, -1).join(" ") : "");
  const emergencyContacts =
    x.emergencyContacts && x.emergencyContacts.length
      ? x.emergencyContacts
      : x.emergencyContact
        ? [x.emergencyContact]
        : [];

  return {
    workCountry: x.workCountry ?? "India",
    firstName, middleName, lastName,
    displayName: x.displayName ?? "",
    officialEmail: person.email ?? "",
    gender: x.gender ?? "",
    dateOfBirth: x.dateOfBirth ?? "",
    nationality: x.nationality ?? "Indian",
    joiningDate: x.joiningDate ?? "",
    jobTitle: person.jobTitle ?? "",
    secondaryJobTitle: x.secondaryJobTitle ?? "",
    timeType: x.timeType ?? "Full Time",
    employmentType: x.employmentType,
    workerType: x.workerType ?? "Permanent",
    legalEntity: x.legalEntity ?? LEGAL_ENTITIES[0],
    businessUnit: x.businessUnit ?? "",
    department: person.department,
    subDepartment: x.team ?? "",
    location: person.location ?? "",
    primaryTeam: x.primaryTeam ?? "",
    additionalTeams: (x.additionalTeams ?? []).join(", "),
    level: x.level ?? "",
    costCenter: x.costCenter ?? "",
    managerId: person.managerId ?? "",
    isManager: x.isManager ?? isManagerDefault,
    workMode: x.workMode,
    probationPolicy: x.probationPolicy ?? PROBATION_POLICIES[0],
    noticePeriod: NOTICE_PERIODS[0],
    probationStartDate: x.probationStartDate ?? "",
    probationEndDate: x.probationEndDate ?? "",
    shift: x.shift ?? SHIFTS[0],
    idCardNumber: x.idCardNumber ?? "",
    bloodGroup: x.bloodGroup ?? "",
    maritalStatus: x.maritalStatus ?? "",
    languagesSpoken: x.languagesSpoken ?? "",
    phone: x.phone ?? "",
    personalEmail: x.personalEmail ?? "",
    homeAddress: x.homeAddress ? { ...emptyAddress, ...x.homeAddress } : { ...emptyAddress },
    communicationAddress: x.communicationAddress ? { ...emptyAddress, ...x.communicationAddress } : { ...emptyAddress },
    commSameAsHome: !x.communicationAddress,
    dependents: x.dependents ? x.dependents.map((d) => ({ ...d })) : [],
    emergencyContacts: emergencyContacts.map((c) => ({ ...c })),
    socialProfiles: x.socialProfiles ? x.socialProfiles.map((s) => ({ ...s })) : [],
    totalExperience: x.totalExperienceYears != null ? String(x.totalExperienceYears) : "",
    education: x.education ? x.education.map((e) => ({ ...e })) : [],
    workExperience: x.workExperience ? x.workExperience.map((w) => ({ ...w })) : [],
    annualCtc: x.annualCtc != null ? String(x.annualCtc) : "",
    currency: x.ctcCurrency ?? "INR",
    payFrequency: x.payFrequency ?? "Monthly",
    ctcEffectiveFrom: x.ctcEffectiveFrom ?? "",
    status: person.employmentStatus === "inactive" ? "inactive" : "active",
  };
}

export function AddEmployeePage({ employeeId }: { employeeId?: string } = {}) {
  const hydrated = useHydratedDirectoryPage();
  const router = useRouter();
  const { hasPermission } = useCurrentUser();
  const canEdit = hasPermission("employees.edit");

  const editing = Boolean(employeeId);
  const person = useDirectoryPerson(employeeId ?? "");

  const [tab, setTab] = useState<TabId>("job");
  const [draft, setDraft] = useState<Draft>(emptyDraft);

  // When editing, seed the form once from the existing record (after hydration).
  const people = useDirectoryPeople();
  const addEmployee = useOrgStore((s) => s.addEmployee);
  const updateEmployee = useOrgStore((s) => s.updateEmployee);
  const employeeCount = useOrgStore((s) => s.employees.length);
  const dirStore = useDirectoryStore();

  // Ids of everyone who already has at least one direct report.
  const managerIds = useMemo(() => {
    const s = new Set<string>();
    people.forEach((p) => { if (p.managerId) s.add(p.managerId); });
    return s;
  }, [people]);

  const seededRef = useRef(false);
  useEffect(() => {
    if (editing && person && !seededRef.current) {
      seededRef.current = true;
      setDraft(draftFromPerson(person, managerIds.has(person.id)));
    }
  }, [editing, person, managerIds]);

  // Reporting-manager options: people explicitly flagged as managers, plus anyone
  // who already manages someone (so existing records keep working).
  const managers = useMemo(
    () => people
      .filter((p) => p.employmentStatus !== "inactive" && p.id !== employeeId && (p.extra?.isManager || managerIds.has(p.id)))
      .sort((a, b) => a.name.localeCompare(b.name)),
    [people, employeeId, managerIds],
  );

  const set = (patch: Partial<Draft>) => setDraft((d) => ({ ...d, ...patch }));
  const setAddr = (key: "homeAddress" | "communicationAddress", patch: Partial<Address>) =>
    setDraft((d) => ({ ...d, [key]: { ...d[key], ...patch } }));

  // Generic repeatable-list helpers
  type ListKey = "dependents" | "emergencyContacts" | "socialProfiles" | "education" | "workExperience";
  const addTo = (key: ListKey, blank: unknown) => setDraft((d) => ({ ...d, [key]: [...(d[key] as unknown[]), blank] }));
  const removeAt = (key: ListKey, i: number) => setDraft((d) => ({ ...d, [key]: (d[key] as unknown[]).filter((_, idx) => idx !== i) }));
  const updateAt = (key: ListKey, i: number, patch: Record<string, unknown>) =>
    setDraft((d) => ({ ...d, [key]: (d[key] as unknown as Record<string, unknown>[]).map((x, idx) => (idx === i ? { ...x, ...patch } : x)) }));

  const requiredValid =
    draft.firstName.trim() && draft.lastName.trim() && draft.officialEmail.trim() &&
    draft.jobTitle.trim() && draft.department && draft.location.trim();

  if (!hydrated) return <div className="h-64 animate-pulse rounded-[22px] bg-surface-2/60" />;

  if (!canEdit) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
        <User className="h-8 w-8 text-text-tertiary" />
        <p className="text-sm text-text-secondary">You don’t have permission to add employees.</p>
        <button onClick={() => router.push("/directory")} className="text-sm font-medium text-primary-700 hover:underline">
          Back to Directory
        </button>
      </div>
    );
  }

  if (editing && !person) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
        <User className="h-8 w-8 text-text-tertiary" />
        <p className="text-sm text-text-secondary">This employee could not be found.</p>
        <button onClick={() => router.push("/directory")} className="text-sm font-medium text-primary-700 hover:underline">
          Back to Directory
        </button>
      </div>
    );
  }

  const commit = () => {
    const name = [draft.firstName, draft.middleName, draft.lastName].map((s) => s.trim()).filter(Boolean).join(" ");
    const status: EmployeeLifecycle = draft.status;
    // Directory employment status mirrors the org status — only active or inactive.
    const employmentStatus: EmploymentStatus = status;

    const homeAddr = addressEmpty(draft.homeAddress) ? undefined : draft.homeAddress;
    const commAddr = draft.commSameAsHome
      ? homeAddr
      : addressEmpty(draft.communicationAddress) ? undefined : draft.communicationAddress;
    const dependents = draft.dependents.filter((d) => d.name.trim());
    const emergencyContacts = draft.emergencyContacts.filter((c) => c.name.trim());
    const socialProfiles = draft.socialProfiles.filter((s) => s.url.trim());
    const education = draft.education.filter((e) => e.qualification.trim() || e.institution.trim());
    const workExperience = draft.workExperience.filter((w) => w.company.trim());

    const overrides = stripUndefined({
      middleName: draft.middleName || undefined,
      displayName: draft.displayName || undefined,
      workCountry: draft.workCountry || undefined,
      nationality: draft.nationality || undefined,
      team: draft.subDepartment || undefined,
      employmentType: draft.employmentType,
      workMode: draft.workMode,
      joiningDate: draft.joiningDate,
      timeType: draft.timeType || undefined,
      workerType: draft.workerType || undefined,
      employmentTerms: draft.workerType || undefined,
      secondaryJobTitle: draft.secondaryJobTitle || undefined,
      legalEntity: draft.legalEntity || undefined,
      businessUnit: draft.businessUnit || undefined,
      primaryTeam: draft.primaryTeam || undefined,
      additionalTeams: draft.additionalTeams ? draft.additionalTeams.split(",").map((s) => s.trim()).filter(Boolean) : undefined,
      level: draft.level || undefined,
      costCenter: draft.costCenter || undefined,
      isManager: draft.isManager || undefined,
      probationPolicy: draft.probationPolicy || undefined,
      probationStartDate: draft.probationStartDate || undefined,
      probationEndDate: draft.probationEndDate || undefined,
      shift: draft.shift || undefined,
      idCardNumber: draft.idCardNumber || undefined,
      gender: draft.gender || undefined,
      dateOfBirth: draft.dateOfBirth || undefined,
      bloodGroup: draft.bloodGroup || undefined,
      maritalStatus: draft.maritalStatus || undefined,
      languagesSpoken: draft.languagesSpoken || undefined,
      phone: draft.phone || undefined,
      personalEmail: draft.personalEmail || undefined,
      homeAddress: homeAddr,
      communicationAddress: commAddr,
      currentAddress: homeAddr ? addressToString(homeAddr) : undefined,
      dependents: dependents.length ? dependents : undefined,
      emergencyContacts: emergencyContacts.length ? emergencyContacts : undefined,
      emergencyContact: emergencyContacts[0] ?? undefined,
      socialProfiles: socialProfiles.length ? socialProfiles : undefined,
      totalExperienceYears: draft.totalExperience ? Number(draft.totalExperience) : undefined,
      education: education.length ? education : undefined,
      workExperience: workExperience.length ? workExperience : undefined,
      highestQualification: education[0]?.qualification || undefined,
      institution: education[0]?.institution || undefined,
      annualCtc: draft.annualCtc ? Number(draft.annualCtc) : undefined,
      ctcCurrency: draft.annualCtc ? draft.currency : undefined,
      payFrequency: draft.annualCtc ? draft.payFrequency : undefined,
      ctcEffectiveFrom: draft.annualCtc && draft.ctcEffectiveFrom ? draft.ctcEffectiveFrom : undefined,
    });

    // Editing an existing record: update identity + merge extras in place.
    if (editing && person) {
      updateEmployee(person.id, {
        name,
        email: draft.officialEmail,
        jobTitle: draft.jobTitle,
        department: draft.department,
        location: draft.location,
        managerId: draft.managerId || undefined,
        status,
      });
      useDirectoryStore.setState((s) => ({
        extras: { ...s.extras, [person.id]: { ...s.extras[person.id], ...overrides, team: draft.subDepartment || s.extras[person.id]?.team, isManager: draft.isManager, employmentStatus } },
      }));
      dirStore.logActivity({ employeeId: person.id, category: "general", title: "Employee updated", detail: name });
      router.push("/directory");
      return;
    }

    const id = addEmployee({ name, email: draft.officialEmail, jobTitle: draft.jobTitle, department: draft.department, location: draft.location, managerId: draft.managerId || undefined, hrManagerId: "hrhead", status });
    const seed = buildExtra({ id, name, email: draft.officialEmail, jobTitle: draft.jobTitle, department: draft.department, location: draft.location, status, managerId: draft.managerId || undefined }, employeeCount);
    useDirectoryStore.setState((s) => ({ extras: { ...s.extras, [id]: { ...seed, ...overrides, employmentStatus } } }));
    dirStore.logActivity({ employeeId: id, category: "general", title: status === "inactive" ? "Employee created (inactive)" : "Employee created", detail: name });
    router.push("/directory");
  };

  const subDepts = teamsForDepartment(draft.department);

  return (
    <div className="pb-12">
      {/* Hero */}
      <section className="relative mb-5 overflow-hidden rounded-[28px] bg-hero px-6 py-7 text-white shadow-[0_30px_80px_-32px_rgba(49,46,129,0.65)] sm:px-8 sm:py-8">
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

        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <button
              onClick={() => router.push("/directory")}
              className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-sm font-medium text-white/80 backdrop-blur transition-colors hover:bg-white/20 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
            >
              <ArrowLeft className="h-4 w-4" /> Directory
            </button>
            <h1 className="text-[26px] font-semibold leading-tight tracking-tight sm:text-[30px]">{editing ? "Edit Candidate" : "Add Employee"}</h1>
            <p className="mt-2 max-w-md text-sm text-white/65">
              {editing
                ? "Update this record — the shared source of truth across ZE[LOG] and ZE[TEAMS]."
                : "A complete record — the shared source of truth across ZE[LOG] and ZE[TEAMS]."}
            </p>
          </div>
          <div className="flex flex-col items-stretch gap-3 sm:items-end">
            {/* Status */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => router.push("/directory")}
                className="inline-flex min-h-[44px] items-center rounded-[13px] border border-white/25 bg-white/10 px-4 text-sm font-semibold text-white backdrop-blur transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={commit}
                disabled={!requiredValid}
                className="inline-flex min-h-[44px] items-center gap-1.5 rounded-[13px] bg-white px-4 text-sm font-semibold text-primary-700 shadow-[0_8px_24px_-8px_rgba(0,0,0,0.4)] transition-colors hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Check className="h-4 w-4" /> {editing ? "Save Changes" : "Create Employee"}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Tab strip */}
      <div className="mb-5">
        <SubNav
          items={TABS.map((t) => ({ id: t.id, label: t.label, icon: t.icon }))}
          value={tab}
          onChange={(id) => setTab(id as TabId)}
          showIcons
        />
      </div>

      {/* Content */}
      {!requiredValid ? (
        <div className="mb-4 flex items-center gap-2 rounded-[12px] border border-amber-500/20 bg-amber-500/[0.06] px-4 py-2.5 text-xs text-amber-700 dark:text-amber-300">
          <Info className="h-3.5 w-3.5 shrink-0" />
          <span>First name, last name, work email, job title, department and location are required to create the employee.</span>
        </div>
      ) : null}

      <div className="space-y-5">
        {tab === "job" && (
          <>
            <Section title="General Information">
              <Grid>
                <Field label="Work Country">
                  <select className={inputCls} value={draft.workCountry} onChange={(e) => set({ workCountry: e.target.value })}>
                    {WORK_COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </Field>
                <div className="hidden sm:block" />
                <Field label="First Name" required>
                  <input className={inputCls} value={draft.firstName} onChange={(e) => set({ firstName: e.target.value })} />
                </Field>
                <Field label="Middle Name">
                  <input className={inputCls} value={draft.middleName} onChange={(e) => set({ middleName: e.target.value })} />
                </Field>
                <Field label="Last Name" required>
                  <input className={inputCls} value={draft.lastName} onChange={(e) => set({ lastName: e.target.value })} />
                </Field>
                <Field label="Display Name">
                  <input className={inputCls} value={draft.displayName} onChange={(e) => set({ displayName: e.target.value })} placeholder="Auto from name if blank" />
                </Field>
                <Field label="Work Email" required full>
                  <input className={inputCls} value={draft.officialEmail} onChange={(e) => set({ officialEmail: e.target.value })} placeholder="name@zessta.com" />
                </Field>
                <Field label="Nationality">
                  <select className={inputCls} value={draft.nationality} onChange={(e) => set({ nationality: e.target.value })}>
                    {NATIONALITIES.map((n) => <option key={n} value={n}>{n}</option>)}
                  </select>
                </Field>
                <Field label="Employee Number">
                  <input className={cn(inputCls, "bg-surface-2 text-text-tertiary")} value={editing ? person?.extra.employeeCode ?? "" : `ZES-${1001 + employeeCount}`} disabled />
                </Field>
              </Grid>
            </Section>

            <Section title="Employment Details">
              <Grid>
                <Field label="Joining Date" required>
                  <input type="date" className={inputCls} value={draft.joiningDate} onChange={(e) => set({ joiningDate: e.target.value })} />
                </Field>
                <Field label="Job Title" required>
                  <input className={inputCls} value={draft.jobTitle} onChange={(e) => set({ jobTitle: e.target.value })} />
                </Field>
                <Field label="Secondary Job Title">
                  <input className={inputCls} value={draft.secondaryJobTitle} onChange={(e) => set({ secondaryJobTitle: e.target.value })} />
                </Field>
                <Field label="Time Type">
                  <select className={inputCls} value={draft.timeType} onChange={(e) => set({ timeType: e.target.value })}>
                    {TIME_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </Field>
                <Field label="Work Type">
                  <select className={inputCls} value={draft.employmentType} onChange={(e) => set({ employmentType: e.target.value as EmploymentType })}>
                    {EMPLOYMENT_TYPES.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
                  </select>
                </Field>
                <Field label="Worker Type">
                  <select className={inputCls} value={draft.workerType} onChange={(e) => set({ workerType: e.target.value })}>
                    {WORKER_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </Field>
              </Grid>
            </Section>

            <Section title="Organisational Details">
              <Grid>
                <Field label="Legal Entity">
                  <select className={inputCls} value={draft.legalEntity} onChange={(e) => set({ legalEntity: e.target.value })}>
                    {LEGAL_ENTITIES.map((l) => <option key={l} value={l}>{l}</option>)}
                  </select>
                </Field>
                <Field label="Business Unit">
                  <select className={inputCls} value={draft.businessUnit} onChange={(e) => set({ businessUnit: e.target.value })}>
                    <option value="">— Select —</option>
                    {BUSINESS_UNITS.map((b) => <option key={b} value={b}>{b}</option>)}
                  </select>
                </Field>
                <Field label="Department" required>
                  <select className={inputCls} value={draft.department} onChange={(e) => set({ department: e.target.value, subDepartment: "", primaryTeam: "" })}>
                    {DEPARTMENTS.map((d) => <option key={d.name} value={d.name}>{d.name}</option>)}
                  </select>
                </Field>
                <Field label="Location" required>
                  <input className={inputCls} value={draft.location} onChange={(e) => set({ location: e.target.value })} placeholder="e.g. Hyderabad" />
                </Field>
                <Field label="Sub Department">
                  {subDepts.length > 0 ? (
                    <select className={inputCls} value={draft.subDepartment} onChange={(e) => set({ subDepartment: e.target.value })}>
                      <option value="">— Select —</option>
                      {subDepts.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                  ) : (
                    <input className={inputCls} value={draft.subDepartment} onChange={(e) => set({ subDepartment: e.target.value })} />
                  )}
                </Field>
                <Field label="Primary Team">
                  {subDepts.length > 0 ? (
                    <select className={inputCls} value={draft.primaryTeam} onChange={(e) => set({ primaryTeam: e.target.value })}>
                      <option value="">— Select —</option>
                      {subDepts.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                  ) : (
                    <input className={inputCls} value={draft.primaryTeam} onChange={(e) => set({ primaryTeam: e.target.value })} />
                  )}
                </Field>
                <Field label="Additional Teams">
                  <input className={inputCls} value={draft.additionalTeams} onChange={(e) => set({ additionalTeams: e.target.value })} placeholder="Comma-separated" />
                </Field>
                <Field label="Level">
                  <select className={inputCls} value={draft.level} onChange={(e) => set({ level: e.target.value })}>
                    <option value="">— Select —</option>
                    {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
                  </select>
                </Field>
                <Field label="Cost Center">
                  <select className={inputCls} value={draft.costCenter} onChange={(e) => set({ costCenter: e.target.value })}>
                    <option value="">— Select —</option>
                    {COST_CENTERS.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </Field>
                <Field label="Work Mode">
                  <select className={inputCls} value={draft.workMode} onChange={(e) => set({ workMode: e.target.value as WorkMode })}>
                    {WORK_MODES.map((w) => <option key={w.id} value={w.id}>{w.label}</option>)}
                  </select>
                </Field>
                <Field label="Reporting Manager" full>
                  <select className={inputCls} value={draft.managerId} onChange={(e) => set({ managerId: e.target.value })}>
                    <option value="">— None —</option>
                    {managers.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
                </Field>
                <div className="sm:col-span-2">
                  <label className="flex cursor-pointer items-start gap-3 rounded-[12px] border border-border/[0.1] bg-surface-2/40 px-3.5 py-3 transition-colors hover:bg-surface-2/70">
                    <input
                      type="checkbox"
                      checked={draft.isManager}
                      onChange={(e) => set({ isManager: e.target.checked })}
                      className="mt-0.5 h-4 w-4 rounded accent-primary-600"
                    />
                    <span className="min-w-0">
                      <span className="block text-sm font-medium text-text">This employee is a people manager</span>
                      <span className="block text-xs text-text-tertiary">They can be assigned as a reporting manager for other employees.</span>
                    </span>
                  </label>
                </div>
              </Grid>
            </Section>

            <Section title="Employment Terms">
              <Grid>
                <Field label="Probation Policy">
                  <select className={inputCls} value={draft.probationPolicy} onChange={(e) => set({ probationPolicy: e.target.value })}>
                    {PROBATION_POLICIES.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </Field>
                <Field label="Notice Period">
                  <select className={inputCls} value={draft.noticePeriod} onChange={(e) => set({ noticePeriod: e.target.value })}>
                    {NOTICE_PERIODS.map((n) => <option key={n} value={n}>{n}</option>)}
                  </select>
                </Field>
                <Field label="Probation Start Date">
                  <input type="date" className={inputCls} value={draft.probationStartDate} onChange={(e) => set({ probationStartDate: e.target.value })} />
                </Field>
                <Field label="Probation End Date">
                  <input type="date" className={inputCls} value={draft.probationEndDate} onChange={(e) => set({ probationEndDate: e.target.value })} />
                </Field>
              </Grid>
            </Section>

            <Section title="Additional Work Information">
              <Grid>
                <Field label="Shift">
                  <select className={inputCls} value={draft.shift} onChange={(e) => set({ shift: e.target.value })}>
                    {SHIFTS.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </Field>
                <Field label="ID Card Number">
                  <input className={inputCls} value={draft.idCardNumber} onChange={(e) => set({ idCardNumber: e.target.value })} />
                </Field>
              </Grid>
            </Section>
          </>
        )}

        {tab === "personal" && (
          <>
            <Section title="Personal Information">
              <Grid>
                <Field label="Gender">
                  <select className={inputCls} value={draft.gender} onChange={(e) => set({ gender: e.target.value })}>
                    <option value="">— Select —</option>
                    {GENDERS.map((g) => <option key={g} value={g}>{g}</option>)}
                  </select>
                </Field>
                <Field label="Date of Birth">
                  <input type="date" className={inputCls} value={draft.dateOfBirth} onChange={(e) => set({ dateOfBirth: e.target.value })} />
                </Field>
                <Field label="Blood Group">
                  <select className={inputCls} value={draft.bloodGroup} onChange={(e) => set({ bloodGroup: e.target.value })}>
                    <option value="">— Select —</option>
                    {BLOOD_GROUPS.map((b) => <option key={b} value={b}>{b}</option>)}
                  </select>
                </Field>
                <Field label="Marital Status">
                  <select className={inputCls} value={draft.maritalStatus} onChange={(e) => set({ maritalStatus: e.target.value })}>
                    <option value="">— Select —</option>
                    {MARITAL_STATUSES.map((m) => <option key={m} value={m}>{m}</option>)}
                  </select>
                </Field>
                <Field label="Languages Spoken" full>
                  <input className={inputCls} value={draft.languagesSpoken} onChange={(e) => set({ languagesSpoken: e.target.value })} placeholder="e.g. English, Hindi, Telugu" />
                </Field>
              </Grid>
            </Section>

            <Section title="Personal Contact Information" hint="Private — visible only to the employee and permitted HR/admin roles">
              <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                <AddressBlock title="Home Address" addr={draft.homeAddress} onChange={(p) => setAddr("homeAddress", p)} />
                <div>
                  <label className="mb-2 flex items-center gap-2 text-xs font-medium text-text-secondary">
                    <input type="checkbox" checked={draft.commSameAsHome} onChange={(e) => set({ commSameAsHome: e.target.checked })} className="h-4 w-4 rounded accent-primary-600" />
                    Communication address same as home
                  </label>
                  {!draft.commSameAsHome ? (
                    <AddressBlock title="Communication Address" addr={draft.communicationAddress} onChange={(p) => setAddr("communicationAddress", p)} />
                  ) : (
                    <p className="rounded-[12px] border border-dashed border-border/[0.14] px-4 py-6 text-center text-xs text-text-tertiary">Using the home address above.</p>
                  )}
                </div>
              </div>
              <Grid>
                <Field label="Personal Email">
                  <input className={inputCls} value={draft.personalEmail} onChange={(e) => set({ personalEmail: e.target.value })} placeholder="name@gmail.com" />
                </Field>
                <Field label="Phone">
                  <input className={inputCls} value={draft.phone} onChange={(e) => set({ phone: e.target.value })} placeholder="+91 …" />
                </Field>
              </Grid>
            </Section>

            <Section title="Dependent Information">
              {draft.dependents.map((d, i) => (
                <RepeatRow key={i} onRemove={() => removeAt("dependents", i)}>
                  <input className={inputCls} value={d.name} onChange={(e) => updateAt("dependents", i, { name: e.target.value })} placeholder="Name" />
                  <select className={inputCls} value={d.relationship} onChange={(e) => updateAt("dependents", i, { relationship: e.target.value })}>
                    {RELATIONSHIPS.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                  <input type="date" className={inputCls} value={d.dateOfBirth ?? ""} onChange={(e) => updateAt("dependents", i, { dateOfBirth: e.target.value })} />
                </RepeatRow>
              ))}
              <AddButton label="Add Dependent" onClick={() => addTo("dependents", { name: "", relationship: "Spouse", dateOfBirth: "" })} />
            </Section>

            <Section title="Emergency Information">
              {draft.emergencyContacts.map((c, i) => (
                <RepeatRow key={i} onRemove={() => removeAt("emergencyContacts", i)}>
                  <input className={inputCls} value={c.name} onChange={(e) => updateAt("emergencyContacts", i, { name: e.target.value })} placeholder="Name" />
                  <select className={inputCls} value={c.relationship} onChange={(e) => updateAt("emergencyContacts", i, { relationship: e.target.value })}>
                    {RELATIONSHIPS.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                  <input className={inputCls} value={c.phone} onChange={(e) => updateAt("emergencyContacts", i, { phone: e.target.value })} placeholder="Phone" />
                </RepeatRow>
              ))}
              <AddButton label="Add Emergency Contact" onClick={() => addTo("emergencyContacts", { name: "", relationship: "Parent", phone: "" })} />
            </Section>

            <Section title="Social Profiles">
              {draft.socialProfiles.map((s, i) => (
                <RepeatRow key={i} cols={2} onRemove={() => removeAt("socialProfiles", i)}>
                  <input className={inputCls} value={s.platform} onChange={(e) => updateAt("socialProfiles", i, { platform: e.target.value })} placeholder="e.g. LinkedIn" />
                  <input className={inputCls} value={s.url} onChange={(e) => updateAt("socialProfiles", i, { url: e.target.value })} placeholder="https://…" />
                </RepeatRow>
              ))}
              <AddButton label="Add Social Profile" onClick={() => addTo("socialProfiles", { platform: "LinkedIn", url: "" })} />
            </Section>
          </>
        )}

        {tab === "education" && (
          <>
            <Section title="Summary">
              <Grid>
                <Field label="Total Experience (yrs)">
                  <input type="number" min={0} step="0.5" className={inputCls} value={draft.totalExperience} onChange={(e) => set({ totalExperience: e.target.value })} placeholder="e.g. 4" />
                </Field>
              </Grid>
            </Section>

            <Section title="Work Experience">
              {draft.workExperience.map((w, i) => (
                <RepeatRow key={i} cols={4} onRemove={() => removeAt("workExperience", i)}>
                  <input className={inputCls} value={w.company} onChange={(e) => updateAt("workExperience", i, { company: e.target.value })} placeholder="Company" />
                  <input className={inputCls} value={w.title} onChange={(e) => updateAt("workExperience", i, { title: e.target.value })} placeholder="Title" />
                  <input type="date" className={inputCls} value={w.from ?? ""} onChange={(e) => updateAt("workExperience", i, { from: e.target.value })} />
                  <input type="date" className={inputCls} value={w.to ?? ""} onChange={(e) => updateAt("workExperience", i, { to: e.target.value })} />
                </RepeatRow>
              ))}
              <AddButton label="Add Experience" onClick={() => addTo("workExperience", { company: "", title: "", from: "", to: "" })} />
            </Section>

            <Section title="Education">
              {draft.education.map((ed, i) => (
                <RepeatRow key={i} onRemove={() => removeAt("education", i)}>
                  <input className={inputCls} value={ed.qualification} onChange={(e) => updateAt("education", i, { qualification: e.target.value })} placeholder="Qualification e.g. B.Tech" />
                  <input className={inputCls} value={ed.institution} onChange={(e) => updateAt("education", i, { institution: e.target.value })} placeholder="Institution" />
                  <input className={inputCls} value={ed.year ?? ""} onChange={(e) => updateAt("education", i, { year: e.target.value })} placeholder="Year" />
                </RepeatRow>
              ))}
              <AddButton label="Add Education" onClick={() => addTo("education", { qualification: "", institution: "", year: "" })} />
            </Section>
          </>
        )}

        {tab === "compensation" && (
          <Section title="Compensation" hint="Sensitive — never shown in the global directory">
            <Grid>
              <Field label="Annual CTC">
                <input type="number" min={0} className={inputCls} value={draft.annualCtc} onChange={(e) => set({ annualCtc: e.target.value })} placeholder="e.g. 1800000" />
              </Field>
              <Field label="Currency">
                <select className={inputCls} value={draft.currency} onChange={(e) => set({ currency: e.target.value })}>
                  {CTC_CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </Field>
              <Field label="Pay Frequency">
                <select className={inputCls} value={draft.payFrequency} onChange={(e) => set({ payFrequency: e.target.value })}>
                  {PAY_FREQUENCIES.map((f) => <option key={f} value={f}>{f}</option>)}
                </select>
              </Field>
              <Field label="Effective From">
                <input type="date" className={inputCls} value={draft.ctcEffectiveFrom} onChange={(e) => set({ ctcEffectiveFrom: e.target.value })} />
              </Field>
            </Grid>
          </Section>
        )}
      </div>

    </div>
  );
}

/* ── Presentational helpers ── */

function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-[16px] border border-border/[0.08] bg-surface p-5 shadow-[0_1px_2px_rgba(40,30,90,0.03)] sm:p-6">
      <div className="mb-4 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
        <h3 className="text-sm font-semibold text-text">{title}</h3>
        {hint ? <span className="text-xs text-text-tertiary">· {hint}</span> : null}
      </div>
      {children}
    </section>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">{children}</div>;
}

function Field({ label, required, full, children }: { label: string; required?: boolean; full?: boolean; children: React.ReactNode }) {
  return (
    <div className={full ? "sm:col-span-2" : undefined}>
      <label className={labelCls}>
        {label}
        {required ? <span className="text-rose-500"> *</span> : null}
      </label>
      {children}
    </div>
  );
}

function AddressBlock({ title, addr, onChange }: { title: string; addr: Address; onChange: (p: Partial<Address>) => void }) {
  return (
    <div>
      <p className="mb-2 text-xs font-medium text-text-secondary">{title}</p>
      <div className="space-y-3">
        <input className={inputCls} value={addr.street ?? ""} onChange={(e) => onChange({ street: e.target.value })} placeholder="Street" />
        <div className="grid grid-cols-2 gap-3">
          <input className={inputCls} value={addr.city ?? ""} onChange={(e) => onChange({ city: e.target.value })} placeholder="City" />
          <input className={inputCls} value={addr.state ?? ""} onChange={(e) => onChange({ state: e.target.value })} placeholder="State / Province" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <input className={inputCls} value={addr.country ?? ""} onChange={(e) => onChange({ country: e.target.value })} placeholder="Country" />
          <input className={inputCls} value={addr.zip ?? ""} onChange={(e) => onChange({ zip: e.target.value })} placeholder="Zip / Postal code" />
        </div>
      </div>
    </div>
  );
}

function RepeatRow({ children, onRemove, cols = 3 }: { children: React.ReactNode; onRemove: () => void; cols?: number }) {
  return (
    <div className="mb-3 flex items-start gap-2">
      <div className={cn("grid flex-1 gap-3", cols === 2 ? "sm:grid-cols-2" : cols === 4 ? "sm:grid-cols-4" : "sm:grid-cols-3")}>
        {children}
      </div>
      <button
        type="button"
        onClick={onRemove}
        className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] text-text-tertiary transition-colors hover:bg-rose-500/10 hover:text-rose-500"
        aria-label="Remove"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

function AddButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="inline-flex items-center gap-1.5 rounded-[10px] px-2 py-1.5 text-sm font-medium text-primary-700 transition-colors hover:bg-primary-50">
      <Plus className="h-4 w-4" /> {label}
    </button>
  );
}

import { addDays, format, parseISO } from "date-fns";
import { MOCK_EMPLOYEES, type Employee } from "./orgData";

/**
 * Directory / employee-record model.
 *
 * Identity + reporting live on the `Employee` record (orgStore — the org chart's
 * source of truth). Everything richer — employment metadata, personal details,
 * assets, documents, leave adjustments, project allocations and the audit trail —
 * lives here and is keyed by employee id, so the Directory can act as the shared
 * "employee operating record" without duplicating the org identity.
 */

/** Fixed reference "today" so all generated dates are deterministic + SSR-safe. */
export const DIR_TODAY = "2026-08-24";
const TODAY = parseISO(DIR_TODAY);

/* ── Enumerations + display config ── */

export type EmploymentType = "full-time" | "part-time" | "contract" | "intern";
export type WorkMode = "office" | "hybrid" | "remote";

/** Richer lifecycle status than the org chart's active/inactive.
 *  active / on-leave / notice-period all resolve from an *active* org record;
 *  inactive is a leaver. There is no separate pre-joiner state. */
export type EmploymentStatus = "active" | "on-leave" | "notice-period" | "inactive";

export const EMPLOYMENT_TYPES: { id: EmploymentType; label: string }[] = [
  { id: "full-time", label: "Full-time" },
  { id: "part-time", label: "Part-time" },
  { id: "contract", label: "Contract" },
  { id: "intern", label: "Intern" },
];

export const WORK_MODES: { id: WorkMode; label: string }[] = [
  { id: "office", label: "Office" },
  { id: "hybrid", label: "Hybrid" },
  { id: "remote", label: "Remote" },
];

export const EMPLOYMENT_STATUS: Record<EmploymentStatus, { label: string; color: string }> = {
  active: { label: "Active", color: "#10B981" },
  "on-leave": { label: "On Leave", color: "#F59E0B" },
  "notice-period": { label: "Notice Period", color: "#FB7185" },
  inactive: { label: "Inactive", color: "#94A3B8" },
};

export function employmentTypeLabel(id: EmploymentType): string {
  return EMPLOYMENT_TYPES.find((t) => t.id === id)?.label ?? id;
}
export function workModeLabel(id: WorkMode): string {
  return WORK_MODES.find((t) => t.id === id)?.label ?? id;
}

/* ── Extended employee record ── */

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
}

/** A postal address, reused for home + communication addresses. */
export interface Address {
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  zip?: string;
}

export interface Dependent {
  name: string;
  relationship: string;
  dateOfBirth?: string;
}

export interface SocialProfile {
  platform: string;
  url: string;
}

export interface EducationEntry {
  qualification: string;
  institution: string;
  year?: string;
}

export interface WorkExperienceEntry {
  company: string;
  title: string;
  from?: string;
  to?: string;
}

export interface EmployeeProfileExtra {
  employeeCode: string; // ZES-1048
  team: string;
  employmentType: EmploymentType;
  workMode: WorkMode;
  employmentStatus: EmploymentStatus;
  joiningDate: string; // yyyy-MM-dd
  confirmationDate?: string;
  noticePeriodDays: number;
  workLocation: string;
  phone: string;
  personalEmail: string;
  dateOfBirth: string;
  gender: string;
  preferredName?: string;
  currentAddress: string;
  permanentAddress: string;
  emergencyContact: EmergencyContact;

  /* ── Identity (captured in full-page setup) ── */
  middleName?: string;
  displayName?: string;
  workCountry?: string;
  nationality?: string;

  /* ── Organisational ── */
  legalEntity?: string;
  businessUnit?: string;
  primaryTeam?: string;
  additionalTeams?: string[];
  level?: string;
  costCenter?: string;
  /** Flags this person as a people manager — makes them selectable as a reporting manager for others. */
  isManager?: boolean;
  /** Optional secondary reporting manager, in addition to the primary managerId. */
  additionalManagerId?: string;
  secondaryJobTitle?: string;
  timeType?: string; // Full Time / Part Time (display label)
  workerType?: string; // Permanent / Contract / … (a.k.a. employment terms)

  /* ── Employment terms + additional work info ── */
  probationPolicy?: string;
  probationStartDate?: string;
  probationEndDate?: string;
  shift?: string;
  idCardNumber?: string;

  /* ── Personal ── */
  bloodGroup?: string;
  maritalStatus?: string;
  languagesSpoken?: string;
  homeAddress?: Address;
  communicationAddress?: Address;
  dependents?: Dependent[];
  emergencyContacts?: EmergencyContact[];
  socialProfiles?: SocialProfile[];

  /* ── Employment & Education ── */
  totalExperienceYears?: number;
  previousEmployer?: string;
  highestQualification?: string;
  institution?: string;
  education?: EducationEntry[];
  workExperience?: WorkExperienceEntry[];

  /* ── Compensation (sensitive — surfaced only to permitted roles) ── */
  annualCtc?: number;
  ctcCurrency?: string;
  payFrequency?: string;
  ctcEffectiveFrom?: string;
}

/* ── Detailed-setup option sets ── */

export const EMPLOYMENT_TERMS = ["Permanent", "Fixed-term", "Probationary", "Consultant"];
export const WORKER_TYPES = ["Permanent", "Contract", "Temporary", "Consultant", "Intern"];
export const TIME_TYPES = ["Full Time", "Part Time"];
export const PAY_FREQUENCIES = ["Monthly", "Bi-weekly", "Annual"];
export const CTC_CURRENCIES = ["INR", "USD", "EUR", "GBP", "SGD", "AED"];

export const WORK_COUNTRIES = ["India", "United States", "United Kingdom", "Singapore", "United Arab Emirates", "Germany", "Australia"];
export const NATIONALITIES = ["Indian", "American", "British", "Singaporean", "Emirati", "German", "Australian", "Other"];
export const GENDERS = ["Female", "Male", "Non-binary", "Prefer not to say"];
export const MARITAL_STATUSES = ["Single", "Married", "Divorced", "Widowed"];
export const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];

export const LEGAL_ENTITIES = ["Zessta Software Services Pvt Ltd", "Zessta Inc (US)", "Zessta UK Ltd"];
export const BUSINESS_UNITS = ["Products", "Services", "Platform", "Corporate"];
export const LEVELS = ["L1 — Associate", "L2 — Executive", "L3 — Senior", "L4 — Lead", "L5 — Manager", "L6 — Director"];
export const COST_CENTERS = ["CC-ENG", "CC-PROD", "CC-DES", "CC-SALES", "CC-MKT", "CC-HR", "CC-OPS"];
export const SHIFTS = ["General (9:30–18:30)", "Morning (6:00–14:00)", "Evening (14:00–22:00)", "Night (22:00–06:00)"];
export const PROBATION_POLICIES = ["Default Probation Policy (6 months)", "3 months", "None"];
export const NOTICE_PERIODS = ["Default Notice Period (3 months)", "1 month", "2 months", "None"];
export const RELATIONSHIPS = ["Spouse", "Parent", "Child", "Sibling", "Friend", "Other"];

/** Sub-departments (teams) available for a given department. */
export function teamsForDepartment(dept: string): string[] {
  return TEAMS_BY_DEPT[dept] ?? [];
}

/* ── Assets ── */

export type AssetCategory = "Laptop" | "Monitor" | "Phone" | "Access Card" | "Accessory";
export type AssetCondition = "New" | "Good" | "Fair" | "Poor";
export type AssetStatus = "assigned" | "returned" | "repair" | "lost" | "retired";

export const ASSET_CATEGORIES: AssetCategory[] = ["Laptop", "Monitor", "Phone", "Access Card", "Accessory"];
export const ASSET_CONDITIONS: AssetCondition[] = ["New", "Good", "Fair", "Poor"];
export const ASSET_STATUS: Record<AssetStatus, { label: string; color: string }> = {
  assigned: { label: "Assigned", color: "#10B981" },
  returned: { label: "Returned", color: "#94A3B8" },
  repair: { label: "In Repair", color: "#F59E0B" },
  lost: { label: "Lost", color: "#EF4444" },
  retired: { label: "Retired", color: "#64748B" },
};

export type AssetEventKind = "assigned" | "transferred" | "condition" | "returned" | "reassigned";

export interface AssetEvent {
  id: string;
  at: string;
  kind: AssetEventKind;
  detail: string;
  byId?: string;
}

export interface Asset {
  id: string;
  employeeId: string;
  name: string;
  category: AssetCategory;
  assetId: string; // ZES-LAP-0198
  manufacturer?: string;
  model?: string;
  serialNumber?: string;
  assignedDate: string;
  assignedById: string;
  condition: AssetCondition;
  warrantyExpiry?: string;
  status: AssetStatus;
  notes?: string;
  /** True when the employee registered this asset themselves (self-service) rather than an admin assigning it. */
  selfReported?: boolean;
  history: AssetEvent[];
}

/* ── Asset requests (self-service) ── */

export type AssetRequestKind = "new" | "change";
export type AssetRequestStatus = "pending" | "approved" | "rejected" | "fulfilled";

export const ASSET_REQUEST_STATUS: Record<AssetRequestStatus, { label: string; color: string }> = {
  pending: { label: "Pending", color: "#F59E0B" },
  approved: { label: "Approved", color: "#0F9E6E" },
  rejected: { label: "Rejected", color: "#E11D48" },
  fulfilled: { label: "Fulfilled", color: "#10B981" },
};

/**
 * Catalog an employee may request from. Deliberately narrow — only the everyday
 * hardware an employee self-services. Each maps to an existing AssetCategory.
 */
export const REQUESTABLE_ASSETS: { label: string; category: AssetCategory }[] = [
  { label: "Laptop", category: "Laptop" },
  { label: "Monitor", category: "Monitor" },
  { label: "Phone", category: "Phone" },
  { label: "Laptop Charger", category: "Accessory" },
];

/** Categories an employee may request a replacement/change for. */
export const REQUESTABLE_CATEGORIES: AssetCategory[] = ["Laptop", "Monitor", "Phone", "Accessory"];

export interface AssetRequest {
  id: string;
  employeeId: string;
  kind: AssetRequestKind;
  /** Human label, e.g. "Laptop Charger" (may differ from the mapped category). */
  label: string;
  category: AssetCategory;
  /** For change requests — the asset the employee wants replaced/serviced. */
  currentAssetId?: string;
  reason: string;
  status: AssetRequestStatus;
  createdAt: string;
  decidedById?: string;
  decidedAt?: string;
  note?: string;
}

/* ── Documents ── */

export type DocumentGroup = "personal" | "employment" | "company";
export type DocumentStatus = "valid" | "expiring" | "expired" | "pending";

export const DOCUMENT_GROUPS: { id: DocumentGroup; label: string }[] = [
  { id: "personal", label: "Personal Documents" },
  { id: "employment", label: "Employment Documents" },
  { id: "company", label: "Company Documents" },
];

export interface EmployeeDocument {
  id: string;
  employeeId: string;
  name: string;
  group: DocumentGroup;
  category: string;
  uploadedById: string;
  uploadedAt: string;
  expiry?: string;
  status: DocumentStatus;
  /** Whether normal employees may see it (private → HR/admin only). */
  private?: boolean;
}

/** Recompute a document's status from its expiry vs. today. */
export function documentStatus(expiry?: string): DocumentStatus {
  if (!expiry) return "valid";
  const days = Math.round((parseISO(expiry).getTime() - TODAY.getTime()) / 86_400_000);
  if (days < 0) return "expired";
  if (days <= 60) return "expiring";
  return "valid";
}

export function daysUntil(dateIso?: string): number | null {
  if (!dateIso) return null;
  return Math.round((parseISO(dateIso).getTime() - TODAY.getTime()) / 86_400_000);
}

/* ── Project allocations ── */

export interface ProjectAllocation {
  id: string;
  employeeId: string;
  projectId: string;
  role: string;
  allocationPct: number;
  billable: boolean;
  startDate: string;
  endDate?: string;
  trackedHours: number;
  status: "active" | "completed";
}

/* ── Leave adjustments (audit) ── */

export interface LeaveAdjustment {
  id: string;
  employeeId: string;
  leaveTypeId: string;
  delta: number; // + add / − deduct
  previousBalance: number;
  newBalance: number;
  effectiveDate: string;
  reason: string;
  notes?: string;
  byId: string;
  at: string;
}

/* ── Activity / audit timeline ── */

export type ActivityCategory = "job" | "attendance" | "leave" | "projects" | "documents" | "assets" | "general";

export const ACTIVITY_FILTERS: { id: "all" | ActivityCategory; label: string }[] = [
  { id: "all", label: "All" },
  { id: "job", label: "Job" },
  { id: "attendance", label: "Attendance" },
  { id: "leave", label: "Leave" },
  { id: "projects", label: "Projects" },
  { id: "documents", label: "Documents" },
];

export interface ActivityEvent {
  id: string;
  employeeId: string;
  category: ActivityCategory;
  title: string;
  detail?: string;
  byId?: string;
  at: string; // ISO
}

/* ─────────────────────────────────────────────────────────────
   Deterministic seed generation
   ───────────────────────────────────────────────────────────── */

function hash(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return h;
}
const pick = <T,>(arr: T[], seed: string): T => arr[hash(seed) % arr.length];

const TEAMS_BY_DEPT: Record<string, string[]> = {
  Executive: ["Leadership"],
  Engineering: ["Platform", "Frontend", "Backend", "Infrastructure", "Mobile"],
  Product: ["Core Product", "Growth", "Research"],
  Design: ["Product Design", "Brand", "UX Research"],
  Marketing: ["Content", "Performance", "Brand"],
  Sales: ["Enterprise", "SMB", "Partnerships"],
  HR: ["People Ops", "Talent"],
  Operations: ["Workplace", "Finance Ops"],
};

const CITIES: Record<string, string> = {
  Hyderabad: "Hyderabad, India",
  Bengaluru: "Bengaluru, India",
  "San Francisco": "San Francisco, USA",
  "New York": "New York, USA",
  London: "London, UK",
  Berlin: "Berlin, Germany",
  Singapore: "Singapore",
  Madrid: "Madrid, Spain",
  Dubai: "Dubai, UAE",
  Tokyo: "Tokyo, Japan",
  Munich: "Munich, Germany",
  Milan: "Milan, Italy",
  Tehran: "Tehran, Iran",
  Seoul: "Seoul, South Korea",
  "Mexico City": "Mexico City, Mexico",
  Vienna: "Vienna, Austria",
  Osaka: "Osaka, Japan",
};

const FIRST_NAMES_EMERGENCY = ["Alex", "Sam", "Jordan", "Riya", "Noah", "Maya", "Leo", "Zara", "Ivan", "Nina"];

function isoDaysAgo(days: number): string {
  return format(addDays(TODAY, -days), "yyyy-MM-dd");
}
function isoAt(days: number): string {
  return addDays(TODAY, days).toISOString();
}

/** Build the extended record for a real employee, deterministically. */
export function buildExtra(emp: Employee, index: number): EmployeeProfileExtra {
  const h = hash(emp.id);
  const code = `ZES-${1001 + index}`;
  const teams = TEAMS_BY_DEPT[emp.department] ?? ["General"];
  const team = teams[h % teams.length];
  const empType: EmploymentType =
    emp.id === "eng5" ? "contract" : (["full-time", "full-time", "full-time", "part-time", "intern", "contract"][h % 6] as EmploymentType);
  const workMode: WorkMode = (["office", "hybrid", "remote", "hybrid", "office"][h % 5] as WorkMode);
  const joinYearsAgo = 1 + (h % 5);
  const joiningDate = format(addDays(parseISO(`${2026 - joinYearsAgo}-01-01`), (h % 300)), "yyyy-MM-dd");
  const confirmed = empType !== "intern" && empType !== "contract";

  // Lifecycle status: inactive employees stay inactive; a couple are on-leave /
  // notice period for a realistic mix.
  let employmentStatus: EmploymentStatus = "active";
  if (emp.status === "inactive") employmentStatus = "inactive";
  else if (h % 11 === 0) employmentStatus = "on-leave";
  else if (h % 17 === 0) employmentStatus = "notice-period";

  const loc = emp.location ?? "Hyderabad";
  const city = CITIES[loc] ?? `${loc}`;

  return {
    employeeCode: code,
    team,
    employmentType: empType,
    workMode,
    employmentStatus,
    joiningDate,
    confirmationDate: confirmed ? format(addDays(parseISO(joiningDate), 180), "yyyy-MM-dd") : undefined,
    noticePeriodDays: empType === "intern" ? 15 : empType === "contract" ? 30 : 60,
    workLocation: emp.location ? `${emp.location} Office` : "Hyderabad HQ",
    phone: `+91 ${90000 + (h % 9999)} ${10000 + (h % 89999)}`.slice(0, 17),
    personalEmail: `${emp.name.split(" ")[0].toLowerCase()}.${emp.id}@gmail.com`,
    dateOfBirth: format(addDays(parseISO(`${1988 + (h % 12)}-01-01`), h % 360), "yyyy-MM-dd"),
    gender: GENDERS[h % GENDERS.length],
    preferredName: emp.name.split(" ")[0],
    currentAddress: `${100 + (h % 800)}, ${["Green Meadows", "Lake View", "Palm Residency", "Cedar Court", "Hill Crest"][h % 5]}, ${city}`,
    permanentAddress: `${10 + (h % 90)}, ${["Rose Lane", "Maple Street", "Sunrise Colony", "Orchid Enclave"][h % 4]}, ${city}`,
    emergencyContact: {
      name: `${FIRST_NAMES_EMERGENCY[h % FIRST_NAMES_EMERGENCY.length]} ${emp.name.split(" ").slice(-1)[0]}`,
      relationship: RELATIONSHIPS[h % RELATIONSHIPS.length],
      phone: `+91 ${80000 + (h % 9999)} ${20000 + (h % 79999)}`.slice(0, 17),
    },
  };
}

const ASSET_CODE_PREFIX: Record<AssetCategory, string> = {
  Laptop: "LAP",
  Monitor: "MON",
  Phone: "PHN",
  "Access Card": "CRD",
  Accessory: "ACC",
};

const LAPTOPS = [
  { name: 'MacBook Pro 14"', manufacturer: "Apple", model: "MacBookPro18,3" },
  { name: 'MacBook Air 13"', manufacturer: "Apple", model: "MacBookAir10,1" },
  { name: "ThinkPad X1 Carbon", manufacturer: "Lenovo", model: "Gen 11" },
  { name: "Dell XPS 15", manufacturer: "Dell", model: "9520" },
];
const MONITORS = [
  { name: "Dell UltraSharp 27", manufacturer: "Dell", model: "U2723QE" },
  { name: 'LG 27" 4K', manufacturer: "LG", model: "27UP850" },
];
const PHONES = [
  { name: "iPhone 15", manufacturer: "Apple", model: "A3090" },
  { name: "Pixel 8", manufacturer: "Google", model: "GKWS6" },
];

function makeAsset(emp: Employee, extra: EmployeeProfileExtra, category: AssetCategory, n: number): Asset {
  const h = hash(emp.id + category + n);
  const spec =
    category === "Laptop" ? LAPTOPS[h % LAPTOPS.length] :
    category === "Monitor" ? MONITORS[h % MONITORS.length] :
    category === "Phone" ? PHONES[h % PHONES.length] :
    category === "Access Card" ? { name: `Access Card #${extra.employeeCode.split("-")[1]}`, manufacturer: "HID", model: "iCLASS" } :
    { name: pick(["USB-C Dock", "Wireless Keyboard", "Noise-cancelling Headset"], emp.id + n), manufacturer: "Logitech", model: "MX" };
  const assetId = `ZES-${ASSET_CODE_PREFIX[category]}-${String(100 + (h % 900))}`;
  const assignedDate = extra.joiningDate;
  return {
    id: `as_${emp.id}_${category}_${n}`,
    employeeId: emp.id,
    name: spec.name,
    category,
    assetId,
    manufacturer: spec.manufacturer,
    model: spec.model,
    serialNumber: category === "Access Card" ? undefined : `C02${String(h).padStart(7, "0").slice(0, 7).toUpperCase()}`,
    assignedDate,
    assignedById: "hrhead",
    condition: (["New", "Good", "Good", "Fair"][h % 4] as AssetCondition),
    warrantyExpiry: category === "Access Card" || category === "Accessory" ? undefined : format(addDays(parseISO(assignedDate), 730), "yyyy-MM-dd"),
    status: "assigned",
    history: [
      { id: `ae_${emp.id}_${category}_${n}_1`, at: `${assignedDate}T09:00:00.000Z`, kind: "assigned", detail: `Assigned to ${emp.name}`, byId: "hrhead" },
      { id: `ae_${emp.id}_${category}_${n}_2`, at: isoAt(-10), kind: "condition", detail: `Condition verified: ${["New", "Good", "Good", "Fair"][h % 4]}`, byId: "hrhead" },
    ],
  };
}

export function seedAssets(employees: Employee[]): Asset[] {
  const out: Asset[] = [];
  employees.forEach((emp) => {
    const extra = buildExtra(emp, employees.indexOf(emp));
    if (extra.employmentStatus === "inactive") return;
    const h = hash(emp.id);
    out.push(makeAsset(emp, extra, "Laptop", 1));
    if (h % 3 !== 0) out.push(makeAsset(emp, extra, "Monitor", 1));
    if (h % 4 === 0) out.push(makeAsset(emp, extra, "Phone", 1));
    out.push(makeAsset(emp, extra, "Access Card", 1));
    if (h % 5 === 0) out.push(makeAsset(emp, extra, "Accessory", 1));
  });
  return out;
}

const BASE_DOCS: { name: string; group: DocumentGroup; category: string; private?: boolean; expiryDays?: number }[] = [
  { name: "Offer Letter", group: "employment", category: "Offer" },
  { name: "Employment Contract", group: "employment", category: "Contract" },
  { name: "NDA", group: "employment", category: "Agreement" },
  { name: "ID Proof (Passport)", group: "personal", category: "Identity", private: true },
  { name: "Address Proof", group: "personal", category: "Identity", private: true },
  { name: "Employee Handbook", group: "company", category: "Policy" },
  { name: "Code of Conduct Acknowledgement", group: "company", category: "Policy" },
];

export function seedDocuments(employees: Employee[]): EmployeeDocument[] {
  const out: EmployeeDocument[] = [];
  employees.forEach((emp) => {
    const extra = buildExtra(emp, employees.indexOf(emp));
    const h = hash(emp.id);
    BASE_DOCS.forEach((d, i) => {
      out.push({
        id: `doc_${emp.id}_${i}`,
        employeeId: emp.id,
        name: d.name,
        group: d.group,
        category: d.category,
        uploadedById: "hrhead",
        uploadedAt: extra.joiningDate,
        private: d.private,
        status: "valid",
      });
    });
    // A couple of expiring docs so warnings are visible.
    if (h % 2 === 0) {
      const expiry = isoDaysAgo(-(20 + (h % 40)));
      out.push({ id: `doc_${emp.id}_pp`, employeeId: emp.id, name: "Passport", group: "personal", category: "Identity", uploadedById: "hrhead", uploadedAt: extra.joiningDate, expiry, status: documentStatus(expiry), private: true });
    }
    if (h % 3 === 0) {
      const expiry = isoDaysAgo(-(45 + (h % 30)));
      out.push({ id: `doc_${emp.id}_cert`, employeeId: emp.id, name: "AWS Certification", group: "personal", category: "Certificate", uploadedById: emp.id, uploadedAt: isoDaysAgo(300), expiry, status: documentStatus(expiry) });
    }
  });
  return out;
}

const PROJECT_POOL: Record<string, { id: string; name: string; client?: string }[]> = {
  Engineering: [
    { id: "zecode", name: "ZeCode" },
    { id: "atlas", name: "Atlas Platform", client: "Atlas Robotics" },
    { id: "meridian", name: "Meridian Care", client: "Meridian Health" },
  ],
  Product: [
    { id: "zecode", name: "ZeCode" },
    { id: "zemeet", name: "ZeMeet" },
  ],
  Design: [
    { id: "zemeet", name: "ZeMeet" },
    { id: "atlas", name: "Atlas Platform", client: "Atlas Robotics" },
  ],
  Marketing: [{ id: "internal", name: "Brand & Growth" }],
  Sales: [{ id: "meridian", name: "Meridian Care", client: "Meridian Health" }],
  HR: [{ id: "internal", name: "People Ops" }],
  Executive: [{ id: "internal", name: "Company Strategy" }],
  Operations: [{ id: "internal", name: "Workplace Ops" }],
};

const ROLES_BY_DEPT: Record<string, string[]> = {
  Engineering: ["Contributor", "Tech Lead", "Reviewer"],
  Product: ["Product Owner", "Contributor"],
  Design: ["Lead Designer", "Contributor"],
  Marketing: ["Contributor"],
  Sales: ["Account Owner"],
  HR: ["Coordinator"],
  Executive: ["Sponsor"],
  Operations: ["Coordinator"],
};

export function seedAllocations(employees: Employee[]): ProjectAllocation[] {
  const out: ProjectAllocation[] = [];
  employees.forEach((emp) => {
    const extra = buildExtra(emp, employees.indexOf(emp));
    if (extra.employmentStatus === "inactive") return;
    const h = hash(emp.id);
    const pool = PROJECT_POOL[emp.department] ?? [{ id: "internal", name: "Internal" }];
    const roles = ROLES_BY_DEPT[emp.department] ?? ["Contributor"];
    const count = 1 + (h % 2); // 1–2 current projects
    for (let i = 0; i < count && i < pool.length; i++) {
      const p = pool[(h + i) % pool.length];
      out.push({
        id: `al_${emp.id}_${i}`,
        employeeId: emp.id,
        projectId: p.id,
        role: roles[(h + i) % roles.length],
        allocationPct: [50, 40, 100, 60, 30][(h + i) % 5],
        billable: Boolean(p.client),
        startDate: isoDaysAgo(120 + (h % 200)),
        trackedHours: 40 + ((h + i * 17) % 320),
        status: "active",
      });
    }
    // One completed project for history.
    if (h % 2 === 0) {
      const p = pool[(h + 1) % pool.length];
      out.push({
        id: `al_${emp.id}_prev`,
        employeeId: emp.id,
        projectId: p.id,
        role: roles[h % roles.length],
        allocationPct: 100,
        billable: Boolean(p.client),
        startDate: isoDaysAgo(520),
        endDate: isoDaysAgo(200),
        trackedHours: 300 + (h % 400),
        status: "completed",
      });
    }
  });
  return out;
}

export function projectName(projectId: string, department?: string): string {
  for (const dept in PROJECT_POOL) {
    const found = PROJECT_POOL[dept].find((p) => p.id === projectId);
    if (found) return found.name;
  }
  return projectId;
}
export function projectClient(projectId: string): string | undefined {
  for (const dept in PROJECT_POOL) {
    const found = PROJECT_POOL[dept].find((p) => p.id === projectId);
    if (found?.client) return found.client;
  }
  return undefined;
}
export const ALL_PROJECTS = Array.from(
  new Map(Object.values(PROJECT_POOL).flat().map((p) => [p.id, p])).values(),
);

export function seedActivity(employees: Employee[]): ActivityEvent[] {
  const out: ActivityEvent[] = [];
  employees.forEach((emp) => {
    const extra = buildExtra(emp, employees.indexOf(emp));
    const h = hash(emp.id);
    const created = `${extra.joiningDate}T09:00:00.000Z`;
    out.push({ id: `act_${emp.id}_1`, employeeId: emp.id, category: "general", title: "Employee created", detail: `${emp.name} added to the directory`, byId: "hrhead", at: created });
    out.push({ id: `act_${emp.id}_2`, employeeId: emp.id, category: "general", title: "Employee activated", detail: "Onboarding completed", byId: "hrhead", at: `${extra.joiningDate}T10:30:00.000Z` });
    out.push({ id: `act_${emp.id}_4`, employeeId: emp.id, category: "projects", title: "Project assigned", detail: `${(PROJECT_POOL[emp.department] ?? ALL_PROJECTS)[0]?.name ?? "Internal"} · Allocation ${[50, 100, 40][h % 3]}%`, byId: "hrhead", at: `${extra.joiningDate}T11:00:00.000Z` });
    if (h % 3 === 0) out.push({ id: `act_${emp.id}_5`, employeeId: emp.id, category: "attendance", title: "Attendance corrected", detail: "Check-out time adjusted", byId: "hrhead", at: isoAt(-(1 + (h % 10))) });
  });
  return out;
}

/* ── Build the full initial extras map for the store seed ── */
export function seedExtras(employees: Employee[]): Record<string, EmployeeProfileExtra> {
  const map: Record<string, EmployeeProfileExtra> = {};
  employees.forEach((emp, i) => {
    map[emp.id] = buildExtra(emp, i);
  });
  return map;
}

/**
 * A handful of in-flight asset requests so the Assets → Requests queue has
 * something to triage on first load. A mix of pending (actionable) plus one
 * approved and one rejected for history.
 */
export const SEED_ASSET_REQUESTS: AssetRequest[] = [
  { id: "areq_seed_1", employeeId: "eng2", kind: "new", label: "Monitor", category: "Monitor", reason: "Second display for reviewing code and debugging side-by-side.", status: "pending", createdAt: isoAt(-2) },
  { id: "areq_seed_2", employeeId: "des2", kind: "new", label: "Laptop", category: "Laptop", reason: "Current machine can't run the latest design tooling smoothly.", status: "pending", createdAt: isoAt(-1) },
  { id: "areq_seed_3", employeeId: "eng3", kind: "change", label: "Laptop", category: "Laptop", reason: "Battery drains within an hour — needs servicing or replacement.", status: "pending", createdAt: isoAt(-4) },
  { id: "areq_seed_4", employeeId: "hr1", kind: "new", label: "Laptop Charger", category: "Accessory", reason: "Spare charger for the Osaka office desk.", status: "pending", createdAt: isoAt(-1) },
  { id: "areq_seed_5", employeeId: "mkt1", kind: "new", label: "Phone", category: "Phone", reason: "Dedicated work phone for campaign coordination and on-call.", status: "approved", createdAt: isoAt(-9), decidedById: "hrhead", decidedAt: isoAt(-7), note: "Approved — procurement in progress." },
  { id: "areq_seed_6", employeeId: "prod1", kind: "new", label: "Monitor", category: "Monitor", reason: "Ultrawide for roadmap planning boards.", status: "rejected", createdAt: isoAt(-12), decidedById: "hrhead", decidedAt: isoAt(-10), note: "Budget deferred to next quarter." },
];

/* ── Convenience: initial seeds bound to the mock roster ── */
export const SEED_EXTRAS = seedExtras(MOCK_EMPLOYEES);
export const SEED_ASSETS = seedAssets(MOCK_EMPLOYEES);
export const SEED_DOCUMENTS = seedDocuments(MOCK_EMPLOYEES);
export const SEED_ALLOCATIONS = seedAllocations(MOCK_EMPLOYEES);
export const SEED_ACTIVITY = seedActivity(MOCK_EMPLOYEES);

export type EmployeeStatus = "active" | "inactive";

/** Flat employee record. The tree is derived from `managerId`. */
export interface Employee {
  id: string;
  name: string;
  email: string;
  jobTitle: string;
  department: string;
  location?: string;
  /** Optional profile photo. When absent, a colored initials avatar is shown. */
  avatarUrl?: string;
  status: EmployeeStatus;
  /** Primary manager — defines the visible tree hierarchy. */
  managerId?: string;
  /** Secondary relationships — shown in the details panel, never branch the tree. */
  additionalManagerId?: string;
  hrManagerId?: string;
  headId?: string;
}

/** A node in the derived hierarchy (Employee + resolved children). */
export interface EmployeeNode extends Employee {
  children: EmployeeNode[];
}

export interface Department {
  name: string;
  /** Pastel indicator color (matches the app's chart palette). */
  color: string;
  /** Sub-departments (teams) under this department, e.g. Design → UX Research. */
  subDepartments: string[];
}

export const DEPARTMENTS: Department[] = [
  { name: "Executive", color: "#8B7CF6", subDepartments: ["Leadership"] },
  { name: "Engineering", color: "#7DD3FC", subDepartments: ["Platform", "Frontend", "Backend", "Infrastructure", "Mobile"] },
  { name: "Product", color: "#6EE7B7", subDepartments: ["Core Product", "Growth", "Research"] },
  { name: "Design", color: "#F9A8D4", subDepartments: ["Product Design", "Brand", "UX Research"] },
  { name: "Marketing", color: "#FDBA74", subDepartments: ["Content", "Performance", "Brand"] },
  { name: "Sales", color: "#C4B5FD", subDepartments: ["Enterprise", "SMB", "Partnerships"] },
  { name: "HR", color: "#93C5FD", subDepartments: ["People Ops", "Talent"] },
  { name: "Operations", color: "#A7F3D0", subDepartments: ["Workplace", "Finance Ops"] },
];

/** Pastel palette used to auto-assign colors to newly created departments. */
export const DEPARTMENT_PALETTE = [
  "#8B7CF6", "#7DD3FC", "#6EE7B7", "#F9A8D4", "#FDBA74", "#C4B5FD",
  "#93C5FD", "#A7F3D0", "#FCD34D", "#FDA4AF", "#5EEAD4", "#C7D2FE",
];

export function departmentColor(name: string, departments: Department[] = DEPARTMENTS): string {
  return departments.find((d) => d.name === name)?.color ?? "#C7D2FE";
}

export const MOCK_EMPLOYEES: Employee[] = [
  { id: "ceo", name: "Alexandra Reeve", email: "alexandra.reeve@zessta.com", jobTitle: "Chief Executive Officer", department: "Executive", location: "San Francisco", status: "active" },

  { id: "cto", name: "Marcus Chen", email: "marcus.chen@zessta.com", jobTitle: "VP Engineering", department: "Engineering", location: "San Francisco", avatarUrl: "https://i.pravatar.cc/150?img=13", status: "active", managerId: "ceo", hrManagerId: "hrhead" },
  { id: "cpo", name: "Priya Nair", email: "priya.nair@zessta.com", jobTitle: "VP Product", department: "Product", location: "New York", avatarUrl: "https://i.pravatar.cc/150?img=45", status: "active", managerId: "ceo", hrManagerId: "hrhead" },
  { id: "cmo", name: "Daniel Okafor", email: "daniel.okafor@zessta.com", jobTitle: "VP Marketing", department: "Marketing", location: "London", status: "active", managerId: "ceo", hrManagerId: "hrhead" },
  { id: "hrhead", name: "Sara Lindqvist", email: "sara.lindqvist@zessta.com", jobTitle: "Head of People", department: "HR", location: "Berlin", status: "active", managerId: "ceo", headId: "ceo" },

  { id: "eng1", name: "Irfan Alisha", email: "irfan.alisha@zessta.com", jobTitle: "Engineering Manager", department: "Engineering", location: "Hyderabad", status: "active", managerId: "cto", hrManagerId: "hrhead", headId: "cto" },
  { id: "eng2", name: "Wei Zhang", email: "wei.zhang@zessta.com", jobTitle: "Staff Engineer", department: "Engineering", location: "Singapore", avatarUrl: "https://i.pravatar.cc/150?img=12", status: "active", managerId: "cto" },
  { id: "eng3", name: "Tomás Herrera", email: "tomas.herrera@zessta.com", jobTitle: "Senior Engineer", department: "Engineering", location: "Madrid", status: "active", managerId: "eng1", additionalManagerId: "eng2", hrManagerId: "hrhead" },
  { id: "eng4", name: "Nadia Haddad", email: "nadia.haddad@zessta.com", jobTitle: "Frontend Engineer", department: "Engineering", location: "Dubai", status: "active", managerId: "eng1", hrManagerId: "hrhead" },
  { id: "eng5", name: "Kenji Watanabe", email: "kenji.watanabe@zessta.com", jobTitle: "Backend Engineer", department: "Engineering", location: "Tokyo", status: "inactive", managerId: "eng1" },

  { id: "prod1", name: "Lena Fischer", email: "lena.fischer@zessta.com", jobTitle: "Product Manager", department: "Product", location: "Munich", avatarUrl: "https://i.pravatar.cc/150?img=5", status: "active", managerId: "cpo" },
  { id: "des1", name: "Oscar Bennett", email: "oscar.bennett@zessta.com", jobTitle: "Design Lead", department: "Design", location: "London", avatarUrl: "https://i.pravatar.cc/150?img=33", status: "active", managerId: "cpo", headId: "cpo" },
  { id: "des2", name: "Mia Rossi", email: "mia.rossi@zessta.com", jobTitle: "Product Designer", department: "Design", location: "Milan", status: "active", managerId: "des1" },
  { id: "des3", name: "Ali Karimi", email: "ali.karimi@zessta.com", jobTitle: "UX Researcher", department: "Design", location: "Tehran", status: "active", managerId: "des1", additionalManagerId: "prod1" },

  { id: "mkt1", name: "Grace Kim", email: "grace.kim@zessta.com", jobTitle: "Marketing Manager", department: "Marketing", location: "Seoul", status: "active", managerId: "cmo" },
  { id: "sal1", name: "Diego Alvarez", email: "diego.alvarez@zessta.com", jobTitle: "Sales Lead", department: "Sales", location: "Mexico City", status: "active", managerId: "cmo" },
  { id: "mkt2", name: "Hannah Weber", email: "hannah.weber@zessta.com", jobTitle: "Content Strategist", department: "Marketing", location: "Vienna", status: "active", managerId: "mkt1" },

  { id: "hr1", name: "Yuki Tanaka", email: "yuki.tanaka@zessta.com", jobTitle: "HR Business Partner", department: "HR", location: "Osaka", avatarUrl: "https://i.pravatar.cc/150?img=32", status: "active", managerId: "hrhead" },
];

/** Vibrant gradient pairs for initials avatars (deterministic per person). */
const AVATAR_GRADIENTS: [string, string][] = [
  ["#7A4DFF", "#B37DFF"],
  ["#F472B6", "#FB7185"],
  ["#38BDF8", "#6366F1"],
  ["#34D399", "#10B981"],
  ["#FBBF24", "#F59E0B"],
  ["#FB7185", "#F97316"],
  ["#22D3EE", "#3B82F6"],
  ["#A78BFA", "#7C3AED"],
  ["#F43F5E", "#EC4899"],
  ["#14B8A6", "#22D3EE"],
];

function hashString(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
  return Math.abs(h);
}

/** A stable multi-color gradient for an initials avatar, keyed by a seed (id/name). */
export function avatarGradient(seed: string): string {
  const [a, b] = AVATAR_GRADIENTS[hashString(seed) % AVATAR_GRADIENTS.length];
  return `linear-gradient(135deg, ${a}, ${b})`;
}

export function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

/** Build the top-down hierarchy from a flat employee list (roots = no/absent manager). */
export function buildTree(employees: Employee[]): EmployeeNode[] {
  const byId = new Map<string, EmployeeNode>();
  employees.forEach((e) => byId.set(e.id, { ...e, children: [] }));
  const roots: EmployeeNode[] = [];
  byId.forEach((node) => {
    const parent = node.managerId ? byId.get(node.managerId) : undefined;
    if (parent) parent.children.push(node);
    else roots.push(node);
  });
  const sortRec = (nodes: EmployeeNode[]) => {
    nodes.sort((a, b) => a.name.localeCompare(b.name));
    nodes.forEach((n) => sortRec(n.children));
  };
  sortRec(roots);
  return roots;
}

/** Direct-report count for an employee. */
export function directReportCount(employees: Employee[], id: string): number {
  return employees.filter((e) => e.managerId === id).length;
}

/** All descendant ids (the full reporting branch) below an employee. */
export function getDescendantIds(employees: Employee[], id: string): string[] {
  const out: string[] = [];
  const walk = (managerId: string) => {
    employees
      .filter((e) => e.managerId === managerId)
      .forEach((e) => {
        out.push(e.id);
        walk(e.id);
      });
  };
  walk(id);
  return out;
}

/** Ancestor ids from an employee up to the root (nearest first). */
export function getAncestorIds(employees: Employee[], id: string): string[] {
  const byId = new Map(employees.map((e) => [e.id, e]));
  const out: string[] = [];
  let current = byId.get(id)?.managerId;
  const seen = new Set<string>();
  while (current && !seen.has(current)) {
    seen.add(current);
    out.push(current);
    current = byId.get(current)?.managerId;
  }
  return out;
}

/**
 * Whether assigning `newManagerId` as the manager of `employeeId` would create a
 * cycle (new manager is the employee itself or one of its descendants).
 */
export function wouldCreateCycle(employees: Employee[], employeeId: string, newManagerId: string): boolean {
  if (employeeId === newManagerId) return true;
  return getDescendantIds(employees, employeeId).includes(newManagerId);
}

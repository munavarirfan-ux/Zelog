/** Event-level celebration mock data — all dated "today" to exercise grouping. */

export interface CelebrationEmployee {
  id: string;
  name: string;
  role: string;
  department: string;
  photo: string;
  /** Completed years — anniversaries only. */
  years?: number;
}

const pravatar = (n: number) => `https://i.pravatar.cc/160?img=${n}`;

export const BIRTHDAYS_TODAY: CelebrationEmployee[] = [
  { id: "b1", name: "Aisha Khan", role: "Product Designer", department: "Design", photo: pravatar(47) },
  { id: "b2", name: "Rahul Sharma", role: "Senior Engineer", department: "Engineering", photo: pravatar(12) },
  { id: "b3", name: "Priya Reddy", role: "Data Analyst", department: "Analytics", photo: pravatar(45) },
  { id: "b4", name: "Daniel Thomas", role: "Backend Engineer", department: "Engineering", photo: pravatar(13) },
  { id: "b5", name: "Mohammed Faisal", role: "QA Engineer", department: "Engineering", photo: pravatar(15) },
  { id: "b6", name: "Kavya Nair", role: "HR Associate", department: "People", photo: pravatar(32) },
  { id: "b7", name: "Ananya Rao", role: "Marketing Lead", department: "Marketing", photo: pravatar(44) },
  { id: "b8", name: "John Mathew", role: "Sales Manager", department: "Sales", photo: pravatar(51) },
];

export const ANNIVERSARIES_TODAY: CelebrationEmployee[] = [
  { id: "a1", name: "Sarah Joseph", role: "Frontend Engineer", department: "Engineering", photo: pravatar(5), years: 2 },
  { id: "a2", name: "Vikram Rao", role: "Product Manager", department: "Product", photo: pravatar(33), years: 3 },
  { id: "a3", name: "Sneha Kapoor", role: "Design Lead", department: "Design", photo: pravatar(20), years: 5 },
  { id: "a4", name: "Arun Kumar", role: "DevOps Engineer", department: "Engineering", photo: pravatar(60), years: 1 },
  { id: "a5", name: "David George", role: "Account Executive", department: "Sales", photo: pravatar(8), years: 4 },
];

/** A celebration coming up in the next few days (used by the "Upcoming" rows). */
export interface UpcomingCelebration extends CelebrationEmployee {
  /** Human label for when it lands — "Tomorrow", "25 Aug", "Starts Mon". */
  whenLabel: string;
}

export const UPCOMING_BIRTHDAYS: UpcomingCelebration[] = [
  { id: "ub1", name: "Kavya Yakkati", role: "HR Associate", department: "People", photo: pravatar(32), whenLabel: "Tomorrow" },
  { id: "ub2", name: "Swati Jasrotia", role: "Marketing Lead", department: "Marketing", photo: pravatar(44), whenLabel: "Tomorrow" },
  { id: "ub3", name: "Shambhavi Rao", role: "Data Analyst", department: "Analytics", photo: pravatar(45), whenLabel: "25 Aug" },
  { id: "ub4", name: "Rohit Menon", role: "Backend Engineer", department: "Engineering", photo: pravatar(13), whenLabel: "27 Aug" },
];

export const UPCOMING_ANNIVERSARIES: UpcomingCelebration[] = [
  { id: "ua1", name: "Neha Gupta", role: "Product Manager", department: "Product", photo: pravatar(33), years: 2, whenLabel: "Tomorrow" },
  { id: "ua2", name: "Karan Singh", role: "DevOps Engineer", department: "Engineering", photo: pravatar(60), years: 4, whenLabel: "24 Aug" },
  { id: "ua3", name: "Meera Iyer", role: "Design Lead", department: "Design", photo: pravatar(20), years: 3, whenLabel: "28 Aug" },
];

/** New hires — none onboarding today in the demo, a couple starting soon. */
export const NEW_JOINEES_TODAY: CelebrationEmployee[] = [];

export const UPCOMING_JOINEES: UpcomingCelebration[] = [
  { id: "nj1", name: "Aditya Verma", role: "Frontend Engineer", department: "Engineering", photo: pravatar(11), whenLabel: "Starts Mon" },
  { id: "nj2", name: "Lisa Chen", role: "UX Researcher", department: "Design", photo: pravatar(9), whenLabel: "Starts 25 Aug" },
  { id: "nj3", name: "Omar Farouk", role: "Account Executive", department: "Sales", photo: pravatar(8), whenLabel: "Starts 27 Aug" },
];

export type CelebrationKind = "birthday" | "anniversary";

export const CHAT_SPACES = [
  "Zessta Community",
  "General",
  "Team Celebrations",
  "Hyderabad Office",
  "Design Team",
];

export const DEFAULT_MESSAGES: Record<CelebrationKind, string> = {
  birthday: "Wishing everyone celebrating today a wonderful birthday and an amazing year ahead! 🎉",
  anniversary: "Congratulations to everyone celebrating their work anniversary today. Thank you for being part of our journey! ✨",
};

export function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] ?? name;
}

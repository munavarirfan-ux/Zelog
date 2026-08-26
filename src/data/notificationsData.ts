import {
  AtSign, Cake, CalendarClock, CheckCircle2, Clock, FileText, FolderKanban,
  FolderMinus, Laptop, Megaphone, PackageCheck, PartyPopper, RotateCcw,
  UserMinus, UserPlus, XCircle, type LucideIcon,
} from "lucide-react";

/**
 * The Inbox "Notifications" feed is much broader than request updates — it's the
 * employee's personal activity stream: celebrations, people/org events, project
 * and asset assignments, announcements and mentions, alongside the status of
 * their own requests.
 */
export type NotificationKind =
  | "birthday"
  | "work-anniversary"
  | "welcome"
  | "employee-added"
  | "employee-removed"
  | "project-assigned"
  | "project-removed"
  | "project-deadline"
  | "asset-assigned"
  | "asset-return-due"
  | "asset-returned"
  | "announcement"
  | "policy-update"
  | "mention"
  | "request-approved"
  | "request-rejected"
  | "request-changes"
  | "request-submitted";

/** Broad buckets used for the icon tint and (future) grouping. */
export type NotificationCategory =
  | "celebration"
  | "people"
  | "project"
  | "asset"
  | "broadcast"
  | "request";

export interface AppNotification {
  id: string;
  kind: NotificationKind;
  /** Bold headline. Keep it short — the actor's name usually leads. */
  title: string;
  /** Supporting line. */
  body?: string;
  /** Whose avatar to show (birthday person, PM, HR partner…). Optional. */
  actorId?: string;
  /** ISO datetime the event happened. */
  at: string;
  /** Baseline read flag; effective read state also considers the store. */
  read?: boolean;
  /** Where a click leads inside the app. */
  href?: string;
  /** Optional inline action label, e.g. "Say happy birthday". */
  cta?: string;
}

export interface KindMeta {
  category: NotificationCategory;
  icon: LucideIcon;
  color: string;
  /** Small pill label shown next to the actor. */
  label: string;
}

/** Per-kind visual identity — icon, accent color and pill label. */
export const NOTIFICATION_KIND: Record<NotificationKind, KindMeta> = {
  birthday:          { category: "celebration", icon: Cake,         color: "#EC4899", label: "Birthday" },
  "work-anniversary":{ category: "celebration", icon: PartyPopper,  color: "#F59E0B", label: "Anniversary" },
  welcome:           { category: "celebration", icon: PartyPopper,  color: "#F472B6", label: "Welcome" },
  "employee-added":  { category: "people",      icon: UserPlus,     color: "#10B981", label: "New joiner" },
  "employee-removed":{ category: "people",      icon: UserMinus,    color: "#F43F5E", label: "Offboarding" },
  "project-assigned":{ category: "project",     icon: FolderKanban, color: "#6366F1", label: "Project" },
  "project-removed": { category: "project",     icon: FolderMinus,  color: "#94A3B8", label: "Project" },
  "project-deadline":{ category: "project",     icon: CalendarClock,color: "#8B5CF6", label: "Deadline" },
  "asset-assigned":  { category: "asset",       icon: Laptop,       color: "#06B6D4", label: "Asset" },
  "asset-return-due":{ category: "asset",       icon: CalendarClock,color: "#FB923C", label: "Asset" },
  "asset-returned":  { category: "asset",       icon: PackageCheck, color: "#0EA5E9", label: "Asset" },
  announcement:      { category: "broadcast",   icon: Megaphone,    color: "#8B5CF6", label: "Announcement" },
  "policy-update":   { category: "broadcast",   icon: FileText,     color: "#0EA5E9", label: "Policy" },
  mention:           { category: "broadcast",   icon: AtSign,       color: "#3B82F6", label: "Mention" },
  "request-approved":{ category: "request",     icon: CheckCircle2, color: "#0F9E6E", label: "Approved" },
  "request-rejected":{ category: "request",     icon: XCircle,      color: "#E11D48", label: "Rejected" },
  "request-changes": { category: "request",     icon: RotateCcw,    color: "#7C3AED", label: "Changes requested" },
  "request-submitted":{ category: "request",    icon: Clock,        color: "#F59E0B", label: "Awaiting approval" },
};

/**
 * Mock notification feed for the current demo user (Irfan Alisha / eng1).
 * Ordered newest-first; the feed re-sorts and groups by day anyway.
 */
export const MOCK_NOTIFICATIONS: AppNotification[] = [
  {
    id: "n_bday_wei",
    kind: "birthday",
    title: "It's Wei Zhang's birthday today",
    body: "Drop a note and make their day.",
    actorId: "eng2",
    at: "2026-08-25T08:05:00Z",
    cta: "Say happy birthday",
    href: "/directory/eng2",
  },
  {
    id: "n_proj_atlas",
    kind: "project-assigned",
    title: "You were added to Project Atlas",
    body: "Priya Nair assigned you as Engineering lead.",
    actorId: "cpo",
    at: "2026-08-25T06:30:00Z",
    href: "/directory/eng1",
  },
  {
    id: "n_asset_due",
    kind: "asset-return-due",
    title: "MacBook Pro 14\" return due soon",
    body: "Your loaner laptop is due back on 1 Sep.",
    at: "2026-08-25T04:10:00Z",
    href: "/directory/eng1",
  },
  {
    id: "n_new_hire",
    kind: "employee-added",
    title: "Aisha Rahman joined Engineering",
    body: "Say hello to the newest member of your team.",
    actorId: "hrhead",
    at: "2026-08-24T09:00:00Z",
    cta: "View profile",
    href: "/directory",
  },
  {
    id: "n_asset_assigned",
    kind: "asset-assigned",
    title: "Dell UltraSharp monitor assigned to you",
    body: "IT has issued asset #MON-2231 to your desk.",
    at: "2026-08-23T11:15:00Z",
    href: "/directory/eng1",
  },
  {
    id: "n_anniv",
    kind: "work-anniversary",
    title: "Oscar Bennett completes 5 years at Zessta",
    body: "Celebrate a big milestone with the team.",
    actorId: "des1",
    at: "2026-08-23T08:00:00Z",
    cta: "Congratulate",
    href: "/directory/des1",
  },
  {
    id: "n_announce",
    kind: "announcement",
    title: "Company all-hands moved to Friday 3 PM",
    body: "Sara Lindqvist posted an update for everyone.",
    actorId: "hrhead",
    at: "2026-08-22T13:00:00Z",
    href: "/",
  },
  {
    id: "n_mention",
    kind: "mention",
    title: "Lena Fischer mentioned you in Atlas kickoff",
    body: "\"@Irfan can you own the auth milestone?\"",
    actorId: "prod1",
    at: "2026-08-22T10:45:00Z",
    href: "/directory/prod1",
  },
  {
    id: "n_policy",
    kind: "policy-update",
    title: "Updated Leave Policy is now live",
    body: "Carry-forward cap raised to 10 days from FY27.",
    at: "2026-08-20T09:30:00Z",
    href: "/",
  },
  {
    id: "n_offboard",
    kind: "employee-removed",
    title: "Kenji Watanabe is leaving Zessta",
    body: "Last working day is 29 Aug. Reassign shared work.",
    actorId: "eng5",
    at: "2026-08-19T16:00:00Z",
    href: "/directory/eng5",
  },
];

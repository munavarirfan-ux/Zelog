import { differenceInSeconds } from "date-fns";
import type { Project, TimeEntry } from "@/types/tracker";

export const PROJECTS: Project[] = [
  { id: "internal", name: "Internal", color: "indigo", billableDefault: false },
  { id: "zecode", name: "ZeCode", color: "violet", billableDefault: false },
  { id: "meridian", name: "Meridian Health", client: "Meridian Health", color: "sky", billableDefault: true },
  { id: "atlas", name: "Atlas Robotics", client: "Atlas Robotics", color: "emerald", billableDefault: true },
  { id: "training", name: "Training", color: "amber", billableDefault: false },
  { id: "zemeet", name: "ZeMeet", color: "rose", billableDefault: false },
];

export function projectById(id: string): Project {
  return PROJECTS.find((p) => p.id === id) ?? PROJECTS[0];
}

function seg(
  id: string,
  task: string,
  projectId: string,
  billable: boolean,
  date: string,
  start: string,
  end: string,
  tags: string[] = [],
): TimeEntry {
  const startTime = `${date}T${start}:00`;
  const endTime = `${date}T${end}:00`;
  return {
    id,
    task,
    projectId,
    billable,
    tags,
    date,
    startTime,
    endTime,
    durationSeconds: differenceInSeconds(new Date(endTime), new Date(startTime)),
  };
}

export const MOCK_ENTRIES: TimeEntry[] = [
  // 2026-06-29 (Monday)
  seg("e100", "Sprint kickoff — Q3 planning", "internal", false, "2026-06-29", "09:00", "10:30", ["meeting"]),
  seg("e101", "Atlas Robotics sensor calibration API", "atlas", true, "2026-06-29", "11:00", "14:00", ["api", "backend"]),
  seg("e102", "Meridian Health patient onboarding flow", "meridian", true, "2026-06-29", "14:30", "17:30", ["frontend"]),

  // 2026-06-30 (Tuesday)
  seg("e103", "Design review — ZeCode dashboard", "zecode", false, "2026-06-30", "09:00", "10:00", ["meeting", "design"]),
  seg("e104", "ZeMeet video grid layout refactor", "zemeet", false, "2026-06-30", "10:30", "13:00", ["frontend"]),
  seg("e105", "Atlas Robotics real-time telemetry stream", "atlas", true, "2026-06-30", "14:00", "18:00", ["backend", "websocket"]),

  // 2026-07-01 (Wednesday)
  seg("e106", "Meridian Health appointment scheduler", "meridian", true, "2026-07-01", "09:00", "12:30", ["frontend", "api"]),
  seg("e107", "Internal tooling — CLI improvements", "zecode", false, "2026-07-01", "13:30", "16:00", ["devops"]),
  seg("e108", "1:1 with engineering manager", "internal", false, "2026-07-01", "16:30", "17:00", ["meeting"]),

  // 2026-07-02 (Thursday)
  seg("e109", "Atlas Robotics firmware OTA update service", "atlas", true, "2026-07-02", "09:00", "12:00", ["backend"]),
  seg("e110", "Accessibility audit — ZeCode components", "zecode", false, "2026-07-02", "13:00", "15:30", ["a11y", "frontend"]),
  seg("e111", "Team retro facilitation", "internal", false, "2026-07-02", "16:00", "17:00", ["meeting"]),

  // 2026-07-03 (Friday)
  seg("e112", "Meridian Health PDF report generator", "meridian", true, "2026-07-03", "09:30", "13:00", ["backend"]),
  seg("e113", "Learning — advanced TypeScript patterns", "training", false, "2026-07-03", "14:00", "16:00", ["learning"]),

  // 2026-07-04 — no entries (holiday)

  // 2026-07-05 — no entries (weekend)

  // 2026-07-06 — no entries (weekend)

  // 2026-07-07 (Monday)
  seg("e114", "Weekly sync + sprint review", "internal", false, "2026-07-07", "09:00", "10:15", ["meeting"]),
  seg("e115", "ZeMeet screen sharing feature", "zemeet", false, "2026-07-07", "10:30", "13:30", ["frontend", "webrtc"]),
  seg("e116", "Meridian Health insurance verification API", "meridian", true, "2026-07-07", "14:00", "17:30", ["api", "backend"]),

  // 2026-07-08 (Tuesday)
  seg("e117", "Atlas Robotics dashboard monitoring panel", "atlas", true, "2026-07-08", "09:00", "12:30", ["frontend", "charts"]),
  seg("e118", "Code review — ZeCode PR batch", "zecode", false, "2026-07-08", "13:30", "15:00", ["review"]),
  seg("e119", "ZeMeet notification system", "zemeet", false, "2026-07-08", "15:30", "18:00", ["backend"]),

  // 2026-07-09 (Wednesday)
  seg("e120", "Meridian Health lab results integration", "meridian", true, "2026-07-09", "09:00", "12:00", ["api", "backend"]),
  seg("e121", "Internal design system documentation", "zecode", false, "2026-07-09", "13:00", "15:30", ["docs", "design-system"]),
  seg("e122", "Pair programming — new hire onboarding", "internal", false, "2026-07-09", "16:00", "17:30", ["mentoring"]),

  // 2026-07-10 (Thursday)
  seg("e123", "Atlas Robotics safety compliance module", "atlas", true, "2026-07-10", "09:00", "13:00", ["backend", "compliance"]),
  seg("e124", "Learning — Rust for systems programming", "training", false, "2026-07-10", "14:00", "16:30", ["learning"]),

  // 2026-07-11 (Friday)
  seg("e125", "ZeMeet recording & playback feature", "zemeet", false, "2026-07-11", "09:00", "12:00", ["backend", "media"]),
  seg("e126", "Meridian Health SSO integration", "meridian", true, "2026-07-11", "13:00", "16:30", ["auth", "backend"]),
  seg("e127", "Friday standup + demos", "internal", false, "2026-07-11", "17:00", "17:30", ["meeting"]),

  // 2026-07-12 — no entries (weekend)

  // 2026-07-13 — no entries (weekend)

  // 2026-07-14 (Monday)
  seg("e128", "Sprint planning + estimation", "internal", false, "2026-07-14", "09:00", "10:30", ["meeting"]),
  seg("e129", "Atlas Robotics predictive maintenance ML pipeline", "atlas", true, "2026-07-14", "11:00", "14:30", ["ml", "backend"]),
  seg("e130", "ZeCode plugin architecture design", "zecode", false, "2026-07-14", "15:00", "18:00", ["architecture"]),

  // 2026-07-15 (Tuesday)
  seg("e131", "Meridian Health patient messaging system", "meridian", true, "2026-07-15", "09:00", "12:30", ["frontend", "backend"]),
  seg("e132", "ZeMeet AI meeting summarizer prototype", "zemeet", false, "2026-07-15", "13:30", "17:00", ["ai", "prototype"]),

  // 2026-07-16 (Wednesday)
  seg("e133", "Atlas Robotics fleet management dashboard", "atlas", true, "2026-07-16", "09:00", "12:00", ["frontend"]),
  seg("e134", "Internal hiring — interview panel", "internal", false, "2026-07-16", "13:00", "14:30", ["hiring"]),
  seg("e135", "Meridian Health HIPAA compliance review", "meridian", true, "2026-07-16", "15:00", "17:30", ["compliance", "review"]),

  // 2026-07-17 (Thursday)
  seg("e136", "ZeCode performance profiling + optimization", "zecode", false, "2026-07-17", "09:00", "12:30", ["performance"]),
  seg("e137", "Learning — distributed systems course", "training", false, "2026-07-17", "13:30", "15:30", ["learning"]),
  seg("e138", "ZeMeet bandwidth optimization", "zemeet", false, "2026-07-17", "16:00", "18:00", ["performance", "backend"]),

  // 2026-07-18 (Friday)
  seg("e139", "Atlas Robotics customer demo preparation", "atlas", true, "2026-07-18", "09:00", "11:30", ["demo"]),
  seg("e140", "Meridian Health data migration script", "meridian", true, "2026-07-18", "12:00", "15:00", ["backend", "migration"]),
  seg("e141", "Week-end retro + knowledge sharing", "internal", false, "2026-07-18", "15:30", "16:30", ["meeting"]),

  // 2026-07-19 — no entries (weekend)

  // 2026-07-20 — no entries (weekend)

  // 2026-07-21 (Monday)
  seg("e142", "Sprint standup + priorities review", "internal", false, "2026-07-21", "09:00", "09:45", ["meeting"]),
  seg("e143", "ZeCode editor dark mode improvements", "zecode", false, "2026-07-21", "10:00", "13:00", ["frontend", "theming"]),
  seg("e144", "Atlas Robotics geofencing service", "atlas", true, "2026-07-21", "14:00", "18:00", ["backend", "geo"]),

  // 2026-07-22 (Tuesday)
  seg("e1", "Sprint planning + backlog grooming", "internal", false, "2026-07-22", "09:00", "10:00", ["meeting"]),
  seg("e2", "Rebuilt Meridian intake form validation", "meridian", true, "2026-07-22", "10:15", "13:30", ["frontend"]),
  seg("e3", "Reviewed Atlas Robotics sensor API spec", "atlas", true, "2026-07-22", "14:15", "18:00", ["api"]),

  // 2026-07-23 (Wednesday)
  seg("e4", "1:1s with design + eng leads", "internal", false, "2026-07-23", "09:00", "10:30", ["meeting"]),
  seg("e5", "Built onboarding checklist component", "zecode", false, "2026-07-23", "11:00", "13:00", ["frontend"]),
  seg("e6", "Meridian Health dashboard analytics widgets", "meridian", true, "2026-07-23", "14:00", "18:15", ["frontend", "charts"]),

  // 2026-07-24 (Thursday)
  seg("e7", "Atlas Robotics firmware integration testing", "atlas", true, "2026-07-24", "09:30", "12:00", ["testing"]),
  seg("e8", "ZeMeet lobby redesign polish pass", "zemeet", false, "2026-07-24", "13:00", "16:15", ["design"]),

  // 2026-07-25 (Friday)
  seg("e9", "Advanced Radix UI patterns course", "training", false, "2026-07-25", "10:00", "12:00", ["learning"]),

  // 2026-07-26 — no entries (weekend)

  // 2026-07-27 (Sunday)
  seg("e10", "Weekly roadmap sync", "internal", false, "2026-07-27", "09:00", "09:45", ["meeting"]),
  seg("e11", "Meridian Health billing export feature", "meridian", true, "2026-07-27", "10:00", "13:30", ["backend"]),
  seg("e12", "Atlas Robotics deployment pipeline fixes", "atlas", true, "2026-07-27", "14:30", "18:00", ["devops"]),

  // 2026-07-28 — today
  seg("e13", "Morning stand-up + inbox triage", "internal", false, "2026-07-28", "09:00", "09:30", ["meeting"]),
  seg("e14", "ZeLog tracker redesign — component library", "zecode", false, "2026-07-28", "09:45", "12:15", ["frontend", "design-system"]),
];

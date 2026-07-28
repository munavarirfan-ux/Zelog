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
  // 2026-07-22
  seg("e1", "Sprint planning + backlog grooming", "internal", false, "2026-07-22", "09:00", "10:00", ["meeting"]),
  seg("e2", "Rebuilt Meridian intake form validation", "meridian", true, "2026-07-22", "10:15", "13:30", ["frontend"]),
  seg("e3", "Reviewed Atlas Robotics sensor API spec", "atlas", true, "2026-07-22", "14:15", "18:00", ["api"]),

  // 2026-07-23
  seg("e4", "1:1s with design + eng leads", "internal", false, "2026-07-23", "09:00", "10:30", ["meeting"]),
  seg("e5", "Built onboarding checklist component", "zecode", false, "2026-07-23", "11:00", "13:00", ["frontend"]),
  seg("e6", "Meridian Health dashboard analytics widgets", "meridian", true, "2026-07-23", "14:00", "18:15", ["frontend", "charts"]),

  // 2026-07-24
  seg("e7", "Atlas Robotics firmware integration testing", "atlas", true, "2026-07-24", "09:30", "12:00", ["testing"]),
  seg("e8", "ZeMeet lobby redesign polish pass", "zemeet", false, "2026-07-24", "13:00", "16:15", ["design"]),

  // 2026-07-25
  seg("e9", "Advanced Radix UI patterns course", "training", false, "2026-07-25", "10:00", "12:00", ["learning"]),

  // 2026-07-26 — rest day, intentionally no entries

  // 2026-07-27
  seg("e10", "Weekly roadmap sync", "internal", false, "2026-07-27", "09:00", "09:45", ["meeting"]),
  seg("e11", "Meridian Health billing export feature", "meridian", true, "2026-07-27", "10:00", "13:30", ["backend"]),
  seg("e12", "Atlas Robotics deployment pipeline fixes", "atlas", true, "2026-07-27", "14:30", "18:00", ["devops"]),

  // 2026-07-28 — today, in progress
  seg("e13", "Morning stand-up + inbox triage", "internal", false, "2026-07-28", "09:00", "09:30", ["meeting"]),
  seg("e14", "ZeLog tracker redesign — component library", "zecode", false, "2026-07-28", "09:45", "12:15", ["frontend", "design-system"]),
];

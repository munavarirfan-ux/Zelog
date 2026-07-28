import type { ProjectColor } from "@/types/tracker";

export const PROJECT_COLOR_HEX: Record<ProjectColor, string> = {
  indigo: "#6366f1",
  violet: "#8b5cf6",
  sky: "#0ea5e9",
  emerald: "#10b981",
  amber: "#f59e0b",
  rose: "#f43f5e",
};

export const PROJECT_COLOR_BADGE: Record<ProjectColor, string> = {
  indigo:
    "bg-indigo-500/10 text-indigo-600 ring-1 ring-inset ring-indigo-500/20 dark:bg-indigo-400/10 dark:text-indigo-300 dark:ring-indigo-400/25",
  violet:
    "bg-violet-500/10 text-violet-600 ring-1 ring-inset ring-violet-500/20 dark:bg-violet-400/10 dark:text-violet-300 dark:ring-violet-400/25",
  sky: "bg-sky-500/10 text-sky-600 ring-1 ring-inset ring-sky-500/20 dark:bg-sky-400/10 dark:text-sky-300 dark:ring-sky-400/25",
  emerald:
    "bg-emerald-500/10 text-emerald-600 ring-1 ring-inset ring-emerald-500/20 dark:bg-emerald-400/10 dark:text-emerald-300 dark:ring-emerald-400/25",
  amber:
    "bg-amber-500/10 text-amber-600 ring-1 ring-inset ring-amber-500/20 dark:bg-amber-400/10 dark:text-amber-300 dark:ring-amber-400/25",
  rose: "bg-rose-500/10 text-rose-600 ring-1 ring-inset ring-rose-500/20 dark:bg-rose-400/10 dark:text-rose-300 dark:ring-rose-400/25",
};

export const PROJECT_COLOR_DOT: Record<ProjectColor, string> = {
  indigo: "bg-indigo-500",
  violet: "bg-violet-500",
  sky: "bg-sky-500",
  emerald: "bg-emerald-500",
  amber: "bg-amber-500",
  rose: "bg-rose-500",
};

export const PROJECT_COLOR_SOLID_TEXT: Record<ProjectColor, string> = {
  indigo: "text-indigo-500",
  violet: "text-violet-500",
  sky: "text-sky-500",
  emerald: "text-emerald-500",
  amber: "text-amber-500",
  rose: "text-rose-500",
};

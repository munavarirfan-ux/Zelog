import type { ProjectColor } from "@/types/tracker";

const PASTEL_PALETTE = [
  "#8B7CF6",
  "#A78BFA",
  "#C4B5FD",
  "#7DD3FC",
  "#93C5FD",
  "#6EE7B7",
  "#A7F3D0",
  "#F9A8D4",
  "#FBCFE8",
  "#FDBA74",
  "#FCD34D",
  "#FDE68A",
  "#86EFAC",
  "#BBF7D0",
  "#C7D2FE",
  "#DDD6FE",
  "#BAE6FD",
  "#E9D5FF",
  "#FFE4E6",
  "#D9F99D",
];

export function getProjectChartColor(index: number): string {
  if (index < PASTEL_PALETTE.length) return PASTEL_PALETTE[index];
  const hue = (index * 137.5) % 360;
  const s = 55 + (index % 3) * 5;
  const l = 68 + (index % 4) * 3;
  return `hsl(${hue}, ${s}%, ${l}%)`;
}

export const PROJECT_COLOR_HEX: Record<ProjectColor, string> = {
  indigo: "#8B7CF6",
  violet: "#A78BFA",
  sky: "#7DD3FC",
  emerald: "#6EE7B7",
  amber: "#FDBA74",
  rose: "#F9A8D4",
};

export const PROJECT_COLOR_BADGE: Record<ProjectColor, string> = {
  indigo:
    "bg-[rgb(var(--chip-indigo-rgb)/0.1)] text-[rgb(var(--chip-indigo-rgb))] ring-1 ring-inset ring-[rgb(var(--chip-indigo-rgb)/0.2)]",
  violet:
    "bg-[rgb(var(--chip-violet-rgb)/0.1)] text-[rgb(var(--chip-violet-rgb))] ring-1 ring-inset ring-[rgb(var(--chip-violet-rgb)/0.2)]",
  sky:
    "bg-[rgb(var(--chip-sky-rgb)/0.1)] text-[rgb(var(--chip-sky-rgb))] ring-1 ring-inset ring-[rgb(var(--chip-sky-rgb)/0.2)]",
  emerald:
    "bg-[rgb(var(--chip-emerald-rgb)/0.1)] text-[rgb(var(--chip-emerald-rgb))] ring-1 ring-inset ring-[rgb(var(--chip-emerald-rgb)/0.2)]",
  amber:
    "bg-[rgb(var(--chip-amber-rgb)/0.1)] text-[rgb(var(--chip-amber-rgb))] ring-1 ring-inset ring-[rgb(var(--chip-amber-rgb)/0.2)]",
  rose:
    "bg-[rgb(var(--chip-rose-rgb)/0.1)] text-[rgb(var(--chip-rose-rgb))] ring-1 ring-inset ring-[rgb(var(--chip-rose-rgb)/0.2)]",
};

export const PROJECT_COLOR_DOT: Record<ProjectColor, string> = {
  indigo: "bg-[rgb(var(--chip-indigo-rgb))]",
  violet: "bg-[rgb(var(--chip-violet-rgb))]",
  sky: "bg-[rgb(var(--chip-sky-rgb))]",
  emerald: "bg-[rgb(var(--chip-emerald-rgb))]",
  amber: "bg-[rgb(var(--chip-amber-rgb))]",
  rose: "bg-[rgb(var(--chip-rose-rgb))]",
};

export const PROJECT_COLOR_SOLID_TEXT: Record<ProjectColor, string> = {
  indigo: "text-[rgb(var(--chip-indigo-rgb))]",
  violet: "text-[rgb(var(--chip-violet-rgb))]",
  sky: "text-[rgb(var(--chip-sky-rgb))]",
  emerald: "text-[rgb(var(--chip-emerald-rgb))]",
  amber: "text-[rgb(var(--chip-amber-rgb))]",
  rose: "text-[rgb(var(--chip-rose-rgb))]",
};

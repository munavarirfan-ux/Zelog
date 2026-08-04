"use client";

import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, ChevronsUpDown, Clock, X } from "lucide-react";
import { parseISO, formatDistanceToNow } from "date-fns";
import Tooltip from "@mui/material/Tooltip";
import Dialog from "@mui/material/Dialog";
import { projectById } from "@/data/mockEntries";
import { formatDurationShort, formatTimeRange } from "@/lib/time";
import { PROJECT_COLOR_HEX, PROJECT_COLOR_BADGE, PROJECT_COLOR_DOT } from "@/lib/projectColors";
import { cn } from "@/lib/utils";
import type { TimeEntry, Project } from "@/types/tracker";

export interface TeamMember {
  id: string;
  name: string;
  initials: string;
  color: string;
}

interface ProjectSlice {
  project: Project;
  seconds: number;
  pct: number;
}

interface MemberActivity {
  member: TeamMember;
  entries: TimeEntry[];
  latest: TimeEntry | null;
  latestProject: Project | null;
  total: number;
  distribution: ProjectSlice[];
}

type SortKey = "member" | "latest" | "total";
type SortDir = "asc" | "desc";

const GRID =
  "grid-cols-[minmax(180px,1.3fr)_minmax(220px,1.9fr)_110px_minmax(200px,1.6fr)]";

export function TeamActivityCard({
  members,
  entries,
  onFilterProject,
}: {
  members: TeamMember[];
  entries: TimeEntry[];
  onFilterProject: (projectId: string) => void;
}) {
  const [sort, setSort] = useState<{ key: SortKey; dir: SortDir }>({ key: "total", dir: "desc" });
  const [detail, setDetail] = useState<MemberActivity | null>(null);

  const activity = useMemo<MemberActivity[]>(() => {
    return members.map((member, idx) => {
      const memberEntries = entries.slice(idx * 8, idx * 8 + 8);
      const latest = memberEntries[0] ?? null;
      const total = memberEntries.reduce((s, e) => s + e.durationSeconds, 0);

      const byProject = new Map<string, number>();
      memberEntries.forEach((e) => {
        byProject.set(e.projectId, (byProject.get(e.projectId) || 0) + e.durationSeconds);
      });
      const distribution: ProjectSlice[] = Array.from(byProject.entries())
        .map(([id, seconds]) => ({
          project: projectById(id),
          seconds,
          pct: total > 0 ? (seconds / total) * 100 : 0,
        }))
        .sort((a, b) => b.seconds - a.seconds);

      return {
        member,
        entries: memberEntries,
        latest,
        latestProject: latest ? projectById(latest.projectId) : null,
        total,
        distribution,
      };
    });
  }, [members, entries]);

  const sorted = useMemo(() => {
    const dir = sort.dir === "asc" ? 1 : -1;
    return [...activity].sort((a, b) => {
      if (sort.key === "member") return a.member.name.localeCompare(b.member.name) * dir;
      if (sort.key === "total") return (a.total - b.total) * dir;
      // latest: by most recent tracked timestamp
      const at = a.latest ? parseISO(a.latest.endTime || a.latest.startTime).getTime() : 0;
      const bt = b.latest ? parseISO(b.latest.endTime || b.latest.startTime).getTime() : 0;
      return (at - bt) * dir;
    });
  }, [activity, sort]);

  function toggleSort(key: SortKey) {
    setSort((prev) =>
      prev.key === key
        ? { key, dir: prev.dir === "asc" ? "desc" : "asc" }
        : { key, dir: key === "member" ? "asc" : "desc" },
    );
  }

  return (
    <>
      <section className="rounded-[20px] border border-[rgba(99,102,241,0.08)] bg-surface shadow-[0_6px_24px_rgba(40,30,90,0.06)] dark:border-white/[0.06]">
        {/* Card header */}
        <div className="flex items-center justify-between px-6 py-5">
          <div>
            <h3 className="text-[15px] font-semibold text-text">Team Activity</h3>
            <p className="mt-0.5 text-xs text-text-tertiary">
              What each teammate is working on and how their time breaks down.
            </p>
          </div>
          <span className="rounded-full bg-surface-2 px-2.5 py-1 text-xs font-medium text-text-secondary dark:bg-white/[0.04]">
            {members.length} members
          </span>
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-[820px]">
            {/* Column headers */}
            <div
              className={cn(
                "grid items-center gap-4 border-y border-border/[0.06] px-6 py-2.5 dark:border-white/[0.05]",
                GRID,
              )}
            >
              <SortHeader label="Team Member" active={sort.key === "member"} dir={sort.dir} onClick={() => toggleSort("member")} />
              <SortHeader label="Latest Activity" active={sort.key === "latest"} dir={sort.dir} onClick={() => toggleSort("latest")} />
              <SortHeader label="Total Tracked" active={sort.key === "total"} dir={sort.dir} onClick={() => toggleSort("total")} />
              <span className="text-[11px] font-semibold uppercase tracking-wider text-text-tertiary">
                Time Distribution
              </span>
            </div>

            {/* Rows */}
            <div className="divide-y divide-border/[0.05] dark:divide-white/[0.04]">
              {sorted.map((row) => (
                <div
                  key={row.member.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => setDetail(row)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setDetail(row);
                    }
                  }}
                  className={cn(
                    "grid cursor-pointer items-center gap-4 px-6 py-4 transition-colors duration-150",
                    "hover:bg-[rgba(99,102,241,0.035)] dark:hover:bg-primary-50/20",
                    "focus-visible:bg-[rgba(99,102,241,0.05)] focus-visible:outline-none",
                    GRID,
                  )}
                >
                  {/* Team member */}
                  <div className="flex min-w-0 items-center gap-3">
                    <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white", row.member.color)}>
                      {row.member.initials}
                    </div>
                    <p className="truncate text-sm font-medium text-text">{row.member.name}</p>
                  </div>

                  {/* Latest activity */}
                  {row.latest && row.latestProject ? (
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-text">{row.latest.task}</p>
                      <div className="mt-1 flex items-center gap-2 text-[11px] text-text-tertiary">
                        <span className={cn("inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 font-medium", PROJECT_COLOR_BADGE[row.latestProject.color])}>
                          <span className={cn("h-1.5 w-1.5 rounded-full", PROJECT_COLOR_DOT[row.latestProject.color])} />
                          {row.latestProject.name}
                        </span>
                        <span className="text-text-disabled">·</span>
                        <span className="tabular-nums">{formatDurationShort(row.latest.durationSeconds)}</span>
                        <span className="text-text-disabled">·</span>
                        <span>{formatDistanceToNow(parseISO(row.latest.endTime || row.latest.startTime), { addSuffix: true })}</span>
                      </div>
                    </div>
                  ) : (
                    <span className="text-sm text-text-tertiary">No recent activity</span>
                  )}

                  {/* Total tracked */}
                  <span className="text-sm font-semibold tabular-nums text-text">
                    {formatDurationShort(row.total)}
                  </span>

                  {/* Time distribution */}
                  <DistributionBar
                    distribution={row.distribution}
                    onSegmentClick={(projectId) => onFilterProject(projectId)}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <MemberDetailDialog activity={detail} onClose={() => setDetail(null)} />
    </>
  );
}

function SortHeader({
  label,
  active,
  dir,
  onClick,
}: {
  label: string;
  active: boolean;
  dir: SortDir;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group inline-flex w-fit items-center gap-1 text-[11px] font-semibold uppercase tracking-wider transition-colors",
        active ? "text-primary-600" : "text-text-tertiary hover:text-text-secondary",
      )}
    >
      {label}
      {active ? (
        dir === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
      ) : (
        <ChevronsUpDown className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-60" />
      )}
    </button>
  );
}

function DistributionBar({
  distribution,
  onSegmentClick,
}: {
  distribution: ProjectSlice[];
  onSegmentClick: (projectId: string) => void;
}) {
  if (!distribution.length) {
    return <div className="h-2.5 w-full rounded-full bg-border/10 dark:bg-white/10" />;
  }
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-2.5 flex-1 overflow-hidden rounded-full bg-border/10 dark:bg-white/10">
        {distribution.map((slice) => (
          <Tooltip
            key={slice.project.id}
            arrow={false}
            enterDelay={120}
            placement="top"
            title={
              <div className="px-0.5 py-0.5">
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: PROJECT_COLOR_HEX[slice.project.color] }} />
                  <span className="font-semibold">{slice.project.name}</span>
                </div>
                <div className="mt-1 text-white/80">
                  {formatDurationShort(slice.seconds)} · {Math.round(slice.pct)}%
                </div>
              </div>
            }
            slotProps={{
              tooltip: {
                sx: {
                  borderRadius: "10px",
                  px: 1.5,
                  py: 1,
                  fontSize: "0.75rem",
                  backgroundColor: "rgba(30, 25, 60, 0.92)",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                },
              },
            }}
          >
            <button
              type="button"
              aria-label={`Filter by ${slice.project.name}`}
              onClick={(e) => {
                e.stopPropagation();
                onSegmentClick(slice.project.id);
              }}
              className="h-full min-w-[3px] transition-[filter,transform] duration-150 hover:brightness-110 hover:saturate-150"
              style={{ width: `${slice.pct}%`, backgroundColor: PROJECT_COLOR_HEX[slice.project.color] }}
            />
          </Tooltip>
        ))}
      </div>
      <span className="shrink-0 text-[11px] tabular-nums text-text-tertiary">
        {distribution.length} {distribution.length === 1 ? "project" : "projects"}
      </span>
    </div>
  );
}

function MemberDetailDialog({
  activity,
  onClose,
}: {
  activity: MemberActivity | null;
  onClose: () => void;
}) {
  return (
    <Dialog
      open={Boolean(activity)}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: { borderRadius: "20px", maxWidth: 460, width: "100%", backgroundImage: "none" },
        },
      }}
    >
      {activity && (
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className={cn("flex h-11 w-11 items-center justify-center rounded-full text-sm font-bold text-white", activity.member.color)}>
                {activity.member.initials}
              </div>
              <div>
                <h4 className="text-base font-semibold text-text">{activity.member.name}</h4>
                <p className="text-xs text-text-tertiary">
                  {formatDurationShort(activity.total)} tracked · {activity.entries.length} sessions
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-text-tertiary transition-colors hover:bg-surface-2 hover:text-text"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Distribution */}
          <div className="mt-5">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-text-tertiary">Time distribution</p>
            <div className="flex h-2.5 overflow-hidden rounded-full bg-border/10 dark:bg-white/10">
              {activity.distribution.map((slice) => (
                <div key={slice.project.id} className="h-full" style={{ width: `${slice.pct}%`, backgroundColor: PROJECT_COLOR_HEX[slice.project.color] }} />
              ))}
            </div>
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
              {activity.distribution.map((slice) => (
                <div key={slice.project.id} className="flex items-center gap-1.5 text-xs">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: PROJECT_COLOR_HEX[slice.project.color] }} />
                  <span className="text-text-secondary">{slice.project.name}</span>
                  <span className="tabular-nums text-text-tertiary">{Math.round(slice.pct)}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent sessions */}
          <div className="mt-5">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-text-tertiary">Recent sessions</p>
            <div className="max-h-64 space-y-1 overflow-y-auto">
              {activity.entries.map((entry) => {
                const project = projectById(entry.projectId);
                return (
                  <div key={entry.id} className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-surface-2 dark:hover:bg-white/[0.03]">
                    <span className={cn("h-2 w-2 shrink-0 rounded-full", PROJECT_COLOR_DOT[project.color])} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm text-text">{entry.task}</p>
                      <p className="text-[11px] text-text-tertiary">
                        {project.name} · {formatTimeRange(entry.startTime, entry.endTime)}
                      </p>
                    </div>
                    <span className="shrink-0 text-xs font-medium tabular-nums text-text-secondary">
                      {formatDurationShort(entry.durationSeconds)}
                    </span>
                  </div>
                );
              })}
              {!activity.entries.length && (
                <p className="flex items-center gap-2 px-3 py-4 text-sm text-text-tertiary">
                  <Clock className="h-4 w-4" /> No sessions in this period.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </Dialog>
  );
}

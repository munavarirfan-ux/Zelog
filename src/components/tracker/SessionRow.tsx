"use client";

import { useCallback, useRef, useState } from "react";
import { Copy, MoreHorizontal, Pencil, Play, Trash2 } from "lucide-react";
import Checkbox from "@mui/material/Checkbox";
import Tooltip from "@mui/material/Tooltip";
import { useTrackerStore } from "@/store/trackerStore";
import { projectById } from "@/data/mockEntries";
import { formatDuration, formatTimeRange } from "@/lib/time";
import { PROJECT_COLOR_BADGE, PROJECT_COLOR_DOT } from "@/lib/projectColors";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EditSessionDialog } from "./EditSessionDialog";
import { DeleteSessionAlert } from "./DeleteSessionAlert";
import type { TimeEntry } from "@/types/tracker";
import { cn } from "@/lib/utils";

interface SessionRowProps {
  entry: TimeEntry;
  selected?: boolean;
  onToggleSelect?: () => void;
}

export function SessionRow({ entry, selected = false, onToggleSelect }: SessionRowProps) {
  const project = projectById(entry.projectId);
  const continueEntry = useTrackerStore((s) => s.continueEntry);
  const duplicateEntry = useTrackerStore((s) => s.duplicateEntry);
  const updateEntry = useTrackerStore((s) => s.updateEntry);
  const runningTimer = useTrackerStore((s) => s.runningTimer);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(entry.task);
  const [isTruncated, setIsTruncated] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const textRef = useCallback((node: HTMLParagraphElement | null) => {
    if (node) setIsTruncated(node.scrollWidth > node.clientWidth);
  }, [entry.task]);

  return (
    <>
      <div
        className={cn(
          "group grid h-14 items-center gap-3 px-4 transition-colors duration-150",
          "grid-cols-[32px_minmax(180px,1fr)_130px_110px_150px_72px_32px_32px]",
          "hover:bg-[rgba(99,102,241,0.035)] dark:hover:bg-primary-50/20",
          "max-md:h-auto max-md:grid-cols-[32px_minmax(0,1fr)_32px] max-md:items-start max-md:gap-3 max-md:px-4 max-md:py-3",
          selected && "bg-[rgba(99,102,241,0.08)] dark:bg-primary-100/40",
        )}
      >
        {/* Checkbox */}
        <Checkbox
          size="small"
          checked={selected}
          onChange={onToggleSelect}
          className="max-md:mt-0.5"
          sx={{
            padding: 0,
            width: 18,
            height: 18,
            justifySelf: "center",
            color: "rgb(var(--primary-main-rgb) / 0.15)",
            "&.Mui-checked": { color: "rgb(var(--primary-main-rgb) / 0.45)" },
          }}
        />

        {/* Task name — inline editable */}
        <div className="min-w-0">
          {isEditing ? (
            <div className="flex h-9 items-center rounded-lg border border-primary-200 bg-white px-3 ring-1 ring-primary-100/60 dark:bg-surface-2 dark:ring-primary-500/10">
              <input
                ref={inputRef}
                type="text"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    const trimmed = draft.trim();
                    if (trimmed) {
                      updateEntry(entry.id, { task: trimmed });
                    }
                    setIsEditing(false);
                  } else if (e.key === "Escape") {
                    setDraft(entry.task);
                    setIsEditing(false);
                  }
                }}
                onBlur={() => {
                  const trimmed = draft.trim();
                  if (trimmed) {
                    updateEntry(entry.id, { task: trimmed });
                  } else {
                    setDraft(entry.task);
                  }
                  setIsEditing(false);
                }}
                className="w-full truncate border-0 bg-transparent p-0 text-sm font-light text-text outline-none ring-0 focus:ring-0"
              />
            </div>
          ) : (
            <Tooltip
              title={isTruncated ? entry.task : ""}
              placement="top-start"
              enterDelay={300}
              arrow={false}
              disableHoverListener={!isTruncated}
              slotProps={{
                tooltip: {
                  sx: {
                    maxWidth: 380,
                    borderRadius: "10px",
                    px: 2,
                    py: 1.25,
                    fontSize: "0.8125rem",
                    fontWeight: 400,
                    lineHeight: 1.5,
                    whiteSpace: "normal",
                    backgroundColor: "rgba(30, 25, 60, 0.92)",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                  },
                },
              }}
            >
              <p
                ref={textRef}
                className="cursor-text truncate text-sm font-light text-text"
                onClick={() => {
                  setDraft(entry.task);
                  setIsEditing(true);
                  setTimeout(() => {
                    inputRef.current?.focus();
                    inputRef.current?.select();
                  }, 0);
                }}
              >
                {entry.task}
              </p>
            </Tooltip>
          )}
          {/* Mobile: stacked metadata */}
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5 md:hidden">
            <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold leading-4", PROJECT_COLOR_BADGE[project.color])}>
              <span className={cn("h-1.5 w-1.5 rounded-full", PROJECT_COLOR_DOT[project.color])} />
              {project.name}
            </span>
            {entry.billable && (
              <Badge variant="success" className="text-[10px] px-1.5 py-0">$</Badge>
            )}
            <span className="text-xs tabular-nums text-text-tertiary">
              {formatDuration(entry.durationSeconds)}
            </span>
          </div>
        </div>

        {/* Project pill */}
        <span className={cn("hidden items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold leading-4 md:inline-flex", PROJECT_COLOR_BADGE[project.color])}>
          <span className={cn("h-1.5 w-1.5 rounded-full", PROJECT_COLOR_DOT[project.color])} />
          {project.name}
        </span>

        {/* Billing status */}
        <span className={cn(
          "hidden md:inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium leading-4",
          entry.billable
            ? "bg-success/10 text-success ring-1 ring-inset ring-success/20"
            : "bg-surface-2 text-text-tertiary ring-1 ring-inset ring-border/10",
        )}>
          <span className="text-[11px]">$</span>
          {entry.billable ? "Billable" : "Non-billable"}
        </span>

        {/* Time range */}
        <span className="hidden whitespace-nowrap text-xs tabular-nums text-text-tertiary md:inline">
          {formatTimeRange(entry.startTime, entry.endTime)}
        </span>

        {/* Duration */}
        <span className="hidden text-sm font-bold tabular-nums text-text md:inline justify-self-end">
          {formatDuration(entry.durationSeconds)}
        </span>

        {/* Play/resume */}
        <Button
          variant="ghost"
          size="icon"
          className="hidden h-7 w-7 justify-self-end opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100 md:inline-flex"
          onClick={() => continueEntry(entry.id)}
          disabled={Boolean(runningTimer)}
          aria-label="Continue this session"
          title="Continue"
        >
          <Play className="h-3 w-3" />
        </Button>

        {/* More menu */}
        <div className="justify-self-end max-md:col-start-3 max-md:row-start-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100 max-md:h-10 max-md:w-10 max-md:opacity-100"
                aria-label="More actions"
              >
                <MoreHorizontal className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onSelect={(e) => {
                  e.preventDefault();
                  setTimeout(() => setEditOpen(true), 0);
                }}
              >
                <Pencil className="h-4 w-4" /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => duplicateEntry(entry.id)}>
                <Copy className="h-4 w-4" /> Duplicate
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                destructive
                onSelect={(e) => {
                  e.preventDefault();
                  setTimeout(() => setDeleteOpen(true), 0);
                }}
              >
                <Trash2 className="h-4 w-4" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <EditSessionDialog entry={entry} open={editOpen} onOpenChange={setEditOpen} />
      <DeleteSessionAlert entryId={entry.id} taskName={entry.task} open={deleteOpen} onOpenChange={setDeleteOpen} />
    </>
  );
}

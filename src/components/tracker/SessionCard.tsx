"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Copy, MoreHorizontal, Pencil, Play, Trash2 } from "lucide-react";
import { useTrackerStore } from "@/store/trackerStore";
import { projectById } from "@/data/mockEntries";
import { formatDurationShort, formatTimeRange } from "@/lib/time";
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

export function SessionCard({ entry }: { entry: TimeEntry }) {
  const project = projectById(entry.projectId);
  const continueEntry = useTrackerStore((s) => s.continueEntry);
  const duplicateEntry = useTrackerStore((s) => s.duplicateEntry);
  const runningTimer = useTrackerStore((s) => s.runningTimer);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <>
      <motion.div
        layout
        whileHover={{ y: -2 }}
        transition={{ type: "spring", stiffness: 420, damping: 32 }}
        className="group flex items-center gap-3 rounded-[12px] border border-transparent px-3 py-2.5 transition-colors duration-150 hover:border-border/[0.08] hover:bg-surface-2/60 dark:hover:border-white/[0.08]"
      >
        <span
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] text-xs font-bold text-white",
            PROJECT_COLOR_DOT[project.color],
          )}
        >
          {project.name.slice(0, 1)}
        </span>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-text">{entry.task}</p>
          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            <Badge className={PROJECT_COLOR_BADGE[project.color]}>{project.name}</Badge>
            {entry.billable ? <Badge variant="success">Billable</Badge> : null}
            {entry.tags.map((t) => (
              <Badge key={t} variant="secondary">
                {t}
              </Badge>
            ))}
          </div>
          <p className="mt-1 text-xs tabular-nums text-text-tertiary sm:hidden">
            {formatDurationShort(entry.durationSeconds)} · {formatTimeRange(entry.startTime, entry.endTime)}
          </p>
        </div>

        <div className="hidden shrink-0 flex-col items-end text-right sm:flex">
          <span className="text-sm font-semibold tabular-nums text-text">{formatDurationShort(entry.durationSeconds)}</span>
          <span className="text-xs tabular-nums text-text-tertiary">{formatTimeRange(entry.startTime, entry.endTime)}</span>
        </div>

        <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => continueEntry(entry.id)}
            disabled={Boolean(runningTimer)}
            aria-label="Continue this session"
            title="Continue"
          >
            <Play className="h-3.5 w-3.5" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="More actions">
                <MoreHorizontal className="h-4 w-4" />
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
      </motion.div>

      <EditSessionDialog entry={entry} open={editOpen} onOpenChange={setEditOpen} />
      <DeleteSessionAlert entryId={entry.id} taskName={entry.task} open={deleteOpen} onOpenChange={setDeleteOpen} />
    </>
  );
}

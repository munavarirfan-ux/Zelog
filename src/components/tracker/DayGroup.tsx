"use client";

import { useState } from "react";
import { format, isToday, isYesterday, parseISO } from "date-fns";
import { motion } from "framer-motion";
import { ChevronDown, MoreHorizontal, Trash2 } from "lucide-react";
import Checkbox from "@mui/material/Checkbox";
import Menu from "@mui/material/Menu";
import MuiMenuItem from "@mui/material/MenuItem";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import MuiButton from "@mui/material/Button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { SessionRow } from "./SessionRow";
import { formatDuration } from "@/lib/time";
import { useTrackerStore } from "@/store/trackerStore";
import { cn } from "@/lib/utils";
import type { DayGroupData } from "@/lib/trackerSelectors";

function dayLabel(dateStr: string): string {
  const d = parseISO(dateStr);
  if (isToday(d)) return `Today · ${format(d, "MMMM d")}`;
  if (isYesterday(d)) return `Yesterday · ${format(d, "MMMM d")}`;
  return format(d, "EEEE · MMMM d");
}

interface DayGroupProps {
  group: DayGroupData;
  defaultOpen?: boolean;
  selectedEntryIds: string[];
  onToggleEntry: (id: string) => void;
  onToggleGroup: (groupEntryIds: string[]) => void;
  onClearSelection: () => void;
}

export function DayGroup({
  group,
  defaultOpen = true,
  selectedEntryIds,
  onToggleEntry,
  onToggleGroup,
  onClearSelection,
}: DayGroupProps) {
  const [open, setOpen] = useState(defaultOpen);
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const deleteEntry = useTrackerStore((s) => s.deleteEntry);

  const groupEntryIds = group.entries.map((e) => e.id);
  const selectedInGroup = groupEntryIds.filter((id) => selectedEntryIds.includes(id));
  const selectedCount = selectedInGroup.length;
  const allSelected = selectedCount === groupEntryIds.length && selectedCount > 0;
  const someSelected = selectedCount > 0 && !allSelected;

  function handleBulkDelete() {
    selectedInGroup.forEach((id) => deleteEntry(id));
    onClearSelection();
    setConfirmOpen(false);
  }

  return (
    <Collapsible
      open={open}
      onOpenChange={setOpen}
      id={`day-${group.date}`}
      className="rounded-card border border-border/[0.07] bg-surface shadow-card dark:border-white/[0.06]"
    >
      {/* Header row */}
      <div
        className="flex h-12 w-full items-center gap-2 rounded-t-card border-b border-[rgba(90,67,213,0.08)] px-4 transition-colors duration-150 hover:bg-[linear-gradient(90deg,rgba(122,77,255,0.12)_0%,rgba(122,77,255,0.06)_100%)] dark:border-[rgba(138,107,255,0.1)]"
        style={{
          background: "linear-gradient(90deg, rgba(122,77,255,0.08) 0%, rgba(122,77,255,0.04) 55%, rgba(122,77,255,0.02) 100%)",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.7)",
        }}
      >
        <Checkbox
          size="small"
          checked={allSelected}
          indeterminate={someSelected}
          onChange={() => onToggleGroup(groupEntryIds)}
          onClick={(e) => e.stopPropagation()}
          sx={{
            padding: 0,
            width: 20,
            height: 20,
            color: "rgb(var(--primary-main-rgb) / 0.35)",
            "&.Mui-checked, &.MuiCheckbox-indeterminate": { color: "rgb(var(--primary-600-rgb))" },
          }}
        />

        <CollapsibleTrigger asChild>
          <button
            type="button"
            className="flex flex-1 items-center gap-3"
          >
            <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded border border-border/20 bg-surface dark:border-white/10">
              <ChevronDown
                className={cn(
                  "h-3 w-3 text-text-tertiary transition-transform duration-200",
                  open && "rotate-180",
                )}
              />
            </span>
            <span className="text-sm font-semibold text-primary-900">{dayLabel(group.date)}</span>
            <span className="text-xs text-primary-500/70">
              {group.entries.length} session{group.entries.length === 1 ? "" : "s"}
              {selectedCount > 0 && (
                <span className="ml-1 font-medium text-primary-500">
                  · {selectedCount} selected
                </span>
              )}
            </span>
          </button>
        </CollapsibleTrigger>

        <span className="ml-auto text-sm font-bold tabular-nums text-primary-600">
          {formatDuration(group.totalSeconds)}
        </span>

        <button
          type="button"
          className="flex h-6 w-6 items-center justify-center rounded-md text-text-tertiary hover:bg-surface-2"
          onClick={(e) => {
            e.stopPropagation();
            setMenuAnchor(e.currentTarget);
          }}
        >
          <MoreHorizontal className="h-3.5 w-3.5" />
        </button>

        <Menu
          anchorEl={menuAnchor}
          open={Boolean(menuAnchor)}
          onClose={() => setMenuAnchor(null)}
          slotProps={{
            paper: {
              className: "!rounded-[14px] !border !border-border/[0.07] !bg-surface !shadow-float dark:!border-white/[0.06]",
              sx: { backgroundImage: "none", minWidth: 180 },
            },
            list: { className: "!p-1" },
          }}
        >
          <MuiMenuItem
            disabled={selectedCount === 0}
            onClick={() => {
              setMenuAnchor(null);
              setConfirmOpen(true);
            }}
            sx={{
              borderRadius: "8px",
              mx: 0.5,
              px: 1.5,
              py: 1,
              fontSize: "0.875rem",
              fontWeight: 500,
              color: selectedCount > 0 ? "rgb(var(--danger-rgb))" : undefined,
              gap: 1,
              "&:hover": { backgroundColor: "rgba(239,68,68,0.08)" },
            }}
          >
            <Trash2 className="h-4 w-4" />
            Delete selected{selectedCount > 0 ? ` (${selectedCount})` : ""}
          </MuiMenuItem>
        </Menu>
      </div>

      <CollapsibleContent className="overflow-hidden data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up">
        <div className="divide-y divide-border/[0.06] dark:divide-white/[0.05]">
          {group.entries.map((entry, i) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03, duration: 0.18 }}
            >
              <SessionRow
                entry={entry}
                selected={selectedEntryIds.includes(entry.id)}
                onToggleSelect={() => onToggleEntry(entry.id)}
              />
            </motion.div>
          ))}
        </div>
      </CollapsibleContent>

      {/* Bulk delete confirmation */}
      <Dialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        slotProps={{
          paper: {
            sx: { borderRadius: "18px", maxWidth: 400, backgroundImage: "none" },
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, fontSize: "1.125rem", pb: 0.5 }}>
          Delete {selectedCount} selected {selectedCount === 1 ? "entry" : "entries"}?
        </DialogTitle>
        <DialogContent sx={{ pb: 2 }}>
          <p className="text-sm text-text-secondary">
            This action cannot be undone.
          </p>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <MuiButton
            onClick={() => setConfirmOpen(false)}
            sx={{ borderRadius: "10px", textTransform: "none", fontWeight: 600, color: "text.secondary" }}
          >
            Cancel
          </MuiButton>
          <MuiButton
            variant="contained"
            color="error"
            onClick={handleBulkDelete}
            sx={{ borderRadius: "10px", textTransform: "none", fontWeight: 600 }}
            disableElevation
          >
            Delete entries
          </MuiButton>
        </DialogActions>
      </Dialog>
    </Collapsible>
  );
}

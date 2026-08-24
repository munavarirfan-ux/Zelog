"use client";

import * as React from "react";
import Dialog from "@mui/material/Dialog";
import { X } from "lucide-react";
import { EmployeeProfile, type ProfileTabId } from "./EmployeeProfile";

/**
 * Full employee record shown as a spacious popup instead of a dedicated page.
 * Near full-screen so the record keeps its full-profile feel (not a cramped modal);
 * the same `EmployeeProfile` also still powers the /directory/[id] route.
 */
export function EmployeeProfileDialog({
  employeeId,
  open,
  onClose,
  initialTab,
}: {
  employeeId: string | null;
  open: boolean;
  onClose: () => void;
  initialTab?: ProfileTabId;
}) {
  return (
    <Dialog
      open={open && !!employeeId}
      onClose={onClose}
      fullWidth
      maxWidth={false}
      slotProps={{
        paper: {
          className: "!m-3 !rounded-[24px] !bg-app-bg !shadow-2xl",
          style: { width: "98vw", maxWidth: "none", height: "97vh", maxHeight: "97vh" },
        },
      }}
    >
      {/* Close — pinned to the dialog's top-right corner */}
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute right-4 top-4 z-30 flex h-9 w-9 items-center justify-center rounded-full bg-white text-primary-700 shadow-[0_4px_14px_-2px_rgba(0,0,0,0.35)] ring-1 ring-black/5 transition-colors hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="h-full overflow-y-auto px-5 py-5 sm:px-6 sm:py-6">
        {employeeId ? (
          <EmployeeProfile employeeId={employeeId} onClose={onClose} initialTab={initialTab} />
        ) : null}
      </div>
    </Dialog>
  );
}

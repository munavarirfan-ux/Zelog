"use client";

import * as React from "react";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Divider from "@mui/material/Divider";
import {
  Briefcase, CalendarClock, Eye, Laptop, Pencil, UserMinus,
  type LucideIcon,
} from "lucide-react";
import type { DirectoryPerson } from "./shared";

export type EmployeeAction =
  | "view"
  | "edit"
  | "assign-project"
  | "manage-leave"
  | "assign-asset"
  | "deactivate";

interface ActionDef {
  id: EmployeeAction;
  label: string;
  icon: LucideIcon;
  needsEdit?: boolean;
  danger?: boolean;
  divider?: boolean;
}

const ACTIONS: ActionDef[] = [
  { id: "view", label: "View Profile", icon: Eye },
  { id: "edit", label: "Edit Employee", icon: Pencil, needsEdit: true },
  { id: "assign-project", label: "Assign Project", icon: Briefcase, needsEdit: true, divider: true },
  { id: "manage-leave", label: "Manage Leave", icon: CalendarClock, needsEdit: true },
  { id: "assign-asset", label: "Assign Asset", icon: Laptop, needsEdit: true },
  { id: "deactivate", label: "Deactivate Employee", icon: UserMinus, needsEdit: true, danger: true, divider: true },
];

export function EmployeeActionsMenu({
  anchor,
  person,
  canEdit,
  onClose,
  onAction,
}: {
  anchor: HTMLElement | null;
  person: DirectoryPerson | null;
  canEdit: boolean;
  onClose: () => void;
  onAction: (action: EmployeeAction, person: DirectoryPerson) => void;
}) {
  const items = ACTIONS.filter((a) => (a.needsEdit ? canEdit : true))
    // Deactivating an already-inactive person makes no sense.
    .filter((a) => !(a.id === "deactivate" && person?.employmentStatus === "inactive"));

  return (
    <Menu
      anchorEl={anchor}
      open={!!anchor && !!person}
      onClose={onClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      transformOrigin={{ vertical: "top", horizontal: "right" }}
      slotProps={{ paper: { className: "mt-1 min-w-[196px] rounded-[14px] shadow-lg" } }}
    >
      {items.map((a) => {
        const Icon = a.icon;
        return [
          a.divider ? <Divider key={`${a.id}-div`} className="!my-1" /> : null,
          <MenuItem
            key={a.id}
            onClick={() => {
              if (person) onAction(a.id, person);
              onClose();
            }}
            className="gap-2.5 text-sm"
          >
            <Icon className={a.danger ? "h-4 w-4 text-rose-500" : "h-4 w-4 text-text-tertiary"} />
            <span className={a.danger ? "text-rose-600" : ""}>{a.label}</span>
          </MenuItem>,
        ];
      })}
    </Menu>
  );
}

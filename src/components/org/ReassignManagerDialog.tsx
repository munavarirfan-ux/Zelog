"use client";

import { useEffect, useMemo, useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import MuiButton from "@mui/material/Button";
import { ArrowRight, Users } from "lucide-react";
import { getDescendantIds, type Employee } from "@/data/orgData";

interface ReassignManagerDialogProps {
  open: boolean;
  employee: Employee | null;
  employees: Employee[];
  onClose: () => void;
  onConfirm: (newManagerId: string) => void;
}

export function ReassignManagerDialog({ open, employee, employees, onClose, onConfirm }: ReassignManagerDialogProps) {
  const [newManagerId, setNewManagerId] = useState<string | null>(null);

  useEffect(() => {
    if (open) setNewManagerId(null);
  }, [open, employee?.id]);

  const byId = useMemo(() => new Map(employees.map((e) => [e.id, e])), [employees]);

  const options = useMemo(() => {
    if (!employee) return [];
    // Exclude the employee itself and its descendants to prevent circular reporting.
    const banned = new Set([employee.id, ...getDescendantIds(employees, employee.id)]);
    return employees
      .filter((e) => !banned.has(e.id))
      .map((e) => ({ id: e.id, label: e.name, sub: `${e.jobTitle} · ${e.department}` }));
  }, [employee, employees]);

  if (!employee) return null;

  const currentManager = employee.managerId ? byId.get(employee.managerId) : undefined;
  const movingReports = getDescendantIds(employees, employee.id).length;
  const selected = newManagerId ? options.find((o) => o.id === newManagerId) ?? null : null;
  const valid = Boolean(newManagerId) && newManagerId !== employee.managerId;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" slotProps={{ paper: { sx: { borderRadius: "18px", backgroundImage: "none" } } }}>
      <DialogTitle sx={{ fontWeight: 700, fontSize: "1.125rem" }}>Reassign manager</DialogTitle>
      <DialogContent>
        <p className="text-sm text-text-secondary">
          Move <span className="font-semibold text-text">{employee.name}</span> and their reporting branch to a new manager.
        </p>

        <div className="mt-4 flex items-center gap-3 rounded-xl border border-border/[0.08] bg-surface-2/50 p-3 dark:border-white/[0.06]">
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-medium uppercase tracking-wide text-text-tertiary">Current manager</p>
            <p className="truncate text-sm font-medium text-text">{currentManager?.name ?? "— (top level)"}</p>
          </div>
          <ArrowRight className="h-4 w-4 shrink-0 text-primary-500" />
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-medium uppercase tracking-wide text-text-tertiary">New manager</p>
            <p className="truncate text-sm font-medium text-text">{selected?.label ?? "Not selected"}</p>
          </div>
        </div>

        <div className="mt-4">
          <Autocomplete
            options={options}
            value={selected}
            onChange={(_, v) => setNewManagerId(v?.id ?? null)}
            getOptionLabel={(o) => o.label}
            isOptionEqualToValue={(o, v) => o.id === v.id}
            renderOption={(props, o) => (
              <li {...props} key={o.id}>
                <span className="flex flex-col">
                  <span className="text-sm text-text">{o.label}</span>
                  <span className="text-[11px] text-text-tertiary">{o.sub}</span>
                </span>
              </li>
            )}
            renderInput={(params) => <TextField {...params} label="New manager" required />}
          />
        </div>

        <div className="mt-4 flex items-center gap-2 rounded-xl bg-primary-50 px-3 py-2.5 text-sm text-primary-700 dark:bg-primary-100/30">
          <Users className="h-4 w-4 shrink-0" />
          {movingReports === 0
            ? "No direct reports will move with this employee."
            : `${movingReports} report${movingReports === 1 ? "" : "s"} will move with this employee.`}
        </div>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <MuiButton onClick={onClose} sx={{ borderRadius: "10px", textTransform: "none", fontWeight: 600, color: "text.secondary" }}>
          Cancel
        </MuiButton>
        <MuiButton
          variant="contained"
          color="primary"
          disabled={!valid}
          onClick={() => newManagerId && onConfirm(newManagerId)}
          sx={{ borderRadius: "10px", textTransform: "none", fontWeight: 600 }}
          disableElevation
        >
          Confirm reassignment
        </MuiButton>
      </DialogActions>
    </Dialog>
  );
}

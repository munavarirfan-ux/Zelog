"use client";

import { useEffect, useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import MuiButton from "@mui/material/Button";
import { Check } from "lucide-react";
import { DEPARTMENT_PALETTE, type Department } from "@/data/orgData";
import { cn } from "@/lib/utils";

interface AddDepartmentDialogProps {
  open: boolean;
  departments: Department[];
  onClose: () => void;
  onSubmit: (name: string, color: string) => void;
}

export function AddDepartmentDialog({ open, departments, onClose, onSubmit }: AddDepartmentDialogProps) {
  const usedColors = new Set(departments.map((d) => d.color));
  const firstFree = DEPARTMENT_PALETTE.find((c) => !usedColors.has(c)) ?? DEPARTMENT_PALETTE[0];

  const [name, setName] = useState("");
  const [color, setColor] = useState(firstFree);
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (open) {
      setName("");
      setColor(firstFree);
      setTouched(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const duplicate = departments.some((d) => d.name.trim().toLowerCase() === name.trim().toLowerCase());
  const nameError = touched && (!name.trim() || duplicate);

  function handleSubmit() {
    setTouched(true);
    if (!name.trim() || duplicate) return;
    onSubmit(name.trim(), color);
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs" slotProps={{ paper: { sx: { borderRadius: "18px", backgroundImage: "none" } } }}>
      <DialogTitle sx={{ fontWeight: 700, fontSize: "1.125rem" }}>Add department</DialogTitle>
      <DialogContent>
        <p className="mb-4 text-sm text-text-secondary">Create a new department and pick its indicator color.</p>
        <TextField
          label="Department name"
          fullWidth
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={nameError}
          helperText={nameError ? (duplicate ? "That department already exists" : "Name is required") : undefined}
        />
        <div className="mt-5">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-text-tertiary">Color</p>
          <div className="flex flex-wrap gap-2">
            {DEPARTMENT_PALETTE.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full transition-transform hover:scale-105",
                  color === c ? "ring-2 ring-primary-400 ring-offset-2 ring-offset-surface" : "",
                )}
                style={{ backgroundColor: c }}
                aria-label={`Select color ${c}`}
              >
                {color === c ? <Check className="h-4 w-4 text-white" strokeWidth={3} /> : null}
              </button>
            ))}
          </div>
        </div>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <MuiButton onClick={onClose} sx={{ borderRadius: "10px", textTransform: "none", fontWeight: 600, color: "text.secondary" }}>
          Cancel
        </MuiButton>
        <MuiButton variant="contained" color="primary" onClick={handleSubmit} sx={{ borderRadius: "10px", textTransform: "none", fontWeight: 600 }} disableElevation>
          Add department
        </MuiButton>
      </DialogActions>
    </Dialog>
  );
}

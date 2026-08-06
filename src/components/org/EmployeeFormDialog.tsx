"use client";

import { useEffect, useMemo, useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import MuiButton from "@mui/material/Button";
import { getDescendantIds, type Employee } from "@/data/orgData";
import { useOrgStore, type EmployeePatch, type NewEmployeeInput } from "@/store/orgStore";

interface EmployeeOption {
  id: string;
  label: string;
  sub: string;
}

interface EmployeeFormDialogProps {
  open: boolean;
  mode: "add" | "edit";
  initial: Employee | null;
  employees: Employee[];
  onClose: () => void;
  onSubmit: (input: NewEmployeeInput | EmployeePatch, id?: string) => void;
}

const emptyForm = {
  name: "",
  email: "",
  jobTitle: "",
  location: "",
  department: "Engineering",
  managerId: null as string | null,
  additionalManagerId: null as string | null,
  hrManagerId: null as string | null,
  headId: null as string | null,
};

export function EmployeeFormDialog({ open, mode, initial, employees, onClose, onSubmit }: EmployeeFormDialogProps) {
  const [form, setForm] = useState(emptyForm);
  const [touched, setTouched] = useState(false);
  const departments = useOrgStore((s) => s.departments);

  useEffect(() => {
    if (!open) return;
    setTouched(false);
    if (mode === "edit" && initial) {
      setForm({
        name: initial.name,
        email: initial.email,
        jobTitle: initial.jobTitle,
        location: initial.location ?? "",
        department: initial.department,
        managerId: initial.managerId ?? null,
        additionalManagerId: initial.additionalManagerId ?? null,
        hrManagerId: initial.hrManagerId ?? null,
        headId: initial.headId ?? null,
      });
    } else {
      setForm(emptyForm);
    }
  }, [open, mode, initial]);

  const options: EmployeeOption[] = useMemo(
    () =>
      employees
        .filter((e) => e.id !== initial?.id)
        .map((e) => ({ id: e.id, label: e.name, sub: `${e.jobTitle} · ${e.department}` })),
    [employees, initial?.id],
  );

  // A manager can't be the employee itself or one of its descendants (cycle guard).
  const managerOptions: EmployeeOption[] = useMemo(() => {
    if (mode !== "edit" || !initial) return options;
    const banned = new Set(getDescendantIds(employees, initial.id));
    return options.filter((o) => !banned.has(o.id));
  }, [mode, initial, employees, options]);

  const byId = (id: string | null) => (id ? options.find((o) => o.id === id) ?? null : null);

  const nameError = touched && !form.name.trim();
  const emailError = touched && !/^\S+@\S+\.\S+$/.test(form.email.trim());
  const managerError = touched && mode === "add" && !form.managerId;

  function handleSubmit() {
    setTouched(true);
    if (!form.name.trim()) return;
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) return;
    if (mode === "add" && !form.managerId) return;

    const payload = {
      name: form.name.trim(),
      email: form.email.trim(),
      jobTitle: form.jobTitle.trim() || "—",
      location: form.location.trim() || undefined,
      department: form.department,
      managerId: form.managerId ?? undefined,
      additionalManagerId: form.additionalManagerId ?? undefined,
      hrManagerId: form.hrManagerId ?? undefined,
      headId: form.headId ?? undefined,
    };
    onSubmit(payload, mode === "edit" ? initial?.id : undefined);
  }

  const picker = (
    label: string,
    key: "managerId" | "additionalManagerId" | "hrManagerId" | "headId",
    required = false,
    opts: EmployeeOption[] = options,
  ) => (
    <Autocomplete
      options={opts}
      value={byId(form[key])}
      onChange={(_, v) => setForm((f) => ({ ...f, [key]: v?.id ?? null }))}
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
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          required={required}
          error={key === "managerId" && managerError}
          helperText={key === "managerId" && managerError ? "Manager is required" : undefined}
        />
      )}
    />
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      slotProps={{ paper: { sx: { borderRadius: "18px", backgroundImage: "none" } } }}
    >
      <DialogTitle sx={{ fontWeight: 700, fontSize: "1.125rem" }}>
        {mode === "add" ? "Add employee" : "Edit employee"}
      </DialogTitle>
      <DialogContent>
        <div className="grid grid-cols-1 gap-4 pt-1 sm:grid-cols-2">
          <TextField
            label="Full name"
            required
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            error={nameError}
            helperText={nameError ? "Name is required" : undefined}
          />
          <TextField
            label="Work email"
            required
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            error={emailError}
            helperText={emailError ? "Enter a valid email" : undefined}
          />
          <TextField
            label="Job title"
            value={form.jobTitle}
            onChange={(e) => setForm((f) => ({ ...f, jobTitle: e.target.value }))}
          />
          <TextField
            label="Location"
            value={form.location}
            onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
          />
          <Autocomplete
            options={departments.map((d) => d.name)}
            value={form.department}
            onChange={(_, v) => setForm((f) => ({ ...f, department: v ?? "Engineering" }))}
            disableClearable
            renderInput={(params) => <TextField {...params} label="Department" />}
          />
          <div className="sm:col-span-2">{picker("Manager", "managerId", true, managerOptions)}</div>
          <div className="sm:col-span-2">{picker("Additional Manager", "additionalManagerId")}</div>
          <div className="sm:col-span-2">{picker("HR Manager", "hrManagerId")}</div>
          <div className="sm:col-span-2">{picker("Head", "headId")}</div>
        </div>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <MuiButton onClick={onClose} sx={{ borderRadius: "10px", textTransform: "none", fontWeight: 600, color: "text.secondary" }}>
          Cancel
        </MuiButton>
        <MuiButton variant="contained" color="primary" onClick={handleSubmit} sx={{ borderRadius: "10px", textTransform: "none", fontWeight: 600 }} disableElevation>
          {mode === "add" ? "Add employee" : "Save changes"}
        </MuiButton>
      </DialogActions>
    </Dialog>
  );
}

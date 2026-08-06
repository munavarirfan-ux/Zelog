"use client";

import { useEffect, useMemo, useState } from "react";
import Dialog from "@mui/material/Dialog";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Autocomplete from "@mui/material/Autocomplete";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { format, parseISO } from "date-fns";
import { AlertCircle, UserPlus, X } from "lucide-react";
import {
  activeRequestsFor,
  computeBalances,
  computeWorkingDays,
  LEAVE_TYPES,
  leaveTypeById,
  rangesOverlap,
  type DurationType,
  type HalfDaySession,
  type RequestCategory,
  type TimeOffRequest,
} from "@/data/timeOffData";
import { useOrgStore } from "@/store/orgStore";
import { useTimeOffStore, type NewRequestInput, type RequestPatch } from "@/store/timeOffStore";
import { cn } from "@/lib/utils";

interface RequestTimeOffDialogProps {
  open: boolean;
  /** Subject employee id (self, or chosen when onBehalf). */
  employeeId: string;
  /** Show an employee picker + request-type toggle (admin applying on behalf). */
  onBehalf?: boolean;
  /** When set, the dialog edits this request instead of creating. */
  editing?: TimeOffRequest | null;
  /** Preselected category when creating a new request. */
  initialCategory?: RequestCategory;
  onClose: () => void;
  onSaved: (id: string, employeeId: string) => void;
}

export function RequestTimeOffDialog({ open, employeeId, onBehalf, editing, initialCategory, onClose, onSaved }: RequestTimeOffDialogProps) {
  const employees = useOrgStore((s) => s.employees);
  const requests = useTimeOffStore((s) => s.requests);
  const createRequest = useTimeOffStore((s) => s.createRequest);
  const updateRequest = useTimeOffStore((s) => s.updateRequest);

  const [subjectId, setSubjectId] = useState(employeeId);
  const [category, setCategory] = useState<RequestCategory>("leave");
  const [leaveTypeId, setLeaveTypeId] = useState<string>("annual");
  const [start, setStart] = useState<Date | null>(null);
  const [end, setEnd] = useState<Date | null>(null);
  const [durationType, setDurationType] = useState<DurationType>("full-day");
  const [halfDaySession, setHalfDaySession] = useState<HalfDaySession>("first-half");
  const [reason, setReason] = useState("");
  const [notifyIds, setNotifyIds] = useState<string[]>([]);
  const [showNotify, setShowNotify] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (editing) {
      setSubjectId(editing.employeeId);
      setCategory(editing.requestCategory);
      setLeaveTypeId(editing.leaveTypeId ?? "annual");
      setStart(parseISO(editing.startDate));
      setEnd(parseISO(editing.endDate));
      setDurationType(editing.durationType);
      setHalfDaySession(editing.halfDaySession ?? "first-half");
      setReason(editing.reason);
      setNotifyIds(editing.notifyIds ?? []);
      setShowNotify((editing.notifyIds?.length ?? 0) > 0);
    } else {
      setSubjectId(employeeId);
      setCategory(initialCategory ?? "leave");
      setLeaveTypeId("annual");
      setStart(null);
      setEnd(null);
      setDurationType("full-day");
      setHalfDaySession("first-half");
      setReason("");
      setNotifyIds([]);
      setShowNotify(false);
    }
  }, [open, editing, employeeId, initialCategory]);

  const subject = employees.find((e) => e.id === subjectId);
  const approver = subject?.managerId ? employees.find((e) => e.id === subject.managerId) : undefined;

  const startStr = start ? format(start, "yyyy-MM-dd") : "";
  const endStr = end ? format(end, "yyyy-MM-dd") : "";
  const effectiveEnd = durationType === "half-day" && startStr ? startStr : endStr;

  const days = startStr && effectiveEnd ? computeWorkingDays(startStr, effectiveEnd, durationType) : 0;

  const balances = useMemo(() => computeBalances(subjectId, requests), [subjectId, requests]);
  const activeBalance = category === "leave" ? balances.find((b) => b.key === leaveTypeId) : balances.find((b) => b.key === "wfh");
  const tracksBalance = category === "leave" && (leaveTypeById(leaveTypeId)?.tracksBalance ?? false);

  const overlaps = useMemo(() => {
    if (!startStr || !effectiveEnd) return false;
    return activeRequestsFor(subjectId, requests, editing?.id).some((r) => rangesOverlap(startStr, effectiveEnd, r.startDate, r.endDate));
  }, [startStr, effectiveEnd, subjectId, requests, editing?.id]);

  const exceedsBalance = tracksBalance && activeBalance ? days > activeBalance.available : false;

  const errors: string[] = [];
  if (!subjectId) errors.push("Select an employee.");
  if (category === "leave" && !leaveTypeId) errors.push("Select a leave type.");
  if (!start) errors.push("Select a start date.");
  if (durationType === "full-day" && !end) errors.push("Select an end date.");
  if (start && end && end < start) errors.push("End date can't be before start date.");
  if (start && days === 0) errors.push("Selected range has no working days (weekends/holidays are excluded).");
  if (!reason.trim()) errors.push("Add a reason.");
  if (overlaps) errors.push("This overlaps an existing request.");
  if (exceedsBalance) errors.push(`Not enough balance — ${activeBalance?.available} day(s) available. Use Unpaid Leave instead.`);

  const valid = errors.length === 0;

  const title = editing
    ? "Edit request"
    : onBehalf
      ? "Add time off (on behalf)"
      : category === "wfh"
        ? "Request work from home"
        : "Apply for leave";

  function handleSubmit() {
    if (!valid || !start) return;
    const payload: NewRequestInput = {
      employeeId: subjectId,
      requestCategory: category,
      leaveTypeId: category === "leave" ? leaveTypeId : undefined,
      startDate: startStr,
      endDate: effectiveEnd || startStr,
      durationType,
      halfDaySession: durationType === "half-day" ? halfDaySession : undefined,
      reason: reason.trim(),
      approverIds: approver ? [approver.id] : [],
      notifyIds: notifyIds.length ? notifyIds : undefined,
    };
    if (editing) {
      const patch: RequestPatch = {
        requestCategory: payload.requestCategory,
        leaveTypeId: payload.leaveTypeId,
        startDate: payload.startDate,
        endDate: payload.endDate,
        durationType: payload.durationType,
        halfDaySession: payload.halfDaySession,
        reason: payload.reason,
        notifyIds: payload.notifyIds,
      };
      updateRequest(editing.id, patch);
      onSaved(editing.id, subjectId);
    } else {
      const id = createRequest(payload);
      onSaved(id, subjectId);
    }
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" slotProps={{ paper: { sx: { borderRadius: "20px", backgroundImage: "none" } } }}>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <div className="flex flex-col">
          <div className="flex items-center justify-between border-b border-border/[0.07] p-5 dark:border-white/[0.06]">
            <h3 className="text-base font-semibold text-text">{title}</h3>
            <button type="button" onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg text-text-tertiary hover:bg-surface-2 hover:text-text" aria-label="Close">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="max-h-[70vh] space-y-4 overflow-y-auto p-5">
            {onBehalf && !editing && (
              <>
                <Autocomplete
                  options={employees}
                  getOptionLabel={(e) => e.name}
                  value={subject ?? null}
                  onChange={(_, v) => v && setSubjectId(v.id)}
                  isOptionEqualToValue={(o, v) => o.id === v.id}
                  renderInput={(params) => <TextField {...params} label="Employee" size="small" />}
                />
                <div>
                  <p className="mb-1.5 text-xs font-medium text-text-secondary">Request type</p>
                  <ToggleButtonGroup exclusive value={category} onChange={(_, v) => v && setCategory(v)} size="small" fullWidth>
                    <ToggleButton value="leave" sx={{ textTransform: "none" }}>Leave</ToggleButton>
                    <ToggleButton value="wfh" sx={{ textTransform: "none" }}>Work From Home</ToggleButton>
                  </ToggleButtonGroup>
                </div>
              </>
            )}

            {category === "leave" && (
              <TextField select fullWidth size="small" label="Leave type" value={leaveTypeId} onChange={(e) => setLeaveTypeId(e.target.value)}>
                {LEAVE_TYPES.map((t) => (
                  <MenuItem key={t.id} value={t.id}>
                    <span className="inline-flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: t.color }} />
                      {t.name}
                    </span>
                  </MenuItem>
                ))}
              </TextField>
            )}

            <div className="grid grid-cols-2 gap-3">
              <DatePicker label="Start date" value={start} onChange={setStart} slotProps={{ textField: { size: "small", fullWidth: true } }} />
              <DatePicker
                label="End date"
                value={durationType === "half-day" ? start : end}
                onChange={setEnd}
                disabled={durationType === "half-day"}
                minDate={start ?? undefined}
                slotProps={{ textField: { size: "small", fullWidth: true } }}
              />
            </div>

            <div>
              <p className="mb-1.5 text-xs font-medium text-text-secondary">Duration</p>
              <ToggleButtonGroup exclusive value={durationType} onChange={(_, v) => v && setDurationType(v)} size="small" fullWidth>
                <ToggleButton value="full-day" sx={{ textTransform: "none" }}>Full day</ToggleButton>
                <ToggleButton value="half-day" sx={{ textTransform: "none" }}>Half day</ToggleButton>
              </ToggleButtonGroup>
            </div>

            {durationType === "half-day" && (
              <ToggleButtonGroup exclusive value={halfDaySession} onChange={(_, v) => v && setHalfDaySession(v)} size="small" fullWidth>
                <ToggleButton value="first-half" sx={{ textTransform: "none" }}>First half</ToggleButton>
                <ToggleButton value="second-half" sx={{ textTransform: "none" }}>Second half</ToggleButton>
              </ToggleButtonGroup>
            )}

            <TextField label="Reason" multiline minRows={4} fullWidth size="small" value={reason} onChange={(e) => setReason(e.target.value)} />

            {/* People to notify */}
            {showNotify ? (
              <Autocomplete
                multiple
                size="small"
                options={employees.filter((e) => e.id !== subjectId)}
                getOptionLabel={(e) => e.name}
                value={employees.filter((e) => notifyIds.includes(e.id))}
                onChange={(_, v) => setNotifyIds(v.map((e) => e.id))}
                isOptionEqualToValue={(o, v) => o.id === v.id}
                renderInput={(params) => <TextField {...params} label="People to notify" placeholder="Search people…" />}
              />
            ) : (
              <button
                type="button"
                onClick={() => setShowNotify(true)}
                className="inline-flex h-9 items-center gap-1.5 rounded-[10px] border border-dashed border-border/20 px-3 text-[13px] font-medium text-text-secondary transition-colors hover:bg-surface-2 dark:border-white/15"
              >
                <UserPlus className="h-4 w-4" /> Add people to notify
              </button>
            )}

            {errors.length > 0 && start && (
              <div className="flex items-start gap-2 rounded-xl bg-danger/10 px-3 py-2.5 text-sm text-danger">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{errors[0]}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 border-t border-border/[0.07] p-4 dark:border-white/[0.06]">
            <button type="button" onClick={onClose} className="h-10 flex-1 rounded-[12px] border border-border/[0.1] bg-surface text-sm font-semibold text-text-secondary transition-colors hover:bg-surface-2 dark:border-white/10">
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!valid}
              className={cn(
                "h-10 flex-1 rounded-[12px] text-sm font-semibold text-white transition-opacity",
                valid ? "bg-primary-gradient hover:opacity-95" : "cursor-not-allowed bg-primary-300",
              )}
            >
              {editing ? "Save changes" : "Submit request"}
            </button>
          </div>
        </div>
      </LocalizationProvider>
    </Dialog>
  );
}

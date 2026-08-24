"use client";

import { useState } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import Dialog from "@mui/material/Dialog";
import MuiTextField from "@mui/material/TextField";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import { Laptop, X } from "lucide-react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useAttendanceStore } from "@/store/attendanceStore";
import { Button } from "@/components/ui/button";

type Duration = "Full day" | "Half day";

/**
 * Self-contained "Apply WFH" control for the Attendance hero: a primary button
 * + a small dialog that raises a Work From Home attendance request for approval.
 * Styled for a dark gradient hero surface.
 */
export function ApplyWfhButton() {
  const { currentUser } = useCurrentUser();
  const submit = useAttendanceStore((s) => s.submitRequest);

  const [open, setOpen] = useState(false);
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [duration, setDuration] = useState<Duration>("Full day");
  const [reason, setReason] = useState("");

  function handleSubmit() {
    submit({
      employeeId: currentUser.id,
      type: "wfh",
      date,
      detail: `WFH — ${duration}`,
      reason: reason.trim(),
    });
    toast.success("Work from home request submitted for approval");
    setOpen(false);
    setReason("");
    setDuration("Full day");
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex min-h-[46px] shrink-0 items-center justify-center gap-2 rounded-[14px] bg-white px-5 text-sm font-semibold text-primary-700 shadow-[0_8px_24px_-8px_rgba(0,0,0,0.4)] transition-all duration-200 hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 active:scale-[0.98]"
      >
        <Laptop className="h-[18px] w-[18px]" strokeWidth={2} />
        Apply WFH
      </button>

      <Dialog open={open} onClose={() => setOpen(false)} slotProps={{ paper: { sx: { borderRadius: "20px", maxWidth: 440, width: "100%", backgroundImage: "none" } } }}>
        <div className="p-5 sm:p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-text">Apply for work from home</h2>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close" className="flex h-8 w-8 items-center justify-center rounded-lg text-text-tertiary hover:bg-surface-2"><X className="h-4 w-4" /></button>
          </div>
          <div className="space-y-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-text-secondary">Date</label>
              <MuiTextField type="date" value={date} onChange={(e) => setDate(e.target.value)} fullWidth size="small" sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px" } }} />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-text-secondary">Duration</label>
              <ToggleButtonGroup exclusive value={duration} onChange={(_, v) => v && setDuration(v)} size="small" fullWidth>
                <ToggleButton value="Full day" sx={{ textTransform: "none" }}>Full day</ToggleButton>
                <ToggleButton value="Half day" sx={{ textTransform: "none" }}>Half day</ToggleButton>
              </ToggleButtonGroup>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-text-secondary">Reason</label>
              <MuiTextField value={reason} onChange={(e) => setReason(e.target.value)} multiline minRows={3} fullWidth placeholder="Add a short explanation…" sx={{ "& .MuiOutlinedInput-root": { borderRadius: "12px" } }} />
            </div>
          </div>
          <div className="mt-5 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={!reason.trim()}>Submit</Button>
          </div>
        </div>
      </Dialog>
    </>
  );
}

"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { Clock, LogOut } from "lucide-react";
import { WebClockInDialog } from "./WebClockInDialog";

/**
 * Self-contained Web Clock-In / Clock-Out control (button + verification dialog
 * + elapsed-time pill). Styled for a dark gradient hero surface.
 */
export function WebClockButton() {
  const [clockedIn, setClockedIn] = useState(false);
  const [clockInAt, setClockInAt] = useState<Date | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  function handleWebClock() {
    if (clockedIn) {
      setClockedIn(false);
      setClockInAt(null);
      toast.success(`Clocked out at ${format(new Date(), "hh:mm a")}`);
    } else {
      setDialogOpen(true);
    }
  }

  return (
    <>
      {clockInAt ? <SinceTimer since={clockInAt} /> : null}
      <button
        type="button"
        onClick={handleWebClock}
        className="inline-flex min-h-[46px] shrink-0 items-center justify-center gap-2 rounded-[14px] border border-white/20 bg-white/10 px-5 text-sm font-semibold text-white backdrop-blur transition-all duration-200 hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 active:scale-[0.98]"
      >
        {clockedIn ? <LogOut className="h-[18px] w-[18px]" strokeWidth={2} /> : <Clock className="h-[18px] w-[18px]" strokeWidth={2} />}
        {clockedIn ? "Web Clock-Out" : "Web Clock-In"}
      </button>

      <WebClockInDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onComplete={({ timeLabel }) => {
          setClockedIn(true);
          setClockInAt(new Date());
          toast.success(`Clocked in at ${timeLabel}`);
        }}
      />
    </>
  );
}

/* ── Elapsed time since clock-in ── */
function SinceTimer({ since }: { since: Date }) {
  const [, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((n) => n + 1), 15_000);
    return () => clearInterval(id);
  }, []);

  const totalMin = Math.max(0, Math.floor((Date.now() - since.getTime()) / 60_000));
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;

  return (
    <span className="inline-flex min-h-[46px] items-center gap-2 rounded-[14px] bg-black/25 px-4 backdrop-blur">
      <span className="text-sm font-bold tabular-nums text-white">{h}h:{m}m</span>
      <span className="text-xs font-medium text-white/60">Since Clock-In</span>
    </span>
  );
}

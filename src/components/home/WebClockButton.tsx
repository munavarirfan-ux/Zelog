"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { Clock, LogOut } from "lucide-react";
import { WebClockInDialog } from "./WebClockInDialog";
import { useAttendanceStore } from "@/store/attendanceStore";
import { sampleVerification } from "@/data/attendanceData";

/**
 * Self-contained Web Clock-In / Clock-Out control (button + verification dialog
 * + elapsed-time pill). Styled for a dark gradient hero surface. Backed by the
 * shared attendance store so a clock-in from anywhere (Home or the Attendance
 * page) populates the same "today" state, timeline and verification panel.
 */
export function WebClockButton() {
  const mode = useAttendanceStore((s) => s.mode);
  const checkedIn = useAttendanceStore((s) => s.checkedIn);
  const checkInAt = useAttendanceStore((s) => s.checkInAt);
  const checkIn = useAttendanceStore((s) => s.checkIn);
  const checkOut = useAttendanceStore((s) => s.checkOut);
  const [dialogOpen, setDialogOpen] = useState(false);

  function handleWebClock() {
    if (checkedIn) {
      const timeLabel = format(new Date(), "hh:mm a");
      checkOut(timeLabel);
      toast.success(`Clocked out at ${timeLabel}`);
    } else {
      setDialogOpen(true);
    }
  }

  return (
    <>
      {checkedIn && checkInAt ? <SinceTimer since={new Date(checkInAt)} /> : null}
      <button
        type="button"
        onClick={handleWebClock}
        className="inline-flex min-h-[46px] shrink-0 items-center justify-center gap-2 rounded-[14px] border border-white/20 bg-white/10 px-5 text-sm font-semibold text-white backdrop-blur transition-all duration-200 hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 active:scale-[0.98]"
      >
        {checkedIn ? <LogOut className="h-[18px] w-[18px]" strokeWidth={2} /> : <Clock className="h-[18px] w-[18px]" strokeWidth={2} />}
        {checkedIn ? "Web Clock-Out" : "Web Clock-In"}
      </button>

      <WebClockInDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onComplete={(info) => {
          // Fold the live-captured location, timezone and selfie into a full
          // verification record so the hero + Verification panel reflect reality.
          const verification = sampleVerification(mode, {
            address: info.address,
            timezone: info.timezone,
            photo: !!info.selfieUrl,
            selfieUrl: info.selfieUrl,
            ...(info.coords
              ? { lat: info.coords.lat, lng: info.coords.lng, accuracy: info.coords.accuracy, gps: true }
              : {}),
          });
          checkIn({ mode, timeLabel: info.timeLabel, verification });
          toast.success(`Clocked in at ${info.timeLabel}`);
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

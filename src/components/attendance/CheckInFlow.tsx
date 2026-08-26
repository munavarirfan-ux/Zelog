"use client";

import { useEffect, useMemo, useState } from "react";
import Dialog from "@mui/material/Dialog";
import CircularProgress from "@mui/material/CircularProgress";
import { CheckCircle2, Camera, Clock, MapPin, Smartphone, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import {
  CLIENTS, MODES, sampleVerification,
  type AttendanceMode, type VerificationMeta,
} from "@/data/attendanceData";
import type { CheckInPayload } from "@/store/attendanceStore";

type Step = "client" | "gps" | "selfie" | "address" | "device" | "done";

/** Real IANA timezone from the device, formatted with its GMT offset. */
function deviceTimezone(): string {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const offMin = -new Date().getTimezoneOffset();
    const sign = offMin >= 0 ? "+" : "-";
    const h = Math.floor(Math.abs(offMin) / 60);
    const m = Math.abs(offMin) % 60;
    return `${tz} (GMT${sign}${h}${m ? `:${String(m).padStart(2, "0")}` : ""})`;
  } catch {
    return "Unknown";
  }
}

function buildSteps(mode: AttendanceMode): Step[] {
  if (mode === "office") return ["gps", "done"];
  if (mode === "wfh") return ["gps", "selfie", "address", "device", "done"];
  return ["client", "gps", "selfie", "done"]; // client visit
}

const STEP_META: Record<Exclude<Step, "client" | "done">, { icon: typeof MapPin; title: string; detail: string }> = {
  gps: { icon: MapPin, title: "Verifying location", detail: "Reading GPS coordinates…" },
  selfie: { icon: Camera, title: "Capturing selfie", detail: "Hold still — verifying identity…" },
  address: { icon: MapPin, title: "Resolving address", detail: "Matching your location…" },
  device: { icon: Smartphone, title: "Recording device", detail: "Logging device, browser & network…" },
};

export function CheckInFlow({
  open,
  mode,
  onClose,
  onComplete,
}: {
  open: boolean;
  mode: AttendanceMode;
  onClose: () => void;
  onComplete: (payload: CheckInPayload) => void;
}) {
  const cfg = MODES[mode];
  const steps = useMemo(() => buildSteps(mode), [mode]);
  const [idx, setIdx] = useState(0);
  const [clientId, setClientId] = useState(CLIENTS[0].id);
  const step = steps[idx];

  // Device context captured live at check-in: timezone (always available) and
  // GPS coordinates (best-effort — falls back to the sampled location if the
  // browser denies permission or has no location service).
  const [captured, setCaptured] = useState<{
    timezone: string;
    coords?: { lat: number; lng: number; accuracy: number };
  }>({ timezone: "Asia/Kolkata (GMT+5:30)" });

  // Reset when (re)opened.
  useEffect(() => {
    if (open) {
      setIdx(0);
      setClientId(CLIENTS[0].id);
      setCaptured({ timezone: deviceTimezone() });
      if (typeof navigator !== "undefined" && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) =>
            setCaptured((c) => ({
              ...c,
              coords: {
                lat: Number(pos.coords.latitude.toFixed(5)),
                lng: Number(pos.coords.longitude.toFixed(5)),
                accuracy: Math.round(pos.coords.accuracy),
              },
            })),
          () => {
            /* Permission denied / unavailable — keep the sampled coordinates. */
          },
          { enableHighAccuracy: true, timeout: 4000, maximumAge: 60000 },
        );
      }
    }
  }, [open, mode]);

  // Auto-advance simulated steps.
  useEffect(() => {
    if (!open) return;
    if (step === "client" || step === "done") return;
    const t = setTimeout(() => setIdx((i) => Math.min(i + 1, steps.length - 1)), 1050);
    return () => clearTimeout(t);
  }, [open, step, steps.length]);

  function finish() {
    const timeLabel = format(new Date(), "hh:mm a");
    const address =
      mode === "office" ? "Hitec City, Hyderabad" :
      mode === "wfh" ? "Banjara Hills, Hyderabad" :
      CLIENTS.find((c) => c.id === clientId)?.site ?? "Client site";
    const verification: VerificationMeta = sampleVerification(mode, {
      address,
      timezone: captured.timezone,
      // When a real fix came back, record the actual coordinates + accuracy.
      ...(captured.coords
        ? { lat: captured.coords.lat, lng: captured.coords.lng, accuracy: captured.coords.accuracy, gps: true }
        : {}),
    });
    onComplete({ mode, timeLabel, verification, clientId: mode === "client" ? clientId : undefined });
  }

  const stepNumber = steps.filter((s) => s !== "done").length;
  const currentNumber = Math.min(idx + 1, stepNumber);
  const selfieUrl = "https://i.pravatar.cc/200?img=15";

  return (
    <Dialog open={open} onClose={onClose} slotProps={{ paper: { sx: { borderRadius: "24px", maxWidth: 420, width: "100%", backgroundImage: "none" } } }}>
      <div className="p-5 sm:p-6">
        {/* Header */}
        <div className="mb-5 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-[13px] text-white shadow-sm" style={{ background: `linear-gradient(135deg, ${cfg.color}, ${cfg.color}B3)` }}>
            <cfg.icon className="h-5 w-5" strokeWidth={2} />
          </span>
          <div className="flex-1">
            <h2 className="text-base font-semibold text-text">Check in</h2>
            <p className="text-xs text-text-tertiary">{cfg.label}</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="flex h-8 w-8 items-center justify-center rounded-lg text-text-tertiary transition-colors hover:bg-surface-2">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Step progress dots */}
        {step !== "done" ? (
          <div className="mb-5 flex items-center gap-1.5">
            {steps.filter((s) => s !== "done").map((_, i) => (
              <span key={i} className="h-1.5 flex-1 rounded-full transition-colors" style={{ backgroundColor: i <= idx ? cfg.color : "rgb(var(--border-rgb)/0.14)" }} />
            ))}
          </div>
        ) : null}

        {/* Body */}
        {step === "client" ? (
          <div className="space-y-4">
            <div>
              <p className="text-sm font-semibold text-text">Which client are you visiting?</p>
              <p className="text-xs text-text-tertiary">This is saved with your attendance record.</p>
            </div>
            <Select value={clientId} onValueChange={setClientId}>
              <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
              <SelectContent>
                {CLIENTS.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name} · {c.site}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button className="w-full" onClick={() => setIdx((i) => i + 1)}>Continue</Button>
          </div>
        ) : step === "done" ? (
          <div className="flex flex-col items-center py-2 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[#34D3991A] text-[#0F9E6E]">
              <CheckCircle2 className="h-9 w-9" strokeWidth={2} />
            </span>
            <p className="mt-3 text-base font-semibold text-text">Checked in successfully</p>
            <p className="text-sm text-text-secondary">
              {cfg.label}
              {mode === "client" ? ` · ${CLIENTS.find((c) => c.id === clientId)?.name}` : ""}
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-[#34D3991F] px-2.5 py-1 text-[11px] font-semibold text-[#0F9E6E]"><CheckCircle2 className="h-3.5 w-3.5" /> GPS Verified</span>
              {cfg.requiresSelfie ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-[#34D3991F] px-2.5 py-1 text-[11px] font-semibold text-[#0F9E6E]"><CheckCircle2 className="h-3.5 w-3.5" /> Photo Verified</span>
              ) : null}
            </div>
            <div className="mt-3 w-full space-y-1 rounded-[12px] bg-surface-2 px-3 py-2.5 text-left text-[11px] text-text-tertiary">
              <p className="flex items-center gap-1.5"><MapPin className="h-3 w-3" /> {captured.coords ? `${captured.coords.lat}, ${captured.coords.lng} · ±${captured.coords.accuracy}m` : "Location captured"}</p>
              <p className="flex items-center gap-1.5"><Clock className="h-3 w-3" /> {captured.timezone}</p>
            </div>
            <Button className="mt-5 w-full" onClick={finish}>Done</Button>
          </div>
        ) : step === "selfie" ? (
          <div className="flex flex-col items-center py-2 text-center">
            <div className="relative h-40 w-40 overflow-hidden rounded-[20px] border border-border/[0.08] bg-surface-2">
              <img src={selfieUrl} alt="" className="h-full w-full object-cover" />
              <span className="pointer-events-none absolute inset-2 rounded-[14px] border-2 border-white/70" />
              <span className="absolute inset-x-0 top-0 h-0.5 animate-pulse bg-white/80" />
            </div>
            <div className="mt-4 flex items-center gap-2 text-sm text-text-secondary">
              <CircularProgress size={16} thickness={5} sx={{ color: cfg.color }} />
              {STEP_META.selfie.detail}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center py-6 text-center">
            <span className="relative flex h-16 w-16 items-center justify-center rounded-full" style={{ backgroundColor: `${cfg.color}1A`, color: cfg.color }}>
              {(() => { const Icon = STEP_META[step].icon; return <Icon className="h-7 w-7" strokeWidth={2} />; })()}
              <CircularProgress size={64} thickness={3} sx={{ color: cfg.color, position: "absolute", inset: 0 }} />
            </span>
            <p className="mt-4 text-sm font-semibold text-text">{STEP_META[step].title}</p>
            <p className="text-xs text-text-tertiary">{STEP_META[step].detail}</p>
            <p className="mt-1 text-[11px] font-medium text-text-tertiary">Step {currentNumber} of {stepNumber}</p>
          </div>
        )}
      </div>
    </Dialog>
  );
}

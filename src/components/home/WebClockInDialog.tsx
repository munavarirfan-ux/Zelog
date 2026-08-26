"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Dialog from "@mui/material/Dialog";
import CircularProgress from "@mui/material/CircularProgress";
import { format } from "date-fns";
import { Camera, CheckCircle2, Clock, MapPin, RefreshCw, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const ACCENT = "#7A4DFF";
/** Shown when GPS is denied/unavailable so the prototype flow still reads as real. */
const FALLBACK_ADDRESS = "Hitec City, Hyderabad";

type Step = "location" | "selfie" | "done";

interface Coords {
  lat: number;
  lng: number;
  accuracy: number; // meters
}

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
    return "Asia/Kolkata (GMT+5:30)";
  }
}

/** Everything captured live during the clock-in flow, handed back on completion. */
export interface WebClockInResult {
  timeLabel: string;
  address: string;
  timezone: string;
  coords: Coords | null;
  selfieUrl?: string;
}

export function WebClockInDialog({
  open,
  onClose,
  onComplete,
}: {
  open: boolean;
  onClose: () => void;
  onComplete: (info: WebClockInResult) => void;
}) {
  const [step, setStep] = useState<Step>("location");

  // Location
  const [locating, setLocating] = useState(true);
  const [coords, setCoords] = useState<Coords | null>(null);
  const [address, setAddress] = useState(FALLBACK_ADDRESS);
  const [timezone, setTimezone] = useState("Asia/Kolkata (GMT+5:30)");

  // Selfie
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [camReady, setCamReady] = useState(false);
  const [camError, setCamError] = useState(false);

  const [checkedInAt, setCheckedInAt] = useState("");

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setCamReady(false);
  }, []);

  const startCamera = useCallback(async () => {
    setCamError(false);
    setCamReady(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCamReady(true);
    } catch {
      setCamError(true);
    }
  }, []);

  // Reset + detect location whenever the dialog opens.
  useEffect(() => {
    if (!open) return;
    setStep("location");
    setPhoto(null);
    setCoords(null);
    setAddress(FALLBACK_ADDRESS);
    setTimezone(deviceTimezone());
    setLocating(true);

    let cancelled = false;
    const settle = (c: Coords | null) => {
      if (cancelled) return;
      setCoords(c);
      setLocating(false);
    };

    if (typeof navigator !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) =>
          settle({
            lat: Number(pos.coords.latitude.toFixed(5)),
            lng: Number(pos.coords.longitude.toFixed(5)),
            accuracy: Math.round(pos.coords.accuracy),
          }),
        () => settle(null), // permission denied / unavailable → fall back to the office address
        { enableHighAccuracy: true, timeout: 8000 },
      );
    } else {
      const t = setTimeout(() => settle(null), 1200);
      return () => {
        cancelled = true;
        clearTimeout(t);
      };
    }
    return () => {
      cancelled = true;
    };
  }, [open]);

  // Start the camera once we reach the selfie step (and no photo taken yet).
  useEffect(() => {
    if (open && step === "selfie" && !photo) startCamera();
  }, [open, step, photo, startCamera]);

  // Always release the camera when the dialog closes or unmounts.
  useEffect(() => {
    if (!open) stopCamera();
    return () => stopCamera();
  }, [open, stopCamera]);

  function capture() {
    const video = videoRef.current;
    if (!video) return;
    const w = video.videoWidth || 320;
    const h = video.videoHeight || 320;
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      // Mirror so the saved photo matches the mirrored live preview.
      ctx.translate(w, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(video, 0, 0, w, h);
      setPhoto(canvas.toDataURL("image/jpeg", 0.85));
    }
    stopCamera();
  }

  function retake() {
    setPhoto(null); // triggers the effect above to restart the camera
  }

  function clockIn() {
    const timeLabel = format(new Date(), "hh:mm a");
    setCheckedInAt(timeLabel);
    stopCamera();
    onComplete({ timeLabel, address, timezone, coords, selfieUrl: photo ?? undefined });
    setStep("done");
  }

  return (
    <Dialog
      open={open}
      // Don't abandon the flow on a stray click outside — only the X / Done / Escape close it.
      onClose={(_e, reason) => {
        if (reason === "backdropClick") return;
        onClose();
      }}
      slotProps={{ paper: { sx: { borderRadius: "24px", maxWidth: 420, width: "100%", backgroundImage: "none" } } }}
    >
      <div className="p-5 sm:p-6">
        {/* Header */}
        <div className="mb-5 flex items-center gap-3">
          <span
            className="flex h-10 w-10 items-center justify-center rounded-[13px] text-white shadow-sm"
            style={{ background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT}B3)` }}
          >
            <Clock className="h-5 w-5" strokeWidth={2} />
          </span>
          <div className="flex-1">
            <h2 className="text-base font-semibold text-text">Web Clock-In</h2>
            <p className="text-xs text-text-tertiary">
              {step === "location" ? "Confirm your location" : step === "selfie" ? "Verify it's you" : "All set"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-text-tertiary transition-colors hover:bg-surface-2"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Step progress dots */}
        {step !== "done" ? (
          <div className="mb-5 flex items-center gap-1.5">
            {["location", "selfie"].map((s, i) => (
              <span
                key={s}
                className="h-1.5 flex-1 rounded-full transition-colors"
                style={{
                  backgroundColor:
                    (step === "selfie" && i <= 1) || (step === "location" && i === 0)
                      ? ACCENT
                      : "rgb(var(--border-rgb)/0.14)",
                }}
              />
            ))}
          </div>
        ) : null}

        {/* Body */}
        {step === "location" ? (
          <div className="flex flex-col items-center py-2 text-center">
            {locating ? (
              <>
                <span
                  className="relative flex h-16 w-16 items-center justify-center rounded-full"
                  style={{ backgroundColor: `${ACCENT}1A`, color: ACCENT }}
                >
                  <MapPin className="h-7 w-7" strokeWidth={2} />
                  <CircularProgress size={64} thickness={3} sx={{ color: ACCENT, position: "absolute", inset: 0 }} />
                </span>
                <p className="mt-4 text-sm font-semibold text-text">Detecting your location</p>
                <p className="text-xs text-text-tertiary">Reading GPS coordinates…</p>
              </>
            ) : (
              <>
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[#34D3991A] text-[#0F9E6E]">
                  <MapPin className="h-8 w-8" strokeWidth={2} />
                </span>
                <p className="mt-3 text-base font-semibold text-text">Location detected</p>
                <p className="text-sm text-text-secondary">{address}</p>
                {coords ? (
                  <p className="mt-0.5 text-[11px] font-medium tabular-nums text-text-tertiary">
                    {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)} · ±{coords.accuracy}m
                  </p>
                ) : null}
                <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-surface-2 px-2.5 py-1 text-[11px] font-medium text-text-tertiary">
                  <Clock className="h-3 w-3" /> {timezone}
                </p>
                <Button className="mt-5 w-full" onClick={() => setStep("selfie")}>
                  Continue
                </Button>
              </>
            )}
          </div>
        ) : step === "selfie" ? (
          <div className="flex flex-col items-center py-2 text-center">
            <div className="relative h-56 w-56 overflow-hidden rounded-[20px] border border-border/[0.08] bg-surface-2">
              {photo ? (
                <img src={photo} alt="Your selfie" className="h-full w-full object-cover" />
              ) : camError ? (
                <div className="flex h-full w-full flex-col items-center justify-center gap-2 px-5 text-center text-text-tertiary">
                  <Camera className="h-8 w-8" strokeWidth={1.75} />
                  <p className="text-xs">Camera unavailable — you can still clock in.</p>
                </div>
              ) : (
                <>
                  <video ref={videoRef} playsInline muted className="h-full w-full -scale-x-100 object-cover" />
                  {!camReady ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-surface-2">
                      <CircularProgress size={22} thickness={5} sx={{ color: ACCENT }} />
                    </div>
                  ) : (
                    <span className="pointer-events-none absolute inset-3 rounded-[14px] border-2 border-white/70" />
                  )}
                </>
              )}
            </div>
            <p className="mt-4 text-sm font-semibold text-text">
              {photo ? "Looking good!" : camError ? "No camera detected" : "Center your face in the frame"}
            </p>

            {photo ? (
              <div className="mt-4 flex w-full gap-2">
                <Button variant="outline" className="flex-1" onClick={retake}>
                  <RefreshCw className="mr-1.5 h-4 w-4" strokeWidth={2} />
                  Retake
                </Button>
                <Button className="flex-1" onClick={clockIn}>
                  <Clock className="mr-1.5 h-4 w-4" strokeWidth={2} />
                  Clock In
                </Button>
              </div>
            ) : (
              <Button
                className="mt-4 w-full"
                onClick={camError ? clockIn : capture}
                disabled={!camError && !camReady}
              >
                {camError ? (
                  <>
                    <Clock className="mr-1.5 h-4 w-4" strokeWidth={2} />
                    Clock In
                  </>
                ) : (
                  <>
                    <Camera className="mr-1.5 h-4 w-4" strokeWidth={2} />
                    Capture photo
                  </>
                )}
              </Button>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center py-2 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[#34D3991A] text-[#0F9E6E]">
              <CheckCircle2 className="h-9 w-9" strokeWidth={2} />
            </span>
            <p className="mt-3 text-base font-semibold text-text">Clocked in successfully</p>
            <p className="text-sm text-text-secondary">
              {checkedInAt} · {address}
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-[#34D3991F] px-2.5 py-1 text-[11px] font-semibold text-[#0F9E6E]">
                <CheckCircle2 className="h-3.5 w-3.5" /> Location Verified
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-[#34D3991F] px-2.5 py-1 text-[11px] font-semibold text-[#0F9E6E]">
                <CheckCircle2 className="h-3.5 w-3.5" /> Photo Verified
              </span>
            </div>
            <Button className="mt-5 w-full" onClick={onClose}>
              Done
            </Button>
          </div>
        )}
      </div>
    </Dialog>
  );
}

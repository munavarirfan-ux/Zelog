"use client";

import { useRef, useState } from "react";
import Drawer from "@mui/material/Drawer";
import { CheckCircle2, ImageUp, Info, PartyPopper, UploadCloud, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { GeneratedTemplatePreview } from "@/components/celebrations/GeneratedTemplatePreview";
import { useCelebrationStore, useHydratedCelebrations, type TemplateSource } from "@/store/celebrationStore";
import { ANNIVERSARIES_TODAY, BIRTHDAYS_TODAY, type CelebrationKind } from "@/data/celebrationsData";
import { cn } from "@/lib/utils";

function sampleEmployees(kind: CelebrationKind, count: number) {
  const list = kind === "birthday" ? BIRTHDAYS_TODAY : ANNIVERSARIES_TODAY;
  return list.slice(0, Math.min(count, list.length));
}

/* ── Template card ── */

function TemplateCard({ kind, onReplace, onPreview }: { kind: CelebrationKind; onReplace: () => void; onPreview: () => void }) {
  const isBirthday = kind === "birthday";
  const template = useCelebrationStore((s) => s.templates[kind]);
  const setSource = useCelebrationStore((s) => s.setTemplateSource);
  const showCustomImage = template.source === "custom" && template.customThumb;

  return (
    <div className="rounded-card border border-border/[0.07] bg-surface p-4 shadow-card dark:border-white/[0.06]">
      <div className="mb-3 flex items-center gap-2">
        <h3 className="flex-1 text-sm font-semibold text-text">{isBirthday ? "Birthday Template" : "Work Anniversary Template"}</h3>
        <span className="inline-flex items-center gap-1 rounded-full bg-[#34D3991A] px-2 py-0.5 text-[11px] font-semibold text-[#0F9E6E]">
          <CheckCircle2 className="h-3 w-3" /> Active
        </span>
      </div>

      {/* Thumbnail */}
      <div className="overflow-hidden rounded-[14px] border border-border/[0.06]">
        {showCustomImage ? (
          <img src={template.customThumb as string} alt="" className="aspect-[16/9] w-full object-cover" />
        ) : (
          <div className="max-h-[190px] overflow-hidden">
            <GeneratedTemplatePreview kind={kind} employees={sampleEmployees(kind, 4)} />
          </div>
        )}
      </div>

      {/* Source toggle */}
      <div className="mt-3 flex items-center gap-4">
        {(["custom", "default"] as TemplateSource[]).map((src) => (
          <label key={src} className="inline-flex cursor-pointer items-center gap-1.5 text-xs font-medium text-text-secondary">
            <input
              type="radio"
              name={`src-${kind}`}
              checked={template.source === src}
              onChange={() => setSource(kind, src)}
              className="h-3.5 w-3.5 accent-primary-600"
            />
            {src === "custom" ? "Custom Template" : "Zelog Default"}
          </label>
        ))}
      </div>

      <div className="mt-3 flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={onPreview}>Preview</Button>
        <Button variant="outline" size="sm" onClick={onReplace}>Replace Template</Button>
      </div>
    </div>
  );
}

/* ── Upload / setup drawer ── */

function TemplateUploadDrawer({
  open,
  kind,
  mode,
  onClose,
}: {
  open: boolean;
  kind: CelebrationKind | null;
  mode: "replace" | "preview";
  onClose: () => void;
}) {
  const setCustomTemplate = useCelebrationStore((s) => s.setCustomTemplate);
  const templates = useCelebrationStore((s) => s.templates);
  const [step, setStep] = useState<"upload" | "photoArea" | "preview">("upload");
  const [uploaded, setUploaded] = useState<string | null>(null);
  const [areaSelected, setAreaSelected] = useState(true);
  const [count, setCount] = useState(4);
  const fileRef = useRef<HTMLInputElement>(null);

  const isBirthday = kind === "birthday";
  const title = isBirthday ? "Birthday" : "Anniversary";

  // When opened, decide starting step.
  function readFile(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      setUploaded(reader.result as string);
      setStep("photoArea");
    };
    reader.readAsDataURL(file);
  }

  function handleSave() {
    if (!kind) return;
    setCustomTemplate(kind, uploaded ?? "");
    toast.success(`${title} template saved and activated`);
    onClose();
  }

  // Reset per-open state via key remount handled by parent (open toggles).
  const startStep = mode === "preview" ? "preview" : step;
  const previewImage = uploaded ?? (kind ? templates[kind].customThumb : null);

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      slotProps={{ paper: { sx: { width: 520, maxWidth: "100vw", backgroundImage: "none" } } }}
    >
      {kind ? (
        <div className="flex h-full flex-col">
          <div className="flex items-start justify-between border-b border-border/[0.06] px-5 py-4">
            <div>
              <h2 className="text-base font-semibold text-text">
                {mode === "preview" ? `${title} Template` : `Upload ${title} Template`}
              </h2>
              <p className="mt-0.5 text-xs text-text-tertiary">Employee photos are placed into the photo area automatically.</p>
            </div>
            <button type="button" onClick={onClose} aria-label="Close" className="flex h-8 w-8 items-center justify-center rounded-lg text-text-tertiary transition-colors hover:bg-surface-2">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto p-5">
            {/* Step: upload */}
            {startStep === "upload" ? (
              <div>
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const f = e.dataTransfer.files?.[0];
                    if (f) readFile(f);
                  }}
                  className="flex flex-col items-center justify-center gap-3 rounded-[16px] border-2 border-dashed border-border/20 bg-surface-2/30 px-6 py-12 text-center"
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[rgba(122,77,255,0.1)] text-primary-600">
                    <UploadCloud className="h-6 w-6" />
                  </span>
                  <p className="text-sm font-semibold text-text">Drop your template here</p>
                  <p className="text-xs text-text-tertiary">PNG or JPG · Recommended 1600 × 900px</p>
                  <input ref={fileRef} type="file" accept="image/png,image/jpeg" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) readFile(f); }} />
                  <Button variant="outline" size="sm" className="mt-1 gap-1.5" onClick={() => fileRef.current?.click()}>
                    <ImageUp className="h-4 w-4" /> Choose File
                  </Button>
                </div>
              </div>
            ) : null}

            {/* Step: photo area */}
            {startStep === "photoArea" ? (
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-semibold text-text">Employee Photo Area</p>
                  <p className="text-xs text-text-tertiary">Choose where employee photos should appear inside this template.</p>
                </div>
                <div className="relative overflow-hidden rounded-[16px] border border-border/[0.08]">
                  {previewImage ? (
                    <img src={previewImage} alt="" className="aspect-[16/9] w-full object-cover" />
                  ) : (
                    <div className="aspect-[16/9] w-full" style={{ background: "linear-gradient(150deg,#FF7EB3,#FFB56B)" }} />
                  )}
                  <button
                    type="button"
                    onClick={() => setAreaSelected((v) => !v)}
                    className={cn(
                      "absolute inset-x-[18%] inset-y-[26%] flex flex-col items-center justify-center rounded-[12px] border-2 border-dashed text-center text-xs font-medium backdrop-blur-sm transition-colors",
                      areaSelected ? "border-white bg-black/25 text-white ring-2 ring-white/70" : "border-white/70 bg-black/15 text-white/90",
                    )}
                  >
                    Employee photos<br />will appear here
                  </button>
                </div>
                <div className="flex justify-end">
                  <Button size="sm" onClick={() => setStep("preview")}>Continue</Button>
                </div>
              </div>
            ) : null}

            {/* Step: preview with employees */}
            {startStep === "preview" ? (
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-semibold text-text">Preview with Employees</p>
                  <p className="text-xs text-text-tertiary">See how the template adapts to the number of people celebrating.</p>
                </div>
                <GeneratedTemplatePreview kind={kind} employees={sampleEmployees(kind, count)} />
                <div className="flex items-center gap-2">
                  {[1, 4, 8].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCount(c)}
                      className={cn(
                        "rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
                        count === c ? "border-primary-400 bg-[rgba(122,77,255,0.08)] text-primary-700" : "border-border/10 text-text-secondary hover:bg-surface-2",
                      )}
                    >
                      {c} {c === 1 ? "Employee" : "Employees"}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          <div className="flex items-center justify-end gap-2 border-t border-border/[0.06] px-5 py-4">
            <Button variant="outline" onClick={onClose}>{mode === "preview" ? "Close" : "Cancel"}</Button>
            {mode === "replace" ? (
              <Button onClick={handleSave} disabled={!uploaded && startStep !== "preview"}>Save Template</Button>
            ) : null}
          </div>
        </div>
      ) : null}
    </Drawer>
  );
}

/* ── Section ── */

export function CelebrationTemplates() {
  useHydratedCelebrations();
  const [drawer, setDrawer] = useState<{ kind: CelebrationKind; mode: "replace" | "preview" } | null>(null);

  return (
    <div className="rounded-card border border-border/[0.07] bg-surface p-6 shadow-card dark:border-white/[0.06]">
      <div className="mb-1 flex items-center gap-2">
        <PartyPopper className="h-4 w-4 text-primary-600" />
        <h2 className="text-base font-semibold text-text">Celebration Templates</h2>
      </div>
      <p className="mb-4 text-xs text-text-tertiary">Manage the branded templates used for birthdays and work anniversaries.</p>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <TemplateCard kind="birthday" onReplace={() => setDrawer({ kind: "birthday", mode: "replace" })} onPreview={() => setDrawer({ kind: "birthday", mode: "preview" })} />
        <TemplateCard kind="anniversary" onReplace={() => setDrawer({ kind: "anniversary", mode: "replace" })} onPreview={() => setDrawer({ kind: "anniversary", mode: "preview" })} />
      </div>

      <div className="mt-4 flex items-start gap-2 rounded-[12px] bg-surface-2/40 px-3 py-2.5">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-text-tertiary" />
        <p className="text-xs text-text-secondary">
          <span className="font-semibold text-text">How templates work</span> — Employee photos are automatically placed into the designated photo area based on the number of people celebrating that day.
        </p>
      </div>

      {/* key forces fresh state each open */}
      <TemplateUploadDrawer
        key={drawer ? `${drawer.kind}-${drawer.mode}` : "closed"}
        open={drawer !== null}
        kind={drawer?.kind ?? null}
        mode={drawer?.mode ?? "replace"}
        onClose={() => setDrawer(null)}
      />
    </div>
  );
}

"use client";

import * as React from "react";
import { useState } from "react";
import { differenceInSeconds, format, parse } from "date-fns";
import { Play, Plus, Square, X } from "lucide-react";
import { useTrackerStore } from "@/store/trackerStore";
import { useNow } from "@/hooks/useNow";
import { formatDuration, runningTimerElapsedSeconds } from "@/lib/time";
import MuiTextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import FormControl from "@mui/material/FormControl";
import MuiSelect from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { PROJECT_COLOR_DOT } from "@/lib/projectColors";
import { cn } from "@/lib/utils";

function greetingFor(hour: number): string {
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

type TrackingMode = "live" | "manual";

export const Hero = React.forwardRef<HTMLInputElement>(function Hero(_props, taskInputRef) {
  const projects = useTrackerStore((s) => s.projects);
  const runningTimer = useTrackerStore((s) => s.runningTimer);
  const startTimer = useTrackerStore((s) => s.startTimer);
  const updateRunningTimer = useTrackerStore((s) => s.updateRunningTimer);
  const stopTimer = useTrackerStore((s) => s.stopTimer);
  const entries = useTrackerStore((s) => s.entries);

  const [mode, setMode] = useState<TrackingMode>("live");
  const [task, setTask] = useState("");
  const [projectId, setProjectId] = useState(projects[0]?.id ?? "");
  const [billable, setBillable] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [tagDraft, setTagDraft] = useState("");

  // Manual mode fields
  const [manualDate, setManualDate] = useState(() => format(new Date(), "yyyy-MM-dd"));
  const [manualStart, setManualStart] = useState("09:00");
  const [manualEnd, setManualEnd] = useState("10:00");
  const [manualError, setManualError] = useState("");

  const now = useNow(1000, Boolean(runningTimer && !runningTimer.isPaused));
  const greeting = `${greetingFor(now.getHours())}, Irfan 👋`;

  function addTagFromDraft() {
    const value = tagDraft.trim().replace(/,$/, "");
    if (value && !tags.includes(value)) setTags((t) => [...t, value]);
    setTagDraft("");
  }

  function handleStart() {
    if (!task.trim()) return;
    startTimer({ task, projectId, billable, tags });
    setTask("");
    setTags([]);
    setBillable(false);
  }

  function computeManualDuration(): number {
    if (!manualDate || !manualStart || !manualEnd) return 0;
    const start = parse(`${manualDate} ${manualStart}`, "yyyy-MM-dd HH:mm", new Date());
    const end = parse(`${manualDate} ${manualEnd}`, "yyyy-MM-dd HH:mm", new Date());
    const diff = differenceInSeconds(end, start);
    return diff > 0 ? diff : 0;
  }

  function handleManualAdd() {
    setManualError("");
    if (!task.trim()) {
      setManualError("Task name is required");
      return;
    }
    if (!manualDate || !manualStart || !manualEnd) {
      setManualError("Date and times are required");
      return;
    }
    const start = parse(`${manualDate} ${manualStart}`, "yyyy-MM-dd HH:mm", new Date());
    const end = parse(`${manualDate} ${manualEnd}`, "yyyy-MM-dd HH:mm", new Date());
    const durationSeconds = differenceInSeconds(end, start);
    if (durationSeconds <= 0) {
      setManualError("End time must be after start time");
      return;
    }

    const newEntry = {
      id: crypto.randomUUID(),
      task: task.trim(),
      projectId,
      billable,
      tags,
      date: manualDate,
      startTime: start.toISOString(),
      endTime: end.toISOString(),
      durationSeconds,
    };

    useTrackerStore.setState((state) => ({ entries: [newEntry, ...state.entries] }));
    setTask("");
    setTags([]);
    setBillable(false);
    setManualError("");
  }

  const manualDuration = computeManualDuration();

  if (runningTimer) {
    return (
      <section className="relative overflow-hidden rounded-shell bg-hero px-6 py-8 text-white shadow-[0_20px_60px_-20px_rgba(49,46,129,0.5)] sm:px-10 sm:py-10">
        <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-white/5 blur-3xl" />

        <div className="relative space-y-4">
          {/* Header row: live status + timer */}
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-2.5 text-sm font-medium text-white/70">
              <span className="relative flex h-3 w-3 shrink-0">
                {!runningTimer.isPaused && (
                  <span className="absolute inline-flex h-full w-full animate-pulse-ring rounded-full bg-emerald-300" />
                )}
                <span className={cn("relative inline-flex h-3 w-3 rounded-full", runningTimer.isPaused ? "bg-white/40" : "bg-emerald-300")} />
              </span>
              {runningTimer.isPaused ? "Paused" : "Tracking"}
            </span>
            <span className="text-3xl font-bold tabular-nums">
              {formatDuration(runningTimerElapsedSeconds(runningTimer, now))}
            </span>
          </div>

          {/* Editable controls row — same style as idle */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              width: "100%",
              flexWrap: { xs: "wrap", lg: "nowrap" },
            }}
          >
            <MuiTextField
              value={runningTimer.task}
              onChange={(e) => updateRunningTimer({ task: e.target.value })}
              placeholder="What are you working on?"
              variant="outlined"
              size="small"
              sx={{
                flex: "1 1 0",
                minWidth: 200,
                "& .MuiOutlinedInput-root": {
                  height: 56,
                  borderRadius: "12px",
                  fontSize: "1.125rem",
                  color: "white",
                  backgroundColor: "rgba(255,255,255,0.10)",
                  "& fieldset": { borderColor: "rgba(255,255,255,0.1)" },
                  "&:hover fieldset": { borderColor: "rgba(255,255,255,0.25)" },
                  "&.Mui-focused fieldset": { borderColor: "rgba(255,255,255,0.15)", borderWidth: 2 },
                },
                "& .MuiInputBase-input::placeholder": { color: "rgba(255,255,255,0.3)", opacity: 1 },
              }}
            />

            <FormControl size="small" sx={{ width: 180, minWidth: 180, flexShrink: 0 }}>
              <MuiSelect
                value={runningTimer.projectId}
                onChange={(e) => updateRunningTimer({ projectId: e.target.value })}
                displayEmpty
                renderValue={(value) => {
                  const p = projects.find((proj) => proj.id === value);
                  if (!p) return <span style={{ color: "rgba(255,255,255,0.5)" }}>Project</span>;
                  return (
                    <span className="inline-flex items-center gap-2">
                      <span className={cn("h-2 w-2 rounded-full", PROJECT_COLOR_DOT[p.color])} />
                      {p.name}
                    </span>
                  );
                }}
                sx={{
                  height: 48,
                  borderRadius: "12px",
                  color: "#fff",
                  backgroundColor: "rgba(255,255,255,0.08)",
                  "& .MuiSelect-select": {
                    display: "flex",
                    alignItems: "center",
                    padding: "8px 36px 8px 14px",
                    minHeight: "unset",
                  },
                  "& .MuiSelect-icon": { color: "rgba(255,255,255,0.7)" },
                  "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.12)" },
                  "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.24)" },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.4)" },
                }}
              >
                {projects.map((p) => (
                  <MenuItem key={p.id} value={p.id}>
                    <span className="inline-flex items-center gap-2">
                      <span className={cn("h-2 w-2 rounded-full", PROJECT_COLOR_DOT[p.color])} />
                      {p.name}
                    </span>
                  </MenuItem>
                ))}
              </MuiSelect>
            </FormControl>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexShrink: 0, whiteSpace: "nowrap", mx: 0.5 }}>
              <Switch
                checked={runningTimer.billable}
                onCheckedChange={(v) => updateRunningTimer({ billable: v })}
                className="data-[state=checked]:bg-emerald-400"
              />
              <Label className="cursor-pointer text-sm font-medium text-white/60">Billable</Label>
            </Box>

            <div className="flex shrink-0 items-center gap-2.5">
              <Button
                variant="destructive"
                size="lg"
                onClick={stopTimer}
                className="shrink-0 gap-2"
              >
                <Square className="h-4 w-4 fill-current" /> Stop
              </Button>
            </div>
          </Box>
        </div>
      </section>
    );
  }

  return (
    <section className="relative overflow-hidden rounded-shell bg-hero px-6 py-8 text-white shadow-[0_20px_60px_-20px_rgba(49,46,129,0.5)] sm:px-10 sm:py-10">
      <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-white/5 blur-3xl" />

      <div className="relative space-y-4">
        {/* Header row: greeting + tab switcher */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-semibold tracking-tight">{greeting}</h1>

          {/* Segmented control */}
          <div className="flex h-9 w-fit items-center gap-0.5 rounded-lg bg-white/10 p-0.5">
            <button
              type="button"
              onClick={() => setMode("live")}
              className={cn(
                "rounded-md px-3.5 py-1.5 text-xs font-semibold transition-all duration-150",
                mode === "live"
                  ? "bg-white/20 text-white shadow-sm"
                  : "text-white/50 hover:text-white/80",
              )}
            >
              Live Tracking
            </button>
            <button
              type="button"
              onClick={() => setMode("manual")}
              className={cn(
                "rounded-md px-3.5 py-1.5 text-xs font-semibold transition-all duration-150",
                mode === "manual"
                  ? "bg-white/20 text-white shadow-sm"
                  : "text-white/50 hover:text-white/80",
              )}
            >
              Manual Entry
            </button>
          </div>
        </div>

        <label htmlFor="hero-task" className="text-sm font-medium text-white/60">
          What are you working on?
        </label>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            width: "100%",
            flexWrap: { xs: "wrap", lg: "nowrap" },
          }}
        >
          {/* Task input — full width on mobile, flexes on desktop */}
          <MuiTextField
            id="hero-task"
            inputRef={taskInputRef}
            value={task}
            onChange={(e) => setTask(e.target.value)}
            placeholder="e.g. Redesign onboarding flow"
            variant="outlined"
            size="small"
            onKeyDown={(e) => {
              if (e.key === "Enter" && mode === "live") handleStart();
              if (e.key === "Enter" && mode === "manual") handleManualAdd();
            }}
            sx={{
              flex: { xs: "1 1 100%", lg: "1 1 0" },
              minWidth: { xs: 0, lg: 200 },
              "& .MuiOutlinedInput-root": {
                height: 54,
                borderRadius: "12px",
                fontSize: "1.125rem",
                color: "white",
                backgroundColor: "rgba(255,255,255,0.10)",
                "& fieldset": { borderColor: "rgba(255,255,255,0.1)" },
                "&:hover fieldset": { borderColor: "rgba(255,255,255,0.25)" },
                "&.Mui-focused fieldset": { borderColor: "rgba(255,255,255,0.15)", borderWidth: 2 },
              },
              "& .MuiInputBase-input::placeholder": { color: "rgba(255,255,255,0.3)", opacity: 1 },
            }}
          />

          {/* Controls row: project + billable + start on one line */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              flexWrap: "wrap",
              flex: { xs: "1 1 100%", lg: "0 0 auto" },
            }}
          >
            {/* Project + billable stay grouped */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flex: "1 1 auto", minWidth: 200 }}>
              <FormControl size="small" sx={{ flex: "1 1 auto", minWidth: 120, width: { lg: 180 } }}>
                <MuiSelect
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  displayEmpty
                  renderValue={(value) => {
                    const p = projects.find((proj) => proj.id === value);
                    if (!p) return <span style={{ color: "rgba(255,255,255,0.5)" }}>Project</span>;
                    return (
                      <span className="inline-flex items-center gap-2">
                        <span className={cn("h-2 w-2 rounded-full", PROJECT_COLOR_DOT[p.color])} />
                        {p.name}
                      </span>
                    );
                  }}
                  sx={{
                    height: 48,
                    borderRadius: "12px",
                    color: "#fff",
                    backgroundColor: "rgba(255,255,255,0.08)",
                    "& .MuiSelect-select": {
                      display: "flex",
                      alignItems: "center",
                      padding: "8px 36px 8px 14px",
                      minHeight: "unset",
                    },
                    "& .MuiSelect-icon": { color: "rgba(255,255,255,0.7)" },
                    "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.12)" },
                    "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.24)" },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.4)" },
                  }}
                >
                  {projects.map((p) => (
                    <MenuItem key={p.id} value={p.id}>
                      <span className="inline-flex items-center gap-2">
                        <span className={cn("h-2 w-2 rounded-full", PROJECT_COLOR_DOT[p.color])} />
                        {p.name}
                      </span>
                    </MenuItem>
                  ))}
                </MuiSelect>
              </FormControl>

              <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexShrink: 0, whiteSpace: "nowrap", minHeight: 48, px: 0.5 }}>
                <Switch
                  id="hero-billable"
                  checked={billable}
                  onCheckedChange={setBillable}
                  className="data-[state=checked]:bg-emerald-400"
                />
                <Label htmlFor="hero-billable" className="cursor-pointer text-sm font-medium text-white/60">
                  Billable
                </Label>
              </Box>
            </Box>

            {mode === "live" ? (
              <Button
                variant="white"
                size="lg"
                onClick={handleStart}
                disabled={!task.trim()}
                className="shrink-0 gap-2 max-[360px]:w-full"
              >
                <Play className="h-4 w-4 fill-current" /> Start
              </Button>
            ) : null}
          </Box>
        </Box>

        {mode === "manual" && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              flexWrap: "wrap",
              width: "100%",
              pt: 1,
            }}
          >
            {/* Date — full width on mobile, fixed on desktop */}
            <MuiTextField
              type="date"
              value={manualDate}
              onChange={(e) => { setManualDate(e.target.value); setManualError(""); }}
              size="small"
              sx={{
                flex: { xs: "1 1 100%", sm: "0 0 auto" },
                width: { sm: 170 },
                "& .MuiOutlinedInput-root": {
                  height: 48, borderRadius: "12px", color: "white", backgroundColor: "rgba(255,255,255,0.1)",
                  "& fieldset": { borderColor: "rgba(255,255,255,0.1)" },
                  "&:hover fieldset": { borderColor: "rgba(255,255,255,0.25)" },
                  "&.Mui-focused fieldset": { borderColor: "rgba(255,255,255,0.15)" },
                },
                "& input": { colorScheme: "dark", fontSize: "0.9375rem" },
              }}
            />

            {/* Start / End / duration — share a row, stretch to fill on mobile */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                flex: { xs: "1 1 100%", sm: "0 0 auto" },
              }}
            >
              <MuiTextField
                type="time"
                value={manualStart}
                onChange={(e) => { setManualStart(e.target.value); setManualError(""); }}
                size="small"
                sx={{
                  flex: { xs: "1 1 0", sm: "0 0 auto" },
                  width: { sm: 120 },
                  "& .MuiOutlinedInput-root": {
                    height: 48, borderRadius: "12px", color: "white", backgroundColor: "rgba(255,255,255,0.1)",
                    "& fieldset": { borderColor: "rgba(255,255,255,0.1)" },
                    "&:hover fieldset": { borderColor: "rgba(255,255,255,0.25)" },
                    "&.Mui-focused fieldset": { borderColor: "rgba(255,255,255,0.15)" },
                  },
                  "& input": { colorScheme: "dark", fontSize: "0.9375rem" },
                }}
              />
              <span aria-hidden className="shrink-0 text-white/40">–</span>
              <MuiTextField
                type="time"
                value={manualEnd}
                onChange={(e) => { setManualEnd(e.target.value); setManualError(""); }}
                size="small"
                sx={{
                  flex: { xs: "1 1 0", sm: "0 0 auto" },
                  width: { sm: 120 },
                  "& .MuiOutlinedInput-root": {
                    height: 48, borderRadius: "12px", color: "white", backgroundColor: "rgba(255,255,255,0.1)",
                    "& fieldset": { borderColor: "rgba(255,255,255,0.1)" },
                    "&:hover fieldset": { borderColor: "rgba(255,255,255,0.25)" },
                    "&.Mui-focused fieldset": { borderColor: "rgba(255,255,255,0.15)" },
                  },
                  "& input": { colorScheme: "dark", fontSize: "0.9375rem" },
                }}
              />
            </Box>

            {/* Duration pill — full width on mobile so it reads clearly */}
            <span className="flex h-12 flex-1 items-center justify-center rounded-[12px] bg-white/5 px-4 text-sm font-bold tabular-nums text-white/80 max-sm:w-full sm:flex-none sm:justify-start">
              {formatDuration(manualDuration)}
            </span>
          </Box>
        )}

        {/* Inline validation error */}
        {manualError && mode === "manual" && (
          <p className="text-xs font-medium text-red-300">{manualError}</p>
        )}

        {/* Add entry — anchored at the bottom of the manual form */}
        {mode === "manual" && (
          <div className="flex pt-1">
            <Button
              variant="white"
              size="lg"
              onClick={handleManualAdd}
              disabled={!task.trim()}
              className="gap-2 max-sm:w-full"
            >
              <Plus className="h-4 w-4" /> Add entry
            </Button>
          </div>
        )}
      </div>
    </section>
  );
});

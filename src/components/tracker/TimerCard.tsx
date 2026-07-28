"use client";

import * as React from "react";
import { useState } from "react";
import { motion } from "framer-motion";
import { Pause, Play, Square, X } from "lucide-react";
import { useTrackerStore } from "@/store/trackerStore";
import { useNow } from "@/hooks/useNow";
import { formatDuration, runningTimerElapsedSeconds } from "@/lib/time";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PROJECT_COLOR_DOT } from "@/lib/projectColors";
import { cn } from "@/lib/utils";

export const TimerCard = React.forwardRef<HTMLInputElement>(function TimerCard(_props, taskInputRef) {
  const projects = useTrackerStore((s) => s.projects);
  const runningTimer = useTrackerStore((s) => s.runningTimer);
  const startTimer = useTrackerStore((s) => s.startTimer);
  const pauseTimer = useTrackerStore((s) => s.pauseTimer);
  const resumeTimer = useTrackerStore((s) => s.resumeTimer);
  const stopTimer = useTrackerStore((s) => s.stopTimer);

  const [task, setTask] = useState("");
  const [projectId, setProjectId] = useState(projects[0]?.id ?? "");
  const [billable, setBillable] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [tagDraft, setTagDraft] = useState("");

  const now = useNow(1000, Boolean(runningTimer && !runningTimer.isPaused));

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

  if (runningTimer) {
    const project = projects.find((p) => p.id === runningTimer.projectId);
    return (
      <motion.div layout className="rounded-card border border-accent/15 bg-surface p-5 shadow-float sm:p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <span className="relative flex h-3 w-3 shrink-0">
              {!runningTimer.isPaused ? (
                <span className="absolute inline-flex h-full w-full animate-pulse-ring rounded-full bg-accent" />
              ) : null}
              <span className={cn("relative inline-flex h-3 w-3 rounded-full", runningTimer.isPaused ? "bg-text-tertiary" : "bg-accent")} />
            </span>
            <div className="min-w-0">
              <p className="truncate text-base font-semibold text-text">{runningTimer.task}</p>
              <div className="mt-0.5 flex items-center gap-2 text-xs text-text-secondary">
                {project ? (
                  <span className="inline-flex items-center gap-1.5">
                    <span className={cn("h-1.5 w-1.5 rounded-full", PROJECT_COLOR_DOT[project.color])} />
                    {project.name}
                  </span>
                ) : null}
                {runningTimer.billable ? <span className="font-medium text-success">Billable</span> : null}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 sm:justify-end">
            <span className="text-3xl font-bold tabular-nums text-text">
              {formatDuration(runningTimerElapsedSeconds(runningTimer, now))}
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="h-11 w-11 rounded-full"
                onClick={() => (runningTimer.isPaused ? resumeTimer() : pauseTimer())}
                aria-label={runningTimer.isPaused ? "Resume timer" : "Pause timer"}
              >
                {runningTimer.isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
              </Button>
              <Button
                size="icon"
                className="h-11 w-11 rounded-full bg-danger hover:bg-danger/90"
                onClick={stopTimer}
                aria-label="Stop timer"
              >
                <Square className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div layout className="rounded-card border border-border/[0.07] bg-surface p-5 shadow-float sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
        <div className="min-w-0 flex-1">
          <Label htmlFor="timer-task">What are you working on?</Label>
          <Input
            id="timer-task"
            ref={taskInputRef}
            value={task}
            onChange={(e) => setTask(e.target.value)}
            placeholder="e.g. Redesign onboarding flow"
            className="mt-1.5 h-11 text-sm"
            onKeyDown={(e) => {
              if (e.key === "Enter") handleStart();
            }}
          />
        </div>

        <div className="w-full lg:w-48">
          <Label>Project</Label>
          <Select value={projectId} onValueChange={setProjectId}>
            <SelectTrigger className="mt-1.5 h-11">
              <SelectValue placeholder="Project" />
            </SelectTrigger>
            <SelectContent>
              {projects.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  <span className="inline-flex items-center gap-2">
                    <span className={cn("h-2 w-2 rounded-full", PROJECT_COLOR_DOT[p.color])} />
                    {p.name}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2.5 pb-2.5 lg:pb-0">
          <Switch id="billable" checked={billable} onCheckedChange={setBillable} />
          <Label htmlFor="billable" className="cursor-pointer font-medium text-text-secondary">
            Billable
          </Label>
        </div>

        <Button
          size="lg"
          onClick={handleStart}
          disabled={!task.trim()}
          className="h-11 shrink-0 gap-2 rounded-[10px] px-6 shadow-glow disabled:shadow-none"
        >
          <Play className="h-4 w-4 fill-current" /> Start
        </Button>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-1.5 border-t border-border/[0.06] pt-3 dark:border-white/[0.06]">
        {tags.map((t) => (
          <span
            key={t}
            className="inline-flex items-center gap-1 rounded-full bg-surface-2 px-2.5 py-1 text-xs font-medium text-text-secondary"
          >
            {t}
            <button type="button" onClick={() => setTags((ts) => ts.filter((x) => x !== t))} aria-label={`Remove tag ${t}`}>
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        <input
          value={tagDraft}
          onChange={(e) => setTagDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              addTagFromDraft();
            }
          }}
          onBlur={addTagFromDraft}
          placeholder="Add tag + Enter"
          className="h-7 min-w-[110px] flex-1 bg-transparent text-xs text-text placeholder:text-text-tertiary focus:outline-none"
        />
      </div>
    </motion.div>
  );
});

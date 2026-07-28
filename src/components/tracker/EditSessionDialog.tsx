"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { useTrackerStore } from "@/store/trackerStore";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PROJECT_COLOR_DOT } from "@/lib/projectColors";
import { cn } from "@/lib/utils";
import type { TimeEntry } from "@/types/tracker";

export function EditSessionDialog({
  entry,
  open,
  onOpenChange,
}: {
  entry: TimeEntry;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const projects = useTrackerStore((s) => s.projects);
  const updateEntry = useTrackerStore((s) => s.updateEntry);

  const [task, setTask] = useState(entry.task);
  const [projectId, setProjectId] = useState(entry.projectId);
  const [billable, setBillable] = useState(entry.billable);
  const [startTime, setStartTime] = useState(format(new Date(entry.startTime), "HH:mm"));
  const [endTime, setEndTime] = useState(format(new Date(entry.endTime), "HH:mm"));

  useEffect(() => {
    if (!open) return;
    setTask(entry.task);
    setProjectId(entry.projectId);
    setBillable(entry.billable);
    setStartTime(format(new Date(entry.startTime), "HH:mm"));
    setEndTime(format(new Date(entry.endTime), "HH:mm"));
  }, [open, entry]);

  function handleSave() {
    updateEntry(entry.id, {
      task: task.trim() || entry.task,
      projectId,
      billable,
      startTime: `${entry.date}T${startTime}:00`,
      endTime: `${entry.date}T${endTime}:00`,
    });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit session</DialogTitle>
          <DialogDescription>Update the task, project, and time for this entry.</DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-4">
          <div>
            <Label htmlFor="edit-task">Task</Label>
            <Input id="edit-task" value={task} onChange={(e) => setTask(e.target.value)} className="mt-1.5" />
          </div>

          <div>
            <Label>Project</Label>
            <Select value={projectId} onValueChange={setProjectId}>
              <SelectTrigger className="mt-1.5">
                <SelectValue />
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

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="edit-start">Start time</Label>
              <Input id="edit-start" type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="edit-end">End time</Label>
              <Input id="edit-end" type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="mt-1.5" />
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Switch id="edit-billable" checked={billable} onCheckedChange={setBillable} />
            <Label htmlFor="edit-billable" className="cursor-pointer font-medium text-text-secondary">
              Billable
            </Label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

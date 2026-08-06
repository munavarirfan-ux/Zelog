"use client";

import { useEffect, useState } from "react";
import Drawer from "@mui/material/Drawer";
import TextField from "@mui/material/TextField";
import { format, parseISO } from "date-fns";
import { Ban, Check, MessageSquare, Paperclip, Pencil, RotateCcw, X, XCircle } from "lucide-react";
import {
  computeBalances,
  leaveTypeById,
  requestColor,
  requestLabel,
  type TimeOffRequest,
} from "@/data/timeOffData";
import { initials, type Employee } from "@/data/orgData";
import { useOrgStore } from "@/store/orgStore";
import { useTimeOffStore } from "@/store/timeOffStore";
import { StatusChip } from "./StatusChip";

interface RequestDetailsDrawerProps {
  request: TimeOffRequest | null;
  canManage: boolean;
  isOwn: boolean;
  onClose: () => void;
  onEdit: (r: TimeOffRequest) => void;
  onApprove: (id: string, comment?: string) => void;
  onReject: (id: string, comment: string) => void;
  onRequestChanges: (id: string, comment: string) => void;
  onComment: (id: string, comment: string) => void;
  onCancel: (id: string) => void;
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3 py-2">
      <span className="text-xs text-text-tertiary">{label}</span>
      <span className="text-right text-sm font-medium text-text">{children}</span>
    </div>
  );
}

export function RequestDetailsDrawer({ request, canManage, isOwn, onClose, onEdit, onApprove, onReject, onRequestChanges, onComment, onCancel }: RequestDetailsDrawerProps) {
  const employees = useOrgStore((s) => s.employees);
  const requests = useTimeOffStore((s) => s.requests);
  const [comment, setComment] = useState("");
  const [needComment, setNeedComment] = useState(false);

  useEffect(() => {
    setComment("");
    setNeedComment(false);
  }, [request?.id]);

  if (!request) return <Drawer anchor="right" open={false} onClose={onClose} />;

  const emp = employees.find((e) => e.id === request.employeeId) as Employee | undefined;
  const approver = request.approverIds[0] ? employees.find((e) => e.id === request.approverIds[0]) : undefined;
  const lt = leaveTypeById(request.leaveTypeId);
  const balance = lt?.tracksBalance ? computeBalances(request.employeeId, requests).find((b) => b.key === lt.id) : undefined;
  const pending = request.status === "pending" || request.status === "changes-requested";

  const dateRange = request.startDate === request.endDate
    ? format(parseISO(request.startDate), "MMM d, yyyy")
    : `${format(parseISO(request.startDate), "MMM d")} – ${format(parseISO(request.endDate), "MMM d, yyyy")}`;

  const requireThen = (fn: (id: string, c: string) => void) => {
    if (!comment.trim()) { setNeedComment(true); return; }
    fn(request.id, comment.trim());
  };

  return (
    <Drawer anchor="right" open={Boolean(request)} onClose={onClose} slotProps={{ paper: { sx: { width: 420, maxWidth: "100vw", backgroundImage: "none" } } }}>
      <div className="flex h-full flex-col">
        <div className="flex items-start justify-between gap-3 border-b border-border/[0.07] p-5 dark:border-white/[0.06]">
          <div className="flex min-w-0 items-center gap-3">
            {emp && (
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white bg-primary-500">{initials(emp.name)}</span>
            )}
            <div className="min-w-0">
              <h3 className="truncate text-base font-semibold text-text">{emp?.name ?? "Employee"}</h3>
              <p className="truncate text-sm text-text-secondary">{emp?.jobTitle}</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg text-text-tertiary hover:bg-surface-2 hover:text-text" aria-label="Close"><X className="h-4 w-4" /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-semibold text-white" style={{ backgroundColor: requestColor(request) }}>
              {requestLabel(request)}
            </span>
            <StatusChip status={request.status} />
          </div>

          <div className="mt-3 divide-y divide-border/[0.06] dark:divide-white/[0.05]">
            <Row label="Date range">{dateRange}</Row>
            <Row label="Duration">{request.durationType === "half-day" ? `Half day (${request.halfDaySession === "second-half" ? "2nd" : "1st"})` : `${request.durationDays} day${request.durationDays === 1 ? "" : "s"}`}</Row>
            <Row label="Reason">{request.reason}</Row>
            {request.attachmentUrl && (
              <Row label="Attachment">
                <a href={request.attachmentUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-primary-600 hover:underline">
                  <Paperclip className="h-3.5 w-3.5" /> View
                </a>
              </Row>
            )}
            <Row label="Approver">{approver?.name ?? "—"}</Row>
            {balance && (
              <Row label="Balance (before → after)">
                {balance.available} → {Math.max(0, balance.available - (request.status === "approved" ? 0 : request.durationDays))}
              </Row>
            )}
            <Row label="Applied on">{format(parseISO(request.createdAt), "MMM d, yyyy")}</Row>
          </div>

          {/* Approval history */}
          <div className="mt-5">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-text-tertiary">Approval history & comments</p>
            {request.comments.length === 0 ? (
              <p className="text-sm text-text-tertiary">No activity yet.</p>
            ) : (
              <div className="space-y-2.5">
                {request.comments.map((c) => {
                  const author = employees.find((e) => e.id === c.authorId);
                  return (
                    <div key={c.id} className="rounded-xl border border-border/[0.06] bg-surface-2/50 p-3 dark:border-white/[0.05]">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-text">{author?.name ?? "User"}</span>
                        {c.action && c.action !== "comment" && <StatusChip status={c.action} />}
                      </div>
                      <p className="mt-1 text-sm text-text-secondary">{c.text}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        {(canManage || isOwn) && (
          <div className="space-y-2.5 border-t border-border/[0.07] p-4 dark:border-white/[0.06]">
            {canManage && pending && (
              <>
                <TextField
                  size="small"
                  fullWidth
                  multiline
                  minRows={2}
                  placeholder="Add a comment (required to reject or request changes)"
                  value={comment}
                  onChange={(e) => { setComment(e.target.value); setNeedComment(false); }}
                  error={needComment}
                  helperText={needComment ? "A comment is required for this action." : undefined}
                />
                <div className="grid grid-cols-3 gap-2">
                  <button type="button" onClick={() => onApprove(request.id, comment.trim() || undefined)} className="inline-flex h-9 items-center justify-center gap-1.5 rounded-[10px] bg-success/15 text-sm font-semibold text-success transition-colors hover:bg-success/25">
                    <Check className="h-4 w-4" /> Approve
                  </button>
                  <button type="button" onClick={() => requireThen(onRequestChanges)} className="inline-flex h-9 items-center justify-center gap-1.5 rounded-[10px] bg-info/12 text-sm font-semibold text-info transition-colors hover:bg-info/20">
                    <RotateCcw className="h-4 w-4" /> Changes
                  </button>
                  <button type="button" onClick={() => requireThen(onReject)} className="inline-flex h-9 items-center justify-center gap-1.5 rounded-[10px] bg-danger/12 text-sm font-semibold text-danger transition-colors hover:bg-danger/20">
                    <XCircle className="h-4 w-4" /> Reject
                  </button>
                </div>
                <button type="button" onClick={() => { if (comment.trim()) { onComment(request.id, comment.trim()); setComment(""); } }} className="inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-[10px] border border-border/[0.1] text-sm font-medium text-text-secondary transition-colors hover:bg-surface-2 dark:border-white/10">
                  <MessageSquare className="h-4 w-4" /> Add comment only
                </button>
              </>
            )}
            <div className="flex gap-2">
              {(canManage || isOwn) && (request.status === "pending" || request.status === "changes-requested") && (
                <button type="button" onClick={() => onEdit(request)} className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-[10px] border border-border/[0.1] text-sm font-medium text-text-secondary transition-colors hover:bg-surface-2 dark:border-white/10">
                  <Pencil className="h-4 w-4" /> Edit
                </button>
              )}
              {(request.status === "pending" || request.status === "approved" || request.status === "changes-requested") && (
                <button type="button" onClick={() => onCancel(request.id)} className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-[10px] border border-danger/20 text-sm font-medium text-danger transition-colors hover:bg-danger/10">
                  <Ban className="h-4 w-4" /> Cancel request
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </Drawer>
  );
}

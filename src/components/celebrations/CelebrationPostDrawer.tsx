"use client";

import { useEffect, useState } from "react";
import Drawer from "@mui/material/Drawer";
import TextField from "@mui/material/TextField";
import { format } from "date-fns";
import { Check, CheckCircle2, Loader2, PartyPopper, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GeneratedTemplatePreview } from "./GeneratedTemplatePreview";
import { CHAT_SPACES, DEFAULT_MESSAGES, type CelebrationEmployee, type CelebrationKind } from "@/data/celebrationsData";
import type { PostedInfo } from "@/store/celebrationStore";

interface Props {
  open: boolean;
  kind: CelebrationKind;
  employees: CelebrationEmployee[];
  posted: PostedInfo | null;
  onClose: () => void;
  onPosted: (space: string) => void;
}

export function CelebrationPostDrawer({ open, kind, employees, posted, onClose, onPosted }: Props) {
  const isBirthday = kind === "birthday";
  const [message, setMessage] = useState(DEFAULT_MESSAGES[kind]);
  const [space, setSpace] = useState(CHAT_SPACES[0]);
  const [posting, setPosting] = useState(false);
  const [justPosted, setJustPosted] = useState(false);

  // Reset editable state each time the drawer opens.
  useEffect(() => {
    if (open) {
      setMessage(DEFAULT_MESSAGES[kind]);
      setSpace(posted?.space ?? CHAT_SPACES[0]);
      setPosting(false);
      setJustPosted(false);
    }
  }, [open, kind, posted]);

  const alreadyPosted = Boolean(posted) || justPosted;
  const postedSpace = posted?.space ?? space;

  function handlePost() {
    if (posting || alreadyPosted) return;
    setPosting(true);
    setTimeout(() => {
      setPosting(false);
      setJustPosted(true);
      onPosted(space);
      toast.success(`${isBirthday ? "Birthday" : "Anniversary"} celebration posted to ${space}`);
    }, 1000);
  }

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      slotProps={{ paper: { sx: { width: 500, maxWidth: "100vw", backgroundImage: "none" } } }}
    >
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-border/[0.06] px-5 py-4">
          <div>
            <h2 className="text-base font-semibold text-text">{isBirthday ? "Birthday Post" : "Anniversary Post"}</h2>
            <p className="mt-0.5 text-xs text-text-tertiary">Preview how today&apos;s celebration will appear in Google Chat.</p>
            <p className="mt-1 text-xs font-medium text-primary-600">{employees.length} employees</p>
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

        {/* Body */}
        <div className="flex-1 space-y-4 overflow-y-auto p-5">
          {alreadyPosted ? (
            <div className="flex items-center gap-2 rounded-[12px] bg-[#34D3991A] px-3 py-2.5 text-sm font-medium text-[#0F9E6E]">
              <CheckCircle2 className="h-4 w-4" /> Posted to {postedSpace}
              {posted ? <span className="text-[#0F9E6E]/70">· {format(new Date(posted.at), "h:mm a")}</span> : null}
            </div>
          ) : null}

          {/* Google Chat preview */}
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-tertiary">Preview</p>
            <div className="rounded-[14px] border border-border/[0.08] bg-surface p-3 shadow-card">
              <div className="mb-3 flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-[9px] text-white" style={{ background: "linear-gradient(135deg, #7A4DFF, #5B6BEF)" }}>
                  <PartyPopper className="h-4 w-4" />
                </span>
                <span className="flex-1">
                  <span className="block text-sm font-semibold text-text">Zelog Celebrations</span>
                  <span className="block text-[11px] text-text-tertiary">Now</span>
                </span>
              </div>

              <GeneratedTemplatePreview kind={kind} employees={employees} />

              <p className="mt-3 whitespace-pre-line text-sm text-text">{message}</p>
              <p className="mt-2 text-xs text-text-tertiary">{employees.length} employees featured</p>
            </div>
          </div>

          {/* Message editor */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-text-tertiary">Message</label>
            <TextField
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              multiline
              minRows={3}
              maxRows={6}
              fullWidth
              disabled={alreadyPosted}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: "12px" } }}
            />
            <p className="mt-1 text-[11px] text-text-tertiary">Employee names come from their records and can&apos;t be edited here.</p>
          </div>

          {/* Space selector */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-text-tertiary">Post to</label>
            <Select value={space} onValueChange={setSpace} disabled={alreadyPosted}>
              <SelectTrigger className="h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CHAT_SPACES.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t border-border/[0.06] px-5 py-4">
          <Button variant="outline" onClick={onClose}>
            {alreadyPosted ? "Close" : "Cancel"}
          </Button>
          {alreadyPosted ? (
            <Button disabled className="gap-1.5">
              <CheckCircle2 className="h-4 w-4" /> Posted successfully
            </Button>
          ) : (
            <Button onClick={handlePost} disabled={posting} className="gap-1.5">
              {posting ? <><Loader2 className="h-4 w-4 animate-spin" /> Posting…</> : <><Check className="h-4 w-4" /> Post to Chat</>}
            </Button>
          )}
        </div>
      </div>
    </Drawer>
  );
}

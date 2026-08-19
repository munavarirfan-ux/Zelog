"use client";

import { useEffect, useState } from "react";
import Dialog from "@mui/material/Dialog";
import TextField from "@mui/material/TextField";
import { MessageSquare, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { defaultMessageFor, sendCelebrationMessage } from "@/lib/celebrations";
import { firstName, type CelebrationEmployee, type CelebrationKind } from "@/data/celebrationsData";

interface Props {
  open: boolean;
  employee: CelebrationEmployee | null;
  kind: CelebrationKind;
  onClose: () => void;
}

/** Individual celebration wish via Google Chat — available to every role. */
export function CelebrationWishDialog({ open, employee, kind, onClose }: Props) {
  const isBirthday = kind === "birthday";
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (open && employee) {
      setMessage(defaultMessageFor(kind, employee.name, employee.years ?? 0));
      setSending(false);
    }
  }, [open, employee, kind]);

  async function handleSend() {
    if (!employee) return;
    setSending(true);
    const email = `${firstName(employee.name).toLowerCase()}@zessta.com`;
    try {
      await sendCelebrationMessage({ id: employee.id, name: employee.name, email }, kind, message);
      toast.success(`${isBirthday ? "Birthday" : "Anniversary"} wish sent to ${employee.name} via Google Chat.`);
      onClose();
    } catch {
      toast.error(`Couldn't send wish to ${employee.name}.`, {
        action: { label: "Retry", onClick: () => void handleSend() },
      });
    } finally {
      setSending(false);
    }
  }

  return (
    <Dialog
      open={open}
      onClose={sending ? undefined : onClose}
      slotProps={{ paper: { sx: { borderRadius: "20px", maxWidth: 460, width: "100%", backgroundImage: "none" } } }}
    >
      {employee ? (
        <div className="p-5 sm:p-6">
          <div className="mb-4 flex items-start gap-3">
            <img src={employee.photo} alt="" className="h-11 w-11 shrink-0 rounded-full object-cover" />
            <div className="min-w-0 flex-1">
              <h2 className="text-base font-semibold text-text">{isBirthday ? "Send Birthday Wish" : "Send Anniversary Wish"}</h2>
              <p className="truncate text-sm text-text-secondary">To {employee.name} · {employee.department}</p>
            </div>
            <button type="button" onClick={onClose} disabled={sending} aria-label="Close" className="flex h-8 w-8 items-center justify-center rounded-lg text-text-tertiary transition-colors hover:bg-surface-2 disabled:opacity-40">
              <X className="h-4 w-4" />
            </button>
          </div>

          <TextField
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            multiline
            minRows={3}
            maxRows={7}
            fullWidth
            autoFocus
            label="Message"
            disabled={sending}
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: "12px" } }}
          />
          <p className="mt-2 flex items-center gap-1.5 text-xs text-text-tertiary">
            <MessageSquare className="h-3.5 w-3.5" /> Delivered to their Google Chat
          </p>

          <div className="mt-5 flex justify-end gap-2">
            <Button variant="outline" onClick={onClose} disabled={sending}>Cancel</Button>
            <Button className="gap-1.5" onClick={handleSend} disabled={sending || !message.trim()}>
              <MessageSquare className="h-4 w-4" />
              {sending ? "Sending…" : "Send via Google Chat"}
            </Button>
          </div>
        </div>
      ) : null}
    </Dialog>
  );
}

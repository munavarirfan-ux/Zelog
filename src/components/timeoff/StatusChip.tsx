import type { RequestStatus } from "@/data/timeOffData";
import { cn } from "@/lib/utils";

const META: Record<RequestStatus, { label: string; cls: string }> = {
  pending: { label: "Pending", cls: "bg-warning/15 text-warning" },
  approved: { label: "Approved", cls: "bg-success/15 text-success" },
  rejected: { label: "Rejected", cls: "bg-danger/15 text-danger" },
  cancelled: { label: "Cancelled", cls: "bg-text-tertiary/15 text-text-tertiary" },
  "changes-requested": { label: "Changes requested", cls: "bg-info/15 text-info" },
};

export function StatusChip({ status, className }: { status: RequestStatus; className?: string }) {
  const m = META[status];
  return (
    <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold", m.cls, className)}>
      {m.label}
    </span>
  );
}

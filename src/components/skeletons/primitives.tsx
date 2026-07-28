import { cn } from "@/lib/utils";

export function SkeletonBox({ className }: { className?: string }) {
  return <div className={cn("shimmer rounded-[10px] bg-surface-3/70", className)} />;
}

export function SkeletonText({ className }: { className?: string }) {
  return <SkeletonBox className={cn("h-3 w-full", className)} />;
}

export function TrackerSkeleton() {
  return (
    <div className="space-y-6">
      <SkeletonBox className="h-48 w-full rounded-shell" />
      <SkeletonBox className="h-32 w-full rounded-card" />
      <div className="flex gap-2">
        {Array.from({ length: 10 }).map((_, i) => (
          <SkeletonBox key={i} className="h-16 w-14 shrink-0 rounded-[14px]" />
        ))}
      </div>
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-card border border-border/[0.07] bg-surface p-4">
            <SkeletonText className="mb-3 h-4 w-40" />
            <div className="space-y-2">
              <SkeletonBox className="h-12 w-full" />
              <SkeletonBox className="h-12 w-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

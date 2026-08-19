"use client";

import { useRouter } from "next/navigation";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Shown when a user reaches a destination they're not permitted to view. */
export function Unauthorized({ message }: { message?: string }) {
  const router = useRouter();
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
      <span className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[rgba(122,77,255,0.1)] text-primary-600">
        <ShieldAlert className="h-8 w-8" strokeWidth={1.75} />
      </span>
      <h1 className="text-xl font-semibold tracking-tight text-text">You don&apos;t have access to this page</h1>
      <p className="mt-2 max-w-sm text-sm text-text-secondary">
        {message ?? "Your current role doesn't include permission to view this area. If you think this is a mistake, contact your workspace admin."}
      </p>
      <Button size="lg" className="mt-6" onClick={() => router.push("/")}>
        Go Home
      </Button>
    </div>
  );
}

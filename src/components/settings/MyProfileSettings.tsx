"use client";

import { useState } from "react";
import { KeyRound, Laptop, Smartphone, Upload } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { getEmployee } from "@/data/homeData";
import { Panel, Field } from "./settingsKit";

const ROLE_LABEL: Record<string, string> = {
  "super-admin": "Super Admin",
  admin: "Admin",
  employee: "Employee",
  "new-hire": "New Hire",
};

export function MyProfileSettings() {
  const { currentUser, activeRole } = useCurrentUser();
  const emp = getEmployee(currentUser.id);

  const [fullName, setFullName] = useState(currentUser.name);
  const [phone, setPhone] = useState("");
  const [preferred, setPreferred] = useState(currentUser.name.split(" ")[0]);

  const employeeCode = `ZES-${currentUser.id.replace(/[^a-z0-9]/gi, "").toUpperCase().slice(0, 6)}`;

  const initials = currentUser.name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();

  return (
    <div className="space-y-5">
      {/* Profile information */}
      <Panel title="Profile Information">
        <div className="mb-6 flex items-center gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary-soft text-lg font-semibold text-primary-700">
            {initials}
          </div>
          <div>
            <p className="text-sm font-medium text-text">Profile photo</p>
            <p className="mb-2 text-xs text-text-tertiary">JPG or PNG, up to 2&nbsp;MB.</p>
            <Button variant="outline" size="sm" className="gap-1.5 rounded-[10px]">
              <Upload className="h-3.5 w-3.5" /> Upload
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
          <Field label="Full name">
            <Input value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </Field>
          <Field label="Preferred name">
            <Input value={preferred} onChange={(e) => setPreferred(e.target.value)} />
          </Field>
          <Field label="Work email" hint="Managed by your workspace — contact an admin to change.">
            <Input value={currentUser.email} disabled />
          </Field>
          <Field label="Phone">
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Add a phone number" />
          </Field>
        </div>
        <div className="mt-5 flex justify-end">
          <Button size="sm" className="rounded-[10px]" onClick={() => toast.success("Profile updated")}>Save changes</Button>
        </div>
      </Panel>

      {/* Account (read-only) */}
      <Panel title="Account" sub="Set by your workspace administrator.">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div>
            <p className="text-xs text-text-tertiary">Role</p>
            <p className="mt-1 text-sm font-medium text-text">{ROLE_LABEL[activeRole] ?? activeRole}</p>
          </div>
          <div>
            <p className="text-xs text-text-tertiary">Employee ID</p>
            <p className="mt-1 text-sm font-medium text-text">{employeeCode}</p>
          </div>
          <div>
            <p className="text-xs text-text-tertiary">Department</p>
            <p className="mt-1 text-sm font-medium text-text">{emp?.department ?? "—"}</p>
          </div>
        </div>
      </Panel>

      {/* Security */}
      <Panel title="Security">
        <div className="flex items-center justify-between gap-3 border-b border-border/[0.05] py-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-primary-soft text-primary-700">
              <KeyRound className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-medium text-text">Password</p>
              <p className="text-[11px] text-text-tertiary">Last changed 3 months ago</p>
            </div>
          </div>
          <Button variant="outline" size="sm" className="rounded-[10px]" onClick={() => toast.success("Password reset link sent")}>Change</Button>
        </div>

        <div className="pt-3">
          <p className="mb-2 text-sm font-medium text-text">Active sessions</p>
          <div className="space-y-2">
            {[
              { icon: Laptop, name: "MacBook Pro · Chrome", meta: "Hyderabad · This device", current: true },
              { icon: Smartphone, name: "iPhone 15 · ZE[FLOW] app", meta: "Hyderabad · 2 days ago", current: false },
            ].map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.name} className="flex items-center justify-between gap-3 rounded-[12px] border border-border/[0.07] px-3.5 py-2.5">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <Icon className="h-4 w-4 shrink-0 text-text-tertiary" />
                    <div className="min-w-0">
                      <p className="truncate text-sm text-text">{s.name}</p>
                      <p className="text-[11px] text-text-tertiary">{s.meta}</p>
                    </div>
                  </div>
                  {s.current ? (
                    <span className="shrink-0 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">Current</span>
                  ) : (
                    <Button variant="ghost" size="sm" className="rounded-[10px] text-danger" onClick={() => toast.success("Session revoked")}>Revoke</Button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </Panel>
    </div>
  );
}

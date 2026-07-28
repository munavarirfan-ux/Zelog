import { AppShell } from "@/components/AppShell";
import { TooltipProvider } from "@/components/ui/tooltip";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <TooltipProvider delayDuration={150}>
      <AppShell>{children}</AppShell>
    </TooltipProvider>
  );
}

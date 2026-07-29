import { AppShell } from "@/components/AppShell";
import { MuiThemeProvider } from "@/components/MuiThemeProvider";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <MuiThemeProvider>
      <AppShell>{children}</AppShell>
    </MuiThemeProvider>
  );
}

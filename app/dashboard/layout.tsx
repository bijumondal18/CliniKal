import { DashboardShell } from "@/components/DashboardShell";
import { ClinicDataProvider } from "@/contexts/ClinicDataContext";
import { SettingsProvider } from "@/contexts/SettingsContext";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClinicDataProvider>
      <SettingsProvider>
        <DashboardShell>
          {children}
        </DashboardShell>
      </SettingsProvider>
    </ClinicDataProvider>
  );
}

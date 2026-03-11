import { DashboardShell } from "@/components/DashboardShell";
import { ClinicDataProvider } from "@/contexts/ClinicDataContext";
import { ClinicProvider } from "@/contexts/ClinicContext";
import { SettingsProvider } from "@/contexts/SettingsContext";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClinicProvider>
      <ClinicDataProvider>
        <SettingsProvider>
          <DashboardShell>
            {children}
          </DashboardShell>
        </SettingsProvider>
      </ClinicDataProvider>
    </ClinicProvider>
  );
}

import { DashboardShell } from "@/components/DashboardShell";
import { ClinicDataProvider } from "@/contexts/ClinicDataContext";
import { ClinicProvider } from "@/contexts/ClinicContext";
import { MembershipProvider } from "@/contexts/MembershipContext";
import { SettingsProvider } from "@/contexts/SettingsContext";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClinicProvider>
      <MembershipProvider>
        <ClinicDataProvider>
          <SettingsProvider>
            <DashboardShell>
              {children}
            </DashboardShell>
          </SettingsProvider>
        </ClinicDataProvider>
      </MembershipProvider>
    </ClinicProvider>
  );
}

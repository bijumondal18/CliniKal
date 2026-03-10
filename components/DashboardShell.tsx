"use client";

import { Sidebar } from "@/components/Sidebar";
import { SidebarProvider, useSidebar } from "@/contexts/SidebarContext";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="min-h-screen bg-[var(--background)]">
        <Sidebar />
        <MainContent>{children}</MainContent>
      </div>
    </SidebarProvider>
  );
}

function MainContent({ children }: { children: React.ReactNode }) {
  const { collapsed } = useSidebar();
  return (
    <main className={`min-h-screen transition-[padding] duration-200 ${collapsed ? "pl-20" : "pl-56"}`}>
      {children}
    </main>
  );
}

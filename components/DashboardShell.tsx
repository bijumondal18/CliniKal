"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { TopBar } from "@/components/TopBar";
import { useAuth } from "@/contexts/AuthContext";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const { isLoggedIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoggedIn) {
      router.replace("/login");
    }
  }, [isLoggedIn, router]);

  if (!isLoggedIn) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <TopBar />
      <main className="min-h-screen px-6 pt-28 pb-8">
        {children}
      </main>
    </div>
  );
}

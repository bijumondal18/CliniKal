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
      <main className="min-h-screen px-4 pt-20 pb-6 sm:px-6 sm:pt-28 sm:pb-8">
        {children}
      </main>
      <footer className="border-t border-[var(--card-border)] px-4 py-6 text-center text-xs text-[var(--foreground)] opacity-60 sm:px-6">
        © {new Date().getFullYear()} Clinikal. All rights reserved.
      </footer>
    </div>
  );
}

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
      <footer className="border-t border-[var(--card-border)] px-6 py-6 text-center text-xs text-[var(--foreground)] opacity-60">
        © {new Date().getFullYear()} Clinikal. All rights reserved.
      </footer>
    </div>
  );
}

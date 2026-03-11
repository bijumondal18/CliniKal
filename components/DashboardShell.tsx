"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { TopBar } from "@/components/TopBar";
import { useAuth } from "@/contexts/AuthContext";
import { useMembership } from "@/contexts/MembershipContext";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const { isLoggedIn } = useAuth();
  const { membership, isActive, isLoading } = useMembership();
  const router = useRouter();

  useEffect(() => {
    if (!isLoggedIn) {
      router.replace("/login");
    }
  }, [isLoggedIn, router]);

  if (!isLoggedIn) {
    return null;
  }

  const showPaywall = !isLoading && membership !== null && !isActive;

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <TopBar />
      <main className="min-h-screen px-2 pt-20 pb-6 sm:px-6 sm:pt-28 sm:pb-8">
        {showPaywall ? (
          <div className="flex min-h-[60vh] flex-col items-center justify-center rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-8 shadow-soft">
            <h2 className="text-xl font-bold text-[var(--foreground)]">Membership required</h2>
            <p className="mt-2 max-w-md text-center text-sm text-[var(--foreground)] opacity-70">
              Your clinic&apos;s subscription has expired or is past due. Upgrade or renew to continue using the dashboard.
            </p>
            <Link
              href="/dashboard/settings"
              className="mt-6 rounded-xl bg-blue-600 px-6 py-3 text-sm font-medium text-white shadow-soft hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Go to Settings → Membership
            </Link>
          </div>
        ) : (
          children
        )}
      </main>
      <footer className="border-t border-[var(--card-border)] px-2 py-6 text-center text-xs text-[var(--foreground)] opacity-60 sm:px-6">
        © {new Date().getFullYear()} Clinikal. All rights reserved.
      </footer>
    </div>
  );
}

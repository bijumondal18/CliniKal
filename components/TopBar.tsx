"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

const topNavItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/dashboard/patients", label: "Patients" },
  { href: "/dashboard/doctors", label: "Doctors" },
  { href: "/dashboard/prescriptions", label: "Prescriptions" },
  { href: "/dashboard/appointments", label: "Appointments" },
  { href: "/dashboard/reports", label: "Reports" },
  { href: "/dashboard/messages", label: "Messages" },
  { href: "/dashboard/staff", label: "Staff" },
];

export function TopBar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const initials = user?.username ? user.username.slice(0, 2).toUpperCase() : "?";

  const handleLogout = () => {
    setProfileOpen(false);
    logout();
    router.push("/login");
  };

  return (
    <header className="fixed left-4 right-4 top-4 z-30 flex min-h-14 items-center justify-between gap-4 rounded-full border border-[var(--card-border)] bg-[var(--card)] px-6 py-3 shadow-soft">
      {/* Left: Logo + name */}
      <div className="flex shrink-0 items-center gap-2">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-600">
          <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </div>
        <span className="text-lg font-semibold tracking-tight text-[var(--foreground)]">Clinic</span>
      </div>

      {/* Middle: Pill nav - no scroll, fits in one row */}
      <nav className="flex min-w-0 flex-1 justify-center">
        <div className="flex flex-wrap items-center justify-center gap-0.5 rounded-full bg-[var(--muted-bg)] p-1">
          {topNavItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-[var(--card)] text-[var(--foreground)] shadow-soft"
                    : "text-[var(--foreground)] opacity-70 hover:opacity-100"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Right: Search, Notification, Profile */}
      <div className="flex shrink-0 items-center gap-2">
        <button
          type="button"
          onClick={() => setSearchOpen(!searchOpen)}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--muted-bg)] text-[var(--foreground)] opacity-80 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          title="Search"
          aria-label="Search"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--muted-bg)] text-[var(--foreground)] opacity-80 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          title="Notifications"
          aria-label="Notifications"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </button>
        <div className="relative" ref={profileRef}>
          <button
            type="button"
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-1.5 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            aria-expanded={profileOpen}
            aria-haspopup="true"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--primary-muted)] text-sm font-semibold text-blue-700 dark:text-blue-200">
              {initials}
            </div>
            <svg className="h-4 w-4 text-[var(--foreground)] opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {profileOpen && (
            <div className="absolute right-0 top-full z-50 mt-2 w-48 rounded-xl border border-[var(--card-border)] bg-[var(--card)] py-1 shadow-soft">
              <div className="border-b border-[var(--card-border)] px-4 py-2">
                <p className="text-sm font-medium text-[var(--foreground)]">{user?.username ?? "User"}</p>
                <p className="text-xs text-[var(--foreground)] opacity-70">Logged in</p>
              </div>
              <Link
                href="/dashboard/settings"
                onClick={() => setProfileOpen(false)}
                className="block w-full px-4 py-2 text-left text-sm text-[var(--foreground)] hover:bg-[var(--sidebar-hover)]"
              >
                Settings
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="w-full px-4 py-2 text-left text-sm text-[var(--foreground)] hover:bg-[var(--sidebar-hover)]"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState, useRef, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useClinic } from "@/contexts/ClinicContext";
import { useClinicData } from "@/contexts/ClinicDataContext";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Dialog, dialogInputClass, dialogLabelClass } from "@/components/Dialog";
import { HelpDialog } from "@/components/HelpDialog";

const topNavItems: { href: string; label: string; icon: string }[] = [
  { href: "/dashboard", label: "Dashboard", icon: "M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" },
  { href: "/dashboard/patients", label: "Patients", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" },
  { href: "/dashboard/doctors", label: "Doctors", icon: "M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" },
  { href: "/dashboard/prescriptions", label: "Prescriptions", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
  { href: "/dashboard/appointments", label: "Appointments", icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" },
  { href: "/dashboard/reports", label: "Reports", icon: "M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
  { href: "/dashboard/messages", label: "Messages", icon: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" },
  { href: "/dashboard/staff", label: "Staffs", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" },
];

type NotificationType = "appointment" | "message" | "support_ticket";

type NotificationItem = {
  id: string;
  type: NotificationType;
  title: string;
  body?: string;
  time: string;
  read: boolean;
};

const initialNotifications: NotificationItem[] = [
  { id: "1", type: "appointment", title: "New appointment booked", body: "John Doe scheduled a visit for tomorrow at 10:00 AM.", time: "2 min ago", read: false },
  { id: "2", type: "message", title: "New message from Dr. Smith", body: "Please review the lab results when you get a chance.", time: "15 min ago", read: false },
  { id: "3", type: "support_ticket", title: "Support ticket raised", body: "Ticket #2847: Billing inquiry has been assigned to you.", time: "1 hour ago", read: true },
  { id: "4", type: "appointment", title: "Appointment reminder", body: "Reminder: 3 appointments scheduled for today.", time: "2 hours ago", read: true },
];

export function TopBar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const [notificationDialogOpen, setNotificationDialogOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);
  const { currentClinic, saveClinic } = useClinic();
  const { patients, doctors, appointments, prescriptions, reports } = useClinicData();
  const [profileForm, setProfileForm] = useState({ clinicName: "", clinicAddress: "", clinicImage: "" });
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const openNotificationDialog = () => {
    setNotificationDialogOpen(true);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  useEffect(() => {
    if (notificationDialogOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [notificationDialogOpen]);

  useEffect(() => {
    if (profileDialogOpen) {
      setProfileForm({
        clinicName: currentClinic?.clinicName ?? "",
        clinicAddress: currentClinic?.clinicAddress ?? "",
        clinicImage: currentClinic?.clinicImage ?? "",
      });
      setLocationError(null);
    }
  }, [profileDialogOpen, currentClinic?.clinicName, currentClinic?.clinicAddress, currentClinic?.clinicImage]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
      if (notificationRef.current && notificationDialogOpen && !notificationRef.current.contains(e.target as Node)) {
        setNotificationDialogOpen(false);
      }
      if (searchRef.current && searchOpen && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [notificationDialogOpen, searchOpen]);

  useEffect(() => {
    if (searchOpen) {
      const id = window.setTimeout(() => searchInputRef.current?.focus(), 0);
      return () => window.clearTimeout(id);
    } else {
      setSearchQuery("");
    }
  }, [searchOpen]);

  const initials = user?.email ? user.email.slice(0, 2).toUpperCase() : (user?.displayName?.slice(0, 2).toUpperCase() ?? "?");

  type GlobalResult = {
    key: string;
    type: "Patient" | "Doctor" | "Appointment" | "Prescription" | "Report";
    title: string;
    subtitle?: string;
    href: string;
  };

  const globalResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [] as GlobalResult[];

    function match(text: string) {
      return text.toLowerCase().includes(q);
    }

    const results: GlobalResult[] = [];

    for (const p of patients) {
      const title = `${p.firstName} ${p.lastName}`.trim();
      const blob = [title, p.email ?? "", p.phone ?? ""].join(" ");
      if (match(blob)) {
        results.push({
          key: `patient:${p.id}`,
          type: "Patient",
          title,
          subtitle: p.phone || p.email ? [p.phone, p.email].filter(Boolean).join(" • ") : undefined,
          href: `/dashboard/patients/${p.id}`,
        });
      }
    }

    for (const d of doctors) {
      const title = `Dr. ${d.firstName} ${d.lastName}`.trim();
      const blob = [title, d.email ?? "", d.phone ?? "", d.qualification ?? "", ...(d.specializations ?? [])].join(" ");
      if (match(blob)) {
        results.push({
          key: `doctor:${d.id}`,
          type: "Doctor",
          title,
          subtitle: d.specializations?.length ? d.specializations.join(", ") : d.qualification || undefined,
          href: `/dashboard/doctors/${d.id}`,
        });
      }
    }

    for (const a of appointments) {
      const title = `${a.patientName || "Appointment"}${a.date ? ` • ${a.date}` : ""}${a.time ? ` ${a.time}` : ""}`;
      const blob = [a.patientName ?? "", a.doctor ?? "", a.type ?? "", a.status ?? "", a.date ?? "", a.time ?? ""].join(" ");
      if (match(blob)) {
        results.push({
          key: `appointment:${a.id}`,
          type: "Appointment",
          title,
          subtitle: [a.doctor, a.status].filter(Boolean).join(" • ") || undefined,
          href: "/dashboard/appointments",
        });
      }
    }

    for (const pr of prescriptions) {
      const title = pr.patientName ? `Prescription • ${pr.patientName}` : "Prescription";
      const blob = [
        pr.patientName ?? "",
        pr.doctorName ?? "",
        pr.notes ?? "",
        ...(pr.medications?.map((m) => `${m.name ?? ""} ${m.dosage ?? ""}`) ?? []),
      ].join(" ");
      if (match(blob)) {
        results.push({
          key: `prescription:${pr.id}`,
          type: "Prescription",
          title,
          subtitle: [pr.doctorName, pr.date].filter(Boolean).join(" • ") || undefined,
          href: "/dashboard/prescriptions",
        });
      }
    }

    for (const r of reports) {
      const title = r.patientName ? `Report • ${r.patientName}` : "Report";
      const blob = [r.patientName ?? "", r.doctorName ?? "", r.type ?? "", r.summary ?? "", r.date ?? ""].join(" ");
      if (match(blob)) {
        results.push({
          key: `report:${r.id}`,
          type: "Report",
          title,
          subtitle: [r.type, r.date].filter(Boolean).join(" • ") || undefined,
          href: "/dashboard/reports",
        });
      }
    }

    return results.slice(0, 12);
  }, [appointments, doctors, patients, prescriptions, reports, searchQuery]);

  const handleLogoutClick = () => {
    setProfileOpen(false);
    setLogoutConfirmOpen(true);
  };

  const handleProfileClick = () => {
    setProfileOpen(false);
    setProfileDialogOpen(true);
  };

  const handleProfileSave = async () => {
    await saveClinic(profileForm);
    setProfileDialogOpen(false);
  };

  const handleClinicImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => setProfileForm((prev) => ({ ...prev, clinicImage: reader.result as string }));
    reader.readAsDataURL(file);
  };

  const handleCurrentLocation = useCallback(() => {
    setLocationError(null);
    setLocationLoading(true);
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser.");
      setLocationLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
            { headers: { "Accept-Language": "en", "User-Agent": "Clinikal-Patient-Dashboard/1.0" } }
          );
          if (!res.ok) throw new Error("Failed to fetch address");
          const data = (await res.json()) as { display_name?: string };
          const address = data.display_name?.trim() || `${latitude}, ${longitude}`;
          setProfileForm((prev) => ({ ...prev, clinicAddress: address }));
          setLocationError(null);
        } catch {
          setLocationError("Could not resolve address. Using coordinates.");
          setProfileForm((prev) => ({ ...prev, clinicAddress: `${latitude}, ${longitude}` }));
        } finally {
          setLocationLoading(false);
        }
      },
      (err: GeolocationPositionError) => {
        const message =
          err.code === 1
            ? "Location permission denied."
            : err.code === 2
              ? "Location unavailable."
              : "Location request timed out.";
        setLocationError(message);
        setLocationLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }, []);

  const handleLogoutConfirm = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <header className="fixed left-2 right-2 top-2 z-30 flex h-12 items-center justify-between gap-3 overflow-visible rounded-full border border-[var(--card-border)] bg-[var(--card)] px-3 py-2 shadow-soft sm:left-4 sm:right-4 sm:top-4 sm:h-14 sm:gap-4 sm:px-6 sm:py-3">
      {/* Left: Logo branding - slightly overflows bar for presence */}
      <Link href="/dashboard" className="-my-1 flex shrink-0 items-center self-stretch" aria-label="Clinikal home">
        <img
          src="/clinikal-logo.png"
          alt="Clinikal"
          className="h-12 w-auto max-w-[170px] object-contain object-left sm:h-[5.5rem] sm:max-w-[480px]"
        />
      </Link>

      {/* Middle: Pill nav - single line; icons only on small, text from lg */}
      <nav className="hidden min-w-0 flex-1 justify-center overflow-x-auto overflow-y-hidden sm:flex">
        <div className="flex flex-none flex-nowrap items-center justify-center gap-0.5 rounded-full bg-[var(--muted-bg)] p-1">
          {topNavItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                title={item.label}
                className={`flex items-center justify-center gap-1.5 rounded-full transition-colors ${
                  isActive
                    ? "bg-[var(--card)] text-[var(--foreground)] shadow-soft"
                    : "text-[var(--foreground)] opacity-70 hover:opacity-100"
                } ${"p-2 lg:px-3 lg:py-1.5"}`}
              >
                <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                </svg>
                <span className="hidden whitespace-nowrap text-sm font-medium lg:inline">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Right: Search, Notification, Profile */}
      <div className="flex shrink-0 items-center gap-2">
        <button
          type="button"
          onClick={() => setMobileMenuOpen(true)}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--muted-bg)] text-[var(--foreground)] opacity-80 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 sm:hidden"
          title="Menu"
          aria-label="Menu"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div className="relative" ref={searchRef}>
          <div
            className={`flex items-center rounded-full bg-[var(--muted-bg)] transition-[width] duration-300 ease-out ${
              searchOpen ? "w-72" : "w-9"
            }`}
          >
            <button
              type="button"
              onClick={() => setSearchOpen((v) => !v)}
              className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--foreground)] opacity-80 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              title="Search"
              aria-label="Search"
              aria-expanded={searchOpen}
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
            <div
              className={`flex items-center gap-2 overflow-hidden transition-[opacity,width] duration-300 ease-out ${
                searchOpen ? "w-[calc(100%-2.25rem)] opacity-100 pr-3" : "w-0 opacity-0 pr-0"
              }`}
            >
              <input
                ref={searchInputRef}
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Escape") setSearchOpen(false);
                  if (e.key === "Enter" && globalResults[0]) {
                    router.push(globalResults[0].href);
                    setSearchOpen(false);
                  }
                }}
                className="min-w-0 flex-1 bg-transparent px-1 text-sm text-[var(--foreground)] outline-none placeholder:opacity-60"
                placeholder="Search..."
                aria-label="Global search"
              />
              {searchQuery.trim() !== "" && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="flex h-6 w-6 items-center justify-center rounded-full text-[var(--foreground)] opacity-60 hover:bg-[var(--sidebar-hover)] hover:opacity-100"
                  aria-label="Clear search"
                  title="Clear"
                >
                  ×
                </button>
              )}
            </div>
          </div>

          {searchOpen && searchQuery.trim() !== "" && (
            <div
              role="dialog"
              aria-modal="false"
              className="absolute right-0 top-full z-50 mt-2 w-[min(28rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-[var(--card-border)] bg-[var(--card)] shadow-soft"
            >
              <div className="border-b border-[var(--card-border)] px-4 py-3">
                <p className="text-sm font-semibold text-[var(--foreground)]">Search results</p>
                <p className="text-xs text-[var(--foreground)] opacity-60">Patients, doctors, appointments, prescriptions, reports</p>
              </div>
              <div className="max-h-[min(70vh,22rem)] overflow-y-auto overscroll-contain p-2">
                {globalResults.length === 0 ? (
                  <p className="px-4 py-8 text-center text-sm text-[var(--foreground)] opacity-70">No results.</p>
                ) : (
                  <ul className="space-y-1">
                    {globalResults.map((r) => (
                      <li key={r.key}>
                        <button
                          type="button"
                          onClick={() => {
                            router.push(r.href);
                            setSearchOpen(false);
                          }}
                          className="flex w-full items-start gap-3 rounded-xl px-4 py-3 text-left transition-colors hover:bg-[var(--sidebar-hover)]"
                        >
                          <span className="mt-0.5 inline-flex shrink-0 rounded-full bg-[var(--muted-bg)] px-2 py-0.5 text-xs font-medium text-[var(--foreground)] opacity-80">
                            {r.type}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-medium text-[var(--foreground)]">{r.title}</span>
                            {r.subtitle && (
                              <span className="mt-0.5 block truncate text-xs text-[var(--foreground)] opacity-70">
                                {r.subtitle}
                              </span>
                            )}
                          </span>
                          <span className="shrink-0 text-xs text-blue-600">Open →</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
        </div>
        <div className="relative" ref={notificationRef}>
          <button
            type="button"
            onClick={() => (notificationDialogOpen ? setNotificationDialogOpen(false) : openNotificationDialog())}
            className="relative flex h-9 w-9 items-center justify-center rounded-full bg-[var(--muted-bg)] text-[var(--foreground)] opacity-80 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            title="Notifications"
            aria-label="Notifications"
            aria-expanded={notificationDialogOpen}
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {unreadCount > 0 && (
              <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500 ring-2 ring-[var(--card)]" aria-hidden />
            )}
          </button>
          {notificationDialogOpen && (
            <>
              <div
                className="fixed inset-0 z-40 bg-black/40 sm:hidden"
                aria-hidden
                onClick={() => setNotificationDialogOpen(false)}
              />
              <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="notifications-dialog-title"
                className="fixed left-1/2 top-1/2 z-50 w-[min(24rem,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-[var(--card-border)] bg-[var(--card)] shadow-soft sm:absolute sm:left-auto sm:top-full sm:z-50 sm:mt-2 sm:w-[min(24rem,calc(100vw-2rem))] sm:translate-x-0 sm:translate-y-0 sm:right-0"
              >
              <div className="border-b border-[var(--card-border)] px-4 py-3">
                <h2 id="notifications-dialog-title" className="text-base font-semibold text-[var(--foreground)]">
                  Notifications
                </h2>
              </div>
              <div className="max-h-[min(70vh,20rem)] overflow-y-auto overscroll-contain px-2 py-2">
                {notifications.length === 0 ? (
                  <p className="px-4 py-8 text-center text-sm text-[var(--foreground)] opacity-70">No notifications yet.</p>
                ) : (
                  <ul className="space-y-1">
                    {notifications.map((n) => (
                      <li
                        key={n.id}
                        className="flex gap-3 rounded-xl px-4 py-3 text-left transition-colors hover:bg-[var(--sidebar-hover)]"
                      >
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--muted-bg)] text-[var(--foreground)]">
                          {n.type === "appointment" && (
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          )}
                          {n.type === "message" && (
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                          )}
                          {n.type === "support_ticket" && (
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                          )}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-[var(--foreground)]">{n.title}</p>
                          {n.body && <p className="mt-0.5 text-xs text-[var(--foreground)] opacity-70 line-clamp-2">{n.body}</p>}
                          <p className="mt-1 text-xs text-[var(--foreground)] opacity-50">{n.time}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="border-t border-[var(--card-border)] px-4 py-2">
                <button
                  type="button"
                  onClick={() => setNotificationDialogOpen(false)}
                  className="w-full rounded-xl border border-[var(--card-border)] bg-[var(--card)] px-4 py-2 text-sm font-medium text-[var(--foreground)] shadow-soft hover:bg-[var(--sidebar-hover)] focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  Close
                </button>
              </div>
              </div>
            </>
          )}
        </div>
        <div className="relative" ref={profileRef}>
          <button
            type="button"
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-1.5 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            aria-expanded={profileOpen}
            aria-haspopup="true"
          >
            {currentClinic?.clinicImage ? (
              <img
                src={currentClinic.clinicImage}
                alt="Clinic"
                className="h-9 w-9 rounded-full object-cover border-2 border-[var(--card-border)]"
              />
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--primary-muted)] text-sm font-semibold text-blue-700 dark:text-blue-200">
                {initials}
              </div>
            )}
            <svg className="h-4 w-4 text-[var(--foreground)] opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {profileOpen && (
            <div className="absolute right-0 top-full z-50 mt-2 w-48 rounded-xl border border-[var(--card-border)] bg-[var(--card)] py-1 shadow-soft">
              <div className="border-b border-[var(--card-border)] px-4 py-2">
                <p className="text-sm font-medium text-[var(--foreground)]">{user?.email ?? user?.displayName ?? "User"}</p>
                <p className="text-xs text-[var(--foreground)] opacity-70">Logged in</p>
              </div>
              <button
                type="button"
                onClick={handleProfileClick}
                className="block w-full px-4 py-2 text-left text-sm text-[var(--foreground)] hover:bg-[var(--sidebar-hover)]"
              >
                Profile
              </button>
              <Link
                href="/dashboard/settings"
                onClick={() => setProfileOpen(false)}
                className="block w-full px-4 py-2 text-left text-sm text-[var(--foreground)] hover:bg-[var(--sidebar-hover)]"
              >
                Settings
              </Link>
              <button
                type="button"
                onClick={() => {
                  setProfileOpen(false);
                  setHelpOpen(true);
                }}
                className="block w-full px-4 py-2 text-left text-sm text-[var(--foreground)] hover:bg-[var(--sidebar-hover)]"
              >
                Help
              </button>
              <button
                type="button"
                onClick={handleLogoutClick}
                className="block w-full px-4 py-2 text-left text-sm text-[var(--foreground)] hover:bg-[var(--sidebar-hover)]"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={logoutConfirmOpen}
        onClose={() => setLogoutConfirmOpen(false)}
        title="Logout"
        message="Are you sure you want to logout?"
        confirmLabel="Logout"
        cancelLabel="Cancel"
        onConfirm={handleLogoutConfirm}
        variant="primary"
      />

      <Dialog
        open={profileDialogOpen}
        onClose={() => setProfileDialogOpen(false)}
        title="Profile"
        onSave={handleProfileSave}
        saveLabel="Save"
        cancelLabel="Cancel"
      >
        <div className="space-y-4">
          <div>
            <label className={dialogLabelClass}>Clinic image</label>
            <div className="flex flex-col gap-2">
              {profileForm.clinicImage ? (
                <div className="relative">
                  <img
                    src={profileForm.clinicImage}
                    alt="Clinic"
                    className="h-24 w-24 rounded-xl object-cover border border-[var(--card-border)]"
                  />
                  <button
                    type="button"
                    onClick={() => setProfileForm((prev) => ({ ...prev, clinicImage: "" }))}
                    className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white text-xs hover:bg-red-600"
                    aria-label="Remove image"
                  >
                    ×
                  </button>
                </div>
              ) : null}
              <input
                type="file"
                accept="image/*"
                onChange={handleClinicImageChange}
                className="text-sm text-[var(--foreground)] file:mr-2 file:rounded-lg file:border-0 file:bg-[var(--muted-bg)] file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-[var(--foreground)]"
              />
            </div>
          </div>
          <div>
            <label className={dialogLabelClass}>Clinic name</label>
            <input
              type="text"
              value={profileForm.clinicName}
              onChange={(e) => setProfileForm((prev) => ({ ...prev, clinicName: e.target.value }))}
              className={dialogInputClass}
              placeholder="e.g. City Medical Center"
            />
          </div>
          <div>
            <label className={dialogLabelClass}>Clinic address</label>
            <textarea
              value={profileForm.clinicAddress}
              onChange={(e) => setProfileForm((prev) => ({ ...prev, clinicAddress: e.target.value }))}
              className={`${dialogInputClass} min-h-[80px] resize-y`}
              placeholder="Street, city, state, ZIP"
              rows={3}
            />
            <button
              type="button"
              onClick={handleCurrentLocation}
              disabled={locationLoading}
              className="mt-2 flex items-center gap-2 px-0 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
            >
              {locationLoading ? (
                "Getting location…"
              ) : (
                <>
                  <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Current location
                </>
              )}
            </button>
            {locationError && (
              <p className="mt-1.5 text-sm text-amber-600 dark:text-amber-400" role="alert">
                {locationError}
              </p>
            )}
          </div>
        </div>
      </Dialog>

      <Dialog
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        title="Menu"
        cancelLabel="Close"
      >
        <div className="space-y-2">
          {topNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 rounded-xl border border-[var(--card-border)] bg-[var(--muted-bg)] px-4 py-3 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--sidebar-hover)]"
            >
              <svg className="h-5 w-5 shrink-0 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
              </svg>
              <span className="truncate">{item.label}</span>
            </Link>
          ))}
        </div>
      </Dialog>

      <HelpDialog open={helpOpen} onClose={() => setHelpOpen(false)} />
    </header>
  );
}

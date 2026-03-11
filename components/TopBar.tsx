"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useClinic } from "@/contexts/ClinicContext";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Dialog, dialogInputClass, dialogLabelClass } from "@/components/Dialog";

const topNavItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/dashboard/patients", label: "Patients" },
  { href: "/dashboard/doctors", label: "Doctors" },
  { href: "/dashboard/prescriptions", label: "Prescriptions" },
  { href: "/dashboard/appointments", label: "Appointments" },
  { href: "/dashboard/reports", label: "Reports" },
  { href: "/dashboard/messages", label: "Messages" },
  { href: "/dashboard/staff", label: "Staffs" },
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
  const [searchOpen, setSearchOpen] = useState(false);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const [notificationDialogOpen, setNotificationDialogOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);
  const { clinic, saveClinic } = useClinic();
  const [profileForm, setProfileForm] = useState({ clinicName: "", clinicAddress: "", clinicImage: "" });
  const profileRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

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
        clinicName: clinic?.clinicName ?? "",
        clinicAddress: clinic?.clinicAddress ?? "",
        clinicImage: clinic?.clinicImage ?? "",
      });
    }
  }, [profileDialogOpen, clinic?.clinicName, clinic?.clinicAddress, clinic?.clinicImage]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
      if (notificationRef.current && notificationDialogOpen && !notificationRef.current.contains(e.target as Node)) {
        setNotificationDialogOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [notificationDialogOpen]);

  const initials = user?.email ? user.email.slice(0, 2).toUpperCase() : (user?.displayName?.slice(0, 2).toUpperCase() ?? "?");

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

  const handleLogoutConfirm = async () => {
    await logout();
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
        <span className="text-lg font-semibold tracking-tight text-[var(--foreground)]">Clinikal</span>
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
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="notifications-dialog-title"
              className="absolute right-0 top-full z-50 mt-2 w-[min(24rem,calc(100vw-2rem))] rounded-2xl border border-[var(--card-border)] bg-[var(--card)] shadow-soft"
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
            {clinic?.clinicImage ? (
              <img
                src={clinic.clinicImage}
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
              <Link
                href="/dashboard/settings"
                onClick={() => setProfileOpen(false)}
                className="block w-full px-4 py-2 text-left text-sm text-[var(--foreground)] hover:bg-[var(--sidebar-hover)]"
              >
                Settings
              </Link>
              <button
                type="button"
                onClick={handleProfileClick}
                className="block w-full px-4 py-2 text-left text-sm text-[var(--foreground)] hover:bg-[var(--sidebar-hover)]"
              >
                Profile
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
          </div>
        </div>
      </Dialog>
    </header>
  );
}

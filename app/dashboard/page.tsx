"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useClinic } from "@/contexts/ClinicContext";
import { useClinicData } from "@/contexts/ClinicDataContext";
import { Dialog, dialogInputClass, dialogLabelClass } from "@/components/Dialog";

function getTodayString() {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

function formatDateChip(isoDate: string) {
  const d = new Date(isoDate);
  if (Number.isNaN(d.getTime())) return isoDate;
  return d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
}

function formatTimeChip(d: Date) {
  return d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

function StatCard({
  title,
  value,
  subtitle,
  icon,
  href,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  href?: string;
}) {
  const content = (
    <>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-[var(--foreground)] opacity-70">{title}</p>
          <p className="mt-1 text-2xl font-bold text-[var(--foreground)]">{value}</p>
          {subtitle && (
            <p className="mt-0.5 text-xs text-[var(--foreground)] opacity-70">{subtitle}</p>
          )}
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--primary-muted)] text-blue-600 dark:text-blue-300">
          {icon}
        </div>
      </div>
    </>
  );

  const cardClass =
    "rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-5 shadow-soft transition-all duration-200 " +
    (href
      ? "hover:border-blue-500/50 hover:shadow-md hover:shadow-blue-500/10 cursor-pointer"
      : "");

  if (href) {
    return (
      <Link href={href} className={`block ${cardClass}`}>
        {content}
      </Link>
    );
  }

  return <div className={cardClass}>{content}</div>;
}

function formatTime(t: string) {
  const [h, m] = t.split(":");
  const hour = parseInt(h, 10);
  const am = hour < 12;
  const h12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${h12}:${m} ${am ? "AM" : "PM"}`;
}

const statusColors: Record<string, string> = {
  scheduled: "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200",
  confirmed: "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300",
  "in-progress": "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300",
  completed: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300",
  cancelled: "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300",
  "no-show": "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300",
};

export default function DashboardPage() {
  const { user } = useAuth();
  const { currentClinic } = useClinic();
  const { appointments, patients } = useClinicData();
  const displayName = currentClinic?.clinicName?.trim()
    ? currentClinic.clinicName.trim().replace(/^./, (c) => c.toUpperCase())
    : ((user?.displayName ?? (user?.email ? user.email.split("@")[0] : "")) || "there").replace(/^./, (c) => c.toUpperCase());
  const today = getTodayString();
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [now, setNow] = useState(() => new Date());
  const todayAppointments = useMemo(() => appointments.filter((a) => a.date === today), [appointments, today]);
  const upcomingAppointments = useMemo(() => appointments.filter((a) => a.date >= today).slice(0, 5), [appointments, today]);

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="p-4 sm:p-8">
      <header className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-[var(--foreground)]">
          Welcome Back, {displayName}.
        </h1>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setCalendarOpen(true)}
            className="inline-flex items-center gap-2 rounded-full border border-[var(--card-border)] bg-[var(--card)] px-4 py-2 text-sm font-medium text-[var(--foreground)] shadow-soft hover:bg-[var(--sidebar-hover)] focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            title="Open calendar"
            aria-label="Open calendar"
          >
            <svg className="h-4 w-4 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>{formatDateChip(today)}</span>
          </button>

          <div
            className="inline-flex items-center gap-2 rounded-full border border-[var(--card-border)] bg-[var(--card)] px-4 py-2 text-sm font-medium text-[var(--foreground)] shadow-soft"
            aria-label="Current time"
            title="Current time"
          >
            <svg className="h-4 w-4 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{formatTimeChip(now)}</span>
          </div>
        </div>
      </header>

      <Dialog open={calendarOpen} onClose={() => setCalendarOpen(false)} title="Calendar" cancelLabel="Close">
        <div className="space-y-4">
          <p className="text-sm text-[var(--foreground)] opacity-80">
            Current date (view only).
          </p>
          <div>
            <label className={dialogLabelClass}>Date</label>
            <input
              type="date"
              value={today}
              readOnly
              className={dialogInputClass}
            />
          </div>
        </div>
      </Dialog>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          href="/dashboard/appointments"
          title="Today's appointments"
          value={todayAppointments.length}
          subtitle={today}
          icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          }
        />
        <StatCard
          href="/dashboard/patients"
          title="Total patients"
          value={patients.length}
          subtitle="Registered"
          icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          }
        />
        <StatCard
          href="/dashboard/appointments"
          title="Scheduled"
          value={appointments.filter((a) => a.status === "scheduled" || a.status === "confirmed").length}
          subtitle="Upcoming"
          icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          }
        />
        <StatCard
          href="/dashboard/appointments"
          title="Completed today"
          value={appointments.filter((a) => a.date === today && a.status === "completed").length}
          subtitle="So far"
          icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <Link
          href="/dashboard/appointments"
          className="block cursor-pointer rounded-2xl border border-[var(--card-border)] bg-[var(--card)] shadow-soft transition-all duration-200 hover:border-blue-500/50 hover:shadow-md hover:shadow-blue-500/10"
        >
          <section>
            <div className="border-b border-[var(--card-border)] px-5 py-4">
              <h2 className="font-semibold text-[var(--foreground)]">Today&apos;s schedule</h2>
              <p className="text-sm text-[var(--foreground)] opacity-70">March 10, 2025</p>
            </div>
            <ul className="divide-y divide-[var(--card-border)]">
              {todayAppointments.length === 0 ? (
                <li className="px-5 py-8 text-center text-sm text-[var(--foreground)] opacity-70">
                  No appointments today
                </li>
              ) : (
                todayAppointments.map((apt) => (
                  <li key={apt.id} className="flex items-center justify-between gap-4 px-5 py-4">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-[var(--foreground)]">{apt.patientName}</p>
                      <p className="text-sm text-[var(--foreground)] opacity-70">
                        {apt.type.replace("-", " ")} · {apt.doctor}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <span className="text-sm font-medium text-[var(--foreground)] opacity-90">
                        {formatTime(apt.time)}
                      </span>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${statusColors[apt.status] ?? "bg-slate-100 text-slate-600"}`}
                      >
                        {apt.status.replace("-", " ")}
                      </span>
                    </div>
                  </li>
                ))
              )}
            </ul>
          </section>
        </Link>

        <Link
          href="/dashboard/appointments"
          className="block cursor-pointer rounded-2xl border border-[var(--card-border)] bg-[var(--card)] shadow-soft transition-all duration-200 hover:border-blue-500/50 hover:shadow-md hover:shadow-blue-500/10"
        >
          <section>
            <div className="border-b border-[var(--card-border)] px-5 py-4">
              <h2 className="font-semibold text-[var(--foreground)]">Upcoming appointments</h2>
              <p className="text-sm text-[var(--foreground)] opacity-70">Next 5</p>
            </div>
            <ul className="divide-y divide-[var(--card-border)]">
              {upcomingAppointments.map((apt) => (
                <li key={apt.id} className="flex items-center justify-between gap-4 px-5 py-4">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-[var(--foreground)]">{apt.patientName}</p>
                    <p className="text-sm text-[var(--foreground)] opacity-70">
                      {apt.date} at {formatTime(apt.time)}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${statusColors[apt.status] ?? "bg-slate-100 text-slate-600"}`}
                  >
                    {apt.status.replace("-", " ")}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </Link>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useTheme, type ThemeMode } from "@/contexts/ThemeContext";
import { useSettings, type WorkingHoursDay } from "@/contexts/SettingsContext";
import { useClinicData } from "@/contexts/ClinicDataContext";

const DAY_LABELS: Record<WorkingHoursDay, string> = {
  mon: "Monday",
  tue: "Tuesday",
  wed: "Wednesday",
  thu: "Thursday",
  fri: "Friday",
  sat: "Saturday",
  sun: "Sunday",
};

const inputClass =
  "w-full rounded-xl border border-[var(--card-border)] bg-[var(--muted-bg)] px-4 py-2.5 text-sm text-[var(--foreground)] placeholder:opacity-60 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20";
const labelClass = "mb-1.5 block text-sm font-medium text-[var(--foreground)] opacity-90";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { settings, setNotifications, setWorkingHours, setClinicAddress, setMaxPatientsForDoctor } = useSettings();
  const { doctors } = useClinicData();
  const [addressDraft, setAddressDraft] = useState(settings.clinicAddress);

  useEffect(() => {
    setAddressDraft(settings.clinicAddress);
  }, [settings.clinicAddress]);

  return (
    <div className="p-8">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--foreground)]">Settings</h1>
        <p className="mt-1 text-[var(--foreground)] opacity-70">
          Manage your clinic preferences and configuration
        </p>
      </header>

      <div className="space-y-8">
        {/* Theme */}
        <section className="rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-6 shadow-soft">
          <h2 className="text-lg font-semibold text-[var(--foreground)]">Appearance</h2>
          <p className="mt-1 text-sm text-[var(--foreground)] opacity-70">Choose light, dark, or system theme.</p>
          <div className="mt-4 flex flex-wrap gap-3">
            {(["light", "dark", "system"] as ThemeMode[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTheme(t)}
                className={`rounded-xl border px-4 py-2.5 text-sm font-medium capitalize transition-colors ${
                  theme === t
                    ? "border-blue-500 bg-blue-600 text-white"
                    : "border-[var(--card-border)] bg-[var(--muted-bg)] text-[var(--foreground)] hover:bg-[var(--sidebar-hover)]"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </section>

        {/* Notifications */}
        <section className="rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-6 shadow-soft">
          <h2 className="text-lg font-semibold text-[var(--foreground)]">Notification configuration</h2>
          <p className="mt-1 text-sm text-[var(--foreground)] opacity-70">Configure how you receive reminders and alerts.</p>
          <ul className="mt-4 space-y-3">
            {[
              { key: "appointmentReminders" as const, label: "Appointment reminders" },
              { key: "emailReminders" as const, label: "Email reminders" },
              { key: "smsReminders" as const, label: "SMS reminders" },
              { key: "inAppNotifications" as const, label: "In-app notifications" },
            ].map(({ key, label }) => (
              <li key={key} className="flex items-center justify-between gap-4">
                <span className="text-sm text-[var(--foreground)]">{label}</span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={settings.notifications[key]}
                  onClick={() => setNotifications({ [key]: !settings.notifications[key] })}
                  className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                    settings.notifications[key] ? "bg-blue-600" : "bg-[var(--muted)]"
                  }`}
                >
                  <span
                    className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-transform ${
                      settings.notifications[key] ? "left-6 translate-x-[-100%]" : "left-1"
                    }`}
                  />
                </button>
              </li>
            ))}
          </ul>
        </section>

        {/* Working hours */}
        <section className="rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-6 shadow-soft">
          <h2 className="text-lg font-semibold text-[var(--foreground)]">Working hours</h2>
          <p className="mt-1 text-sm text-[var(--foreground)] opacity-70">Set clinic hours per day.</p>
          <div className="mt-4 space-y-4">
            {(Object.entries(DAY_LABELS) as [WorkingHoursDay, string][]).map(([day, label]) => {
              const h = settings.workingHours[day];
              return (
                <div key={day} className="flex flex-wrap items-center gap-4 rounded-xl border border-[var(--card-border)] bg-[var(--muted-bg)] p-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={h.enabled}
                      onChange={(e) => setWorkingHours(day, { enabled: e.target.checked })}
                      className="h-4 w-4 rounded border-[var(--card-border)] text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-[var(--foreground)]">{label}</span>
                  </label>
                  {h.enabled && (
                    <>
                      <input
                        type="time"
                        value={h.start}
                        onChange={(e) => setWorkingHours(day, { start: e.target.value })}
                        className={`${inputClass} min-w-[7.5rem] w-32`}
                      />
                      <span className="text-[var(--foreground)] opacity-70">to</span>
                      <input
                        type="time"
                        value={h.end}
                        onChange={(e) => setWorkingHours(day, { end: e.target.value })}
                        className={`${inputClass} min-w-[7.5rem] w-32`}
                      />
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Clinic address */}
        <section className="rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-6 shadow-soft">
          <h2 className="text-lg font-semibold text-[var(--foreground)]">Clinic address</h2>
          <p className="mt-1 text-sm text-[var(--foreground)] opacity-70">Edit your clinic address.</p>
          <textarea
            value={addressDraft}
            onChange={(e) => setAddressDraft(e.target.value)}
            className={`${inputClass} mt-4 min-h-[100px] resize-y`}
            placeholder="Street, city, state, ZIP"
            rows={3}
          />
          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={() => setClinicAddress(addressDraft)}
              disabled={!addressDraft.trim()}
              className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-soft hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Save
            </button>
          </div>
        </section>

        {/* Max patients per doctor */}
        <section className="rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-6 shadow-soft">
          <h2 className="text-lg font-semibold text-[var(--foreground)]">Max patients per day (by doctor)</h2>
          <p className="mt-1 text-sm text-[var(--foreground)] opacity-70">Set maximum number of patients per day for each doctor.</p>
          <div className="mt-4 space-y-4">
            {doctors.length === 0 ? (
              <p className="text-sm text-[var(--foreground)] opacity-70">No doctors added yet. Add doctors from the Doctors page.</p>
            ) : (
              doctors.map((doc) => (
                <div key={doc.id} className="flex flex-wrap items-center gap-4 rounded-xl border border-[var(--card-border)] bg-[var(--muted-bg)] p-4">
                  <span className="text-sm font-medium text-[var(--foreground)]">
                    Dr. {doc.firstName} {doc.lastName}
                  </span>
                  <input
                    type="number"
                    min={1}
                    max={999}
                    value={settings.maxPatientsPerDoctor[doc.id] ?? ""}
                    onChange={(e) => {
                      const raw = e.target.value;
                      if (raw === "") {
                        setMaxPatientsForDoctor(doc.id, 0);
                        return;
                      }
                      const v = parseInt(raw, 10);
                      setMaxPatientsForDoctor(doc.id, Number.isFinite(v) ? v : 0);
                    }}
                    placeholder="No limit"
                    className={inputClass}
                    style={{ maxWidth: "6rem" }}
                  />
                  <span className="text-sm text-[var(--foreground)] opacity-70">patients per day</span>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

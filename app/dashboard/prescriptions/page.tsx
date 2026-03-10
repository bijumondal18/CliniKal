"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { prescriptions } from "@/lib/prescriptions-data";
import { patients } from "@/lib/mock-data";

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function matchQuery(text: string, q: string): boolean {
  if (!q.trim()) return true;
  const lower = text.toLowerCase();
  const terms = q.toLowerCase().trim().split(/\s+/);
  return terms.every((t) => lower.includes(t));
}

export default function PrescriptionsPage() {
  const [patientFilter, setPatientFilter] = useState("");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    return prescriptions.filter((rx) => {
      if (patientFilter && rx.patientId !== patientFilter) return false;
      const searchable = [
        rx.patientName,
        rx.doctorName,
        rx.diagnosis ?? "",
        rx.notes ?? "",
        rx.followUp ?? "",
        ...rx.medications.flatMap((m) => [m.name, m.dosage, m.frequency]),
      ].join(" ");
      return matchQuery(searchable, search);
    });
  }, [patientFilter, search]);

  return (
    <div className="p-8">
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Prescriptions</h1>
          <p className="mt-1 text-[var(--foreground)] opacity-70">
            All prescriptions by patient
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <select
            value={patientFilter}
            onChange={(e) => setPatientFilter(e.target.value)}
            className="rounded-xl border border-[var(--card-border)] bg-[var(--muted-bg)] px-4 py-2.5 text-sm text-[var(--foreground)] shadow-soft focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 input-select"
          >
            <option value="">All patients</option>
            {patients.map((p) => (
              <option key={p.id} value={p.id}>
                {p.firstName} {p.lastName}
              </option>
            ))}
          </select>
          <input
            type="search"
            placeholder="Search prescriptions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-xl border border-[var(--card-border)] bg-[var(--muted-bg)] px-4 py-2.5 text-sm text-[var(--foreground)] shadow-soft placeholder:opacity-60 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
      </header>

      <div className="space-y-6">
        {filtered.length === 0 ? (
          <div className="overflow-hidden rounded-2xl border border-[var(--card-border)] bg-[var(--card)] py-12 text-center text-[var(--foreground)] opacity-70">
            No prescriptions match your filters or search.
          </div>
        ) : (
          filtered.map((rx) => (
            <div
              key={rx.id}
              className="rounded-2xl border border-[var(--card-border)] bg-[var(--card)] shadow-soft"
            >
              <div className="border-b border-[var(--card-border)] px-5 py-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <Link
                      href={`/dashboard/patients/${rx.patientId}`}
                      className="font-semibold text-[var(--foreground)] hover:text-blue-600"
                    >
                      {rx.patientName}
                    </Link>
                    <p className="text-sm text-[var(--foreground)] opacity-70">
                      {rx.doctorName} · {formatDate(rx.date)}
                    </p>
                  </div>
                  <span className="rounded bg-[var(--muted-bg)] px-2.5 py-1 text-xs font-medium text-[var(--foreground)]">
                    {rx.medications.length} medication{rx.medications.length !== 1 ? "s" : ""}
                  </span>
                </div>
                {rx.diagnosis && (
                  <p className="mt-2 text-sm text-[var(--foreground)] opacity-80">
                    <span className="font-medium text-[var(--foreground)]">Diagnosis:</span>{" "}
                    {rx.diagnosis}
                  </p>
                )}
              </div>
                  <ul className="divide-y divide-[var(--card-border)] px-5">
                {rx.medications.map((med, i) => (
                  <li key={i} className="py-3">
                    <p className="font-medium text-[var(--foreground)]">{med.name}</p>
                    <p className="text-sm text-[var(--foreground)] opacity-70">
                      {med.dosage} · {med.frequency} · {med.duration}
                      {med.instructions && ` · ${med.instructions}`}
                    </p>
                  </li>
                ))}
              </ul>
              {(rx.notes || rx.followUp) && (
                <div className="border-t border-[var(--card-border)] px-5 py-3">
                  {rx.notes && (
                    <p className="text-sm text-[var(--foreground)] opacity-80">{rx.notes}</p>
                  )}
                  {rx.followUp && (
                    <p className="mt-1 text-sm font-medium text-blue-600 dark:text-blue-400">
                      Follow-up: {rx.followUp}
                    </p>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

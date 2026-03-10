"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { reports } from "@/lib/reports-data";
import { patients } from "@/lib/mock-data";

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

const typeLabels: Record<string, string> = {
  lab: "Lab",
  imaging: "Imaging",
  pathology: "Pathology",
  other: "Other",
};

const statusColors: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300",
  available: "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300",
  reviewed: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300",
};

function matchQuery(text: string, q: string): boolean {
  if (!q.trim()) return true;
  const lower = text.toLowerCase();
  const terms = q.toLowerCase().trim().split(/\s+/);
  return terms.every((t) => lower.includes(t));
}

export default function ReportsPage() {
  const [patientFilter, setPatientFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    return reports.filter((r) => {
      if (patientFilter && r.patientId !== patientFilter) return false;
      if (typeFilter && r.type !== typeFilter) return false;
      const searchable = [r.title, r.summary ?? "", r.findings ?? "", r.patientName, r.doctorName].join(" ");
      if (!matchQuery(searchable, search)) return false;
      return true;
    });
  }, [patientFilter, typeFilter, search]);

  return (
    <div className="p-8">
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Reports</h1>
          <p className="mt-1 text-[var(--foreground)] opacity-70">
            All reports by patient
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
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="rounded-xl border border-[var(--card-border)] bg-[var(--muted-bg)] px-4 py-2.5 text-sm text-[var(--foreground)] shadow-soft focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 input-select"
          >
            <option value="">All types</option>
            <option value="lab">Lab</option>
            <option value="imaging">Imaging</option>
            <option value="pathology">Pathology</option>
            <option value="other">Other</option>
          </select>
          <input
            type="search"
            placeholder="Search reports..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-xl border border-[var(--card-border)] bg-[var(--muted-bg)] px-4 py-2.5 text-sm text-[var(--foreground)] shadow-soft placeholder:opacity-60 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
      </header>

      <div className="overflow-hidden rounded-2xl border border-[var(--card-border)] bg-[var(--card)] shadow-soft">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--card-border)] bg-[var(--muted-bg)]">
                <th className="px-5 py-3 font-semibold text-[var(--foreground)]">Report</th>
                <th className="px-5 py-3 font-semibold text-[var(--foreground)]">Patient</th>
                <th className="px-5 py-3 font-semibold text-[var(--foreground)]">Doctor</th>
                <th className="px-5 py-3 font-semibold text-[var(--foreground)]">Type</th>
                <th className="px-5 py-3 font-semibold text-[var(--foreground)]">Date</th>
                <th className="px-5 py-3 font-semibold text-[var(--foreground)]">Status</th>
                <th className="px-5 py-3 font-semibold text-[var(--foreground)]"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--card-border)]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-[var(--foreground)] opacity-70">
                    No reports match your filters or search.
                  </td>
                </tr>
              ) : (
                filtered.map((r) => (
                <tr
                  key={r.id}
                  className="transition-colors hover:bg-[var(--sidebar-hover)]"
                >
                  <td className="px-5 py-4">
                    <p className="font-medium text-[var(--foreground)]">{r.title}</p>
                    {r.summary && (
                      <p className="mt-0.5 line-clamp-1 text-xs text-[var(--foreground)] opacity-70">
                          {r.summary}
                        </p>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <Link
                        href={`/dashboard/patients/${r.patientId}`}
                        className="font-medium text-[var(--foreground)] hover:text-blue-600"
                      >
                        {r.patientName}
                      </Link>
                    </td>
                    <td className="px-5 py-4 text-[var(--foreground)] opacity-80">{r.doctorName}</td>
                    <td className="px-5 py-4">
                      <span className="rounded bg-[var(--muted-bg)] px-2 py-0.5 text-xs font-medium text-[var(--foreground)]">
                        {typeLabels[r.type] ?? r.type}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-[var(--foreground)] opacity-80">{formatDate(r.date)}</td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${statusColors[r.status] ?? "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300"}`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <button
                        type="button"
                        className="text-blue-600 hover:text-blue-700"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { messages } from "@/lib/messages-data";
import { getPatientById } from "@/lib/mock-data";
import { PlusIcon } from "@/components/icons/PlusIcon";

function formatDateTime(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  if (isToday) {
    return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  }
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

const senderBadge: Record<string, string> = {
  doctor: "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300",
  patient: "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300",
  clinic: "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300",
};

function matchQuery(text: string, q: string): boolean {
  if (!q.trim()) return true;
  const lower = text.toLowerCase();
  const terms = q.toLowerCase().trim().split(/\s+/);
  return terms.every((t) => lower.includes(t));
}

export default function MessagesPage() {
  const [senderFilter, setSenderFilter] = useState("");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const sorted = [...messages].sort(
      (a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime()
    );
    return sorted.filter((m) => {
      if (senderFilter && m.senderType !== senderFilter) return false;
      const searchable = [
        m.subject ?? "",
        m.body,
        m.senderName,
        m.recipientName,
      ].join(" ");
      return matchQuery(searchable, search);
    });
  }, [senderFilter, search]);

  return (
    <div className="p-8">
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Messages</h1>
          <p className="mt-1 text-[var(--foreground)] opacity-70">
            Messages from doctors and patients
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <select
            value={senderFilter}
            onChange={(e) => setSenderFilter(e.target.value)}
            className="rounded-xl border border-[var(--card-border)] bg-[var(--muted-bg)] px-4 py-2.5 text-sm text-[var(--foreground)] shadow-soft focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 input-select"
          >
            <option value="">All senders</option>
            <option value="doctor">From doctors</option>
            <option value="patient">From patients</option>
            <option value="clinic">From clinic</option>
          </select>
          <input
            type="search"
            placeholder="Search messages..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-xl border border-[var(--card-border)] bg-[var(--muted-bg)] px-4 py-2.5 text-sm text-[var(--foreground)] shadow-soft placeholder:opacity-60 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
          <button
            type="button"
            className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-soft hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <span className="flex items-center gap-2">
              <PlusIcon className="h-4 w-4" />
              New message
            </span>
          </button>
        </div>
      </header>

      <div className="overflow-hidden rounded-2xl border border-[var(--card-border)] bg-[var(--card)] shadow-soft">
        <div className="divide-y divide-[var(--card-border)]">
          {filtered.length === 0 ? (
            <div className="px-5 py-12 text-center text-[var(--foreground)] opacity-70">
              No messages match your filters or search.
            </div>
          ) : (
            filtered.map((m) => {
              const patient = m.relatedPatientId ? getPatientById(m.relatedPatientId) : null;
              const patientName = patient ? `${patient.firstName} ${patient.lastName}` : null;
              return (
                <div
                  key={m.id}
                  className={`flex flex-col gap-2 px-5 py-4 transition-colors hover:bg-[var(--sidebar-hover)] sm:flex-row sm:items-start sm:justify-between ${!m.read ? "bg-blue-500/10 dark:bg-blue-500/20" : ""}`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${senderBadge[m.senderType] ?? "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300"}`}
                      >
                        {m.senderType}
                      </span>
                      <span className="font-medium text-[var(--foreground)]">
                        {m.senderName}
                      </span>
                      <span className="text-[var(--foreground)] opacity-50">→</span>
                      <span className="text-[var(--foreground)] opacity-80">{m.recipientName}</span>
                      {!m.read && (
                        <span className="rounded bg-blue-500 px-1.5 py-0.5 text-xs font-medium text-white">
                          New
                        </span>
                      )}
                    </div>
                    {m.subject && (
                      <p className="mt-1 font-medium text-[var(--foreground)]">{m.subject}</p>
                    )}
                    <p className="mt-0.5 line-clamp-2 text-sm text-[var(--foreground)] opacity-80">
                      {m.body}
                    </p>
                    {m.relatedPatientId && patientName && (
                      <p className="mt-1 text-xs text-[var(--foreground)] opacity-70">
                        Patient:{" "}
                        <Link
                          href={`/dashboard/patients/${m.relatedPatientId}`}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          {patientName}
                        </Link>
                      </p>
                    )}
                  </div>
                  <div className="shrink-0 text-right text-xs text-[var(--foreground)] opacity-70">
                    {formatDateTime(m.sentAt)}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

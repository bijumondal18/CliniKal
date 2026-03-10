"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useClinicData } from "@/contexts/ClinicDataContext";
import { Dialog, dialogInputClass, dialogLabelClass } from "@/components/Dialog";
import { PlusIcon } from "@/components/icons/PlusIcon";
import type { Doctor } from "@/types/doctor";

const dayLabels: Record<string, string> = {
  mon: "Mon",
  tue: "Tue",
  wed: "Wed",
  thu: "Thu",
  fri: "Fri",
  sat: "Sat",
};

function formatTime(t: string) {
  const [h, m] = t.split(":");
  const hour = parseInt(h, 10);
  const am = hour < 12;
  const h12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${h12}:${m} ${am ? "AM" : "PM"}`;
}

function formatSchedule(schedule: { day: string; startTime: string; endTime: string }[]) {
  return schedule
    .map((s) => `${dayLabels[s.day] ?? s.day} ${formatTime(s.startTime)}–${formatTime(s.endTime)}`)
    .join(", ");
}

function matchQuery(text: string, q: string): boolean {
  if (!q.trim()) return true;
  const lower = text.toLowerCase();
  const terms = q.toLowerCase().trim().split(/\s+/);
  return terms.every((t) => lower.includes(t));
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function DoctorsPage() {
  const { doctors: doctorList, addDoctor, updateDoctor } = useClinicData();
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    title: "MD",
    qualification: "",
    specializations: "",
    consultationFee: "",
    phone: "",
    email: "",
    bio: "",
    profilePhoto: "",
  });

  const filtered = useMemo(() => {
    return doctorList.filter((doc) => {
      const name = `Dr. ${doc.firstName} ${doc.lastName}`;
      const searchable = [
        name,
        doc.firstName,
        doc.lastName,
        doc.qualification,
        doc.phone,
        doc.email,
        ...doc.specializations,
      ].join(" ");
      return matchQuery(searchable, search);
    });
  }, [doctorList, search]);

  const doctorFormValid =
    form.firstName.trim() !== "" &&
    form.lastName.trim() !== "" &&
    form.email.trim() !== "" &&
    EMAIL_REGEX.test(form.email.trim()) &&
    form.phone.trim() !== "";

  const resetForm = () => {
    setEditingId(null);
    setForm({
      firstName: "",
      lastName: "",
      title: "MD",
      qualification: "",
      specializations: "",
      consultationFee: "",
      phone: "",
      email: "",
      bio: "",
      profilePhoto: "",
    });
  };

  const openEdit = (doc: Doctor) => {
    setForm({
      firstName: doc.firstName,
      lastName: doc.lastName,
      title: doc.title,
      qualification: doc.qualification,
      specializations: doc.specializations.join(", "),
      consultationFee: String(doc.consultationFee),
      phone: doc.phone,
      email: doc.email,
      bio: doc.bio ?? "",
      profilePhoto: doc.profilePhoto ?? "",
    });
    setEditingId(doc.id);
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.firstName.trim() || !form.lastName.trim() || !form.email.trim() || !form.phone.trim()) {
      return;
    }
    const fee = parseInt(form.consultationFee, 10);
    const payload = {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      title: form.title.trim() || "MD",
      specializations: form.specializations
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      qualification: form.qualification.trim() || "—",
      consultationFee: Number.isFinite(fee) ? fee : 0,
      phone: form.phone.trim(),
      email: form.email.trim(),
      schedule: editingId ? (doctorList.find((d) => d.id === editingId)?.schedule ?? []) : [],
      bio: form.bio.trim() || undefined,
      profilePhoto: form.profilePhoto.trim() || undefined,
    };
    if (editingId) {
      updateDoctor(editingId, payload);
    } else {
      const id = `d-${Date.now()}`;
      addDoctor({ id, ...payload });
    }
    setDialogOpen(false);
    resetForm();
  };

  return (
    <div className="p-8">
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Doctors</h1>
          <p className="mt-1 text-[var(--foreground)] opacity-70">
            All doctors and their details
          </p>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
            className="rounded-xl border border-[var(--card-border)] bg-[var(--muted-bg)] p-2.5 text-[var(--foreground)] shadow-soft hover:bg-[var(--sidebar-hover)] hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 opacity-80"
            title={viewMode === "grid" ? "Switch to list view" : "Switch to grid view"}
            aria-label={viewMode === "grid" ? "Switch to list view" : "Switch to grid view"}
          >
            {viewMode === "grid" ? (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            )}
          </button>
          <input
            type="search"
            placeholder="Search doctors..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-xl border border-[var(--card-border)] bg-[var(--muted-bg)] px-4 py-2.5 text-sm text-[var(--foreground)] shadow-soft placeholder:opacity-60 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
          <button
            type="button"
            onClick={() => { resetForm(); setDialogOpen(true); }}
            className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-soft hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <span className="flex items-center gap-2">
              <PlusIcon className="h-4 w-4" />
              Add doctor
            </span>
          </button>
        </div>
      </header>

      <Dialog
        open={dialogOpen}
        onClose={() => { setDialogOpen(false); resetForm(); }}
        title={editingId ? "Edit doctor" : "Add new doctor"}
        onSave={handleSave}
        saveLabel="Save"
        cancelLabel="Cancel"
        saveDisabled={!doctorFormValid}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={dialogLabelClass}>First name *</label>
              <input
                type="text"
                value={form.firstName}
                onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
                className={dialogInputClass}
                placeholder="John"
              />
            </div>
            <div>
              <label className={dialogLabelClass}>Last name *</label>
              <input
                type="text"
                value={form.lastName}
                onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
                className={dialogInputClass}
                placeholder="Doe"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={dialogLabelClass}>Title</label>
              <select
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                className={`${dialogInputClass} input-select`}
              >
                <option value="MD">MD</option>
                <option value="DO">DO</option>
                <option value="MBBS">MBBS</option>
                <option value="Dr">Dr</option>
              </select>
            </div>
            <div>
              <label className={dialogLabelClass}>Consultation fee ($) *</label>
              <input
                type="number"
                min={0}
                value={form.consultationFee}
                onChange={(e) => setForm((f) => ({ ...f, consultationFee: e.target.value }))}
                className={dialogInputClass}
                placeholder="150"
              />
            </div>
          </div>
          <div>
            <label className={dialogLabelClass}>Qualification</label>
            <input
              type="text"
              value={form.qualification}
              onChange={(e) => setForm((f) => ({ ...f, qualification: e.target.value }))}
              className={dialogInputClass}
              placeholder="MBBS, MD (Internal Medicine)"
            />
          </div>
          <div>
            <label className={dialogLabelClass}>Specializations (comma-separated)</label>
            <input
              type="text"
              value={form.specializations}
              onChange={(e) => setForm((f) => ({ ...f, specializations: e.target.value }))}
              className={dialogInputClass}
              placeholder="General Medicine, Internal Medicine"
            />
          </div>
          <div>
            <label className={dialogLabelClass}>Email *</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              className={dialogInputClass}
              placeholder="dr.name@clinic.com"
            />
          </div>
          <div>
            <label className={dialogLabelClass}>Phone number *</label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              className={dialogInputClass}
              placeholder="+1 (555) 100-2000"
            />
          </div>
          <div>
            <label className={dialogLabelClass}>Bio</label>
            <textarea
              value={form.bio}
              onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
              className={`${dialogInputClass} min-h-[60px] resize-y`}
              placeholder="Brief professional summary"
              rows={2}
            />
          </div>
          <div>
            <label className={dialogLabelClass}>Profile photo URL</label>
            <input
              type="url"
              value={form.profilePhoto}
              onChange={(e) => setForm((f) => ({ ...f, profilePhoto: e.target.value }))}
              className={dialogInputClass}
              placeholder="https://example.com/photo.jpg"
            />
          </div>
        </div>
      </Dialog>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.length === 0 ? (
          <p className="col-span-full rounded-2xl border border-[var(--card-border)] bg-[var(--card)] py-12 text-center text-[var(--foreground)] opacity-70">
            No doctors match your search.
          </p>
        ) : viewMode === "list" ? (
          <div className="col-span-full overflow-hidden rounded-2xl border border-[var(--card-border)] bg-[var(--card)] shadow-soft">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--card-border)] bg-[var(--muted-bg)]">
                    <th className="px-5 py-3 font-semibold text-[var(--foreground)]">Doctor</th>
                    <th className="px-5 py-3 font-semibold text-[var(--foreground)]">Title</th>
                    <th className="px-5 py-3 font-semibold text-[var(--foreground)]">Specializations</th>
                    <th className="px-5 py-3 font-semibold text-[var(--foreground)]">Fee</th>
                    <th className="px-5 py-3 font-semibold text-[var(--foreground)]">Contact</th>
                    <th className="px-5 py-3 font-semibold text-[var(--foreground)]"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--card-border)]">
                  {filtered.map((doc) => (
                    <tr key={doc.id} className="transition-colors hover:bg-[var(--sidebar-hover)]">
                      <td className="px-5 py-4">
                        <Link href={`/dashboard/doctors/${doc.id}`} className="flex items-center gap-3">
                          {doc.profilePhoto ? (
                            <img src={doc.profilePhoto} alt="" className="h-10 w-10 rounded-full object-cover" />
                          ) : (
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--primary-muted)] text-blue-600 dark:text-blue-300">
                              <span className="text-sm font-semibold">{doc.firstName[0]}{doc.lastName[0]}</span>
                            </div>
                          )}
                          <span className="font-medium text-[var(--foreground)] hover:text-blue-600">
                            Dr. {doc.firstName} {doc.lastName}
                          </span>
                        </Link>
                      </td>
                      <td className="px-5 py-4 text-[var(--foreground)] opacity-80">{doc.title} · {doc.qualification.split(",")[0]}</td>
                      <td className="px-5 py-4">
                        <div className="flex flex-wrap gap-1.5">
                          {doc.specializations.slice(0, 2).map((s) => (
                            <span key={s} className="rounded bg-[var(--muted-bg)] px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/40 dark:text-blue-200">{s}</span>
                          ))}
                        </div>
                      </td>
                      <td className="px-5 py-4 font-medium text-[var(--foreground)]">${doc.consultationFee}</td>
                      <td className="px-5 py-4 text-[var(--foreground)] opacity-80">{doc.phone}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={(e) => { e.preventDefault(); openEdit(doc); }}
                            className="rounded p-1.5 text-[var(--foreground)] opacity-70 hover:bg-[var(--muted-bg)] hover:opacity-100"
                            title="Edit doctor"
                            aria-label="Edit doctor"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <Link href={`/dashboard/doctors/${doc.id}`} className="text-blue-600 hover:text-blue-700">
                            View →
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          filtered.map((doc) => (
            <div
              key={doc.id}
              className="group relative rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-5 shadow-soft transition-shadow hover:shadow-soft"
            >
              <Link href={`/dashboard/doctors/${doc.id}`} className="block">
              <div className="flex items-start justify-between gap-2">
                {doc.profilePhoto ? (
                  <img src={doc.profilePhoto} alt="" className="h-12 w-12 shrink-0 rounded-full object-cover" />
                ) : (
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--primary-muted)] text-blue-600 dark:text-blue-300">
                    <span className="text-lg font-semibold">
                      {doc.firstName[0]}
                      {doc.lastName[0]}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); openEdit(doc); }}
                    className="rounded p-1.5 text-[var(--foreground)] opacity-60 hover:bg-[var(--muted-bg)] hover:opacity-100"
                    title="Edit doctor"
                    aria-label="Edit doctor"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <span className="rounded-full bg-[var(--muted-bg)] px-2.5 py-0.5 text-xs font-medium text-[var(--foreground)]">
                    ${doc.consultationFee}
                  </span>
                </div>
              </div>
              <h2 className="mt-4 font-semibold text-[var(--foreground)] group-hover:text-blue-600">
                Dr. {doc.firstName} {doc.lastName}
              </h2>
              <p className="text-sm text-[var(--foreground)] opacity-70">{doc.title} · {doc.qualification.split(",")[0]}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {doc.specializations.slice(0, 2).map((s) => (
                  <span
                    key={s}
                    className="rounded bg-[var(--muted-bg)] px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/40 dark:text-blue-200"
                  >
                    {s}
                  </span>
                ))}
              </div>
              <p className="mt-3 text-xs text-[var(--foreground)] opacity-70">
                {doc.schedule.length > 0 ? formatSchedule(doc.schedule) : "Schedule not set"}
              </p>
              <p className="mt-1 text-xs text-[var(--foreground)] opacity-70">{doc.phone}</p>
              </Link>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

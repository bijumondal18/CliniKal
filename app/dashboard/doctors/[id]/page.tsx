"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useClinicData } from "@/contexts/ClinicDataContext";
import { Dialog, dialogInputClass, dialogLabelClass } from "@/components/Dialog";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import type { Doctor } from "@/types/doctor";

const dayLabels: Record<string, string> = {
  mon: "Monday",
  tue: "Tuesday",
  wed: "Wednesday",
  thu: "Thursday",
  fri: "Friday",
  sat: "Saturday",
};

function formatTime(t: string) {
  const [h, m] = t.split(":");
  const hour = parseInt(h, 10);
  const am = hour < 12;
  const h12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${h12}:${m} ${am ? "AM" : "PM"}`;
}

const defaultForm = {
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
};

export default function DoctorDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { getDoctorById, updateDoctor, removeDoctor } = useClinicData();
  const doctor = getDoctorById(id);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [form, setForm] = useState(defaultForm);

  const openEdit = () => {
    if (!doctor) return;
    setForm({
      firstName: doctor.firstName,
      lastName: doctor.lastName,
      title: doctor.title,
      qualification: doctor.qualification,
      specializations: doctor.specializations.join(", "),
      consultationFee: String(doctor.consultationFee),
      phone: doctor.phone,
      email: doctor.email,
      bio: doctor.bio ?? "",
      profilePhoto: doctor.profilePhoto ?? "",
    });
    setEditOpen(true);
  };

  const handleSave = () => {
    if (!form.firstName.trim() || !form.lastName.trim() || !form.email.trim() || !form.phone.trim() || !doctor) return;
    const fee = parseInt(form.consultationFee, 10);
    updateDoctor(doctor.id, {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      title: form.title.trim() || "MD",
      specializations: form.specializations.split(",").map((s) => s.trim()).filter(Boolean),
      qualification: form.qualification.trim() || "—",
      consultationFee: Number.isFinite(fee) ? fee : 0,
      phone: form.phone.trim(),
      email: form.email.trim(),
      schedule: doctor.schedule,
      bio: form.bio.trim() || undefined,
      profilePhoto: form.profilePhoto.trim() || undefined,
    });
    setEditOpen(false);
  };

  const handleDelete = () => {
    removeDoctor(id);
    router.push("/dashboard/doctors");
  };

  const doctorFormValid =
    form.firstName.trim() !== "" &&
    form.lastName.trim() !== "" &&
    form.email.trim() !== "" &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()) &&
    form.phone.trim() !== "";

  if (!doctor) {
    return (
      <div className="p-8">
        <p className="text-[var(--foreground)] opacity-80">Doctor not found.</p>
        <Link href="/dashboard/doctors" className="mt-4 inline-block text-blue-600 hover:text-blue-700">
          ← Back to doctors
        </Link>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <Link
          href="/dashboard/doctors"
          className="text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          ← Back to doctors
        </Link>
      </div>

      <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card)] shadow-soft">
        <div className="border-b border-[var(--card-border)] p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              {doctor.profilePhoto ? (
                <img src={doctor.profilePhoto} alt="" className="h-16 w-16 shrink-0 rounded-full object-cover" />
              ) : (
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-blue-100 text-2xl font-semibold text-blue-600">
                  {doctor.firstName[0]}
                  {doctor.lastName[0]}
                </div>
              )}
              <div>
                <h1 className="text-2xl font-bold text-[var(--foreground)]">
                  Dr. {doctor.firstName} {doctor.lastName}
                </h1>
                <p className="text-[var(--foreground)] opacity-70">{doctor.title} · {doctor.qualification}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 ml-auto">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={openEdit}
                  className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] px-4 py-2.5 text-sm font-medium text-[var(--foreground)] shadow-soft hover:bg-[var(--sidebar-hover)] focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteConfirmOpen(true)}
                  className="rounded-xl border border-red-200 bg-red-600 px-4 py-2.5 text-sm font-medium text-white shadow-soft hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                >
                  Delete
                </button>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-blue-600">
                  ${doctor.consultationFee}
                </p>
                <p className="text-sm text-[var(--foreground)] opacity-70">Consultation fee</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 p-6 sm:grid-cols-2">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--foreground)] opacity-70">
              Specializations
            </h3>
            <ul className="mt-2 flex flex-wrap gap-2">
              {doctor.specializations.length === 0 ? (
                <p className="text-[var(--foreground)] opacity-70">None specified</p>
              ) : (
                doctor.specializations.map((s) => (
                  <li
                    key={s}
                    className="rounded-xl bg-[var(--muted-bg)] px-3 py-1.5 text-sm font-medium text-blue-700 dark:bg-blue-900/40 dark:text-blue-200"
                  >
                    {s}
                  </li>
                ))
              )}
            </ul>
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--foreground)] opacity-70">
              Contact
            </h3>
            <p className="mt-2 text-[var(--foreground)]">{doctor.phone}</p>
            <p className="text-[var(--foreground)] opacity-80">{doctor.email}</p>
          </div>
        </div>

        {doctor.schedule.length > 0 && (
          <div className="border-t border-[var(--card-border)] p-6">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--foreground)] opacity-70">
              Schedule & timing
            </h3>
            <ul className="mt-4 space-y-3">
              {doctor.schedule.map((slot) => (
                <li
                  key={`${slot.day}-${slot.startTime}`}
                  className="flex items-center justify-between rounded-xl border border-[var(--card-border)] bg-[var(--muted-bg)] px-4 py-3"
                >
                  <span className="font-medium text-[var(--foreground)]">
                    {dayLabels[slot.day] ?? slot.day}
                  </span>
                  <span className="text-[var(--foreground)] opacity-80">
                    {formatTime(slot.startTime)} – {formatTime(slot.endTime)}
                    {slot.slotMinutes && (
                      <span className="ml-2 opacity-70">
                        ({slot.slotMinutes} min slots)
                      </span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {doctor.bio && (
          <div className="border-t border-[var(--card-border)] p-6">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--foreground)] opacity-70">
              Bio
            </h3>
            <p className="mt-2 text-[var(--foreground)] opacity-90">{doctor.bio}</p>
          </div>
        )}
      </div>

      <Dialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title="Edit doctor"
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

      <ConfirmDialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        title="Delete doctor"
        message={
          <>
            Are you sure you want to delete <strong>Dr. {doctor.firstName} {doctor.lastName}</strong>? This action cannot be undone.
          </>
        }
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={handleDelete}
        variant="danger"
      />
    </div>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useClinicData } from "@/contexts/ClinicDataContext";
import { Dialog, dialogInputClass, dialogLabelClass, dialogDateTimeInputClass } from "@/components/Dialog";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { PlusIcon } from "@/components/icons/PlusIcon";

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatTime(t: string) {
  const [h, m] = t.split(":");
  const hour = parseInt(h, 10);
  const am = hour < 12;
  const h12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${h12}:${m} ${am ? "AM" : "PM"}`;
}

const statusColors: Record<string, string> = {
  scheduled: "bg-slate-100 text-slate-700",
  confirmed: "bg-blue-100 text-blue-700",
  completed: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-red-100 text-red-700",
};

const BLOOD_OPTIONS = ["", "A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];

function sanitizePhone10(raw: string) {
  return raw.replace(/\D/g, "").slice(0, 10);
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_10_REGEX = /^\d{10}$/;

export default function PatientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { getPatientById, updatePatient, removePatient, appointments: appointmentsList } = useClinicData();
  const patient = getPatientById(id);
  const patientAppointments = appointmentsList.filter((a) => a.patientId === id);

  const [editOpen, setEditOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    gender: "male" as "male" | "female" | "other",
    email: "",
    phone: "",
    dateOfBirth: "",
    bloodType: "",
    address: "",
    notes: "",
  });

  const openEdit = () => {
    if (!patient) return;
    setForm({
      firstName: patient.firstName,
      lastName: patient.lastName,
      gender: patient.gender,
      email: patient.email,
      phone: sanitizePhone10(patient.phone),
      dateOfBirth: patient.dateOfBirth,
      bloodType: patient.bloodType ?? "",
      address: patient.address ?? "",
      notes: patient.notes ?? "",
    });
    setEditOpen(true);
  };

  const handleSave = async () => {
    if (!patient || !form.firstName.trim() || !form.lastName.trim() || !form.email.trim() || !form.phone.trim() || !form.dateOfBirth.trim()) return;
    if (!PHONE_10_REGEX.test(form.phone.trim())) return;
    const existing = patient;
    const { id: _x, ...rest } = existing;
    void _x;
    await updatePatient(patient.id, {
      ...rest,
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      gender: form.gender,
      email: form.email.trim(),
      phone: form.phone.trim(),
      dateOfBirth: form.dateOfBirth,
      bloodType: form.bloodType || undefined,
      address: form.address.trim() || undefined,
      notes: form.notes.trim() || undefined,
    });
    setEditOpen(false);
  };

  const handleDelete = async () => {
    await removePatient(id);
    router.push("/dashboard/patients");
  };

  const patientFormValid =
    form.firstName.trim() !== "" &&
    form.lastName.trim() !== "" &&
    form.email.trim() !== "" &&
    EMAIL_REGEX.test(form.email.trim()) &&
    PHONE_10_REGEX.test(form.phone.trim()) &&
    form.dateOfBirth.trim() !== "";

  if (!patient) {
    return (
      <div className="p-4 sm:p-8">
        <p className="text-[var(--foreground)] opacity-80">Patient not found.</p>
        <Link href="/dashboard/patients" className="mt-4 inline-block text-blue-600 hover:text-blue-700">
          ← Back to patients
        </Link>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8">
      <div className="mb-6">
        <Link
          href="/dashboard/patients"
          className="text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          ← Back to patients
        </Link>
      </div>

      <div className="mb-8 rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-6 shadow-soft">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[var(--foreground)]">
              {patient.firstName} {patient.lastName}
            </h1>
            <p className="mt-1 text-[var(--foreground)] opacity-70">
              Patient ID: {patient.id}
            </p>
          </div>
          <div className="flex gap-2">
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
            <button
              type="button"
              onClick={() => router.push("/dashboard/appointments")}
              className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-soft hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <span className="flex items-center gap-2">
                <PlusIcon className="h-4 w-4" />
                New appointment
              </span>
            </button>
          </div>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-[var(--foreground)] opacity-70">Email</p>
            <p className="mt-1 text-[var(--foreground)]">{patient.email}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-[var(--foreground)] opacity-70">Phone</p>
            <p className="mt-1 text-[var(--foreground)]">{patient.phone}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-[var(--foreground)] opacity-70">Date of birth</p>
            <p className="mt-1 text-[var(--foreground)]">{formatDate(patient.dateOfBirth)}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-[var(--foreground)] opacity-70">Gender</p>
            <p className="mt-1 capitalize text-[var(--foreground)]">{patient.gender}</p>
          </div>
          {patient.bloodType && (
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-[var(--foreground)] opacity-70">Blood type</p>
              <p className="mt-1 text-[var(--foreground)]">{patient.bloodType}</p>
            </div>
          )}
          {patient.address && (
            <div className="sm:col-span-2">
              <p className="text-xs font-medium uppercase tracking-wider text-[var(--foreground)] opacity-70">Address</p>
              <p className="mt-1 text-[var(--foreground)]">{patient.address}</p>
            </div>
          )}
          {patient.lastVisit && (
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-[var(--foreground)] opacity-70">Last visit</p>
              <p className="mt-1 text-[var(--foreground)]">{formatDate(patient.lastVisit)}</p>
            </div>
          )}
        </div>

        {patient.notes && (
          <div className="mt-6 border-t border-[var(--card-border)] pt-6">
            <p className="text-xs font-medium uppercase tracking-wider text-[var(--foreground)] opacity-70">Notes</p>
            <p className="mt-1 text-[var(--foreground)] opacity-90">{patient.notes}</p>
          </div>
        )}
      </div>

      <section>
        <h2 className="mb-4 text-lg font-semibold text-[var(--foreground)]">Appointment history</h2>
        {patientAppointments.length === 0 ? (
          <p className="rounded-2xl border border-[var(--card-border)] bg-[var(--card)] py-8 text-center text-[var(--foreground)] opacity-70">
            No appointments yet
          </p>
        ) : (
          <ul className="rounded-2xl border border-[var(--card-border)] bg-[var(--card)] shadow-soft">
            {patientAppointments.map((apt) => (
              <li
                key={apt.id}
                className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--card-border)] px-5 py-4 last:border-0"
              >
                <div>
                  <p className="font-medium text-[var(--foreground)]">
                    {formatDate(apt.date)} at {formatTime(apt.time)}
                  </p>
                  <p className="text-sm text-[var(--foreground)] opacity-70">
                    {apt.type.replace("-", " ")} · {apt.doctor}
                  </p>
                </div>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${statusColors[apt.status] ?? "bg-slate-100 text-slate-600"}`}
                >
                  {apt.status.replace("-", " ")}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <Dialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title="Edit patient"
        onSave={handleSave}
        saveLabel="Save"
        cancelLabel="Cancel"
        saveDisabled={!patientFormValid}
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
          <div>
            <label className={dialogLabelClass}>Gender</label>
            <select
              value={form.gender}
              onChange={(e) => setForm((f) => ({ ...f, gender: e.target.value as "male" | "female" | "other" }))}
              className={`${dialogInputClass} input-select`}
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className={dialogLabelClass}>Email *</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              className={dialogInputClass}
              placeholder="john@example.com"
            />
          </div>
          <div>
            <label className={dialogLabelClass}>Phone number *</label>
            <input
              type="tel"
              value={form.phone}
              inputMode="numeric"
              pattern="\d{10}"
              maxLength={10}
              onChange={(e) => setForm((f) => ({ ...f, phone: sanitizePhone10(e.target.value) }))}
              className={dialogInputClass}
              placeholder="10-digit mobile number"
            />
          </div>
          <div>
            <label className={dialogLabelClass}>Date of birth *</label>
            <input
              type="date"
              value={form.dateOfBirth}
              onChange={(e) => setForm((f) => ({ ...f, dateOfBirth: e.target.value }))}
              className={dialogDateTimeInputClass}
            />
          </div>
          <div>
            <label className={dialogLabelClass}>Blood group</label>
            <select
              value={form.bloodType}
              onChange={(e) => setForm((f) => ({ ...f, bloodType: e.target.value }))}
              className={`${dialogInputClass} input-select`}
            >
              {BLOOD_OPTIONS.map((b) => (
                <option key={b || "none"} value={b}>{b || "— Select —"}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={dialogLabelClass}>Address</label>
            <textarea
              value={form.address}
              onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
              className={`${dialogInputClass} min-h-[80px] resize-y`}
              placeholder="Street, city, state, ZIP"
              rows={3}
            />
          </div>
          <div>
            <label className={dialogLabelClass}>Notes</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              className={`${dialogInputClass} min-h-[60px] resize-y`}
              placeholder="Optional notes"
              rows={2}
            />
          </div>
        </div>
      </Dialog>

      <ConfirmDialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        title="Delete patient"
        message={
          <>
            Are you sure you want to delete <strong>{patient.firstName} {patient.lastName}</strong>? This action cannot be undone.
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

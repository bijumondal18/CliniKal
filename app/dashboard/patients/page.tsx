"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useClinicData } from "@/contexts/ClinicDataContext";
import { getNextClinicId, CLINIC_ID_PREFIX } from "@/lib/clinic-ids";
import { Dialog, dialogInputClass, dialogLabelClass, dialogDateTimeInputClass } from "@/components/Dialog";
import { PlusIcon } from "@/components/icons/PlusIcon";
import type { Patient } from "@/types/patient";

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

const BLOOD_OPTIONS = ["", "A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];

function sanitizePhone10(raw: string) {
  return raw.replace(/\D/g, "").slice(0, 10);
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_10_REGEX = /^\d{10}$/;

export default function PatientsPage() {
  const { patients: patientList, addPatient, updatePatient } = useClinicData();
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
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

  const filtered = useMemo(() => {
    return patientList.filter((p) => {
      const fullName = `${p.firstName} ${p.lastName}`;
      const searchable = [fullName, p.email, p.phone, p.gender, p.bloodType ?? "", p.address ?? ""].join(" ");
      return matchQuery(searchable, search);
    });
  }, [patientList, search]);

  const patientFormValid =
    form.firstName.trim() !== "" &&
    form.lastName.trim() !== "" &&
    form.email.trim() !== "" &&
    EMAIL_REGEX.test(form.email.trim()) &&
    PHONE_10_REGEX.test(form.phone.trim()) &&
    form.dateOfBirth.trim() !== "";

  const resetForm = () => {
    setEditingId(null);
    setForm({
      firstName: "",
      lastName: "",
      gender: "male",
      email: "",
      phone: "",
      dateOfBirth: "",
      bloodType: "",
      address: "",
      notes: "",
    });
  };

  const openEdit = (p: Patient) => {
    setForm({
      firstName: p.firstName,
      lastName: p.lastName,
      gender: p.gender,
      email: p.email,
      phone: sanitizePhone10(p.phone),
      dateOfBirth: p.dateOfBirth,
      bloodType: p.bloodType ?? "",
      address: p.address ?? "",
      notes: p.notes ?? "",
    });
    setEditingId(p.id);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.firstName.trim() || !form.lastName.trim() || !form.email.trim() || !form.phone.trim() || !form.dateOfBirth.trim()) {
      return;
    }
    if (!PHONE_10_REGEX.test(form.phone.trim())) {
      setFormError("Mobile number must be exactly 10 digits.");
      return;
    }
    setFormError(null);
    const payload: Omit<Patient, "id"> = {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      gender: form.gender,
      email: form.email.trim(),
      phone: form.phone.trim(),
      dateOfBirth: form.dateOfBirth,
      bloodType: form.bloodType || undefined,
      address: form.address.trim() || undefined,
      notes: form.notes.trim() || undefined,
    };
    try {
      if (editingId) {
        const existing = patientList.find((x) => x.id === editingId);
        if (existing) {
          const { id: _x, ...rest } = existing;
          void _x;
          await updatePatient(editingId, { ...rest, ...payload });
        }
      } else {
        const id = getNextClinicId(CLINIC_ID_PREFIX.PATIENT, patientList.map((p) => p.id));
        await addPatient({ id, ...payload });
      }
      setFormError(null);
      setDialogOpen(false);
      resetForm();
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to save patient. Please try again.";
      if (process.env.NODE_ENV === "development") {
        console.error("[Patients] Firestore save error:", e);
      }
      setFormError(message);
    }
  };

  return (
    <div className="py-4 sm:p-8">
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Patients</h1>
          <p className="mt-1 text-[var(--foreground)] opacity-70">
            Manage patient records
          </p>
        </div>
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <input
            type="search"
            placeholder="Search patients..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-[var(--card-border)] bg-[var(--muted-bg)] px-4 py-2.5 text-sm text-[var(--foreground)] shadow-soft placeholder:opacity-60 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 sm:w-auto"
          />
          <button
            type="button"
            onClick={() => { resetForm(); setDialogOpen(true); }}
            className="w-fit self-start rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-soft hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:w-auto sm:self-auto"
          >
            <span className="flex items-center gap-2">
              <PlusIcon className="h-4 w-4" />
              Add patient
            </span>
          </button>
        </div>
      </header>

      <Dialog
        open={dialogOpen}
        onClose={() => { setDialogOpen(false); resetForm(); setFormError(null); }}
        title={editingId ? "Edit patient" : "Add new patient"}
        onSave={handleSave}
        saveLabel="Save"
        cancelLabel="Cancel"
        saveDisabled={!patientFormValid}
      >
        <div className="space-y-4">
          {formError && (
            <p className="rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-300">
              {formError}
            </p>
          )}
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

      <div className="overflow-hidden rounded-2xl border border-[var(--card-border)] bg-[var(--card)] shadow-soft">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--card-border)] bg-[var(--muted-bg)]">
                <th className="px-5 py-3 font-semibold text-[var(--foreground)]">Patient</th>
                <th className="px-5 py-3 font-semibold text-[var(--foreground)]">Contact</th>
                <th className="px-5 py-3 font-semibold text-[var(--foreground)]">DOB</th>
                <th className="px-5 py-3 font-semibold text-[var(--foreground)]">Last visit</th>
                <th className="px-5 py-3 font-semibold text-[var(--foreground)]">Blood type</th>
                <th className="px-5 py-3 font-semibold text-[var(--foreground)]"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--card-border)]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-[var(--foreground)] opacity-70">
                    No patients match your search.
                  </td>
                </tr>
              ) : (
                filtered.map((p) => (
                  <tr
                    key={p.id}
                    className="transition-colors hover:bg-[var(--sidebar-hover)]"
                  >
                    <td className="px-5 py-4">
                      <Link
                        href={`/dashboard/patients/${p.id}`}
                        className="font-medium text-[var(--foreground)] hover:text-blue-600"
                      >
                        {p.firstName} {p.lastName}
                      </Link>
                      <p className="text-xs capitalize text-[var(--foreground)] opacity-70">{p.gender}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-[var(--foreground)]">{p.email}</p>
                      <p className="text-[var(--foreground)] opacity-70">{p.phone}</p>
                    </td>
                    <td className="px-5 py-4 text-[var(--foreground)] opacity-80">
                      {formatDate(p.dateOfBirth)}
                    </td>
                    <td className="px-5 py-4 text-[var(--foreground)] opacity-80">
                      {p.lastVisit ? formatDate(p.lastVisit) : "—"}
                    </td>
                    <td className="px-5 py-4">
                      {p.bloodType ? (
                        <span className="rounded bg-[var(--muted-bg)] px-2 py-0.5 text-xs font-medium text-[var(--foreground)]">
                          {p.bloodType}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={(e) => { e.preventDefault(); openEdit(p); }}
                          className="rounded p-1.5 text-[var(--foreground)] opacity-70 hover:bg-[var(--muted-bg)] hover:opacity-100"
                          title="Edit patient"
                          aria-label="Edit patient"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <Link
                          href={`/dashboard/patients/${p.id}`}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          View →
                        </Link>
                      </div>
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

"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useClinicData } from "@/contexts/ClinicDataContext";
import { Dialog, dialogInputClass, dialogLabelClass } from "@/components/Dialog";
import { ConfirmDialog } from "@/components/ConfirmDialog";

const ROLE_OPTIONS = ["Receptionist", "Nurse", "Medical Assistant", "Administrator", "Other"];

function sanitizePhone10(raw: string) {
  return raw.replace(/\D/g, "").slice(0, 10);
}

const PHONE_10_REGEX = /^\d{10}$/;

export default function StaffDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { getStaffById, updateStaff, removeStaff } = useClinicData();
  const staff = getStaffById(id);

  const [editOpen, setEditOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    role: "Receptionist",
    email: "",
    phone: "",
    department: "",
    notes: "",
  });

  const openEdit = () => {
    if (!staff) return;
    setForm({
      firstName: staff.firstName,
      lastName: staff.lastName,
      role: staff.role,
      email: staff.email,
      phone: sanitizePhone10(staff.phone),
      department: staff.department ?? "",
      notes: staff.notes ?? "",
    });
    setEditOpen(true);
  };

  const handleSave = async () => {
    if (!staff || !form.firstName.trim() || !form.lastName.trim() || !form.email.trim() || !form.phone.trim()) return;
    if (!PHONE_10_REGEX.test(form.phone.trim())) return;
    await updateStaff(staff.id, {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      role: form.role.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      department: form.department.trim() || undefined,
      notes: form.notes.trim() || undefined,
    });
    setEditOpen(false);
  };

  const handleDelete = async () => {
    await removeStaff(id);
    router.push("/dashboard/staff");
  };

  const staffFormValid =
    form.firstName.trim() !== "" &&
    form.lastName.trim() !== "" &&
    form.role.trim() !== "" &&
    form.email.trim() !== "" &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()) &&
    PHONE_10_REGEX.test(form.phone.trim());

  if (!staff) {
    return (
      <div className="p-8">
        <p className="text-[var(--foreground)] opacity-80">Staff member not found.</p>
        <Link href="/dashboard/staff" className="mt-4 inline-block text-blue-600 hover:text-blue-700">
          ← Back to staff
        </Link>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <Link
          href="/dashboard/staff"
          className="text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          ← Back to staff
        </Link>
      </div>

      <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card)] shadow-soft">
        <div className="border-b border-[var(--card-border)] p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-[var(--foreground)]">
                {staff.firstName} {staff.lastName}
              </h1>
              <p className="mt-1 text-[var(--foreground)] opacity-70">
                {staff.role}
                {staff.department ? ` · ${staff.department}` : ""}
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
            </div>
          </div>
        </div>

        <div className="grid gap-6 p-6 sm:grid-cols-2">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--foreground)] opacity-70">
              Email
            </h3>
            <p className="mt-2 text-[var(--foreground)]">{staff.email}</p>
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--foreground)] opacity-70">
              Phone
            </h3>
            <p className="mt-2 text-[var(--foreground)]">{staff.phone}</p>
          </div>
          {staff.department && (
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--foreground)] opacity-70">
                Department
              </h3>
              <p className="mt-2 text-[var(--foreground)]">{staff.department}</p>
            </div>
          )}
        </div>

        {staff.notes && (
          <div className="border-t border-[var(--card-border)] p-6">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--foreground)] opacity-70">
              Notes
            </h3>
            <p className="mt-2 text-[var(--foreground)] opacity-90">{staff.notes}</p>
          </div>
        )}
      </div>

      <Dialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title="Edit staff member"
        onSave={handleSave}
        saveLabel="Save"
        cancelLabel="Cancel"
        saveDisabled={!staffFormValid}
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
                placeholder="Jane"
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
            <label className={dialogLabelClass}>Role *</label>
            <select
              value={form.role}
              onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
              className={`${dialogInputClass} input-select`}
            >
              {ROLE_OPTIONS.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={dialogLabelClass}>Email *</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              className={dialogInputClass}
              placeholder="jane@clinic.com"
            />
          </div>
          <div>
            <label className={dialogLabelClass}>Phone *</label>
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
            <label className={dialogLabelClass}>Department</label>
            <input
              type="text"
              value={form.department}
              onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))}
              className={dialogInputClass}
              placeholder="Front desk"
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
        title="Delete staff"
        message={
          <>
            Are you sure you want to delete <strong>{staff.firstName} {staff.lastName}</strong>? This action cannot be undone.
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

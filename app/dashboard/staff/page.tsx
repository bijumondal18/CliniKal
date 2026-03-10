"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useClinicData } from "@/contexts/ClinicDataContext";
import { getNextClinicId, CLINIC_ID_PREFIX } from "@/lib/clinic-ids";
import { Dialog, dialogInputClass, dialogLabelClass } from "@/components/Dialog";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { PlusIcon } from "@/components/icons/PlusIcon";
import type { Staff } from "@/types/staff";

function matchQuery(text: string, q: string): boolean {
  if (!q.trim()) return true;
  const lower = text.toLowerCase();
  const terms = q.toLowerCase().trim().split(/\s+/);
  return terms.every((t) => lower.includes(t));
}

const ROLE_OPTIONS = ["Receptionist", "Nurse", "Medical Assistant", "Administrator", "Other"];

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function StaffPage() {
  const { staff: staffList, addStaff, updateStaff, removeStaff } = useClinicData();
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Staff | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    role: "Receptionist",
    email: "",
    phone: "",
    department: "",
    notes: "",
  });

  const filtered = useMemo(() => {
    return staffList.filter((s) => {
      const searchable = [
        s.firstName,
        s.lastName,
        s.role,
        s.email,
        s.phone,
        s.department ?? "",
      ].join(" ");
      return matchQuery(searchable, search);
    });
  }, [staffList, search]);

  const staffFormValid =
    form.firstName.trim() !== "" &&
    form.lastName.trim() !== "" &&
    form.role.trim() !== "" &&
    form.email.trim() !== "" &&
    EMAIL_REGEX.test(form.email.trim()) &&
    form.phone.trim() !== "";

  const resetForm = () => {
    setEditingId(null);
    setForm({
      firstName: "",
      lastName: "",
      role: "Receptionist",
      email: "",
      phone: "",
      department: "",
      notes: "",
    });
  };

  const openEdit = (s: Staff) => {
    setForm({
      firstName: s.firstName,
      lastName: s.lastName,
      role: s.role,
      email: s.email,
      phone: s.phone,
      department: s.department ?? "",
      notes: s.notes ?? "",
    });
    setEditingId(s.id);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.firstName.trim() || !form.lastName.trim() || !form.email.trim() || !form.phone.trim()) return;
    const payload: Omit<Staff, "id"> = {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      role: form.role.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      department: form.department.trim() || undefined,
      notes: form.notes.trim() || undefined,
    };
    setFormError(null);
    try {
      if (editingId) {
        await updateStaff(editingId, payload);
      } else {
        const id = getNextClinicId(CLINIC_ID_PREFIX.STAFF, staffList.map((s) => s.id));
        await addStaff({ id, ...payload });
      }
      setFormError(null);
      setDialogOpen(false);
      resetForm();
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to save staff. Please try again.";
      if (process.env.NODE_ENV === "development") console.error("[Staff] Firestore save error:", e);
      setFormError(message);
    }
  };

  const handleDelete = async () => {
    if (deleteTarget) {
      await removeStaff(deleteTarget.id);
      setDeleteTarget(null);
    }
  };

  return (
    <div className="p-8">
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Staffs</h1>
          <p className="mt-1 text-[var(--foreground)] opacity-70">
            Manage staffs
          </p>
        </div>
        <div className="flex gap-3">
          <input
            type="search"
            placeholder="Search staffs..."
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
              Add staff member
            </span>
          </button>
        </div>
      </header>

      <Dialog
        open={dialogOpen}
        onClose={() => { setDialogOpen(false); resetForm(); setFormError(null); }}
        title={editingId ? "Edit staff member" : "Add new staff member"}
        onSave={handleSave}
        saveLabel="Save"
        cancelLabel="Cancel"
        saveDisabled={!staffFormValid}
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
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              className={dialogInputClass}
              placeholder="+1 (555) 000-0000"
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
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete staff"
        message={
          deleteTarget ? (
            <>
              Are you sure you want to delete <strong>{deleteTarget.firstName} {deleteTarget.lastName}</strong>? This action cannot be undone.
            </>
          ) : (
            ""
          )
        }
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={handleDelete}
        variant="danger"
      />

      <div className="overflow-hidden rounded-2xl border border-[var(--card-border)] bg-[var(--card)] shadow-soft">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--card-border)] bg-[var(--muted-bg)]">
                <th className="px-5 py-3 font-semibold text-[var(--foreground)]">Name</th>
                <th className="px-5 py-3 font-semibold text-[var(--foreground)]">Role</th>
                <th className="px-5 py-3 font-semibold text-[var(--foreground)]">Contact</th>
                <th className="px-5 py-3 font-semibold text-[var(--foreground)]">Department</th>
                <th className="px-5 py-3 font-semibold text-[var(--foreground)]"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--card-border)]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-[var(--foreground)] opacity-70">
                    No staffs match your search. Add staff member to get started.
                  </td>
                </tr>
              ) : (
                filtered.map((s) => (
                  <tr key={s.id} className="transition-colors hover:bg-[var(--sidebar-hover)]">
                    <td className="px-5 py-4">
                      <Link
                        href={`/dashboard/staff/${s.id}`}
                        className="font-medium text-[var(--foreground)] hover:text-blue-600"
                      >
                        {s.firstName} {s.lastName}
                      </Link>
                    </td>
                    <td className="px-5 py-4 text-[var(--foreground)] opacity-90">{s.role}</td>
                    <td className="px-5 py-4">
                      <p className="text-[var(--foreground)]">{s.email}</p>
                      <p className="text-[var(--foreground)] opacity-70">{s.phone}</p>
                    </td>
                    <td className="px-5 py-4 text-[var(--foreground)] opacity-80">
                      {s.department ?? "—"}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => openEdit(s)}
                          className="rounded p-1.5 text-[var(--foreground)] opacity-60 hover:bg-[var(--muted-bg)] hover:opacity-100"
                          title="Edit staff member"
                          aria-label="Edit staff member"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(s)}
                          className="rounded p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                          title="Delete staff"
                          aria-label="Delete staff"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                        <Link
                          href={`/dashboard/staff/${s.id}`}
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

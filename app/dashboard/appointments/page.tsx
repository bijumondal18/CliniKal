"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useClinicData } from "@/contexts/ClinicDataContext";
import { getNextClinicId, CLINIC_ID_PREFIX } from "@/lib/clinic-ids";
import { Dialog, dialogInputClass, dialogLabelClass, dialogDateTimeInputClass } from "@/components/Dialog";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { PlusIcon } from "@/components/icons/PlusIcon";
import type { Appointment } from "@/types/appointment";

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(t: string) {
  const [h, m] = t.split(":");
  const hour = parseInt(h, 10);
  const am = hour < 12;
  const h12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${h12}:${m} ${am ? "AM" : "PM"}`;
}

function formatToken(tokenNumber?: number) {
  if (typeof tokenNumber !== "number" || !Number.isFinite(tokenNumber) || tokenNumber <= 0) return "—";
  return `#${String(Math.trunc(tokenNumber)).padStart(2, "0")}`;
}

const statusColors: Record<string, string> = {
  scheduled: "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200",
  confirmed: "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300",
  "in-progress": "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300",
  completed: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300",
  cancelled: "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300",
  "no-show": "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300",
};

const typeLabels: Record<string, string> = {
  checkup: "Checkup",
  "follow-up": "Follow-up",
  consultation: "Consultation",
  procedure: "Procedure",
  other: "Other",
};

function isToday(dateStr: string): boolean {
  const d = new Date(dateStr);
  const today = new Date();
  return d.toDateString() === today.toDateString();
}

function isThisWeek(dateStr: string): boolean {
  const d = new Date(dateStr);
  const today = new Date();
  const start = new Date(today);
  start.setDate(today.getDate() - today.getDay());
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return d >= start && d <= end;
}

function filterByDateRange(list: Appointment[], range: string): Appointment[] {
  if (range === "today") return list.filter((a) => isToday(a.date));
  if (range === "week") return list.filter((a) => isThisWeek(a.date));
  return list;
}

const APPOINTMENT_TYPES = ["checkup", "follow-up", "consultation", "procedure", "other"] as const;

export default function AppointmentsPage() {
  const { appointments: appointmentList, addAppointment, updateAppointment, removeAppointment, patients, doctors } = useClinicData();
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Appointment | null>(null);
  const [rowSaving, setRowSaving] = useState<Record<string, boolean>>({});
  const [rowError, setRowError] = useState<Record<string, string>>({});
  const [form, setForm] = useState({
    patientId: "",
    date: "",
    time: "",
    type: "checkup" as Appointment["type"],
    doctorId: "",
    notes: "",
    status: "scheduled" as Appointment["status"],
    tokenNumber: undefined as number | undefined,
  });

  const filtered = useMemo(() => {
    let list = [...appointmentList].sort((a, b) => {
      const byDate = `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`);
      if (byDate !== 0) return byDate;
      return (a.tokenNumber ?? 0) - (b.tokenNumber ?? 0);
    });
    if (statusFilter) list = list.filter((a) => a.status === statusFilter);
    list = filterByDateRange(list, dateFilter);
    return list;
  }, [appointmentList, statusFilter, dateFilter]);

  const resetForm = () => {
    setEditingId(null);
    setForm({
      patientId: "",
      date: "",
      time: "",
      type: "checkup",
      doctorId: "",
      notes: "",
      status: "scheduled",
      tokenNumber: undefined,
    });
  };

  const getNextTokenForDate = (date: string) => {
    const maxForDay = appointmentList
      .filter((a) => a.date === date)
      .reduce((max, a) => Math.max(max, a.tokenNumber ?? 0), 0);
    return maxForDay + 1;
  };

  const appointmentFormValid =
    form.patientId.trim() !== "" &&
    form.doctorId.trim() !== "" &&
    form.date.trim() !== "" &&
    form.time.trim() !== "";

  const openEdit = (apt: Appointment) => {
    let doctorId = apt.doctorId;
    if (!doctorId && apt.doctor) {
      const match = doctors.find(
        (d) => apt.doctor === `Dr. ${d.firstName} ${d.lastName}`
      );
      doctorId = match?.id ?? "";
    }
    setForm({
      patientId: apt.patientId,
      date: apt.date,
      time: apt.time,
      type: apt.type,
      doctorId: doctorId ?? "",
      notes: apt.notes ?? "",
      status: apt.status,
      tokenNumber: apt.tokenNumber,
    });
    setEditingId(apt.id);
    setDialogOpen(true);
  };

  const handleInlineStatusChange = async (apt: Appointment, nextStatus: Appointment["status"]) => {
    setRowError((prev) => {
      const { [apt.id]: _omit, ...rest } = prev;
      void _omit;
      return rest;
    });
    setRowSaving((prev) => ({ ...prev, [apt.id]: true }));
    try {
      const payload: Omit<Appointment, "id"> = {
        tokenNumber: apt.tokenNumber,
        patientId: apt.patientId,
        patientName: apt.patientName,
        date: apt.date,
        time: apt.time,
        type: apt.type,
        status: nextStatus,
        doctor: apt.doctor,
        doctorId: apt.doctorId,
        notes: apt.notes,
      };
      await updateAppointment(apt.id, payload);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to update status.";
      setRowError((prev) => ({ ...prev, [apt.id]: message }));
    } finally {
      setRowSaving((prev) => ({ ...prev, [apt.id]: false }));
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    await removeAppointment(deleteTarget.id);
    setDeleteTarget(null);
  };

  const handleSave = async () => {
    if (!form.patientId || !form.date || !form.time || !form.doctorId) return;
    const patient = patients.find((p) => p.id === form.patientId);
    const doctor = doctors.find((d) => d.id === form.doctorId);
    if (!patient || !doctor) return;
    const tokenNumber = editingId
      ? form.tokenNumber
      : getNextTokenForDate(form.date);
    const payload = {
      patientId: patient.id,
      patientName: `${patient.firstName} ${patient.lastName}`,
      date: form.date,
      time: form.time,
      type: form.type,
      status: form.status,
      doctor: `Dr. ${doctor.firstName} ${doctor.lastName}`,
      doctorId: doctor.id,
      notes: form.notes.trim() || undefined,
      tokenNumber,
    };
    setFormError(null);
    try {
      if (editingId) {
        await updateAppointment(editingId, payload);
      } else {
        const id = getNextClinicId(CLINIC_ID_PREFIX.APPOINTMENT, appointmentList.map((a) => a.id));
        await addAppointment({ id, ...payload });
      }
      setFormError(null);
      setDialogOpen(false);
      resetForm();
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to save appointment. Please try again.";
      if (process.env.NODE_ENV === "development") console.error("[Appointments] Firestore save error:", e);
      setFormError(message);
    }
  };

  return (
    <div className="py-4 sm:p-8">
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Appointments</h1>
          <p className="mt-1 text-[var(--foreground)] opacity-70">
            View and manage appointments
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-[var(--card-border)] bg-[var(--muted-bg)] px-4 py-2.5 text-sm text-[var(--foreground)] shadow-soft focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 input-select"
          >
            <option value="">All statuses</option>
            <option value="scheduled">Scheduled</option>
            <option value="confirmed">Confirmed</option>
            <option value="in-progress">In progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="no-show">No show</option>
          </select>
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="rounded-xl border border-[var(--card-border)] bg-[var(--muted-bg)] px-4 py-2.5 text-sm text-[var(--foreground)] shadow-soft focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 input-select"
          >
            <option value="">All dates</option>
            <option value="today">Today</option>
            <option value="week">This week</option>
          </select>
          <button
            type="button"
            onClick={() => { resetForm(); setDialogOpen(true); }}
            className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-soft hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <span className="flex items-center gap-2">
              <PlusIcon className="h-4 w-4" />
              New appointment
            </span>
          </button>
        </div>
      </header>

      <Dialog
        open={dialogOpen}
        onClose={() => { setDialogOpen(false); resetForm(); setFormError(null); }}
        title={editingId ? "Edit appointment" : "Add new appointment"}
        onSave={handleSave}
        saveLabel="Save"
        cancelLabel="Cancel"
        saveDisabled={!appointmentFormValid}
      >
        <div className="space-y-4">
          {formError && (
            <p className="rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-300">
              {formError}
            </p>
          )}
          <div>
            <label className={dialogLabelClass}>Patient *</label>
            <select
              value={form.patientId}
              onChange={(e) => setForm((f) => ({ ...f, patientId: e.target.value }))}
              className={`${dialogInputClass} input-select`}
            >
              <option value="">— Select patient —</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.firstName} {p.lastName}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={dialogLabelClass}>Doctor *</label>
            <select
              value={form.doctorId}
              onChange={(e) => setForm((f) => ({ ...f, doctorId: e.target.value }))}
              className={`${dialogInputClass} input-select`}
            >
              <option value="">— Select doctor —</option>
              {doctors.map((d) => (
                <option key={d.id} value={d.id}>
                  Dr. {d.firstName} {d.lastName}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={dialogLabelClass}>Date *</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                className={dialogDateTimeInputClass}
              />
            </div>
            <div>
              <label className={dialogLabelClass}>Time *</label>
              <input
                type="time"
                value={form.time}
                onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))}
                className={dialogDateTimeInputClass}
              />
            </div>
          </div>
          <div>
            <label className={dialogLabelClass}>Type</label>
            <select
              value={form.type}
              onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as typeof form.type }))}
              className={`${dialogInputClass} input-select`}
            >
              {APPOINTMENT_TYPES.map((t) => (
                <option key={t} value={t}>{typeLabels[t]}</option>
              ))}
            </select>
          </div>
          {editingId && (
            <div>
              <label className={dialogLabelClass}>Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as Appointment["status"] }))}
                className={`${dialogInputClass} input-select`}
              >
                <option value="scheduled">Scheduled</option>
                <option value="confirmed">Confirmed</option>
                <option value="in-progress">In progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="no-show">No show</option>
              </select>
            </div>
          )}
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
                <th className="px-5 py-3 font-semibold text-[var(--foreground)]">#</th>
                <th className="px-5 py-3 font-semibold text-[var(--foreground)]">Date & time</th>
                <th className="px-5 py-3 font-semibold text-[var(--foreground)]">Patient</th>
                <th className="px-5 py-3 font-semibold text-[var(--foreground)]">Type</th>
                <th className="px-5 py-3 font-semibold text-[var(--foreground)]">Doctor</th>
                <th className="px-5 py-3 font-semibold text-[var(--foreground)]">Status</th>
                <th className="px-5 py-3 font-semibold text-[var(--foreground)]"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--card-border)]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-[var(--foreground)] opacity-70">
                    No appointments match the selected filters.
                  </td>
                </tr>
              ) : (
                filtered.map((apt) => (
                  <tr
                    key={apt.id}
                    className="transition-colors hover:bg-[var(--sidebar-hover)]"
                  >
                    <td className="px-5 py-4">
                      <span className="inline-flex min-w-10 justify-center rounded-full bg-[var(--muted-bg)] px-2 py-0.5 text-xs font-semibold text-[var(--foreground)]">
                        {formatToken(apt.tokenNumber)}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-medium text-[var(--foreground)]">
                        {formatDate(apt.date)}
                      </p>
                      <p className="text-[var(--foreground)] opacity-70">{formatTime(apt.time)}</p>
                    </td>
                    <td className="px-5 py-4">
                      <Link
                        href={`/dashboard/patients/${apt.patientId}`}
                        className="font-medium text-[var(--foreground)] hover:text-blue-600"
                      >
                        {apt.patientName}
                      </Link>
                    </td>
                    <td className="px-5 py-4 text-[var(--foreground)] opacity-80">
                      {typeLabels[apt.type] ?? apt.type}
                    </td>
                    <td className="px-5 py-4 text-[var(--foreground)] opacity-80">
                      {apt.doctor ?? "—"}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <select
                          value={apt.status}
                          onChange={(e) => void handleInlineStatusChange(apt, e.target.value as Appointment["status"])}
                          disabled={rowSaving[apt.id]}
                          className="rounded-lg border border-[var(--card-border)] bg-[var(--muted-bg)] px-2.5 py-1.5 text-xs font-medium text-[var(--foreground)] shadow-soft focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 input-select disabled:cursor-not-allowed disabled:opacity-60"
                          aria-label={`Change status for ${apt.patientName}`}
                        >
                          <option value="scheduled">Scheduled</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="in-progress">In progress</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                          <option value="no-show">No show</option>
                        </select>
                        <span
                          className={`hidden sm:inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${statusColors[apt.status] ?? "bg-slate-100 text-slate-600"}`}
                          aria-hidden="true"
                        >
                          {apt.status.replace("-", " ")}
                        </span>
                      </div>
                      {rowError[apt.id] ? (
                        <p className="mt-1 text-xs text-red-600 dark:text-red-400">{rowError[apt.id]}</p>
                      ) : null}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => openEdit(apt)}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(apt)}
                          className="text-red-600 hover:text-red-700"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete appointment"
        message={deleteTarget ? <>Delete appointment for <strong>{deleteTarget.patientName}</strong>?</> : ""}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={handleDeleteConfirm}
        variant="danger"
      />
    </div>
  );
}

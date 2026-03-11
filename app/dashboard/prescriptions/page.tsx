"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useClinicData } from "@/contexts/ClinicDataContext";
import { Dialog, dialogInputClass, dialogLabelClass } from "@/components/Dialog";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { PlusIcon } from "@/components/icons/PlusIcon";
import { getNextClinicId, CLINIC_ID_PREFIX } from "@/lib/clinic-ids";
import type { Prescription, PrescriptionMedication } from "@/types/prescription";

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

const emptyMed: PrescriptionMedication = {
  name: "",
  dosage: "",
  frequency: "",
  duration: "",
  instructions: "",
};

export default function PrescriptionsPage() {
  const { prescriptions: list, addPrescription, updatePrescription, removePrescription, patients, doctors } = useClinicData();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Prescription | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [patientFilter, setPatientFilter] = useState("");
  const [search, setSearch] = useState("");
  const [patientId, setPatientId] = useState("");
  const [doctorId, setDoctorId] = useState("");
  const [date, setDate] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [medications, setMedications] = useState<PrescriptionMedication[]>([{ ...emptyMed }]);
  const [notes, setNotes] = useState("");
  const [followUp, setFollowUp] = useState("");

  const filtered = useMemo(() => {
    return list.filter((rx) => {
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
  }, [list, patientFilter, search]);

  const resetForm = () => {
    setEditingId(null);
    setPatientId("");
    setDoctorId("");
    setDate("");
    setDiagnosis("");
    setMedications([{ ...emptyMed }]);
    setNotes("");
    setFollowUp("");
    setFormError(null);
  };

  const openEdit = (rx: Prescription) => {
    setEditingId(rx.id);
    setPatientId(rx.patientId);
    setDoctorId(rx.doctorId);
    setDate(rx.date);
    setDiagnosis(rx.diagnosis ?? "");
    setMedications(rx.medications.length > 0 ? rx.medications.map((m) => ({ ...m, instructions: m.instructions ?? "" })) : [{ ...emptyMed }]);
    setNotes(rx.notes ?? "");
    setFollowUp(rx.followUp ?? "");
    setFormError(null);
    setDialogOpen(true);
  };

  const addMedicationRow = () => setMedications((prev) => [...prev, { ...emptyMed }]);
  const removeMedicationRow = (index: number) => setMedications((prev) => prev.filter((_, i) => i !== index));
  const updateMedication = (index: number, field: keyof PrescriptionMedication, value: string) => {
    setMedications((prev) => prev.map((m, i) => (i === index ? { ...m, [field]: value } : m)));
  };

  const handleSave = async () => {
    const patient = patients.find((p) => p.id === patientId);
    const doctor = doctors.find((d) => d.id === doctorId);
    if (!patient || !doctor) {
      setFormError("Please select a patient and a doctor.");
      return;
    }
    if (!date.trim()) {
      setFormError("Please enter the prescription date.");
      return;
    }
    const meds = medications.filter((m) => m.name.trim() !== "").map((m) => ({
      name: m.name.trim(),
      dosage: m.dosage.trim(),
      frequency: m.frequency.trim(),
      duration: m.duration.trim(),
      instructions: m.instructions?.trim() || undefined,
    }));
    if (meds.length === 0) {
      setFormError("Please add at least one medication.");
      return;
    }
    setFormError(null);
    const payload = {
      patientId: patient.id,
      patientName: `${patient.firstName} ${patient.lastName}`,
      doctorId: doctor.id,
      doctorName: `Dr. ${doctor.firstName} ${doctor.lastName}`,
      date: date.trim(),
      diagnosis: diagnosis.trim() || undefined,
      medications: meds,
      notes: notes.trim() || undefined,
      followUp: followUp.trim() || undefined,
    };
    try {
      if (editingId) {
        await updatePrescription(editingId, payload);
      } else {
        const id = getNextClinicId(CLINIC_ID_PREFIX.PRESCRIPTION, list.map((p) => p.id));
        await addPrescription({ id, ...payload });
      }
      setDialogOpen(false);
      resetForm();
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "Failed to save prescription.");
    }
  };

  const handleDeleteConfirm = async () => {
    if (deleteTarget) {
      await removePrescription(deleteTarget.id);
      setDeleteTarget(null);
    }
  };

  return (
    <div className="p-8">
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Prescriptions</h1>
          <p className="mt-1 text-[var(--foreground)] opacity-70">All prescriptions by patient</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <select
            value={patientFilter}
            onChange={(e) => setPatientFilter(e.target.value)}
            className="rounded-xl border border-[var(--card-border)] bg-[var(--muted-bg)] px-4 py-2.5 text-sm text-[var(--foreground)] shadow-soft focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 input-select"
          >
            <option value="">All patients</option>
            {patients.map((p) => (
              <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>
            ))}
          </select>
          <input
            type="search"
            placeholder="Search prescriptions..."
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
              Add prescription
            </span>
          </button>
        </div>
      </header>

      <Dialog
        open={dialogOpen}
        onClose={() => { setDialogOpen(false); resetForm(); }}
        title={editingId ? "Edit prescription" : "Add prescription"}
        onSave={handleSave}
        saveLabel="Save"
        cancelLabel="Cancel"
      >
        <div className="space-y-4">
          {formError && (
            <p className="rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-300">{formError}</p>
          )}
          <div>
            <label className={dialogLabelClass}>Patient *</label>
            <select
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
              className={`${dialogInputClass} input-select`}
            >
              <option value="">— Select patient —</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={dialogLabelClass}>Doctor *</label>
            <select
              value={doctorId}
              onChange={(e) => setDoctorId(e.target.value)}
              className={`${dialogInputClass} input-select`}
            >
              <option value="">— Select doctor —</option>
              {doctors.map((d) => (
                <option key={d.id} value={d.id}>Dr. {d.firstName} {d.lastName}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={dialogLabelClass}>Date *</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={dialogInputClass} />
          </div>
          <div>
            <label className={dialogLabelClass}>Diagnosis</label>
            <input
              type="text"
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              className={dialogInputClass}
              placeholder="e.g. Hypertension"
            />
          </div>
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className={dialogLabelClass}>Medications *</label>
              <button type="button" onClick={addMedicationRow} className="text-sm text-blue-600 hover:text-blue-700">+ Add medication</button>
            </div>
            <div className="space-y-3">
              {medications.map((med, i) => (
                <div key={i} className="rounded-xl border border-[var(--card-border)] bg-[var(--muted-bg)] p-3 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-xs font-medium text-[var(--foreground)] opacity-70">Medication {i + 1}</span>
                    {medications.length > 1 && (
                      <button type="button" onClick={() => removeMedicationRow(i)} className="text-xs text-red-600 hover:text-red-700">Remove</button>
                    )}
                  </div>
                  <input
                    value={med.name}
                    onChange={(e) => updateMedication(i, "name", e.target.value)}
                    className={dialogInputClass}
                    placeholder="Medication name"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input value={med.dosage} onChange={(e) => updateMedication(i, "dosage", e.target.value)} className={dialogInputClass} placeholder="Dosage" />
                    <input value={med.frequency} onChange={(e) => updateMedication(i, "frequency", e.target.value)} className={dialogInputClass} placeholder="Frequency" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input value={med.duration} onChange={(e) => updateMedication(i, "duration", e.target.value)} className={dialogInputClass} placeholder="Duration" />
                    <input value={med.instructions ?? ""} onChange={(e) => updateMedication(i, "instructions", e.target.value)} className={dialogInputClass} placeholder="Instructions (optional)" />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <label className={dialogLabelClass}>Notes</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className={`${dialogInputClass} min-h-[60px]`} placeholder="Optional notes" rows={2} />
          </div>
          <div>
            <label className={dialogLabelClass}>Follow-up</label>
            <input type="text" value={followUp} onChange={(e) => setFollowUp(e.target.value)} className={dialogInputClass} placeholder="e.g. Recheck in 6 weeks" />
          </div>
        </div>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete prescription"
        message={deleteTarget ? <>Are you sure you want to delete this prescription for <strong>{deleteTarget.patientName}</strong>?</> : ""}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={handleDeleteConfirm}
        variant="danger"
      />

      <div className="space-y-6">
        {filtered.length === 0 ? (
          <div className="overflow-hidden rounded-2xl border border-[var(--card-border)] bg-[var(--card)] py-12 text-center text-[var(--foreground)] opacity-70">
            No prescriptions match your filters or search. Click &quot;Add prescription&quot; to create one.
          </div>
        ) : (
          filtered.map((rx) => (
            <div key={rx.id} className="rounded-2xl border border-[var(--card-border)] bg-[var(--card)] shadow-soft">
              <div className="border-b border-[var(--card-border)] px-5 py-4 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <Link href={`/dashboard/patients/${rx.patientId}`} className="font-semibold text-[var(--foreground)] hover:text-blue-600">{rx.patientName}</Link>
                  <p className="text-sm text-[var(--foreground)] opacity-70">{rx.doctorName} · {formatDate(rx.date)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded bg-[var(--muted-bg)] px-2.5 py-1 text-xs font-medium text-[var(--foreground)]">{rx.medications.length} medication{rx.medications.length !== 1 ? "s" : ""}</span>
                  <button type="button" onClick={() => openEdit(rx)} className="rounded p-1.5 text-[var(--foreground)] opacity-70 hover:bg-[var(--muted-bg)] hover:opacity-100" title="Edit">✏️</button>
                  <button type="button" onClick={() => setDeleteTarget(rx)} className="rounded p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20" title="Delete">🗑️</button>
                </div>
              </div>
              {rx.diagnosis && (
                <p className="px-5 py-2 text-sm text-[var(--foreground)] opacity-80"><span className="font-medium">Diagnosis:</span> {rx.diagnosis}</p>
              )}
              <ul className="divide-y divide-[var(--card-border)] px-5">
                {rx.medications.map((med, i) => (
                  <li key={i} className="py-3">
                    <p className="font-medium text-[var(--foreground)]">{med.name}</p>
                    <p className="text-sm text-[var(--foreground)] opacity-70">{med.dosage} · {med.frequency} · {med.duration}{med.instructions ? ` · ${med.instructions}` : ""}</p>
                  </li>
                ))}
              </ul>
              {(rx.notes || rx.followUp) && (
                <div className="border-t border-[var(--card-border)] px-5 py-3">
                  {rx.notes && <p className="text-sm text-[var(--foreground)] opacity-80">{rx.notes}</p>}
                  {rx.followUp && <p className="mt-1 text-sm font-medium text-blue-600 dark:text-blue-400">Follow-up: {rx.followUp}</p>}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

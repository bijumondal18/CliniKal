"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useClinicData } from "@/contexts/ClinicDataContext";
import { Dialog, dialogInputClass, dialogLabelClass } from "@/components/Dialog";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { PlusIcon } from "@/components/icons/PlusIcon";
import { getNextClinicId, CLINIC_ID_PREFIX } from "@/lib/clinic-ids";
import type { Report } from "@/types/report";

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

const REPORT_TYPES: Report["type"][] = ["lab", "imaging", "pathology", "other"];
const REPORT_STATUSES: Report["status"][] = ["pending", "available", "reviewed"];

export default function ReportsPage() {
  const { reports: list, addReport, updateReport, removeReport, patients, doctors } = useClinicData();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Report | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [patientFilter, setPatientFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [search, setSearch] = useState("");
  const [patientId, setPatientId] = useState("");
  const [doctorId, setDoctorId] = useState("");
  const [type, setType] = useState<Report["type"]>("lab");
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [status, setStatus] = useState<Report["status"]>("pending");
  const [summary, setSummary] = useState("");
  const [findings, setFindings] = useState("");
  const [fileUrl, setFileUrl] = useState("");

  const filtered = useMemo(() => {
    return list.filter((r) => {
      if (patientFilter && r.patientId !== patientFilter) return false;
      if (typeFilter && r.type !== typeFilter) return false;
      const searchable = [r.title, r.summary ?? "", r.findings ?? "", r.patientName, r.doctorName].join(" ");
      return matchQuery(searchable, search);
    });
  }, [list, patientFilter, typeFilter, search]);

  const resetForm = () => {
    setEditingId(null);
    setPatientId("");
    setDoctorId("");
    setType("lab");
    setTitle("");
    setDate("");
    setStatus("pending");
    setSummary("");
    setFindings("");
    setFileUrl("");
    setFormError(null);
  };

  const openEdit = (r: Report) => {
    setEditingId(r.id);
    setPatientId(r.patientId);
    setDoctorId(r.doctorId);
    setType(r.type);
    setTitle(r.title);
    setDate(r.date);
    setStatus(r.status);
    setSummary(r.summary ?? "");
    setFindings(r.findings ?? "");
    setFileUrl(r.fileUrl ?? "");
    setFormError(null);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    const patient = patients.find((p) => p.id === patientId);
    const doctor = doctors.find((d) => d.id === doctorId);
    if (!patient || !doctor) {
      setFormError("Please select a patient and a doctor.");
      return;
    }
    if (!title.trim()) {
      setFormError("Please enter a report title.");
      return;
    }
    if (!date.trim()) {
      setFormError("Please enter the report date.");
      return;
    }
    setFormError(null);
    const payload: Omit<Report, "id"> = {
      patientId: patient.id,
      patientName: `${patient.firstName} ${patient.lastName}`,
      doctorId: doctor.id,
      doctorName: `Dr. ${doctor.firstName} ${doctor.lastName}`,
      type,
      title: title.trim(),
      date: date.trim(),
      status,
      summary: summary.trim() || undefined,
      findings: findings.trim() || undefined,
      fileUrl: fileUrl.trim() || undefined,
    };
    try {
      if (editingId) {
        await updateReport(editingId, payload);
      } else {
        const id = getNextClinicId(CLINIC_ID_PREFIX.REPORT, list.map((r) => r.id));
        await addReport({ id, ...payload });
      }
      setDialogOpen(false);
      resetForm();
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "Failed to save report.");
    }
  };

  const handleDeleteConfirm = async () => {
    if (deleteTarget) {
      await removeReport(deleteTarget.id);
      setDeleteTarget(null);
    }
  };

  return (
    <div className="p-4 sm:p-8">
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Reports</h1>
          <p className="mt-1 text-[var(--foreground)] opacity-70">All reports by patient</p>
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
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="rounded-xl border border-[var(--card-border)] bg-[var(--muted-bg)] px-4 py-2.5 text-sm text-[var(--foreground)] shadow-soft focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 input-select"
          >
            <option value="">All types</option>
            {REPORT_TYPES.map((t) => (
              <option key={t} value={t}>{typeLabels[t]}</option>
            ))}
          </select>
          <input
            type="search"
            placeholder="Search reports..."
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
              Add report
            </span>
          </button>
        </div>
      </header>

      <Dialog
        open={dialogOpen}
        onClose={() => { setDialogOpen(false); resetForm(); }}
        title={editingId ? "Edit report" : "Add report"}
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
            <select value={patientId} onChange={(e) => setPatientId(e.target.value)} className={`${dialogInputClass} input-select`}>
              <option value="">— Select patient —</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={dialogLabelClass}>Doctor *</label>
            <select value={doctorId} onChange={(e) => setDoctorId(e.target.value)} className={`${dialogInputClass} input-select`}>
              <option value="">— Select doctor —</option>
              {doctors.map((d) => (
                <option key={d.id} value={d.id}>Dr. {d.firstName} {d.lastName}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={dialogLabelClass}>Type</label>
            <select value={type} onChange={(e) => setType(e.target.value as Report["type"])} className={`${dialogInputClass} input-select`}>
              {REPORT_TYPES.map((t) => (
                <option key={t} value={t}>{typeLabels[t]}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={dialogLabelClass}>Title *</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className={dialogInputClass} placeholder="e.g. Complete Blood Count" />
          </div>
          <div>
            <label className={dialogLabelClass}>Date *</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={dialogInputClass} />
          </div>
          <div>
            <label className={dialogLabelClass}>Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value as Report["status"])} className={`${dialogInputClass} input-select`}>
              {REPORT_STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={dialogLabelClass}>Summary</label>
            <textarea value={summary} onChange={(e) => setSummary(e.target.value)} className={`${dialogInputClass} min-h-[60px]`} placeholder="Brief summary" rows={2} />
          </div>
          <div>
            <label className={dialogLabelClass}>Findings</label>
            <textarea value={findings} onChange={(e) => setFindings(e.target.value)} className={`${dialogInputClass} min-h-[60px]`} placeholder="Key findings" rows={2} />
          </div>
          <div>
            <label className={dialogLabelClass}>File URL</label>
            <input type="url" value={fileUrl} onChange={(e) => setFileUrl(e.target.value)} className={dialogInputClass} placeholder="https://..." />
          </div>
        </div>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete report"
        message={deleteTarget ? <>Are you sure you want to delete the report &quot;{deleteTarget.title}&quot;?</> : ""}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={handleDeleteConfirm}
        variant="danger"
      />

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
                    No reports match your filters or search. Click &quot;Add report&quot; to create one.
                  </td>
                </tr>
              ) : (
                filtered.map((r) => (
                  <tr key={r.id} className="transition-colors hover:bg-[var(--sidebar-hover)]">
                    <td className="px-5 py-4">
                      <p className="font-medium text-[var(--foreground)]">{r.title}</p>
                      {r.summary && <p className="mt-0.5 line-clamp-1 text-xs text-[var(--foreground)] opacity-70">{r.summary}</p>}
                    </td>
                    <td className="px-5 py-4">
                      <Link href={`/dashboard/patients/${r.patientId}`} className="font-medium text-[var(--foreground)] hover:text-blue-600">{r.patientName}</Link>
                    </td>
                    <td className="px-5 py-4 text-[var(--foreground)] opacity-80">{r.doctorName}</td>
                    <td className="px-5 py-4">
                      <span className="rounded bg-[var(--muted-bg)] px-2 py-0.5 text-xs font-medium text-[var(--foreground)]">{typeLabels[r.type] ?? r.type}</span>
                    </td>
                    <td className="px-5 py-4 text-[var(--foreground)] opacity-80">{formatDate(r.date)}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${statusColors[r.status] ?? ""}`}>{r.status}</span>
                    </td>
                    <td className="px-5 py-4">
                      <button type="button" onClick={() => openEdit(r)} className="text-blue-600 hover:text-blue-700 mr-2">Edit</button>
                      <button type="button" onClick={() => setDeleteTarget(r)} className="text-red-600 hover:text-red-700">Delete</button>
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

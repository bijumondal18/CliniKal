"use client";

import { useMemo, useState } from "react";
import { useClinicData } from "@/contexts/ClinicDataContext";
import { Dialog, dialogInputClass, dialogLabelClass } from "@/components/Dialog";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { PlusIcon } from "@/components/icons/PlusIcon";
import type { ClinicMessage } from "@/types/message";

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

function matchQuery(text: string, q: string): boolean {
  if (!q.trim()) return true;
  const lower = text.toLowerCase();
  const terms = q.toLowerCase().trim().split(/\s+/);
  return terms.every((t) => lower.includes(t));
}

const sentByBadge: Record<string, string> = {
  clinic: "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300",
  doctor: "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300",
  patient: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300",
};

type RecipientOption = { type: "doctor" | "patient"; id: string; label: string };

export default function MessagesPage() {
  const { messages: messageList, addMessage, updateMessage, removeMessage, doctors, patients } = useClinicData();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ClinicMessage | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [recipientKey, setRecipientKey] = useState("");
  const [text, setText] = useState("");
  const [sendViaWhatsApp, setSendViaWhatsApp] = useState(false);
  const [sendViaSms, setSendViaSms] = useState(false);
  const [sendViaEmail, setSendViaEmail] = useState(false);

  const recipientOptions: RecipientOption[] = useMemo(() => {
    const docOpts: RecipientOption[] = doctors.map((d) => ({
      type: "doctor",
      id: d.id,
      label: `Dr. ${d.firstName} ${d.lastName}`,
    }));
    const patOpts: RecipientOption[] = patients.map((p) => ({
      type: "patient",
      id: p.id,
      label: `${p.firstName} ${p.lastName}`,
    }));
    return [...docOpts, ...patOpts];
  }, [doctors, patients]);

  const selectedRecipient = recipientKey
    ? recipientOptions.find((o) => `${o.type}:${o.id}` === recipientKey)
    : null;

  const filtered = useMemo(() => {
    return messageList.filter((m) => {
      const searchable = [m.recipientName, m.text, m.recipientType, m.sentBy].join(" ");
      return matchQuery(searchable, search);
    });
  }, [messageList, search]);

  const resetForm = () => {
    setEditingId(null);
    setRecipientKey("");
    setText("");
    setSendViaWhatsApp(false);
    setSendViaSms(false);
    setSendViaEmail(false);
    setFormError(null);
  };

  const openEdit = (m: ClinicMessage) => {
    setEditingId(m.id);
    setRecipientKey(`${m.recipientType}:${m.recipientId}`);
    setText(m.text);
    setSendViaWhatsApp(m.sendViaWhatsApp === true);
    setSendViaSms(m.sendViaSms === true);
    setSendViaEmail(m.sendViaEmail === true);
    setFormError(null);
    setDialogOpen(true);
  };

  const handleSend = async () => {
    if (!selectedRecipient || !text.trim()) {
      setFormError("Please select a recipient and enter a message.");
      return;
    }
    setFormError(null);
    const payload = {
      recipientType: selectedRecipient.type,
      recipientId: selectedRecipient.id,
      recipientName: selectedRecipient.label,
      text: text.trim(),
      sentBy: "clinic" as const,
      sendViaWhatsApp,
      sendViaSms,
      sendViaEmail,
    };
    try {
      if (editingId) {
        await updateMessage(editingId, payload);
      } else {
        await addMessage(payload);
      }
      setDialogOpen(false);
      resetForm();
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to send message. Please try again.";
      if (process.env.NODE_ENV === "development") console.error("[Messages] Send error:", e);
      setFormError(message);
    }
  };

  const handleDeleteConfirm = async () => {
    if (deleteTarget) {
      await removeMessage(deleteTarget.id);
      setDeleteTarget(null);
    }
  };

  return (
    <div className="p-4 sm:p-8">
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Messages</h1>
          <p className="mt-1 text-[var(--foreground)] opacity-70">
            Send messages to doctors or patients
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <input
            type="search"
            placeholder="Search messages..."
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
              Add message
            </span>
          </button>
        </div>
      </header>

      <Dialog
        open={dialogOpen}
        onClose={() => { setDialogOpen(false); resetForm(); }}
        title={editingId ? "Edit message" : "New message"}
        onSave={handleSend}
        saveLabel={editingId ? "Update" : "Send"}
        cancelLabel="Cancel"
      >
        <div className="space-y-4">
          {formError && (
            <p className="rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-300">
              {formError}
            </p>
          )}
          <div>
            <label className={dialogLabelClass}>To (Doctor or Patient)</label>
            <select
              value={recipientKey}
              onChange={(e) => setRecipientKey(e.target.value)}
              disabled={!!editingId}
              className={`${dialogInputClass} input-select ${editingId ? "opacity-70" : ""}`}
            >
              <option value="">— Select recipient —</option>
              {doctors.length > 0 && (
                <optgroup label="Doctors">
                  {doctors.map((d) => (
                    <option key={`doctor:${d.id}`} value={`doctor:${d.id}`}>
                      Dr. {d.firstName} {d.lastName}
                    </option>
                  ))}
                </optgroup>
              )}
              {patients.length > 0 && (
                <optgroup label="Patients">
                  {patients.map((p) => (
                    <option key={`patient:${p.id}`} value={`patient:${p.id}`}>
                      {p.firstName} {p.lastName}
                    </option>
                  ))}
                </optgroup>
              )}
              {recipientOptions.length === 0 && (
                <option value="" disabled>No doctors or patients yet</option>
              )}
            </select>
          </div>
          <div>
            <label className={dialogLabelClass}>Message</label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              className={`${dialogInputClass} min-h-[120px] resize-y`}
              placeholder="Write your message..."
              rows={4}
            />
          </div>
          <div>
            <span className={dialogLabelClass}>Also send via</span>
            <div className="mt-2 flex flex-wrap gap-4">
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={sendViaWhatsApp}
                  onChange={(e) => setSendViaWhatsApp(e.target.checked)}
                  className="h-4 w-4 rounded border-[var(--card-border)] text-green-600 focus:ring-green-500/20"
                />
                <span className="text-sm text-[var(--foreground)]">WhatsApp</span>
              </label>
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={sendViaSms}
                  onChange={(e) => setSendViaSms(e.target.checked)}
                  className="h-4 w-4 rounded border-[var(--card-border)] text-blue-600 focus:ring-blue-500/20"
                />
                <span className="text-sm text-[var(--foreground)]">SMS</span>
              </label>
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={sendViaEmail}
                  onChange={(e) => setSendViaEmail(e.target.checked)}
                  className="h-4 w-4 rounded border-[var(--card-border)] text-amber-600 focus:ring-amber-500/20"
                />
                <span className="text-sm text-[var(--foreground)]">Email</span>
              </label>
            </div>
          </div>
        </div>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete message"
        message={
          deleteTarget ? (
            <>Are you sure you want to delete this message to <strong>{deleteTarget.recipientName}</strong>? This cannot be undone.</>
          ) : (
            ""
          )
        }
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={handleDeleteConfirm}
        variant="danger"
      />

      <div className="overflow-hidden rounded-2xl border border-[var(--card-border)] bg-[var(--card)] shadow-soft">
        <div className="divide-y divide-[var(--card-border)]">
          {filtered.length === 0 ? (
            <div className="px-5 py-12 text-center text-[var(--foreground)] opacity-70">
              No messages yet. Click &quot;Add message&quot; to send one.
            </div>
          ) : (
            filtered.map((m) => (
              <div
                key={m.id}
                className="flex flex-col gap-2 px-5 py-4 transition-colors hover:bg-[var(--sidebar-hover)] sm:flex-row sm:items-start sm:justify-between"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${sentByBadge[m.sentBy] ?? sentByBadge.clinic}`}>
                      Sent by {m.sentBy}
                    </span>
                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium capitalize text-[var(--foreground)] dark:bg-slate-700 dark:text-slate-300">
                      To {m.recipientType}
                    </span>
                    <span className="font-medium text-[var(--foreground)]">
                      {m.recipientName}
                    </span>
                    {(m.sendViaWhatsApp || m.sendViaSms || m.sendViaEmail) && (
                      <span className="flex items-center gap-1.5 text-xs text-[var(--foreground)] opacity-70">
                        {m.sendViaWhatsApp && <span title="WhatsApp">💬</span>}
                        {m.sendViaSms && <span title="SMS">📱</span>}
                        {m.sendViaEmail && <span title="Email">✉️</span>}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 line-clamp-2 text-sm text-[var(--foreground)] opacity-90">
                    {m.text}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span className="text-right text-xs text-[var(--foreground)] opacity-70">
                    {formatDateTime(m.createdAt)}
                  </span>
                  <button
                    type="button"
                    onClick={() => openEdit(m)}
                    className="rounded p-1.5 text-[var(--foreground)] opacity-70 hover:bg-[var(--muted-bg)] hover:opacity-100"
                    title="Edit message"
                    aria-label="Edit message"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(m)}
                    className="rounded p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                    title="Delete message"
                    aria-label="Delete message"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

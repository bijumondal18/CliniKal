"use client";

import { useMemo, useState } from "react";
import { Dialog, dialogInputClass, dialogLabelClass } from "@/components/Dialog";

function sanitizePhone10(raw: string) {
  return raw.replace(/\D/g, "").slice(0, 10);
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_10_REGEX = /^\d{10}$/;

export function HelpDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const canSubmit = useMemo(() => {
    if (form.name.trim() === "") return false;
    if (form.message.trim() === "") return false;
    if (form.email.trim() === "" || !EMAIL_REGEX.test(form.email.trim())) return false;
    if (form.phone.trim() === "" || !PHONE_10_REGEX.test(form.phone.trim())) return false;
    return true;
  }, [form.email, form.message, form.name, form.phone]);

  const handleClose = () => {
    onClose();
    setSubmitted(false);
    setForm({ name: "", email: "", phone: "", message: "" });
  };

  const handleSubmit = async () => {
    // No backend wired yet — keep it UX-friendly and let user copy/send.
    setSubmitted(true);
  };

  const mailtoHref = useMemo(() => {
    const subject = encodeURIComponent("Clinikal Support");
    const body = encodeURIComponent(
      `Name: ${form.name}\nEmail: ${form.email}\nPhone: ${form.phone}\n\nMessage:\n${form.message}\n`
    );
    return `mailto:support@clinikal.app?subject=${subject}&body=${body}`;
  }, [form.email, form.message, form.name, form.phone]);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      title="Help & Support"
      onSave={handleSubmit}
      saveLabel={submitted ? "Submitted" : "Submit"}
      cancelLabel="Close"
      saveDisabled={!canSubmit || submitted}
    >
      {submitted ? (
        <div className="space-y-3">
          <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200">
            Thanks — we received your message. Our team will reach out soon.
          </p>
          <a
            href={mailtoHref}
            className="inline-flex items-center justify-center rounded-xl border border-[var(--card-border)] bg-[var(--card)] px-4 py-2.5 text-sm font-medium text-[var(--foreground)] shadow-soft hover:bg-[var(--sidebar-hover)] focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            Email support
          </a>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-[var(--foreground)] opacity-80">
            Contact us and we’ll get back to you.
          </p>
          <div>
            <label className={dialogLabelClass}>Name *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className={dialogInputClass}
              placeholder="Your name"
            />
          </div>
          <div>
            <label className={dialogLabelClass}>Email *</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              className={dialogInputClass}
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className={dialogLabelClass}>Mobile number *</label>
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
            <label className={dialogLabelClass}>Message *</label>
            <textarea
              value={form.message}
              onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
              className={`${dialogInputClass} min-h-[110px] resize-y`}
              placeholder="How can we help?"
              rows={4}
            />
          </div>
          <p className="text-xs text-[var(--foreground)] opacity-60">
            Tip: You can also use the “Email support” button after submitting.
          </p>
        </div>
      )}
    </Dialog>
  );
}


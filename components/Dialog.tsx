"use client";

import { useEffect, useState } from "react";

type DialogProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  onSave?: () => void | Promise<void>;
  saveLabel?: string;
  cancelLabel?: string;
  saveDisabled?: boolean;
};

const inputClass =
  "w-full rounded-xl border border-[var(--card-border)] bg-[var(--muted-bg)] px-4 py-2.5 text-sm text-[var(--foreground)] shadow-soft placeholder:opacity-60 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20";
/** Use for type="date" and type="time": black calendar/clock icons in light mode, white in dark mode */
const dateTimeInputClass =
  "w-full rounded-xl border border-[var(--card-border)] bg-[var(--muted-bg)] px-4 py-3 text-sm leading-5 text-[var(--foreground)] shadow-soft placeholder:opacity-60 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 [color-scheme:light] dark:[color-scheme:dark]";
const labelClass = "mb-1.5 block text-sm font-medium text-[var(--foreground)] opacity-90";

export function Dialog({
  open,
  onClose,
  title,
  children,
  onSave,
  saveLabel = "Save",
  cancelLabel = "Cancel",
  saveDisabled = false,
}: DialogProps) {
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  const handleSaveClick = async () => {
    if (!onSave) return;
    setSaving(true);
    try {
      const result = onSave();
      if (result instanceof Promise) await result;
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40"
        aria-hidden
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        className="relative w-full max-w-lg rounded-2xl border border-[var(--card-border)] bg-[var(--card)] shadow-soft"
      >
        <div className="border-b border-[var(--card-border)] px-6 py-4">
          <h2 id="dialog-title" className="text-lg font-semibold text-[var(--foreground)]">
            {title}
          </h2>
        </div>
        <div className="max-h-[60vh] overflow-y-auto px-6 py-4">
          {children}
        </div>
        <div className="flex justify-end gap-3 border-t border-[var(--card-border)] px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] px-4 py-2.5 text-sm font-medium text-[var(--foreground)] shadow-soft hover:bg-[var(--sidebar-hover)] focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            {cancelLabel}
          </button>
          {onSave && (
            <button
              type="button"
              onClick={handleSaveClick}
              disabled={saveDisabled || saving}
              className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-soft hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "Saving..." : saveLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export { inputClass as dialogInputClass, dateTimeInputClass as dialogDateTimeInputClass, labelClass as dialogLabelClass };

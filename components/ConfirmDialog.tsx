"use client";

type ConfirmDialogProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  message: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  variant?: "danger" | "primary";
};

export function ConfirmDialog({
  open,
  onClose,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  variant = "danger",
}: ConfirmDialogProps) {
  if (!open) return null;

  const handleConfirm = () => {
    onConfirm();
    onClose();
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
        aria-labelledby="confirm-dialog-title"
        className="relative w-full max-w-md rounded-2xl border border-[var(--card-border)] bg-[var(--card)] shadow-soft"
      >
        <div className="border-b border-[var(--card-border)] px-6 py-4">
          <h2 id="confirm-dialog-title" className="text-lg font-semibold text-[var(--foreground)]">
            {title}
          </h2>
        </div>
        <div className="px-6 py-4">
          <p className="text-sm text-[var(--foreground)] opacity-90">
            {message}
          </p>
        </div>
        <div className="flex justify-end gap-3 border-t border-[var(--card-border)] px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] px-4 py-2.5 text-sm font-medium text-[var(--foreground)] shadow-soft hover:bg-[var(--sidebar-hover)] focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className={
              variant === "danger"
                ? "rounded-xl bg-red-600 px-4 py-2.5 text-sm font-medium text-white shadow-soft hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                : "rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-soft hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            }
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

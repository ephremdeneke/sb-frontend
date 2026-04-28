import React from "react";

function cn(...xs) {
  return xs.filter(Boolean).join(" ");
}

export function ConfirmDialog({
  open,
  title = "Are you sure?",
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  tone = "danger"
}) {
  if (!open) return null;
  const confirmClass =
    tone === "danger"
      ? "bg-red-600 hover:bg-red-700 focus-visible:ring-red-200"
      : "bg-primary-600 hover:bg-primary-700 focus-visible:ring-primary-200";

  return (
    <div className="fixed inset-0 z-[60]">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-2xl bg-white shadow-xl ring-1 ring-slate-200">
          <div className="p-5">
            <div className="text-base font-semibold text-slate-900">{title}</div>
            {description && <div className="mt-2 text-sm text-slate-600">{description}</div>}
          </div>
          <div className="flex items-center justify-end gap-2 border-t border-slate-200 p-4">
            <button
              onClick={onCancel}
              className={cn(
                "h-10 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm",
                "transition duration-200 hover:bg-slate-50 active:scale-[0.99]",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-200 focus-visible:ring-offset-2"
              )}
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              className={cn(
                "h-10 rounded-2xl px-4 text-sm font-semibold text-white shadow-sm",
                "transition duration-200 hover:shadow-md active:scale-[0.99]",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
                confirmClass
              )}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


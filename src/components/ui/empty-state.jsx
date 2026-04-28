import React from "react";

function cn(...xs) {
  return xs.filter(Boolean).join(" ");
}

export function EmptyState({
  title = "No data found",
  description = "Try adjusting filters or adding new records.",
  icon: Icon,
  action,
  className = ""
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm",
        className
      )}
    >
      {Icon && (
        <div className="mx-auto w-fit rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-200">
          <Icon className="h-5 w-5 text-slate-400" />
        </div>
      )}
      <div className="mt-3 text-sm font-semibold text-slate-900">{title}</div>
      {description && <div className="mt-1 text-xs text-slate-500">{description}</div>}
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </div>
  );
}


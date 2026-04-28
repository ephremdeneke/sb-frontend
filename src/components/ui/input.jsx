import React from "react";

function cn(...xs) {
  return xs.filter(Boolean).join(" ");
}

export function Input({ className = "", ...props }) {
  return (
    <input
      className={cn(
        "h-10 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm",
        "placeholder:text-slate-400",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-200 focus-visible:border-primary-300",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        className
      )}
      {...props}
    />
  );
}

export function Select({ className = "", children, ...props }) {
  return (
    <select
      className={cn(
        "h-10 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-200 focus-visible:border-primary-300",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
}


import React from "react";

function cn(...xs) {
  return xs.filter(Boolean).join(" ");
}

const TONE = {
  neutral: "bg-slate-50 text-slate-700 ring-slate-600/20",
  primary: "bg-orange-50 text-orange-700 ring-orange-600/20",
  success: "bg-green-50 text-green-700 ring-green-600/20",
  danger: "bg-red-50 text-red-700 ring-red-600/20",
  warning: "bg-amber-50 text-amber-700 ring-amber-600/20",
  info: "bg-blue-50 text-blue-700 ring-blue-600/20"
};

export function Badge({ className = "", tone = "neutral", children }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset",
        TONE[tone] || TONE.neutral,
        className
      )}
    >
      {children}
    </span>
  );
}


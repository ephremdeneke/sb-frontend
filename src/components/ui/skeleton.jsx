import React from "react";

function cn(...xs) {
  return xs.filter(Boolean).join(" ");
}

export function Skeleton({ className = "" }) {
  return <div className={cn("animate-pulse rounded-2xl bg-slate-200/70", className)} />;
}


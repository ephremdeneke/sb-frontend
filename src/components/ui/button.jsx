import React from "react";

function cn(...xs) {
  return xs.filter(Boolean).join(" ");
}

const VARIANT = {
  primary:
    "bg-primary-600 text-white hover:bg-primary-700 focus-visible:ring-primary-300",
  secondary:
    "bg-slate-900 text-white hover:bg-slate-800 focus-visible:ring-slate-300",
  outline:
    "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 focus-visible:ring-primary-200",
  ghost:
    "bg-transparent text-slate-700 hover:bg-slate-100 focus-visible:ring-slate-200",
  danger:
    "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-200"
};

const SIZE = {
  sm: "h-9 px-3 text-sm",
  md: "h-10 px-4 text-sm",
  lg: "h-11 px-5 text-base"
};

export function Button({
  className = "",
  variant = "primary",
  size = "md",
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  children,
  ...props
}) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-2xl font-semibold shadow-sm",
        "transition duration-200 active:scale-[0.99] hover:shadow-md",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-sm",
        VARIANT[variant] || VARIANT.primary,
        SIZE[size] || SIZE.md,
        className
      )}
      {...props}
    >
      {LeftIcon && <LeftIcon className="h-4 w-4" />}
      {children}
      {RightIcon && <RightIcon className="h-4 w-4" />}
    </button>
  );
}


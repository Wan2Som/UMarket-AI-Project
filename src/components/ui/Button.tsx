"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";
import { LoaderCircle } from "lucide-react";
import { cn } from "@/lib/format";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "telegram";
export type ButtonSize = "sm" | "md" | "lg" | "icon";

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    "bg-accent text-accent-fg font-semibold shadow-[0_8px_24px_-10px_var(--accent)] hover:brightness-110 active:brightness-95",
  secondary: "glass text-fg hover:border-line-strong hover:bg-surface-strong",
  ghost: "text-muted hover:text-fg hover:bg-line",
  danger: "bg-sold/12 text-sold border border-sold/30 hover:bg-sold/20",
  telegram:
    "bg-[#229ED9] text-white font-semibold hover:bg-[#1c8fc6] shadow-[0_8px_20px_-10px_#229ED9] disabled:bg-line disabled:text-muted disabled:shadow-none",
};

const SIZES: Record<ButtonSize, string> = {
  sm: "h-9 px-3.5 text-sm gap-1.5 rounded-xl",
  md: "h-11 px-5 text-sm gap-2 rounded-2xl",
  lg: "h-13 px-6 text-base gap-2 rounded-2xl",
  icon: "h-10 w-10 rounded-full",
};

/** Shared classes so links can look like buttons (`<Link className={buttonClasses(...)}>`). */
export function buttonClasses(variant: ButtonVariant = "primary", size: ButtonSize = "md", extra?: string) {
  return cn(
    "inline-flex items-center justify-center whitespace-nowrap transition-[filter,background-color,border-color,color,transform] duration-200",
    "disabled:pointer-events-none disabled:opacity-50 select-none",
    VARIANTS[variant],
    SIZES[size],
    extra,
  );
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  /** Pulls gently toward the cursor (see CustomCursor). */
  magnetic?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", size = "md", loading, magnetic, className, children, disabled, type = "button", ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      data-magnetic={magnetic ? "" : undefined}
      className={buttonClasses(variant, size, className)}
      {...rest}
    >
      {loading && <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden />}
      {children}
    </button>
  );
});

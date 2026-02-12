"use client";

import { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  loading?: boolean;
  children: ReactNode;
}

export default function Button({
  variant = "primary",
  loading = false,
  disabled,
  children,
  className = "",
  style,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  const base =
    "inline-flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer";

  const variants: Record<ButtonVariant, string> = {
    primary: "",
    secondary: "",
    ghost: "hover:bg-[#F1F5F9]",
  };

  const variantStyle: Record<ButtonVariant, React.CSSProperties> = {
    primary: {
      backgroundColor: "var(--primary)",
      color: "var(--on-primary)",
      outlineColor: "var(--ring)",
    },
    secondary: {
      backgroundColor: "var(--primary-soft)",
      color: "var(--primary)",
      border: "1px solid var(--border)",
      outlineColor: "var(--ring)",
    },
    ghost: {
      color: "var(--text-2)",
      outlineColor: "var(--ring)",
    },
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${className}`}
      style={{ ...variantStyle[variant], ...style }}
      disabled={isDisabled}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin h-4 w-4"
          viewBox="0 0 24 24"
          fill="none"
          style={{ color: variant === "primary" ? "var(--on-primary)" : "var(--primary)" }}
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
          />
        </svg>
      )}
      {children}
    </button>
  );
}

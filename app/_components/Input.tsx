"use client";

import { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export default function Input({
  label,
  hint,
  error,
  id,
  className = "",
  ...props
}: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-medium"
          style={{ color: "var(--text)" }}
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`rounded-lg px-3.5 py-2.5 text-sm transition-colors ${className}`}
        style={{
          backgroundColor: "var(--surface)",
          border: `1px solid ${error ? "#EF4444" : "var(--border)"}`,
          color: "var(--text)",
          outlineColor: "var(--ring)",
        }}
        {...props}
      />
      {hint && !error && (
        <p className="text-xs" style={{ color: "var(--muted)" }}>
          {hint}
        </p>
      )}
      {error && (
        <p className="text-xs text-red-500">{error}</p>
      )}
    </div>
  );
}

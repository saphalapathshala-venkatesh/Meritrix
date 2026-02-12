"use client";

import { ReactNode, useEffect, useCallback, useRef } from "react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
}

export default function Modal({ open, onClose, children, title }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (open) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, handleKeyDown]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-6"
      style={{ backgroundColor: "rgba(15, 23, 42, 0.4)" }}
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label={title || "Dialog"}
    >
      <div
        className="w-full max-w-lg rounded-xl p-6"
        style={{
          backgroundColor: "var(--surface)",
          border: "1px solid var(--border)",
          boxShadow: "0 20px 60px -12px rgb(0 0 0 / 0.15)",
        }}
      >
        {title && (
          <div
            className="pb-4 mb-4"
            style={{ borderBottom: "1px solid var(--border)" }}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold" style={{ color: "var(--text)" }}>
                {title}
              </h2>
              <button
                onClick={onClose}
                className="rounded-lg p-1.5 hover:bg-[#F1F5F9] transition-colors cursor-pointer"
                style={{ color: "var(--muted)" }}
                aria-label="Close"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path
                    d="M15 5L5 15M5 5l10 10"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}

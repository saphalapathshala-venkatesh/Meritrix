"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";

interface ToastItem {
  id: number;
  message: string;
  type: "success" | "error" | "info";
}

interface ToastContextType {
  toast: (message: string, type?: "success" | "error" | "info") => void;
}

const ToastContext = createContext<ToastContextType>({ toast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

let nextId = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const toast = useCallback((message: string, type: "success" | "error" | "info" = "success") => {
    const id = nextId++;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const colors: Record<string, { bg: string; text: string; border: string }> = {
    success: { bg: "#F0FDF4", text: "#166534", border: "#BBF7D0" },
    error: { bg: "#FEF2F2", text: "#991B1B", border: "#FECACA" },
    info: { bg: "#EFF6FF", text: "#1E40AF", border: "#BFDBFE" },
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 max-w-sm">
        {toasts.map((t) => {
          const c = colors[t.type];
          return (
            <div
              key={t.id}
              className="flex items-start gap-2 px-4 py-3 rounded-lg text-sm font-medium shadow-md animate-[slideIn_0.2s_ease-out]"
              style={{ backgroundColor: c.bg, color: c.text, border: `1px solid ${c.border}` }}
            >
              <span className="flex-1">{t.message}</span>
              <button
                onClick={() => dismiss(t.id)}
                className="flex-shrink-0 opacity-50 hover:opacity-100 cursor-pointer"
                aria-label="Dismiss"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M10.5 3.5l-7 7M3.5 3.5l7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

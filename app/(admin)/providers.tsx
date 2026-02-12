"use client";

import { ToastProvider } from "../_components/Toast";

export function AdminProviders({ children }: { children: React.ReactNode }) {
  return <ToastProvider>{children}</ToastProvider>;
}

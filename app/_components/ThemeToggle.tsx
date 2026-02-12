"use client";

import { useEffect, useState } from "react";

type Theme = "teal" | "lavender";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("teal");

  useEffect(() => {
    const saved = localStorage.getItem("mx_theme") as Theme | null;
    if (saved === "teal" || saved === "lavender") {
      setTheme(saved);
      document.documentElement.dataset.theme = saved;
    }
  }, []);

  function toggle(t: Theme) {
    setTheme(t);
    document.documentElement.dataset.theme = t;
    localStorage.setItem("mx_theme", t);
  }

  return (
    <div
      className="flex items-center rounded-lg p-0.5 gap-0.5"
      style={{ backgroundColor: "#F1F5F9" }}
    >
      <button
        onClick={() => toggle("teal")}
        className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer ${
          theme === "teal" ? "shadow-sm" : ""
        }`}
        style={{
          backgroundColor: theme === "teal" ? "var(--surface)" : "transparent",
          color: theme === "teal" ? "var(--primary)" : "var(--muted)",
        }}
        aria-label="Teal theme"
      >
        Teal
      </button>
      <button
        onClick={() => toggle("lavender")}
        className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer ${
          theme === "lavender" ? "shadow-sm" : ""
        }`}
        style={{
          backgroundColor: theme === "lavender" ? "var(--surface)" : "transparent",
          color: theme === "lavender" ? "var(--primary)" : "var(--muted)",
        }}
        aria-label="Lavender theme"
      >
        Lavender
      </button>
    </div>
  );
}

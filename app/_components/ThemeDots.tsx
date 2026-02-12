"use client";

import { useEffect, useState } from "react";

type Theme = "teal" | "lavender";

const themes: { id: Theme; color: string; label: string }[] = [
  { id: "teal", color: "#0F5C5C", label: "Deep Teal theme" },
  { id: "lavender", color: "#5E5CE6", label: "Lavender theme" },
];

export default function ThemeDots() {
  const [active, setActive] = useState<Theme>("teal");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("mx_theme");
      if (saved === "teal" || saved === "lavender") {
        setActive(saved);
        document.documentElement.dataset.theme = saved;
      }
    } catch {}
  }, []);

  function select(t: Theme) {
    setActive(t);
    document.documentElement.dataset.theme = t;
    try {
      localStorage.setItem("mx_theme", t);
    } catch {}
  }

  return (
    <div className="flex items-center gap-1.5">
      {themes.map((t) => (
        <button
          key={t.id}
          onClick={() => select(t.id)}
          className="rounded-full transition-shadow cursor-pointer"
          style={{
            width: "18px",
            height: "18px",
            backgroundColor: t.color,
            boxShadow:
              active === t.id
                ? `0 0 0 2px var(--surface), 0 0 0 3.5px ${t.color}`
                : "none",
          }}
          aria-label={t.label}
          aria-pressed={active === t.id}
        />
      ))}
    </div>
  );
}

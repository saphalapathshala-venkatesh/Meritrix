"use client";

import Link from "next/link";
import ThemeToggle from "./ThemeToggle";
import { useState } from "react";

const links = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Worksheets", href: "#" },
  { label: "Merit Drills", href: "#" },
  { label: "Live Sessions", href: "#" },
  { label: "Profile", href: "#" },
];

export default function StudentNavbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header
      className="sticky top-0 z-40"
      style={{
        backgroundColor: "var(--surface)",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <nav className="mx-container flex items-center justify-between h-16">
        <Link
          href="/dashboard"
          className="text-lg font-bold tracking-tight"
          style={{ color: "var(--primary)" }}
        >
          Meritrix
        </Link>

        <div className="hidden md:flex items-center gap-6">
          {links.map((l) => (
            <Link
              key={l.label}
              href={l.href}
              className="text-sm font-medium transition-colors hover:opacity-80"
              style={{ color: "var(--text-2)" }}
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-4">
          <ThemeToggle />
          <div
            className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-semibold"
            style={{
              backgroundColor: "var(--primary-soft)",
              color: "var(--primary)",
            }}
          >
            S
          </div>
        </div>

        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden rounded-lg p-2 hover:bg-[#F1F5F9] transition-colors cursor-pointer"
          style={{ color: "var(--text-2)" }}
          aria-label="Toggle menu"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            {menuOpen ? (
              <path d="M15 5L5 15M5 5l10 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            ) : (
              <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            )}
          </svg>
        </button>
      </nav>

      {menuOpen && (
        <div
          className="md:hidden px-6 pb-4 flex flex-col gap-3"
          style={{ borderBottom: "1px solid var(--border)" }}
        >
          {links.map((l) => (
            <Link
              key={l.label}
              href={l.href}
              className="text-sm font-medium py-1"
              style={{ color: "var(--text-2)" }}
              onClick={() => setMenuOpen(false)}
            >
              {l.label}
            </Link>
          ))}
          <div className="pt-2">
            <ThemeToggle />
          </div>
        </div>
      )}
    </header>
  );
}

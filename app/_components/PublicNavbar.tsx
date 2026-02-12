"use client";

import Link from "next/link";
import ThemeDots from "./ThemeDots";
import { useState } from "react";

const links = [
  { label: "Home", href: "/" },
  { label: "Worksheets", href: "#" },
  { label: "Merit Drills", href: "#" },
  { label: "Live Sessions", href: "#" },
  { label: "Pricing", href: "#" },
];

export default function PublicNavbar() {
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
          href="/"
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
          <ThemeDots />
          <Link
            href="/signup"
            className="rounded-lg px-4 py-2 text-sm font-medium transition-colors"
            style={{
              backgroundColor: "var(--surface)",
              color: "var(--text-2)",
              border: "1px solid var(--border)",
            }}
          >
            Create account
          </Link>
          <Link
            href="/login"
            className="rounded-lg px-4 py-2 text-sm font-medium transition-colors"
            style={{
              backgroundColor: "var(--primary)",
              color: "var(--on-primary)",
            }}
          >
            Login
          </Link>
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
          <div className="flex items-center gap-3 pt-2">
            <ThemeDots />
            <Link
              href="/signup"
              className="rounded-lg px-4 py-2 text-sm font-medium"
              style={{
                backgroundColor: "var(--surface)",
                color: "var(--text-2)",
                border: "1px solid var(--border)",
              }}
            >
              Create account
            </Link>
            <Link
              href="/login"
              className="rounded-lg px-4 py-2 text-sm font-medium"
              style={{
                backgroundColor: "var(--primary)",
                color: "var(--on-primary)",
              }}
            >
              Login
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

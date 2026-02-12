"use client";

import { useState } from "react";
import Button from "../_components/Button";
import PromoBanner from "../_components/PromoBanner";

const features = [
  {
    title: "Worksheets",
    description:
      "Structured, curriculum-aligned practice sheets with instant grading and detailed explanations.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="1.5" />
        <path d="M8 10h8M8 14h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: "Merit Drills",
    description:
      "Adaptive daily drills that target weak areas, build speed, and track XP over time.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="12" cy="12" r="1.5" fill="currentColor" />
      </svg>
    ),
  },
  {
    title: "Live Sessions",
    description:
      "Join expert-led sessions with real-time problem solving, Q&A, and collaborative learning.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M15 10l-4 3V7l4 3z" fill="currentColor" />
        <rect x="3" y="4" width="18" height="14" rx="3" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
];

const plans = [
  { name: "Free", price: "$0", features: "5 worksheets / month, basic drills", cta: "Start free" },
  { name: "Pro", price: "$12", features: "Unlimited access, analytics, priority support", cta: "Get started" },
  { name: "Team", price: "$29", features: "Everything in Pro + admin tools, bulk licenses", cta: "Get started" },
];

const banners = [
  {
    title: "Start with Worksheets that Build Mastery",
    subtitle: "Foundational \u2192 Skill Builder \u2192 Mastery, aligned to curriculum.",
    ctaText: "Explore Worksheets",
    ctaHref: "/worksheets",
    imageSrc: "/images/banners/banner-worksheets.png",
  },
  {
    title: "Merit Drills: Rapid Reinforcement",
    subtitle: "Timed practice, XP rewards, and smarter revision.",
    ctaText: "Try Merit Drills",
    ctaHref: "/drills",
    imageSrc: "/images/banners/banner-drills.png",
  },
  {
    title: "Live Sessions that Move the Needle",
    subtitle: "1:1 or small batches \u2014 focused, outcome-driven.",
    ctaText: "Book a Session",
    ctaHref: "/sessions",
    imageSrc: "/images/banners/banner-live.png",
  },
];

export default function HomePage() {
  const [selectedPlan, setSelectedPlan] = useState<number | null>(null);

  return (
    <>
      <section className="mx-section">
        <div className="mx-container text-center">
          <h1
            className="text-4xl md:text-5xl font-bold tracking-tight leading-tight"
            style={{ color: "var(--text)" }}
          >
            Master every subject with
            <br />
            <span style={{ color: "var(--primary)" }}>structured practice</span>
          </h1>
          <p
            className="mt-5 text-lg max-w-2xl mx-auto leading-relaxed"
            style={{ color: "var(--text-2)" }}
          >
            Worksheets, adaptive drills, and live sessions designed to build
            deep understanding and real confidence.
          </p>
          <div className="mt-8 flex items-center justify-center gap-4 flex-wrap">
            <Button>Get started free</Button>
            <Button variant="secondary">See how it works</Button>
          </div>
        </div>
      </section>

      <section className="mx-section" style={{ paddingTop: "0" }}>
        <div className="mx-container">
          <PromoBanner {...banners[0]} />
        </div>
      </section>

      <section className="mx-section" style={{ backgroundColor: "var(--surface)" }}>
        <div className="mx-container">
          <h2
            className="text-2xl font-semibold text-center text-balance mb-10"
            style={{ color: "var(--text)" }}
          >
            Everything you need to excel
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {features.map((f) => (
              <div
                key={f.title}
                className="rounded-xl overflow-hidden flex flex-col"
                style={{
                  backgroundColor: "var(--surface)",
                  border: "1px solid var(--border)",
                  boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.04), 0 1px 2px -1px rgb(0 0 0 / 0.04)",
                }}
              >
                <div className="px-6 pt-6 pb-4 flex items-start" style={{ height: "80px" }}>
                  <div
                    className="h-11 w-11 rounded-lg flex items-center justify-center shrink-0"
                    style={{
                      backgroundColor: "var(--primary-soft)",
                      color: "var(--primary)",
                    }}
                  >
                    {f.icon}
                  </div>
                </div>
                <div
                  className="px-6 pb-6 pt-5 flex-1 flex flex-col rounded-t-xl"
                  style={{ backgroundColor: "var(--primary-soft)" }}
                >
                  <h3
                    className="font-semibold text-balance mb-2"
                    style={{ color: "var(--text)", fontSize: "15px", lineHeight: "1.4" }}
                  >
                    {f.title}
                  </h3>
                  <p
                    className="text-sm text-pretty leading-7 break-words flex-1"
                    style={{ color: "var(--text-2)", hyphens: "auto" }}
                  >
                    {f.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-section">
        <div className="mx-container">
          <PromoBanner {...banners[1]} />
        </div>
      </section>

      <section className="mx-section" style={{ paddingBottom: "0" }}>
        <div className="mx-container">
          <PromoBanner {...banners[2]} />
        </div>
      </section>

      <section className="mx-section">
        <div className="mx-container">
          <h2
            className="text-2xl font-semibold text-center mb-10"
            style={{ color: "var(--text)" }}
          >
            Simple, transparent pricing
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {plans.map((p, i) => (
              <div
                key={p.name}
                className="rounded-xl p-6 transition-shadow cursor-pointer"
                style={{
                  backgroundColor: "var(--surface)",
                  border: selectedPlan === i
                    ? "2px solid var(--primary)"
                    : "1px solid var(--border)",
                  padding: selectedPlan === i ? "23px" : "24px",
                  boxShadow: selectedPlan === i
                    ? "0 4px 12px 0 rgb(0 0 0 / 0.08)"
                    : "0 1px 3px 0 rgb(0 0 0 / 0.04), 0 1px 2px -1px rgb(0 0 0 / 0.04)",
                }}
                onClick={() => setSelectedPlan(i)}
              >
                <p
                  className="text-sm font-semibold uppercase tracking-wider mb-1"
                  style={{ color: "var(--primary)" }}
                >
                  {p.name}
                </p>
                <p
                  className="text-3xl font-bold mb-1"
                  style={{ color: "var(--text)" }}
                >
                  {p.price}
                  <span
                    className="text-sm font-normal ml-1"
                    style={{ color: "var(--muted)" }}
                  >
                    /mo
                  </span>
                </p>
                <p className="text-sm mb-5" style={{ color: "var(--text-2)" }}>
                  {p.features}
                </p>
                <Button
                  className="w-full"
                  style={{ height: "48px" }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedPlan(i);
                  }}
                >
                  {p.cta}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        className="mx-section text-center"
        style={{ backgroundColor: "var(--primary-soft)" }}
      >
        <div className="mx-container">
          <h2
            className="text-2xl font-semibold mb-4"
            style={{ color: "var(--text)" }}
          >
            Ready to level up?
          </h2>
          <p className="text-sm mb-6" style={{ color: "var(--text-2)" }}>
            Join thousands of students building real mastery every day.
          </p>
          <Button>Create your free account</Button>
        </div>
      </section>
    </>
  );
}

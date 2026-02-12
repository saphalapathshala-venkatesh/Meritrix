"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Button from "../_components/Button";
import PromoBanner from "../_components/PromoBanner";
import Modal from "../_components/Modal";
import { loadRazorpayScript, openRazorpayCheckout } from "../../lib/razorpay-checkout";

interface PackageOption {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  isActive: boolean;
}

const features = [
  {
    title: "Worksheets",
    description:
      "Structured practice sheets aligned to your curriculum, with instant grading and detailed explanations.",
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

const staticPlans = [
  {
    name: "Free",
    priceLabel: "₹0",
    features: "5 free worksheets / subject, basic progress tracking",
    cta: "Start free",
    type: "free" as const,
  },
  {
    name: "Pro",
    priceLabel: null,
    features: "Unlimited worksheets, full analytics, priority support",
    cta: "Get started",
    type: "package" as const,
    packageSlug: "pro",
  },
  {
    name: "Team",
    priceLabel: null,
    features: "Everything in Pro + admin tools, bulk licenses",
    cta: "Get started",
    type: "package" as const,
    packageSlug: "team",
  },
];

export default function HomePage() {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<number | null>(null);
  const [packages, setPackages] = useState<PackageOption[]>([]);
  const [purchasing, setPurchasing] = useState(false);
  const [resultModal, setResultModal] = useState<{ type: "success" | "error" | "info"; message: string } | null>(null);

  useEffect(() => {
    fetch("/api/packages/list")
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setPackages(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  const findPackage = (slug: string) => packages.find((p) => p.slug === slug && p.isActive);

  const handlePlanClick = async (planIndex: number) => {
    const plan = staticPlans[planIndex];

    if (plan.type === "free") {
      router.push("/signup");
      return;
    }

    const pkg = plan.packageSlug ? findPackage(plan.packageSlug) : null;
    if (!pkg) {
      setResultModal({ type: "info", message: "This plan will be available soon. Stay tuned!" });
      return;
    }

    setPurchasing(true);

    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        setResultModal({ type: "error", message: "Could not load payment system. Please try again." });
        setPurchasing(false);
        return;
      }

      const res = await fetch("/api/payments/package/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packageId: pkg.id }),
      });
      const data = await res.json();

      if (!res.ok) {
        if (res.status === 401) {
          router.push("/login");
          return;
        }
        setResultModal({ type: "error", message: data.error || "Could not create order." });
        setPurchasing(false);
        return;
      }

      openRazorpayCheckout({
        keyId: data.keyId,
        orderId: data.orderId,
        amount: data.amount,
        currency: data.currency,
        name: data.packageName,
        description: `Unlock ${data.packageName}`,
        userEmail: data.userEmail,
        userName: data.userName,
        onSuccess: async (response) => {
          try {
            const verifyRes = await fetch("/api/payments/package/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                packageId: pkg.id,
                orderId: response.razorpay_order_id,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature,
              }),
            });
            const verifyData = await verifyRes.json();
            if (verifyRes.ok && verifyData.ok) {
              setResultModal({ type: "success", message: "Payment successful! Your content is now unlocked." });
            } else {
              setResultModal({ type: "error", message: verifyData.error || "Payment verification failed. If charged, you will be refunded." });
            }
          } catch {
            setResultModal({ type: "error", message: "Something went wrong verifying payment. Please contact support if charged." });
          }
          setPurchasing(false);
        },
        onDismiss: () => {
          setPurchasing(false);
        },
      });
    } catch {
      setResultModal({ type: "error", message: "Something went wrong. Please try again." });
      setPurchasing(false);
    }
  };

  const getPriceLabel = (plan: typeof staticPlans[number]) => {
    if (plan.type === "free") return plan.priceLabel;
    const pkg = plan.packageSlug ? findPackage(plan.packageSlug) : null;
    if (pkg) return `₹${pkg.price}`;
    return plan.priceLabel || "—";
  };

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
            <Button onClick={() => router.push("/signup")}>Get started free</Button>
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
          <div className="grid md:grid-cols-3 gap-6 items-stretch">
            {features.map((f) => (
              <div
                key={f.title}
                className="rounded-xl overflow-hidden flex flex-col min-w-0"
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
                  className="px-6 pb-6 pt-5 flex-1 flex flex-col min-w-0 rounded-t-xl"
                  style={{ backgroundColor: "var(--primary-soft)" }}
                >
                  <h3
                    className="font-semibold mb-2"
                    style={{ color: "var(--text)", fontSize: "15px", lineHeight: "1.4" }}
                  >
                    {f.title}
                  </h3>
                  <p
                    className="text-sm min-h-[72px]"
                    style={{ color: "var(--text-2)", lineHeight: "1.65", hyphens: "none" }}
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

      <section className="mx-section" id="pricing">
        <div className="mx-container">
          <h2
            className="text-2xl font-semibold text-center mb-10"
            style={{ color: "var(--text)" }}
          >
            Simple, transparent pricing
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {staticPlans.map((p, i) => (
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
                  {getPriceLabel(p)}
                  <span
                    className="text-sm font-normal ml-1"
                    style={{ color: "var(--muted)" }}
                  >
                    {p.type === "free" ? "" : "/mo"}
                  </span>
                </p>
                <p className="text-sm mb-5" style={{ color: "var(--text-2)" }}>
                  {p.features}
                </p>
                <Button
                  className="w-full"
                  style={{ height: "48px" }}
                  loading={purchasing && selectedPlan === i}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedPlan(i);
                    handlePlanClick(i);
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
          <Button onClick={() => router.push("/signup")}>Create your free account</Button>
        </div>
      </section>

      <Modal
        open={!!resultModal}
        onClose={() => setResultModal(null)}
        title={
          resultModal?.type === "success"
            ? "Payment Successful"
            : resultModal?.type === "info"
            ? "Coming Soon"
            : "Payment Issue"
        }
      >
        <p className="text-sm mb-6" style={{ color: "var(--text-2)" }}>
          {resultModal?.message}
        </p>
        <div className="flex justify-end">
          <Button onClick={() => setResultModal(null)}>
            {resultModal?.type === "success" ? "Continue" : "OK"}
          </Button>
        </div>
      </Modal>
    </>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Button from "../../_components/Button";
import Modal from "../../_components/Modal";
import {
  OnlineLiveBadge,
  DeliveryModeLine,
  SessionTermsLink,
  SessionPolicyModal,
  useSessionPolicyModal,
} from "../../_components/SessionPolicy";
import { loadRazorpayScript, openRazorpayCheckout } from "../../../lib/razorpay-checkout";

interface VedicProduct {
  id: string;
  title: string;
  subtitle: string | null;
  totalCredits: number;
  durationMins: number;
  currency: string;
  mrpCents: number;
  priceCents: number;
  termsVersion: string;
}

interface VedicSession {
  id: string;
  title: string;
  description: string | null;
  sessionType: string;
  maxStudents: number;
  scheduledAt: string;
  durationMins: number;
  spotsLeft: number;
}

interface PassInfo {
  totalCredits: number;
  usedCredits: number;
}

function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export default function VedicMathsPage() {
  const router = useRouter();
  const policyModal = useSessionPolicyModal();
  const [product, setProduct] = useState<VedicProduct | null>(null);
  const [sessions, setSessions] = useState<VedicSession[]>([]);
  const [passInfo, setPassInfo] = useState<PassInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [termsChecked, setTermsChecked] = useState(false);
  const [buying, setBuying] = useState(false);
  const [resultModal, setResultModal] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [bookingId, setBookingId] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/passes/vedic/product").then((r) => r.json()),
      fetch("/api/vedic/sessions").then((r) => r.json()),
    ])
      .then(([productData, sessionsData]) => {
        setProduct(productData.product || null);
        setSessions(sessionsData.sessions || []);
      })
      .finally(() => setLoading(false));
  }, []);

  const fetchPassInfo = async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (!res.ok) return;
      const meData = await res.json();
      if (meData.user) {
        const passRes = await fetch("/api/passes/vedic/status");
        if (passRes.ok) {
          const passData = await passRes.json();
          setPassInfo(passData.pass || null);
        }
      }
    } catch {
    }
  };

  useEffect(() => {
    fetchPassInfo();
  }, []);

  const handleBuyPass = async () => {
    if (!product) return;
    setBuying(true);

    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        setResultModal({ type: "error", message: "Could not load payment system. Please try again." });
        setBuying(false);
        return;
      }

      const res = await fetch("/api/passes/vedic/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ termsAccepted: true }),
      });
      const data = await res.json();

      if (!res.ok) {
        if (res.status === 401) {
          router.push(`/login?from=${encodeURIComponent("/vedic-maths")}`);
          return;
        }
        setResultModal({
          type: "error",
          message: res.status === 503
            ? "Payments are temporarily unavailable. Please try again later."
            : data.error || "Could not create order.",
        });
        setBuying(false);
        return;
      }

      openRazorpayCheckout({
        keyId: data.keyId,
        orderId: data.orderId,
        amount: data.amount,
        currency: data.currency,
        name: data.productName,
        description: "Vedic Maths Live Pass",
        userEmail: data.userEmail,
        userName: data.userName,
        onSuccess: async (response) => {
          try {
            const verifyRes = await fetch("/api/passes/vedic/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                orderId: response.razorpay_order_id,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature,
              }),
            });
            const verifyData = await verifyRes.json();
            if (verifyRes.ok && verifyData.ok) {
              setResultModal({ type: "success", message: "Pass purchased successfully! You can now book Vedic Maths sessions." });
              setPassInfo({ totalCredits: product.totalCredits, usedCredits: 0 });
            } else {
              setResultModal({ type: "error", message: verifyData.error || "Payment verification failed." });
            }
          } catch {
            setResultModal({ type: "error", message: "Something went wrong verifying payment." });
          }
          setBuying(false);
        },
        onDismiss: () => {
          setBuying(false);
        },
      });
    } catch {
      setResultModal({ type: "error", message: "Something went wrong. Please try again." });
      setBuying(false);
    }
  };

  const handleBook = async (sessionId: string) => {
    setBookingId(sessionId);
    try {
      const res = await fetch("/api/vedic/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ liveSessionId: sessionId }),
      });
      const data = await res.json();

      if (!res.ok) {
        if (res.status === 401) {
          router.push(`/login?from=${encodeURIComponent("/vedic-maths")}`);
          return;
        }
        setResultModal({ type: "error", message: data.error || "Could not book session." });
        setBookingId(null);
        return;
      }

      setPassInfo({ totalCredits: data.creditsTotal, usedCredits: data.creditsUsed });
      setSessions((prev) =>
        prev.map((s) =>
          s.id === sessionId ? { ...s, spotsLeft: s.spotsLeft - 1 } : s
        )
      );
      setResultModal({ type: "success", message: "Session booked! 1 credit used." });
    } catch {
      setResultModal({ type: "error", message: "Something went wrong." });
    } finally {
      setBookingId(null);
    }
  };

  if (loading) {
    return (
      <section className="mx-section">
        <div className="mx-container flex items-center justify-center py-20">
          <p className="text-sm" style={{ color: "var(--muted)" }}>Loading...</p>
        </div>
      </section>
    );
  }

  const discountPct = product && product.mrpCents > product.priceCents
    ? Math.round(((product.mrpCents - product.priceCents) / product.mrpCents) * 100)
    : 0;

  const hasActivePass = passInfo && passInfo.usedCredits < passInfo.totalCredits;
  const creditsLeft = passInfo ? passInfo.totalCredits - passInfo.usedCredits : 0;

  return (
    <>
      <section className="mx-section">
        <div className="mx-container text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <span
              className="inline-block text-[10px] font-semibold uppercase tracking-wider px-3 py-1 rounded-full"
              style={{ backgroundColor: "rgba(139, 92, 246, 0.1)", color: "#7C3AED" }}
            >
              Live Sessions
            </span>
            <OnlineLiveBadge size="xs" />
          </div>
          <h1
            className="text-3xl md:text-4xl font-bold tracking-tight leading-tight"
            style={{ color: "var(--text)" }}
          >
            Senior Vedic Maths
            <br />
            <span style={{ color: "var(--primary)" }}>(Grades 6–12)</span>
          </h1>
          <p
            className="mt-4 text-base max-w-xl mx-auto leading-relaxed"
            style={{ color: "var(--text-2)" }}
          >
            Short 30-minute sessions &bull; Small groups & 1:1 &bull; Multiple sessions after one-time pass purchase
          </p>
          <div className="flex justify-center mt-3">
            <DeliveryModeLine />
          </div>
        </div>
      </section>

      {hasActivePass && (
        <section className="mx-section" style={{ paddingTop: 0 }}>
          <div className="mx-container">
            <div
              className="rounded-xl p-5 text-center"
              style={{ backgroundColor: "var(--primary-soft)", border: "1px solid var(--border)" }}
            >
              <p className="text-sm font-medium mb-1" style={{ color: "var(--text)" }}>
                Your Active Pass
              </p>
              <p className="text-3xl font-bold" style={{ color: "var(--primary)" }}>
                {creditsLeft} <span className="text-base font-normal" style={{ color: "var(--text-2)" }}>/ {passInfo!.totalCredits} sessions left</span>
              </p>
            </div>
          </div>
        </section>
      )}

      {product && !hasActivePass && (
        <section className="mx-section" style={{ paddingTop: 0 }}>
          <div className="mx-container max-w-lg">
            <div
              className="rounded-xl overflow-hidden"
              style={{ border: "1px solid var(--border)", boxShadow: "0 2px 8px rgb(0 0 0 / 0.04)" }}
            >
              <div className="p-6" style={{ backgroundColor: "var(--surface)" }}>
                <h2 className="text-lg font-semibold mb-1" style={{ color: "var(--text)" }}>
                  {product.title}
                </h2>
                {product.subtitle && (
                  <p className="text-sm mb-4" style={{ color: "var(--text-2)" }}>
                    {product.subtitle}
                  </p>
                )}

                <div className="flex items-end gap-3 mb-2">
                  {product.mrpCents > product.priceCents && (
                    <span className="text-sm line-through" style={{ color: "var(--muted)" }}>
                      {formatCents(product.mrpCents)}
                    </span>
                  )}
                  <span className="text-3xl font-bold" style={{ color: "var(--text)" }}>
                    {formatCents(product.priceCents)}
                  </span>
                  <span className="text-sm" style={{ color: "var(--muted)" }}>CAD</span>
                  {discountPct > 0 && (
                    <span
                      className="text-xs px-2 py-1 rounded-full font-medium"
                      style={{ backgroundColor: "var(--primary-soft)", color: "var(--primary)" }}
                    >
                      {discountPct}% OFF
                    </span>
                  )}
                </div>

                <div className="flex flex-col gap-1.5 mt-4 mb-5">
                  <div className="flex items-center gap-2 text-sm" style={{ color: "var(--text-2)" }}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="var(--primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3.5 7l2.5 2.5 4.5-5" />
                    </svg>
                    Includes {product.totalCredits} sessions
                  </div>
                  <div className="flex items-center gap-2 text-sm" style={{ color: "var(--text-2)" }}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="var(--primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3.5 7l2.5 2.5 4.5-5" />
                    </svg>
                    Each session: {product.durationMins} minutes
                  </div>
                  <DeliveryModeLine />
                </div>

                <label className="flex items-start gap-2 mb-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={termsChecked}
                    onChange={(e) => setTermsChecked(e.target.checked)}
                    className="mt-0.5 accent-[var(--primary)]"
                  />
                  <span className="text-xs leading-relaxed" style={{ color: "var(--text-2)" }}>
                    I agree to the{" "}
                    <SessionTermsLink onClick={policyModal.show} />
                    {" "}— all sessions are Online LIVE (Remote Only).
                  </span>
                </label>

                <Button
                  onClick={handleBuyPass}
                  loading={buying}
                  disabled={!termsChecked}
                  style={{ width: "100%", height: "48px", fontSize: "15px" }}
                >
                  Buy Live Pass
                </Button>
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="mx-section" style={{ paddingTop: 0 }}>
        <div className="mx-container max-w-lg">
          <div className="grid gap-4">
            <div
              className="rounded-xl p-5"
              style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)" }}
            >
              <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--text)" }}>
                Cancellation Policy
              </h3>
              <ul className="flex flex-col gap-1.5">
                {[
                  "Cancel at least 4 hours before the scheduled session for a credit refund.",
                  "Late cancellations (under 4 hours) will consume one session credit.",
                  "No-shows will consume one session credit.",
                ].map((item, i) => (
                  <li key={i} className="text-xs flex items-start gap-2" style={{ color: "var(--text-2)" }}>
                    <span className="flex-shrink-0 mt-0.5" style={{ color: "var(--muted)" }}>&bull;</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div
              className="rounded-xl p-5"
              style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)" }}
            >
              <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--text)" }}>
                Reschedule Policy
              </h3>
              <ul className="flex flex-col gap-1.5">
                {[
                  "Reschedule at least 4 hours before the session at no extra cost.",
                  "Subject to tutor availability for the new time slot.",
                  "Each session may be rescheduled once.",
                ].map((item, i) => (
                  <li key={i} className="text-xs flex items-start gap-2" style={{ color: "var(--text-2)" }}>
                    <span className="flex-shrink-0 mt-0.5" style={{ color: "var(--muted)" }}>&bull;</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="text-center pt-2">
              <SessionTermsLink onClick={policyModal.show} />
            </div>
          </div>
        </div>
      </section>

      {sessions.length > 0 && (
        <section className="mx-section" style={{ paddingTop: 0 }}>
          <div className="mx-container max-w-lg">
            <div className="flex items-center gap-2.5 mb-4">
              <h2 className="text-lg font-semibold" style={{ color: "var(--text)" }}>
                Upcoming Vedic Maths Sessions
              </h2>
              <OnlineLiveBadge size="xs" />
            </div>
            <div className="flex flex-col gap-3">
              {sessions.map((s) => (
                <div
                  key={s.id}
                  className="rounded-xl p-4"
                  style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)" }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium" style={{ color: "var(--text)" }}>
                        {s.title}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: "var(--text-2)" }}>
                        {new Date(s.scheduledAt).toLocaleDateString("en-CA", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                        {" · "}{s.durationMins} min · {s.spotsLeft} spot{s.spotsLeft !== 1 ? "s" : ""} left
                      </p>
                      <div className="mt-1.5">
                        <DeliveryModeLine />
                      </div>
                    </div>
                    {hasActivePass && s.spotsLeft > 0 ? (
                      <Button
                        variant="secondary"
                        onClick={() => handleBook(s.id)}
                        loading={bookingId === s.id}
                        style={{ fontSize: "12px", padding: "6px 14px" }}
                      >
                        Book using pass
                      </Button>
                    ) : s.spotsLeft <= 0 ? (
                      <span className="text-xs font-medium" style={{ color: "var(--muted)" }}>Full</span>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <SessionPolicyModal open={policyModal.open} onClose={policyModal.hide} />

      <Modal
        open={!!resultModal}
        onClose={() => setResultModal(null)}
        title={resultModal?.type === "success" ? "Success" : "Issue"}
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

"use client";

import { useState } from "react";
import Modal from "./Modal";
import Button from "./Button";

export function OnlineLiveBadge({ size = "sm" }: { size?: "sm" | "xs" }) {
  const cls =
    size === "sm"
      ? "text-[11px] px-2.5 py-1 rounded-full font-semibold"
      : "text-[10px] px-2 py-0.5 rounded-full font-semibold";
  return (
    <span
      className={cls}
      style={{
        backgroundColor: "var(--primary-soft)",
        color: "var(--primary)",
      }}
    >
      Online LIVE
    </span>
  );
}

export function DeliveryModeLine() {
  return (
    <p
      className="text-xs flex items-center gap-1.5"
      style={{ color: "var(--text-2)" }}
    >
      <svg
        width="13"
        height="13"
        viewBox="0 0 24 24"
        fill="none"
        stroke="var(--primary)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <path d="M8 21h8M12 17v4" />
      </svg>
      Delivery: Online LIVE (Remote Only)
    </p>
  );
}

export function SessionTermsLink({
  onClick,
}: {
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-xs underline font-medium cursor-pointer"
      style={{ color: "var(--primary)" }}
    >
      Terms &amp; Session Policy
    </button>
  );
}

export function SessionPolicyModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <Modal open={open} onClose={onClose} title="Terms & Session Policy">
      <div className="text-sm space-y-5" style={{ color: "var(--text-2)" }}>
        <div>
          <h4
            className="font-semibold mb-1.5"
            style={{ color: "var(--text)" }}
          >
            Online LIVE Sessions
          </h4>
          <p>
            All sessions are conducted strictly Online LIVE. We do not offer
            onsite or in-person classes. No onsite / in-person sessions are
            offered.
          </p>
          <p className="mt-1.5">
            Students must have stable internet, a device, and be able to join
            via the provided meeting link (Zoom, Google Meet, or similar).
          </p>
        </div>

        <div>
          <h4
            className="font-semibold mb-1.5"
            style={{ color: "var(--text)" }}
          >
            Terms of Service
          </h4>
          <p>
            By purchasing a session pass or booking a session, you agree to the
            following terms. Session credits are non-transferable and
            non-refundable after purchase.
          </p>
        </div>

        <div>
          <h4
            className="font-semibold mb-1.5"
            style={{ color: "var(--text)" }}
          >
            Cancellation Policy
          </h4>
          <ul className="list-disc pl-4 space-y-1">
            <li>
              Cancel at least 4 hours before the scheduled session for a credit
              refund.
            </li>
            <li>
              Late cancellations (under 4 hours) will consume one session
              credit.
            </li>
            <li>No-shows will consume one session credit.</li>
          </ul>
        </div>

        <div>
          <h4
            className="font-semibold mb-1.5"
            style={{ color: "var(--text)" }}
          >
            Reschedule Policy
          </h4>
          <ul className="list-disc pl-4 space-y-1">
            <li>
              Reschedule at least 4 hours before the session at no extra cost.
            </li>
            <li>Subject to tutor availability for the new time slot.</li>
            <li>Each session may be rescheduled once.</li>
          </ul>
        </div>
      </div>
      <div className="flex justify-end mt-6">
        <Button onClick={onClose}>Close</Button>
      </div>
    </Modal>
  );
}

export function useSessionPolicyModal() {
  const [open, setOpen] = useState(false);
  return {
    open,
    show: () => setOpen(true),
    hide: () => setOpen(false),
  };
}

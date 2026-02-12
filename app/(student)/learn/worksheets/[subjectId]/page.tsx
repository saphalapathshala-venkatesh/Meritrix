"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Card } from "../../../../_components/Card";
import Badge from "../../../../_components/Badge";
import Modal from "../../../../_components/Modal";
import Button from "../../../../_components/Button";

interface Worksheet {
  id: string;
  title: string;
  tier: string;
  isFree: boolean;
  isLocked: boolean;
  isCompleted: boolean;
  pdfUrl: string | null;
}

interface Chapter {
  id: string;
  name: string;
  worksheets: Worksheet[];
}

interface SubjectInfo {
  id: string;
  name: string;
  gradeName: string;
  price: number;
  hasPurchased: boolean;
}

const TIER_ORDER = ["foundational", "skill_builder", "mastery"];

const TIER_CONFIG: Record<string, { label: string; icon: React.ReactNode }> = {
  foundational: {
    label: "Foundational",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 12.5h12M4 9.5h8M3 6.5l5-4 5 4" />
        <rect x="6" y="9.5" width="4" height="3" />
      </svg>
    ),
  },
  skill_builder: {
    label: "Skill Builder",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 12V4M8 4l3.5 3.5M8 4L4.5 7.5" />
        <path d="M3 14h10" />
      </svg>
    ),
  },
  mastery: {
    label: "Mastery",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 1.5l1.85 3.75 4.15.6-3 2.93.71 4.12L8 10.97 4.29 12.9 5 8.78 2 5.85l4.15-.6z" />
      </svg>
    ),
  },
};

export default function SubjectDetailPage() {
  const { subjectId } = useParams<{ subjectId: string }>();
  const [subject, setSubject] = useState<SubjectInfo | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmModal, setConfirmModal] = useState<{
    worksheetId: string;
    title: string;
  } | null>(null);
  const [lockedModal, setLockedModal] = useState(false);
  const [toggling, setToggling] = useState(false);

  const fetchData = useCallback(() => {
    fetch(`/api/worksheets/subject/${subjectId}`)
      .then((r) => r.json())
      .then((d) => {
        setSubject(d.subject);
        setChapters(d.chapters || []);
      })
      .finally(() => setLoading(false));
  }, [subjectId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleToggle = (ws: Worksheet) => {
    if (ws.isLocked) return;
    if (!ws.isCompleted) {
      setConfirmModal({ worksheetId: ws.id, title: ws.title });
    } else {
      doToggle(ws.id, false);
    }
  };

  const doToggle = async (worksheetId: string, completed: boolean) => {
    setToggling(true);
    try {
      await fetch("/api/worksheets/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ worksheetId, completed }),
      });
      setChapters((prev) =>
        prev.map((ch) => ({
          ...ch,
          worksheets: ch.worksheets.map((ws) =>
            ws.id === worksheetId ? { ...ws, isCompleted: completed } : ws
          ),
        }))
      );
    } finally {
      setToggling(false);
      setConfirmModal(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-sm" style={{ color: "var(--muted)" }}>Loading...</p>
      </div>
    );
  }

  if (!subject) {
    return (
      <div className="text-center py-20">
        <p className="text-sm" style={{ color: "var(--muted)" }}>Subject not found.</p>
        <Link href="/learn/worksheets" className="text-sm mt-2 inline-block" style={{ color: "var(--primary)" }}>
          Back to Worksheets
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="mb-2">
        <Link
          href="/learn/worksheets"
          className="text-sm inline-flex items-center gap-1 hover:underline"
          style={{ color: "var(--primary)" }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M8.5 3L4 7l4.5 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Worksheets
        </Link>
      </div>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text)" }}>
            {subject.name}
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-2)" }}>
            {subject.gradeName}
          </p>
        </div>
        {subject.hasPurchased ? (
          <Badge>Purchased</Badge>
        ) : (
          <Badge>₹{subject.price}</Badge>
        )}
      </div>

      {chapters.length === 0 ? (
        <Card>
          <p className="text-sm text-center py-4" style={{ color: "var(--muted)" }}>
            No chapters available yet.
          </p>
        </Card>
      ) : (
        <div className="flex flex-col gap-6">
          {chapters.map((ch) => {
            const grouped: Record<string, Worksheet[]> = {};
            for (const tier of TIER_ORDER) {
              grouped[tier] = ch.worksheets.filter((ws) => ws.tier === tier);
            }

            return (
              <Card key={ch.id}>
                <h2
                  className="text-base font-semibold pb-3 mb-1"
                  style={{ color: "var(--text)", borderBottom: "1px solid var(--border)" }}
                >
                  {ch.name}
                </h2>

                {TIER_ORDER.map((tier, tierIdx) => {
                  const items = grouped[tier];
                  if (!items || items.length === 0) return null;
                  const config = TIER_CONFIG[tier];
                  const visibleTiers = TIER_ORDER.filter((t) => (grouped[t]?.length || 0) > 0);
                  const isLast = tier === visibleTiers[visibleTiers.length - 1];

                  return (
                    <div key={tier} className={isLast ? "" : "mb-3"} style={{ marginTop: tierIdx === 0 ? "12px" : undefined }}>
                      <div
                        className="flex items-center justify-between pb-2 mb-1"
                        style={{ borderBottom: "1px solid rgba(226, 232, 240, 0.5)" }}
                      >
                        <div className="flex items-center gap-2" style={{ color: "var(--text-2)" }}>
                          <span className="flex-shrink-0 opacity-60">{config?.icon}</span>
                          <span className="text-xs font-semibold uppercase tracking-wider">
                            {config?.label || tier}
                          </span>
                        </div>
                        <span className="text-[11px] font-medium" style={{ color: "var(--muted)" }}>
                          {items.length}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        {items.map((ws) => (
                          <WorksheetRow
                            key={ws.id}
                            ws={ws}
                            onToggle={() => handleToggle(ws)}
                            onLockedClick={() => setLockedModal(true)}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </Card>
            );
          })}
        </div>
      )}

      <Modal
        open={!!confirmModal}
        onClose={() => setConfirmModal(null)}
        title="Mark as Completed"
      >
        <p className="text-sm mb-2" style={{ color: "var(--text-2)" }}>
          You are about to mark <strong style={{ color: "var(--text)" }}>{confirmModal?.title}</strong> as completed.
        </p>
        <p className="text-sm mb-6" style={{ color: "var(--muted)" }}>
          Please confirm you have genuinely worked through this worksheet. Honest self-tracking helps you learn better and gives your tutor accurate progress data.
        </p>
        <div className="flex gap-3 justify-end">
          <Button variant="ghost" onClick={() => setConfirmModal(null)}>
            Cancel
          </Button>
          <Button
            loading={toggling}
            onClick={() => confirmModal && doToggle(confirmModal.worksheetId, true)}
          >
            Yes, I completed it
          </Button>
        </div>
      </Modal>

      <Modal
        open={lockedModal}
        onClose={() => setLockedModal(false)}
        title="Unlock Full Access"
      >
        <p className="text-sm mb-2" style={{ color: "var(--text-2)" }}>
          This worksheet is part of the complete {subject.name} learning path.
        </p>
        <p className="text-sm mb-6" style={{ color: "var(--muted)" }}>
          Unlock all chapters, worksheets, and practice material to get the most out of your preparation. You can explore our plans to find what works best for you.
        </p>
        <div className="flex gap-3 justify-end">
          <Button variant="ghost" onClick={() => setLockedModal(false)}>
            Maybe Later
          </Button>
          <Link href="/#pricing">
            <Button onClick={() => setLockedModal(false)}>
              View Pricing
            </Button>
          </Link>
        </div>
      </Modal>
    </>
  );
}

function WorksheetRow({
  ws,
  onToggle,
  onLockedClick,
}: {
  ws: Worksheet;
  onToggle: () => void;
  onLockedClick: () => void;
}) {
  const isAccessible = ws.isFree || !ws.isLocked;

  return (
    <div
      className="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors"
      style={{
        backgroundColor: ws.isCompleted ? "var(--primary-soft)" : "transparent",
      }}
    >
      <button
        onClick={onToggle}
        disabled={ws.isLocked}
        className="flex-shrink-0 w-[18px] h-[18px] rounded border-[1.5px] flex items-center justify-center transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        style={{
          borderColor: ws.isCompleted ? "var(--primary)" : "var(--border)",
          backgroundColor: ws.isCompleted ? "var(--primary)" : "transparent",
        }}
        aria-label={ws.isCompleted ? "Mark incomplete" : "Mark completed"}
      >
        {ws.isCompleted && (
          <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
            <path d="M2.5 6l2.5 2.5 4.5-5" stroke="var(--on-primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>

      <span
        className="flex-1 text-sm min-w-0"
        style={{
          color: ws.isCompleted ? "var(--primary)" : ws.isLocked ? "var(--muted)" : "var(--text)",
          textDecoration: ws.isCompleted ? "line-through" : "none",
        }}
      >
        {ws.title}
      </span>

      {ws.isFree && (
        <span
          className="flex-shrink-0 text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full"
          style={{ backgroundColor: "#DEF7EC", color: "#03543F" }}
        >
          Free
        </span>
      )}

      {isAccessible ? (
        <button
          onClick={() => {
            if (ws.pdfUrl) window.open(ws.pdfUrl, "_blank");
          }}
          className="flex-shrink-0 text-xs font-medium px-2.5 py-1 rounded-md transition-colors cursor-pointer"
          style={{
            backgroundColor: "var(--primary-soft)",
            color: "var(--primary)",
          }}
        >
          View Worksheet
        </button>
      ) : (
        <button
          onClick={onLockedClick}
          className="flex-shrink-0 text-xs font-medium px-2.5 py-1 rounded-md transition-colors cursor-pointer"
          style={{
            backgroundColor: "#F8FAFC",
            color: "var(--muted)",
            border: "1px solid var(--border)",
          }}
        >
          Unlock to Access
        </button>
      )}
    </div>
  );
}

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

const TIER_LABELS: Record<string, string> = {
  foundational: "Foundational",
  "skill-builder": "Skill Builder",
  mastery: "Mastery",
};

const TIER_ORDER = ["foundational", "skill-builder", "mastery"];

export default function SubjectDetailPage() {
  const { subjectId } = useParams<{ subjectId: string }>();
  const [subject, setSubject] = useState<SubjectInfo | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmModal, setConfirmModal] = useState<{
    worksheetId: string;
    title: string;
    completing: boolean;
  } | null>(null);
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
    if (!ws.isCompleted) {
      setConfirmModal({ worksheetId: ws.id, title: ws.title, completing: true });
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
                  className="text-base font-semibold mb-4"
                  style={{ color: "var(--text)" }}
                >
                  {ch.name}
                </h2>

                {TIER_ORDER.map((tier) => {
                  const items = grouped[tier];
                  if (!items || items.length === 0) return null;
                  return (
                    <div key={tier} className="mb-4 last:mb-0">
                      <p
                        className="text-xs font-semibold uppercase tracking-wider mb-2 pb-1"
                        style={{
                          color: "var(--muted)",
                          borderBottom: "1px solid var(--border)",
                        }}
                      >
                        {TIER_LABELS[tier] || tier}
                      </p>
                      <div className="flex flex-col gap-1">
                        {items.map((ws) => (
                          <WorksheetRow
                            key={ws.id}
                            ws={ws}
                            onToggle={() => handleToggle(ws)}
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
    </>
  );
}

function WorksheetRow({
  ws,
  onToggle,
}: {
  ws: Worksheet;
  onToggle: () => void;
}) {
  return (
    <div
      className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors"
      style={{
        backgroundColor: ws.isCompleted ? "var(--primary-soft)" : "transparent",
      }}
    >
      <button
        onClick={onToggle}
        disabled={ws.isLocked}
        className="flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        style={{
          borderColor: ws.isCompleted ? "var(--primary)" : "var(--border)",
          backgroundColor: ws.isCompleted ? "var(--primary)" : "transparent",
        }}
        aria-label={ws.isCompleted ? "Mark incomplete" : "Mark completed"}
      >
        {ws.isCompleted && (
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2.5 6l2.5 2.5 4.5-5" stroke="var(--on-primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>

      <span
        className="flex-1 text-sm"
        style={{
          color: ws.isCompleted ? "var(--primary)" : "var(--text)",
          textDecoration: ws.isCompleted ? "line-through" : "none",
        }}
      >
        {ws.title}
      </span>

      {ws.isFree ? (
        <span
          className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full"
          style={{ backgroundColor: "#DEF7EC", color: "#03543F" }}
        >
          Free
        </span>
      ) : ws.isLocked ? (
        <span
          className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full"
          style={{ backgroundColor: "#FEF3C7", color: "#92400E" }}
        >
          Locked
        </span>
      ) : null}

      {!ws.isLocked && ws.pdfUrl && (
        <a
          href={ws.pdfUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-medium px-2.5 py-1 rounded-md transition-colors"
          style={{
            backgroundColor: "var(--primary-soft)",
            color: "var(--primary)",
          }}
        >
          View
        </a>
      )}
    </div>
  );
}

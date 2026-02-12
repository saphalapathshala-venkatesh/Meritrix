"use client";

import { useEffect, useState } from "react";
import { Card } from "../../../_components/Card";
import Button from "../../../_components/Button";
import Input from "../../../_components/Input";

interface LiveSession {
  id: string;
  title: string;
  description: string | null;
  sessionType: string;
  category: string;
  mode: string;
  maxStudents: number;
  pricePerSlot: number;
  scheduledAt: string;
  durationMins: number;
  meetingUrl: string | null;
  isActive: boolean;
  _count: { bookings: number };
}

export default function AdminSessionsPage() {
  const [sessions, setSessions] = useState<LiveSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    sessionType: "ONE_ON_ONE",
    category: "general",
    maxStudents: "1",
    pricePerSlot: "0",
    scheduledAt: "",
    durationMins: "60",
    meetingUrl: "",
  });

  const fetchSessions = () => {
    fetch("/api/admin/sessions")
      .then((r) => r.json())
      .then((d) => setSessions(d.sessions || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  useEffect(() => {
    if (form.category === "vedic") {
      setForm((f) => ({ ...f, durationMins: "30" }));
    }
  }, [form.category]);

  const handleCreate = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "create", ...form }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ type: "success", text: "Session created." });
        setShowForm(false);
        setForm({
          title: "",
          description: "",
          sessionType: "ONE_ON_ONE",
          category: "general",
          maxStudents: "1",
          pricePerSlot: "0",
          scheduledAt: "",
          durationMins: "60",
          meetingUrl: "",
        });
        fetchSessions();
      } else {
        setMessage({ type: "error", text: data.error || "Failed to create." });
      }
    } catch {
      setMessage({ type: "error", text: "Something went wrong." });
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (id: string, isActive: boolean, meetingUrl: string | null) => {
    if (isActive && !meetingUrl) {
      setMessage({ type: "error", text: "Cannot activate a session without a meeting link. Please add a Zoom/Meet URL first." });
      return;
    }
    await fetch("/api/admin/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "toggle", id, isActive }),
    });
    fetchSessions();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-sm" style={{ color: "var(--muted)" }}>Loading...</p>
      </div>
    );
  }

  return (
    <>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text)" }}>
            Live Sessions
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-2)" }}>
            Create and manage live sessions for students.
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "Create Session"}
        </Button>
      </div>

      {message && (
        <div
          className="mb-6 px-4 py-3 rounded-lg text-sm font-medium"
          style={{
            backgroundColor: message.type === "success" ? "#F0FDF4" : "#FFFBEB",
            color: message.type === "success" ? "#166534" : "#92400E",
            border: `1px solid ${message.type === "success" ? "#BBF7D0" : "#FDE68A"}`,
          }}
        >
          {message.text}
        </div>
      )}

      {showForm && (
        <Card className="mb-6">
          <h2 className="text-base font-semibold mb-4" style={{ color: "var(--text)" }}>
            New Live Session
          </h2>
          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            <Input
              label="Title"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            />
            <Input
              label="Description"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-2)" }}>
                Category
              </label>
              <select
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                className="w-full rounded-lg px-3 py-2 text-sm"
                style={{
                  backgroundColor: "var(--surface)",
                  border: "1px solid var(--border)",
                  color: "var(--text)",
                }}
              >
                <option value="general">General</option>
                <option value="vedic">Vedic Maths</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-2)" }}>
                Session Type
              </label>
              <select
                value={form.sessionType}
                onChange={(e) => setForm((f) => ({ ...f, sessionType: e.target.value }))}
                className="w-full rounded-lg px-3 py-2 text-sm"
                style={{
                  backgroundColor: "var(--surface)",
                  border: "1px solid var(--border)",
                  color: "var(--text)",
                }}
              >
                <option value="ONE_ON_ONE">1:1</option>
                <option value="BATCH">Batch</option>
              </select>
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-4 mb-4">
            <Input
              label="Scheduled At"
              type="datetime-local"
              value={form.scheduledAt}
              onChange={(e) => setForm((f) => ({ ...f, scheduledAt: e.target.value }))}
            />
            <Input
              label="Duration (minutes)"
              type="number"
              value={form.durationMins}
              onChange={(e) => setForm((f) => ({ ...f, durationMins: e.target.value }))}
              hint={form.category === "vedic" ? "Default 30 for Vedic" : ""}
            />
            <Input
              label="Max Students"
              type="number"
              value={form.maxStudents}
              onChange={(e) => setForm((f) => ({ ...f, maxStudents: e.target.value }))}
            />
          </div>

          <Input
            label="Price per Slot (cents)"
            type="number"
            value={form.pricePerSlot}
            onChange={(e) => setForm((f) => ({ ...f, pricePerSlot: e.target.value }))}
            hint={form.category === "vedic" ? "Vedic uses pass credits (set 0)" : ""}
          />

          <div className="mt-4">
            <Input
              label="Meeting URL"
              type="url"
              value={form.meetingUrl}
              onChange={(e) => setForm((f) => ({ ...f, meetingUrl: e.target.value }))}
              placeholder="https://zoom.us/j/... or https://meet.google.com/..."
              hint="Sessions are Online LIVE only. Share Zoom/Meet link here."
            />
          </div>

          <div
            className="flex items-center gap-2 mt-3 px-3 py-2 rounded-lg text-xs"
            style={{ backgroundColor: "var(--primary-soft)", color: "var(--primary)" }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="3" width="20" height="14" rx="2" />
              <path d="M8 21h8M12 17v4" />
            </svg>
            All sessions are Online LIVE (Remote Only). No onsite sessions are supported.
          </div>

          <div className="flex justify-end mt-4">
            <Button onClick={handleCreate} loading={saving}>
              Create Session
            </Button>
          </div>
        </Card>
      )}

      {sessions.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            No live sessions created yet.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {sessions.map((s) => (
            <Card key={s.id}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="text-sm font-semibold" style={{ color: "var(--text)" }}>
                      {s.title}
                    </h3>
                    <span
                      className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full"
                      style={{
                        backgroundColor: s.category === "vedic" ? "rgba(139, 92, 246, 0.1)" : "var(--primary-soft)",
                        color: s.category === "vedic" ? "#7C3AED" : "var(--primary)",
                      }}
                    >
                      {s.category === "vedic" ? "Vedic Maths" : "General"}
                    </span>
                    <span
                      className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: "var(--primary-soft)", color: "var(--primary)" }}
                    >
                      Online LIVE
                    </span>
                    {!s.meetingUrl && (
                      <span
                        className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: "#FEF3C7", color: "#92400E" }}
                      >
                        Missing link
                      </span>
                    )}
                    {!s.isActive && (
                      <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full" style={{ backgroundColor: "#FEE2E2", color: "#991B1B" }}>
                        Inactive
                      </span>
                    )}
                  </div>
                  <p className="text-xs" style={{ color: "var(--text-2)" }}>
                    {new Date(s.scheduledAt).toLocaleDateString("en-CA", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                    {" · "}{s.durationMins} min · {s.sessionType} · {s._count.bookings}/{s.maxStudents} booked
                  </p>
                </div>
                <Button
                  variant="ghost"
                  onClick={() => toggleActive(s.id, !s.isActive, s.meetingUrl)}
                  style={{ fontSize: "12px", padding: "4px 10px" }}
                >
                  {s.isActive ? "Deactivate" : "Activate"}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}

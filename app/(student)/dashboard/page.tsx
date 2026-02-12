"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { Card, CardHeader, CardBody } from "../../_components/Card";
import ProgressBar from "../../_components/ProgressBar";

interface Grade {
  id: string;
  name: string;
  sortOrder: number;
}

interface SubjectProgress {
  id: string;
  name: string;
  gradeId: string;
  gradeName: string;
  total: number;
  completed: number;
  percent: number;
}

interface DashboardData {
  grades: Grade[];
  overallPercent: number;
  totalWorksheets: number;
  totalCompleted: number;
  subjects: SubjectProgress[];
}

export default function StudentDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedGradeId, setSelectedGradeId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then((d: DashboardData) => {
        setData(d);
        if (d.grades?.length) {
          setSelectedGradeId(d.grades[0].id);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    if (!data || !selectedGradeId) return { subjects: [], total: 0, completed: 0, percent: 0 };
    const subjects = data.subjects.filter((s) => s.gradeId === selectedGradeId);
    const total = subjects.reduce((a, s) => a + s.total, 0);
    const completed = subjects.reduce((a, s) => a + s.completed, 0);
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { subjects, total, completed, percent };
  }, [data, selectedGradeId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-sm" style={{ color: "var(--muted)" }}>Loading...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-20">
        <p className="text-sm" style={{ color: "var(--muted)" }}>Unable to load dashboard.</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text)" }}>
            Dashboard
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-2)" }}>
            Welcome back! Here is your learning overview.
          </p>
        </div>
        {data.grades.length > 1 && (
          <div className="relative">
            <select
              value={selectedGradeId || ""}
              onChange={(e) => setSelectedGradeId(e.target.value)}
              className="appearance-none text-sm font-medium pl-3 pr-8 py-2 rounded-lg cursor-pointer"
              style={{
                backgroundColor: "var(--primary-soft)",
                color: "var(--primary)",
                border: "1px solid var(--border)",
                outline: "none",
              }}
            >
              {data.grades.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
            <svg
              className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
            >
              <path d="M3 4.5l3 3 3-3" stroke="var(--primary)" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--muted)" }}>
              Grade Progress
            </p>
          </CardHeader>
          <CardBody>
            <p className="text-3xl font-bold mb-4" style={{ color: "var(--text)" }}>
              {filtered.percent}%
            </p>
            <ProgressBar value={filtered.percent} label="Worksheet completion" />
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--muted)" }}>
              Worksheets Completed
            </p>
          </CardHeader>
          <CardBody>
            <p className="text-3xl font-bold mb-1" style={{ color: "var(--text)" }}>
              {filtered.completed}
            </p>
            <p className="text-sm" style={{ color: "var(--text-2)" }}>
              of {filtered.total} total
            </p>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--muted)" }}>
              Subjects
            </p>
          </CardHeader>
          <CardBody>
            <p className="text-3xl font-bold mb-1" style={{ color: "var(--text)" }}>
              {filtered.subjects.length}
            </p>
            <p className="text-sm" style={{ color: "var(--text-2)" }}>
              in this grade
            </p>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold" style={{ color: "var(--text)" }}>
              Subject Progress
            </p>
            <Link
              href="/learn/worksheets"
              className="text-xs font-medium hover:underline"
              style={{ color: "var(--primary)" }}
            >
              Browse Worksheets
            </Link>
          </div>
        </CardHeader>
        <CardBody className="flex flex-col gap-5">
          {filtered.subjects.length === 0 ? (
            <p className="text-sm text-center py-4" style={{ color: "var(--muted)" }}>
              No subjects available for this grade.
            </p>
          ) : (
            filtered.subjects.map((s) => (
              <div key={s.id}>
                <ProgressBar
                  value={s.completed}
                  max={s.total || 1}
                  label={s.name}
                />
                <p className="text-[11px] mt-0.5" style={{ color: "var(--muted)" }}>
                  {s.completed} / {s.total} Worksheets Completed
                </p>
              </div>
            ))
          )}
        </CardBody>
      </Card>
    </>
  );
}

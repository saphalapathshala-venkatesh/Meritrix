"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardHeader, CardBody } from "../../_components/Card";
import ProgressBar from "../../_components/ProgressBar";

interface SubjectProgress {
  id: string;
  name: string;
  gradeName: string;
  total: number;
  completed: number;
  percent: number;
}

interface DashboardData {
  overallPercent: number;
  totalWorksheets: number;
  totalCompleted: number;
  subjects: SubjectProgress[];
}

export default function StudentDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then((d) => setData(d))
      .finally(() => setLoading(false));
  }, []);

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
      <div className="mb-8">
        <h1 className="text-2xl font-bold" style={{ color: "var(--text)" }}>
          Dashboard
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-2)" }}>
          Welcome back! Here is your learning overview.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--muted)" }}>
              Overall Progress
            </p>
          </CardHeader>
          <CardBody>
            <p className="text-3xl font-bold mb-4" style={{ color: "var(--text)" }}>
              {data.overallPercent}%
            </p>
            <ProgressBar value={data.overallPercent} label="Worksheet completion" />
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
              {data.totalCompleted}
            </p>
            <p className="text-sm" style={{ color: "var(--text-2)" }}>
              of {data.totalWorksheets} total
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
              {data.subjects.length}
            </p>
            <p className="text-sm" style={{ color: "var(--text-2)" }}>
              across all grades
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
          {data.subjects.length === 0 ? (
            <p className="text-sm text-center py-4" style={{ color: "var(--muted)" }}>
              No subjects available yet.
            </p>
          ) : (
            data.subjects.map((s) => (
              <div key={s.id}>
                <ProgressBar
                  value={s.completed}
                  max={s.total || 1}
                  label={`${s.name} (${s.gradeName})`}
                />
                <p className="text-[11px] mt-0.5" style={{ color: "var(--muted)" }}>
                  {s.completed} / {s.total} completed
                </p>
              </div>
            ))
          )}
        </CardBody>
      </Card>
    </>
  );
}

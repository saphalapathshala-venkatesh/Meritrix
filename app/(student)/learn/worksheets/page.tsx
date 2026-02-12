"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "../../../_components/Card";

interface Grade {
  id: string;
  name: string;
  sortOrder: number;
}

interface Subject {
  id: string;
  name: string;
  slug: string;
  price: number;
}

export default function WorksheetsPage() {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedGrade, setSelectedGrade] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingSubjects, setLoadingSubjects] = useState(false);

  useEffect(() => {
    fetch("/api/worksheets/grades")
      .then((r) => r.json())
      .then((d) => {
        setGrades(d.grades || []);
        if (d.grades?.length) {
          setSelectedGrade(d.grades[0].id);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedGrade) return;
    setLoadingSubjects(true);
    fetch(`/api/worksheets/subjects?gradeId=${selectedGrade}`)
      .then((r) => r.json())
      .then((d) => setSubjects(d.subjects || []))
      .finally(() => setLoadingSubjects(false));
  }, [selectedGrade]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-sm" style={{ color: "var(--muted)" }}>Loading...</p>
      </div>
    );
  }

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold" style={{ color: "var(--text)" }}>
          Worksheets
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-2)" }}>
          Select your grade, then pick a subject to explore chapters and worksheets.
        </p>
      </div>

      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--muted)" }}>
          Grade
        </p>
        <div className="flex flex-wrap gap-2">
          {grades.map((g) => (
            <button
              key={g.id}
              onClick={() => setSelectedGrade(g.id)}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer"
              style={{
                backgroundColor: selectedGrade === g.id ? "var(--primary)" : "var(--primary-soft)",
                color: selectedGrade === g.id ? "var(--on-primary)" : "var(--primary)",
                border: `1px solid ${selectedGrade === g.id ? "var(--primary)" : "var(--border)"}`,
              }}
            >
              {g.name}
            </button>
          ))}
        </div>
      </div>

      {loadingSubjects ? (
        <div className="flex items-center justify-center py-10">
          <p className="text-sm" style={{ color: "var(--muted)" }}>Loading subjects...</p>
        </div>
      ) : subjects.length === 0 ? (
        <Card>
          <p className="text-sm text-center py-4" style={{ color: "var(--muted)" }}>
            No subjects found for this grade.
          </p>
        </Card>
      ) : (
        <>
          <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--muted)" }}>
            Subjects
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {subjects.map((s) => (
              <Link key={s.id} href={`/learn/worksheets/${s.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-semibold" style={{ color: "var(--text)" }}>
                        {s.name}
                      </h3>
                      <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>
                        {s.price === 0 ? "Free" : `₹${s.price}`}
                      </p>
                    </div>
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: "var(--primary-soft)" }}
                    >
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M6 3l5 5-5 5" stroke="var(--primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </>
      )}
    </>
  );
}

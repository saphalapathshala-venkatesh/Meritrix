"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardHeader, CardBody } from "../../_components/Card";

interface Stats {
  totalUsers: number;
  totalStudents: number;
  totalWorksheets: number;
  totalSubjects: number;
  totalPackages: number;
  totalCoupons: number;
}

const quickLinks = [
  { title: "Users", description: "Manage accounts, block or reset passwords", href: "/admin/users", icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
  { title: "Content", description: "Grades, subjects, chapters, and worksheets", href: "/admin/content", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
  { title: "Packages", description: "Bundle subjects into packages", href: "/admin/packages", icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" },
  { title: "Coupons", description: "Create and manage discount codes", href: "/admin/coupons", icon: "M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" },
];

export default function AdminPage() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then((d) => setStats(d))
      .catch(() => {});
  }, []);

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold" style={{ color: "var(--text)" }}>
          Admin Dashboard
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-2)" }}>
          Manage your platform content and users.
        </p>
      </div>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          {[
            { label: "Total Users", value: stats.totalUsers },
            { label: "Students", value: stats.totalStudents },
            { label: "Published Worksheets", value: stats.totalWorksheets },
            { label: "Subjects", value: stats.totalSubjects },
            { label: "Packages", value: stats.totalPackages },
            { label: "Coupons", value: stats.totalCoupons },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-xl px-4 py-3"
              style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)" }}
            >
              <p className="text-[11px] font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--muted)" }}>
                {s.label}
              </p>
              <p className="text-xl font-bold" style={{ color: "var(--text)" }}>
                {s.value}
              </p>
            </div>
          ))}
        </div>
      )}

      <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--muted)" }}>
        Quick Access
      </p>
      <div className="grid md:grid-cols-2 gap-4">
        {quickLinks.map((l) => (
          <Link key={l.title} href={l.href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: "var(--primary-soft)" }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d={l.icon} />
                    </svg>
                  </div>
                  <p className="text-sm font-semibold" style={{ color: "var(--text)" }}>
                    {l.title}
                  </p>
                </div>
              </CardHeader>
              <CardBody>
                <p className="text-sm" style={{ color: "var(--text-2)" }}>{l.description}</p>
              </CardBody>
            </Card>
          </Link>
        ))}
      </div>
    </>
  );
}

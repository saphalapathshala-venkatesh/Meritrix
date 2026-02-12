"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Button from "../../../_components/Button";
import Modal from "../../../_components/Modal";
import { Card, CardBody } from "../../../_components/Card";
import { useToast } from "../../../_components/Toast";
import Input from "../../../_components/Input";

interface Package {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  mrp: number;
  salePrice: number;
  isActive: boolean;
  subjectIds: string[];
  purchaseCount: number;
}

interface Subject {
  id: string;
  name: string;
  grade?: { name: string };
}

export default function PackagesPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [packages, setPackages] = useState<Package[]>([]);
  const [allSubjects, setAllSubjects] = useState<Subject[]>([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [editId, setEditId] = useState("");
  const [saving, setSaving] = useState(false);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    price: 0,
    mrp: 0,
    salePrice: 0,
    isActive: true,
    subjectIds: [] as string[],
  });

  const fetchPackages = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/packages");
      if (res.ok) setPackages(await res.json());
      else toast("Failed to load packages", "error");
    } catch {
      toast("Failed to load packages", "error");
    }
    setLoading(false);
  }, [toast]);

  const fetchSubjects = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/subjects");
      if (res.ok) setAllSubjects(await res.json());
    } catch {}
  }, []);

  useEffect(() => {
    fetchPackages();
    fetchSubjects();
  }, [fetchPackages, fetchSubjects]);

  const openAdd = () => {
    setModalMode("add");
    setEditId("");
    setForm({ name: "", slug: "", description: "", price: 0, mrp: 0, salePrice: 0, isActive: true, subjectIds: [] });
    setModalOpen(true);
  };

  const openEdit = (pkg: Package) => {
    setModalMode("edit");
    setEditId(pkg.id);
    setForm({
      name: pkg.name,
      slug: pkg.slug,
      description: pkg.description || "",
      price: pkg.price,
      mrp: pkg.mrp || 0,
      salePrice: pkg.salePrice || pkg.price,
      isActive: pkg.isActive,
      subjectIds: pkg.subjectIds || [],
    });
    setModalOpen(true);
  };

  const openDelete = (id: string, name: string) => {
    setDeleteTarget({ id, name });
    setDeleteModalOpen(true);
  };

  const toggleSubject = (id: string) => {
    setForm((f) => ({
      ...f,
      subjectIds: f.subjectIds.includes(id)
        ? f.subjectIds.filter((s) => s !== id)
        : [...f.subjectIds, id],
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const method = modalMode === "add" ? "POST" : "PUT";
      const body: Record<string, unknown> = {
        name: form.name,
        slug: form.slug,
        description: form.description || null,
        price: Number(form.price),
        mrp: Number(form.mrp),
        salePrice: Number(form.salePrice),
        isActive: form.isActive,
        subjectIds: form.subjectIds,
      };
      if (modalMode === "edit") body.id = editId;

      const res = await fetch("/api/admin/packages", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        toast(`Package ${modalMode === "add" ? "created" : "updated"} successfully`, "success");
        setModalOpen(false);
        fetchPackages();
      } else {
        const err = await res.json();
        toast(err.error || "Save failed", "error");
      }
    } catch {
      toast("Save failed", "error");
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/packages", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: deleteTarget.id }),
      });
      if (res.ok) {
        toast("Package deleted successfully", "success");
        setDeleteModalOpen(false);
        setDeleteTarget(null);
        fetchPackages();
      } else {
        const err = await res.json();
        toast(err.error || "Delete failed", "error");
      }
    } catch {
      toast("Delete failed", "error");
    }
    setSaving(false);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Link
          href="/admin"
          className="text-sm font-medium inline-flex items-center gap-1 mb-4"
          style={{ color: "var(--primary)" }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M10 12L6 8l4-4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Back to Admin
        </Link>
        <h1 className="text-2xl font-bold" style={{ color: "var(--text)" }}>
          Packages
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
          Manage bundles of subjects offered to students
        </p>
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold" style={{ color: "var(--text)" }}>
          All Packages
        </h2>
        <Button variant="primary" onClick={openAdd}>
          Add Package
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <svg
            className="animate-spin h-6 w-6"
            viewBox="0 0 24 24"
            fill="none"
            style={{ color: "var(--primary)" }}
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
          <span className="ml-2 text-sm" style={{ color: "var(--muted)" }}>Loading…</span>
        </div>
      ) : packages.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            No packages yet. Click &quot;Add Package&quot; to create one.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {packages.map((pkg) => (
            <Card key={pkg.id}>
              <CardBody>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold" style={{ color: "var(--text)" }}>
                        {pkg.name}
                      </p>
                      <span
                        className="text-xs px-2 py-0.5 rounded-full font-medium"
                        style={{
                          backgroundColor: pkg.isActive ? "#D1FAE5" : "#FEE2E2",
                          color: pkg.isActive ? "#065F46" : "#991B1B",
                        }}
                      >
                        {pkg.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                      <span className="text-xs" style={{ color: "var(--muted)" }}>
                        Slug: {pkg.slug}
                      </span>
                      <span className="text-xs font-medium" style={{ color: "var(--primary)" }}>
                        Sale: ₹{pkg.salePrice || pkg.price}
                      </span>
                      {pkg.mrp > 0 && (
                        <span className="text-xs" style={{ color: "var(--muted)" }}>
                          MRP: ₹{pkg.mrp}
                        </span>
                      )}
                      <span className="text-xs" style={{ color: "var(--muted)" }}>
                        {pkg.purchaseCount} purchase{pkg.purchaseCount !== 1 ? "s" : ""}
                      </span>
                    </div>
                    {pkg.description && (
                      <p className="text-xs mt-1.5 line-clamp-2" style={{ color: "var(--text-2)" }}>
                        {pkg.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button variant="ghost" className="text-xs px-3 py-1.5" onClick={() => openEdit(pkg)}>
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      className="text-xs px-3 py-1.5"
                      style={{ color: "#EF4444" }}
                      onClick={() => openDelete(pkg.id, pkg.name)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={`${modalMode === "add" ? "Add" : "Edit"} Package`}>
        <div className="flex flex-col gap-4">
          <Input
            label="Name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="e.g. Complete Math Bundle"
            required
          />
          <Input
            label="Slug"
            value={form.slug}
            onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
            placeholder="e.g. complete-math-bundle"
            required
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium" style={{ color: "var(--text)" }}>
              Description
            </label>
            <textarea
              className="rounded-lg px-3.5 py-2.5 text-sm transition-colors resize-none"
              style={{
                backgroundColor: "var(--surface)",
                border: "1px solid var(--border)",
                color: "var(--text)",
                outlineColor: "var(--ring)",
              }}
              rows={3}
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Optional description"
            />
          </div>
          <Input
            label="MRP (₹)"
            type="number"
            value={form.mrp}
            onChange={(e) => setForm((f) => ({ ...f, mrp: Number(e.target.value) }))}
            hint="Original price before discount. Leave 0 to auto-compute."
          />
          <Input
            label="Sale Price (₹)"
            type="number"
            value={form.salePrice}
            onChange={(e) => setForm((f) => ({ ...f, salePrice: Number(e.target.value) }))}
            hint="Current selling price. If 0, uses legacy price field."
            required
          />
          <Input
            label="Legacy Price (₹)"
            type="number"
            value={form.price}
            onChange={(e) => setForm((f) => ({ ...f, price: Number(e.target.value) }))}
            hint="Kept for backward compatibility."
          />
          <label className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: "var(--text)" }}>
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
            />
            Active
          </label>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium" style={{ color: "var(--text)" }}>
              Subjects
            </label>
            <div
              className="rounded-lg p-3 flex flex-col gap-2 max-h-48 overflow-y-auto"
              style={{
                backgroundColor: "var(--surface)",
                border: "1px solid var(--border)",
              }}
            >
              {allSubjects.length === 0 ? (
                <p className="text-xs" style={{ color: "var(--muted)" }}>No subjects available</p>
              ) : (
                allSubjects.map((subj) => (
                  <label
                    key={subj.id}
                    className="flex items-center gap-2 text-sm cursor-pointer"
                    style={{ color: "var(--text)" }}
                  >
                    <input
                      type="checkbox"
                      checked={form.subjectIds.includes(subj.id)}
                      onChange={() => toggleSubject(subj.id)}
                    />
                    <span>{subj.name}</span>
                    {subj.grade && (
                      <span className="text-xs" style={{ color: "var(--muted)" }}>
                        ({subj.grade.name})
                      </span>
                    )}
                  </label>
                ))
              )}
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-2">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSave} loading={saving}>
              {modalMode === "add" ? "Create" : "Update"}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal open={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} title="Confirm Delete">
        <div className="flex flex-col gap-4">
          <p className="text-sm" style={{ color: "var(--text-2)" }}>
            Are you sure you want to delete{" "}
            <strong style={{ color: "var(--text)" }}>{deleteTarget?.name}</strong>? This action cannot be
            undone.
          </p>
          <div className="flex justify-end gap-3 mt-2">
            <Button variant="secondary" onClick={() => setDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              style={{ backgroundColor: "#EF4444" }}
              onClick={handleDelete}
              loading={saving}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

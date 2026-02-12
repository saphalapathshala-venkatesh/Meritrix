"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Button from "../../../_components/Button";
import Modal from "../../../_components/Modal";
import { Card, CardBody } from "../../../_components/Card";
import { useToast } from "../../../_components/Toast";
import Input from "../../../_components/Input";
import { formatMoney } from "../../../../lib/utils/format-money";

interface Coupon {
  id: string;
  code: string;
  discountPercent: number;
  maxUses: number | null;
  usageCount: number;
  minAmount: number;
  expiresAt: string | null;
  isActive: boolean;
  createdAt: string;
}

export default function CouponsPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [coupons, setCoupons] = useState<Coupon[]>([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [editId, setEditId] = useState("");
  const [saving, setSaving] = useState(false);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; code: string } | null>(null);

  const [form, setForm] = useState({
    code: "",
    discountPercent: "",
    maxUses: "",
    minAmount: "0",
    expiresAt: "",
    isActive: true,
  });

  const fetchCoupons = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/coupons");
      if (res.ok) setCoupons(await res.json());
      else toast("Failed to load coupons", "error");
    } catch {
      toast("Failed to load coupons", "error");
    }
    setLoading(false);
  }, [toast]);

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  const openAdd = () => {
    setModalMode("add");
    setEditId("");
    setForm({ code: "", discountPercent: "", maxUses: "", minAmount: "0", expiresAt: "", isActive: true });
    setModalOpen(true);
  };

  const openEdit = (coupon: Coupon) => {
    setModalMode("edit");
    setEditId(coupon.id);
    setForm({
      code: coupon.code,
      discountPercent: String(coupon.discountPercent),
      maxUses: coupon.maxUses !== null ? String(coupon.maxUses) : "",
      minAmount: String(coupon.minAmount),
      expiresAt: coupon.expiresAt ? new Date(coupon.expiresAt).toISOString().split("T")[0] : "",
      isActive: coupon.isActive,
    });
    setModalOpen(true);
  };

  const openDelete = (id: string, code: string) => {
    setDeleteTarget({ id, code });
    setDeleteModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.code.trim()) {
      toast("Coupon code is required", "error");
      return;
    }
    const discountNum = Number(form.discountPercent);
    if (!discountNum || discountNum < 1 || discountNum > 100) {
      toast("Discount must be between 1 and 100", "error");
      return;
    }

    setSaving(true);
    try {
      const method = modalMode === "add" ? "POST" : "PUT";
      const body: Record<string, unknown> = {
        code: form.code.toUpperCase().trim(),
        discountPercent: discountNum,
        maxUses: form.maxUses ? Number(form.maxUses) : null,
        minAmount: Number(form.minAmount) || 0,
        expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : null,
        isActive: form.isActive,
      };
      if (modalMode === "edit") body.id = editId;

      const res = await fetch("/api/admin/coupons", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        toast(`Coupon ${modalMode === "add" ? "created" : "updated"} successfully`, "success");
        setModalOpen(false);
        fetchCoupons();
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
      const res = await fetch("/api/admin/coupons", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: deleteTarget.id }),
      });
      if (res.ok) {
        toast("Coupon deleted successfully", "success");
        setDeleteModalOpen(false);
        setDeleteTarget(null);
        fetchCoupons();
      } else {
        const err = await res.json();
        toast(err.error || "Delete failed", "error");
      }
    } catch {
      toast("Delete failed", "error");
    }
    setSaving(false);
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "No expiry";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
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
          Coupons
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
          Manage discount coupons for students
        </p>
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold" style={{ color: "var(--text)" }}>
          All Coupons
        </h2>
        <Button variant="primary" onClick={openAdd}>
          Add Coupon
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
      ) : coupons.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            No coupons yet. Click &quot;Add Coupon&quot; to create one.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {coupons.map((coupon) => (
            <Card key={coupon.id}>
              <CardBody>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className="text-sm font-mono font-semibold px-2 py-0.5 rounded"
                        style={{
                          color: "var(--text)",
                          backgroundColor: "var(--primary-soft)",
                        }}
                      >
                        {coupon.code}
                      </span>
                      <span className="text-sm font-bold" style={{ color: "var(--primary)" }}>
                        {coupon.discountPercent}% off
                      </span>
                      <span
                        className="text-xs px-2 py-0.5 rounded-full font-medium"
                        style={{
                          backgroundColor: coupon.isActive ? "#D1FAE5" : "#FEE2E2",
                          color: coupon.isActive ? "#065F46" : "#991B1B",
                        }}
                      >
                        {coupon.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                      <span className="text-xs" style={{ color: "var(--muted)" }}>
                        {coupon.usageCount} / {coupon.maxUses !== null ? coupon.maxUses : "∞"} used
                      </span>
                      <span className="text-xs" style={{ color: "var(--muted)" }}>
                        Min: {formatMoney(coupon.minAmount)}
                      </span>
                      <span className="text-xs" style={{ color: "var(--muted)" }}>
                        Expires: {formatDate(coupon.expiresAt)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button variant="ghost" className="text-xs px-3 py-1.5" onClick={() => openEdit(coupon)}>
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      className="text-xs px-3 py-1.5"
                      style={{ color: "#EF4444" }}
                      onClick={() => openDelete(coupon.id, coupon.code)}
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

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={`${modalMode === "add" ? "Add" : "Edit"} Coupon`}>
        <div className="flex flex-col gap-4">
          <Input
            label="Coupon Code"
            value={form.code}
            onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
            placeholder="e.g. SAVE20"
            required
            style={{ textTransform: "uppercase", fontFamily: "monospace" }}
          />
          <Input
            label="Discount Percent"
            type="number"
            min={1}
            max={100}
            value={form.discountPercent}
            onChange={(e) => setForm((f) => ({ ...f, discountPercent: e.target.value }))}
            placeholder="e.g. 20"
            hint="Value between 1 and 100"
            required
          />
          <Input
            label="Max Uses"
            type="number"
            min={1}
            value={form.maxUses}
            onChange={(e) => setForm((f) => ({ ...f, maxUses: e.target.value }))}
            placeholder="Leave blank for unlimited"
            hint="Leave empty for unlimited uses"
          />
          <Input
            label="Minimum Amount (CAD)"
            type="number"
            min={0}
            value={form.minAmount}
            onChange={(e) => setForm((f) => ({ ...f, minAmount: e.target.value }))}
            placeholder="0"
            required
          />
          <Input
            label="Expires At"
            type="date"
            value={form.expiresAt}
            onChange={(e) => setForm((f) => ({ ...f, expiresAt: e.target.value }))}
            hint="Leave empty for no expiry"
          />
          <label className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: "var(--text)" }}>
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
            />
            Active
          </label>
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
            Are you sure you want to delete coupon{" "}
            <strong className="font-mono" style={{ color: "var(--text)" }}>{deleteTarget?.code}</strong>? This action cannot be
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

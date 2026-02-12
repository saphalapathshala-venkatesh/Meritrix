"use client";

import { useEffect, useState } from "react";
import { Card } from "../../../_components/Card";
import Button from "../../../_components/Button";
import Input from "../../../_components/Input";

interface PassProduct {
  id: string;
  passType: string;
  title: string;
  subtitle: string | null;
  totalCredits: number;
  durationMins: number;
  currency: string;
  mrpCents: number;
  priceCents: number;
  isActive: boolean;
  termsVersion: string;
}

export default function AdminPassesPage() {
  const [products, setProducts] = useState<PassProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [editForm, setEditForm] = useState<Partial<PassProduct> & { id?: string }>({});

  useEffect(() => {
    fetch("/api/admin/passes")
      .then((r) => r.json())
      .then((d) => {
        setProducts(d.products || []);
        if (d.products?.length > 0) {
          setEditForm(d.products[0]);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    if (!editForm.id) return;
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/passes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update", ...editForm }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ type: "success", text: "Pass product updated." });
        setProducts((prev) =>
          prev.map((p) => (p.id === data.product.id ? data.product : p))
        );
        setEditForm(data.product);
      } else {
        setMessage({ type: "error", text: data.error || "Failed to update." });
      }
    } catch {
      setMessage({ type: "error", text: "Something went wrong." });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-sm" style={{ color: "var(--muted)" }}>Loading...</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-sm" style={{ color: "var(--muted)" }}>
          No pass products found. Run the seed to create the default Vedic Maths pass.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold" style={{ color: "var(--text)" }}>
          Live Pass Products
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-2)" }}>
          Manage session pass products. Students purchase these to book live sessions.
        </p>
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

      <Card>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-base font-semibold" style={{ color: "var(--text)" }}>
              {editForm.title || "Vedic Maths Pass"}
            </h2>
            <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>
              Type: {editForm.passType}
            </p>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <span className="text-xs font-medium" style={{ color: "var(--text-2)" }}>
              Active
            </span>
            <button
              onClick={() => setEditForm((f) => ({ ...f, isActive: !f.isActive }))}
              className="relative w-10 h-5 rounded-full transition-colors cursor-pointer"
              style={{
                backgroundColor: editForm.isActive ? "var(--primary)" : "var(--border)",
              }}
            >
              <span
                className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform"
                style={{
                  transform: editForm.isActive ? "translateX(20px)" : "translateX(0)",
                }}
              />
            </button>
          </label>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          <Input
            label="Title"
            value={editForm.title || ""}
            onChange={(e) => setEditForm((f) => ({ ...f, title: e.target.value }))}
          />
          <Input
            label="Subtitle"
            value={editForm.subtitle || ""}
            onChange={(e) => setEditForm((f) => ({ ...f, subtitle: e.target.value }))}
          />
        </div>

        <div className="grid sm:grid-cols-3 gap-4 mb-4">
          <Input
            label="Total Sessions (Credits)"
            type="number"
            value={String(editForm.totalCredits || "")}
            onChange={(e) => setEditForm((f) => ({ ...f, totalCredits: Number(e.target.value) }))}
          />
          <Input
            label="MRP (CAD cents)"
            type="number"
            value={String(editForm.mrpCents || "")}
            onChange={(e) => setEditForm((f) => ({ ...f, mrpCents: Number(e.target.value) }))}
            hint={editForm.mrpCents ? `= $${(editForm.mrpCents / 100).toFixed(2)} CAD` : ""}
          />
          <Input
            label="Price (CAD cents)"
            type="number"
            value={String(editForm.priceCents || "")}
            onChange={(e) => setEditForm((f) => ({ ...f, priceCents: Number(e.target.value) }))}
            hint={editForm.priceCents ? `= $${(editForm.priceCents / 100).toFixed(2)} CAD` : ""}
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-4 mb-6">
          <Input
            label="Duration per Session (minutes)"
            type="number"
            value={String(editForm.durationMins || 30)}
            onChange={(e) => setEditForm((f) => ({ ...f, durationMins: Number(e.target.value) }))}
          />
          <Input
            label="Terms Version"
            value={editForm.termsVersion || "v1"}
            onChange={(e) => setEditForm((f) => ({ ...f, termsVersion: e.target.value }))}
          />
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSave} loading={saving}>
            Save Changes
          </Button>
        </div>
      </Card>
    </>
  );
}

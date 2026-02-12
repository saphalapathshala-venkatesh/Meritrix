"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Button from "../../../_components/Button";
import Modal from "../../../_components/Modal";
import { Card, CardBody } from "../../../_components/Card";
import { useToast } from "../../../_components/Toast";
import Input from "../../../_components/Input";

type View = "grades" | "subjects" | "chapters" | "worksheets";

interface Grade { id: string; name: string; sortOrder: number; }
interface Subject { id: string; gradeId: string; name: string; slug: string; price: number; mrp: number; salePrice: number; sortOrder: number; }
interface Chapter { id: string; subjectId: string; name: string; slug: string; sortOrder: number; }
interface Worksheet { id: string; chapterId: string; title: string; slug: string; tier: string; isFree: boolean; isPublished: boolean; pdfUrl?: string | null; answerUrl?: string | null; sortOrder: number; }

export default function ContentPage() {
  const { toast } = useToast();
  const [view, setView] = useState<View>("grades");
  const [loading, setLoading] = useState(false);

  const [grades, setGrades] = useState<Grade[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [worksheets, setWorksheets] = useState<Worksheet[]>([]);

  const [selectedGrade, setSelectedGrade] = useState<Grade | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [saving, setSaving] = useState(false);

  const [formGrade, setFormGrade] = useState({ name: "", sortOrder: 0 });
  const [formSubject, setFormSubject] = useState({ name: "", slug: "", price: 0, mrp: 0, salePrice: 0, sortOrder: 0 });
  const [formChapter, setFormChapter] = useState({ name: "", slug: "", sortOrder: 0 });
  const [formWorksheet, setFormWorksheet] = useState({ title: "", slug: "", tier: "foundational", isFree: false, isPublished: false, pdfUrl: "", answerUrl: "", sortOrder: 0 });
  const [editId, setEditId] = useState("");

  const fetchGrades = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/grades");
      if (res.ok) setGrades(await res.json());
      else toast("Failed to load grades", "error");
    } catch { toast("Failed to load grades", "error"); }
    setLoading(false);
  }, [toast]);

  const fetchSubjects = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/subjects");
      if (res.ok) {
        const all: Subject[] = await res.json();
        setSubjects(all.filter(s => s.gradeId === selectedGrade?.id));
      } else toast("Failed to load subjects", "error");
    } catch { toast("Failed to load subjects", "error"); }
    setLoading(false);
  }, [toast, selectedGrade]);

  const fetchChapters = useCallback(async () => {
    if (!selectedSubject) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/chapters?subjectId=${selectedSubject.id}`);
      if (res.ok) setChapters(await res.json());
      else toast("Failed to load chapters", "error");
    } catch { toast("Failed to load chapters", "error"); }
    setLoading(false);
  }, [toast, selectedSubject]);

  const fetchWorksheets = useCallback(async () => {
    if (!selectedChapter) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/worksheets?chapterId=${selectedChapter.id}`);
      if (res.ok) setWorksheets(await res.json());
      else toast("Failed to load worksheets", "error");
    } catch { toast("Failed to load worksheets", "error"); }
    setLoading(false);
  }, [toast, selectedChapter]);

  useEffect(() => {
    if (view === "grades") fetchGrades();
    else if (view === "subjects") fetchSubjects();
    else if (view === "chapters") fetchChapters();
    else if (view === "worksheets") fetchWorksheets();
  }, [view, fetchGrades, fetchSubjects, fetchChapters, fetchWorksheets]);

  const openAdd = () => {
    setModalMode("add");
    setEditId("");
    if (view === "grades") setFormGrade({ name: "", sortOrder: 0 });
    else if (view === "subjects") setFormSubject({ name: "", slug: "", price: 0, mrp: 0, salePrice: 0, sortOrder: 0 });
    else if (view === "chapters") setFormChapter({ name: "", slug: "", sortOrder: 0 });
    else setFormWorksheet({ title: "", slug: "", tier: "foundational", isFree: false, isPublished: false, pdfUrl: "", answerUrl: "", sortOrder: 0 });
    setModalOpen(true);
  };

  const openEditGrade = (g: Grade) => {
    setModalMode("edit"); setEditId(g.id);
    setFormGrade({ name: g.name, sortOrder: g.sortOrder });
    setModalOpen(true);
  };
  const openEditSubject = (s: Subject) => {
    setModalMode("edit"); setEditId(s.id);
    setFormSubject({ name: s.name, slug: s.slug, price: s.price, mrp: s.mrp || 0, salePrice: s.salePrice || s.price, sortOrder: s.sortOrder });
    setModalOpen(true);
  };
  const openEditChapter = (c: Chapter) => {
    setModalMode("edit"); setEditId(c.id);
    setFormChapter({ name: c.name, slug: c.slug, sortOrder: c.sortOrder });
    setModalOpen(true);
  };
  const openEditWorksheet = (w: Worksheet) => {
    setModalMode("edit"); setEditId(w.id);
    setFormWorksheet({ title: w.title, slug: w.slug, tier: w.tier, isFree: w.isFree, isPublished: w.isPublished, pdfUrl: w.pdfUrl || "", answerUrl: w.answerUrl || "", sortOrder: w.sortOrder });
    setModalOpen(true);
  };

  const openDelete = (id: string, name: string) => {
    setDeleteTarget({ id, name });
    setDeleteModalOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      let url = "";
      let body: Record<string, unknown> = {};
      const method = modalMode === "add" ? "POST" : "PUT";

      if (view === "grades") {
        url = "/api/admin/grades";
        body = { ...formGrade, sortOrder: Number(formGrade.sortOrder) };
        if (modalMode === "edit") body.id = editId;
      } else if (view === "subjects") {
        url = "/api/admin/subjects";
        body = { ...formSubject, price: Number(formSubject.price), mrp: Number(formSubject.mrp), salePrice: Number(formSubject.salePrice), sortOrder: Number(formSubject.sortOrder), gradeId: selectedGrade!.id };
        if (modalMode === "edit") body.id = editId;
      } else if (view === "chapters") {
        url = "/api/admin/chapters";
        body = { ...formChapter, sortOrder: Number(formChapter.sortOrder), subjectId: selectedSubject!.id };
        if (modalMode === "edit") body.id = editId;
      } else {
        url = "/api/admin/worksheets";
        body = { ...formWorksheet, sortOrder: Number(formWorksheet.sortOrder), chapterId: selectedChapter!.id, pdfUrl: formWorksheet.pdfUrl || null, answerUrl: formWorksheet.answerUrl || null };
        if (modalMode === "edit") body.id = editId;
      }

      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (res.ok) {
        toast(`${modalMode === "add" ? "Created" : "Updated"} successfully`, "success");
        setModalOpen(false);
        if (view === "grades") fetchGrades();
        else if (view === "subjects") fetchSubjects();
        else if (view === "chapters") fetchChapters();
        else fetchWorksheets();
      } else {
        const err = await res.json();
        toast(err.error || "Save failed", "error");
      }
    } catch { toast("Save failed", "error"); }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setSaving(true);
    try {
      let url = "";
      if (view === "grades") url = "/api/admin/grades";
      else if (view === "subjects") url = "/api/admin/subjects";
      else if (view === "chapters") url = "/api/admin/chapters";
      else url = "/api/admin/worksheets";

      const res = await fetch(url, { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: deleteTarget.id }) });
      if (res.ok) {
        toast("Deleted successfully", "success");
        setDeleteModalOpen(false);
        setDeleteTarget(null);
        if (view === "grades") fetchGrades();
        else if (view === "subjects") fetchSubjects();
        else if (view === "chapters") fetchChapters();
        else fetchWorksheets();
      } else {
        const err = await res.json();
        toast(err.error || "Delete failed", "error");
      }
    } catch { toast("Delete failed", "error"); }
    setSaving(false);
  };

  const drillIntoGrade = (g: Grade) => { setSelectedGrade(g); setView("subjects"); };
  const drillIntoSubject = (s: Subject) => { setSelectedSubject(s); setView("chapters"); };
  const drillIntoChapter = (c: Chapter) => { setSelectedChapter(c); setView("worksheets"); };

  const tierLabel = (t: string) => t === "skill_builder" ? "Skill Builder" : t.charAt(0).toUpperCase() + t.slice(1);
  const tierColor = (t: string) => {
    if (t === "foundational") return { bg: "#DBEAFE", color: "#1E40AF" };
    if (t === "skill_builder") return { bg: "#FEF3C7", color: "#92400E" };
    return { bg: "#E0E7FF", color: "#3730A3" };
  };

  const addBtnLabel = view === "grades" ? "Add Grade" : view === "subjects" ? "Add Subject" : view === "chapters" ? "Add Chapter" : "Add Worksheet";
  const modalTitle = `${modalMode === "add" ? "Add" : "Edit"} ${view === "grades" ? "Grade" : view === "subjects" ? "Subject" : view === "chapters" ? "Chapter" : "Worksheet"}`;

  const selectStyle: React.CSSProperties = {
    backgroundColor: "var(--surface)",
    border: "1px solid var(--border)",
    color: "var(--text)",
    outlineColor: "var(--ring)",
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/admin" className="text-sm font-medium inline-flex items-center gap-1 mb-4" style={{ color: "var(--primary)" }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          Back to Admin
        </Link>
        <h1 className="text-2xl font-bold" style={{ color: "var(--text)" }}>Content Management</h1>
        <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>Manage grades, subjects, chapters, and worksheets</p>
      </div>

      <div className="flex items-center gap-2 mb-6 text-sm" style={{ color: "var(--muted)" }}>
        <button onClick={() => setView("grades")} className="cursor-pointer hover:underline font-medium" style={{ color: view === "grades" ? "var(--text)" : "var(--primary)" }}>Content</button>
        {selectedGrade && view !== "grades" && (
          <>
            <span>/</span>
            <button onClick={() => setView("subjects")} className="cursor-pointer hover:underline font-medium" style={{ color: view === "subjects" ? "var(--text)" : "var(--primary)" }}>{selectedGrade.name}</button>
          </>
        )}
        {selectedSubject && (view === "chapters" || view === "worksheets") && (
          <>
            <span>/</span>
            <button onClick={() => setView("chapters")} className="cursor-pointer hover:underline font-medium" style={{ color: view === "chapters" ? "var(--text)" : "var(--primary)" }}>{selectedSubject.name}</button>
          </>
        )}
        {selectedChapter && view === "worksheets" && (
          <>
            <span>/</span>
            <span className="font-medium" style={{ color: "var(--text)" }}>{selectedChapter.name}</span>
          </>
        )}
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold" style={{ color: "var(--text)" }}>
          {view === "grades" ? "Grades" : view === "subjects" ? "Subjects" : view === "chapters" ? "Chapters" : "Worksheets"}
        </h2>
        <Button variant="primary" onClick={openAdd}>{addBtnLabel}</Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24" fill="none" style={{ color: "var(--primary)" }}>
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
          </svg>
          <span className="ml-2 text-sm" style={{ color: "var(--muted)" }}>Loading…</span>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {view === "grades" && grades.map(g => (
            <Card key={g.id} className="cursor-pointer transition-shadow hover:shadow-md" style={{ cursor: "pointer" }}>
              <CardBody>
                <div className="flex items-center justify-between" onClick={() => drillIntoGrade(g)}>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: "var(--text)" }}>{g.name}</p>
                    <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>Sort Order: {g.sortOrder}</p>
                  </div>
                  <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                    <Button variant="ghost" className="text-xs px-3 py-1.5" onClick={() => openEditGrade(g)}>Edit</Button>
                    <Button variant="ghost" className="text-xs px-3 py-1.5" style={{ color: "#EF4444" }} onClick={() => openDelete(g.id, g.name)}>Delete</Button>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}

          {view === "subjects" && subjects.map(s => (
            <Card key={s.id} className="cursor-pointer transition-shadow hover:shadow-md">
              <CardBody>
                <div className="flex items-center justify-between" onClick={() => drillIntoSubject(s)}>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: "var(--text)" }}>{s.name}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs" style={{ color: "var(--muted)" }}>Slug: {s.slug}</span>
                      <span className="text-xs" style={{ color: "var(--muted)" }}>Sale: ₹{s.salePrice || s.price}</span>
                      {s.mrp > 0 && <span className="text-xs" style={{ color: "var(--muted)" }}>MRP: ₹{s.mrp}</span>}
                      <span className="text-xs" style={{ color: "var(--muted)" }}>Sort: {s.sortOrder}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                    <Button variant="ghost" className="text-xs px-3 py-1.5" onClick={() => openEditSubject(s)}>Edit</Button>
                    <Button variant="ghost" className="text-xs px-3 py-1.5" style={{ color: "#EF4444" }} onClick={() => openDelete(s.id, s.name)}>Delete</Button>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}

          {view === "chapters" && chapters.map(c => (
            <Card key={c.id} className="cursor-pointer transition-shadow hover:shadow-md">
              <CardBody>
                <div className="flex items-center justify-between" onClick={() => drillIntoChapter(c)}>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: "var(--text)" }}>{c.name}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs" style={{ color: "var(--muted)" }}>Slug: {c.slug}</span>
                      <span className="text-xs" style={{ color: "var(--muted)" }}>Sort: {c.sortOrder}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                    <Button variant="ghost" className="text-xs px-3 py-1.5" onClick={() => openEditChapter(c)}>Edit</Button>
                    <Button variant="ghost" className="text-xs px-3 py-1.5" style={{ color: "#EF4444" }} onClick={() => openDelete(c.id, c.name)}>Delete</Button>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}

          {view === "worksheets" && worksheets.map(w => (
            <Card key={w.id}>
              <CardBody>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold" style={{ color: "var(--text)" }}>{w.title}</p>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: tierColor(w.tier).bg, color: tierColor(w.tier).color }}>{tierLabel(w.tier)}</span>
                      {w.isFree && <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: "#D1FAE5", color: "#065F46" }}>Free</span>}
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: w.isPublished ? "#D1FAE5" : "#FEE2E2", color: w.isPublished ? "#065F46" : "#991B1B" }}>{w.isPublished ? "Published" : "Draft"}</span>
                      <span className="text-xs" style={{ color: "var(--muted)" }}>Sort: {w.sortOrder}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" className="text-xs px-3 py-1.5" onClick={() => openEditWorksheet(w)}>Edit</Button>
                    <Button variant="ghost" className="text-xs px-3 py-1.5" style={{ color: "#EF4444" }} onClick={() => openDelete(w.id, w.title)}>Delete</Button>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}

          {!loading && ((view === "grades" && grades.length === 0) || (view === "subjects" && subjects.length === 0) || (view === "chapters" && chapters.length === 0) || (view === "worksheets" && worksheets.length === 0)) && (
            <div className="text-center py-12">
              <p className="text-sm" style={{ color: "var(--muted)" }}>No items yet. Click "{addBtnLabel}" to create one.</p>
            </div>
          )}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={modalTitle}>
        <div className="flex flex-col gap-4">
          {view === "grades" && (
            <>
              <Input label="Name" value={formGrade.name} onChange={e => setFormGrade(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Grade 5" />
              <Input label="Sort Order" type="number" value={formGrade.sortOrder} onChange={e => setFormGrade(f => ({ ...f, sortOrder: Number(e.target.value) }))} />
            </>
          )}
          {view === "subjects" && (
            <>
              <Input label="Name" value={formSubject.name} onChange={e => setFormSubject(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Mathematics" />
              <Input label="Slug" value={formSubject.slug} onChange={e => setFormSubject(f => ({ ...f, slug: e.target.value }))} placeholder="e.g. mathematics" />
              <Input label="MRP (₹)" type="number" value={formSubject.mrp} onChange={e => setFormSubject(f => ({ ...f, mrp: Number(e.target.value) }))} hint="Original price before discount. Leave 0 to auto-compute." />
              <Input label="Sale Price (₹)" type="number" value={formSubject.salePrice} onChange={e => setFormSubject(f => ({ ...f, salePrice: Number(e.target.value) }))} hint="Current selling price. If 0, uses legacy price field." />
              <Input label="Legacy Price (₹)" type="number" value={formSubject.price} onChange={e => setFormSubject(f => ({ ...f, price: Number(e.target.value) }))} hint="Kept for backward compatibility." />
              <Input label="Sort Order" type="number" value={formSubject.sortOrder} onChange={e => setFormSubject(f => ({ ...f, sortOrder: Number(e.target.value) }))} />
            </>
          )}
          {view === "chapters" && (
            <>
              <Input label="Name" value={formChapter.name} onChange={e => setFormChapter(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Algebra Basics" />
              <Input label="Slug" value={formChapter.slug} onChange={e => setFormChapter(f => ({ ...f, slug: e.target.value }))} placeholder="e.g. algebra-basics" />
              <Input label="Sort Order" type="number" value={formChapter.sortOrder} onChange={e => setFormChapter(f => ({ ...f, sortOrder: Number(e.target.value) }))} />
            </>
          )}
          {view === "worksheets" && (
            <>
              <Input label="Title" value={formWorksheet.title} onChange={e => setFormWorksheet(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Practice Set 1" />
              <Input label="Slug" value={formWorksheet.slug} onChange={e => setFormWorksheet(f => ({ ...f, slug: e.target.value }))} placeholder="e.g. practice-set-1" />
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium" style={{ color: "var(--text)" }}>Tier</label>
                <select
                  className="rounded-lg px-3.5 py-2.5 text-sm transition-colors"
                  style={selectStyle}
                  value={formWorksheet.tier}
                  onChange={e => setFormWorksheet(f => ({ ...f, tier: e.target.value }))}
                >
                  <option value="foundational">Foundational</option>
                  <option value="skill_builder">Skill Builder</option>
                  <option value="mastery">Mastery</option>
                </select>
              </div>
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: "var(--text)" }}>
                  <input type="checkbox" checked={formWorksheet.isFree} onChange={e => setFormWorksheet(f => ({ ...f, isFree: e.target.checked }))} />
                  Free
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: "var(--text)" }}>
                  <input type="checkbox" checked={formWorksheet.isPublished} onChange={e => setFormWorksheet(f => ({ ...f, isPublished: e.target.checked }))} />
                  Published
                </label>
              </div>
              <Input label="PDF URL" value={formWorksheet.pdfUrl} onChange={e => setFormWorksheet(f => ({ ...f, pdfUrl: e.target.value }))} placeholder="Optional" />
              <Input label="Answer URL" value={formWorksheet.answerUrl} onChange={e => setFormWorksheet(f => ({ ...f, answerUrl: e.target.value }))} placeholder="Optional" />
              <Input label="Sort Order" type="number" value={formWorksheet.sortOrder} onChange={e => setFormWorksheet(f => ({ ...f, sortOrder: Number(e.target.value) }))} />
            </>
          )}
          <div className="flex justify-end gap-3 mt-2">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleSave} loading={saving}>{modalMode === "add" ? "Create" : "Update"}</Button>
          </div>
        </div>
      </Modal>

      <Modal open={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} title="Confirm Delete">
        <div className="flex flex-col gap-4">
          <p className="text-sm" style={{ color: "var(--text-2)" }}>
            Are you sure you want to delete <strong style={{ color: "var(--text)" }}>{deleteTarget?.name}</strong>? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3 mt-2">
            <Button variant="secondary" onClick={() => setDeleteModalOpen(false)}>Cancel</Button>
            <Button variant="primary" style={{ backgroundColor: "#EF4444" }} onClick={handleDelete} loading={saving}>Delete</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

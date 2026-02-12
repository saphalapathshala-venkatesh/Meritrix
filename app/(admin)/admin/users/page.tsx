"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Button from "../../../_components/Button";
import Modal from "../../../_components/Modal";
import { Card } from "../../../_components/Card";
import { useToast } from "../../../_components/Toast";
import Input from "../../../_components/Input";

interface User {
  id: string;
  name: string | null;
  email: string;
  role: string;
  isBlocked: boolean;
  createdAt: string;
}

export default function AdminUsersPage() {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const [deleteModal, setDeleteModal] = useState<User | null>(null);
  const [resetModal, setResetModal] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState("");

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const params = search ? `?search=${encodeURIComponent(search)}` : "";
      const res = await fetch(`/api/admin/users${params}`);
      if (!res.ok) throw new Error("Failed to fetch users");
      const data = await res.json();
      setUsers(data);
    } catch {
      toast("Failed to load users", "error");
    } finally {
      setLoading(false);
    }
  }, [search, toast]);

  useEffect(() => {
    const timeout = setTimeout(fetchUsers, 300);
    return () => clearTimeout(timeout);
  }, [fetchUsers]);

  async function handleBlock(user: User) {
    setActionLoading(user.id);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "block", userId: user.id, isBlocked: !user.isBlocked }),
      });
      if (!res.ok) throw new Error();
      toast(user.isBlocked ? "User unblocked" : "User blocked", "success");
      await fetchUsers();
    } catch {
      toast("Failed to update user status", "error");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleDelete() {
    if (!deleteModal) return;
    setActionLoading(deleteModal.id);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", userId: deleteModal.id }),
      });
      if (!res.ok) throw new Error();
      toast("User deleted", "success");
      setDeleteModal(null);
      await fetchUsers();
    } catch {
      toast("Failed to delete user", "error");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleResetPassword() {
    if (!resetModal) return;
    if (newPassword.length < 6) {
      toast("Password must be at least 6 characters", "error");
      return;
    }
    setActionLoading(resetModal.id);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reset-password", userId: resetModal.id, newPassword }),
      });
      if (!res.ok) throw new Error();
      toast("Password reset successfully", "success");
      setResetModal(null);
      setNewPassword("");
    } catch {
      toast("Failed to reset password", "error");
    } finally {
      setActionLoading(null);
    }
  }

  return (
    <div className="min-h-screen p-6 md:p-10 max-w-6xl mx-auto">
      <Link
        href="/admin"
        className="inline-flex items-center gap-1.5 text-sm font-medium mb-6 hover:opacity-80 transition-opacity"
        style={{ color: "var(--primary)" }}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Back to Admin
      </Link>

      <div className="mb-8">
        <h1 className="text-2xl font-bold" style={{ color: "var(--text)" }}>
          User Management
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
          Search, manage, and moderate user accounts
        </p>
      </div>

      <div className="mb-6 max-w-sm">
        <Input
          placeholder="Search by email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          type="search"
        />
      </div>

      <Card className="p-0" style={{ padding: 0 }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm" style={{ color: "var(--text)" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                {["Name", "Email", "Role", "Status", "Created", "Actions"].map((h) => (
                  <th
                    key={h}
                    className="text-xs font-semibold text-left px-4 py-3 whitespace-nowrap"
                    style={{ color: "var(--muted)" }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12">
                    <div className="flex items-center justify-center gap-2" style={{ color: "var(--muted)" }}>
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                      </svg>
                      Loading users…
                    </div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12" style={{ color: "var(--muted)" }}>
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr
                    key={user.id}
                    className="transition-colors"
                    style={{ borderBottom: "1px solid var(--border)" }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--primary-soft)")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                  >
                    <td className="px-4 py-3 whitespace-nowrap font-medium">
                      {user.name || "—"}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap" style={{ color: "var(--text-2)" }}>
                      {user.email}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold"
                        style={{
                          backgroundColor: user.role === "ADMIN" ? "var(--primary)" : "var(--primary-soft)",
                          color: user.role === "ADMIN" ? "var(--on-primary)" : "var(--primary)",
                        }}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className="inline-flex items-center gap-1 text-xs font-medium"
                        style={{ color: user.isBlocked ? "#EF4444" : "#22C55E" }}
                      >
                        <span
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ backgroundColor: user.isBlocked ? "#EF4444" : "#22C55E" }}
                        />
                        {user.isBlocked ? "Blocked" : "Active"}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap" style={{ color: "var(--muted)" }}>
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          className="!px-2 !py-1 !text-xs"
                          onClick={() => handleBlock(user)}
                          loading={actionLoading === user.id}
                          disabled={actionLoading === user.id}
                        >
                          {user.isBlocked ? "Unblock" : "Block"}
                        </Button>
                        <Button
                          variant="ghost"
                          className="!px-2 !py-1 !text-xs"
                          onClick={() => {
                            setResetModal(user);
                            setNewPassword("");
                          }}
                        >
                          Reset PW
                        </Button>
                        <Button
                          variant="ghost"
                          className="!px-2 !py-1 !text-xs"
                          style={{ color: "#EF4444" }}
                          onClick={() => setDeleteModal(user)}
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal
        open={!!deleteModal}
        onClose={() => setDeleteModal(null)}
        title="Delete User"
      >
        <p className="text-sm mb-6" style={{ color: "var(--text-2)" }}>
          Are you sure you want to delete{" "}
          <strong style={{ color: "var(--text)" }}>{deleteModal?.email}</strong>?
          This action cannot be undone.
        </p>
        <div className="flex items-center justify-end gap-3">
          <Button variant="secondary" onClick={() => setDeleteModal(null)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            style={{ backgroundColor: "#EF4444" }}
            onClick={handleDelete}
            loading={!!actionLoading}
          >
            Delete User
          </Button>
        </div>
      </Modal>

      <Modal
        open={!!resetModal}
        onClose={() => {
          setResetModal(null);
          setNewPassword("");
        }}
        title="Reset Password"
      >
        <p className="text-sm mb-4" style={{ color: "var(--text-2)" }}>
          Set a new password for{" "}
          <strong style={{ color: "var(--text)" }}>{resetModal?.email}</strong>
        </p>
        <div className="mb-6">
          <Input
            label="New Password"
            type="password"
            placeholder="Min. 6 characters"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </div>
        <div className="flex items-center justify-end gap-3">
          <Button
            variant="secondary"
            onClick={() => {
              setResetModal(null);
              setNewPassword("");
            }}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleResetPassword}
            loading={!!actionLoading}
          >
            Reset Password
          </Button>
        </div>
      </Modal>
    </div>
  );
}

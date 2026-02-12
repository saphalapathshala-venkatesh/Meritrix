"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardBody } from "../../_components/Card";
import Input from "../../_components/Input";
import Button from "../../_components/Button";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") || "/dashboard";

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ identifier, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed.");
        setLoading(false);
        return;
      }

      router.replace(from);
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  }

  return (
    <section className="mx-section">
      <div className="mx-container flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardBody>
            <h1
              className="text-2xl font-bold mb-1 text-center"
              style={{ color: "var(--text)" }}
            >
              Welcome back
            </h1>
            <p
              className="text-sm mb-6 text-center"
              style={{ color: "var(--text-2)" }}
            >
              Sign in to your account
            </p>

            {error && (
              <div
                className="rounded-lg px-4 py-3 text-sm mb-4"
                style={{ backgroundColor: "#FEF2F2", color: "#DC2626" }}
              >
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <Input
                label="Email, phone, or username"
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
                autoComplete="username"
              />
              <Input
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
              <Button
                type="submit"
                loading={loading}
                className="w-full"
                style={{ height: "44px", marginTop: "4px" }}
              >
                Sign in
              </Button>
            </form>

            <p
              className="text-sm text-center mt-5"
              style={{ color: "var(--text-2)" }}
            >
              Don&apos;t have an account?{" "}
              <Link
                href="/signup"
                className="font-medium"
                style={{ color: "var(--primary)" }}
              >
                Create one
              </Link>
            </p>
          </CardBody>
        </Card>
      </div>
    </section>
  );
}

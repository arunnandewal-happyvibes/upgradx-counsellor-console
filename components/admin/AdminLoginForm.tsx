"use client";

import { useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Logo } from "@/components/ui/Logo";

const inputClass =
  "h-11 rounded-lg border border-brand-gray-200 px-3 text-sm outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red";

export function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Could not log in");
      router.push(searchParams.get("next") || "/admin");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setSubmitting(false);
    }
  }

  return (
    <div className="w-full max-w-sm rounded-2xl border-t-4 border-t-brand-red bg-white p-8 shadow-xl">
      <div className="mb-6 flex justify-center">
        <Logo height={32} />
      </div>
      <h1 className="mb-1 text-center text-xl font-extrabold text-brand-ink">Admin Login</h1>
      <p className="mb-6 text-center text-sm text-brand-ink2">Sign in to manage the Expert Counselling Portal.</p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          required
          autoFocus
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputClass}
        />
        <input
          required
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={inputClass}
        />
        {error && <p className="text-sm font-semibold text-brand-red">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="h-11 rounded-lg bg-brand-red text-sm font-bold text-white hover:bg-brand-red/90 disabled:opacity-50"
        >
          {submitting ? "Signing in..." : "Sign In"}
        </button>
      </form>
    </div>
  );
}

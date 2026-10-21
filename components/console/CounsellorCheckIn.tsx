"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";
import { getCounsellorEmail, setCounsellorEmail } from "@/lib/counsellor";

export function CounsellorCheckIn() {
  const [needsCheckIn, setNeedsCheckIn] = useState(false);
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!getCounsellorEmail()) setNeedsCheckIn(true);
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/counsellor-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Could not check in");
      setCounsellorEmail(json.email);
      setNeedsCheckIn(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  if (!needsCheckIn) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-ink/50 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-label="Counsellor check-in"
    >
      <div className="relative w-[92vw] sm:w-[36vw] sm:min-w-[420px] max-w-lg bg-white rounded-[32px] shadow-float p-9 sm:p-10 text-left">
        <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-white">
          <Icon name="badge" size={30} fill />
        </div>
        <h2 className="font-display text-[40px] font-extrabold leading-[1] tracking-[-0.04em] text-ink mb-3">Check in</h2>
        <p className="text-body-md text-on-surface-variant mb-6">
          Enter your work email to start today's sessions.
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            required
            autoFocus
            type="email"
            autoComplete="email"
            aria-label="Your work email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@upgrad.com"
            className="h-14 w-full rounded-xl border border-outline-variant bg-surface-container-low px-4 text-[17px] text-ink transition-[border-color,box-shadow,background-color] placeholder:text-[#8a8a8a] focus:border-primary focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/15"
          />
          {error && <p className="text-body-sm font-semibold text-primary">{error}</p>}
          <Button type="submit" disabled={submitting} size="lg" className="mt-2 w-full">
            {submitting ? "Checking in..." : "Check In"}
          </Button>
        </form>
      </div>
    </div>
  );
}

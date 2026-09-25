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
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-on-surface/60 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Counsellor check-in"
    >
      <div className="relative w-[92vw] sm:w-[36vw] sm:min-w-[420px] max-w-lg bg-surface-container-lowest rounded-2xl border-t-4 border-t-primary shadow-2xl p-10 text-center">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-white">
          <Icon name="badge" size={30} fill />
        </div>
        <h2 className="text-display-lg text-on-surface mb-2">Counsellor Check-In</h2>
        <p className="text-body-md text-on-surface-variant mb-6">
          Enter your work email to start today's sessions.
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            required
            autoFocus
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@upgrad.com"
            className="h-14 w-full rounded-lg border-2 border-surface-variant bg-white px-4 text-center text-body-lg text-on-surface transition-colors focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary"
          />
          {error && <p className="text-body-sm font-semibold text-primary">{error}</p>}
          <Button type="submit" disabled={submitting} className="mt-2 w-full justify-center py-4">
            {submitting ? "Checking in..." : "Check In"}
          </Button>
        </form>
      </div>
    </div>
  );
}

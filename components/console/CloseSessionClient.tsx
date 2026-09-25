"use client";

import { useEffect, useState, useTransition, type FormEvent } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { StarRating } from "@/components/ui/StarRating";
import { getLeadProfile, type LeadProfile } from "@/lib/leadProfile";
import { getCounsellorEmail } from "@/lib/counsellor";
import { findRecommendationForDegree } from "@/lib/recommendationMatch";
import { closeSession } from "@/app/console/close-session/actions";

type ProgramOption = { id: string; name: string; duration: string };
type RecommendationRow = { degree: string; choice1ProgramId: string | null };

const inputClass =
  "h-12 w-full rounded-lg border-2 border-surface-variant bg-white px-4 text-body-md text-on-surface transition-colors focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary";
const labelClass = "mb-1.5 block text-body-sm font-semibold text-on-surface";

export function CloseSessionClient({
  programs,
  recommendations,
}: {
  programs: ProgramOption[];
  recommendations: RecommendationRow[];
}) {
  const [profile, setProfile] = useState<LeadProfile | null>(null);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    programId: "",
    counsellorName: "",
    counsellorCity: "",
  });
  const [rating, setRating] = useState(0);
  const [submitted, setSubmitted] = useState<{
    name: string;
    email: string;
    programName: string | null;
    emailSent: boolean;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    const p = getLeadProfile();
    setProfile(p);
    if (p) {
      const match = findRecommendationForDegree(recommendations, p.degree);
      setForm((f) => ({ ...f, name: p.name, programId: match?.choice1ProgramId ?? "" }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!form.name.trim() || !form.phone.trim() || !form.email.trim()) {
      setError("Name, phone and email are required.");
      return;
    }
    if (rating < 1) {
      setError("Ask the student to rate the session before closing it.");
      return;
    }
    startTransition(async () => {
      const result = await closeSession({
        leadId: profile?.id ?? null,
        name: form.name,
        phone: form.phone,
        email: form.email,
        programId: form.programId || null,
        counsellorName: form.counsellorName || null,
        counsellorCity: form.counsellorCity || null,
        counsellorEmail: getCounsellorEmail(),
        rating,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      const program = programs.find((p) => p.id === form.programId);
      setSubmitted({
        name: form.name,
        email: form.email,
        programName: program?.name ?? null,
        emailSent: result.emailSent,
      });
    });
  }

  function startNextSession() {
    try {
      // Clear every per-student key, but keep the counsellor's check-in
      // (upgradx.counsellorEmail) — they stay logged in across sessions.
      for (const key of Object.keys(sessionStorage)) {
        if (key.startsWith("upgradx.") && key !== "upgradx.counsellorEmail") {
          sessionStorage.removeItem(key);
        }
      }
    } catch {
      // ignore — private-browsing / storage-blocked contexts
    }
  }

  if (submitted) {
    const firstName = submitted.name.trim().split(/\s+/)[0] || submitted.name;
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center gap-6 px-card-padding py-24 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary text-white animate-welcome-pulse">
          <Icon name="celebration" size={40} fill />
        </div>
        <h1 className="text-display-lg text-on-surface">Thank you, {firstName}!</h1>
        <p className="max-w-md text-body-lg text-on-surface-variant">
          Your session is complete
          {submitted.programName && (
            <>
              {" "}
              — we&apos;ve noted your interest in{" "}
              <span className="font-bold text-on-surface">{submitted.programName}</span>
            </>
          )}
          . Our team will be in touch at{" "}
          <span className="font-semibold text-on-surface">{submitted.email}</span> shortly.
        </p>
        {submitted.emailSent && (
          <p className="text-body-sm text-on-surface-variant">
            A summary email is on its way to {submitted.email}.
          </p>
        )}
        <Link href="/" onClick={startNextSession}>
          <Button>Start Next Session</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl px-card-padding py-16">
      <h1 className="mb-2 text-display-lg text-on-surface">Close Session</h1>
      <p className="mb-8 text-body-md text-on-surface-variant">
        Confirm the student&apos;s details and the program you recommended, then submit. This closes
        today&apos;s session and sends them a summary email.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div>
          <label className={labelClass}>Student Name</label>
          <input
            required
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className={inputClass}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Phone Number</label>
            <input
              required
              type="tel"
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Email</label>
            <input
              required
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <label className={labelClass}>Recommended Program</label>
          <select
            value={form.programId}
            onChange={(e) => setForm((f) => ({ ...f, programId: e.target.value }))}
            className={inputClass}
          >
            <option value="">— Select a program —</option>
            {programs.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.duration})
              </option>
            ))}
          </select>
          {profile && (
            <p className="mt-1 text-body-sm text-on-surface-variant">
              Auto-filled from {profile.name}&apos;s recommendations — change it if a different program was
              discussed.
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 border-t border-surface-variant pt-5">
          <div>
            <label className={labelClass}>
              Counsellor Name <span className="font-normal text-on-surface-variant">(optional)</span>
            </label>
            <input
              value={form.counsellorName}
              onChange={(e) => setForm((f) => ({ ...f, counsellorName: e.target.value }))}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>
              Counsellor City <span className="font-normal text-on-surface-variant">(optional)</span>
            </label>
            <input
              value={form.counsellorCity}
              onChange={(e) => setForm((f) => ({ ...f, counsellorCity: e.target.value }))}
              className={inputClass}
            />
          </div>
        </div>

        <div className="border-t border-surface-variant pt-5">
          <label className={labelClass}>How would the student rate this session?</label>
          <StarRating value={rating} onChange={setRating} />
        </div>

        {error && <p className="text-body-sm font-semibold text-primary">{error}</p>}

        <Button type="submit" disabled={pending} className="mt-2 w-full justify-center py-4">
          {pending ? "Closing session..." : "Confirm & Close Session"}
        </Button>
      </form>
    </div>
  );
}

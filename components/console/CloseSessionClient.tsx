"use client";

import { useEffect, useState, useTransition, type FormEvent } from "react";
import { Button, LinkButton } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { TextField } from "@/components/ui/Field";
import { PageHeader } from "@/components/ui/PageHeader";
import { cn } from "@/lib/cn";
import { useCity } from "@/lib/city-context";
import { getLeadProfile, type LeadProfile } from "@/lib/leadProfile";
import { getCounsellorEmail } from "@/lib/counsellor";
import { getSessionRecorder } from "@/lib/sessionRecorder";
import { findRecommendationForDegree } from "@/lib/recommendationMatch";
import { closeSession } from "@/app/console/close-session/actions";

type ProgramOption = { id: string; name: string; duration: string };
type RecommendationRow = { degree: string; choice1ProgramId: string | null };


export function CloseSessionClient({
  programs,
  recommendations,
}: {
  programs: ProgramOption[];
  recommendations: RecommendationRow[];
}) {
  const { cities } = useCity();
  const [profile, setProfile] = useState<LeadProfile | null>(null);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    programId: "",
    counsellorName: "",
    counsellorCity: "",
  });
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
    startTransition(async () => {
      // Finish uploading the last bit of the recording before the session is closed.
      const recordingKey = await getSessionRecorder().stopAndFlush().catch(() => null);
      const result = await closeSession({
        leadId: profile?.id ?? null,
        name: form.name,
        phone: form.phone,
        email: form.email,
        programId: form.programId || null,
        counsellorName: form.counsellorName || null,
        counsellorCity: form.counsellorCity || null,
        counsellorEmail: getCounsellorEmail(),
        recordingKey,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      getSessionRecorder().reset();
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
    const steps: { done: boolean; label: React.ReactNode }[] = [
      { done: true, label: "Session saved to the learner's record" },
      {
        done: !!submitted.programName,
        label: submitted.programName ? (
          <>
            Recommended <span className="font-semibold text-ink">{submitted.programName}</span>
          </>
        ) : (
          "No program recorded"
        ),
      },
      {
        done: submitted.emailSent,
        label: submitted.emailSent ? (
          <>
            Summary and rating link emailed to <span className="font-semibold text-ink">{submitted.email}</span>
          </>
        ) : (
          "Summary email couldn't be sent — the session is still saved"
        ),
      },
    ];
    return (
      <div className="mx-auto flex w-full max-w-2xl animate-rise flex-col gap-10 py-10 md:py-16">
        <span className="grid h-16 w-16 place-items-center rounded-2xl bg-primary text-white shadow-red-glow">
          <Icon name="check" size={34} />
        </span>
        <div className="flex flex-col gap-4">
          <span className="eyebrow">Session closed</span>
          <h1 className="font-display text-[clamp(44px,6vw,80px)] font-extrabold leading-[0.98] tracking-[-0.045em] text-ink">
            Thank you, {firstName}.
          </h1>
        </div>
        <ul className="flex flex-col overflow-hidden rounded-[24px] border border-outline-variant">
          {steps.map((s, i) => (
            <li key={i} className="flex items-center gap-4 border-b border-outline-variant px-6 py-4 text-[15px] text-on-surface-variant last:border-0">
              <span
                className={cn(
                  "grid h-8 w-8 flex-shrink-0 place-items-center rounded-full",
                  s.done ? "bg-ink text-white" : "bg-surface-container text-on-surface-variant",
                )}
              >
                <Icon name={s.done ? "check" : "remove"} size={18} />
              </span>
              <span>{s.label}</span>
            </li>
          ))}
        </ul>
        <div className="flex flex-wrap items-center gap-4">
          <LinkButton href="/" onClick={startNextSession} size="lg">
            Start next session
            <Icon name="arrow_forward" size={20} />
          </LinkButton>
          <span className="text-[14px] text-on-surface-variant">Clears this learner&apos;s details; you stay checked in.</span>
        </div>
      </div>
    );
  }

  const recommendedId = profile ? findRecommendationForDegree(recommendations, profile.degree)?.choice1ProgramId ?? null : null;

  return (
    <div className="flex flex-col gap-12">
      <PageHeader
        back={{ href: "/console", label: "Console" }}
        eyebrow="Close session"
        title={profile ? `Wrap up with ${profile.name.split(" ")[0]}.` : "Wrap up the session."}
        lead="Confirm the learner's details and the program you recommended. They get a summary email with a link to rate the session."
      />

      <div className="flex flex-wrap items-start gap-10">
        <form onSubmit={handleSubmit} className="flex min-w-0 flex-[999_1_520px] flex-col gap-10">
          <fieldset className="flex flex-col gap-5">
            <legend className="mb-5 font-display text-headline-sm text-ink">
              <span className="mr-2 text-primary">01</span>Learner
            </legend>
            <TextField
              label="Learner name"
              required
              autoComplete="off"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
            <div className="grid gap-5 sm:grid-cols-2">
              <TextField
                label="Phone number"
                required
                type="tel"
                inputMode="tel"
                placeholder="10-digit mobile"
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              />
              <TextField
                label="Email"
                required
                type="email"
                inputMode="email"
                placeholder="name@example.com"
                hint="The summary and rating link go here."
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              />
            </div>
          </fieldset>

          <fieldset className="flex flex-col gap-4">
            <legend className="mb-1 font-display text-headline-sm text-ink">
              <span className="mr-2 text-primary">02</span>Recommended program
            </legend>
            {profile && recommendedId && (
              <p className="text-[14px] text-on-surface-variant">
                Pre-selected from {profile.name.split(" ")[0]}&apos;s best match — pick another if you discussed something else.
              </p>
            )}
            <div role="radiogroup" aria-label="Recommended program" className="grid gap-2.5 sm:grid-cols-2">
              {programs.map((p) => {
                const on = form.programId === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    onClick={() => setForm((f) => ({ ...f, programId: on ? "" : p.id }))}
                    className={cn(
                      "btn-3d flex items-start gap-3 rounded-2xl border p-4 text-left",
                      on ? "border-ink bg-ink text-white" : "border-outline-variant bg-white text-ink hover:border-ink",
                    )}
                  >
                    <span
                      className={cn(
                        "mt-0.5 grid h-5 w-5 flex-shrink-0 place-items-center rounded-full border-2",
                        on ? "border-white" : "border-outline",
                      )}
                    >
                      {on && <span className="h-2.5 w-2.5 rounded-full bg-white" />}
                    </span>
                    <span className="flex min-w-0 flex-col gap-1">
                      <span className="text-[15px] font-semibold leading-snug">{p.name}</span>
                      <span className={cn("flex items-center gap-2 text-[13px]", on ? "text-white/70" : "text-on-surface-variant")}>
                        {p.duration}
                        {p.id === recommendedId && (
                          <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em]", on ? "bg-primary text-white" : "bg-primary-fixed text-primary")}>
                            Recommended
                          </span>
                        )}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </fieldset>

          <fieldset className="flex flex-col gap-5">
            <legend className="mb-5 font-display text-headline-sm text-ink">
              <span className="mr-2 text-primary">03</span>Counsellor <span className="text-[15px] font-medium text-on-surface-variant">· optional</span>
            </legend>
            <div className="grid gap-5 sm:grid-cols-2">
              <TextField
                label="Your name"
                autoComplete="name"
                value={form.counsellorName}
                onChange={(e) => setForm((f) => ({ ...f, counsellorName: e.target.value }))}
              />
              <TextField
                label="Your centre city"
                list="close-session-cities"
                hint="Used to route the learner to the right centre."
                value={form.counsellorCity}
                onChange={(e) => setForm((f) => ({ ...f, counsellorCity: e.target.value }))}
              />
              <datalist id="close-session-cities">
                {cities.map((c) => (
                  <option key={c.id} value={c.name} />
                ))}
              </datalist>
            </div>
          </fieldset>

          {error && (
            <p role="alert" className="flex items-center gap-2 rounded-2xl bg-primary-fixed px-4 py-3 text-[15px] font-medium text-primary-container">
              <Icon name="error" size={20} />
              {error}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-4 border-t border-outline-variant pt-8">
            <Button type="submit" size="lg" loading={pending} className="min-w-[240px]">
              {pending ? "Closing session…" : "Confirm & close session"}
            </Button>
            <span className="text-[14px] text-on-surface-variant">Any recording in progress is saved first.</span>
          </div>
        </form>

        <aside aria-label="What happens next" className="flex min-w-0 flex-[1_1_300px] flex-col gap-6 rounded-[28px] bg-ink p-7 text-white lg:sticky lg:top-28">
          <span className="text-label-bold uppercase text-white/50">When you close</span>
          <ol className="flex flex-col gap-5">
            {[
              ["mail", "Summary email", "The learner gets their program summary and a one-tap link to rate today."],
              ["description", "Transcript linked", "If you recorded, the transcript is attached to this learner for admins."],
              ["groups", "Next session ready", "One tap clears the learner's details — you stay checked in."],
            ].map(([icon, title, body]) => (
              <li key={title} className="flex gap-3.5">
                <span className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-xl bg-white/10">
                  <Icon name={icon} size={20} />
                </span>
                <span>
                  <span className="block font-semibold">{title}</span>
                  <span className="text-[14px] leading-relaxed text-white/60">{body}</span>
                </span>
              </li>
            ))}
          </ol>
        </aside>
      </div>
    </div>
  );
}

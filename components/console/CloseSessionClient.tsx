"use client";

import { useEffect, useState, useTransition, type FormEvent } from "react";
import { Button, LinkButton } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { TextField, SelectField } from "@/components/ui/Field";
import { fieldClass } from "@/components/ui/fieldStyles";
import { PageHeader } from "@/components/ui/PageHeader";
import { cn } from "@/lib/cn";
import { getLeadProfile, type LeadProfile } from "@/lib/leadProfile";
import { getCounsellorEmail } from "@/lib/counsellor";
import { getSessionRecorder } from "@/lib/sessionRecorder";
import { findRecommendationForDegree } from "@/lib/recommendationMatch";
import { closeSession, getCounsellorProfile } from "@/app/console/close-session/actions";
import { CENTRES, COUNTRY_CODES, DEFAULT_LEAD_SOURCE, LEAD_SOURCES, getCentre } from "@/lib/centres";
import { normalizeMobile, validateCloseSession, type CloseSessionFields, type FieldErrors } from "@/lib/closeSessionRules";

type ProgramOption = { id: string; name: string; duration: string };
type RecommendationRow = { degree: string; choice1ProgramId: string | null };


export function CloseSessionClient({
  programs,
  recommendations,
  lsqEnabled,
}: {
  programs: ProgramOption[];
  recommendations: RecommendationRow[];
  lsqEnabled: boolean;
}) {
  const [profile, setProfile] = useState<LeadProfile | null>(null);
  const [counsellor, setCounsellor] = useState<{ name: string; centre: string } | null | undefined>(undefined);
  const [form, setForm] = useState<CloseSessionFields>({
    name: "",
    countryCode: "+91",
    mobile: "",
    email: "",
    programId: "",
    source: DEFAULT_LEAD_SOURCE,
    centre: "",
  });
  // Errors only show for fields the counsellor has touched, or all of them after a submit attempt.
  const [touched, setTouched] = useState<Partial<Record<keyof CloseSessionFields, boolean>>>({});
  const [triedSubmit, setTriedSubmit] = useState(false);
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
    // The counsellor's name and home centre come from the admin Counsellor list.
    getCounsellorProfile(getCounsellorEmail())
      .then((c) => {
        setCounsellor(c);
        if (c && getCentre(c.centre)) setForm((f) => (f.centre ? f : { ...f, centre: c.centre }));
      })
      .catch(() => setCounsellor(null));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const errors: FieldErrors = validateCloseSession(form);
  const valid = Object.keys(errors).length === 0;
  const show = (k: keyof CloseSessionFields) => (triedSubmit || touched[k] ? errors[k] : undefined);
  const set = <K extends keyof CloseSessionFields>(k: K, v: CloseSessionFields[K]) => setForm((f) => ({ ...f, [k]: v }));
  const touch = (k: keyof CloseSessionFields) => () => setTouched((t) => ({ ...t, [k]: true }));

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setTriedSubmit(true);
    if (!valid) return;
    startTransition(async () => {
      // Finish uploading the last bit of the recording before the session is closed.
      const recordingKey = await getSessionRecorder().stopAndFlush().catch(() => null);
      const result = await closeSession({
        leadId: profile?.id ?? null,
        name: form.name,
        countryCode: form.countryCode,
        mobile: normalizeMobile(form.mobile),
        email: form.email,
        programId: form.programId,
        source: form.source,
        centre: form.centre,
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
  const selectedCentre = getCentre(form.centre);

  return (
    <div className="flex flex-col gap-12">
      <PageHeader
        back={{ href: "/console", label: "Console" }}
        eyebrow="Close session"
        title={profile ? `Wrap up with ${profile.name.split(" ")[0]}.` : "Wrap up the session."}
        lead="Every field is needed: the learner gets a summary email, and the lead is routed to the right centre."
      />

      <div className="flex flex-wrap items-start gap-10">
        <form onSubmit={handleSubmit} className="flex min-w-0 flex-[999_1_520px] flex-col gap-10">
          <fieldset className="flex flex-col gap-5">
            <legend className="mb-5 font-display text-headline-sm text-ink">
              <span className="mr-2 text-primary">01</span>Learner
            </legend>
            <TextField
              label="Student name"
              required
              autoComplete="off"
              value={form.name}
              error={show("name")}
              onBlur={touch("name")}
              onChange={(e) => set("name", e.target.value)}
            />
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="cs-mobile" className="text-[14px] font-semibold text-ink">
                  Mobile number
                </label>
                <div className="flex gap-2">
                  <select
                    aria-label="Country code"
                    value={form.countryCode}
                    onChange={(e) => set("countryCode", e.target.value)}
                    className={cn(fieldClass, "h-12 !w-[96px] flex-shrink-0 px-3")}
                  >
                    {COUNTRY_CODES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  <input
                    id="cs-mobile"
                    required
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel-national"
                    placeholder={form.countryCode === "+91" ? "10-digit mobile" : "Mobile number"}
                    value={form.mobile}
                    aria-invalid={show("mobile") ? true : undefined}
                    aria-describedby={show("mobile") ? "cs-mobile-msg" : undefined}
                    onBlur={touch("mobile")}
                    onChange={(e) => set("mobile", e.target.value.replace(/[^\d\s-]/g, ""))}
                    className={cn(fieldClass, "h-12 min-w-0 flex-1")}
                  />
                </div>
                {show("mobile") && (
                  <p id="cs-mobile-msg" role="alert" className="text-[13px] font-medium text-primary">
                    {show("mobile")}
                  </p>
                )}
              </div>
              <TextField
                label="Email"
                required
                type="email"
                inputMode="email"
                placeholder="name@example.com"
                hint="The summary and rating link go here."
                value={form.email}
                error={show("email")}
                onBlur={touch("email")}
                onChange={(e) => set("email", e.target.value)}
              />
            </div>
          </fieldset>

          <fieldset className="flex flex-col gap-4">
            <legend className="mb-1 font-display text-headline-sm text-ink">
              <span className="mr-2 text-primary">02</span>Recommended program
            </legend>
            {profile && recommendedId && (
              <p className="text-[14px] text-on-surface-variant">
                Pre-selected from {profile.name.split(" ")[0]}&apos;s best match — confirm it or pick another.
              </p>
            )}
            <div role="radiogroup" aria-label="Recommended program" aria-required="true" className="grid gap-2.5 sm:grid-cols-2">
              {programs.map((p) => {
                const on = form.programId === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    onClick={() => {
                      set("programId", p.id);
                      touch("programId")();
                    }}
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
            {show("programId") && (
              <p role="alert" className="text-[13px] font-medium text-primary">
                {show("programId")}
              </p>
            )}
          </fieldset>

          <fieldset className="flex flex-col gap-5">
            <legend className="mb-5 font-display text-headline-sm text-ink">
              <span className="mr-2 text-primary">03</span>Source &amp; centre
            </legend>
            <div className="grid gap-5 sm:grid-cols-2">
              <SelectField
                label="Source"
                required
                value={form.source}
                error={show("source")}
                hint="Where the learner came from."
                onChange={(e) => set("source", e.target.value)}
              >
                {LEAD_SOURCES.map((src) => (
                  <option key={src} value={src}>
                    {src}
                  </option>
                ))}
              </SelectField>
              <SelectField
                label="Centre"
                required
                value={form.centre}
                error={show("centre")}
                hint={
                  selectedCentre && !selectedCentre.hasRule
                    ? "No LSQ routing rule for this centre yet — the lead lands in the LC Team queue."
                    : "Pre-filled with your centre. Change it if you're covering another centre."
                }
                onBlur={touch("centre")}
                onChange={(e) => set("centre", e.target.value)}
              >
                <option value="" disabled>
                  — Select a centre —
                </option>
                {CENTRES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </SelectField>
            </div>
            <div className="flex items-center gap-3 rounded-2xl bg-surface-container-low px-4 py-3.5">
              <span className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-full bg-white text-ink">
                <Icon name="badge" size={18} />
              </span>
              <span className="min-w-0 text-[14px] text-on-surface-variant">
                Counsellor:{" "}
                {counsellor === undefined ? (
                  "checking…"
                ) : counsellor ? (
                  <span className="font-semibold text-ink">{counsellor.name}</span>
                ) : (
                  <span className="font-semibold text-ink">Not in the counsellor list</span>
                )}
                {counsellor === null && (
                  <span className="block text-[13px]">The lead will go to the centre queue. Ask an admin to add you.</span>
                )}
              </span>
            </div>
          </fieldset>

          {error && (
            <p role="alert" className="flex items-center gap-2 rounded-2xl bg-primary-fixed px-4 py-3 text-[15px] font-medium text-primary-container">
              <Icon name="error" size={20} />
              {error}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-4 border-t border-outline-variant pt-8">
            <Button type="submit" size="lg" loading={pending} disabled={!valid} className="min-w-[240px]">
              {pending ? "Closing session…" : "Confirm & close session"}
            </Button>
            <span className="text-[14px] text-on-surface-variant">
              {valid ? "Any recording in progress is saved first." : "Fill every field to enable this."}
            </span>
          </div>
        </form>

        <aside aria-label="What happens next" className="flex min-w-0 flex-[1_1_300px] flex-col gap-6 rounded-[28px] bg-ink p-7 text-white lg:sticky lg:top-28">
          <span className="text-label-bold uppercase text-white/50">When you close</span>
          <ol className="flex flex-col gap-5">
            {[
              ["mail", "Summary email", "The learner gets their program summary and a one-tap link to rate today."],
              ...(lsqEnabled ? [["hub", "Routed to the centre", "The lead goes to the selected centre in LeadSquared, assigned to you."]] : []),
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

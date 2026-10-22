"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Spinner } from "@/components/ui/Spinner";
import { cn } from "@/lib/cn";
import { setWelcomeName } from "@/lib/welcome";
import { setLeadProfile } from "@/lib/leadProfile";
import { DOMAIN_TAGS, MAX_STUDENT_INTERESTS } from "@/lib/domainTags";
import { COLLEGE_TIERS } from "@/lib/learnerInsights";

const DEGREE_TAGS = ["B.Tech", "B.Com", "BCA", "BSc - CS", "BBA", "MSc - CS"];
const SKILL_TAGS = [
  "PowerBI",
  "Coding",
  "Development",
  "HTML",
  "CSS",
  "Java",
  "Python",
  "Tableau",
  "DSA",
  "SQL",
  "Finance",
  "Balance Sheets",
  "Artificial Intelligence",
];

// Step order. Every step is mandatory — profiling can't be skipped.
const S = { name: 0, age: 1, status: 2, degree: 3, college: 4, year: 5, cgpa: 6, proof: 7, skills: 8, interests: 9, city: 10 } as const;
const STEP_LABELS = ["Name", "Age", "Status", "Degree", "College", "Graduation year", "CGPA", "Experience", "Skills", "Interests", "City"];
const STEP_COUNT = STEP_LABELS.length;
const THIS_YEAR = new Date().getFullYear();
const OUT_DURATION = 220;

type CityOption = { id: string; name: string; slug: string };

type FormState = {
  name: string;
  degree: string; // resolved: a preset tag, or the custom-typed value
  degreeCategory: string; // "Tech" | "Non-Tech", only set when degree is custom
  customDegree: string;
  occupation: string; // "Student" | "Working Professional"
  yearsOfExperience: string;
  cgpa: string;
  skills: string[];
  customSkillInput: string;
  interests: string[];
  cityId: string;
  age: string;
  collegeName: string;
  collegeTier: string;
  graduationYear: string;
  hasInternships: boolean | null;
  hasCertifications: boolean | null;
  hasPortfolio: boolean | null;
};

/** Tier tile: the tier in bold with who belongs in it underneath. */
function TierTile({ label, hint, selected, onClick }: { label: string; hint: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "btn-3d flex min-h-[84px] flex-col items-start justify-center gap-1 rounded-2xl border px-5 py-3 text-left",
        selected ? "border-ink bg-ink text-white" : "border-outline-variant bg-white text-ink hover:border-ink",
      )}
    >
      <span className="inline-flex items-center gap-2 text-[18px] font-bold">
        {selected && <Icon name="check" size={20} />}
        {label}
      </span>
      <span className={cn("text-[14px]", selected ? "text-white/75" : "text-on-surface-variant")}>{hint}</span>
    </button>
  );
}

/** One yes/no question as a row of two tiles. */
function YesNoRow({ question, value, onChange }: { question: string; value: boolean | null; onChange: (v: boolean) => void }) {
  return (
    <div className="flex flex-col gap-3 border-b border-outline-variant pb-5 last:border-0 sm:flex-row sm:items-center sm:justify-between">
      <span className="text-[20px] font-semibold leading-snug text-ink">{question}</span>
      <div className="flex flex-shrink-0 gap-3">
        <TagChip label="Yes" selected={value === true} onClick={() => onChange(true)} />
        <TagChip label="No" selected={value === false} onClick={() => onChange(false)} />
      </div>
    </div>
  );
}

function TagChip({
  label,
  selected,
  onClick,
  disabled,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={selected}
      className={cn(
        "btn-3d inline-flex min-h-[56px] items-center gap-2.5 rounded-2xl border px-5 text-[17px] font-semibold",
        selected
          ? "border-ink bg-ink text-white"
          : "border-outline-variant bg-white text-ink hover:border-ink disabled:pointer-events-none disabled:opacity-40",
      )}
    >
      {selected && <Icon name="check" size={20} />}
      {label}
    </button>
  );
}

/** Big question heading + optional helper line, shared by every step. */
function Question({ title, hint }: { title: string; hint?: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      <h2 className="font-display text-[clamp(34px,4.6vw,56px)] font-extrabold leading-[1.02] tracking-[-0.04em] text-ink">
        {title}
      </h2>
      {hint && <p className="text-body-lg text-on-surface-variant">{hint}</p>}
    </div>
  );
}

/** Primary "Continue" with the keyboard hint beside it. */
function ContinueRow({ disabled, onClick, label = "Continue" }: { disabled: boolean; onClick: () => void; label?: string }) {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <Button type="button" size="lg" disabled={disabled} onClick={onClick} className="min-w-[200px]">
        {label}
        <Icon name="arrow_forward" size={20} />
      </Button>
      <span className="hidden text-[14px] text-on-surface-variant sm:inline">
        or press <kbd className="rounded-md border border-outline-variant px-1.5 py-0.5 font-sans text-[13px] text-ink">Enter ↵</kbd>
      </span>
    </div>
  );
}

export function OnboardingForm({ cities }: { cities: CityOption[] }) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showOtherDegree, setShowOtherDegree] = useState(false);
  const [form, setForm] = useState<FormState>({
    name: "",
    degree: "",
    degreeCategory: "",
    customDegree: "",
    occupation: "",
    yearsOfExperience: "",
    cgpa: "",
    skills: [],
    customSkillInput: "",
    interests: [],
    cityId: "",
    age: "",
    collegeName: "",
    collegeTier: "",
    graduationYear: "",
    hasInternships: null,
    hasCertifications: null,
    hasPortfolio: null,
  });

  const ageNum = Number(form.age);
  const ageValid = Number.isInteger(ageNum) && ageNum >= 15 && ageNum <= 70;
  const yearNum = Number(form.graduationYear);
  const yearValid = Number.isInteger(yearNum) && yearNum >= 1970 && yearNum <= THIS_YEAR + 6;
  const collegeValid = !!form.collegeName.trim() && !!form.collegeTier;
  const proofValid = form.hasInternships !== null && form.hasCertifications !== null && form.hasPortfolio !== null;

  const experience = Number(form.yearsOfExperience);
  const experienceValid = form.yearsOfExperience.trim() !== "" && Number.isFinite(experience) && experience >= 0 && experience <= 60;

  const goTo = (next: number) => {
    setLeaving(true);
    setTimeout(() => {
      setStep(next);
      setLeaving(false);
    }, OUT_DURATION);
  };

  const selectDegreeTag = (tag: string) => {
    setForm((f) => ({ ...f, degree: tag, degreeCategory: "", customDegree: "" }));
    setShowOtherDegree(false);
    goTo(S.college);
  };

  const selectOtherDegree = () => {
    setShowOtherDegree(true);
  };

  const confirmCustomDegree = () => {
    if (!form.customDegree.trim() || !form.degreeCategory) return;
    setForm((f) => ({ ...f, degree: f.customDegree.trim() }));
    goTo(S.college);
  };

  const toggleSkill = (skill: string) => {
    setForm((f) => ({
      ...f,
      skills: f.skills.includes(skill) ? f.skills.filter((s) => s !== skill) : [...f.skills, skill],
    }));
  };

  const addCustomSkill = () => {
    const skill = form.customSkillInput.trim();
    if (!skill || form.skills.includes(skill)) return;
    setForm((f) => ({ ...f, skills: [...f.skills, skill], customSkillInput: "" }));
  };

  const removeSkill = (skill: string) => {
    setForm((f) => ({ ...f, skills: f.skills.filter((s) => s !== skill) }));
  };

  const toggleInterest = (interest: string) => {
    setForm((f) => {
      if (f.interests.includes(interest)) {
        return { ...f, interests: f.interests.filter((i) => i !== interest) };
      }
      if (f.interests.length >= MAX_STUDENT_INTERESTS) return f;
      return { ...f, interests: [...f.interests, interest] };
    });
  };

  // Step back; the degree step resets to the preset list so it's never a dead end.
  const back = () => {
    if (step === 0) return;
    if (step === S.degree && showOtherDegree) return setShowOtherDegree(false);
    goTo(step - 1);
  };

  const selectCity = (cityId: string) => {
    setForm((f) => ({ ...f, cityId }));
    handleFinish(cityId);
  };

  const handleFinish = async (cityId: string) => {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          graduation: form.degree,
          graduationCategory: form.degreeCategory || null,
          occupation: form.occupation || null,
          yearsOfExperience: form.occupation === "Working Professional" ? form.yearsOfExperience : null,
          cgpa: form.cgpa,
          skills: form.skills,
          interests: form.interests,
          cityId: cityId || null,
          age: ageNum,
          collegeName: form.collegeName.trim(),
          collegeTier: form.collegeTier,
          graduationYear: yearNum,
          hasInternships: form.hasInternships,
          hasCertifications: form.hasCertifications,
          hasPortfolio: form.hasPortfolio,
        }),
      });
      if (!res.ok) throw new Error("Could not save details");
      const lead = await res.json();
      setWelcomeName(form.name.trim().split(/\s+/)[0] || form.name.trim());
      setLeadProfile({
        id: lead.id ?? null,
        name: form.name.trim(),
        degree: form.degree,
        skills: form.skills,
        interests: form.interests,
        occupation: form.occupation || null,
        yearsOfExperience:
          form.occupation === "Working Professional" && form.yearsOfExperience !== ""
            ? Number(form.yearsOfExperience)
            : null,
        cgpa: form.cgpa,
        age: ageNum,
        collegeName: form.collegeName.trim(),
        collegeTier: form.collegeTier,
        graduationYear: yearNum,
        hasInternships: form.hasInternships,
        hasCertifications: form.hasCertifications,
        hasPortfolio: form.hasPortfolio,
      });
      const selectedCity = cities.find((c) => c.id === cityId);
      if (selectedCity) {
        window.sessionStorage.setItem("upgradx.selectedCitySlug", selectedCity.slug);
      }
      router.push("/console");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setSubmitting(false);
    }
  };

  const inputClass =
    "h-20 w-full border-0 border-b-2 border-outline-variant bg-transparent px-0 font-display text-[clamp(28px,3.6vw,40px)] font-bold tracking-[-0.02em] text-ink placeholder:font-semibold placeholder:text-[#c9c9c9] transition-colors focus:border-primary focus:outline-none focus:ring-0 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none";

  const animClass = leaving ? "animate-onboard-step-out" : "animate-onboard-step-in";
  const stepWrap = cn("flex flex-col gap-10", animClass);

  return (
    <div className="flex flex-col gap-12">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={back}
            disabled={step === 0 || submitting}
            className="-ml-3 inline-flex h-11 items-center gap-1.5 rounded-xl px-3 text-[15px] font-semibold text-ink transition-colors hover:bg-surface-container-low disabled:invisible"
          >
            <Icon name="arrow_back" size={20} />
            Back
          </button>
          <span className="whitespace-nowrap text-[14px] font-medium text-on-surface-variant">
            Step <span className="font-bold text-ink">{step + 1}</span> of {STEP_COUNT}
            <span className="hidden sm:inline"> · {STEP_LABELS[step]}</span>
          </span>
        </div>
        <div className="flex gap-1.5" aria-hidden="true">
          {Array.from({ length: STEP_COUNT }).map((_, i) => (
            <span key={i} className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-container">
              <span
                className={cn(
                  "block h-full rounded-full bg-primary transition-transform duration-slow ease-out origin-left",
                  i <= step ? "scale-x-100" : "scale-x-0",
                )}
              />
            </span>
          ))}
        </div>
      </div>

      <div className="flex min-h-[380px] flex-col justify-center overflow-hidden px-1 pb-2">
        {step === 0 && (
          <div key="step-0" className={stepWrap}>
            <Question title="Hey, what should we call you?" hint="First name is fine — it's just for today's session." />
            <input
              autoFocus
              aria-label="Your name"
              className={inputClass}
              placeholder="Type your name"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              onKeyDown={(e) => e.key === "Enter" && form.name.trim() && goTo(S.age)}
            />
            <ContinueRow disabled={!form.name.trim()} onClick={() => goTo(S.age)} />
          </div>
        )}

        {step === S.age && (
          <div key="step-age" className={stepWrap}>
            <Question title={`Nice to meet you${form.name.trim() ? `, ${form.name.trim().split(/\s+/)[0]}` : ""}. How old are you?`} />
            <input
              autoFocus
              type="number"
              inputMode="numeric"
              min={15}
              max={70}
              aria-label="Age"
              className={inputClass}
              placeholder="e.g. 23"
              value={form.age}
              onChange={(e) => setForm((f) => ({ ...f, age: e.target.value }))}
              onKeyDown={(e) => e.key === "Enter" && ageValid && goTo(S.status)}
            />
            <ContinueRow disabled={!ageValid} onClick={() => goTo(S.status)} />
          </div>
        )}

        {step === S.status && (
          <div key="step-status" className={stepWrap}>
            <Question title="Are you studying or working?" />
            <div className="flex flex-wrap gap-3">
              <TagChip
                label="Student"
                selected={form.occupation === "Student"}
                onClick={() => {
                  setForm((f) => ({ ...f, occupation: "Student", yearsOfExperience: "" }));
                  goTo(S.degree);
                }}
              />
              <TagChip
                label="Working professional"
                selected={form.occupation === "Working Professional"}
                onClick={() => setForm((f) => ({ ...f, occupation: "Working Professional" }))}
              />
            </div>
            {form.occupation === "Working Professional" && (
              <div className="flex w-full flex-col gap-8 animate-rise">
                <input
                  autoFocus
                  type="number"
                  inputMode="decimal"
                  min={0}
                  max={60}
                  step={0.5}
                  aria-label="Years of experience"
                  className={inputClass}
                  placeholder="Years of experience, e.g. 3"
                  value={form.yearsOfExperience}
                  onChange={(e) => setForm((f) => ({ ...f, yearsOfExperience: e.target.value }))}
                  onKeyDown={(e) => e.key === "Enter" && experienceValid && goTo(S.degree)}
                />
                <ContinueRow disabled={!experienceValid} onClick={() => goTo(S.degree)} />
              </div>
            )}
          </div>
        )}

        {step === S.degree && (
          <div key="step-degree" className={stepWrap}>
            <Question title="What did you graduate in?" hint={showOtherDegree ? "Tell us the degree and whether it's tech or non-tech." : "Tap one to continue."} />
            {!showOtherDegree ? (
              <div className="flex flex-wrap gap-3">
                {DEGREE_TAGS.map((tag) => (
                  <TagChip key={tag} label={tag} selected={form.degree === tag} onClick={() => selectDegreeTag(tag)} />
                ))}
                <TagChip label="Something else" selected={showOtherDegree} onClick={selectOtherDegree} />
              </div>
            ) : (
              <div className="flex w-full flex-col gap-8">
                <div className="flex gap-3">
                  <TagChip
                    label="Tech"
                    selected={form.degreeCategory === "Tech"}
                    onClick={() => setForm((f) => ({ ...f, degreeCategory: "Tech" }))}
                  />
                  <TagChip
                    label="Non-tech"
                    selected={form.degreeCategory === "Non-Tech"}
                    onClick={() => setForm((f) => ({ ...f, degreeCategory: "Non-Tech" }))}
                  />
                </div>
                <input
                  autoFocus
                  aria-label="Your degree"
                  className={inputClass}
                  placeholder="Type your degree"
                  value={form.customDegree}
                  onChange={(e) => setForm((f) => ({ ...f, customDegree: e.target.value }))}
                  onKeyDown={(e) => e.key === "Enter" && confirmCustomDegree()}
                />
                <ContinueRow disabled={!form.customDegree.trim() || !form.degreeCategory} onClick={confirmCustomDegree} />
              </div>
            )}
          </div>
        )}

        {step === S.college && (
          <div key="step-college" className={stepWrap}>
            <Question title="Which college did you study at?" hint="Type the name, then pick the tier that fits best." />
            <input
              autoFocus
              aria-label="College name"
              className={inputClass}
              placeholder="College name"
              value={form.collegeName}
              onChange={(e) => setForm((f) => ({ ...f, collegeName: e.target.value }))}
              onKeyDown={(e) => e.key === "Enter" && collegeValid && goTo(S.year)}
            />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {COLLEGE_TIERS.map((t) => (
                <TierTile
                  key={t.value}
                  label={t.label}
                  hint={t.hint}
                  selected={form.collegeTier === t.value}
                  onClick={() => setForm((f) => ({ ...f, collegeTier: t.value }))}
                />
              ))}
            </div>
            <ContinueRow disabled={!collegeValid} onClick={() => goTo(S.year)} />
          </div>
        )}

        {step === S.year && (
          <div key="step-year" className={stepWrap}>
            <Question title="Which year did you graduate?" hint="Still studying? Enter the year you'll graduate." />
            <input
              autoFocus
              type="number"
              inputMode="numeric"
              min={1970}
              max={THIS_YEAR + 6}
              aria-label="Year of graduation"
              className={inputClass}
              placeholder={`e.g. ${THIS_YEAR - 1}`}
              value={form.graduationYear}
              onChange={(e) => setForm((f) => ({ ...f, graduationYear: e.target.value }))}
              onKeyDown={(e) => e.key === "Enter" && yearValid && goTo(S.cgpa)}
            />
            <ContinueRow disabled={!yearValid} onClick={() => goTo(S.cgpa)} />
          </div>
        )}

        {step === S.cgpa && (
          <div key="step-cgpa" className={stepWrap}>
            <Question title="What was your CGPA?" hint="On a 10-point scale. An estimate is okay." />
            <input
              autoFocus
              type="number"
              inputMode="decimal"
              min={0}
              max={10}
              step={0.01}
              aria-label="CGPA"
              className={inputClass}
              placeholder="e.g. 8.2"
              value={form.cgpa}
              onChange={(e) => setForm((f) => ({ ...f, cgpa: e.target.value }))}
              onKeyDown={(e) => e.key === "Enter" && form.cgpa.trim() && goTo(S.proof)}
            />
            <ContinueRow disabled={!form.cgpa.trim()} onClick={() => goTo(S.proof)} />
          </div>
        )}

        {step === S.proof && (
          <div key="step-proof" className={stepWrap}>
            <Question title="What have you done beyond the classroom?" hint="Answer all three." />
            <div className="flex flex-col gap-5">
              <YesNoRow
                question="Done any internships?"
                value={form.hasInternships}
                onChange={(v) => setForm((f) => ({ ...f, hasInternships: v }))}
              />
              <YesNoRow
                question="Completed any certifications?"
                value={form.hasCertifications}
                onChange={(v) => setForm((f) => ({ ...f, hasCertifications: v }))}
              />
              <YesNoRow
                question="Any projects live on GitHub or a portfolio?"
                value={form.hasPortfolio}
                onChange={(v) => setForm((f) => ({ ...f, hasPortfolio: v }))}
              />
            </div>
            <ContinueRow disabled={!proofValid} onClick={() => goTo(S.skills)} />
          </div>
        )}

        {step === S.skills && (
          <div key="step-skills" className={stepWrap}>
            <Question title="Which skills are you confident in?" hint="Pick as many as you like, or add your own." />
            <div className="flex flex-wrap gap-3">
              {SKILL_TAGS.map((tag) => (
                <TagChip key={tag} label={tag} selected={form.skills.includes(tag)} onClick={() => toggleSkill(tag)} />
              ))}
              {form.skills
                .filter((s) => !SKILL_TAGS.includes(s))
                .map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex min-h-[56px] items-center gap-2 rounded-2xl border border-ink bg-ink px-5 text-[17px] font-semibold text-white"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeSkill(tag)}
                      aria-label={`Remove ${tag}`}
                      className="grid h-7 w-7 place-items-center rounded-full hover:bg-white/15"
                    >
                      <Icon name="close" size={18} />
                    </button>
                  </span>
                ))}
            </div>
            <div className="flex w-full max-w-xl items-end gap-3">
              <input
                aria-label="Add another skill"
                className={cn(inputClass, "h-14 text-[22px]")}
                placeholder="Add another skill"
                value={form.customSkillInput}
                onChange={(e) => setForm((f) => ({ ...f, customSkillInput: e.target.value }))}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addCustomSkill();
                  }
                }}
              />
              <button
                type="button"
                onClick={addCustomSkill}
                disabled={!form.customSkillInput.trim()}
                className="btn-3d grid h-12 w-12 flex-shrink-0 place-items-center rounded-xl border border-outline-variant text-ink hover:border-ink disabled:opacity-40"
                aria-label="Add skill"
              >
                <Icon name="add" size={24} />
              </button>
            </div>
            <ContinueRow disabled={form.skills.length === 0} onClick={() => goTo(S.interests)} />
          </div>
        )}

        {step === S.interests && (
          <div key="step-interests" className={stepWrap}>
            <Question
              title="Where do you see yourself working?"
              hint={
                <>
                  Pick up to {MAX_STUDENT_INTERESTS} sectors — we&apos;ll show hiring partners that match.{" "}
                  <span className="font-semibold text-ink">
                    {form.interests.length}/{MAX_STUDENT_INTERESTS} selected
                  </span>
                </>
              }
            />
            <div className="flex flex-wrap gap-3">
              {DOMAIN_TAGS.map((tag) => {
                const selected = form.interests.includes(tag);
                const disabled = !selected && form.interests.length >= MAX_STUDENT_INTERESTS;
                return (
                  <TagChip key={tag} label={tag} selected={selected} disabled={disabled} onClick={() => toggleInterest(tag)} />
                );
              })}
            </div>
            <ContinueRow disabled={form.interests.length === 0} onClick={() => goTo(S.city)} />
          </div>
        )}

        {step === S.city && (
          <div key="step-city" className={stepWrap}>
            <Question title="Last one — which city works best?" hint="We'll show batches and centres there first." />
            <div className="flex flex-wrap gap-3">
              {cities.map((c) => (
                <TagChip
                  key={c.id}
                  label={c.name}
                  selected={form.cityId === c.id}
                  disabled={submitting}
                  onClick={() => selectCity(c.id)}
                />
              ))}
            </div>
            {error && (
              <p role="alert" className="text-body-lg font-medium text-primary">
                {error}
              </p>
            )}
            <div className="flex items-center gap-4">
              <Button type="button" variant="ghost" disabled={submitting} onClick={() => selectCity("")}>
                No preference
              </Button>
              {submitting && (
                <span className="inline-flex items-center gap-2 text-[15px] font-medium text-on-surface-variant">
                  <Spinner size={18} /> Building your plan…
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

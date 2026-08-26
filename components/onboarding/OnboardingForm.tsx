"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import { setWelcomeName } from "@/lib/welcome";
import { setLeadProfile } from "@/lib/leadProfile";

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

const STEP_COUNT = 4;
const OUT_DURATION = 220;

type FormState = {
  name: string;
  degree: string; // resolved: a preset tag, or the custom-typed value
  degreeCategory: string; // "Tech" | "Non-Tech", only set when degree is custom
  customDegree: string;
  cgpa: string;
  skills: string[];
  customSkillInput: string;
};

function TagChip({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "btn-3d rounded-full border-2 px-6 py-3.5 text-body-lg font-semibold transition-colors",
        selected
          ? "border-primary bg-primary text-on-primary"
          : "border-outline-variant bg-white text-on-surface hover:border-primary hover:text-primary",
      )}
    >
      {label}
    </button>
  );
}

export function OnboardingForm() {
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
    cgpa: "",
    skills: [],
    customSkillInput: "",
  });

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
    goTo(2);
  };

  const selectOtherDegree = () => {
    setShowOtherDegree(true);
  };

  const confirmCustomDegree = () => {
    if (!form.customDegree.trim() || !form.degreeCategory) return;
    setForm((f) => ({ ...f, degree: f.customDegree.trim() }));
    goTo(2);
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

  const skip = () => router.push("/console");

  const handleFinish = async () => {
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
          cgpa: form.cgpa,
          skills: form.skills,
        }),
      });
      if (!res.ok) throw new Error("Could not save details");
      setWelcomeName(form.name.trim().split(/\s+/)[0] || form.name.trim());
      setLeadProfile({ name: form.name.trim(), degree: form.degree, skills: form.skills });
      router.push("/console");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setSubmitting(false);
    }
  };

  const inputClass =
    "h-16 w-full px-6 text-headline-sm rounded-lg border-2 border-surface-variant bg-white text-on-surface text-center transition-colors focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary";

  const animClass = leaving ? "animate-onboard-step-out" : "animate-onboard-step-in";

  return (
    <div className="flex flex-col gap-10">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {Array.from({ length: STEP_COUNT }).map((_, i) => (
            <span
              key={i}
              className={cn("h-2.5 w-12 rounded-full transition-colors", i <= step ? "bg-primary" : "bg-surface-variant")}
            />
          ))}
        </div>
        <button type="button" onClick={skip} className="text-body-lg font-semibold text-secondary hover:text-primary transition-colors">
          Skip for now →
        </button>
      </div>

      <div className="min-h-[380px] flex flex-col justify-center overflow-hidden">
        {step === 0 && (
          <div key="step-0" className={cn("flex flex-col items-center gap-8 text-center", animClass)}>
            <h2 className="text-display-lg font-semibold text-on-surface">Hey, what should we call you?</h2>
            <input
              autoFocus
              className={inputClass}
              placeholder="Type your name"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              onKeyDown={(e) => e.key === "Enter" && form.name.trim() && goTo(1)}
            />
            <Button type="button" disabled={!form.name.trim()} onClick={() => goTo(1)} className="w-full py-5 text-headline-sm" style={{ fontSize: "18px" }}>
              Continue
            </Button>
          </div>
        )}

        {step === 1 && (
          <div key="step-1" className={cn("flex flex-col items-center gap-8 text-center", animClass)}>
            <h2 className="text-display-lg font-semibold text-on-surface">What is your graduation?</h2>
            {!showOtherDegree ? (
              <div className="flex flex-wrap justify-center gap-3">
                {DEGREE_TAGS.map((tag) => (
                  <TagChip key={tag} label={tag} selected={form.degree === tag} onClick={() => selectDegreeTag(tag)} />
                ))}
                <TagChip label="Other" selected={showOtherDegree} onClick={selectOtherDegree} />
              </div>
            ) : (
              <div className="flex w-full flex-col items-center gap-6">
                <div className="flex gap-3">
                  <TagChip
                    label="Tech"
                    selected={form.degreeCategory === "Tech"}
                    onClick={() => setForm((f) => ({ ...f, degreeCategory: "Tech" }))}
                  />
                  <TagChip
                    label="Non-Tech"
                    selected={form.degreeCategory === "Non-Tech"}
                    onClick={() => setForm((f) => ({ ...f, degreeCategory: "Non-Tech" }))}
                  />
                </div>
                <input
                  autoFocus
                  className={inputClass}
                  placeholder="Type your degree"
                  value={form.customDegree}
                  onChange={(e) => setForm((f) => ({ ...f, customDegree: e.target.value }))}
                  onKeyDown={(e) => e.key === "Enter" && confirmCustomDegree()}
                />
                <Button
                  type="button"
                  disabled={!form.customDegree.trim() || !form.degreeCategory}
                  onClick={confirmCustomDegree}
                  className="w-full py-5 text-headline-sm" style={{ fontSize: "18px" }}
                >
                  Continue
                </Button>
              </div>
            )}
          </div>
        )}

        {step === 2 && (
          <div key="step-2" className={cn("flex flex-col items-center gap-8 text-center", animClass)}>
            <h2 className="text-display-lg font-semibold text-on-surface">What is your CGPA?</h2>
            <input
              autoFocus
              type="number"
              min={0}
              max={10}
              step={0.01}
              className={inputClass}
              placeholder="e.g. 8.2"
              value={form.cgpa}
              onChange={(e) => setForm((f) => ({ ...f, cgpa: e.target.value }))}
              onKeyDown={(e) => e.key === "Enter" && form.cgpa.trim() && goTo(3)}
            />
            <Button type="button" disabled={!form.cgpa.trim()} onClick={() => goTo(3)} className="w-full py-5 text-headline-sm" style={{ fontSize: "18px" }}>
              Continue
            </Button>
          </div>
        )}

        {step === 3 && (
          <div key="step-3" className={cn("flex flex-col items-center gap-6 text-center", animClass)}>
            <h2 className="text-display-lg font-semibold text-on-surface">Select the skills you're confident in</h2>
            <div className="flex flex-wrap justify-center gap-3">
              {SKILL_TAGS.map((tag) => (
                <TagChip key={tag} label={tag} selected={form.skills.includes(tag)} onClick={() => toggleSkill(tag)} />
              ))}
              {form.skills
                .filter((s) => !SKILL_TAGS.includes(s))
                .map((tag) => (
                  <span
                    key={tag}
                    className="btn-3d inline-flex items-center gap-2 rounded-full border-2 border-primary bg-primary px-6 py-3.5 text-body-lg font-semibold text-on-primary"
                  >
                    {tag}
                    <button type="button" onClick={() => removeSkill(tag)} aria-label={`Remove ${tag}`}>
                      <Icon name="close" size={18} />
                    </button>
                  </span>
                ))}
            </div>
            <div className="flex w-full gap-3">
              <input
                className={cn(inputClass, "h-14 text-headline-sm")}
                placeholder="Others — type a skill"
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
                className="btn-3d flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-lg border-2 border-outline-variant text-on-surface-variant hover:border-primary hover:text-primary disabled:opacity-40"
                aria-label="Add skill"
              >
                <Icon name="add" size={26} />
              </button>
            </div>
            {error && <p className="text-body-lg text-primary">{error}</p>}
            <Button
              type="button"
              disabled={submitting || form.skills.length === 0}
              onClick={handleFinish}
              className="w-full py-5 text-headline-sm" style={{ fontSize: "18px" }}
            >
              {submitting ? "Loading..." : "Continue to upGrad X"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

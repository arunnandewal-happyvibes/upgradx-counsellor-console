// Turns a learner's onboarding answers into a strengths / gaps list and a rough
// "placement readiness" score. Used by the console profile card and the summary email,
// so both always say the same thing. Deterministic and explainable on purpose — the
// score is an indicator for the conversation, not an assessment.

export const COLLEGE_TIERS = [
  { value: "Tier 1", label: "Tier 1", hint: "IITs" },
  { value: "Tier 2", label: "Tier 2", hint: "NITs, VJTI and similar" },
  { value: "Tier 3", label: "Tier 3", hint: "Established private / state colleges" },
  { value: "Tier 4", label: "Tier 4", hint: "Other colleges" },
] as const;
export type CollegeTier = (typeof COLLEGE_TIERS)[number]["value"];

export type InsightInput = {
  degree?: string | null;
  collegeName?: string | null;
  collegeTier?: string | null;
  graduationYear?: number | null;
  age?: number | null;
  cgpa?: string | number | null;
  occupation?: string | null; // "Student" | "Working Professional"
  yearsOfExperience?: number | null;
  hasCertifications?: boolean | null;
  hasInternships?: boolean | null;
  hasPortfolio?: boolean | null;
  skills?: string[] | null;
};

export type LearnerInsights = {
  strengths: string[];
  gaps: string[];
  score: number; // 0–100
  band: "Placement ready" | "Almost there" | "Needs building";
};

const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));

export function computeInsights(p: InsightInput, now = new Date()): LearnerInsights {
  const strengths: string[] = [];
  const gaps: string[] = [];
  let score = 35;

  // College pedigree.
  switch (p.collegeTier) {
    case "Tier 1":
      strengths.push("Graduate of a top-tier institute");
      score += 20;
      break;
    case "Tier 2":
      strengths.push("Graduate of a strong (Tier 2) college");
      score += 12;
      break;
    case "Tier 3":
      gaps.push("Not from a top-tier college");
      score += 5;
      break;
    case "Tier 4":
      gaps.push("College brand alone won't open doors");
      break;
  }

  // Academics.
  const cgpa = Number(p.cgpa);
  if (Number.isFinite(cgpa) && cgpa > 0) {
    if (cgpa >= 8) {
      strengths.push(`Strong academics (CGPA ${cgpa})`);
      score += 10;
    } else if (cgpa >= 7) {
      score += 6;
    } else if (cgpa >= 6) {
      score += 2;
      gaps.push(`CGPA ${cgpa} may miss some cut-offs`);
    } else {
      gaps.push(`CGPA ${cgpa} is below most cut-offs`);
    }
  }

  // Work experience.
  const working = p.occupation === "Working Professional";
  const yrs = working ? Number(p.yearsOfExperience ?? 0) : 0;
  if (working && yrs >= 1) {
    strengths.push(`${yrs} year${yrs === 1 ? "" : "s"} of work experience`);
    score += Math.min(yrs, 5) * 3;
  } else {
    gaps.push("No work experience yet");
  }

  // Proof of skills.
  if (p.hasInternships) {
    strengths.push("Has done internships");
    score += 8;
  }
  if (p.hasCertifications) {
    strengths.push("Has certifications");
    score += 5;
  }
  if (p.hasInternships === false && p.hasCertifications === false) {
    gaps.push("No internships or certifications");
  }
  if (p.hasPortfolio) {
    strengths.push("Projects live on GitHub / a portfolio");
    score += 10;
  } else if (p.hasPortfolio === false) {
    gaps.push("No projects on GitHub or a portfolio");
  }

  // Time since graduation (only a gap when they aren't working yet).
  const year = now.getFullYear();
  if (p.graduationYear) {
    const since = year - p.graduationYear;
    if (since < 0) {
      strengths.push(`Starting early — graduating in ${p.graduationYear}`);
      score += 3;
    } else if (!working && since >= 1) {
      gaps.push(`Graduated ${since} year${since === 1 ? "" : "s"} ago, not yet placed`);
      score -= Math.min(since - 1, 2) * 5;
    }
  }

  // Skills breadth.
  const skills = (p.skills ?? []).filter(Boolean);
  if (skills.length >= 3) {
    strengths.push(`Comfortable with ${skills.slice(0, 3).join(", ")}`);
  }
  score += Math.min(skills.length, 4) * 2;

  // Everyone has at least one strength to build on.
  if (strengths.length === 0) strengths.push(p.degree ? `${p.degree} degree completed` : "Graduation completed");

  score = Math.round(clamp(score, 15, 95));
  const band = score >= 75 ? "Placement ready" : score >= 55 ? "Almost there" : "Needs building";
  return { strengths: strengths.slice(0, 4), gaps: gaps.slice(0, 4), score, band };
}


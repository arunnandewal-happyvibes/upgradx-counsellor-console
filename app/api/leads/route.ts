import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { COLLEGE_TIERS } from "@/lib/learnerInsights";

function intInRange(v: unknown, lo: number, hi: number): number | null {
  if (v === "" || v === null || v === undefined) return null;
  const n = Number(v);
  return Number.isInteger(n) && n >= lo && n <= hi ? n : null;
}
const bool = (v: unknown) => (typeof v === "boolean" ? v : null);
const capStr = (v: unknown, max: number) => (typeof v === "string" && v.trim() ? v.trim().slice(0, max) : null);
const capArr = (v: unknown, maxItems: number, maxLen: number) =>
  Array.isArray(v) ? v.filter((x): x is string => typeof x === "string").map((x) => x.slice(0, maxLen)).slice(0, maxItems) : [];

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, graduation, graduationCategory, cgpa, skills, interests, cityId, occupation, yearsOfExperience,
    graduationYear, age, collegeName, collegeTier, hasCertifications, hasInternships, hasPortfolio } = body ?? {};
  const thisYear = new Date().getFullYear();

  const nameClean = capStr(name, 160);
  if (!nameClean) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const lead = await prisma.lead.create({
    data: {
      name: nameClean,
      graduation: capStr(graduation, 120),
      graduationCategory: capStr(graduationCategory, 40),
      cgpa: capStr(cgpa, 20),
      skills: capArr(skills, 50, 80),
      interests: capArr(interests, 10, 60),
      cityId: typeof cityId === "string" ? cityId : null,
      occupation: occupation === "Working Professional" ? "Working Professional" : occupation === "Student" ? "Student" : null,
      // Experience only makes sense for working professionals; keep it a sane non-negative number.
      yearsOfExperience:
        occupation === "Working Professional" &&
        Number.isFinite(Number(yearsOfExperience)) &&
        yearsOfExperience !== "" &&
        yearsOfExperience !== null &&
        Number(yearsOfExperience) >= 0 &&
        Number(yearsOfExperience) <= 60
          ? Number(yearsOfExperience)
          : null,
      graduationYear: intInRange(graduationYear, 1970, thisYear + 6),
      age: intInRange(age, 15, 70),
      collegeName: typeof collegeName === "string" && collegeName.trim() ? collegeName.trim().slice(0, 160) : null,
      collegeTier: COLLEGE_TIERS.some((t) => t.value === collegeTier) ? collegeTier : null,
      hasCertifications: bool(hasCertifications),
      hasInternships: bool(hasInternships),
      hasPortfolio: bool(hasPortfolio),
    },
  });

  return NextResponse.json(lead, { status: 201 });
}

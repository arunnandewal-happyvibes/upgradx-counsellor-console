import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { COLLEGE_TIERS } from "@/lib/learnerInsights";

function intInRange(v: unknown, lo: number, hi: number): number | null {
  if (v === "" || v === null || v === undefined) return null;
  const n = Number(v);
  return Number.isInteger(n) && n >= lo && n <= hi ? n : null;
}
const bool = (v: unknown) => (typeof v === "boolean" ? v : null);

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, graduation, graduationCategory, cgpa, skills, interests, cityId, occupation, yearsOfExperience,
    graduationYear, age, collegeName, collegeTier, hasCertifications, hasInternships, hasPortfolio } = body ?? {};
  const thisYear = new Date().getFullYear();

  if (!name) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const lead = await prisma.lead.create({
    data: {
      name,
      graduation: graduation || null,
      graduationCategory: graduationCategory || null,
      cgpa: cgpa || null,
      skills: Array.isArray(skills) ? skills : [],
      interests: Array.isArray(interests) ? interests : [],
      cityId: cityId || null,
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

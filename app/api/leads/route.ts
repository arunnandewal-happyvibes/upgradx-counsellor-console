import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, graduation, graduationCategory, cgpa, skills, interests, cityId, occupation, yearsOfExperience } = body ?? {};

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
    },
  });

  return NextResponse.json(lead, { status: 201 });
}

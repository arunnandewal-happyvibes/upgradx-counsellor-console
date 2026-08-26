import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, graduation, graduationCategory, cgpa, skills } = body ?? {};

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
    },
  });

  return NextResponse.json(lead, { status: 201 });
}

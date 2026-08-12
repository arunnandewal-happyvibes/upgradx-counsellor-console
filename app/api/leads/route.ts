import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, phone, email, cityId, qualification } = body ?? {};

  if (!name || !phone || !email || !cityId || !qualification) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const lead = await prisma.lead.create({
    data: { name, phone, email, cityId, qualification },
    include: { city: true },
  });

  return NextResponse.json(lead, { status: 201 });
}

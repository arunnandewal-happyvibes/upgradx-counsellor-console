import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { occurrenceId, name, phone } = await req.json();
  if (!occurrenceId || !name || !phone) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }
  const registration = await prisma.eventRegistration.create({
    data: { occurrenceId, name, phone },
  });
  return NextResponse.json(registration, { status: 201 });
}

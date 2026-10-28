import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const occurrenceId = typeof body?.occurrenceId === "string" ? body.occurrenceId : "";
  const name = typeof body?.name === "string" ? body.name.trim().slice(0, 120) : "";
  const phone = typeof body?.phone === "string" ? body.phone.trim().slice(0, 30) : "";
  if (!occurrenceId || !name || !phone) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }
  const registration = await prisma.eventRegistration.create({
    data: { occurrenceId, name, phone },
  });
  return NextResponse.json(registration, { status: 201 });
}

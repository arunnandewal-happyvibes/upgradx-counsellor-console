import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Shown across every centre (not filtered by city) — each occurrence already
// carries its own city name so counsellors can still tell them apart.
export async function GET() {
  const occurrences = await prisma.eventOccurrence.findMany({
    where: { event: { isEnabled: true } },
    orderBy: { date: "asc" },
    include: { event: true, city: true },
  });

  return NextResponse.json(occurrences);
}

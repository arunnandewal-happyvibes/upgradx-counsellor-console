import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const citySlug = req.nextUrl.searchParams.get("city");
  if (!citySlug) return NextResponse.json([]);

  const occurrences = await prisma.eventOccurrence.findMany({
    where: { city: { slug: citySlug }, event: { isEnabled: true } },
    orderBy: { date: "asc" },
    include: { event: true, city: true },
  });

  return NextResponse.json(occurrences);
}

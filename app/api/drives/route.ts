import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const all = req.nextUrl.searchParams.get("all") === "1";

  // Shown across every centre (not filtered by city) — each drive carries
  // its own city name so counsellors can still tell them apart.
  const drives = await prisma.placementDrive.findMany({
    orderBy: { date: "asc" },
    take: all ? undefined : 4,
    include: { city: { select: { name: true } } },
  });

  return NextResponse.json(drives);
}

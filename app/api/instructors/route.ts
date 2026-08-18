import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const citySlug = req.nextUrl.searchParams.get("city");
  const leaderOnly = req.nextUrl.searchParams.get("leader") === "1";

  // Industry Leaders are guest SMEs who speak across every centre, not
  // city-based teaching staff — so unlike regular instructors, they're not
  // filtered by the selected city.
  if (leaderOnly) {
    const leaders = await prisma.instructor.findMany({
      where: { isIndustryLeader: true },
      orderBy: { order: "asc" },
    });
    return NextResponse.json(leaders);
  }

  if (!citySlug) return NextResponse.json([]);

  const instructors = await prisma.instructor.findMany({
    where: { city: { slug: citySlug }, isIndustryLeader: false },
    orderBy: { order: "asc" },
  });

  return NextResponse.json(instructors);
}

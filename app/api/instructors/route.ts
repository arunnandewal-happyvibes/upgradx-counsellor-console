import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const leaderOnly = req.nextUrl.searchParams.get("leader") === "1";

  // Both Instructors and Industry Leaders are shown across every centre
  // (not filtered by the selected city) so counsellors can see the full
  // roster regardless of which city is active.
  const instructors = await prisma.instructor.findMany({
    where: { isIndustryLeader: leaderOnly },
    orderBy: { order: "asc" },
    include: { city: { select: { name: true } } },
  });

  return NextResponse.json(instructors);
}

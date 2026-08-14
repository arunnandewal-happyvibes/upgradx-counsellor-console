import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const citySlug = req.nextUrl.searchParams.get("city");
  const leaderOnly = req.nextUrl.searchParams.get("leader") === "1";

  if (!citySlug) return NextResponse.json([]);

  const instructors = await prisma.instructor.findMany({
    where: { city: { slug: citySlug }, isIndustryLeader: leaderOnly },
    orderBy: { order: "asc" },
  });

  return NextResponse.json(instructors);
}

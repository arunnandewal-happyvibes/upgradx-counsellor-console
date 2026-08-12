import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const citySlug = req.nextUrl.searchParams.get("city");
  const all = req.nextUrl.searchParams.get("all") === "1";
  if (!citySlug) return NextResponse.json([]);

  const drives = await prisma.placementDrive.findMany({
    where: { city: { slug: citySlug } },
    orderBy: { date: "asc" },
    take: all ? undefined : 4,
  });

  return NextResponse.json(drives);
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const all = req.nextUrl.searchParams.get("all") === "1";
  const citySlug = req.nextUrl.searchParams.get("city");

  if (citySlug) {
    const cityFiltered = await prisma.batch.findMany({
      where: { city: { slug: citySlug } },
      orderBy: { startDate: "asc" },
      take: all ? undefined : 5,
      include: { program: true, city: { select: { name: true } } },
    });
    // Prefer batches in the student's chosen city, but never show an empty
    // section — fall back to every city if theirs has none scheduled yet.
    if (cityFiltered.length > 0) {
      return NextResponse.json(cityFiltered);
    }
  }

  const batches = await prisma.batch.findMany({
    orderBy: { startDate: "asc" },
    take: all ? undefined : 5,
    include: { program: true, city: { select: { name: true } } },
  });

  return NextResponse.json(batches);
}

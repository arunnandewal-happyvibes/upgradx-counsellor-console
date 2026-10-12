import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { startOfToday } from "@/lib/dateFilters";

export async function GET(req: NextRequest) {
  const all = req.nextUrl.searchParams.get("all") === "1";
  const citySlug = req.nextUrl.searchParams.get("city");

  // Only show batches a student could still actually join — applications
  // still open (or opening today), regardless of when they start.
  const activeOnly = { applicationCloseDate: { gte: startOfToday() } };

  if (citySlug) {
    const cityFiltered = await prisma.batch.findMany({
      // Online batches aren't tied to a city, so they're relevant to every student.
      where: { OR: [{ city: { slug: citySlug } }, { mode: "Online" }], ...activeOnly },
      orderBy: { startDate: "asc" },
      take: all ? undefined : 5,
      include: { program: true, city: { select: { name: true } } },
    });
    // Prefer batches in the student's chosen city (plus online ones), but never
    // show an empty section — fall back to every city if theirs has none yet.
    if (cityFiltered.length > 0) {
      return NextResponse.json(cityFiltered);
    }
  }

  const batches = await prisma.batch.findMany({
    where: activeOnly,
    orderBy: { startDate: "asc" },
    take: all ? undefined : 5,
    include: { program: true, city: { select: { name: true } } },
  });

  return NextResponse.json(batches);
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const citySlug = req.nextUrl.searchParams.get("city");

  if (citySlug) {
    const cityFiltered = await prisma.successStory.findMany({
      where: { city: { slug: citySlug } },
      orderBy: { order: "asc" },
    });
    // Prefer stories from the student's chosen city, but never show an empty
    // section — fall back to every story if that city has none yet.
    if (cityFiltered.length > 0) {
      return NextResponse.json(cityFiltered);
    }
  }

  const stories = await prisma.successStory.findMany({ orderBy: { order: "asc" } });
  return NextResponse.json(stories);
}

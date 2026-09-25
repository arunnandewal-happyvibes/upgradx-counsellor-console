import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const interests = req.nextUrl.searchParams.get("interests");
  const interestList = interests ? interests.split(",").filter(Boolean) : [];

  if (interestList.length > 0) {
    const matched = await prisma.hiringPartner.findMany({
      where: { tags: { hasSome: interestList } },
      orderBy: { order: "asc" },
    });
    // Prefer partners tagged with the student's interests, but never show an
    // empty strip — fall back to every partner if none match yet.
    if (matched.length > 0) {
      return NextResponse.json(matched);
    }
  }

  const partners = await prisma.hiringPartner.findMany({ orderBy: { order: "asc" } });
  return NextResponse.json(partners);
}

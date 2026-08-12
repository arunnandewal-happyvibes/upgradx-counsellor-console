import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const citySlug = req.nextUrl.searchParams.get("city");
  const all = req.nextUrl.searchParams.get("all") === "1";
  if (!citySlug) return NextResponse.json([]);

  const batches = await prisma.batch.findMany({
    where: { city: { slug: citySlug } },
    orderBy: { startDate: "asc" },
    take: all ? undefined : 5,
    include: { program: true },
  });

  return NextResponse.json(batches);
}

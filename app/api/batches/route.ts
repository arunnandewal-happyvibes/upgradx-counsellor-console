import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const all = req.nextUrl.searchParams.get("all") === "1";

  // Shown across every centre (not filtered by city) — each batch carries
  // its own city name so counsellors can still tell them apart.
  const batches = await prisma.batch.findMany({
    orderBy: { startDate: "asc" },
    take: all ? undefined : 5,
    include: { program: true, city: { select: { name: true } } },
  });

  return NextResponse.json(batches);
}

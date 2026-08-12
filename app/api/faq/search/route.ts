import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim();
  if (!q) return NextResponse.json([]);

  const faqs = await prisma.faq.findMany({
    where: {
      OR: [
        { question: { contains: q, mode: "insensitive" } },
        { answer: { contains: q, mode: "insensitive" } },
      ],
    },
    include: { category: true },
    take: 20,
  });

  return NextResponse.json(faqs);
}

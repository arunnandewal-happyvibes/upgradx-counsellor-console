import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const citySlug = req.nextUrl.searchParams.get("city");
  if (!citySlug) return NextResponse.json(null);

  const contact = await prisma.cityContact.findFirst({ where: { city: { slug: citySlug } } });
  return NextResponse.json(contact);
}

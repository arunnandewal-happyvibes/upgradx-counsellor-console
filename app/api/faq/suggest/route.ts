import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const question = typeof body?.question === "string" ? body.question.trim().slice(0, 500) : "";
  const askedBy = typeof body?.askedBy === "string" ? body.askedBy.trim().slice(0, 120) : "";
  if (!question) {
    return NextResponse.json({ error: "Question is required" }, { status: 400 });
  }
  const suggestion = await prisma.suggestedQuestion.create({
    data: { question, askedBy: askedBy || null },
  });
  return NextResponse.json(suggestion, { status: 201 });
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { question, askedBy } = await req.json();
  if (!question?.trim()) {
    return NextResponse.json({ error: "Question is required" }, { status: 400 });
  }
  const suggestion = await prisma.suggestedQuestion.create({
    data: { question: question.trim(), askedBy: askedBy?.trim() || null },
  });
  return NextResponse.json(suggestion, { status: 201 });
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { clock } from "@/lib/transcriptFormat";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const rec = await prisma.sessionRecording.findUnique({
    where: { id: params.id },
    include: { lead: { select: { name: true } }, chunks: { orderBy: { seq: "asc" } } },
  });
  if (!rec) return new NextResponse("Not found", { status: 404 });

  const lines = [
    `Counselling session transcript`,
    `Learner: ${rec.lead?.name ?? "(not linked)"}`,
    `Counsellor: ${rec.counsellorEmail ?? "(unknown)"}`,
    `Started: ${rec.startedAt.toISOString()}`,
    `Consent confirmed: ${rec.consentConfirmedAt.toISOString()}`,
    "",
    ...rec.chunks.filter((c) => c.text.trim()).map((c) => `[${clock(c.offsetSec)}] ${c.text.trim()}`),
    "",
  ];
  const safe = (rec.lead?.name ?? "session").replace(/[^a-z0-9]+/gi, "-").toLowerCase();
  return new NextResponse(lines.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Content-Disposition": `attachment; filename="transcript-${safe}-${rec.startedAt.toISOString().slice(0, 10)}.txt"`,
    },
  });
}

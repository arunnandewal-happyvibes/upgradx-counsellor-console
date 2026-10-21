import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { clock } from "@/lib/transcriptFormat";

export const dynamic = "force-dynamic";

export default async function TranscriptDetailPage({ params }: { params: { id: string } }) {
  const rec = await prisma.sessionRecording.findUnique({
    where: { id: params.id },
    include: { lead: { select: { name: true, email: true, phone: true } }, chunks: { orderBy: { seq: "asc" } } },
  });
  if (!rec) notFound();

  const spoken = rec.chunks.filter((c) => c.text.trim());

  return (
    <div className="max-w-3xl">
      <Link href="/admin/transcripts" className="text-sm font-semibold text-brand-gray-400 hover:text-brand-red">
        ← All transcripts
      </Link>
      <div className="mb-6 mt-3 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-brand-ink">{rec.lead?.name ?? "Unlinked session"}</h1>
          <p className="mt-1 text-sm text-brand-ink2">
            {rec.startedAt.toLocaleString("en-IN", { dateStyle: "long", timeStyle: "short" })}
            {rec.counsellorEmail ? ` · Counsellor: ${rec.counsellorEmail}` : ""}
            {rec.lead?.email ? ` · ${rec.lead.email}` : ""}
          </p>
          <p className="mt-1 text-xs text-brand-gray-400">
            Recorded with the student&apos;s consent, confirmed by the counsellor on{" "}
            {rec.consentConfirmedAt.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}.
            Machine-transcribed, so names and numbers can be wrong. It doesn&apos;t label who is speaking.
          </p>
        </div>
        {spoken.length > 0 && (
          <a
            href={`/admin/transcripts/${rec.id}/download`}
            className="rounded-lg border border-brand-red px-4 py-2 text-sm font-bold text-brand-red hover:bg-brand-redLight"
          >
            Download .txt
          </a>
        )}
      </div>

      {spoken.length === 0 ? (
        <p className="rounded-2xl border border-outline-variant bg-white p-4 text-sm text-brand-gray-400">
          No speech was transcribed for this session.
        </p>
      ) : (
        <div className="space-y-4 rounded-[20px] border border-outline-variant bg-white p-6">
          {spoken.map((c) => (
            <p key={c.id} className="text-sm leading-relaxed text-brand-ink">
              <span className="mr-3 font-mono text-xs font-semibold text-brand-red">[{clock(c.offsetSec)}]</span>
              {c.text}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

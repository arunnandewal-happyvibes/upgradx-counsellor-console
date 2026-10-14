import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Table, Th, Td } from "@/components/admin/AdminUI";
import { clock } from "@/lib/transcriptFormat";

export const dynamic = "force-dynamic";

export default async function TranscriptsAdminPage() {
  const recordings = await prisma.sessionRecording.findMany({
    orderBy: { startedAt: "desc" },
    include: {
      lead: { select: { name: true } },
      chunks: { select: { text: true, offsetSec: true } },
    },
  });

  return (
    <div>
      <h1 className="mb-1 text-2xl font-extrabold text-brand-ink">Session Transcripts</h1>
      <p className="mb-6 max-w-2xl text-sm text-brand-ink2">
        Text transcripts of counselling sessions the counsellor chose to record, after confirming the
        student agreed. Audio isn&apos;t stored. A transcript is linked to its learner once the session
        is closed. Handle these as confidential.
      </p>

      <Table>
        <thead>
          <tr>
            <Th>Started</Th>
            <Th>Learner</Th>
            <Th>Counsellor</Th>
            <Th>Length</Th>
            <Th>Words</Th>
            <Th>Status</Th>
            <Th></Th>
          </tr>
        </thead>
        <tbody>
          {recordings.map((r) => {
            const lastOffset = r.chunks.reduce((m, c) => Math.max(m, c.offsetSec), 0);
            const words = r.chunks.reduce((n, c) => n + (c.text.trim() ? c.text.trim().split(/\s+/).length : 0), 0);
            return (
              <tr key={r.id} className="border-t border-brand-gray-100">
                <Td className="whitespace-nowrap font-semibold text-brand-ink">
                  {r.startedAt.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                </Td>
                <Td>{r.lead?.name ?? "— (session not closed)"}</Td>
                <Td>{r.counsellorEmail ?? "—"}</Td>
                <Td>{r.chunks.length > 0 ? `~${clock(lastOffset + 30)}` : "—"}</Td>
                <Td>{words}</Td>
                <Td>{r.endedAt ? "Closed" : "In progress / not closed"}</Td>
                <Td>
                  <Link href={`/admin/transcripts/${r.id}`} className="text-sm font-semibold text-brand-red hover:underline">
                    View
                  </Link>
                </Td>
              </tr>
            );
          })}
          {recordings.length === 0 && (
            <tr>
              <td colSpan={7} className="px-3 py-2 text-sm text-brand-gray-400">
                No recorded sessions yet.
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </div>
  );
}

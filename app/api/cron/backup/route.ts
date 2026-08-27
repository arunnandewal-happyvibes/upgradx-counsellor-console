import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { buildSnapshot } from "@/lib/snapshot";

export const dynamic = "force-dynamic";

// Vercel Cron sends `Authorization: Bearer $CRON_SECRET` on scheduled
// invocations (see vercel.json) — this rejects any other caller.
export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json({ error: "BLOB_READ_WRITE_TOKEN not configured" }, { status: 500 });
  }

  const snapshot = await buildSnapshot();
  const filename = `snapshot-${snapshot.capturedAt.replace(/[:.]/g, "-")}.json`;
  const blob = await put(`backups/${filename}`, JSON.stringify(snapshot, null, 2), {
    access: "public",
    contentType: "application/json",
  });

  return NextResponse.json({ ok: true, url: blob.url, counts: snapshot.counts });
}

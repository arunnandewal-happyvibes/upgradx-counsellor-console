import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { transcribeAudio, transcriptionEnabled } from "@/lib/transcription";
import { vocabularyPrompt } from "@/lib/vocabulary";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const KEY_RE = /^[a-zA-Z0-9-]{16,64}$/;
const MAX_AUDIO_BYTES = 4 * 1024 * 1024; // a 30s Opus chunk is ~0.3MB; this is a generous ceiling
const MAX_CHUNKS_PER_SESSION = 600; // 5 hours of 30s chunks — stops a runaway or abusive client

/** Receives one ~30s audio piece of a counselling session, turns it into text, and stores only
 * the text. Recording can only begin with `consent=1` (the counsellor confirmed the student agreed). */
export async function POST(req: NextRequest) {
  if (!transcriptionEnabled()) {
    return NextResponse.json({ error: "Transcription isn't configured." }, { status: 503 });
  }

  const form = await req.formData().catch(() => null);
  const audio = form?.get("audio");
  const sessionKey = String(form?.get("sessionKey") ?? "");
  const seq = Number(form?.get("seq"));
  const offsetSec = Number(form?.get("offsetSec") ?? 0);
  const consent = form?.get("consent") === "1";
  const counsellorEmail = String(form?.get("counsellorEmail") ?? "").trim().toLowerCase() || null;

  if (!(audio instanceof Blob) || audio.size === 0 || audio.size > MAX_AUDIO_BYTES) {
    return NextResponse.json({ error: "Missing or oversized audio." }, { status: 400 });
  }
  if (!KEY_RE.test(sessionKey) || !Number.isInteger(seq) || seq < 0 || seq >= MAX_CHUNKS_PER_SESSION) {
    return NextResponse.json({ error: "Invalid session or sequence." }, { status: 400 });
  }

  let recording = await prisma.sessionRecording.findUnique({ where: { sessionKey } });
  if (!recording) {
    if (!consent) {
      return NextResponse.json({ error: "Recording needs the student's consent." }, { status: 403 });
    }
    recording = await prisma.sessionRecording.create({
      data: { sessionKey, counsellorEmail, consentConfirmedAt: new Date() },
    });
  }

  // A retried upload must not be transcribed (and billed) twice.
  const existing = await prisma.transcriptChunk.findUnique({
    where: { recordingId_seq: { recordingId: recording.id, seq } },
    select: { text: true },
  });
  if (existing) return NextResponse.json({ ok: true, text: existing.text, duplicate: true });

  let text: string;
  try {
    text = await transcribeAudio(audio, audio instanceof File && audio.name ? audio.name : "chunk.webm", await vocabularyPrompt());
  } catch (err) {
    console.error("transcribe failed:", err);
    return NextResponse.json({ error: "Speech-to-text service error." }, { status: 502 });
  }

  // Store an empty chunk too, so silence still counts as handled and isn't re-sent.
  await prisma.transcriptChunk.upsert({
    where: { recordingId_seq: { recordingId: recording.id, seq } },
    create: { recordingId: recording.id, seq, offsetSec: Number.isFinite(offsetSec) ? offsetSec : 0, text },
    update: {},
  });
  return NextResponse.json({ ok: true, text });
}

import { NextRequest, NextResponse } from "next/server";
import { answerQuestion, type LearnerContext, type Turn } from "@/lib/assistant";
import { llmEnabled, LlmError } from "@/lib/llm";
import { transcribeQuestion, transcriptionEnabled } from "@/lib/transcription";
import { vocabularyPrompt } from "@/lib/vocabulary";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const MAX_AUDIO_BYTES = 4 * 1024 * 1024;
const MAX_QUESTION_CHARS = 500;

// Best-effort per-instance limiter so a stray script can't burn the free-tier quota.
const hits = new Map<string, { n: number; reset: number }>();
function limited(ip: string) {
  const now = Date.now();
  const h = hits.get(ip);
  if (!h || now > h.reset) {
    hits.set(ip, { n: 1, reset: now + 60_000 });
    return false;
  }
  h.n++;
  return h.n > 20;
}

function parseContext(raw: unknown): { history: Turn[]; learner: LearnerContext } {
  let o: Record<string, unknown> = {};
  try {
    o = typeof raw === "string" ? JSON.parse(raw) : (raw as Record<string, unknown>) ?? {};
  } catch {}
  const history = (Array.isArray(o.history) ? o.history : [])
    .filter((t): t is Turn => (t?.role === "user" || t?.role === "assistant") && typeof t.content === "string")
    .map((t) => ({ role: t.role, content: t.content.slice(0, 600) }))
    .slice(-6);
  const l = (o.learner ?? {}) as Record<string, unknown>;
  const learner: LearnerContext = {
    degree: typeof l.degree === "string" ? l.degree.slice(0, 60) : null,
    occupation: l.occupation === "Student" || l.occupation === "Working Professional" ? l.occupation : null,
    yearsOfExperience: typeof l.yearsOfExperience === "number" ? l.yearsOfExperience : null,
    interests: Array.isArray(l.interests) ? l.interests.filter((x): x is string => typeof x === "string").slice(0, 6) : [],
    citySlug: typeof l.citySlug === "string" && /^[a-z0-9-]{1,60}$/.test(l.citySlug) ? l.citySlug : null,
  };
  return { history, learner };
}

/** Takes a counsellor's question as audio (transcribed here) or text, and returns a short answer
 * written to be spoken aloud, grounded in the platform's own content via tool lookups. */
export async function POST(req: NextRequest) {
  if (!llmEnabled()) return NextResponse.json({ error: "The assistant isn't configured." }, { status: 503 });
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  if (limited(ip)) return NextResponse.json({ error: "Too many questions — try again in a minute." }, { status: 429 });

  let question = "";
  let context: unknown;
  const type = req.headers.get("content-type") ?? "";
  if (type.includes("multipart/form-data")) {
    const form = await req.formData().catch(() => null);
    const audio = form?.get("audio");
    context = form?.get("context");
    if (audio instanceof Blob) {
      if (audio.size === 0 || audio.size > MAX_AUDIO_BYTES) return NextResponse.json({ error: "Bad audio." }, { status: 400 });
      if (!transcriptionEnabled()) return NextResponse.json({ error: "Voice input isn't configured." }, { status: 503 });
      try {
        question = await transcribeQuestion(audio, audio instanceof File && audio.name ? audio.name : "question.webm", await vocabularyPrompt());
      } catch (err) {
        console.error("assistant stt failed:", err);
        return NextResponse.json({ error: "Couldn't understand the audio." }, { status: 502 });
      }
    } else {
      question = String(form?.get("text") ?? "");
    }
  } else {
    const body = await req.json().catch(() => ({}));
    question = String(body?.text ?? "");
    context = body?.context;
  }

  question = question.trim().slice(0, MAX_QUESTION_CHARS);
  if (!question) return NextResponse.json({ question: "", answer: "" });

  const { history, learner } = parseContext(context);
  try {
    const answer = await answerQuestion(question, history, learner);
    return NextResponse.json({ question, answer });
  } catch (err) {
    console.error("assistant failed:", err);
    if (err instanceof LlmError && err.status === 429) {
      return NextResponse.json({ error: "I'm getting a lot of questions right now — please try again in a few seconds." }, { status: 429 });
    }
    return NextResponse.json({ error: "The assistant is unavailable right now." }, { status: 502 });
  }
}

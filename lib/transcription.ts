// Speech-to-text via any OpenAI-compatible /audio/transcriptions endpoint. Defaults to Groq's
// hosted Whisper (free tier); point STT_BASE_URL at a self-hosted faster-whisper / whisper.cpp
// server to run it on your own machine instead.

const DEFAULT_BASE_URL = "https://api.groq.com/openai/v1";
const DEFAULT_MODEL = "whisper-large-v3-turbo";

export function transcriptionConfig() {
  return {
    apiKey: process.env.STT_API_KEY ?? process.env.GROQ_API_KEY ?? "",
    baseUrl: (process.env.STT_BASE_URL ?? DEFAULT_BASE_URL).replace(/\/$/, ""),
    model: process.env.STT_MODEL ?? DEFAULT_MODEL,
  };
}

export function transcriptionEnabled() {
  const c = transcriptionConfig();
  // A self-hosted server may not need a key, but then it must be configured explicitly.
  return Boolean(c.apiKey) || Boolean(process.env.STT_BASE_URL);
}

type Segment = { text?: string; no_speech_prob?: number; avg_logprob?: number };

/** Whisper invents words ("Thank you.", "Subtitles by…") over silence or room noise, so drop
 * segments it itself flags as probably-not-speech. */
export function cleanSegments(segments: Segment[] | undefined, fallbackText: string, lenient = false): string {
  if (!segments || segments.length === 0) return fallbackText.trim();
  const maxNoSpeech = lenient ? 0.9 : 0.6;
  const minLogprob = lenient ? -2 : -1.2;
  return segments
    .filter((s) => (s.no_speech_prob ?? 0) < maxNoSpeech && (s.avg_logprob ?? 0) > minLogprob)
    .map((s) => (s.text ?? "").trim())
    .filter(Boolean)
    .join(" ")
    .trim();
}

/** Whisper sometimes loops on a short clip ("Pru. Pru. Pru.") — a sign it hallucinated rather than heard. */
export function looksHallucinated(text: string): boolean {
  const words = text.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, " ").split(/\s+/).filter(Boolean);
  if (words.length < 3) return false;
  const top = Math.max(...Object.values(words.reduce<Record<string, number>>((m, w) => ((m[w] = (m[w] ?? 0) + 1), m), {})));
  return top / words.length >= 0.6;
}

/** Transcribe a short spoken question: with the vocabulary hint first, then — if that came back
 * empty or looping — once more without the hint and with looser filtering. */
export async function transcribeQuestion(audio: Blob, filename: string, prompt?: string): Promise<string> {
  const first = await transcribeAudio(audio, filename, prompt);
  if (first && !looksHallucinated(first)) return first;
  const second = await transcribeAudio(audio, filename, undefined, true);
  return looksHallucinated(second) ? "" : second;
}

export async function transcribeAudio(audio: Blob, filename: string, prompt?: string, lenient = false): Promise<string> {
  const { apiKey, baseUrl, model } = transcriptionConfig();
  const body = new FormData();
  body.append("file", audio, filename);
  body.append("model", model);
  body.append("response_format", "verbose_json");
  body.append("temperature", "0");
  if (prompt) body.append("prompt", prompt);

  const res = await fetch(`${baseUrl}/audio/transcriptions`, {
    method: "POST",
    headers: apiKey ? { Authorization: `Bearer ${apiKey}` } : {},
    body,
  });
  if (!res.ok) {
    const detail = (await res.text().catch(() => "")).slice(0, 300);
    throw new Error(`Speech-to-text failed (${res.status}): ${detail}`);
  }
  const json = (await res.json()) as { text?: string; segments?: Segment[] };
  return cleanSegments(json.segments, json.text ?? "", lenient);
}

import { NextResponse } from "next/server";
import { llmEnabled } from "@/lib/llm";
import { transcriptionEnabled } from "@/lib/transcription";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ enabled: llmEnabled(), voiceInput: transcriptionEnabled() });
}

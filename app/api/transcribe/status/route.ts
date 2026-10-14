import { NextResponse } from "next/server";
import { transcriptionEnabled } from "@/lib/transcription";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ enabled: transcriptionEnabled() });
}

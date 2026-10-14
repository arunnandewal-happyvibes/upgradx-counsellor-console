import { prisma } from "@/lib/prisma";

let cache: { at: number; text: string } | null = null;

/** Whisper mishears proper nouns ("Mumbi", "Bangalore" vs "Bengaluru"). Handing it the names it
 * should expect as a prompt makes city, program and brand names come out right far more often. */
export async function vocabularyPrompt(): Promise<string> {
  if (cache && Date.now() - cache.at < 10 * 60_000) return cache.text;
  try {
    const [cities, programs] = await Promise.all([
      prisma.city.findMany({ select: { name: true }, orderBy: { name: "asc" } }),
      prisma.program.findMany({ select: { name: true }, orderBy: { order: "asc" } }),
    ]);
    const text = `upGrad X counselling session. Learning centres in ${cities.map((c) => c.name.replace(/\s*\(.*\)/, "")).join(", ")}. Programs: ${programs.map((p) => p.name).join("; ")}.`.slice(0, 700);
    cache = { at: Date.now(), text };
    return text;
  } catch {
    return "upGrad X counselling session.";
  }
}

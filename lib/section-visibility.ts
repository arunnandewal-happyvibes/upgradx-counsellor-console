import { prisma } from "@/lib/prisma";

/**
 * Reusable per-section, optionally per-program visibility flag.
 * Defaults to visible when no row exists yet.
 */
export async function isSectionVisible(sectionKey: string, programId?: string | null) {
  const row = await prisma.sectionVisibility.findFirst({
    where: { sectionKey, programId: programId ?? null },
  });
  return row?.isVisible ?? true;
}

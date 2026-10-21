"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/requireAdmin";

export async function setSectionVisibility(sectionKey: string, programId: string, isVisible: boolean) {
  await requireAdmin();
  await prisma.sectionVisibility.upsert({
    where: { sectionKey_programId: { sectionKey, programId } },
    update: { isVisible },
    create: { sectionKey, programId, isVisible },
  });
  revalidatePath("/admin/section-visibility");
  revalidatePath("/console");
}

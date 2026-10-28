"use server";

import { requireAdmin } from "@/lib/requireAdmin";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { str } from "@/lib/adminParsing";

export async function updateJourneyStep(order: number, formData: FormData) {
  await requireAdmin();
  await prisma.journeyStep.update({
    where: { order },
    data: {
      title: str(formData.get("title")),
      description: str(formData.get("description")),
    },
  });
  revalidatePath("/admin/journey-steps");
  revalidatePath("/console");
}

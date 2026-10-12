"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function submitFeedback(token: string, rating: number): Promise<{ ok: boolean }> {
  if (!/^[a-f0-9]{32}$/.test(token) || !Number.isInteger(rating) || rating < 1 || rating > 5) {
    return { ok: false };
  }
  const result = await prisma.lead.updateMany({
    where: { feedbackToken: token },
    data: { rating, ratedAt: new Date() },
  });
  if (result.count === 0) return { ok: false };
  revalidatePath("/admin/sessions");
  return { ok: true };
}

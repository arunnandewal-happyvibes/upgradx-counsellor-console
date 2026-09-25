"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { sendSessionSummaryEmail } from "@/lib/email";

export type CloseSessionInput = {
  leadId: string | null;
  name: string;
  phone: string;
  email: string;
  programId: string | null;
  counsellorName: string | null;
  counsellorCity: string | null;
  rating: number;
};

export type CloseSessionResult = { ok: true; emailSent: boolean } | { ok: false; error: string };

export async function closeSession(input: CloseSessionInput): Promise<CloseSessionResult> {
  const name = input.name.trim();
  const phone = input.phone.trim();
  const email = input.email.trim();
  if (!name || !phone || !email) {
    return { ok: false, error: "Name, phone and email are required." };
  }

  const data = {
    name,
    phone,
    email,
    recommendedProgramId: input.programId || null,
    counsellorName: input.counsellorName?.trim() || null,
    counsellorCity: input.counsellorCity?.trim() || null,
    rating: Number.isInteger(input.rating) && input.rating >= 1 && input.rating <= 5 ? input.rating : null,
    sessionClosedAt: new Date(),
  };

  // Update the lead created during onboarding when we have its id; otherwise
  // (student skipped onboarding, or the id is stale) create a fresh row.
  const updated = input.leadId
    ? await prisma.lead
        .update({ where: { id: input.leadId }, data })
        .catch(() => null)
    : null;
  const savedLead = updated ?? (await prisma.lead.create({ data }));

  let programName: string | null = null;
  let programDuration: string | null = null;
  if (savedLead.recommendedProgramId) {
    const program = await prisma.program.findUnique({
      where: { id: savedLead.recommendedProgramId },
      select: { name: true, duration: true },
    });
    programName = program?.name ?? null;
    programDuration = program?.duration ?? null;
  }

  const emailSent = await sendSessionSummaryEmail({
    to: email,
    studentName: name,
    programName,
    programDuration,
    counsellorName: data.counsellorName,
    rating: data.rating,
  });

  revalidatePath("/admin/sessions");
  return { ok: true, emailSent };
}

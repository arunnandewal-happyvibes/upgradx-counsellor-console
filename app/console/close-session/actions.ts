"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { randomBytes } from "crypto";
import { headers } from "next/headers";
import { sendSessionSummaryEmail } from "@/lib/email";
import { leadDropEnabled, submitLeadDrop } from "@/lib/leadDrop";

export type CloseSessionInput = {
  leadId: string | null;
  name: string;
  phone: string;
  email: string;
  programId: string | null;
  counsellorName: string | null;
  counsellorCity: string | null;
  counsellorEmail: string | null;
  recordingKey?: string | null;
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
    counsellorEmail: input.counsellorEmail?.trim().toLowerCase() || null,
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

  // Attach the session's transcript (if one was recorded) to this learner.
  if (input.recordingKey) {
    await prisma.sessionRecording
      .updateMany({
        where: { sessionKey: input.recordingKey, leadId: null },
        data: { leadId: savedLead.id, endedAt: new Date() },
      })
      .catch((err) => console.error("couldn't link recording to lead:", err));
  }

  // Unguessable key for the "rate your session" link in the student's email —
  // the rating comes from the student there, not from the counsellor's form.
  const feedbackToken =
    savedLead.feedbackToken ??
    (
      await prisma.lead.update({
        where: { id: savedLead.id },
        data: { feedbackToken: randomBytes(16).toString("hex") },
        select: { feedbackToken: true },
      })
    ).feedbackToken;

  const h = headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? (host?.startsWith("localhost") ? "http" : "https");
  const feedbackUrl = host && feedbackToken ? `${proto}://${host}/feedback/${feedbackToken}` : null;

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
    feedbackUrl,
  });

  // Drop the learner into upGrad's referral form (Salesforce) when enabled.
  // The result is recorded on the lead so admins can see sent/failed per session;
  // a failure here must never stop the session from closing.
  if (leadDropEnabled()) {
    const result = await submitLeadDrop({
      name,
      email,
      phone,
      city: data.counsellorCity,
    });
    await prisma.lead
      .update({
        where: { id: savedLead.id },
        data: { referralStatus: result.status, referralSentAt: result.ok ? new Date() : null },
      })
      .catch((err) => console.error("couldn't record referral status:", err));
    if (!result.ok) console.error("lead drop failed:", result.status);
  }

  revalidatePath("/admin/sessions");
  return { ok: true, emailSent };
}

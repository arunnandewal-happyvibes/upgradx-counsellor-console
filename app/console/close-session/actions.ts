"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { randomBytes } from "crypto";
import { headers } from "next/headers";
import { sendSessionSummaryEmail } from "@/lib/email";
import { leadDropEnabled } from "@/lib/leadDrop";
import { sendToLsq } from "@/lib/lsqSend";
import { getCentre } from "@/lib/centres";
import { normalizeMobile, validateCloseSession } from "@/lib/closeSessionRules";
import { computeInsights } from "@/lib/learnerInsights";
import { findRecommendationForDegree } from "@/lib/recommendationMatch";

export type CloseSessionInput = {
  leadId: string | null;
  name: string;
  countryCode: string;
  mobile: string;
  email: string;
  programId: string;
  source: string;
  centre: string; // a CENTRES value
  counsellorEmail: string | null; // the check-in email from the browser — verified server-side
  recordingKey?: string | null;
};

export type CloseSessionResult = { ok: true; emailSent: boolean } | { ok: false; error: string };

export async function closeSession(input: CloseSessionInput): Promise<CloseSessionResult> {
  // Repeat every form rule here: the action can be called without the form.
  const errors = validateCloseSession(input);
  if (Object.keys(errors).length > 0) {
    return { ok: false, error: Object.values(errors)[0]! };
  }
  const name = input.name.trim();
  const email = input.email.trim();
  const mobile = normalizeMobile(input.mobile);
  const phone = `${input.countryCode} ${mobile}`;
  const centre = getCentre(input.centre)!;

  const program = await prisma.program.findUnique({
    where: { id: input.programId },
    select: { id: true, lsqVertical: true, lsqProgramme: true },
  });
  if (!program) return { ok: false, error: "That program no longer exists — pick another." };

  // The check-in email lives in the browser, so only trust it after matching an active
  // Counsellor row here. Unmatched → no counsellor name and no LSQ owner (centre queue).
  const checkInEmail = input.counsellorEmail?.trim().toLowerCase() || null;
  const counsellor = checkInEmail
    ? await prisma.counsellor.findFirst({ where: { email: checkInEmail, active: true } })
    : null;

  const data = {
    name,
    phone,
    email,
    recommendedProgramId: program.id,
    counsellorName: counsellor?.name ?? null,
    counsellorCity: centre.label,
    counsellorEmail: checkInEmail,
    lsqSource: input.source,
    lsqCentre: centre.value,
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

  const selected = await prisma.program.findUnique({
    where: { id: program.id },
    select: { name: true, slug: true, duration: true, brochureUrl: true, certifications: { select: { brochureUrl: true }, take: 1 } },
  });
  const programName = selected?.name ?? null;
  const programDuration = selected?.duration ?? null;
  const brochureUrl = selected?.brochureUrl ?? selected?.certifications[0]?.brochureUrl ?? null;
  const brochure = brochureUrl && selected ? { url: brochureUrl, filename: `${selected.slug}-brochure.pdf` } : null;

  // Diagnostic one-pager, only when onboarding captured a profile for this learner.
  const profiled = !!(savedLead.graduation || savedLead.collegeTier || savedLead.graduationYear);
  const insights = profiled
    ? computeInsights({
        degree: savedLead.graduation,
        collegeTier: savedLead.collegeTier,
        graduationYear: savedLead.graduationYear,
        age: savedLead.age,
        cgpa: savedLead.cgpa,
        occupation: savedLead.occupation,
        yearsOfExperience: savedLead.yearsOfExperience,
        hasCertifications: savedLead.hasCertifications,
        hasInternships: savedLead.hasInternships,
        hasPortfolio: savedLead.hasPortfolio,
        skills: savedLead.skills,
      })
    : null;
  const programs = selected ? [{ name: selected.name, duration: selected.duration }] : [];
  if (insights && savedLead.graduation) {
    const recs = await prisma.degreeRecommendation.findMany({
      orderBy: { order: "asc" },
      select: {
        degree: true,
        choice1ProgramId: true,
        choice1Program: { select: { name: true, duration: true } },
        choice2Program: { select: { name: true, duration: true } },
        choice3Program: { select: { name: true, duration: true } },
      },
    });
    const rec = findRecommendationForDegree(recs, savedLead.graduation);
    const next = rec && [rec.choice1Program, rec.choice2Program, rec.choice3Program].find((p) => p && p.name !== programName);
    if (next) programs.push({ name: next.name, duration: next.duration });
  }

  const emailSent = await sendSessionSummaryEmail({
    to: email,
    studentName: name,
    programName,
    programDuration,
    counsellorName: data.counsellorName,
    feedbackUrl,
    insights,
    programs,
    brochure,
  });

  // Send the learner to LeadSquared (only when LEAD_DROP_ENABLED=true — every call is a
  // real lead). A failure is recorded for admins and never stops the session closing.
  if (leadDropEnabled()) {
    await sendToLsq(savedLead.id).catch((err) => console.error("LSQ drop failed:", err));
  }

  revalidatePath("/admin/sessions");
  return { ok: true, emailSent };
}


/** Name + home centre for the checked-in counsellor, shown read-only on Close Session.
 * Returns only those two fields (never other counsellors' data). */
export async function getCounsellorProfile(email: string | null): Promise<{ name: string; centre: string } | null> {
  const e = email?.trim().toLowerCase();
  if (!e) return null;
  const c = await prisma.counsellor.findFirst({ where: { email: e, active: true }, select: { name: true, centre: true } });
  return c ?? null;
}

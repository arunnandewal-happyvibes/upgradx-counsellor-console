import { prisma } from "@/lib/prisma";
import { buildCampaign, COURSE_LABEL, describeDrop, dropLead } from "@/lib/leadDrop";
import { getCentre } from "@/lib/centres";

// Deliberately NOT in a "use server" file: exports there become publicly callable server
// actions, and this creates real LSQ leads. Callers: closeSession (after the flag check)
// and the admin Re-send action (admin-only route, also flag-checked).
/** Builds the LSQ payload from what's stored on the Lead and sends it. Used on close and by
 * the admin Re-send button, so a re-send uses exactly the stored values. Caller checks the flag. */
export async function sendToLsq(leadId: string) {
  const lead = await prisma.lead.findUnique({
    where: { id: leadId },
    include: { recommendedProgram: { select: { lsqVertical: true, lsqProgramme: true } } },
  });
  if (!lead) return;
  const centre = getCentre(lead.lsqCentre);
  const prog = lead.recommendedProgram;
  const failWith = (status: string) =>
    prisma.lead.update({ where: { id: lead.id }, data: { referralStatus: status, referralSentAt: null } });

  if (!lead.phone || !lead.email || !lead.lsqSource || !centre) return failWith("Not sent: missing centre, source or contact");
  if (!prog?.lsqVertical || !prog.lsqProgramme || !COURSE_LABEL[prog.lsqProgramme]) {
    return failWith("Not sent: program has no LSQ code (set it in admin → Courses)");
  }

  const owner = lead.counsellorEmail
    ? await prisma.counsellor.findFirst({ where: { email: lead.counsellorEmail, active: true }, select: { email: true } })
    : null;
  const campaign = buildCampaign(centre.word, prog.lsqVertical, prog.lsqProgramme);
  const result = await dropLead({
    name: lead.name,
    email: lead.email,
    phone: lead.phone,
    source: lead.lsqSource,
    campaign,
    course: COURSE_LABEL[prog.lsqProgramme],
    ownerEmail: owner?.email ?? null,
  });
  await prisma.lead.update({
    where: { id: lead.id },
    data: {
      referralStatus: describeDrop(result, !!owner),
      referralSentAt: result.ok ? new Date() : null,
      lsqCampaign: campaign,
      lsqOwnerEmail: owner?.email ?? null,
      ...(result.leadIdentifier ? { lsqLeadId: result.leadIdentifier } : {}),
    },
  });
  if (!result.ok) console.error("LSQ drop failed:", result.status);
}

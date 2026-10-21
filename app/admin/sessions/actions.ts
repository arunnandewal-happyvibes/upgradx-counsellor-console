"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/requireAdmin";
import { leadDropEnabled } from "@/lib/leadDrop";
import { sendToLsq } from "@/lib/lsqSend";

/** Re-sends a failed LSQ drop with the values stored on the Lead. Creates a real LSQ lead,
 * so it's admin-only and does nothing unless LEAD_DROP_ENABLED is on. */
export async function resendLsq(leadId: string) {
  await requireAdmin();
  if (!leadDropEnabled()) return;
  await sendToLsq(leadId);
  revalidatePath("/admin/sessions");
}

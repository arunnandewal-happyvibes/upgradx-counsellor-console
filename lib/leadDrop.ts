// Sends a closed session to LeadSquared as a Learning Centre lead via upGrad's v6
// drop-lead endpoint (LSQ_INTEGRATION.md). The payload below is the one tested in
// production on 21 Oct 2026 (test 7) — do not change the fixed body fields, and never add
// offlineCentreName or any mx_* key to extraFields.
//
// ⚠️ There is no test environment: every call creates or updates a REAL LSQ lead. Nothing
// is sent unless LEAD_DROP_ENABLED=true, and that flag is turned on only for the joint
// production test run by the team (doc §7). Keep this module server-only.

const URL = "https://prodapi.upgrad.com/apis/v6/drop-lead"; // production only
export const LSQ_MEDIUM = "upgradx_walk_in_expert";

// Program of Interest labels LC leads already use in LSQ — keep the exact spelling.
export const COURSE_LABEL: Record<string, string> = {
  DA: "Data Analytics",
  DS: "Data Science",
  FSD: "Full Stack Development",
  AI: "Artificial Intelligence  GenAI", // two spaces, exactly as in LSQ
  DM: "Digital Marketing",
  IBOps: "Finance",
};
export const LSQ_PROGRAMMES = Object.keys(COURSE_LABEL);
export const LSQ_VERTICALS = ["Tech", "Finance"] as const;

export function leadDropEnabled() {
  return process.env.LEAD_DROP_ENABLED === "true";
}

export function buildCampaign(centreWord: string, vertical: string, programme: string) {
  return `LearningCentre_${centreWord}_Offline_${vertical}_${programme}_Walkin`;
}

/** "Arun Kumar Nandewal" → { first: "Arun", last: "Kumar Nandewal" }; single words get "-" as last name. */
export function splitName(full: string): { first: string; last: string } {
  const parts = full.trim().split(/\s+/);
  return { first: parts[0] ?? "", last: parts.slice(1).join(" ") || "-" };
}

/** "+91 98765 43210" / "09876543210" → { code: "+91", number: "9876543210" }. */
export function splitPhone(raw: string): { code: string; number: string } {
  const digits = raw.replace(/\D/g, "");
  const number = digits.slice(-10);
  const prefix = digits.slice(0, -10).replace(/^0+/, "");
  return { code: prefix ? `+${prefix}` : "+91", number };
}

export type LeadDropResult = {
  ok: boolean;
  status: string; // "Fresh" | "Reactivated" | "Repeat" | "Failed (500)" …
  leadIdentifier?: string;
};

export async function dropLead(input: {
  name: string;
  email: string;
  phone: string; // countryCode + 10-digit mobile, e.g. "+91 9876543210"
  source: string;
  campaign: string;
  course: string;
  ownerEmail: string | null; // counsellor's LSQ login (must be an active LC LSQ user); null → centre queue
}): Promise<LeadDropResult> {
  const { first, last } = splitName(input.name);
  const { code, number } = splitPhone(input.phone);
  try {
    const res = await fetch(URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        utm_source: input.source,
        utm_medium: LSQ_MEDIUM,
        utm_campaign: input.campaign,
      },
      body: JSON.stringify({
        firstname: first,
        lastname: last,
        email: input.email,
        phone: { code, number },
        course: input.course,
        city: "",
        state: ".",
        country: "India",
        isDetectLocation: false,
        sendWelcomeMail: false,
        emailTemplateSuffix: "",
        clickIdentifier: "",
        // Option B (tested 21 Oct): Instapage platform + counsellor email → LSQ assigns the lead to that counsellor.
        leadSource: input.ownerEmail
          ? { platform: "INSTAPAGE_COCO_Walkins", platformSection: "Instapage", platformCounsellor: input.ownerEmail }
          : { platform: "", platformSection: "LeadGen", platformCounsellor: "" },
        extraFields: { yearOfGraduation: "", degree: "", platformUrl: "" },
      }),
      signal: AbortSignal.timeout(10_000),
      cache: "no-store",
    });
    if (!res.ok) return { ok: false, status: `Failed (${res.status})` };
    const data = (await res.json()) as { leadType?: string; leadIdentifier?: string };
    return { ok: true, status: data.leadType ?? "Sent", leadIdentifier: data.leadIdentifier };
  } catch (err) {
    return { ok: false, status: `Failed: ${err instanceof Error ? err.message : "unknown"}` };
  }
}

/** Human label for the admin view, given the API status and whether a counsellor was sent. */
export function describeDrop(result: LeadDropResult, hadCounsellor: boolean): string {
  if (!result.ok) return result.status;
  if (result.status === "Fresh") return hadCounsellor ? "Fresh" : "Fresh – no counsellor";
  return result.status; // Reactivated / Repeat
}

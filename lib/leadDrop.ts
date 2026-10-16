// Auto-submits a closed session's learner to upGrad's internal "Lead Drop Form"
// (https://referrals.upgrad.com/lc — Academic Counsellors / Centre Managers only).
//
// The page is an Instapage form that posts to d.fastcdn.co/submissions with signed
// integration configs (Salesforce + Zapier) embedded as hidden inputs. There is no
// official API, so we fetch the live page, lift those hidden configs fresh each time,
// and replay the exact same POST the browser would make. If upGrad edits the page the
// submit may stop working — the status we store on the Lead makes that visible in
// admin → Closed Sessions rather than failing silently.
//
// Opt-in via LEAD_DROP_ENABLED=true; a failed drop never blocks closing a session.

const PAGE_URL = "https://referrals.upgrad.com/lc";
const SUBMIT_URL = "https://d.fastcdn.co/submissions";
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36";

// The form's Centre Name options, keyed by how our cities / counsellor cities are
// usually written. Cities with several upGrad centres get the flagship one.
const CENTRE_BY_CITY: Record<string, string> = {
  mumbai: "BKC-Mumbai",
  "navi mumbai": "BKC-Mumbai",
  thane: "Marol-Mumbai",
  bengaluru: "Bangalore",
  bangalore: "Bangalore",
  indore: "Indore",
  pune: "Pune",
  bhopal: "Bhopal",
  jaipur: "Jaipur",
  gurugram: "Gurugram",
  gurgaon: "Gurugram",
  delhi: "Gurugram",
  "new delhi": "Gurugram",
  noida: "Gurugram",
  bhubaneswar: "Bhubaneswar",
  sambhajinagar: "Sambhajinagar",
  "chhatrapati sambhajinagar": "Sambhajinagar",
  aurangabad: "Sambhajinagar",
  bhilwara: "Bhilwara",
  mangalore: "Mangalore",
  mangaluru: "Mangalore",
  hyderabad: "Ameerpet",
  ameerpet: "Ameerpet",
  madhapur: "Madhapur",
  coimbatore: "Coimbatore",
  jayanagar: "Jayanagar",
  marathahalli: "Marathahalli",
  raipur: "Raipur",
  jabalpur: "Jabalpur",
  panipat: "Panipat",
  kolkata: "Salt-lake-Kolkata2",
  "salt lake": "Salt-lake-Kolkata2",
  bilaspur: "Bilaspur",
  chandigarh: "Chandigarh",
  mohali: "Chandigarh",
  wakad: "Wakad",
  chennai: "Chennai",
};

export function leadDropEnabled() {
  return process.env.LEAD_DROP_ENABLED === "true";
}

export function centreForCity(city: string | null | undefined): string | null {
  if (!city) return null;
  const q = city.trim().toLowerCase().replace(/\s*\(.*\)/, "");
  if (CENTRE_BY_CITY[q]) return CENTRE_BY_CITY[q];
  // "BKC-Mumbai" typed directly, or a key contained in the city string.
  const direct = Object.values(CENTRE_BY_CITY).find((c) => c.toLowerCase() === q);
  if (direct) return direct;
  const partial = Object.keys(CENTRE_BY_CITY).find((k) => q.includes(k) || k.includes(q));
  return partial ? CENTRE_BY_CITY[partial] : null;
}

/** "Arun Kumar Nandewal" → { first: "Arun", last: "Kumar Nandewal" }; single words get "-" as last name (the form requires one). */
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

const unescapeHtml = (s: string) =>
  s
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");

type PageConfig = { version: string; variant: string; hidden: Record<string, string> };
let cache: { at: number; cfg: PageConfig } | null = null;

const HIDDEN_FIELDS = [
  "campaign",
  "source",
  "content",
  "utm_term",
  "salesforce-integration",
  "zapier2-integration",
  "lpsSubmissionConfig",
  "Terms of Service",
  "thank-you-message",
  "thank-you-message-timeout",
];

async function pageConfig(): Promise<PageConfig> {
  if (cache && Date.now() - cache.at < 10 * 60_000) return cache.cfg;
  const res = await fetch(PAGE_URL, { headers: { "User-Agent": UA }, cache: "no-store" });
  if (!res.ok) throw new Error(`lead-drop page fetch failed (${res.status})`);
  const html = await res.text();
  const hidden: Record<string, string> = {};
  for (const name of HIDDEN_FIELDS) {
    const tag = html.match(new RegExp(`<input[^>]*name="${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"[^>]*>`, "i"))?.[0];
    if (!tag) throw new Error(`lead-drop page changed: missing "${name}" field`);
    hidden[name] = unescapeHtml(tag.match(/value="([^"]*)"/)?.[1] ?? "");
  }
  const version = html.match(/__version\s*=\s*(\d+)/)?.[1] ?? html.match(/"version"\s*:\s*"?(\d+)/)?.[1];
  const variant = html.match(/__variant\s*=\s*['"]([A-Z])['"]/)?.[1] ?? "A";
  if (!version) throw new Error("lead-drop page changed: version not found");
  const cfg = { version, variant, hidden };
  cache = { at: Date.now(), cfg };
  return cfg;
}

export type LeadDropInput = { name: string; email: string; phone: string; city: string | null };
export type LeadDropResult = { ok: boolean; status: string };

/** Replays the Lead Drop form's own POST with this learner's details. Returns a short
 * human-readable status for the admin view; never throws. */
export async function submitLeadDrop(input: LeadDropInput): Promise<LeadDropResult> {
  try {
    const centre = centreForCity(input.city);
    if (!centre) return { ok: false, status: `No centre for city "${input.city ?? "—"}"` };
    const { first, last } = splitName(input.name);
    const { code, number } = splitPhone(input.phone);
    if (number.length !== 10) return { ok: false, status: "Phone is not a 10-digit number" };

    const cfg = await pageConfig();
    const body = new URLSearchParams({
      preview: "false",
      version: cfg.version,
      variant: cfg.variant,
      ajax: "true",
      disable_conversion: "false",
      "Learner's First Name": first,
      "Learner's Last Name": last,
      "Learner's Email": input.email,
      "Learner's Country Code (For Eg.+91)": code,
      "Learner's Mobile Number": number,
      campaign: cfg.hidden["campaign"],
      source: cfg.hidden["source"],
      content: cfg.hidden["content"],
      utm_term: cfg.hidden["utm_term"],
      "Centre Name": centre,
      "Program Vertical Interested in": process.env.LEAD_DROP_PROGRAM_VERTICAL || "Offline Product",
      Source: process.env.LEAD_DROP_SOURCE || "Organic Walkins",
      "salesforce-integration": cfg.hidden["salesforce-integration"],
      "zapier2-integration": cfg.hidden["zapier2-integration"],
      lpsSubmissionConfig: cfg.hidden["lpsSubmissionConfig"],
      "Terms of Service": cfg.hidden["Terms of Service"],
      "thank-you-message": cfg.hidden["thank-you-message"],
      "thank-you-message-timeout": cfg.hidden["thank-you-message-timeout"],
    }).toString();

    const ctl = new AbortController();
    const timer = setTimeout(() => ctl.abort(), 12_000);
    const res = await fetch(SUBMIT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        Origin: "https://referrals.upgrad.com",
        Referer: `${PAGE_URL}?v=${cfg.variant}`,
        "User-Agent": UA,
        Accept: "application/json, text/javascript, */*; q=0.01",
      },
      body,
      signal: ctl.signal,
    }).finally(() => clearTimeout(timer));
    const text = (await res.text().catch(() => "")).slice(0, 120);
    return res.ok
      ? { ok: true, status: `Sent to ${centre}` }
      : { ok: false, status: `Rejected (${res.status}) ${text}`.trim() };
  } catch (err) {
    return { ok: false, status: `Failed: ${err instanceof Error ? err.message : "unknown error"}` };
  }
}

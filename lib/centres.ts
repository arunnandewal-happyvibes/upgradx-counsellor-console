// Learning centres as LSQ knows them (LSQ_INTEGRATION.md §3). The `word` goes into the
// Source Campaign and is what LSQ's routing rules substring-match, top to bottom, first
// match wins — so it must be exactly the rule word, and no label may contain another
// centre's word. NEVER use "Bengaluru": it contains "bengal" and routes to Kolkata.
// This one list feeds both the Close Session select and the campaign builder.

export type Centre = {
  /** Stable value stored on the Counsellor row and sent from the form. */
  value: string;
  /** What counsellors see in the select. */
  label: string;
  /** The LSQ rule word placed in utm_campaign. */
  word: string;
  /** False where LSQ has no routing rule yet — those leads fall to the LC Team queue. */
  hasRule: boolean;
};

const city = (name: string): Centre => ({ value: name, label: name, word: name, hasRule: true });

export const CENTRES: Centre[] = [
  { value: "Kothrud", label: "Pune – Kothrud", word: "Kothrud", hasRule: true },
  { value: "Wakad", label: "Pune – Wakad", word: "Wakad", hasRule: true },
  { value: "HSR", label: "Bangalore – HSR", word: "HSR", hasRule: true },
  { value: "Jayanagar", label: "Bangalore – Jayanagar", word: "Jayanagar", hasRule: true },
  { value: "Marathahalli", label: "Bangalore – Marathahalli", word: "Marathahalli", hasRule: true },
  { value: "Ameerpet", label: "Hyderabad – Ameerpet", word: "Ameerpet", hasRule: true },
  { value: "Madhapur", label: "Hyderabad – Madhapur", word: "Madhapur", hasRule: true },
  { value: "SaltLake", label: "Kolkata – Salt Lake", word: "SaltLake", hasRule: true },
  ...[
    "Ahmedabad",
    "Belgaum",
    "Bhopal",
    "Bhubaneswar",
    "Bilaspur",
    "Chandigarh",
    "Chennai",
    "Coimbatore",
    "Dehradun",
    "Gurugram",
    "Indore",
    "Jabalpur",
    "Jaipur",
    "Lucknow",
    "Mangalore",
    "Panipat",
    "Raipur",
    "Rajkot",
  ].map(city),
  { value: "Sambhajinagar", label: "Sambhajinagar", word: "Sambhajinagar", hasRule: true },
  { value: "Mumbai", label: "Mumbai (BKC / Marol / Andheri)", word: "Mumbai", hasRule: false },
  { value: "Bhilwara", label: "Bhilwara", word: "Bhilwara", hasRule: false },
];

export const CENTRE_BY_VALUE = new Map(CENTRES.map((c) => [c.value, c]));

export function getCentre(value: string | null | undefined): Centre | null {
  return value ? CENTRE_BY_VALUE.get(value) ?? null : null;
}

// Guard against the documented trap at module load: every word must appear in exactly one
// centre's word, otherwise a campaign could match the wrong rule.
for (const a of CENTRES) {
  for (const b of CENTRES) {
    if (a !== b && a.word.toLowerCase().includes(b.word.toLowerCase())) {
      throw new Error(`Centre word "${a.word}" contains "${b.word}" — LSQ would misroute it.`);
    }
  }
  if (/bengal/i.test(a.word)) throw new Error(`Centre word "${a.word}" contains "bengal" — routes to Kolkata.`);
}

/** Lead sources offered on Close Session (utm_source → LSQ Source). Meta Ads, Google Ads,
 * LinkedIn Ads and Internshala run through different LSQ rule sets and stay off until each
 * is tested (doc §2). */
export const LEAD_SOURCES = [
  "Organic Walkins",
  "Referral",
  "Flyer",
  "BTL Promoter",
  "School/ College Events",
  "Incoming Call",
  "Database Calling",
] as const;
export type LeadSource = (typeof LEAD_SOURCES)[number];
export const DEFAULT_LEAD_SOURCE: LeadSource = "Organic Walkins";

export const COUNTRY_CODES = ["+91", "+971", "+1", "+44", "+65"] as const;

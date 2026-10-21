import { CENTRE_BY_VALUE, COUNTRY_CODES, LEAD_SOURCES } from "@/lib/centres";

// Validation shared by the Close Session form (inline errors) and the server action
// (which must repeat every check — a server action can be called directly).

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Strip spaces/dashes and a leading 0 so "098765 43210" becomes "9876543210". */
export function normalizeMobile(raw: string) {
  return raw.replace(/[\s-]/g, "").replace(/^0+/, "");
}

export type CloseSessionFields = {
  name: string;
  countryCode: string;
  mobile: string;
  email: string;
  programId: string;
  source: string;
  centre: string;
};

export type FieldErrors = Partial<Record<keyof CloseSessionFields, string>>;

export function validateCloseSession(f: CloseSessionFields): FieldErrors {
  const e: FieldErrors = {};
  if (f.name.trim().length < 2) e.name = "Enter the learner's name (at least 2 characters).";
  if (!(COUNTRY_CODES as readonly string[]).includes(f.countryCode)) e.countryCode = "Pick a country code.";
  const mobile = normalizeMobile(f.mobile);
  if (f.countryCode === "+91") {
    if (!/^\d{10}$/.test(mobile)) e.mobile = "Enter a 10-digit mobile number.";
  } else if (!/^\d{6,12}$/.test(mobile)) {
    e.mobile = "Enter a valid mobile number.";
  }
  if (!EMAIL_RE.test(f.email.trim())) e.email = "Enter a valid email address.";
  if (!f.programId) e.programId = "Pick the program you recommended.";
  if (!(LEAD_SOURCES as readonly string[]).includes(f.source)) e.source = "Pick where the learner came from.";
  if (!CENTRE_BY_VALUE.has(f.centre)) e.centre = "Pick the centre.";
  return e;
}

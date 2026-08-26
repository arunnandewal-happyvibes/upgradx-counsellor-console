export type LeadProfile = {
  name: string;
  degree: string;
  skills: string[];
};

const KEY = "upgradx.leadProfile";

/** Persists for the whole session (unlike welcome.ts's one-time "consume" name) — the
 * console hero reads this on every visit to decide whether to show the personalized
 * recommendation layout or the default one. */
export function setLeadProfile(profile: LeadProfile) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(KEY, JSON.stringify(profile));
}

export function getLeadProfile(): LeadProfile | null {
  if (typeof window === "undefined") return null;
  const raw = window.sessionStorage.getItem(KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed.name === "string") return parsed as LeadProfile;
    return null;
  } catch {
    return null;
  }
}

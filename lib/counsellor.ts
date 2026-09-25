const KEY = "upgradx.counsellorEmail";

/** Persists for the whole browser session — the counsellor checks in once per
 * session, not on every page navigation. */
export function setCounsellorEmail(email: string) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(KEY, email);
}

export function getCounsellorEmail(): string | null {
  if (typeof window === "undefined") return null;
  return window.sessionStorage.getItem(KEY);
}

export const WELCOME_NAME_KEY = "upgradx.welcomeName";

export function setWelcomeName(name: string) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(WELCOME_NAME_KEY, name);
}

/** Reads and clears the pending welcome name — call once on mount so a page refresh doesn't re-trigger it. */
export function consumeWelcomeName(): string | null {
  if (typeof window === "undefined") return null;
  const name = window.sessionStorage.getItem(WELCOME_NAME_KEY);
  if (name) window.sessionStorage.removeItem(WELCOME_NAME_KEY);
  return name;
}

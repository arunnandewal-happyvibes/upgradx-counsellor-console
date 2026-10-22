"use client";

import { useEffect, useState } from "react";

// Ranked program slugs the console hero recommended for the current learner. Kept in
// sessionStorage (cleared by "Start Next Session" with the other upgradx.* keys) so the
// catalogue and program pages can star the same program the hero ranked first.
const KEY = "upgradx.recommendedSlugs";
const EVENT = "upgradx:recommended";

export function setRecommendedSlugs(slugs: string[]) {
  try {
    window.sessionStorage.setItem(KEY, JSON.stringify(slugs));
    window.dispatchEvent(new Event(EVENT));
  } catch {
    /* storage unavailable */
  }
}

function read(): string[] {
  try {
    const v = JSON.parse(window.sessionStorage.getItem(KEY) ?? "[]");
    return Array.isArray(v) ? v.filter((s) => typeof s === "string") : [];
  } catch {
    return [];
  }
}

export function useRecommendedSlugs(): string[] {
  const [slugs, setSlugs] = useState<string[]>([]);
  useEffect(() => {
    const sync = () => setSlugs(read());
    sync();
    window.addEventListener(EVENT, sync);
    return () => window.removeEventListener(EVENT, sync);
  }, []);
  return slugs;
}

"use client";

import { useEffect, useState } from "react";

// The session tools (recorder, assistant) render their launcher buttons into one shared
// dock at the bottom of the screen via portals, so each widget keeps its own logic and
// state while the counsellor sees a single, tidy toolbar.
export const DOCK_ID = "session-dock";
const OPEN_ASSISTANT_EVENT = "upgradx:open-assistant";

/** Opens the counsellor assistant from anywhere (e.g. the hero's "Ask the assistant"). */
export function openAssistant() {
  window.dispatchEvent(new Event(OPEN_ASSISTANT_EVENT));
}

export function onOpenAssistant(handler: () => void) {
  window.addEventListener(OPEN_ASSISTANT_EVENT, handler);
  return () => window.removeEventListener(OPEN_ASSISTANT_EVENT, handler);
}

/** The dock element to portal into, once it's in the DOM (null during SSR / first paint). */
export function useDockTarget(): HTMLElement | null {
  const [el, setEl] = useState<HTMLElement | null>(null);
  useEffect(() => setEl(document.getElementById(DOCK_ID)), []);
  return el;
}

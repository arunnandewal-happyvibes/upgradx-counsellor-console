import { DOCK_ID } from "@/lib/sessionDock";

/**
 * Floating toolbar at the bottom centre of the screen. The recorder and assistant portal
 * their buttons into it; when neither is available (admin pages, features switched off)
 * it has no children and `empty:hidden` removes it entirely.
 */
export function SessionDock() {
  return (
    <div
      id={DOCK_ID}
      role="toolbar"
      aria-label="Session tools"
      className="fixed bottom-4 left-1/2 z-[150] flex -translate-x-1/2 items-center gap-2 rounded-[22px] bg-ink p-2 shadow-float empty:hidden sm:bottom-6"
    />
  );
}

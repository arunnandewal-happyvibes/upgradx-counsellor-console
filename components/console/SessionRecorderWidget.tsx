"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";
import { getCounsellorEmail } from "@/lib/counsellor";
import { getSessionRecorder } from "@/lib/sessionRecorder";
import { useDockTarget } from "@/lib/sessionDock";

const IDLE = { status: "idle" as const, error: null, pendingUploads: 0, elapsedSec: 0 };

function fmt(sec: number) {
  const m = Math.floor(sec / 60);
  return `${m}:${String(sec % 60).padStart(2, "0")}`;
}

/** Floating "Record session" control for the counsellor. Recording only begins after they confirm
 * the student has agreed, and the clock stays visible the whole time so it's never silent. */
export function SessionRecorderWidget() {
  const pathname = usePathname();
  const hidden =
    pathname.startsWith("/admin") || pathname.startsWith("/feedback") || pathname.startsWith("/admin-login");

  const [enabled, setEnabled] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const dock = useDockTarget();
  const rec = typeof window === "undefined" ? null : getSessionRecorder();
  const snap = useSyncExternalStore(
    rec ? rec.subscribe : () => () => {},
    rec ? rec.getSnapshot : () => IDLE,
    () => IDLE,
  );

  useEffect(() => {
    fetch("/api/transcribe/status")
      .then((r) => r.json())
      .then((j) => setEnabled(Boolean(j.enabled)))
      .catch(() => setEnabled(false));
  }, []);

  useEffect(() => {
    if (snap.status !== "recording") return;
    const id = setInterval(() => rec?.tick(), 1000);
    return () => clearInterval(id);
  }, [snap.status, rec]);

  if (hidden || !enabled || !rec || !dock) return null;

  const dockBtn =
    "btn-3d order-1 flex h-12 items-center gap-2.5 whitespace-nowrap rounded-[14px] px-4 text-[15px] font-semibold";

  let control: React.ReactNode;
  if (snap.status === "recording") {
    control = (
      <button type="button" onClick={() => rec.pause()} aria-label={`Recording, ${fmt(snap.elapsedSec)}. Pause`} className={`${dockBtn} bg-[#1f1f1f] text-white hover:bg-[#2a2a2a]`}>
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-primary" />
        </span>
        <span className="tabular-nums">{fmt(snap.elapsedSec)}</span>
        <Icon name="pause" size={20} fill />
      </button>
    );
  } else if (snap.status === "paused") {
    control = (
      <button type="button" onClick={() => rec.resume()} className={`${dockBtn} bg-white text-ink`}>
        <span className="h-2.5 w-2.5 rounded-[3px] bg-primary" />
        {snap.pendingUploads > 0 ? "Saving…" : "Resume recording"}
      </button>
    );
  } else if (snap.status === "error") {
    control = (
      <span role="status" className="order-1 flex items-center gap-2 pl-2 text-[14px] text-white">
        <span className="max-w-[200px] truncate text-[#ff8a8e]">{snap.error}</span>
        <button type="button" onClick={() => rec.resume()} className={`${dockBtn} bg-white text-ink`}>
          Retry
        </button>
      </span>
    );
  } else {
    control = (
      <button
        type="button"
        onClick={() => setConfirming((c) => !c)}
        aria-expanded={confirming}
        className={`${dockBtn} bg-[#1f1f1f] text-white hover:bg-[#2a2a2a]`}
      >
        <span className="h-2.5 w-2.5 rounded-full bg-primary" />
        Record session
      </button>
    );
  }

  return (
    <>
      {createPortal(control, dock)}
      {confirming && snap.status === "idle" && (
        <div
          role="dialog"
          aria-label="Record this session?"
          className="fixed bottom-24 left-1/2 z-[160] w-[360px] max-w-[calc(100vw-2rem)] -translate-x-1/2 animate-pop-in rounded-3xl border border-outline-variant bg-white p-6 shadow-float sm:bottom-28"
        >
          <h3 className="mb-2 font-display text-headline-sm text-ink">Record this session?</h3>
          <p className="mb-4 text-body-sm text-on-surface-variant">
            The conversation is transcribed to text for admin review. The audio itself isn&apos;t kept.
            Please tell the student before you start.
          </p>
          <label className="mb-5 flex items-start gap-3 text-body-sm text-ink">
            <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-0.5 h-5 w-5 flex-shrink-0 accent-primary" />
            The student has agreed to this session being recorded and transcribed.
          </label>
          <div className="flex gap-2">
            <Button
              className="flex-1"
              disabled={!agreed}
              onClick={async () => {
                setConfirming(false);
                setAgreed(false);
                await rec.start(getCounsellorEmail());
              }}
            >
              Start recording
            </Button>
            <Button variant="ghost" onClick={() => { setConfirming(false); setAgreed(false); }}>
              Cancel
            </Button>
          </div>
        </div>
      )}
    </>
  );
}

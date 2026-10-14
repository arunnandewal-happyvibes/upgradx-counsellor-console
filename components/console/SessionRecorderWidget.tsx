"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { getCounsellorEmail } from "@/lib/counsellor";
import { getSessionRecorder } from "@/lib/sessionRecorder";

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

  if (hidden || !enabled || !rec) return null;

  const pill =
    "fixed bottom-4 left-4 z-[150] flex items-center gap-3 rounded-full border border-outline-variant bg-white px-4 py-2 text-body-sm font-semibold text-on-surface shadow-lg";

  if (confirming) {
    return (
      <div className="fixed bottom-6 left-6 z-[150] w-[340px] max-w-[calc(100vw-2rem)] rounded-2xl border border-outline-variant bg-white p-5 shadow-xl">
        <h3 className="mb-2 text-body-md font-bold text-on-surface">Record this session?</h3>
        <p className="mb-3 text-body-sm text-on-surface-variant">
          The conversation is transcribed to text for admin review. The audio itself isn&apos;t kept.
          Please tell the student before you start.
        </p>
        <label className="mb-4 flex items-start gap-2 text-body-sm text-on-surface">
          <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-1 h-4 w-4 accent-primary" />
          The student has agreed to this session being recorded and transcribed.
        </label>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={!agreed}
            onClick={async () => {
              setConfirming(false);
              setAgreed(false);
              await rec.start(getCounsellorEmail());
            }}
            className="flex-1 rounded bg-primary px-3 py-2 text-label-bold font-bold uppercase text-on-primary disabled:opacity-40"
          >
            Start recording
          </button>
          <button type="button" onClick={() => { setConfirming(false); setAgreed(false); }} className="rounded border border-outline-variant px-3 py-2 text-body-sm font-semibold text-on-surface-variant">
            Cancel
          </button>
        </div>
      </div>
    );
  }

  const fab =
    "fixed bottom-6 left-6 z-[150] flex h-20 w-20 flex-col items-center justify-center gap-0.5 rounded-full text-center shadow-2xl transition-transform hover:scale-105";

  if (snap.status === "recording") {
    return (
      <button type="button" onClick={() => rec.pause()} aria-label="Pause recording" className={`${fab} bg-primary text-on-primary`}>
        <span className="absolute inset-0 animate-ping rounded-full bg-primary opacity-30" />
        <Icon name="pause" size={28} fill />
        <span className="relative text-[11px] font-bold tabular-nums">{fmt(snap.elapsedSec)}</span>
      </button>
    );
  }

  if (snap.status === "paused") {
    return (
      <button type="button" onClick={() => rec.resume()} aria-label="Resume recording" className={`${fab} border-2 border-primary bg-white text-primary`}>
        <Icon name="mic" size={28} fill />
        <span className="text-[10px] font-bold uppercase leading-tight">
          {snap.pendingUploads > 0 ? "Saving" : "Resume"}
        </span>
      </button>
    );
  }

  if (snap.status === "error") {
    return (
      <div className={pill} role="status">
        <span className="h-3 w-3 rounded-full bg-outline" />
        {snap.error}
        <button type="button" onClick={() => rec.resume()} className="ml-1 rounded-full bg-primary px-3 py-1 text-label-bold uppercase text-on-primary">
          Retry
        </button>
      </div>
    );
  }

  return (
    <button type="button" onClick={() => setConfirming(true)} aria-label="Record session" className={`${fab} bg-primary text-on-primary`}>
      <Icon name="mic" size={30} fill />
      <span className="text-[10px] font-bold uppercase leading-tight">Record</span>
    </button>
  );
}

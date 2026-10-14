"use client";

// Records the counselling session from the counsellor's microphone in ~30s slices, uploads each
// slice for transcription, and keeps only the text on the server. A single instance lives for the
// whole browser tab so recording survives moving between the onboarding page and the console.

export type RecorderStatus = "idle" | "recording" | "paused" | "error";

const SLICE_MS = 30_000;
const KEY_SESSION = "upgradx.recordingSessionKey";
const KEY_SEQ = "upgradx.recordingSeq";
const KEY_OFFSET = "upgradx.recordingOffsetSec";

type Snapshot = { status: RecorderStatus; error: string | null; pendingUploads: number; elapsedSec: number };

function store(key: string, value?: string | null): string | null {
  try {
    if (value === null) window.sessionStorage.removeItem(key);
    else if (value !== undefined) window.sessionStorage.setItem(key, value);
    return window.sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

function pickMimeType(): string | undefined {
  for (const t of ["audio/webm;codecs=opus", "audio/webm", "audio/mp4"]) {
    if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(t)) return t;
  }
  return undefined;
}

class SessionRecorder {
  private status: RecorderStatus = "idle";
  private error: string | null = null;
  private stream: MediaStream | null = null;
  private recorder: MediaRecorder | null = null;
  private sliceTimer: ReturnType<typeof setTimeout> | null = null;
  private sliceStartedAt = 0;
  private running = false;
  private pending = 0;
  private queue: Promise<void> = Promise.resolve();
  private listeners = new Set<() => void>();
  private snapshot: Snapshot = { status: "idle", error: null, pendingUploads: 0, elapsedSec: 0 };
  private counsellorEmail: string | null = null;

  constructor() {
    // After a page reload the mic is gone but the session isn't over — offer to resume it.
    if (typeof window !== "undefined" && store(KEY_SESSION)) this.status = "paused";
    this.refresh();
  }

  subscribe = (fn: () => void) => {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  };
  getSnapshot = () => this.snapshot;

  private recordedSec() {
    return Number(store(KEY_OFFSET) ?? 0);
  }
  private elapsedNow() {
    return this.recordedSec() + (this.running && this.sliceStartedAt ? (Date.now() - this.sliceStartedAt) / 1000 : 0);
  }
  private refresh() {
    this.snapshot = {
      status: this.status,
      error: this.error,
      pendingUploads: this.pending,
      elapsedSec: Math.floor(this.elapsedNow()),
    };
    this.listeners.forEach((l) => l());
  }
  /** Lets the UI tick the clock without the recorder needing its own interval. */
  tick() {
    if (this.running) this.refresh();
  }

  hasSession() {
    return Boolean(store(KEY_SESSION));
  }
  sessionKey() {
    return store(KEY_SESSION);
  }

  async start(counsellorEmail: string | null) {
    this.counsellorEmail = counsellorEmail;
    if (!store(KEY_SESSION)) {
      store(KEY_SESSION, crypto.randomUUID());
      store(KEY_SEQ, "0");
      store(KEY_OFFSET, "0");
    }
    await this.resume();
  }

  async resume() {
    if (this.running) return;
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true },
      });
    } catch {
      this.status = "error";
      this.error = "Couldn't access the microphone — allow it in the browser and try again.";
      this.refresh();
      return;
    }
    this.error = null;
    this.running = true;
    this.status = "recording";
    this.startSlice();
    this.refresh();
  }

  private startSlice() {
    if (!this.stream || !this.running) return;
    const mimeType = pickMimeType();
    const parts: Blob[] = [];
    const rec = new MediaRecorder(this.stream, mimeType ? { mimeType } : undefined);
    this.recorder = rec;
    this.sliceStartedAt = Date.now();
    rec.ondataavailable = (e) => e.data.size > 0 && parts.push(e.data);
    rec.onstop = () => {
      const seconds = (Date.now() - this.sliceStartedAt) / 1000;
      const offset = this.recordedSec();
      store(KEY_OFFSET, String(offset + seconds));
      const type = rec.mimeType || mimeType || "audio/webm";
      const blob = new Blob(parts, { type });
      if (seconds >= 1 && blob.size > 1000) this.enqueueUpload(blob, offset, type);
      if (this.running) this.startSlice();
      this.refresh();
    };
    rec.start();
    this.sliceTimer = setTimeout(() => rec.state === "recording" && rec.stop(), SLICE_MS);
  }

  private enqueueUpload(blob: Blob, offsetSec: number, type: string) {
    const seq = Number(store(KEY_SEQ) ?? 0);
    store(KEY_SEQ, String(seq + 1));
    const sessionKey = store(KEY_SESSION);
    if (!sessionKey) return;
    const ext = type.includes("mp4") ? "mp4" : "webm";
    this.pending++;
    this.queue = this.queue.then(async () => {
      for (let attempt = 0; attempt < 4; attempt++) {
        try {
          const body = new FormData();
          body.append("audio", blob, `chunk-${seq}.${ext}`);
          body.append("sessionKey", sessionKey);
          body.append("seq", String(seq));
          body.append("offsetSec", String(offsetSec));
          body.append("consent", "1");
          if (this.counsellorEmail) body.append("counsellorEmail", this.counsellorEmail);
          const res = await fetch("/api/transcribe", { method: "POST", body });
          if (res.ok) break;
          if (res.status >= 400 && res.status < 500) break; // retrying won't help
        } catch {
          // network blip — retry below
        }
        await new Promise((r) => setTimeout(r, 1500 * (attempt + 1)));
      }
      this.pending--;
      this.refresh();
    });
    this.refresh();
  }

  private haltCapture() {
    this.running = false;
    if (this.sliceTimer) clearTimeout(this.sliceTimer);
    if (this.recorder && this.recorder.state === "recording") this.recorder.stop(); // flushes the last slice
    this.stream?.getTracks().forEach((t) => t.stop());
    this.stream = null;
  }

  pause() {
    this.haltCapture();
    this.status = "paused";
    this.refresh();
  }

  /** Stops capturing, waits for every slice to finish uploading, and returns the session key. */
  async stopAndFlush(): Promise<string | null> {
    const key = store(KEY_SESSION);
    if (!key) return null;
    this.haltCapture();
    await new Promise((r) => setTimeout(r, 50)); // let the final onstop enqueue its upload
    await this.queue;
    this.status = "paused";
    this.refresh();
    return key;
  }

  /** Forget the finished session (the next one starts a fresh recording). */
  reset() {
    this.haltCapture();
    [KEY_SESSION, KEY_SEQ, KEY_OFFSET].forEach((k) => store(k, null));
    this.status = "idle";
    this.error = null;
    this.refresh();
  }
}

let instance: SessionRecorder | null = null;
export function getSessionRecorder() {
  if (!instance) instance = new SessionRecorder();
  return instance;
}

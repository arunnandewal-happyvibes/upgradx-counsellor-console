"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { getLeadProfile } from "@/lib/leadProfile";

type Msg = { role: "user" | "assistant"; content: string; error?: boolean };
type Phase = "idle" | "listening" | "thinking" | "speaking";

function pickVoice(): SpeechSynthesisVoice | undefined {
  const voices = window.speechSynthesis?.getVoices() ?? [];
  return (
    voices.find((v) => v.lang === "en-IN") ??
    voices.find((v) => v.lang.startsWith("en-GB")) ??
    voices.find((v) => v.lang.startsWith("en"))
  );
}

/** Counsellor-facing assistant: ask by voice (or text) and hear the answer, grounded in the
 * platform's own programs, batches, drives, FAQs and so on. Lives on the console pages only. */
export function VoiceAssistant() {
  const pathname = usePathname();
  const onConsole = pathname.startsWith("/console");

  const [status, setStatus] = useState<{ enabled: boolean; voiceInput: boolean } | null>(null);
  const [open, setOpen] = useState(false);
  const [phase, setPhase] = useState<Phase>("idle");
  const [muted, setMuted] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const recorder = useRef<MediaRecorder | null>(null);
  const stream = useRef<MediaStream | null>(null);
  const chunks = useRef<Blob[]>([]);
  const startedAt = useRef(0);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/assistant/status")
      .then((r) => r.json())
      .then(setStatus)
      .catch(() => setStatus({ enabled: false, voiceInput: false }));
  }, []);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, phase]);

  useEffect(() => () => window.speechSynthesis?.cancel(), []);

  if (!onConsole || !status?.enabled) return null;

  const context = () => {
    const p = getLeadProfile();
    let citySlug: string | null = null;
    try {
      citySlug = window.sessionStorage.getItem("upgradx.selectedCitySlug");
    } catch {}
    return {
      history: messages.filter((m) => !m.error).slice(-6).map(({ role, content }) => ({ role, content })),
      learner: {
        degree: p?.degree ?? null,
        occupation: p?.occupation ?? null,
        yearsOfExperience: p?.yearsOfExperience ?? null,
        interests: p?.interests ?? [],
        citySlug,
      },
    };
  };

  const speak = (answer: string) => {
    if (muted || !window.speechSynthesis) return setPhase("idle");
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(answer);
    const v = pickVoice();
    if (v) u.voice = v;
    u.lang = v?.lang ?? "en-IN";
    u.rate = 1.02;
    u.onend = () => setPhase("idle");
    u.onerror = () => setPhase("idle");
    setPhase("speaking");
    window.speechSynthesis.speak(u);
  };

  const ask = async (body: FormData | { text: string }) => {
    setPhase("thinking");
    try {
      let res: Response;
      if (body instanceof FormData) {
        body.append("context", JSON.stringify(context()));
        res = await fetch("/api/assistant", { method: "POST", body });
      } else {
        res = await fetch("/api/assistant", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: body.text, context: context() }),
        });
      }
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Something went wrong.");
      if (!json.question) {
        setMessages((m) => [...m, { role: "assistant", content: "I didn't catch that — could you say it again?", error: true }]);
        return setPhase("idle");
      }
      setMessages((m) => [...m, { role: "user", content: json.question }, { role: "assistant", content: json.answer }]);
      speak(json.answer);
    } catch (err) {
      setMessages((m) => [...m, { role: "assistant", content: err instanceof Error ? err.message : "Something went wrong.", error: true }]);
      setPhase("idle");
    }
  };

  const startListening = async () => {
    window.speechSynthesis?.cancel();
    try {
      stream.current = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
    } catch {
      setMessages((m) => [...m, { role: "assistant", content: "I couldn't use the microphone — allow it in the browser, or type your question.", error: true }]);
      return;
    }
    chunks.current = [];
    const rec = new MediaRecorder(stream.current);
    recorder.current = rec;
    rec.ondataavailable = (e) => e.data.size > 0 && chunks.current.push(e.data);
    rec.onstop = () => {
      stream.current?.getTracks().forEach((t) => t.stop());
      const seconds = (Date.now() - startedAt.current) / 1000;
      const type = rec.mimeType || "audio/webm";
      const blob = new Blob(chunks.current, { type });
      if (seconds < 0.7 || blob.size < 1000) return setPhase("idle");
      const fd = new FormData();
      fd.append("audio", blob, `question.${type.includes("mp4") ? "mp4" : "webm"}`);
      void ask(fd);
    };
    startedAt.current = Date.now();
    rec.start();
    setPhase("listening");
  };

  const stopListening = () => recorder.current?.state === "recording" && recorder.current.stop();

  const submitText = () => {
    const t = text.trim();
    if (!t || phase === "thinking") return;
    setText("");
    window.speechSynthesis?.cancel();
    void ask({ text: t });
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Ask the assistant"
        className="fixed bottom-6 right-6 z-[150] flex h-20 w-20 flex-col items-center justify-center gap-0.5 rounded-full bg-primary text-on-primary shadow-2xl transition-transform hover:scale-105"
      >
        <Icon name="support_agent" size={30} fill />
        <span className="text-[10px] font-bold uppercase leading-tight">Ask AI</span>
      </button>
    );
  }

  const busy = phase === "thinking";
  return (
    <div className="fixed bottom-6 right-6 z-[150] flex h-[min(560px,80vh)] w-[380px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border border-outline-variant bg-white shadow-2xl">
      <div className="flex items-center justify-between bg-primary px-4 py-3 text-on-primary">
        <div className="flex items-center gap-2 text-body-md font-bold">
          <Icon name="support_agent" size={22} fill /> Counsellor assistant
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label={muted ? "Turn spoken answers on" : "Turn spoken answers off"}
            onClick={() => {
              window.speechSynthesis?.cancel();
              setMuted((m) => !m);
              setPhase("idle");
            }}
            className="rounded-full p-1.5 hover:bg-white/20"
          >
            <Icon name={muted ? "volume_off" : "volume_up"} size={20} />
          </button>
          <button
            type="button"
            aria-label="Close assistant"
            onClick={() => {
              window.speechSynthesis?.cancel();
              if (recorder.current?.state === "recording") {
                recorder.current.onstop = () => stream.current?.getTracks().forEach((t) => t.stop());
                recorder.current.stop();
              }
              setPhase("idle");
              setOpen(false);
            }}
            className="rounded-full p-1.5 hover:bg-white/20"
          >
            <Icon name="close" size={20} />
          </button>
        </div>
      </div>

      <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto bg-surface-container-lowest p-4" aria-live="polite">
        {messages.length === 0 && (
          <p className="text-body-sm text-on-surface-variant">
            Ask about programs, upcoming batches, placement drives, fees, hiring partners, instructors or centre
            contacts — by voice or text. Try &ldquo;Any data science batches in Pune?&rdquo;
          </p>
        )}
        {messages.map((m, i) => (
          <div key={i} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
            <div
              className={
                m.role === "user"
                  ? "max-w-[85%] rounded-2xl rounded-br-sm bg-primary px-3 py-2 text-body-sm text-on-primary"
                  : `max-w-[85%] rounded-2xl rounded-bl-sm px-3 py-2 text-body-sm ${m.error ? "bg-primary-fixed text-primary" : "bg-surface-container text-on-surface"}`
              }
            >
              {m.content}
            </div>
          </div>
        ))}
        {busy && <p className="text-body-sm italic text-on-surface-variant">Looking that up…</p>}
        {phase === "speaking" && (
          <button type="button" onClick={() => { window.speechSynthesis.cancel(); setPhase("idle"); }} className="flex items-center gap-1 text-body-sm font-semibold text-primary">
            <Icon name="stop_circle" size={18} /> Stop speaking
          </button>
        )}
      </div>

      <div className="border-t border-outline-variant p-3">
        {status.voiceInput && (
          <button
            type="button"
            disabled={busy}
            onClick={phase === "listening" ? stopListening : startListening}
            className={`mb-2 flex w-full items-center justify-center gap-2 rounded-full px-4 py-3 text-label-bold font-bold uppercase tracking-wide transition-colors disabled:opacity-50 ${
              phase === "listening" ? "animate-pulse bg-primary text-on-primary" : "border-2 border-primary text-primary hover:bg-primary-fixed"
            }`}
          >
            <Icon name={phase === "listening" ? "stop" : "mic"} size={22} fill />
            {phase === "listening" ? "Listening… tap to send" : "Tap to speak"}
          </button>
        )}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            submitText();
          }}
          className="flex gap-2"
        >
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Or type a question"
            maxLength={500}
            className="h-10 flex-1 rounded-lg border border-outline-variant px-3 text-body-sm text-on-surface focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <button type="submit" disabled={busy || !text.trim()} className="rounded-lg bg-primary px-3 text-on-primary disabled:opacity-40" aria-label="Send">
            <Icon name="send" size={20} />
          </button>
        </form>
      </div>
    </div>
  );
}

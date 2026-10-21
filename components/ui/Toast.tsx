"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";
import { cn } from "@/lib/cn";

type Tone = "success" | "error" | "info";
type Toast = { id: number; tone: Tone; title: string; body?: string };
type Api = { toast: (t: { tone?: Tone; title: string; body?: string; durationMs?: number }) => void };

const Ctx = createContext<Api>({ toast: () => {} });

/** Short, non-blocking confirmations ("Session saved", "Email sent") stacked bottom-right. */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Toast[]>([]);
  const seq = useRef(0);

  const dismiss = useCallback((id: number) => setItems((xs) => xs.filter((x) => x.id !== id)), []);
  const toast = useCallback<Api["toast"]>(
    ({ tone = "success", title, body, durationMs = 4000 }) => {
      const id = ++seq.current;
      setItems((xs) => [...xs.slice(-2), { id, tone, title, body }]);
      window.setTimeout(() => dismiss(id), durationMs);
    },
    [dismiss],
  );

  return (
    <Ctx.Provider value={{ toast }}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed bottom-28 right-4 z-[250] flex w-[min(380px,calc(100vw-2rem))] flex-col gap-2 sm:right-6"
      >
        {items.map((t) => (
          <div
            key={t.id}
            role={t.tone === "error" ? "alert" : "status"}
            className="pointer-events-auto flex animate-toast-in items-start gap-3 rounded-2xl bg-ink px-4 py-3.5 text-white shadow-float"
          >
            <span
              className={cn(
                "mt-1 h-2.5 w-2.5 flex-shrink-0 rounded-full",
                t.tone === "success" && "bg-[#3ccf7a]",
                t.tone === "error" && "bg-primary",
                t.tone === "info" && "bg-white",
              )}
              aria-hidden="true"
            />
            <div className="min-w-0 flex-1">
              <div className="text-[15px] font-semibold">{t.title}</div>
              {t.body && <div className="mt-0.5 text-[13px] text-white/70">{t.body}</div>}
            </div>
            <button
              type="button"
              onClick={() => dismiss(t.id)}
              aria-label="Dismiss"
              className="-mr-1 grid h-8 w-8 place-items-center rounded-full text-white/60 hover:bg-white/10 hover:text-white"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}

export function useToast() {
  return useContext(Ctx);
}

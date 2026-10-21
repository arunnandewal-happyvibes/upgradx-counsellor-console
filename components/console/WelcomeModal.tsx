"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { consumeWelcomeName } from "@/lib/welcome";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";

const AUTO_DISMISS_MS = 7000;

export function WelcomeModal() {
  const [name, setName] = useState<string | null>(null);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    const pending = consumeWelcomeName();
    if (pending) setName(pending);
  }, []);

  useEffect(() => {
    if (!name) return;
    const timer = setTimeout(close, AUTO_DISMISS_MS);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name]);

  function close() {
    setClosing(true);
    setTimeout(() => setName(null), 220);
  }

  if (!name) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-[100] flex items-center justify-center p-4 bg-ink/50 backdrop-blur-md",
        closing ? "opacity-0 transition-opacity duration-200" : "animate-welcome-backdrop",
      )}
      onClick={close}
      role="dialog"
      aria-modal="true"
      aria-label="Welcome"
    >
      <div
        className={cn(
          "relative w-[92vw] sm:w-[40vw] sm:min-w-[460px] max-w-2xl bg-white rounded-[32px] shadow-float p-10 sm:p-12 text-left",
          closing ? "opacity-0 scale-95 transition-all duration-200" : "animate-welcome-card",
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={close}
          aria-label="Close"
          className="absolute top-5 right-5 grid h-10 w-10 place-items-center rounded-full text-ink transition-colors hover:bg-surface-container-low"
        >
          <Icon name="close" size={24} />
        </button>

        <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-white animate-welcome-pulse">
          <Icon name="celebration" size={32} fill />
        </div>

        <p className="eyebrow mb-3">
          Welcome to upGrad X
        </p>
        <h2 className="font-display text-[clamp(40px,5vw,60px)] font-extrabold leading-[1] tracking-[-0.045em] text-ink mb-4">
          Welcome, {name}.
        </h2>
        <p className="text-body-lg text-on-surface-variant mb-8">
          We're here to help you transform your life — let's find the program that gets you there.
        </p>

        <Button onClick={close} size="lg" className="w-full sm:w-auto sm:min-w-[220px]">
          Let's get started
        </Button>
      </div>
    </div>
  );
}

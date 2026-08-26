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
        "fixed inset-0 z-[100] flex items-center justify-center p-4 bg-on-surface/60 backdrop-blur-sm",
        closing ? "opacity-0 transition-opacity duration-200" : "animate-welcome-backdrop",
      )}
      onClick={close}
      role="dialog"
      aria-modal="true"
      aria-label="Welcome"
    >
      <div
        className={cn(
          "relative w-[92vw] sm:w-[40vw] sm:min-w-[460px] max-w-2xl bg-surface-container-lowest rounded-2xl border-t-4 border-t-primary shadow-2xl p-12 text-center",
          closing ? "opacity-0 scale-95 transition-all duration-200" : "animate-welcome-card",
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={close}
          aria-label="Close"
          className="absolute top-4 right-4 text-secondary hover:text-primary transition-colors"
        >
          <Icon name="close" size={24} />
        </button>

        <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-primary text-white animate-welcome-pulse">
          <Icon name="celebration" size={44} fill />
        </div>

        <p className="text-[15px] font-bold uppercase tracking-wide text-primary mb-3">
          Welcome to upGrad X
        </p>
        <h2 className="text-display-lg text-on-surface mb-4 leading-tight">
          Welcome, {name}!
        </h2>
        <p className="text-body-lg text-on-surface-variant mb-8">
          We're here to help you transform your life — let's find the program that gets you there.
        </p>

        <Button onClick={close} className="w-full justify-center">
          Let's Get Started
        </Button>
      </div>
    </div>
  );
}

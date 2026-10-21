"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/Field";
import { fieldClass } from "@/components/ui/fieldStyles";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";

export function EventRegisterForm({ occurrenceId }: { occurrenceId: string }) {
  const [form, setForm] = useState({ name: "", phone: "" });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (done) {
    return (
      <div role="status" className="flex flex-col items-start gap-4">
        <span className="grid h-14 w-14 place-items-center rounded-2xl bg-primary text-white">
          <Icon name="check" size={28} />
        </span>
        <p className="font-display text-[24px] font-bold tracking-[-0.02em] text-ink">You&apos;re registered.</p>
        <p className="text-[15px] text-on-surface-variant">We&apos;ll follow up with the session details shortly.</p>
      </div>
    );
  }

  return (
    <form
      className="flex flex-col gap-5"
      onSubmit={async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);
        try {
          const res = await fetch("/api/events/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ occurrenceId, ...form }),
          });
          if (!res.ok) throw new Error();
          setDone(true);
        } catch {
          setError("Couldn't register just now — please try again.");
        } finally {
          setSubmitting(false);
        }
      }}
    >
      <TextField
        label="Full name"
        required
        autoComplete="name"
        placeholder="Jane Doe"
        value={form.name}
        onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
      />
      <div className="flex flex-col gap-1.5">
        <label htmlFor="event-phone" className="text-[14px] font-semibold text-ink">
          Phone number
        </label>
        <div className="flex">
          <span className="inline-flex items-center rounded-l-xl border border-r-0 border-outline-variant bg-surface-container px-4 text-[15px] font-medium text-ink">
            +91
          </span>
          <input
            id="event-phone"
            required
            type="tel"
            inputMode="tel"
            autoComplete="tel-national"
            className={cn(fieldClass, "h-12 rounded-l-none")}
            placeholder="98765 43210"
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
          />
        </div>
      </div>
      {error && (
        <p role="alert" className="text-[14px] font-medium text-primary">
          {error}
        </p>
      )}
      <Button type="submit" size="lg" loading={submitting} className="mt-1 w-full">
        {submitting ? "Registering…" : "Register"}
        {!submitting && <Icon name="arrow_forward" size={20} />}
      </Button>
      <p className="text-center text-[13px] text-on-surface-variant">A confirmation message is sent on registration.</p>
    </form>
  );
}

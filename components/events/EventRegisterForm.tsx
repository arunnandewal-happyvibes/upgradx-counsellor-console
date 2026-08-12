"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

export function EventRegisterForm({ occurrenceId }: { occurrenceId: string }) {
  const [form, setForm] = useState({ name: "", phone: "" });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  if (done) {
    return (
      <div className="rounded bg-primary-fixed p-card-padding text-body-sm text-on-surface flex items-center gap-2">
        <Icon name="check_circle" className="text-primary" fill />
        You're registered! We'll follow up with the session details shortly.
      </div>
    );
  }

  const labelClass = "text-label-bold font-bold text-on-surface";
  const inputClass =
    "w-full bg-surface-container-lowest border border-outline-variant rounded p-2 text-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none";

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={async (e) => {
        e.preventDefault();
        setSubmitting(true);
        await fetch("/api/events/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ occurrenceId, ...form }),
        });
        setSubmitting(false);
        setDone(true);
      }}
    >
      <div className="flex flex-col gap-1">
        <label className={labelClass}>Full Name</label>
        <input
          required
          className={inputClass}
          placeholder="Jane Doe"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className={labelClass}>Phone Number</label>
        <div className="flex">
          <span className="inline-flex items-center px-3 rounded-l border border-r-0 border-outline-variant bg-surface-container text-secondary text-body-sm">
            +91
          </span>
          <input
            required
            type="tel"
            className={`${inputClass} rounded-l-none`}
            placeholder="98765 43210"
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
          />
        </div>
      </div>
      <Button type="submit" disabled={submitting} className="w-full mt-2">
        {submitting ? "Registering..." : "Register Now"}
        <Icon name="arrow_forward" size={18} />
      </Button>
      <p className="text-center text-body-sm text-secondary">
        A confirmation message will be sent upon registration.
      </p>
    </form>
  );
}

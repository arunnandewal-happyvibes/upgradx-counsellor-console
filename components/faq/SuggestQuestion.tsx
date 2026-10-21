"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { fieldClass } from "@/components/ui/fieldStyles";
import { Icon } from "@/components/ui/Icon";

export function SuggestQuestion({ className }: { className?: string }) {
  const [question, setQuestion] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (submitted) {
    return (
      <div role="status" className={cn("flex items-center gap-3 rounded-[24px] bg-ink p-6 text-[15px] text-white", className)}>
        <span className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-full bg-white/10">
          <Icon name="check" size={20} />
        </span>
        Thanks — it&apos;s in the admin review queue and may be added to the FAQ list.
      </div>
    );
  }

  return (
    <div className={cn("rounded-[24px] border border-dashed border-outline-variant p-6", className)}>
      <p className="font-display text-[20px] font-bold text-ink">Didn&apos;t find the answer?</p>
      <p className="mt-1 text-[14px] text-on-surface-variant">Send the question you were asked — the team adds the common ones.</p>
      <form
        className="mt-4 flex flex-col gap-3 sm:flex-row"
        onSubmit={async (e) => {
          e.preventDefault();
          if (!question.trim()) return;
          setSubmitting(true);
          await fetch("/api/faq/suggest", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ question }),
          });
          setSubmitting(false);
          setSubmitted(true);
        }}
      >
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          aria-label="Question to suggest"
          placeholder="Type the question you were asked…"
          className={cn(fieldClass, "h-12 flex-1")}
        />
        <Button type="submit" variant="dark" loading={submitting} disabled={!question.trim()}>
          Suggest question
        </Button>
      </form>
    </div>
  );
}

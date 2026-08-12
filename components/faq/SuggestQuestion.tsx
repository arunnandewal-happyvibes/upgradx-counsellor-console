"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/Icon";

export function SuggestQuestion({ className }: { className?: string }) {
  const [question, setQuestion] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (submitted) {
    return (
      <div className={cn("rounded border border-surface-variant bg-surface-container-low p-card-padding text-body-sm text-on-surface-variant flex items-center gap-2", className)}>
        <Icon name="check_circle" className="text-primary" fill />
        Thanks — this has been sent to the admin review queue and may be added to the FAQ list.
      </div>
    );
  }

  return (
    <div className={cn("rounded border border-dashed border-outline-variant p-card-padding", className)}>
      <p className="mb-2 text-body-md font-semibold text-on-surface">Didn't find the answer?</p>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Type the question you were asked..."
          className="flex-1 rounded border border-surface-variant px-3 py-2 text-body-md outline-none focus:border-primary focus:ring-1 focus:ring-primary"
        />
        <Button
          variant="secondary"
          disabled={!question.trim() || submitting}
          onClick={async () => {
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
          Suggest a question
        </Button>
      </div>
    </div>
  );
}

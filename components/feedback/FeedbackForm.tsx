"use client";

import { useState, useTransition } from "react";
import { StarRating } from "@/components/ui/StarRating";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { submitFeedback } from "@/app/feedback/[token]/actions";

const LABELS = ["", "Poor", "Fair", "Good", "Great", "Excellent"];

export function FeedbackForm({
  token,
  firstName,
  initialRating,
  alreadyRated,
}: {
  token: string;
  firstName: string;
  initialRating: number;
  alreadyRated: boolean;
}) {
  const [rating, setRating] = useState(initialRating);
  const [done, setDone] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (done !== null) {
    return (
      <div role="status" className="flex animate-rise flex-col gap-6">
        <span className="grid h-16 w-16 place-items-center rounded-2xl bg-primary text-white shadow-red-glow">
          <Icon name="favorite" size={32} fill />
        </span>
        <h1 className="font-display text-[clamp(40px,6vw,64px)] font-extrabold leading-[1] tracking-[-0.045em] text-ink">
          Thank you, {firstName}.
        </h1>
        <p className="text-body-lg text-on-surface-variant">
          You rated your session <span className="font-semibold text-ink">{done} out of 5</span>. It helps us make the next one better.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        <span className="eyebrow">Rate your session</span>
        <h1 className="font-display text-[clamp(40px,6vw,64px)] font-extrabold leading-[1] tracking-[-0.045em] text-ink">
          How was it, {firstName}?
        </h1>
        <p className="text-body-lg text-on-surface-variant">
          {alreadyRated ? "You've already rated this session — tap to change it." : "Tap a star, then confirm."}
        </p>
      </div>
      <div className="flex flex-col gap-3">
        <StarRating value={rating} onChange={setRating} size={52} />
        <span aria-live="polite" className="h-6 text-[16px] font-semibold text-ink">
          {LABELS[rating] ?? ""}
        </span>
      </div>
      {error && (
        <p role="alert" className="text-[15px] font-medium text-primary">
          {error}
        </p>
      )}
      <Button
        disabled={rating < 1}
        loading={pending}
        size="lg"
        className="w-full sm:w-auto sm:min-w-[240px]"
        onClick={() =>
          startTransition(async () => {
            setError(null);
            const res = await submitFeedback(token, rating);
            if (res.ok) setDone(rating);
            else setError("Couldn't save your rating — please try again.");
          })
        }
      >
        {pending ? "Saving…" : "Submit rating"}
      </Button>
    </div>
  );
}

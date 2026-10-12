"use client";

import { useState, useTransition } from "react";
import { StarRating } from "@/components/ui/StarRating";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { submitFeedback } from "@/app/feedback/[token]/actions";

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
      <>
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-white">
          <Icon name="favorite" size={32} fill />
        </div>
        <h1 className="mb-2 text-headline-md text-on-surface">Thank you, {firstName}!</h1>
        <p className="text-body-md text-on-surface-variant">
          You rated your session {done} out of 5. Your feedback helps us improve.
        </p>
      </>
    );
  }

  return (
    <>
      <h1 className="mb-2 text-headline-md text-on-surface">How was your session, {firstName}?</h1>
      <p className="mb-6 text-body-md text-on-surface-variant">
        {alreadyRated ? "You've already rated this session — tap to change it." : "Tap a star, then confirm."}
      </p>
      <div className="mb-6 flex justify-center">
        <StarRating value={rating} onChange={setRating} />
      </div>
      {error && <p className="mb-3 text-body-sm font-semibold text-primary">{error}</p>}
      <Button
        disabled={rating < 1 || pending}
        className="w-full justify-center py-3"
        onClick={() =>
          startTransition(async () => {
            setError(null);
            const res = await submitFeedback(token, rating);
            if (res.ok) setDone(rating);
            else setError("Couldn't save your rating — please try again.");
          })
        }
      >
        {pending ? "Saving..." : "Submit rating"}
      </Button>
    </>
  );
}

"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/Icon";

export function StarRating({
  value,
  onChange,
}: {
  value: number;
  onChange: (value: number) => void;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const active = hover ?? value;

  return (
    <div className="flex items-center gap-1" onMouseLeave={() => setHover(null)}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          aria-label={`${star} star${star === 1 ? "" : "s"}`}
          onClick={() => onChange(star)}
          onMouseEnter={() => setHover(star)}
          className="p-0.5 transition-transform hover:scale-110"
        >
          <Icon
            name="star"
            size={32}
            fill={star <= active}
            className={star <= active ? "text-primary" : "text-surface-variant"}
          />
        </button>
      ))}
    </div>
  );
}

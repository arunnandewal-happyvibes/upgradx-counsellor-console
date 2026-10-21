"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";

/** 1–5 rating as a proper radio group (arrow keys work), with a hover preview. */
export function StarRating({
  value,
  onChange,
  size = 32,
}: {
  value: number;
  onChange: (value: number) => void;
  size?: number;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const active = hover ?? value;

  return (
    <div
      role="radiogroup"
      aria-label="Rating"
      className="flex items-center gap-1.5"
      onMouseLeave={() => setHover(null)}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight" || e.key === "ArrowUp") onChange(Math.min(5, (value || 0) + 1));
        if (e.key === "ArrowLeft" || e.key === "ArrowDown") onChange(Math.max(1, (value || 1) - 1));
      }}
    >
      {[1, 2, 3, 4, 5].map((star) => {
        const on = star <= active;
        return (
          <button
            key={star}
            type="button"
            role="radio"
            aria-checked={value === star}
            aria-label={`${star} star${star === 1 ? "" : "s"}`}
            tabIndex={value === star || (value === 0 && star === 1) ? 0 : -1}
            onClick={() => onChange(star)}
            onMouseEnter={() => setHover(star)}
            className={cn(
              "grid place-items-center rounded-2xl transition-all duration-fast ease-out hover:scale-110",
              on ? "text-primary" : "text-[#d9d9d9]",
            )}
            style={{ width: size + 12, height: size + 12 }}
          >
            <Icon name="star" size={size} fill={on} />
          </button>
        );
      })}
    </div>
  );
}

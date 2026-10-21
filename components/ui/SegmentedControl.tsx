"use client";

import { cn } from "@/lib/cn";

/** iOS-style switcher for 2–4 mutually exclusive views (e.g. Offline / Online). */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  label,
  className,
}: {
  options: { value: T; label: React.ReactNode }[];
  value: T;
  onChange: (v: T) => void;
  label: string;
  className?: string;
}) {
  return (
    <div
      role="group"
      aria-label={label}
      className={cn("inline-flex gap-1 rounded-2xl bg-surface-container p-1", className)}
    >
      {options.map((o) => {
        const on = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            aria-pressed={on}
            onClick={() => onChange(o.value)}
            className={cn(
              "h-10 rounded-xl px-4 text-[14px] font-semibold transition-all duration-fast ease-out",
              on ? "bg-white text-ink shadow-[0_2px_8px_rgba(17,17,17,0.08)]" : "text-on-surface-variant hover:text-ink",
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

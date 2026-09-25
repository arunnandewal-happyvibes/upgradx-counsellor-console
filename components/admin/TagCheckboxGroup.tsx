"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";

export function TagCheckboxGroup({
  name,
  options,
  initial,
  max,
}: {
  name: string;
  options: readonly string[];
  initial?: string[];
  max: number;
}) {
  const [selected, setSelected] = useState<string[]>(initial ?? []);

  const toggle = (tag: string) => {
    setSelected((prev) => {
      if (prev.includes(tag)) return prev.filter((t) => t !== tag);
      if (prev.length >= max) return prev;
      return [...prev, tag];
    });
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {options.map((tag) => {
          const checked = selected.includes(tag);
          const disabled = !checked && selected.length >= max;
          return (
            <label
              key={tag}
              className={cn(
                "cursor-pointer select-none rounded-full border px-3 py-1.5 text-sm font-semibold transition-colors",
                checked
                  ? "border-brand-red bg-brand-red text-white"
                  : "border-brand-gray-200 text-brand-ink2 hover:border-brand-red hover:text-brand-red",
                disabled && "cursor-not-allowed opacity-40 hover:border-brand-gray-200 hover:text-brand-ink2",
              )}
            >
              <input
                type="checkbox"
                name={name}
                value={tag}
                checked={checked}
                disabled={disabled}
                onChange={() => toggle(tag)}
                className="sr-only"
              />
              {tag}
            </label>
          );
        })}
      </div>
      <p className="mt-1.5 text-xs text-brand-gray-400">
        {selected.length}/{max} selected
      </p>
    </div>
  );
}

"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/Icon";

type Module = { id: string; title: string; content: string; order: number };

/** Numbered module list; one open at a time so the page stays scannable. */
export function CurriculumAccordion({ modules }: { modules: Module[] }) {
  const [openId, setOpenId] = useState<string | null>(modules[0]?.id ?? null);

  return (
    <ol className="overflow-hidden rounded-[24px] border border-outline-variant bg-white">
      {modules.map((m, i) => {
        const isOpen = openId === m.id;
        return (
          <li key={m.id} className="border-b border-outline-variant last:border-0">
            <button
              type="button"
              aria-expanded={isOpen}
              onClick={() => setOpenId(isOpen ? null : m.id)}
              className="flex w-full items-center gap-5 px-6 py-5 text-left transition-colors hover:bg-surface-container-low md:px-7"
            >
              <span
                className={cn(
                  "font-display text-[28px] font-extrabold leading-none tracking-[-0.04em] tabular-nums transition-colors",
                  isOpen ? "text-primary" : "text-[#d4d4d4]",
                )}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="flex-1 text-[17px] font-semibold text-ink">{m.title}</span>
              <span
                className={cn(
                  "grid h-9 w-9 flex-shrink-0 place-items-center rounded-full border transition-all duration-base",
                  isOpen ? "rotate-45 border-ink bg-ink text-white" : "border-outline-variant text-ink",
                )}
              >
                <Icon name="add" size={20} />
              </span>
            </button>
            {isOpen && (
              <p className="animate-fade-in pb-6 pl-[76px] pr-7 text-[15px] leading-relaxed text-on-surface-variant md:pl-[84px]">
                {m.content}
              </p>
            )}
          </li>
        );
      })}
    </ol>
  );
}

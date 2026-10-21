"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/Icon";

type Faq = { id: string; question: string; answer: string };

export function FaqAccordion({ faqs }: { faqs: Faq[] }) {
  const [openId, setOpenId] = useState<string | null>(faqs[0]?.id ?? null);

  return (
    <div className="overflow-hidden rounded-[24px] border border-outline-variant bg-white">
      {faqs.map((f) => {
        const isOpen = openId === f.id;
        return (
          <div key={f.id} className="border-b border-outline-variant last:border-0">
            <button
              type="button"
              aria-expanded={isOpen}
              onClick={() => setOpenId(isOpen ? null : f.id)}
              className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left transition-colors hover:bg-surface-container-low md:px-7"
            >
              <span className="text-[17px] font-semibold text-ink">{f.question}</span>
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
              <p className="animate-fade-in whitespace-pre-line px-6 pb-6 text-[15px] leading-relaxed text-on-surface-variant md:px-7">
                {f.answer}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}

"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/Icon";

type Faq = { id: string; question: string; answer: string };

export function FaqAccordion({ faqs }: { faqs: Faq[] }) {
  const [openId, setOpenId] = useState<string | null>(faqs[0]?.id ?? null);

  return (
    <div className="divide-y divide-surface-variant rounded border border-surface-variant bg-surface-container-lowest">
      {faqs.map((f) => {
        const isOpen = openId === f.id;
        return (
          <div key={f.id}>
            <button
              onClick={() => setOpenId(isOpen ? null : f.id)}
              className="flex w-full items-center justify-between px-card-padding py-4 text-left"
            >
              <span className="text-body-md font-semibold text-on-surface">{f.question}</span>
              <Icon name="add" className={cn("text-primary transition-transform shrink-0", isOpen && "rotate-45")} />
            </button>
            {isOpen && <p className="px-card-padding pb-4 text-body-sm text-on-surface-variant">{f.answer}</p>}
          </div>
        );
      })}
    </div>
  );
}

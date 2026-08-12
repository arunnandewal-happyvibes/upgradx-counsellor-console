"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/Icon";

type Module = { id: string; title: string; content: string; order: number };

export function CurriculumAccordion({ modules }: { modules: Module[] }) {
  const [openId, setOpenId] = useState<string | null>(modules[0]?.id ?? null);

  return (
    <div className="divide-y divide-surface-variant rounded border border-surface-variant bg-surface-container-lowest">
      {modules.map((m) => {
        const isOpen = openId === m.id;
        return (
          <div key={m.id}>
            <button
              onClick={() => setOpenId(isOpen ? null : m.id)}
              className="flex w-full items-center justify-between px-card-padding py-4 text-left"
            >
              <span className="text-body-md font-semibold text-on-surface">
                <span className="mr-2 text-primary">{m.order + 1}.</span>
                {m.title}
              </span>
              <Icon name="add" className={cn("text-primary transition-transform shrink-0", isOpen && "rotate-45")} />
            </button>
            {isOpen && <p className="px-card-padding pb-4 text-body-sm text-on-surface-variant">{m.content}</p>}
          </div>
        );
      })}
    </div>
  );
}

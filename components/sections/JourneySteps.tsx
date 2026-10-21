"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/Icon";

type Step = { id: string; order: number; title: string; description: string; icon: string };

const ICON_MAP: Record<string, string> = {
  user: "person",
  hammer: "construction",
  briefcase: "support_agent",
  flag: "work",
};

export function JourneySteps({ steps }: { steps: Step[] }) {
  const [active, setActive] = useState(steps[0]?.order ?? 1);
  const activeStep = steps.find((s) => s.order === active) ?? steps[0];

  return (
    <div className="flex flex-col gap-5">
      <div role="tablist" aria-label="How learning works" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {steps.map((s) => {
          const on = s.order === active;
          return (
            <button
              key={s.id}
              type="button"
              role="tab"
              aria-selected={on}
              onClick={() => setActive(s.order)}
              className={cn(
                "btn-3d flex flex-col gap-6 rounded-[24px] border p-6 text-left",
                on ? "border-ink bg-ink text-white" : "border-outline-variant bg-white text-ink hover:border-ink",
              )}
            >
              <span
                className={cn(
                  "font-display text-[44px] font-extrabold leading-none tracking-[-0.04em]",
                  on ? "text-primary" : "text-[#d4d4d4]",
                )}
              >
                {String(s.order).padStart(2, "0")}
              </span>
              <span className="font-display text-[19px] font-bold leading-tight">{s.title}</span>
            </button>
          );
        })}
      </div>

      {activeStep && (
        <div role="tabpanel" className="flex flex-col gap-6 rounded-[28px] border border-outline-variant bg-white p-8 md:flex-row md:items-center md:p-10">
          <div className="grid h-20 w-20 flex-shrink-0 place-items-center rounded-3xl bg-primary text-white">
            <Icon name={ICON_MAP[activeStep.icon] ?? "star"} size={40} />
          </div>
          <div className="flex flex-col gap-2">
            <span className="eyebrow">
              Step {activeStep.order} of {steps.length}
            </span>
            <h3 className="font-display text-headline-md font-bold text-ink">{activeStep.title}</h3>
            <p className="editable-field max-w-3xl text-body-lg text-on-surface-variant">{activeStep.description}</p>
          </div>
        </div>
      )}
    </div>
  );
}

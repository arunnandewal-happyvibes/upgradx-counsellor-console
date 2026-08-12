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
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-gutter">
        {steps.map((s) => {
          const isActive = s.order === active;
          return (
            <button
              key={s.id}
              onClick={() => setActive(s.order)}
              className={cn(
                "elevate-3d border-2 rounded-xl p-6 flex flex-col items-center text-center gap-4",
                isActive
                  ? "border-primary bg-primary-fixed/30"
                  : "border-surface-variant hover:border-primary/50",
              )}
            >
              <div
                className={cn(
                  "size-12 rounded-full flex items-center justify-center transition-all",
                  isActive ? "bg-primary text-white" : "bg-surface-container text-secondary",
                )}
              >
                <Icon name={ICON_MAP[s.icon] ?? "star"} fill={isActive} />
              </div>
              <div className="flex flex-col gap-1">
                <span
                  className={cn(
                    "text-label-bold font-bold uppercase tracking-widest",
                    isActive ? "text-primary" : "text-secondary",
                  )}
                >
                  Step {String(s.order).padStart(2, "0")}
                </span>
                <h3 className="text-headline-sm text-on-surface">{s.title}</h3>
              </div>
            </button>
          );
        })}
      </div>

      {activeStep && (
        <div className="w-full bg-surface-container-lowest border border-outline-variant rounded-2xl overflow-hidden shadow-sm flex flex-col md:flex-row">
          <div
            className="md:w-2/5 w-full h-40 md:h-auto flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #1a1c1c, #e41f26 160%)" }}
          >
            <Icon name={ICON_MAP[activeStep.icon] ?? "star"} className="text-white opacity-80" size={64} fill />
          </div>
          <div className="md:w-3/5 w-full p-8 flex flex-col justify-center gap-4">
            <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-label-bold font-bold w-fit uppercase tracking-wider">
              Step {activeStep.order} of {steps.length}
            </div>
            <h2 className="text-headline-md text-on-surface tracking-tight">{activeStep.title}</h2>
            <p className="text-body-lg text-secondary leading-relaxed editable-field">
              {activeStep.description}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

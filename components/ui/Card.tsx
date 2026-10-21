import { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

const tones = {
  // Default: white surface defined by a hairline, lifts on hover.
  default: "bg-surface-container-lowest border border-outline-variant",
  // Soft grey fill for secondary blocks.
  muted: "bg-surface-container-low border border-transparent",
  // Statement block: near-black with white text (e.g. the journey card).
  ink: "bg-ink text-white border border-ink",
  // The selected / best-match state.
  accent: "bg-primary text-on-primary border border-primary",
};

export function Card({
  className,
  tone = "default",
  interactive = true,
  ...props
}: HTMLAttributes<HTMLDivElement> & { tone?: keyof typeof tones; interactive?: boolean }) {
  return (
    <div
      className={cn("rounded-card", tones[tone], interactive && "elevate-3d", className)}
      {...props}
    />
  );
}

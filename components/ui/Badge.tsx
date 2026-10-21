import { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

const variants = {
  red: "bg-primary text-on-primary",
  redOutline: "bg-white text-primary border border-primary/30",
  gray: "bg-surface-container text-ink",
  solidDark: "bg-ink text-white",
};

/** Small status / category pill. Uppercase + tracked so it reads as a label, not a button. */
export function Badge({
  className,
  variant = "gray",
  ...props
}: HTMLAttributes<HTMLSpanElement> & { variant?: keyof typeof variants }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-bold uppercase leading-4 tracking-[0.12em]",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}

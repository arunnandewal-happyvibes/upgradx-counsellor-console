import { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

const variants = {
  red: "bg-primary text-on-primary",
  redOutline: "bg-surface-container-high text-on-surface-variant border border-outline-variant",
  gray: "bg-surface-container text-tertiary",
  solidDark: "bg-on-tertiary-fixed-variant text-white",
};

export function Badge({
  className,
  variant = "gray",
  ...props
}: HTMLAttributes<HTMLSpanElement> & { variant?: keyof typeof variants }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-label-bold font-bold uppercase tracking-wide",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}

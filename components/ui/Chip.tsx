import { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

/**
 * Toggleable pill (filters, interests, quick replies). Selected = solid ink,
 * idle = hairline outline. Pass `selected` to make it a toggle (aria-pressed).
 */
export function Chip({
  selected,
  className,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { selected?: boolean }) {
  return (
    <button
      type="button"
      aria-pressed={selected === undefined ? undefined : selected}
      className={cn(
        "btn-3d inline-flex h-10 items-center gap-2 rounded-full px-4 text-[14px] font-medium",
        selected
          ? "border border-ink bg-ink text-white"
          : "border border-outline-variant bg-white text-ink hover:border-ink",
        "disabled:pointer-events-none disabled:opacity-50",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

/** Non-interactive pill for showing facts (e.g. the learner's profile). */
export function Tag({ className, dark, ...props }: React.HTMLAttributes<HTMLSpanElement> & { dark?: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[14px] font-medium leading-none",
        dark ? "bg-ink text-white" : "border border-outline-variant text-ink",
        className,
      )}
      {...props}
    />
  );
}

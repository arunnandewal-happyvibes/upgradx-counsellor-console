import { ButtonHTMLAttributes, AnchorHTMLAttributes } from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { Spinner } from "@/components/ui/Spinner";

const base =
  "btn-3d inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl font-semibold " +
  "disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed aria-busy:cursor-progress";

const sizes = {
  sm: "h-10 px-4 text-[14px]",
  md: "h-12 px-5 text-[15px]",
  lg: "h-14 px-7 text-[16px] rounded-2xl",
};

const variants = {
  // Red is reserved for the one action that matters most on a screen.
  primary: "bg-primary text-on-primary hover:bg-primary-container hover:shadow-red-glow",
  // Black, for confident secondary actions (and on red/ink backgrounds use outline).
  dark: "bg-ink text-white hover:bg-black hover:shadow-cardHover",
  secondary: "border-[1.5px] border-ink bg-white text-ink hover:bg-ink hover:text-white",
  outline: "border border-outline-variant bg-white text-ink hover:border-ink",
  ghost: "text-ink hover:bg-surface-container-low",
  surface: "bg-surface-container-low text-ink hover:bg-surface-container",
};

type Variant = keyof typeof variants;
type Size = keyof typeof sizes;
type Common = { variant?: Variant; size?: Size; loading?: boolean };

export function Button({
  className,
  variant = "primary",
  size = "md",
  loading = false,
  disabled,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & Common) {
  return (
    <button
      className={cn(base, sizes[size], variants[variant], className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading && <Spinner size={16} />}
      {children}
    </button>
  );
}

export function LinkButton({
  className,
  variant = "primary",
  size = "md",
  href,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement> & Omit<Common, "loading"> & { href: string }) {
  return <Link href={href} className={cn(base, sizes[size], variants[variant], className)} {...props} />;
}

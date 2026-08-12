import { ButtonHTMLAttributes, AnchorHTMLAttributes } from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";

const base =
  "btn-3d inline-flex items-center justify-center gap-2 rounded text-label-bold font-bold uppercase tracking-wide transition-colors disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed";

const variants = {
  primary: "bg-primary text-on-primary hover:bg-primary-container px-5 py-2.5 shadow-sm",
  secondary: "bg-transparent text-primary border border-primary hover:bg-primary-fixed px-5 py-2.5",
  ghost: "text-primary hover:bg-primary-fixed px-3 py-1.5 normal-case tracking-normal font-semibold text-body-md",
  outline: "border border-outline-variant text-on-surface-variant hover:border-primary hover:text-primary px-4 py-2 normal-case tracking-normal font-semibold text-body-md",
  surface: "bg-surface-container-high text-on-surface hover:bg-surface-container-highest px-4 py-2 normal-case tracking-normal font-bold text-body-md",
};

type Variant = keyof typeof variants;

export function Button({
  className,
  variant = "primary",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return <button className={cn(base, variants[variant], className)} {...props} />;
}

export function LinkButton({
  className,
  variant = "primary",
  href,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement> & { variant?: Variant; href: string }) {
  return <Link href={href} className={cn(base, variants[variant], className)} {...props} />;
}

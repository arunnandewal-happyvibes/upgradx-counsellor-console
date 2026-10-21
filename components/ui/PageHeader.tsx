import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";

/** Opening block for every console sub-page: back link, kicker, big title, lead line, actions. */
export function PageHeader({
  back,
  eyebrow,
  title,
  lead,
  children,
  className,
}: {
  back?: { href: string; label: string };
  eyebrow?: string;
  title: React.ReactNode;
  lead?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <header className={cn("flex flex-col gap-5 pt-4", className)}>
      {back && (
        <Link
          href={back.href}
          className="-ml-2 inline-flex w-fit items-center gap-1.5 rounded-lg px-2 py-1.5 text-[14px] font-semibold text-on-surface-variant transition-colors hover:bg-surface-container-low hover:text-ink"
        >
          <Icon name="arrow_back" size={18} />
          {back.label}
        </Link>
      )}
      {eyebrow && <span className="eyebrow">{eyebrow}</span>}
      <h1 className="max-w-5xl font-display text-[clamp(40px,6vw,80px)] font-extrabold leading-[0.98] tracking-[-0.045em] text-ink">
        {title}
      </h1>
      {lead && <p className="max-w-2xl text-[18px] leading-relaxed text-on-surface-variant">{lead}</p>}
      {children && <div className="flex flex-wrap gap-3 pt-1">{children}</div>}
    </header>
  );
}

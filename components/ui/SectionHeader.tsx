import { cn } from "@/lib/cn";

/** Editorial section opener: red tracked kicker, big tight headline, optional action on the right. */
export function SectionHeader({
  eyebrow,
  title,
  action,
  className,
}: {
  eyebrow?: string;
  title: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mb-7 flex flex-wrap items-end justify-between gap-4", className)}>
      <div className="min-w-0">
        {eyebrow && <div className="eyebrow mb-2">{eyebrow}</div>}
        <h2 className="text-display-lg font-extrabold text-on-surface">{title}</h2>
      </div>
      {action}
    </div>
  );
}

import { cn } from "@/lib/cn";

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
    <div className={cn("mb-gutter", className)}>
      <div className="flex items-end justify-between gap-4 mb-2">
        <div>
          {eyebrow && (
            <div className="mb-1 text-label-bold font-bold uppercase tracking-wide text-secondary">
              {eyebrow}
            </div>
          )}
          <h2 className="text-headline-md font-bold text-on-surface">{title}</h2>
        </div>
        {action}
      </div>
      <div className="h-[2px] w-16 bg-primary" />
    </div>
  );
}

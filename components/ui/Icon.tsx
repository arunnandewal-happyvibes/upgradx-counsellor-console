import { cn } from "@/lib/cn";

export function Icon({
  name,
  className,
  fill = false,
  size,
}: {
  name: string;
  className?: string;
  fill?: boolean;
  size?: number;
}) {
  return (
    <span
      className={cn("material-symbols-outlined select-none", className)}
      style={{
        fontVariationSettings: `'FILL' ${fill ? 1 : 0}`,
        fontSize: size ? `${size}px` : undefined,
      }}
      aria-hidden="true"
    >
      {name}
    </span>
  );
}

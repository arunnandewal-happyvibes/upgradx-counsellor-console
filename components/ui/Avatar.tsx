import Image from "next/image";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/Icon";

/**
 * Renders an uploaded photo, or a clearly-marked placeholder (dashed border +
 * person silhouette) when none is set yet — so it's obvious where a real
 * image still needs to be added, rather than silently faking it with initials.
 */
export function Avatar({
  src,
  name,
  size = 48,
  rounded = "rounded-full",
  className,
}: {
  src?: string | null;
  name: string;
  size?: number;
  rounded?: string;
  className?: string;
}) {
  if (src) {
    return (
      <Image
        src={src}
        alt={name}
        width={size}
        height={size}
        className={cn(rounded, "object-cover flex-shrink-0", className)}
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <div
      className={cn(
        rounded,
        "flex-shrink-0 border-2 border-dashed border-outline-variant bg-surface-container-low flex items-center justify-center text-outline",
        className,
      )}
      style={{ width: size, height: size }}
      title={`No photo yet for ${name}`}
    >
      <Icon name="person" size={Math.round(size * 0.55)} />
    </div>
  );
}

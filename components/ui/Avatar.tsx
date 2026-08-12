import Image from "next/image";
import { cn } from "@/lib/cn";

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
        "flex-shrink-0 bg-on-surface flex items-center justify-center text-white font-bold",
        className,
      )}
      style={{ width: size, height: size }}
    >
      {name.charAt(0)}
    </div>
  );
}

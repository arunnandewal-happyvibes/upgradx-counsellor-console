import Image from "next/image";
import { cn } from "@/lib/cn";

/**
 * Official upGrad X lockup (wordmark + "THE OFFLINE XPERIENCE" tagline).
 * Source aspect ratio is ~3.36:1 — always size via `height` so the mark
 * stays undistorted; `className` controls layout only.
 */
export function Logo({
  height = 32,
  className,
  priority = false,
}: {
  height?: number;
  className?: string;
  priority?: boolean;
}) {
  const width = Math.round(height * (1322 / 393));
  return (
    <Image
      src="/brand/upgradx-logo.png"
      alt="upGrad X — The Offline Xperience"
      width={width}
      height={height}
      priority={priority}
      className={cn("object-contain", className)}
      style={{ height, width: "auto" }}
    />
  );
}

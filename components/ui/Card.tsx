import { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "elevate-3d bg-surface-container-lowest border border-[#e0e0e0] rounded hover:border-primary",
        className,
      )}
      {...props}
    />
  );
}

"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

const NAV = [
  { id: "programs", label: "Programs" },
  { id: "batches", label: "Batches" },
  { id: "instructors", label: "Instructors" },
  { id: "leaders", label: "Leaders" },
];

export function TopNavLinks() {
  const pathname = usePathname();
  const [active, setActive] = useState<string | null>(null);

  // Underline whichever section is currently on screen (console home only).
  useEffect(() => {
    if (pathname !== "/console") return setActive(null);
    const els = NAV.map((n) => document.getElementById(n.id)).filter((e): e is HTMLElement => !!e);
    if (!els.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        const hit = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (hit) setActive(hit.target.id);
      },
      { rootMargin: "-80px 0px -55% 0px" },
    );
    els.forEach((e) => io.observe(e));
    return () => io.disconnect();
  }, [pathname]);

  return (
    <nav aria-label="Console sections" className="hidden items-center gap-7 md:flex">
      {NAV.map((item) => {
        const on = active === item.id;
        return (
          <a
            key={item.id}
            aria-current={on ? "location" : undefined}
            className={cn(
              "relative py-2 text-[15px] transition-colors duration-fast",
              on ? "font-semibold text-ink" : "font-medium text-on-surface-variant hover:text-ink",
            )}
            href={`/console#${item.id}`}
            onClick={(e) => {
              // Already on the console home page — just scroll, no reload.
              if (pathname === "/console") {
                const el = document.getElementById(item.id);
                if (el) {
                  e.preventDefault();
                  el.scrollIntoView({ behavior: "smooth" });
                  history.replaceState(null, "", `/console#${item.id}`);
                }
              }
            }}
          >
            {item.label}
            <span
              aria-hidden="true"
              className={cn(
                "absolute inset-x-0 -bottom-[1px] h-[2px] origin-left rounded-full bg-primary transition-transform duration-base ease-out",
                on ? "scale-x-100" : "scale-x-0",
              )}
            />
          </a>
        );
      })}
    </nav>
  );
}

/** Phones hide the desktop nav; this swipeable chip row keeps every section one tap away. */
export function MobileSectionNav() {
  const pathname = usePathname();
  if (pathname !== "/console") return null;
  return (
    <nav aria-label="Console sections" className="snap-row flex gap-2 overflow-x-auto px-4 pb-3 sm:px-6 md:hidden">
      {NAV.map((item) => (
        <a
          key={item.id}
          href={`#${item.id}`}
          className="flex-shrink-0 rounded-full border border-outline-variant bg-white px-4 py-2 text-[14px] font-medium text-ink"
        >
          {item.label}
        </a>
      ))}
    </nav>
  );
}

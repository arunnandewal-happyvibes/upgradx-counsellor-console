"use client";

import { usePathname } from "next/navigation";
import { useCity } from "@/lib/city-context";

const NAV = [
  { id: "programs", label: "Programs" },
  { id: "batches", label: "Batches" },
  { id: "instructors", label: "Instructors" },
  { id: "leaders", label: "Leaders" },
];

export function TopNavLinks() {
  const pathname = usePathname();
  const { selectedCity } = useCity();
  const citySuffix = selectedCity ? `?city=${selectedCity.slug}` : "";

  return (
    <nav className="hidden md:flex gap-gutter items-center">
      {NAV.map((item) => (
        <a
          key={item.id}
          className="text-secondary text-body-md hover:text-primary transition-colors duration-200"
          href={`/console${citySuffix}#${item.id}`}
          onClick={(e) => {
            // Already on the console home page — just scroll, no reload (keeps the
            // selected city and any client-side state intact).
            if (pathname === "/console") {
              const el = document.getElementById(item.id);
              if (el) {
                e.preventDefault();
                el.scrollIntoView({ behavior: "smooth" });
                history.replaceState(null, "", `/console${citySuffix}#${item.id}`);
              }
            }
          }}
        >
          {item.label}
        </a>
      ))}
    </nav>
  );
}

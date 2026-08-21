"use client";

import { usePathname } from "next/navigation";

const NAV = [
  { id: "programs", label: "Programs" },
  { id: "batches", label: "Batches" },
  { id: "instructors", label: "Instructors" },
  { id: "leaders", label: "Leaders" },
];

export function TopNavLinks() {
  const pathname = usePathname();

  return (
    <nav className="hidden md:flex gap-gutter items-center">
      {NAV.map((item) => (
        <a
          key={item.id}
          className="text-secondary text-body-md hover:text-primary transition-colors duration-200"
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
        </a>
      ))}
    </nav>
  );
}

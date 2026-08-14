"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CityDropdown } from "@/components/ui/CityDropdown";
import { Icon } from "@/components/ui/Icon";
import { Logo } from "@/components/ui/Logo";
import { TopNavLinks } from "@/components/ui/TopNavLinks";

export function TopBar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 flex justify-between items-center w-full px-container-margin h-16 bg-surface border-b-2 border-primary shadow-sm">
      <div className="flex items-center gap-gutter">
        <Link
          href="/console"
          className="flex items-center"
          onClick={(e) => {
            // Always land at the top of the console home page — including
            // when we're already there but scrolled down or hash-anchored.
            if (pathname === "/console") {
              e.preventDefault();
              history.replaceState(null, "", "/console");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }
          }}
        >
          <Logo height={30} priority />
        </Link>
        <CityDropdown />
      </div>

      <TopNavLinks />

      <div className="flex items-center gap-4">
        <Link
          href="/console/contact"
          aria-label="Contact"
          className="text-primary hover:opacity-80 transition-opacity"
        >
          <Icon name="location_on" />
        </Link>
        <Link
          href="/admin"
          className="btn-3d inline-flex items-center gap-1.5 rounded border border-outline-variant px-3 py-1.5 text-label-bold font-bold uppercase tracking-wide text-on-surface-variant hover:border-primary hover:text-primary transition-colors"
        >
          <Icon name="admin_panel_settings" size={18} />
          <span className="hidden sm:inline">Admin</span>
        </Link>
      </div>
    </header>
  );
}

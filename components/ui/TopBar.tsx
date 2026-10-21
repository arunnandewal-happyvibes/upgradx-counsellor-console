"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { Logo } from "@/components/ui/Logo";
import { TopNavLinks, MobileSectionNav } from "@/components/ui/TopNavLinks";
import { CommandPalette, type PaletteProgram } from "@/components/console/CommandPalette";

export function TopBar({ programs = [] }: { programs?: PaletteProgram[] }) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-outline-variant bg-white/85 backdrop-blur-xl backdrop-saturate-150">
      <div className="mx-auto flex h-[72px] max-w-[1440px] items-center gap-6 px-container-margin lg:px-12">
        <Link
          href="/console"
          className="flex items-center gap-4"
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
          <Logo height={36} priority />
          <span className="hidden whitespace-nowrap border-l border-outline-variant pl-4 text-[13px] font-medium text-on-surface-variant xl:block">
            Expert Counselling Portal
          </span>
        </Link>

        <TopNavLinks />

        <div className="ml-auto flex items-center gap-2.5">
          <CommandPalette programs={programs} />
          <Link
            href="/console/contact"
            aria-label="Centre contacts"
            className="btn-3d grid h-11 w-11 place-items-center rounded-xl border border-outline-variant bg-white text-primary hover:border-ink"
          >
            <Icon name="location_on" size={20} />
          </Link>
          {!pathname.startsWith("/console/close-session") && (
            <Link
              href="/console/close-session"
              className="btn-3d inline-flex h-11 items-center gap-2 whitespace-nowrap rounded-xl bg-primary px-4 text-[14px] font-bold text-on-primary hover:bg-primary-container hover:shadow-red-glow"
            >
              <Icon name="task_alt" size={18} />
              <span className="hidden sm:inline">Close session</span>
            </Link>
          )}
          <Link
            href="/admin"
            className="btn-3d inline-flex h-11 items-center gap-2 whitespace-nowrap rounded-xl border border-outline-variant bg-white px-4 text-[14px] font-semibold text-ink hover:border-ink"
          >
            <Icon name="admin_panel_settings" size={18} />
            <span className="hidden sm:inline">Admin</span>
          </Link>
        </div>
      </div>
      <MobileSectionNav />
    </header>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { Logo } from "@/components/ui/Logo";
import { LogoutButton } from "@/components/admin/LogoutButton";
import { cn } from "@/lib/cn";

type Item = { href: string; label: string; icon: string };

const GROUPS: { title: string; items: Item[] }[] = [
  { title: "", items: [{ href: "/admin", label: "Dashboard", icon: "space_dashboard" }] },
  {
    title: "Sessions",
    items: [
      { href: "/admin/sessions", label: "Closed Sessions", icon: "task_alt" },
      { href: "/admin/transcripts", label: "Session Transcripts", icon: "description" },
      { href: "/admin/counsellors", label: "Counsellors", icon: "badge" },
    ],
  },
  {
    title: "Catalogue",
    items: [
      { href: "/admin/courses", label: "Courses", icon: "school" },
      { href: "/admin/addon-certificates", label: "Add-on Certificates", icon: "verified" },
      { href: "/admin/recommendations", label: "Recommendations", icon: "recommend" },
    ],
  },
  {
    title: "Schedule",
    items: [
      { href: "/admin/batches", label: "Batches", icon: "calendar_month" },
      { href: "/admin/drives", label: "Placement Drives", icon: "work" },
      { href: "/admin/events", label: "Events", icon: "event" },
    ],
  },
  {
    title: "People & proof",
    items: [
      { href: "/admin/instructors", label: "Instructors", icon: "person" },
      { href: "/admin/industry-leaders", label: "Industry Leaders", icon: "groups" },
      { href: "/admin/hiring-partners", label: "Hiring Partners", icon: "apartment" },
      { href: "/admin/success-stories", label: "Success Stories", icon: "workspace_premium" },
    ],
  },
  {
    title: "Knowledge",
    items: [
      { href: "/admin/faqs", label: "FAQs", icon: "quiz" },
      { href: "/admin/faqs/suggested", label: "Suggested Questions", icon: "forum" },
      { href: "/admin/career-services-policy", label: "Career Services Policy", icon: "policy" },
    ],
  },
  {
    title: "Setup",
    items: [
      { href: "/admin/cities", label: "Cities", icon: "location_city" },
      { href: "/admin/city-contacts", label: "City Contacts", icon: "contact_phone" },
      { href: "/admin/home-screen", label: "Home Screen (Default)", icon: "home" },
      { href: "/admin/journey-steps", label: "Journey Steps", icon: "route" },
      { href: "/admin/section-visibility", label: "Section Visibility", icon: "visibility" },
    ],
  },
  {
    title: "System",
    items: [
      { href: "/admin/backups", label: "Backups", icon: "backup" },
      { href: "/admin/ui-kit", label: "UI Kit", icon: "palette" },
    ],
  },
];

const ALL = GROUPS.flatMap((g) => g.items);

/** Longest matching prefix wins, so /admin/faqs/suggested highlights "Suggested Questions", not "FAQs". */
function activeHref(pathname: string) {
  return ALL.filter((i) => (i.href === "/admin" ? pathname === "/admin" : pathname === i.href || pathname.startsWith(i.href + "/")))
    .sort((a, b) => b.href.length - a.href.length)[0]?.href;
}

function NavBody({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const current = activeHref(pathname);
  return (
    <>
      <div className="flex-1 overflow-y-auto px-3 pb-4">
        <nav aria-label="Admin" className="flex flex-col gap-5">
          {GROUPS.map((g) => (
            <div key={g.title || "top"} className="flex flex-col gap-0.5">
              {g.title && (
                <div className="px-3 pb-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-on-surface-variant">{g.title}</div>
              )}
              {g.items.map((item) => {
                const on = item.href === current;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onNavigate}
                    aria-current={on ? "page" : undefined}
                    className={cn(
                      "flex h-10 items-center gap-3 rounded-xl px-3 text-[14px] font-medium transition-colors",
                      on ? "bg-ink text-white" : "text-ink hover:bg-surface-container-low",
                    )}
                  >
                    <Icon name={item.icon} size={19} className={on ? "text-white" : "text-on-surface-variant"} />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
      </div>
      {/* Fixed footer — stays visible without scrolling through the whole nav list above. */}
      <div className="flex-shrink-0 space-y-2 border-t border-outline-variant bg-white p-4">
        <Link
          href="/console"
          className="btn-3d flex h-11 items-center justify-center gap-2 rounded-xl bg-primary text-[14px] font-bold text-white hover:bg-primary-container"
        >
          <Icon name="arrow_back" size={18} />
          Back to Console
        </Link>
        <LogoutButton />
      </div>
    </>
  );
}

export function AdminNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  useEffect(() => setOpen(false), [pathname]);

  return (
    <>
      {/* Phones/tablets: compact bar with a menu button that opens the nav as a drawer. */}
      <div className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-outline-variant bg-white/90 px-4 backdrop-blur-xl lg:hidden">
        <Link href="/admin" className="flex items-center gap-2">
          <Logo height={28} />
          <span className="text-[13px] font-semibold text-on-surface-variant">Admin</span>
        </Link>
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open admin menu"
          aria-expanded={open}
          className="grid h-11 w-11 place-items-center rounded-xl border border-outline-variant text-ink"
        >
          <Icon name="menu" size={22} />
        </button>
      </div>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 animate-fade-in bg-ink/40 backdrop-blur-sm" onClick={() => setOpen(false)} aria-hidden="true" />
          <aside className="absolute inset-y-0 left-0 flex w-[290px] max-w-[85vw] animate-pop-in flex-col bg-white shadow-float">
            <div className="flex h-16 items-center justify-between px-5">
              <Logo height={26} />
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close admin menu"
                className="grid h-10 w-10 place-items-center rounded-full hover:bg-surface-container-low"
              >
                <Icon name="close" size={20} />
              </button>
            </div>
            <NavBody onNavigate={() => setOpen(false)} />
          </aside>
        </div>
      )}

      {/* Desktop: permanent sidebar. */}
      <aside className="sticky top-0 hidden h-screen w-64 flex-shrink-0 flex-col border-r border-outline-variant bg-white lg:flex">
        <Link href="/admin" className="flex flex-col gap-1 px-6 pb-5 pt-6">
          <Logo height={26} />
          <span className="text-[12px] font-semibold text-on-surface-variant">Expert Counselling Portal · Admin</span>
        </Link>
        <NavBody />
      </aside>
    </>
  );
}

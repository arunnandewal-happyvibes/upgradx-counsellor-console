"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname, useRouter } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import { openAssistant } from "@/lib/sessionDock";

export type PaletteProgram = { name: string; slug: string; duration: string };

type Item = { id: string; group: string; label: string; hint?: string; icon: string; href?: string; run?: () => void };

const SECTIONS: { id: string; label: string; icon: string }[] = [
  { id: "hero", label: "Top of console", icon: "home" },
  { id: "programs", label: "Programs", icon: "school" },
  { id: "batches", label: "Upcoming batches", icon: "calendar_month" },
  { id: "hiring-partners", label: "Hiring partners", icon: "apartment" },
  { id: "success-stories", label: "Success stories", icon: "workspace_premium" },
  { id: "instructors", label: "Instructors", icon: "person" },
  { id: "leaders", label: "Industry leaders", icon: "groups" },
  { id: "drives", label: "Placement drives", icon: "work" },
  { id: "events", label: "Events", icon: "event" },
  { id: "faq", label: "FAQs", icon: "help" },
];

const PAGES: { href: string; label: string; icon: string }[] = [
  { href: "/console/batches", label: "All batches", icon: "calendar_month" },
  { href: "/console/drives", label: "All placement drives", icon: "work" },
  { href: "/console/faq", label: "FAQ library", icon: "quiz" },
  { href: "/console/contact", label: "Centre contacts", icon: "location_on" },
  { href: "/console/career-services-policy", label: "Career services policy", icon: "policy" },
  { href: "/console/close-session", label: "Close session", icon: "task_alt" },
];

type FaqHit = { id: string; question: string; category: { slug: string; name: string } };

const isMac = () => typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform);

/** ⌘K / Ctrl+K "go anywhere" search across sections, pages, programs and FAQs. */
export function CommandPalette({ programs }: { programs: PaletteProgram[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const [faqs, setFaqs] = useState<FaqHit[]>([]);
  const [mac, setMac] = useState(true);
  const input = useRef<HTMLInputElement>(null);
  const list = useRef<HTMLUListElement>(null);

  useEffect(() => setMac(isMac()), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!open) return;
    setQ("");
    setActive(0);
    setFaqs([]);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const t = window.setTimeout(() => input.current?.focus(), 10);
    return () => {
      document.body.style.overflow = prev;
      window.clearTimeout(t);
    };
  }, [open]);

  // FAQ answers come from the server; debounce so typing stays snappy.
  useEffect(() => {
    const term = q.trim();
    if (!open || term.length < 2) return setFaqs([]);
    const ctl = new AbortController();
    const t = window.setTimeout(() => {
      fetch(`/api/faq/search?q=${encodeURIComponent(term)}`, { signal: ctl.signal })
        .then((r) => r.json())
        .then((rows: FaqHit[]) => setFaqs(Array.isArray(rows) ? rows.slice(0, 5) : []))
        .catch(() => {});
    }, 180);
    return () => {
      ctl.abort();
      window.clearTimeout(t);
    };
  }, [q, open]);

  const items = useMemo<Item[]>(() => {
    const term = q.trim().toLowerCase();
    const match = (s: string) => !term || s.toLowerCase().includes(term);
    const out: Item[] = [
      ...SECTIONS.filter((s) => match(s.label)).map((s) => ({
        id: `s-${s.id}`,
        group: "Jump to",
        label: s.label,
        icon: s.icon,
        href: `/console#${s.id}`,
      })),
      ...programs
        .filter((p) => match(p.name))
        .slice(0, term ? 8 : 4)
        .map((p) => ({
          id: `p-${p.slug}`,
          group: "Programs",
          label: p.name,
          hint: p.duration,
          icon: "school",
          href: `/console/programs/${p.slug}`,
        })),
      ...PAGES.filter((p) => match(p.label)).map((p) => ({
        id: `g-${p.href}`,
        group: "Pages",
        label: p.label,
        icon: p.icon,
        href: p.href,
      })),
      ...faqs.map((f) => ({
        id: `f-${f.id}`,
        group: "FAQ answers",
        label: f.question,
        hint: f.category.name,
        icon: "help",
        href: `/console/faq/${f.category.slug}`,
      })),
    ];
    if (term) {
      out.push({
        id: "ask",
        group: "Assistant",
        label: `Ask the assistant about “${q.trim()}”`,
        icon: "mic",
        run: openAssistant,
      });
    }
    return out;
  }, [q, programs, faqs]);

  useEffect(() => setActive(0), [q]);
  useEffect(() => {
    list.current?.querySelector<HTMLElement>(`[data-idx="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [active]);

  const go = (item: Item) => {
    setOpen(false);
    if (item.run) return item.run();
    if (!item.href) return;
    const [path, hash] = item.href.split("#");
    if (hash && pathname === path) {
      document.getElementById(hash)?.scrollIntoView({ behavior: "smooth" });
      history.replaceState(null, "", item.href);
    } else {
      router.push(item.href);
    }
  };

  const onInputKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, items.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter" && items[active]) {
      e.preventDefault();
      go(items[active]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  let lastGroup = "";

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Search the console"
        className="btn-3d flex h-11 items-center gap-2.5 rounded-xl border border-outline-variant bg-surface-container-low px-3 text-[14px] text-on-surface-variant hover:border-ink lg:min-w-[220px]"
      >
        <Icon name="search" size={20} />
        <span className="hidden lg:inline">Search anything</span>
        <kbd className="ml-auto hidden rounded-md border border-outline-variant bg-white px-1.5 py-0.5 font-sans text-[12px] lg:inline">
          {mac ? "⌘K" : "Ctrl K"}
        </kbd>
      </button>

      {open &&
        createPortal(
          <div className="fixed inset-0 z-[220] flex items-start justify-center px-4 pt-[12vh]">
            <div className="absolute inset-0 animate-fade-in bg-ink/40 backdrop-blur-sm" onClick={() => setOpen(false)} aria-hidden="true" />
            <div
              role="dialog"
              aria-modal="true"
              aria-label="Search the console"
              className="relative w-full max-w-[640px] animate-pop-in overflow-hidden rounded-3xl bg-white shadow-float"
            >
              <div className="flex items-center gap-3 border-b border-outline-variant px-5">
                <Icon name="search" size={22} className="text-on-surface-variant" />
                <input
                  ref={input}
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  onKeyDown={onInputKey}
                  role="combobox"
                  aria-expanded="true"
                  aria-controls="palette-list"
                  aria-activedescendant={items[active] ? `palette-${items[active].id}` : undefined}
                  placeholder="Programs, batches, FAQs, pages…"
                  className="h-16 flex-1 bg-transparent text-[17px] text-ink placeholder:text-[#8a8a8a] focus:outline-none"
                />
                <kbd className="rounded-md border border-outline-variant px-1.5 py-0.5 text-[12px] text-on-surface-variant">Esc</kbd>
              </div>
              <ul id="palette-list" ref={list} role="listbox" className="max-h-[min(440px,60vh)] overflow-y-auto p-2">
                {items.length === 0 && (
                  <li className="px-4 py-10 text-center text-body-md text-on-surface-variant">Nothing matches “{q}”.</li>
                )}
                {items.map((item, i) => {
                  const header = item.group !== lastGroup ? item.group : null;
                  lastGroup = item.group;
                  const on = i === active;
                  return (
                    <li key={item.id} role="presentation">
                      {header && (
                        <div className="px-3 pb-1.5 pt-3 text-[11px] font-bold uppercase tracking-[0.12em] text-on-surface-variant">
                          {header}
                        </div>
                      )}
                      <button
                        type="button"
                        id={`palette-${item.id}`}
                        role="option"
                        aria-selected={on}
                        data-idx={i}
                        onMouseMove={() => setActive(i)}
                        onClick={() => go(item)}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[15px] transition-colors",
                          on ? "bg-ink text-white" : "text-ink",
                        )}
                      >
                        <span
                          className={cn(
                            "grid h-9 w-9 flex-shrink-0 place-items-center rounded-lg",
                            on ? "bg-white/15 text-white" : "bg-surface-container-low text-primary",
                          )}
                        >
                          <Icon name={item.icon} size={18} />
                        </span>
                        <span className="min-w-0 flex-1 truncate font-medium">{item.label}</span>
                        {item.hint && (
                          <span className={cn("flex-shrink-0 text-[13px]", on ? "text-white/60" : "text-on-surface-variant")}>
                            {item.hint}
                          </span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
              <div className="flex gap-4 border-t border-outline-variant px-5 py-3 text-[12px] text-on-surface-variant">
                <span>↑↓ to move</span>
                <span>↵ to open</span>
                <span>Esc to close</span>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}

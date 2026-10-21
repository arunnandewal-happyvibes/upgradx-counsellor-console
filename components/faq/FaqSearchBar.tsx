"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/Icon";
import { Spinner } from "@/components/ui/Spinner";

type Result = { id: string; question: string; answer: string; category: { name: string; slug: string } };

export function FaqSearchBar({ className }: { className?: string }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const handle = setTimeout(() => {
      fetch(`/api/faq/search?q=${encodeURIComponent(query)}`)
        .then((r) => r.json())
        .then(setResults)
        .finally(() => setLoading(false));
    }, 250);
    return () => clearTimeout(handle);
  }, [query]);

  // Close the results when clicking anywhere else.
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (wrap.current && !wrap.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  return (
    <div ref={wrap} className={cn("relative", className)}>
      <div className="relative">
        <Icon name="search" size={24} className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-on-surface-variant" />
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
          aria-label="Search all FAQs"
          placeholder="Search all FAQs — e.g. “EMI options”, “placement guarantee”"
          className="h-16 w-full rounded-[20px] border border-outline-variant bg-surface-container-low pl-14 pr-14 text-[17px] text-ink placeholder:text-[#8a8a8a] transition-[border-color,box-shadow,background-color] focus:border-primary focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/15"
        />
        {loading && <Spinner size={20} className="absolute right-5 top-1/2 -translate-y-1/2 text-on-surface-variant" />}
      </div>
      {open && query.trim() && !loading && (
        <div className="absolute z-20 mt-2 max-h-[28rem] w-full animate-pop-in overflow-y-auto rounded-[20px] border border-outline-variant bg-white p-2 shadow-float">
          {results.length === 0 ? (
            <div className="p-5 text-[15px] text-on-surface-variant">No matches for “{query}”. Try a shorter phrase.</div>
          ) : (
            results.map((r) => (
              <Link
                key={r.id}
                href={`/console/faq/${r.category.slug}`}
                className="block rounded-2xl p-4 transition-colors hover:bg-surface-container-low"
              >
                <div className="mb-1 text-[11px] font-bold uppercase tracking-[0.12em] text-primary">{r.category.name}</div>
                <div className="mb-1 text-[16px] font-semibold text-ink">{r.question}</div>
                <p className="line-clamp-2 text-[14px] text-on-surface-variant">{r.answer}</p>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
}

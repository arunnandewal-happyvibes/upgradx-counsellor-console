"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/Icon";

type Result = { id: string; question: string; answer: string; category: { name: string; slug: string } };

export function FaqSearchBar({ className }: { className?: string }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const handle = setTimeout(() => {
      fetch(`/api/faq/search?q=${encodeURIComponent(query)}`)
        .then((r) => r.json())
        .then(setResults);
    }, 250);
    return () => clearTimeout(handle);
  }, [query]);

  return (
    <div className={cn("relative", className)}>
      <div className="relative">
        <Icon
          name="search"
          className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary pointer-events-none"
        />
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Search all FAQs — e.g. “EMI options”, “placement guarantee”"
          className="w-full rounded border border-surface-variant bg-surface-container-lowest pl-12 pr-5 py-3 text-body-md outline-none focus:border-primary focus:ring-1 focus:ring-primary"
        />
      </div>
      {open && query.trim() && (
        <div className="absolute z-20 mt-2 max-h-96 w-full overflow-y-auto rounded border border-surface-variant bg-surface-container-lowest shadow-md">
          {results.length === 0 ? (
            <div className="p-4 text-body-sm text-secondary">No matches yet — keep typing.</div>
          ) : (
            results.map((r) => (
              <div key={r.id} className="border-b border-surface-container p-4 last:border-0">
                <div className="mb-1 text-label-bold font-bold uppercase text-primary">{r.category.name}</div>
                <div className="mb-1 text-body-md font-semibold text-on-surface">{r.question}</div>
                <p className="text-body-sm text-on-surface-variant">{r.answer}</p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

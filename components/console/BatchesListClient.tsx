"use client";

import { useEffect, useState } from "react";
import { useCity } from "@/lib/city-context";
import { Chip } from "@/components/ui/Chip";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { BatchList } from "@/components/console/BatchList";

type Batch = {
  id: string;
  program: { name: string };
  mode: string;
  city: { name: string; slug: string } | null;
  startDate: string;
  applicationCloseDate: string;
  timing: string;
  location: string;
};

type Mode = "all" | "Offline" | "Online";

export function BatchesListClient({ batches }: { batches: Batch[] }) {
  const { cities, selectedCity } = useCity();
  const [filterSlug, setFilterSlug] = useState<string>("all");
  const [mode, setMode] = useState<Mode>("all");

  // Defaults to whichever city is active for this session (set during
  // onboarding) — "All cities" is always available to see everything.
  useEffect(() => {
    if (selectedCity) setFilterSlug(selectedCity.slug);
  }, [selectedCity]);

  // Only offer cities that actually have an offline batch open.
  const cityOptions = cities.filter((c) => batches.some((b) => b.city?.slug === c.slug));

  const filtered = batches.filter((b) => {
    if (mode !== "all" && b.mode !== mode) return false;
    if (filterSlug === "all") return true;
    return b.mode === "Online" || b.city?.slug === filterSlug;
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 rounded-[24px] bg-surface-container-low p-4 md:flex-row md:items-center md:justify-between">
        <div role="group" aria-label="City" className="snap-row flex gap-2 overflow-x-auto">
          <Chip selected={filterSlug === "all"} onClick={() => setFilterSlug("all")} className="flex-shrink-0">
            All cities
          </Chip>
          {cityOptions.map((c) => (
            <Chip key={c.id} selected={filterSlug === c.slug} onClick={() => setFilterSlug(c.slug)} className="flex-shrink-0">
              {c.name}
            </Chip>
          ))}
        </div>
        <SegmentedControl
          label="Batch mode"
          value={mode}
          onChange={setMode}
          className="flex-shrink-0 self-start bg-white md:self-auto"
          options={[
            { value: "all", label: "All" },
            { value: "Offline", label: "Offline" },
            { value: "Online", label: "Online" },
          ]}
        />
      </div>

      <p className="text-[14px] text-on-surface-variant">
        <span className="font-semibold text-ink">{filtered.length}</span> batch{filtered.length === 1 ? "" : "es"} open
        {filterSlug !== "all" && " · online batches are open to every city"}
      </p>

      {filtered.length === 0 ? (
        <div className="rounded-[24px] border border-dashed border-outline-variant p-10 text-center text-body-md text-on-surface-variant">
          No open batches match these filters right now.
        </div>
      ) : (
        <BatchList batches={filtered} />
      )}
    </div>
  );
}

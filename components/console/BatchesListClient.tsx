"use client";

import { useEffect, useState } from "react";
import { useCity } from "@/lib/city-context";

type Batch = {
  id: string;
  program: { name: string };
  city: { name: string; slug: string };
  startDate: string;
  applicationCloseDate: string;
  timing: string;
  location: string;
};

const fmt = (iso: string) =>
  new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

export function BatchesListClient({ batches }: { batches: Batch[] }) {
  const { cities, selectedCity } = useCity();
  const [filterSlug, setFilterSlug] = useState<string>("all");

  // Defaults to whichever city is active for this session (set during
  // onboarding, or the first city otherwise) — "All Cities" is always
  // available to see everything.
  useEffect(() => {
    if (selectedCity) setFilterSlug(selectedCity.slug);
  }, [selectedCity]);

  const filtered = filterSlug === "all" ? batches : batches.filter((b) => b.city.slug === filterSlug);

  return (
    <div>
      <div className="mb-section-gap flex flex-wrap items-center gap-3">
        <label htmlFor="batch-city-filter" className="text-label-bold font-bold uppercase tracking-wide text-secondary">
          City
        </label>
        <select
          id="batch-city-filter"
          value={filterSlug}
          onChange={(e) => setFilterSlug(e.target.value)}
          className="h-10 rounded-lg border-2 border-surface-variant bg-white px-3 text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary"
        >
          <option value="all">All Cities</option>
          {cities.map((c) => (
            <option key={c.id} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {filtered.length === 0 && (
        <p className="text-body-sm text-secondary">No upcoming batches for this city right now.</p>
      )}

      {filtered.length > 0 && (
        <div className="bg-surface border border-surface-variant rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low text-secondary border-b border-surface-variant text-label-bold font-bold uppercase">
                  <th className="px-card-padding py-3">Course</th>
                  <th className="px-card-padding py-3">City</th>
                  <th className="px-card-padding py-3">Start</th>
                  <th className="px-card-padding py-3">Apply By</th>
                  <th className="px-card-padding py-3">Timing</th>
                  <th className="px-card-padding py-3">Location</th>
                </tr>
              </thead>
              <tbody className="text-body-sm">
                {filtered.map((b) => (
                  <tr key={b.id} className="border-b border-surface-variant last:border-0 hover:bg-surface-container-lowest transition-colors">
                    <td className="px-card-padding py-3 font-medium text-on-surface">{b.program.name}</td>
                    <td className="px-card-padding py-3 text-secondary">{b.city.name}</td>
                    <td className="px-card-padding py-3 text-secondary">{fmt(b.startDate)}</td>
                    <td className="px-card-padding py-3 font-medium text-primary">{fmt(b.applicationCloseDate)}</td>
                    <td className="px-card-padding py-3 text-secondary">{b.timing}</td>
                    <td className="px-card-padding py-3">{b.location}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useCity } from "@/lib/city-context";

export function useCityFetch<T>(path: string, params?: Record<string, string>) {
  const { selectedCity, citySlugKnown } = useCity();
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Wait until we've actually checked for a city preference — a student
    // with no preference should still see the unfiltered fetch below, not
    // be stuck waiting forever for a selectedCity that will never arrive.
    if (!citySlugKnown) return;
    let cancelled = false;
    setLoading(true);
    const search = new URLSearchParams(params);
    if (selectedCity) search.set("city", selectedCity.slug);
    fetch(`${path}?${search.toString()}`)
      .then((r) => r.json())
      .then((json) => {
        if (!cancelled) {
          setData(json);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [citySlugKnown, selectedCity?.slug, path, JSON.stringify(params)]);

  return { data, loading, selectedCity };
}

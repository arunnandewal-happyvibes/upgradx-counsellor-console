"use client";

import { useEffect, useState } from "react";
import { useCity } from "@/lib/city-context";

export function useCityFetch<T>(path: string, params?: Record<string, string>) {
  const { selectedCity } = useCity();
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!selectedCity) return;
    let cancelled = false;
    setLoading(true);
    const search = new URLSearchParams({ city: selectedCity.slug, ...params });
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
  }, [selectedCity?.slug, path, JSON.stringify(params)]);

  return { data, loading, selectedCity };
}

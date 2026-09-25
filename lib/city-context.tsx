"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export type CityOption = { id: string; name: string; slug: string; monumentImageUrl?: string | null };

type CityContextValue = {
  cities: CityOption[];
  selectedCity: CityOption | null;
  // False until we've checked the URL/sessionStorage for a city preference —
  // lets consumers (useCityFetch) wait for that instead of racing ahead with
  // "no preference" while it's actually just not loaded yet.
  citySlugKnown: boolean;
  setSelectedCitySlug: (slug: string) => void;
};

const CityContext = createContext<CityContextValue | null>(null);

const STORAGE_KEY = "upgradx.selectedCitySlug";

export function CityProvider({
  cities,
  children,
}: {
  cities: CityOption[];
  children: React.ReactNode;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [citySlugKnown, setCitySlugKnown] = useState(false);

  useEffect(() => {
    const fromQuery = searchParams.get("city");
    const fromStorage =
      typeof window !== "undefined" ? window.sessionStorage.getItem(STORAGE_KEY) : null;
    // No silent fallback to "the first city alphabetically" — a student who
    // skipped city selection (or hasn't onboarded) genuinely has no
    // preference, and sections should show everything rather than pretend
    // they're in whichever city happens to sort first.
    setSelectedSlug(fromQuery ?? fromStorage ?? null);
    setCitySlugKnown(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setSelectedCitySlug = (slug: string) => {
    setSelectedSlug(slug);
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem(STORAGE_KEY, slug);
    }
    const params = new URLSearchParams(Array.from(searchParams.entries()));
    params.set("city", slug);
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  const selectedCity = useMemo(
    () => cities.find((c) => c.slug === selectedSlug) ?? null,
    [cities, selectedSlug],
  );

  return (
    <CityContext.Provider value={{ cities, selectedCity, citySlugKnown, setSelectedCitySlug }}>
      {children}
    </CityContext.Provider>
  );
}

export function useCity() {
  const ctx = useContext(CityContext);
  if (!ctx) throw new Error("useCity must be used within CityProvider");
  return ctx;
}

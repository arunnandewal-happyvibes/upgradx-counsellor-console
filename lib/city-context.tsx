"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export type CityOption = { id: string; name: string; slug: string };

type CityContextValue = {
  cities: CityOption[];
  selectedCity: CityOption | null;
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

  useEffect(() => {
    const fromQuery = searchParams.get("city");
    const fromStorage =
      typeof window !== "undefined" ? window.sessionStorage.getItem(STORAGE_KEY) : null;
    const initial = fromQuery ?? fromStorage ?? cities[0]?.slug ?? null;
    setSelectedSlug(initial);
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
    <CityContext.Provider value={{ cities, selectedCity, setSelectedCitySlug }}>
      {children}
    </CityContext.Provider>
  );
}

export function useCity() {
  const ctx = useContext(CityContext);
  if (!ctx) throw new Error("useCity must be used within CityProvider");
  return ctx;
}

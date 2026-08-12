"use client";

import { useCity } from "@/lib/city-context";
import { Icon } from "@/components/ui/Icon";

export function CityDropdown() {
  const { cities, selectedCity, setSelectedCitySlug } = useCity();

  return (
    <div className="hidden md:flex items-center bg-surface-container-low border border-outline-variant rounded px-3 py-1.5 shadow-sm">
      <Icon name="location_on" className="text-primary mr-2" size={18} fill />
      <select
        className="bg-transparent border-none text-body-md font-bold text-on-background focus:ring-0 p-0 m-0 cursor-pointer appearance-none pr-1"
        value={selectedCity?.slug ?? ""}
        onChange={(e) => setSelectedCitySlug(e.target.value)}
      >
        {cities.map((c) => (
          <option key={c.id} value={c.slug}>
            {c.name}
          </option>
        ))}
      </select>
      <Icon name="arrow_drop_down" className="text-secondary" size={18} />
      <span className="ml-2 text-[10px] font-bold uppercase tracking-wide text-primary bg-primary-fixed px-1.5 py-0.5 rounded-full">
        Active
      </span>
    </div>
  );
}

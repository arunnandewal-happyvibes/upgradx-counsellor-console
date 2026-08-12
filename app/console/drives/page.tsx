"use client";

import { useCityFetch } from "@/lib/useCityFetch";
import { Icon } from "@/components/ui/Icon";

type Drive = { id: string; company: string; role: string; date: string };

export default function AllDrivesPage() {
  const { data, selectedCity } = useCityFetch<Drive[]>("/api/drives", { all: "1" });

  return (
    <div className="pb-16">
      <h1 className="text-display-lg text-on-surface mb-2">All Placement Drives</h1>
      <p className="text-body-lg text-secondary mb-section-gap">
        Showing drives for <span className="font-bold text-primary">{selectedCity?.name ?? "..."}</span>
      </p>

      {data && data.length === 0 && (
        <p className="text-body-sm text-secondary">No open drives in this city right now.</p>
      )}

      <div className="grid grid-cols-1 gap-gutter sm:grid-cols-2 lg:grid-cols-3">
        {data?.map((d) => (
          <div key={d.id} className="b2b-card elevate-3d p-card-padding flex flex-col gap-2">
            <div className="text-headline-sm text-on-surface">{d.company}</div>
            <div className="flex items-center gap-1 text-body-sm text-secondary">
              <Icon name="work" size={16} />
              {d.role}
            </div>
            <div className="flex items-center gap-1 text-body-sm text-secondary">
              <Icon name="calendar_today" size={16} />
              {new Date(d.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

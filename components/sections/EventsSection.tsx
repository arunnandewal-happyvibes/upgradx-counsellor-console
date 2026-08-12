"use client";

import { useCityFetch } from "@/lib/useCityFetch";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { LinkButton } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

type Occurrence = {
  id: string;
  date: string;
  city: { name: string };
  event: { name: string; description: string };
};

export function EventsSection() {
  const { data } = useCityFetch<Occurrence[]>("/api/events");
  if (!data || data.length === 0) return null;

  return (
    <section id="events">
      <SectionHeader
        eyebrow="Phase 2"
        title="Upcoming Events & Workshops"
        action={<span className="bg-surface-container-highest text-secondary text-body-sm px-2 py-1 rounded">Phase 2 Ready</span>}
      />
      <div className="flex flex-col gap-unit">
        {data.map((o) => (
          <div
            key={o.id}
            className="elevate-3d bg-surface-container-lowest border border-surface-variant p-card-padding rounded hover:border-primary group"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex-1">
                <h3 className="text-headline-sm text-on-surface group-hover:text-primary transition-colors mb-1">
                  {o.event.name}
                </h3>
                <p className="text-body-sm text-on-surface-variant mb-2 editable-field">{o.event.description}</p>
                <div className="grid grid-cols-2 gap-2 text-body-sm text-secondary max-w-xs">
                  <div className="flex items-center gap-1">
                    <Icon name="calendar_today" size={16} />
                    {new Date(o.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                  </div>
                  <div className="flex items-center gap-1">
                    <Icon name="location_on" size={16} />
                    {o.city.name}
                  </div>
                </div>
              </div>
              <LinkButton href={`/console/events/${o.id}/register`} variant="secondary">
                Register
              </LinkButton>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

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
      <SectionHeader eyebrow="Events & workshops" title="Come see it in person." />
      <ul className="flex flex-col gap-3">
        {data.map((o) => {
          const date = new Date(o.date);
          return (
            <li
              key={o.id}
              className="elevate-3d flex flex-col gap-5 rounded-[24px] border border-outline-variant bg-white p-5 sm:flex-row sm:items-center sm:p-6"
            >
              <div className="flex h-16 w-16 flex-shrink-0 flex-col items-center justify-center rounded-2xl bg-primary text-white">
                <span className="font-display text-[24px] font-extrabold leading-none">{date.getDate()}</span>
                <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-white/80">
                  {date.toLocaleDateString("en-IN", { month: "short" })}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-display text-[21px] font-bold tracking-[-0.01em] text-ink">{o.event.name}</h3>
                <p className="editable-field mt-1 line-clamp-2 text-[14px] text-on-surface-variant">{o.event.description}</p>
                <p className="mt-2 flex items-center gap-1 text-[14px] text-ink">
                  <Icon name="location_on" size={16} className="text-primary" />
                  {o.city.name}
                </p>
              </div>
              <LinkButton href={`/console/events/${o.id}/register`} variant="secondary" className="sm:flex-shrink-0">
                Register
              </LinkButton>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

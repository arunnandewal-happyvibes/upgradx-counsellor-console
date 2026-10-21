"use client";

import { useCityFetch } from "@/lib/useCityFetch";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { SectionLink } from "@/components/ui/SectionLink";
import { Icon } from "@/components/ui/Icon";

type Drive = { id: string; company: string; role: string; date: string; city: { name: string } };

export function PlacementDrivesSection() {
  const { data } = useCityFetch<Drive[]>("/api/drives");
  if (!data || data.length === 0) return null;

  return (
    <section id="drives">
      <SectionHeader
        eyebrow="Hiring now"
        title="Open placement drives."
        action={<SectionLink href="/console/drives">All drives</SectionLink>}
      />
      <div className="snap-row -mx-1 flex gap-4 overflow-x-auto px-1 pb-6 pt-4">
        {data.map((d) => {
          const date = new Date(d.date);
          return (
            <article
              key={d.id}
              className="card-red-3d flex w-[280px] flex-shrink-0 flex-col gap-5 rounded-[24px] border border-outline-variant bg-white p-6"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="truncate font-display text-[22px] font-bold tracking-[-0.02em] text-ink">{d.company}</div>
                  <div className="mt-1 text-[14px] text-on-surface-variant">{d.role}</div>
                </div>
                <div className="flex h-14 w-14 flex-shrink-0 flex-col items-center justify-center rounded-2xl bg-ink text-white">
                  <span className="font-display text-[20px] font-extrabold leading-none">{date.getDate()}</span>
                  <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-white/70">
                    {date.toLocaleDateString("en-IN", { month: "short" })}
                  </span>
                </div>
              </div>
              <div className="mt-auto flex items-center gap-1.5 text-[14px] text-ink">
                <Icon name="location_on" size={16} className="text-primary" />
                {d.city.name}
                <span className="ml-auto text-on-surface-variant">{date.getFullYear()}</span>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

"use client";

import Link from "next/link";
import { useCityFetch } from "@/lib/useCityFetch";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Icon } from "@/components/ui/Icon";

type Drive = { id: string; company: string; role: string; date: string };

export function PlacementDrivesSection() {
  const { data } = useCityFetch<Drive[]>("/api/drives");
  if (!data || data.length === 0) return null;

  return (
    <section id="drives">
      <SectionHeader
        eyebrow="Hiring Now"
        title="Open Placement Drives"
        action={
          <Link href="/console/drives" className="text-label-bold font-bold uppercase text-primary hover:underline">
            View All Drives →
          </Link>
        }
      />
      <div className="flex gap-gutter overflow-x-auto scrollbar-thin py-1">
        {data.map((d) => (
          <div key={d.id} className="min-w-[240px] b2b-card elevate-3d p-card-padding flex flex-col gap-2">
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
    </section>
  );
}

"use client";

import { useCityFetch } from "@/lib/useCityFetch";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { SectionLink } from "@/components/ui/SectionLink";
import { BatchList, type BatchRow } from "@/components/console/BatchList";

export function BatchesSection() {
  const { data } = useCityFetch<BatchRow[]>("/api/batches");
  if (!data || data.length === 0) return null;

  return (
    <section id="batches">
      <SectionHeader
        eyebrow="Upcoming batches"
        title="Starting soon."
        action={<SectionLink href="/console/batches">All batches</SectionLink>}
      />
      <p className="-mt-4 mb-6 text-body-md text-on-surface-variant">Only batches still open for applications are shown.</p>
      <BatchList batches={data} />
    </section>
  );
}

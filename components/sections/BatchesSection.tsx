"use client";

import Link from "next/link";
import { useCityFetch } from "@/lib/useCityFetch";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Icon } from "@/components/ui/Icon";

type Batch = {
  id: string;
  startDate: string;
  applicationCloseDate: string;
  timing: string;
  location: string;
  program: { name: string };
};

export function BatchesSection() {
  const { data } = useCityFetch<Batch[]>("/api/batches");
  if (!data || data.length === 0) return null;

  const fmt = (d: string) =>
    new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

  return (
    <section id="batches">
      <SectionHeader eyebrow="Schedule" title="Upcoming Batches" />
      <div className="bg-surface border border-surface-variant rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low text-secondary border-b border-surface-variant text-label-bold font-bold uppercase">
                <th className="px-card-padding py-3">Course Name</th>
                <th className="px-card-padding py-3">Start Date</th>
                <th className="px-card-padding py-3">App Closing</th>
                <th className="px-card-padding py-3">Timing</th>
                <th className="px-card-padding py-3">Location</th>
              </tr>
            </thead>
            <tbody className="text-body-sm">
              {data.map((b) => (
                <tr key={b.id} className="border-b border-surface-variant last:border-0 hover:bg-surface-container-lowest transition-colors group">
                  <td className="px-card-padding py-3 font-medium text-on-surface group-hover:text-primary transition-colors">
                    {b.program.name}
                  </td>
                  <td className="px-card-padding py-3">{fmt(b.startDate)}</td>
                  <td className="px-card-padding py-3 text-primary font-medium">{fmt(b.applicationCloseDate)}</td>
                  <td className="px-card-padding py-3 text-secondary">{b.timing}</td>
                  <td className="px-card-padding py-3">{b.location}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-card-padding py-3 border-t border-surface-variant bg-surface-container-lowest text-right">
          <Link
            href="/console/batches"
            className="text-primary font-bold text-label-bold uppercase hover:underline inline-flex items-center gap-1 transition-all"
          >
            View All Batches <Icon name="arrow_forward" size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}

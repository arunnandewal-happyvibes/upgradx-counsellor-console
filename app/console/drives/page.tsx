import { prisma } from "@/lib/prisma";
import { Icon } from "@/components/ui/Icon";
import { PageHeader } from "@/components/ui/PageHeader";
import { startOfToday } from "@/lib/dateFilters";

export const dynamic = "force-dynamic";

export default async function AllDrivesPage() {
  const drives = await prisma.placementDrive.findMany({
    where: { date: { gte: startOfToday() } },
    orderBy: { date: "asc" },
    include: { city: { select: { name: true } } },
  });

  return (
    <div className="flex flex-col gap-12">
      <PageHeader
        back={{ href: "/console#drives", label: "Console" }}
        eyebrow="Hiring now"
        title="Every open placement drive."
        lead="Upcoming drives across all centres, soonest first."
      />

      {drives.length === 0 ? (
        <div className="rounded-[24px] border border-dashed border-outline-variant p-10 text-center text-body-md text-on-surface-variant">
          No upcoming placement drives right now.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {drives.map((d) => (
            <article key={d.id} className="elevate-3d flex flex-col gap-6 rounded-[24px] border border-outline-variant bg-white p-6">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-display text-[24px] font-bold tracking-[-0.02em] text-ink">{d.company}</div>
                  <div className="mt-1 text-[15px] text-on-surface-variant">{d.role}</div>
                </div>
                <div className="flex h-16 w-16 flex-shrink-0 flex-col items-center justify-center rounded-2xl bg-ink text-white">
                  <span className="font-display text-[22px] font-extrabold leading-none">{d.date.getDate()}</span>
                  <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-white/70">
                    {d.date.toLocaleDateString("en-IN", { month: "short" })}
                  </span>
                </div>
              </div>
              <div className="mt-auto flex items-center gap-1.5 text-[14px] text-ink">
                <Icon name="location_on" size={16} className="text-primary" />
                {d.city.name}
                <span className="ml-auto text-on-surface-variant">{d.date.getFullYear()}</span>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

import { prisma } from "@/lib/prisma";
import { Icon } from "@/components/ui/Icon";

export const dynamic = "force-dynamic";

export default async function AllDrivesPage() {
  const drives = await prisma.placementDrive.findMany({
    orderBy: { date: "asc" },
    include: { city: { select: { name: true } } },
  });

  return (
    <div className="pb-16">
      <h1 className="text-display-lg text-on-surface mb-2">All Placement Drives</h1>
      <p className="text-body-lg text-secondary mb-section-gap">Showing placement drives across every centre.</p>

      {drives.length === 0 && <p className="text-body-sm text-secondary">No open drives right now.</p>}

      <div className="grid grid-cols-1 gap-gutter sm:grid-cols-2 lg:grid-cols-3">
        {drives.map((d) => (
          <div key={d.id} className="b2b-card elevate-3d p-card-padding flex flex-col gap-2">
            <div className="text-headline-sm text-on-surface">{d.company}</div>
            <div className="flex items-center gap-1 text-body-sm text-secondary">
              <Icon name="work" size={16} />
              {d.role}
            </div>
            <div className="flex items-center gap-1 text-body-sm text-secondary">
              <Icon name="location_on" size={16} />
              {d.city.name}
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

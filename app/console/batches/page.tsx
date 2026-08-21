import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AllBatchesPage() {
  const batches = await prisma.batch.findMany({
    orderBy: { startDate: "asc" },
    include: { program: true, city: { select: { name: true } } },
  });
  const fmt = (d: Date) => d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

  return (
    <div className="pb-16">
      <h1 className="text-display-lg text-on-surface mb-2">All Upcoming Batches</h1>
      <p className="text-body-lg text-secondary mb-section-gap">Showing batches across every centre.</p>

      {batches.length === 0 && <p className="text-body-sm text-secondary">No upcoming batches right now.</p>}

      {batches.length > 0 && (
        <div className="bg-surface border border-surface-variant rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low text-secondary border-b border-surface-variant text-label-bold font-bold uppercase">
                  <th className="px-card-padding py-3">Course</th>
                  <th className="px-card-padding py-3">City</th>
                  <th className="px-card-padding py-3">Start</th>
                  <th className="px-card-padding py-3">Apply By</th>
                  <th className="px-card-padding py-3">Timing</th>
                  <th className="px-card-padding py-3">Location</th>
                </tr>
              </thead>
              <tbody className="text-body-sm">
                {batches.map((b) => (
                  <tr key={b.id} className="border-b border-surface-variant last:border-0 hover:bg-surface-container-lowest transition-colors">
                    <td className="px-card-padding py-3 font-medium text-on-surface">{b.program.name}</td>
                    <td className="px-card-padding py-3 text-secondary">{b.city.name}</td>
                    <td className="px-card-padding py-3 text-secondary">{fmt(b.startDate)}</td>
                    <td className="px-card-padding py-3 font-medium text-primary">{fmt(b.applicationCloseDate)}</td>
                    <td className="px-card-padding py-3 text-secondary">{b.timing}</td>
                    <td className="px-card-padding py-3">{b.location}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

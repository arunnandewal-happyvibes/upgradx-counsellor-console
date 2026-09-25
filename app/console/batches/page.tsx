import { prisma } from "@/lib/prisma";
import { BatchesListClient } from "@/components/console/BatchesListClient";
import { startOfToday } from "@/lib/dateFilters";

export const dynamic = "force-dynamic";

export default async function AllBatchesPage() {
  const batches = await prisma.batch.findMany({
    // Only batches a student could still actually join — applications still
    // open (or opening today), regardless of when they start.
    where: { applicationCloseDate: { gte: startOfToday() } },
    orderBy: { startDate: "asc" },
    include: { program: { select: { name: true } }, city: { select: { name: true, slug: true } } },
  });

  return (
    <div className="pb-16">
      <h1 className="text-display-lg text-on-surface mb-2">All Upcoming Batches</h1>
      <p className="text-body-lg text-secondary mb-section-gap">Filter by city, or view batches across every centre.</p>

      <BatchesListClient
        batches={batches.map((b) => ({
          ...b,
          startDate: b.startDate.toISOString(),
          applicationCloseDate: b.applicationCloseDate.toISOString(),
        }))}
      />
    </div>
  );
}

import { prisma } from "@/lib/prisma";
import { BatchesListClient } from "@/components/console/BatchesListClient";
import { PageHeader } from "@/components/ui/PageHeader";
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
    <div className="flex flex-col gap-12">
      <PageHeader
        back={{ href: "/console#batches", label: "Console" }}
        eyebrow="Upcoming batches"
        title="Every open batch."
        lead="Filter by city or mode. Only batches still accepting applications are listed."
      />
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

import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { BatchForm } from "@/components/admin/BatchForm";
import { updateBatch } from "@/app/admin/batches/actions";

export default async function EditBatchPage({ params }: { params: { id: string } }) {
  const [batch, programs, cities] = await Promise.all([
    prisma.batch.findUnique({ where: { id: params.id } }),
    prisma.program.findMany({ orderBy: { name: "asc" } }),
    prisma.city.findMany({ orderBy: { name: "asc" } }),
  ]);
  if (!batch) notFound();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-extrabold text-brand-ink">Edit Batch</h1>
      <BatchForm action={updateBatch.bind(null, batch.id)} programs={programs} cities={cities} initial={batch} />
    </div>
  );
}

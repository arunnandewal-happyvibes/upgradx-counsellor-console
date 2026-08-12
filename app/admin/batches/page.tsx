import { prisma } from "@/lib/prisma";
import { Table, Th, Td } from "@/components/admin/AdminUI";
import { BatchForm } from "@/components/admin/BatchForm";
import { createBatch, deleteBatch } from "@/app/admin/batches/actions";
import Link from "next/link";

export default async function BatchesAdminPage() {
  const [batches, programs, cities] = await Promise.all([
    prisma.batch.findMany({ orderBy: { startDate: "asc" }, include: { program: true, city: true } }),
    prisma.program.findMany({ orderBy: { name: "asc" } }),
    prisma.city.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-extrabold text-brand-ink">Batches</h1>

      <Table>
        <thead>
          <tr>
            <Th>Program</Th>
            <Th>City</Th>
            <Th>Start</Th>
            <Th>Apply By</Th>
            <Th></Th>
          </tr>
        </thead>
        <tbody>
          {batches.map((b) => (
            <tr key={b.id} className="border-t border-brand-gray-100">
              <Td className="font-semibold text-brand-ink">{b.program.name}</Td>
              <Td>{b.city.name}</Td>
              <Td>{b.startDate.toLocaleDateString("en-IN")}</Td>
              <Td>{b.applicationCloseDate.toLocaleDateString("en-IN")}</Td>
              <Td>
                <div className="flex gap-2">
                  <Link href={`/admin/batches/${b.id}`} className="text-sm font-semibold text-brand-red hover:underline">
                    Edit
                  </Link>
                  <form action={deleteBatch.bind(null, b.id)}>
                    <button className="text-sm font-semibold text-brand-gray-400 hover:text-brand-red">Delete</button>
                  </form>
                </div>
              </Td>
            </tr>
          ))}
        </tbody>
      </Table>

      <h2 className="mb-4 mt-10 text-lg font-bold text-brand-ink">Add Batch</h2>
      <BatchForm action={createBatch} programs={programs} cities={cities} />
    </div>
  );
}

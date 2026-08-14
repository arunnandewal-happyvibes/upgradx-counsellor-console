import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Table, Th, Td } from "@/components/admin/AdminUI";
import { CityForm } from "@/components/admin/CityForm";
import { createCity, deleteCity } from "@/app/admin/cities/actions";

export default async function CitiesAdminPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  const cities = await prisma.city.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: {
        select: { leads: true, instructors: true, drives: true, batches: true, eventOccurrences: true },
      },
    },
  });

  return (
    <div>
      <h1 className="mb-1 text-2xl font-extrabold text-brand-ink">Cities</h1>
      <p className="mb-6 text-sm text-brand-ink2">
        Cities added here immediately become available in the city dropdown across the console —
        Instructors, Batches, Placement Drives, Events, and Contact.
      </p>

      {searchParams.error === "in-use" && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          That city still has instructors, batches, drives, leads, or events pointing at it — move
          or delete those first, then remove the city.
        </div>
      )}

      <Table>
        <thead>
          <tr>
            <Th>Monument</Th>
            <Th>City</Th>
            <Th>In use by</Th>
            <Th></Th>
          </tr>
        </thead>
        <tbody>
          {cities.map((c) => {
            const usage = [
              c._count.instructors && `${c._count.instructors} instructor(s)`,
              c._count.batches && `${c._count.batches} batch(es)`,
              c._count.drives && `${c._count.drives} drive(s)`,
              c._count.leads && `${c._count.leads} lead(s)`,
              c._count.eventOccurrences && `${c._count.eventOccurrences} event date(s)`,
            ].filter(Boolean);
            return (
              <tr key={c.id} className="border-t border-brand-gray-100">
                <Td>
                  {c.monumentImageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={c.monumentImageUrl}
                      alt={c.name}
                      className="h-10 w-14 rounded object-cover"
                    />
                  ) : (
                    <span className="text-brand-gray-400">—</span>
                  )}
                </Td>
                <Td className="font-semibold text-brand-ink">{c.name}</Td>
                <Td>{usage.length > 0 ? usage.join(", ") : <span className="text-brand-gray-400">Unused</span>}</Td>
                <Td>
                  <div className="flex gap-2">
                    <Link href={`/admin/cities/${c.id}`} className="text-sm font-semibold text-brand-red hover:underline">
                      Edit
                    </Link>
                    <form action={deleteCity.bind(null, c.id)}>
                      <button className="text-sm font-semibold text-brand-gray-400 hover:text-brand-red">Remove</button>
                    </form>
                  </div>
                </Td>
              </tr>
            );
          })}
        </tbody>
      </Table>

      <h2 className="mb-4 mt-10 text-lg font-bold text-brand-ink">Add City</h2>
      <CityForm action={createCity} />
    </div>
  );
}

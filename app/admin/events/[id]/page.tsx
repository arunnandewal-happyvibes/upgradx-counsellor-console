import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Table, Th, Td, Field, inputClass } from "@/components/admin/AdminUI";
import { Button } from "@/components/ui/Button";
import { addOccurrence, deleteOccurrence } from "@/app/admin/events/actions";

export default async function EventOccurrencesPage({ params }: { params: { id: string } }) {
  const [event, cities] = await Promise.all([
    prisma.event.findUnique({
      where: { id: params.id },
      include: { occurrences: { orderBy: { date: "asc" }, include: { city: true } } },
    }),
    prisma.city.findMany({ orderBy: { name: "asc" } }),
  ]);
  if (!event) notFound();

  return (
    <div>
      <h1 className="mb-1 text-2xl font-extrabold text-brand-ink">{event.name}</h1>
      <p className="mb-6 text-sm text-brand-ink2">Manage per-city occurrences for this event.</p>

      <Table>
        <thead>
          <tr>
            <Th>City</Th>
            <Th>Date</Th>
            <Th></Th>
          </tr>
        </thead>
        <tbody>
          {event.occurrences.map((o) => (
            <tr key={o.id} className="border-t border-brand-gray-100">
              <Td className="font-semibold text-brand-ink">{o.city.name}</Td>
              <Td>{o.date.toLocaleDateString("en-IN")}</Td>
              <Td>
                <form action={deleteOccurrence.bind(null, event.id, o.id)}>
                  <button className="text-sm font-semibold text-brand-gray-400 hover:text-brand-red">Delete</button>
                </form>
              </Td>
            </tr>
          ))}
        </tbody>
      </Table>

      <h2 className="mb-4 mt-10 text-lg font-bold text-brand-ink">Add Occurrence</h2>
      <form action={addOccurrence.bind(null, event.id)} className="max-w-md space-y-4">
        <Field label="City">
          <select required name="cityId" className={inputClass}>
            {cities.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Date">
          <input required type="date" name="date" className={inputClass} />
        </Field>
        <Button type="submit">Add Occurrence</Button>
      </form>
    </div>
  );
}

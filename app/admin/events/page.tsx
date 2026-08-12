import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Table, Th, Td, Field, inputClass } from "@/components/admin/AdminUI";
import { Button } from "@/components/ui/Button";
import { createEvent, toggleEvent, deleteEvent } from "@/app/admin/events/actions";

export default async function EventsAdminPage() {
  const events = await prisma.event.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { occurrences: true } } },
  });

  return (
    <div>
      <h1 className="mb-1 text-2xl font-extrabold text-brand-ink">Events (Phase 2)</h1>
      <p className="mb-6 text-sm text-brand-ink2">Toggle visibility per event — disabled events are hidden from the console entirely.</p>

      <Table>
        <thead>
          <tr>
            <Th>Name</Th>
            <Th>Occurrences</Th>
            <Th>Status</Th>
            <Th></Th>
          </tr>
        </thead>
        <tbody>
          {events.map((e) => (
            <tr key={e.id} className="border-t border-brand-gray-100">
              <Td className="font-semibold text-brand-ink">{e.name}</Td>
              <Td>{e._count.occurrences}</Td>
              <Td>{e.isEnabled ? "Enabled" : "Disabled"}</Td>
              <Td>
                <div className="flex gap-2">
                  <Link href={`/admin/events/${e.id}`} className="text-sm font-semibold text-brand-red hover:underline">
                    Manage Occurrences
                  </Link>
                  <form action={toggleEvent.bind(null, e.id, e.isEnabled)}>
                    <button className="text-sm font-semibold text-brand-ink2 hover:text-brand-red">
                      {e.isEnabled ? "Disable" : "Enable"}
                    </button>
                  </form>
                  <form action={deleteEvent.bind(null, e.id)}>
                    <button className="text-sm font-semibold text-brand-gray-400 hover:text-brand-red">Delete</button>
                  </form>
                </div>
              </Td>
            </tr>
          ))}
        </tbody>
      </Table>

      <h2 className="mb-4 mt-10 text-lg font-bold text-brand-ink">Add Event</h2>
      <form action={createEvent} className="max-w-xl space-y-4">
        <Field label="Name">
          <input required name="name" className={inputClass} />
        </Field>
        <Field label="Description">
          <textarea required name="description" rows={2} className={inputClass} />
        </Field>
        <label className="flex items-center gap-2 text-sm text-brand-ink2">
          <input type="checkbox" name="isEnabled" /> Enabled on console
        </label>
        <Button type="submit">Save Event</Button>
      </form>
    </div>
  );
}

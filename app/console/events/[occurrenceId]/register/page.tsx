import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { EventRegisterForm } from "@/components/events/EventRegisterForm";
import { Icon } from "@/components/ui/Icon";

export default async function EventRegisterPage({ params }: { params: { occurrenceId: string } }) {
  const occurrence = await prisma.eventOccurrence.findUnique({
    where: { id: params.occurrenceId },
    include: { event: true, city: true },
  });
  if (!occurrence) notFound();

  return (
    <div className="mx-auto max-w-md pb-16">
      <section className="bg-surface-container-lowest border border-surface-variant rounded-lg p-container-margin shadow-sm">
        <h2 className="text-headline-sm text-on-surface mb-1 flex items-center gap-2">
          <Icon name="edit_document" className="text-primary" />
          {occurrence.event.name}
        </h2>
        <p className="text-body-sm text-on-surface-variant mb-4">{occurrence.event.description}</p>

        <div className="mb-5 grid grid-cols-2 gap-3 rounded bg-surface-container-low p-3 text-body-sm">
          <div className="flex items-center gap-1">
            <Icon name="location_on" size={16} className="text-primary" />
            {occurrence.city.name}
          </div>
          <div className="flex items-center gap-1">
            <Icon name="calendar_today" size={16} className="text-primary" />
            {occurrence.date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
          </div>
        </div>

        <EventRegisterForm occurrenceId={occurrence.id} />
      </section>
    </div>
  );
}

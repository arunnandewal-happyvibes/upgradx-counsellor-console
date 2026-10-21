import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { EventRegisterForm } from "@/components/events/EventRegisterForm";
import { PageHeader } from "@/components/ui/PageHeader";
import { Icon } from "@/components/ui/Icon";

export default async function EventRegisterPage({ params }: { params: { occurrenceId: string } }) {
  const occurrence = await prisma.eventOccurrence.findUnique({
    where: { id: params.occurrenceId },
    include: { event: true, city: true },
  });
  if (!occurrence) notFound();

  return (
    <div className="flex flex-col gap-10">
      <PageHeader
        back={{ href: "/console#events", label: "Events" }}
        eyebrow="Register"
        title={occurrence.event.name}
        lead={occurrence.event.description}
      >
        <span className="inline-flex h-10 items-center gap-1.5 rounded-full bg-ink px-4 text-[14px] font-semibold text-white">
          <Icon name="calendar_today" size={16} />
          {occurrence.date.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}
        </span>
        <span className="inline-flex h-10 items-center gap-1.5 rounded-full border border-outline-variant px-4 text-[14px] font-semibold text-ink">
          <Icon name="location_on" size={16} className="text-primary" />
          {occurrence.city.name}
        </span>
      </PageHeader>

      <section className="w-full max-w-lg rounded-[28px] border border-outline-variant bg-white p-7 md:p-8">
        <EventRegisterForm occurrenceId={occurrence.id} />
      </section>
    </div>
  );
}

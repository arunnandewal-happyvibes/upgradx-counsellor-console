import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { Icon } from "@/components/ui/Icon";
import { PageHeader } from "@/components/ui/PageHeader";

export const dynamic = "force-dynamic";

export default async function ContactPage() {
  const contacts = await prisma.cityContact.findMany({
    include: { city: true },
    orderBy: { city: { name: "asc" } },
  });

  return (
    <div className="flex flex-col gap-12">
      <PageHeader
        back={{ href: "/console", label: "Console" }}
        eyebrow="Centres"
        title="Find a centre."
        lead={`${contacts.length} upGrad X learning centres. Tap a phone number or email to reach the team directly.`}
      />

      <div className="flex flex-col gap-4 rounded-[24px] bg-surface-container-low p-6 md:flex-row md:items-center">
        <span className="grid h-12 w-12 flex-shrink-0 place-items-center rounded-2xl bg-white text-ink">
          <Icon name="support_agent" size={24} />
        </span>
        <div className="flex-1">
          <p className="font-display text-[19px] font-bold text-ink">Counsellor service desk</p>
          <p className="mt-0.5 text-[14px] text-on-surface-variant">
            Batch changes, course changes and escalations will be raised here. Coming soon.
          </p>
        </div>
        <span className="inline-flex h-10 w-fit items-center gap-1.5 rounded-full border border-outline-variant bg-white px-4 text-[13px] font-semibold text-on-surface-variant">
          <Icon name="schedule" size={16} />
          Coming soon
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {contacts.map((c) => (
          <article key={c.id} className="elevate-3d flex flex-col overflow-hidden rounded-[24px] border border-outline-variant bg-white">
            <div className="relative flex h-36 w-full items-end overflow-hidden bg-ink">
              {c.city.monumentImageUrl ? (
                <Image src={c.city.monumentImageUrl} alt={`A landmark in ${c.city.name}`} fill className="object-cover" />
              ) : (
                <Icon name="location_city" className="absolute right-5 top-5 text-white/20" size={56} />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              <h2 className="relative p-5 font-display text-[26px] font-extrabold tracking-[-0.03em] text-white">{c.city.name}</h2>
            </div>
            <div className="flex flex-col gap-3 p-5">
              <p className="flex items-start gap-2.5 text-[14px] leading-relaxed text-ink">
                <Icon name="business" className="mt-0.5 flex-shrink-0 text-primary" size={18} />
                {c.address}
              </p>
              <a href={`tel:${c.phone.replace(/\s+/g, "")}`} className="flex items-center gap-2.5 text-[15px] font-semibold text-ink hover:text-primary">
                <Icon name="call" className="text-primary" size={18} />
                {c.phone}
              </a>
              <a href={`mailto:${c.email}`} className="flex min-w-0 items-center gap-2.5 text-[15px] font-semibold text-ink hover:text-primary">
                <Icon name="mail" className="flex-shrink-0 text-primary" size={18} />
                <span className="truncate">{c.email}</span>
              </a>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

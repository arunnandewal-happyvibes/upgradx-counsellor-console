import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { Icon } from "@/components/ui/Icon";

export const dynamic = "force-dynamic";

export default async function ContactPage() {
  const contacts = await prisma.cityContact.findMany({
    include: { city: true },
    orderBy: { city: { name: "asc" } },
  });

  return (
    <div className="pb-16">
      <h1 className="text-display-lg text-on-surface mb-2">Contact Us</h1>
      <div className="h-0.5 bg-primary w-16 mb-4" />
      <p className="text-body-lg text-secondary max-w-2xl mb-section-gap">
        Find your local centre below, or reach out for dedicated counsellor support.
      </p>

      <div className="elevate-3d bg-surface-container-low border border-surface-variant p-6 rounded shadow-sm relative overflow-hidden mb-section-gap">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-fixed-dim rounded-bl-full opacity-20 -mr-16 -mt-16 pointer-events-none" />
        <h3 className="text-headline-sm text-on-surface mb-2">Counsellor Services</h3>
        <p className="text-body-sm text-secondary mb-6 max-w-xl">
          Need to modify a batch schedule, request a course change, or escalate an issue? Use our
          internal service desk.
        </p>
        <button
          disabled
          className="w-full max-w-md bg-surface-variant text-secondary-fixed-dim font-bold text-label-bold py-3 px-4 rounded border border-surface-dim cursor-not-allowed flex items-center justify-center gap-2"
        >
          <Icon name="lock" size={18} />
          Need a course change? Raise a request
        </button>
        <p className="text-body-sm text-tertiary mt-3 italic">
          Service portal temporarily unavailable. Module coming soon.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-gutter">
        {contacts.map((c) => (
          <div
            key={c.id}
            className="elevate-3d bg-surface-container-lowest border border-surface-variant rounded shadow-sm overflow-hidden flex flex-col"
          >
            <div className="relative w-full h-28 flex items-center justify-center overflow-hidden">
              {c.city.monumentImageUrl ? (
                <Image src={c.city.monumentImageUrl} alt={`A landmark in ${c.city.name}`} fill className="object-cover" />
              ) : (
                <div
                  className="absolute inset-0 flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg, #1a1c1c, #e41f26 160%)" }}
                >
                  <Icon name="location_city" className="text-white opacity-80" size={40} fill />
                </div>
              )}
            </div>
            <div className="p-5 flex flex-col gap-3">
              <h2 className="text-headline-sm text-on-surface">{c.city.name}</h2>
              <div className="flex items-start gap-2">
                <Icon name="business" className="text-primary mt-0.5" size={18} />
                <p className="text-body-sm text-on-surface">{c.address}</p>
              </div>
              <div className="flex items-center gap-2">
                <Icon name="call" className="text-primary" size={18} />
                <p className="text-body-sm text-on-surface">{c.phone}</p>
              </div>
              <div className="flex items-center gap-2">
                <Icon name="mail" className="text-primary" size={18} />
                <p className="text-body-sm text-on-surface truncate">{c.email}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

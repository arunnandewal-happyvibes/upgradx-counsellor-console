import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Icon } from "@/components/ui/Icon";

export async function HiringPartnersSection() {
  const partners = await prisma.hiringPartner.findMany({ orderBy: { order: "asc" } });
  if (partners.length === 0) return null;

  return (
    <section id="hiring-partners">
      <SectionHeader eyebrow="Trusted By" title="Hiring Partners" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-gutter">
        {partners.map((p) => (
          <div
            key={p.id}
            className="elevate-3d flex items-center gap-4 bg-surface-container-lowest border border-outline-variant rounded-xl p-6"
          >
            <span className="flex h-16 w-16 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg bg-surface-container-low">
              {p.logoUrl ? (
                <Image
                  src={p.logoUrl}
                  alt={p.name}
                  width={64}
                  height={64}
                  className="h-full w-full object-contain p-2"
                />
              ) : (
                <Icon name="domain" size={32} className="text-outline" />
              )}
            </span>
            <span className="text-headline-sm font-bold text-on-surface uppercase tracking-wide">
              {p.name}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

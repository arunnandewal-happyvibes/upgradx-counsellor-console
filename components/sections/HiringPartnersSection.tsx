import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Icon } from "@/components/ui/Icon";

type Partner = { id: string; name: string; logoUrl: string | null };

function PartnerTile({ partner }: { partner: Partner }) {
  return (
    <div className="elevate-3d flex flex-shrink-0 items-center gap-4 bg-surface-container-lowest border border-outline-variant rounded-xl p-6 w-80">
      <span className="flex h-16 w-16 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg bg-surface-container-low">
        {partner.logoUrl ? (
          <Image
            src={partner.logoUrl}
            alt={partner.name}
            width={64}
            height={64}
            className="h-full w-full object-contain p-2"
          />
        ) : (
          <Icon name="domain" size={32} className="text-outline" />
        )}
      </span>
      <span className="text-headline-sm font-bold text-on-surface uppercase tracking-wide whitespace-nowrap">
        {partner.name}
      </span>
    </div>
  );
}

export async function HiringPartnersSection() {
  const partners = await prisma.hiringPartner.findMany({ orderBy: { order: "asc" } });
  if (partners.length === 0) return null;

  return (
    <section id="hiring-partners">
      <SectionHeader eyebrow="Trusted By" title="Hiring Partners" />
      <div
        className="w-full overflow-hidden"
        style={{ maskImage: "linear-gradient(90deg, transparent, black 6%, black 94%, transparent)" }}
      >
        <div className="partners-track flex w-max items-center gap-gutter py-2">
          {[...partners, ...partners].map((p, i) => (
            <PartnerTile key={`${p.id}-${i}`} partner={p} />
          ))}
        </div>
      </div>
    </section>
  );
}

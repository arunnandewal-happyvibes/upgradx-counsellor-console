import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Icon } from "@/components/ui/Icon";

type Partner = { id: string; name: string; logoUrl: string | null };

function PartnerTile({ partner }: { partner: Partner }) {
  return (
    <div className="elevate-3d flex flex-shrink-0 items-center gap-3 bg-gradient-to-br from-primary-fixed/50 via-surface-container-lowest to-surface-container-lowest border border-outline-variant rounded-xl p-4">
      <span className="flex h-20 w-20 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg bg-surface-container-low">
        {partner.logoUrl ? (
          <Image
            src={partner.logoUrl}
            alt={partner.name}
            width={80}
            height={80}
            className="h-full w-full object-contain p-1"
          />
        ) : (
          <Icon name="domain" size={40} className="text-outline" />
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
        <div className="partners-track flex w-max items-center gap-4 py-2">
          {[...partners, ...partners].map((p, i) => (
            <PartnerTile key={`${p.id}-${i}`} partner={p} />
          ))}
        </div>
      </div>
    </section>
  );
}

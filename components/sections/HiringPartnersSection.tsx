"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Icon } from "@/components/ui/Icon";
import { getLeadProfile } from "@/lib/leadProfile";

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

export function HiringPartnersSection() {
  const [partners, setPartners] = useState<Partner[] | null>(null);

  useEffect(() => {
    const interests = getLeadProfile()?.interests ?? [];
    const search = interests.length > 0 ? `?interests=${encodeURIComponent(interests.join(","))}` : "";
    fetch(`/api/hiring-partners${search}`)
      .then((r) => r.json())
      .then(setPartners)
      .catch(() => setPartners([]));
  }, []);

  if (!partners || partners.length === 0) return null;

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

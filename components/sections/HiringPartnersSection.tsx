"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Marquee } from "@/components/ui/Marquee";
import { Icon } from "@/components/ui/Icon";
import { getLeadProfile } from "@/lib/leadProfile";

type Partner = { id: string; name: string; logoUrl: string | null };

function PartnerTile({ partner }: { partner: Partner }) {
  return (
    <div className="card-red-3d flex h-24 flex-shrink-0 items-center gap-4 rounded-[20px] border border-outline-variant bg-white py-3 pl-3 pr-6">
      <span className="flex h-[72px] w-[72px] flex-shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-surface-container-low">
        {partner.logoUrl ? (
          <Image src={partner.logoUrl} alt={partner.name} width={72} height={72} className="h-full w-full object-contain p-2" />
        ) : (
          <Icon name="domain" size={32} className="text-outline" />
        )}
      </span>
      <span className="whitespace-nowrap font-display text-[18px] font-bold tracking-[-0.01em] text-ink">{partner.name}</span>
    </div>
  );
}

export function HiringPartnersSection() {
  const [partners, setPartners] = useState<Partner[] | null>(null);
  const [filtered, setFiltered] = useState(false);

  useEffect(() => {
    const interests = getLeadProfile()?.interests ?? [];
    const search = interests.length > 0 ? `?interests=${encodeURIComponent(interests.join(","))}` : "";
    fetch(`/api/hiring-partners${search}`)
      .then((r) => {
        setFiltered(r.headers.get("X-Interest-Filtered") === "1");
        return r.json();
      })
      .then(setPartners)
      .catch(() => setPartners([]));
  }, []);

  if (!partners || partners.length === 0) return null;

  return (
    <section id="hiring-partners">
      <div className="mb-8 flex flex-wrap items-end gap-x-12 gap-y-4">
        <h2 className="flex items-baseline gap-4">
          <span className="font-display text-[clamp(72px,9vw,120px)] font-extrabold leading-[0.85] tracking-[-0.05em] text-primary">
            {partners.length}
          </span>
          <span className="font-display text-[clamp(22px,2.4vw,32px)] font-bold leading-[1.1] tracking-[-0.02em] text-ink">
            hiring partners
            <br />
            {filtered ? "for your interests" : "trust upGrad X"}
          </span>
        </h2>
        <p className="mb-1.5 max-w-[380px] text-body-md text-on-surface-variant">
          {filtered
            ? "Filtered to the sectors the learner picked. Drag or use the arrows to browse."
            : "Companies that hire upGrad X learners. Drag or use the arrows to browse."}
        </p>
      </div>
      <Marquee speed={60} className="items-center gap-4 pb-6 pt-4">
        {partners.map((p) => (
          <PartnerTile key={p.id} partner={p} />
        ))}
      </Marquee>
    </section>
  );
}

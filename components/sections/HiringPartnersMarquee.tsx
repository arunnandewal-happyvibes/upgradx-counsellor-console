import Image from "next/image";
import { Icon } from "@/components/ui/Icon";

type Partner = { id: string; name: string; logoUrl: string | null };

function PartnerPill({ partner }: { partner: Partner }) {
  return (
    <div className="partner-pill flex-shrink-0 flex items-center gap-2 bg-white border border-outline-variant rounded-full pl-2 pr-4 py-1.5 shadow-sm">
      <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-surface-container-low">
        {partner.logoUrl ? (
          <Image
            src={partner.logoUrl}
            alt={partner.name}
            width={28}
            height={28}
            className="h-full w-full object-contain p-1"
          />
        ) : (
          <Icon name="domain" size={16} className="text-outline" />
        )}
      </span>
      <span className="text-label-bold font-bold text-on-surface uppercase whitespace-nowrap">
        {partner.name}
      </span>
    </div>
  );
}

export function HiringPartnersMarquee({ partners }: { partners: Partner[] }) {
  if (partners.length === 0) return null;

  return (
    <div
      className="w-full overflow-hidden"
      style={{ maskImage: "linear-gradient(90deg, transparent, black 8%, black 92%, transparent)" }}
    >
      <div className="partners-track flex w-max items-center gap-3 py-1">
        {[...partners, ...partners].map((p, i) => (
          <PartnerPill key={`${p.id}-${i}`} partner={p} />
        ))}
      </div>
    </div>
  );
}

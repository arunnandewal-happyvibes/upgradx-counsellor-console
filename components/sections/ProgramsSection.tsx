import { prisma } from "@/lib/prisma";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Icon } from "@/components/ui/Icon";
import { LinkButton } from "@/components/ui/Button";
import { ProgramBadges } from "@/components/programs/ProgramBadges";
import { isIitCertified } from "@/lib/iitBadge";

const MODE_BADGE: Record<string, string> = {
  Offline: "bg-primary text-white",
  Online: "bg-ink text-white",
  Hybrid: "bg-surface-container text-ink",
};

export async function ProgramsSection() {
  const programs = await prisma.program.findMany({
    orderBy: { order: "asc" },
    include: { certifications: true, addOnCertificates: true },
  });
  if (programs.length === 0) return null;

  return (
    <section id="programs">
      <SectionHeader eyebrow="Catalogue" title={`All ${programs.length} programs.`} />
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {programs.map((p) => {
          const brochure = p.brochureUrl ?? p.certifications[0]?.brochureUrl ?? null;
          return (
            <article
              key={p.id}
              className="card-red-3d flex flex-col gap-5 rounded-[28px] border border-outline-variant bg-white p-7"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] ${MODE_BADGE[p.mode] ?? MODE_BADGE.Offline}`}
                >
                  {p.mode}
                </span>
                <span className="rounded-full bg-surface-container px-3 py-1 text-[13px] font-semibold text-ink">
                  {p.duration}
                </span>
                <ProgramBadges slug={p.slug} iit={isIitCertified(p)} />
              </div>

              <div>
                <h3 className="font-display text-[24px] font-bold leading-[1.15] tracking-[-0.02em] text-ink">{p.name}</h3>
                <p className="editable-field mt-2 line-clamp-2 text-[15px] leading-relaxed text-on-surface-variant">
                  {p.description}
                </p>
              </div>

              {p.bullets.length > 0 && (
                <ul className="space-y-2.5">
                  {p.bullets.slice(0, 3).map((b) => (
                    <li key={b} className="flex items-start gap-2.5 text-[14px] text-ink">
                      <Icon name="check" className="mt-0.5 flex-shrink-0 text-primary" size={18} />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              )}

              {(p.certifications.length > 0 || p.addOnCertificates.length > 0) && (
                <div className="border-t border-outline-variant pt-4">
                  <p className="mb-2.5 text-[12px] font-bold uppercase tracking-[0.12em] text-on-surface-variant">
                    Eligible add-ons
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {p.certifications.map((c) =>
                      p.certificateUrl ? (
                        <a
                          key={c.id}
                          href={p.certificateUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-full border border-outline-variant px-3 py-1.5 text-[13px] font-medium text-ink transition-colors hover:border-ink"
                          title={`Download ${c.partnerInstitution} certificate`}
                        >
                          <Icon name="workspace_premium" size={15} className="text-primary" />
                          {c.partnerInstitution} certificate
                        </a>
                      ) : (
                        <span
                          key={c.id}
                          className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-outline-variant px-3 py-1.5 text-[13px] text-on-surface-variant"
                          title="Certificate sample not yet uploaded"
                        >
                          {c.partnerInstitution} certificate · soon
                        </span>
                      ),
                    )}
                    {p.addOnCertificates.map((ac) => (
                      <a
                        key={ac.id}
                        href={ac.pdfUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-full border border-outline-variant px-3 py-1.5 text-[13px] font-medium text-ink transition-colors hover:border-ink"
                        title={ac.description ? `${ac.name} — ${ac.description}` : `Open ${ac.name}`}
                      >
                        <Icon name="verified" size={15} className="text-primary" />
                        {ac.name}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-auto flex flex-col gap-2 pt-1">
                <div className="flex gap-2">
                  <LinkButton href={`/console/programs/${p.slug}`} variant="dark" className="flex-1">
                    View details
                  </LinkButton>
                  {brochure && (
                    <a
                      href={brochure}
                      download
                      aria-label={`Download ${p.name} brochure`}
                      title="Download brochure"
                      className="btn-3d grid h-12 w-12 flex-shrink-0 place-items-center rounded-xl border border-outline-variant text-ink hover:border-ink"
                    >
                      <Icon name="download" size={20} />
                    </a>
                  )}
                </div>
                {p.courseUrl && (
                  <a
                    href={p.courseUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 py-2 text-[14px] font-semibold text-primary hover:underline"
                  >
                    View course page
                    <Icon name="open_in_new" size={16} />
                  </a>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

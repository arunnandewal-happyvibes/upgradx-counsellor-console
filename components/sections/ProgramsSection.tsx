import { prisma } from "@/lib/prisma";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Icon } from "@/components/ui/Icon";
import { LinkButton } from "@/components/ui/Button";

const MODE_BADGE: Record<string, string> = {
  Offline: "bg-primary text-white",
  Online: "bg-on-tertiary-fixed-variant text-white",
  Hybrid: "bg-tertiary-fixed text-on-surface",
};

export async function ProgramsSection() {
  const programs = await prisma.program.findMany({
    orderBy: { order: "asc" },
    include: { certifications: true },
  });
  if (programs.length === 0) return null;

  return (
    <section id="programs">
      <SectionHeader eyebrow="Catalogue" title="Programs" />
      <div className="grid grid-cols-1 gap-gutter sm:grid-cols-2 lg:grid-cols-3">
        {programs.map((p, i) => (
          <div
            key={p.id}
            className="elevate-3d flex flex-col bg-surface-container-lowest rounded-xl overflow-hidden border border-surface-container-high hover:border-primary group"
          >
            <div className="relative w-full h-32 bg-surface-container flex items-center justify-center overflow-hidden">
              <div
                className="absolute inset-0 opacity-90"
                style={{
                  background: `linear-gradient(135deg, ${i % 2 === 0 ? "#1a1c1c" : "#2f3131"}, #e41f26 150%)`,
                }}
              />
              <span className="relative text-white text-headline-md font-extrabold tracking-tight opacity-90">
                {p.category}
              </span>
              <div className="absolute top-3 left-3 flex gap-2">
                <span
                  className={`px-3 py-1 text-[10px] font-bold tracking-wider uppercase rounded-full ${MODE_BADGE[p.mode] ?? MODE_BADGE.Offline}`}
                >
                  {p.mode}
                </span>
                <span className="bg-surface-container-highest px-3 py-1 text-on-surface text-[10px] font-bold tracking-wider uppercase rounded-full">
                  {p.duration}
                </span>
              </div>
            </div>

            <div className="p-5 flex flex-col flex-1">
              <h3 className="text-on-surface text-headline-sm mb-2">{p.name}</h3>
              <p className="text-on-surface-variant text-body-md mb-4 line-clamp-2 editable-field">
                {p.description}
              </p>
              <div className="space-y-2 mb-4">
                {p.bullets.slice(0, 3).map((b) => (
                  <div key={b} className="flex items-start gap-2">
                    <Icon name="check_circle" className="text-primary mt-0.5" size={16} fill />
                    <span className="text-on-surface-variant text-body-sm">{b}</span>
                  </div>
                ))}
              </div>
              <div className="mt-auto pt-4 border-t border-surface-container border-dashed">
                <p className="text-body-sm font-bold text-primary mb-4">
                  Certifications Eligible:{" "}
                  <span className="text-on-surface">
                    {p.certifications.map((c) => c.partnerInstitution).join(", ")}
                  </span>
                </p>
                <div className="flex items-center gap-3">
                  <LinkButton href={`/console/programs/${p.slug}`} variant="surface" className="flex-1 justify-center">
                    View Details
                  </LinkButton>
                  <a
                    href={p.brochureUrl ?? p.certifications[0]?.brochureUrl ?? "#"}
                    download
                    className="btn-3d w-10 h-10 flex items-center justify-center rounded border border-outline-variant text-on-surface-variant hover:text-primary hover:border-primary transition-all"
                    aria-label="Download brochure"
                    title="Download brochure"
                  >
                    <Icon name="download" size={20} />
                  </a>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

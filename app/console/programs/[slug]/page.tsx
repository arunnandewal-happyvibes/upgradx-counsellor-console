import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { isSectionVisible } from "@/lib/section-visibility";
import { CurriculumAccordion } from "@/components/programs/CurriculumAccordion";
import { InstructorMiniGrid } from "@/components/programs/InstructorMiniGrid";
import { Icon } from "@/components/ui/Icon";

export default async function ProgramDetailPage({ params }: { params: { slug: string } }) {
  const program = await prisma.program.findUnique({
    where: { slug: params.slug },
    include: {
      certifications: true,
      curriculumModules: { orderBy: { order: "asc" } },
      addOnCertificates: true,
    },
  });
  if (!program) notFound();

  const showIndustryLeaders = await isSectionVisible("industry-leaders", program.id);
  const leaders = showIndustryLeaders
    ? await prisma.instructor.findMany({ where: { isIndustryLeader: true }, orderBy: { order: "asc" } })
    : [];

  return (
    <div className="pb-16">
      <header className="mb-section-gap border-b border-surface-variant pb-6">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <h1 className="text-headline-md text-on-surface">{program.name}</h1>
          <span className="bg-surface-container-highest px-3 py-1 text-on-surface text-[10px] font-bold tracking-wider uppercase rounded-full">
            {program.mode}
          </span>
        </div>
        <div className="mb-3 text-body-sm text-secondary">{program.duration}</div>
        <div className="mb-4 text-body-sm font-bold text-primary">
          Certifications Eligible:{" "}
          <span className="text-on-surface">{program.certifications.map((c) => c.partnerInstitution).join(", ")}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {program.certifications.map((c) => (
            <a
              key={c.id}
              href={c.brochureUrl}
              download
              className="btn-3d inline-flex items-center gap-2 rounded border border-primary px-4 py-2 text-body-sm font-semibold text-primary hover:bg-primary-fixed transition-colors"
            >
              <Icon name="download" size={18} />
              Download Brochure — {c.name}
            </a>
          ))}
          {program.certificateUrl && (
            <a
              href={program.certificateUrl}
              target="_blank"
              rel="noreferrer"
              className="btn-3d inline-flex items-center gap-2 rounded border border-primary px-4 py-2 text-body-sm font-semibold text-primary hover:bg-primary-fixed transition-colors"
            >
              <Icon name="workspace_premium" size={18} fill />
              Download Certificate
            </a>
          )}
        </div>
      </header>

      <section className="mb-section-gap">
        <h2 className="mb-4 text-headline-sm text-on-surface">Curriculum</h2>
        <CurriculumAccordion modules={program.curriculumModules} />
      </section>

      {program.addOnCertificates.length > 0 && (
        <section className="mb-section-gap">
          <h2 className="mb-4 text-headline-sm text-on-surface">Additional Eligible Certificates</h2>
          <div className="flex flex-col gap-2">
            {program.addOnCertificates.map((ac) => (
              <a
                key={ac.id}
                href={ac.pdfUrl}
                target="_blank"
                rel="noreferrer"
                className="group flex w-full items-center justify-between rounded border border-surface-variant bg-surface-container-lowest px-card-padding py-4 hover:border-primary transition-colors"
              >
                <span className="flex items-center gap-2 text-body-md font-semibold text-on-surface group-hover:text-primary transition-colors">
                  <Icon name="verified" className="text-primary" size={20} fill />
                  {ac.name}
                </span>
                <Icon name="open_in_new" className="text-primary shrink-0" size={20} />
              </a>
            ))}
          </div>
        </section>
      )}

      {leaders.length > 0 && (
        <section>
          <h2 className="mb-4 text-headline-sm text-on-surface">Industry Leaders on this Track</h2>
          <InstructorMiniGrid instructors={leaders} />
        </section>
      )}
    </div>
  );
}

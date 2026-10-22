import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { isSectionVisible } from "@/lib/section-visibility";
import { startOfToday } from "@/lib/dateFilters";
import { CurriculumAccordion } from "@/components/programs/CurriculumAccordion";
import { InstructorMiniGrid } from "@/components/programs/InstructorMiniGrid";
import { BatchList } from "@/components/console/BatchList";
import { PageHeader } from "@/components/ui/PageHeader";
import { ProgramBadgeRow } from "@/components/programs/ProgramBadges";
import { isIitCertified } from "@/lib/iitBadge";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { SectionLink } from "@/components/ui/SectionLink";
import { Icon } from "@/components/ui/Icon";

function Fact({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5 rounded-[20px] border border-outline-variant bg-white p-5">
      <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-on-surface-variant">{label}</span>
      <span className="font-display text-[24px] font-bold leading-tight tracking-[-0.02em] text-ink">{value}</span>
    </div>
  );
}

const actionBase =
  "btn-3d inline-flex h-12 items-center gap-2 whitespace-nowrap rounded-xl px-5 text-[15px] font-semibold";

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

  const [showIndustryLeaders, batches] = await Promise.all([
    isSectionVisible("industry-leaders", program.id),
    prisma.batch.findMany({
      where: { programId: program.id, applicationCloseDate: { gte: startOfToday() } },
      orderBy: { startDate: "asc" },
      take: 6,
      include: { program: { select: { name: true } }, city: { select: { name: true } } },
    }),
  ]);
  const leaders = showIndustryLeaders
    ? await prisma.instructor.findMany({ where: { isIndustryLeader: true }, orderBy: { order: "asc" } })
    : [];

  const certNames = program.certifications.map((c) => c.partnerInstitution).join(", ");

  return (
    <div className="flex flex-col gap-16 md:gap-20">
      <div className="flex flex-col gap-10">
        <PageHeader
          back={{ href: "/console#programs", label: "All programs" }}
          eyebrow={`${program.mode} program`}
          title={program.name}
          lead={program.description}
        >
          {program.courseUrl && (
            <a
              href={program.courseUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`${actionBase} bg-primary text-white hover:bg-primary-container hover:shadow-red-glow`}
            >
              View course page
              <Icon name="open_in_new" size={18} />
            </a>
          )}
          {program.certifications.map((c) => (
            <a
              key={c.id}
              href={c.brochureUrl}
              download
              className={`${actionBase} border-[1.5px] border-ink bg-white text-ink hover:bg-ink hover:text-white`}
            >
              <Icon name="download" size={18} />
              Brochure{program.certifications.length > 1 ? ` — ${c.name}` : ""}
            </a>
          ))}
          {program.certificateUrl && (
            <a
              href={program.certificateUrl}
              target="_blank"
              rel="noreferrer"
              className={`${actionBase} border border-outline-variant bg-white text-ink hover:border-ink`}
            >
              <Icon name="workspace_premium" size={18} className="text-primary" />
              Sample certificate
            </a>
          )}
        </PageHeader>

        <ProgramBadgeRow slug={program.slug} iit={isIitCertified(program)} className="-mt-4" />

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Fact label="Duration" value={program.duration} />
          <Fact label="Mode" value={program.mode} />
          <Fact label="Modules" value={program.curriculumModules.length || "—"} />
          <Fact label="Certified by" value={certNames || "—"} />
        </div>

        {program.bullets.length > 0 && (
          <ul className="grid gap-3 md:grid-cols-3">
            {program.bullets.map((b) => (
              <li key={b} className="flex items-start gap-3 rounded-[20px] bg-surface-container-low p-5 text-[15px] text-ink">
                <Icon name="check" size={20} className="mt-0.5 flex-shrink-0 text-primary" />
                {b}
              </li>
            ))}
          </ul>
        )}
      </div>

      <section>
        <SectionHeader
          eyebrow="Next batches"
          title={batches.length > 0 ? "Open for applications." : "No open batches right now."}
          action={<SectionLink href="/console/batches">All batches</SectionLink>}
        />
        {batches.length > 0 ? (
          <BatchList
            hideProgram
            batches={batches.map((b) => ({
              ...b,
              startDate: b.startDate.toISOString(),
              applicationCloseDate: b.applicationCloseDate.toISOString(),
            }))}
          />
        ) : (
          <p className="-mt-3 text-body-md text-on-surface-variant">
            New batches appear here as soon as an admin adds them.
          </p>
        )}
      </section>

      {program.curriculumModules.length > 0 && (
        <section>
          <SectionHeader eyebrow="Curriculum" title={`${program.curriculumModules.length} modules, start to finish.`} />
          <CurriculumAccordion modules={program.curriculumModules} />
        </section>
      )}

      {program.addOnCertificates.length > 0 && (
        <section>
          <SectionHeader eyebrow="Add-ons" title="Additional eligible certificates." />
          <div className="grid gap-4 md:grid-cols-2">
            {program.addOnCertificates.map((ac) => (
              <a
                key={ac.id}
                href={ac.pdfUrl}
                target="_blank"
                rel="noreferrer"
                className="elevate-3d group flex items-start gap-4 rounded-[24px] border border-outline-variant bg-white p-6"
              >
                <span className="grid h-12 w-12 flex-shrink-0 place-items-center rounded-2xl bg-primary-fixed text-primary">
                  <Icon name="verified" size={24} />
                </span>
                <span className="flex min-w-0 flex-1 flex-col gap-1">
                  <span className="font-display text-[19px] font-bold text-ink">{ac.name}</span>
                  {ac.description && <span className="text-[14px] leading-relaxed text-on-surface-variant">{ac.description}</span>}
                </span>
                <Icon name="open_in_new" size={20} className="flex-shrink-0 text-on-surface-variant group-hover:text-ink" />
              </a>
            ))}
          </div>
        </section>
      )}

      <section className="flex flex-col gap-6 rounded-[28px] bg-ink p-8 text-white md:flex-row md:items-center md:p-10">
        <span className="grid h-14 w-14 flex-shrink-0 place-items-center rounded-2xl bg-white/10">
          <Icon name="policy" size={28} />
        </span>
        <div className="flex-1">
          <h2 className="font-display text-[24px] font-bold tracking-[-0.02em]">Career services &amp; placement assistance</h2>
          <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-white/70">
            Placement support is facilitative, not guaranteed. Walk the learner through eligibility, activation,
            their responsibilities and the disciplinary policy for this program.
          </p>
        </div>
        <Link
          href="/console/career-services-policy"
          className="btn-3d inline-flex h-12 flex-shrink-0 items-center gap-2 rounded-xl bg-white px-5 text-[15px] font-semibold text-ink"
        >
          Read the policy
          <Icon name="arrow_forward" size={18} />
        </Link>
      </section>

      {leaders.length > 0 && (
        <section>
          <SectionHeader eyebrow="Mentorship" title="Industry leaders on this track." />
          <InstructorMiniGrid instructors={leaders} />
        </section>
      )}
    </div>
  );
}

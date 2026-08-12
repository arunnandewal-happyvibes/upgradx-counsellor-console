import { prisma } from "@/lib/prisma";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Avatar } from "@/components/ui/Avatar";

export async function SuccessStoriesSection() {
  const stories = await prisma.successStory.findMany({ orderBy: { order: "asc" } });
  if (stories.length === 0) return null;

  return (
    <section id="success-stories">
      <SectionHeader eyebrow="Social Proof" title="Success Stories" />
      <div className="flex gap-gutter overflow-x-auto scrollbar-thin py-2 px-1 md:grid md:grid-cols-4 md:overflow-x-hidden">
        {stories.map((s) => (
          <article
            key={s.id}
            className="min-w-[260px] b2b-card elevate-3d hover:border-2 p-card-padding flex flex-col gap-3"
          >
            <div className="flex items-center gap-3">
              <Avatar src={s.avatarUrl} name={s.studentName} size={48} />
              <div className="flex flex-col min-w-0">
                <h3 className="text-headline-sm text-on-surface truncate editable-field">{s.studentName}</h3>
                <span className="text-label-bold font-bold text-tertiary truncate uppercase editable-field">
                  {s.courseName}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-1 mt-2 border-l-2 border-outline-variant pl-3">
              <span className="text-body-sm text-secondary">Landed Role</span>
              <p className="text-body-lg font-semibold text-on-surface editable-field">{s.roleLanded}</p>
              <p className="text-headline-sm text-primary font-bold mt-1 editable-field">{s.company}</p>
            </div>

            <p className="text-body-sm text-on-surface-variant line-clamp-3 mt-2 editable-field">
              {s.description}
            </p>

            <div className="mt-auto pt-4 flex items-end justify-between border-t border-surface-container">
              <span className="text-label-bold font-bold text-secondary uppercase">Placement Package</span>
              <span className="text-stat-lg text-primary editable-field">{s.packageLabel}</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

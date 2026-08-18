import { prisma } from "@/lib/prisma";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Avatar } from "@/components/ui/Avatar";

type Story = {
  id: string;
  studentName: string;
  avatarUrl: string | null;
  linkedinUrl: string | null;
  courseName: string;
  roleLanded: string;
  company: string;
  description: string;
  packageLabel: string;
};

function StoryCard({ s }: { s: Story }) {
  return (
    <article className="min-w-[260px] w-[260px] flex-shrink-0 b2b-card elevate-3d hover:border-2 p-card-padding flex flex-col gap-3">
      <div className="flex items-start gap-3">
        <Avatar src={s.avatarUrl} name={s.studentName} size={48} />
        <div className="flex flex-1 min-w-0 items-start justify-between gap-2">
          <div className="flex flex-col min-w-0">
            <h3 className="text-headline-sm text-on-surface truncate editable-field">{s.studentName}</h3>
            <span className="text-label-bold font-bold text-tertiary truncate uppercase editable-field">
              {s.courseName}
            </span>
          </div>
          {s.linkedinUrl && (
            <a
              aria-label={`${s.studentName}'s LinkedIn profile`}
              title="Connect on LinkedIn"
              className="text-secondary hover:text-primary transition-colors flex-shrink-0"
              href={s.linkedinUrl}
              target="_blank"
              rel="noreferrer"
            >
              <svg aria-hidden="true" className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"
                />
              </svg>
            </a>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-1 mt-2 border-l-2 border-outline-variant pl-3">
        <span className="text-body-sm text-secondary">Landed Role</span>
        <p className="text-body-lg font-semibold text-on-surface editable-field">{s.roleLanded}</p>
        <p className="text-headline-sm text-primary font-bold mt-1 editable-field">{s.company}</p>
      </div>

      <p className="text-body-sm text-on-surface-variant line-clamp-3 mt-2 editable-field">{s.description}</p>

      <div className="mt-auto pt-4 border-t border-surface-container">
        <span className="text-label-bold font-bold text-secondary uppercase block mb-1">Placement Package</span>
        <span className="text-headline-sm text-primary font-bold editable-field">{s.packageLabel}</span>
      </div>
    </article>
  );
}

function StoryCarousel({ stories, reverse }: { stories: Story[]; reverse?: boolean }) {
  const duration = `${Math.max(stories.length * 6, 20)}s`;
  return (
    <div
      className="w-full overflow-hidden"
      style={{ maskImage: "linear-gradient(90deg, transparent, black 4%, black 96%, transparent)" }}
    >
      <div
        className={`flex w-max items-stretch gap-gutter py-2 ${reverse ? "marquee-track-reverse" : "marquee-track"}`}
        style={{ ["--marquee-duration" as string]: duration }}
      >
        {[...stories, ...stories].map((s, i) => (
          <StoryCard key={`${s.id}-${i}`} s={s} />
        ))}
      </div>
    </div>
  );
}

export async function SuccessStoriesSection() {
  const stories = await prisma.successStory.findMany({ orderBy: { order: "asc" } });
  if (stories.length === 0) return null;

  const mid = Math.ceil(stories.length / 2);
  const topRow = stories.slice(0, mid);
  const bottomRow = stories.slice(mid);

  return (
    <section id="success-stories">
      <SectionHeader eyebrow="Social Proof" title="Success Stories" />
      <div className="flex flex-col gap-gutter">
        <StoryCarousel stories={topRow} />
        {bottomRow.length > 0 && <StoryCarousel stories={bottomRow} reverse />}
      </div>
    </section>
  );
}

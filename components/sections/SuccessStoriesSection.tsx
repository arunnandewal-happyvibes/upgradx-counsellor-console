"use client";

import { useCityFetch } from "@/lib/useCityFetch";
import { Marquee } from "@/components/ui/Marquee";
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
    <article className="card-red-3d flex w-[340px] flex-shrink-0 flex-col gap-5 rounded-[24px] border border-outline-variant bg-white p-7">
      <div className="flex items-center gap-3.5">
        <Avatar src={s.avatarUrl} name={s.studentName} size={52} />
        <div className="min-w-0 flex-1">
          <h3 className="editable-field truncate text-[17px] font-bold text-ink">{s.studentName}</h3>
          <span className="editable-field block truncate text-[14px] text-on-surface-variant">{s.courseName}</span>
        </div>
        {s.linkedinUrl && (
          <a
            aria-label={`${s.studentName}'s LinkedIn profile`}
            title="Connect on LinkedIn"
            className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container-low hover:text-[#0a66c2]"
            href={s.linkedinUrl}
            target="_blank"
            rel="noreferrer"
          >
            <svg aria-hidden="true" className="h-[18px] w-[18px]" fill="currentColor" viewBox="0 0 24 24">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"
              />
            </svg>
          </a>
        )}
      </div>

      <p className="editable-field font-display text-[22px] font-bold leading-[1.18] tracking-[-0.02em] text-ink">
        {s.roleLanded} <span className="text-on-surface-variant">at</span> {s.company}
      </p>

      <p className="editable-field line-clamp-3 text-[14px] leading-relaxed text-on-surface-variant">{s.description}</p>

      <div className="mt-auto flex items-center justify-between border-t border-outline-variant pt-4">
        <span className="text-[13px] text-on-surface-variant">Package</span>
        <span className="editable-field text-[18px] font-bold text-primary">{s.packageLabel}</span>
      </div>
    </article>
  );
}

function StoryCarousel({ stories, reverse }: { stories: Story[]; reverse?: boolean }) {
  return (
    <Marquee speed={45} reverse={reverse} className="items-stretch gap-5 pb-6 pt-4">
      {stories.map((s) => (
        <StoryCard key={s.id} s={s} />
      ))}
    </Marquee>
  );
}

export function SuccessStoriesSection() {
  const { data } = useCityFetch<Story[]>("/api/success-stories");
  if (!data || data.length === 0) return null;
  const stories = data;

  const mid = Math.ceil(stories.length / 2);
  const topRow = stories.slice(0, mid);
  const bottomRow = stories.slice(mid);

  return (
    <section id="success-stories">
      <SectionHeader eyebrow="Success stories" title="People who sat in this chair." />
      <div className="flex flex-col gap-5">
        <StoryCarousel stories={topRow} />
        {bottomRow.length > 0 && <StoryCarousel stories={bottomRow} reverse />}
      </div>
    </section>
  );
}

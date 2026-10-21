"use client";

import { useCityFetch } from "@/lib/useCityFetch";
import { Marquee } from "@/components/ui/Marquee";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Icon } from "@/components/ui/Icon";
import { Avatar } from "@/components/ui/Avatar";

type Instructor = {
  id: string;
  name: string;
  linkedinUrl: string | null;
  subjectTaught: string;
  bio: string;
  experienceYears: number;
  tags: string[];
  photoUrl?: string | null;
  city?: { name: string } | null;
};

function InstructorCard({ ins }: { ins: Instructor }) {
  return (
    <article className="card-red-3d flex w-[380px] flex-shrink-0 flex-col gap-5 rounded-[24px] border border-outline-variant bg-white p-7">
      <div className="flex items-start gap-4">
        <Avatar src={ins.photoUrl} name={ins.name} size={80} rounded="rounded-2xl" className="flex-shrink-0" />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-display text-[20px] font-bold leading-tight tracking-[-0.01em] text-ink">{ins.name}</h3>
            {ins.linkedinUrl && (
              <a
                aria-label={`${ins.name}'s LinkedIn profile`}
                className="grid h-8 w-8 flex-shrink-0 place-items-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container-low hover:text-[#0a66c2]"
                href={ins.linkedinUrl}
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
          <p className="mt-1 text-[12px] font-bold uppercase tracking-[0.12em] text-primary">{ins.subjectTaught}</p>
          {ins.city?.name && (
            <p className="mt-1 flex items-center gap-1 text-[13px] text-on-surface-variant">
              <Icon name="location_on" size={14} />
              {ins.city.name}
            </p>
          )}
        </div>
      </div>
      <p className="editable-field line-clamp-2 text-[14px] leading-relaxed text-on-surface-variant">{ins.bio}</p>
      <div className="mt-auto flex items-center justify-between gap-3 border-t border-outline-variant pt-4">
        <p className="flex flex-shrink-0 items-baseline gap-1">
          <span className="font-display text-[22px] font-extrabold tracking-[-0.02em] text-ink">{ins.experienceYears}+</span>
          <span className="text-[13px] text-on-surface-variant">yrs experience</span>
        </p>
        <div className="flex flex-wrap justify-end gap-1.5 overflow-hidden">
          {ins.tags.slice(0, 2).map((t) => (
            <span key={t} className="whitespace-nowrap rounded-full bg-surface-container px-2.5 py-1 text-[12px] font-medium text-ink">
              {t}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}

function InstructorCarousel({ instructors, reverse }: { instructors: Instructor[]; reverse?: boolean }) {
  return (
    <Marquee speed={45} reverse={reverse} className="items-stretch gap-5 pb-6 pt-4">
      {instructors.map((ins) => (
        <InstructorCard key={ins.id} ins={ins} />
      ))}
    </Marquee>
  );
}

export function InstructorsSection() {
  const { data } = useCityFetch<Instructor[]>("/api/instructors", { leader: "0" });
  if (!data || data.length === 0) return null;

  return (
    <section id="instructors">
      <SectionHeader eyebrow="Faculty" title="Learn from people who do the work." />
      <InstructorCarousel instructors={data} />
    </section>
  );
}

export function IndustryLeadersSection() {
  const { data } = useCityFetch<Instructor[]>("/api/instructors", { leader: "1" });
  if (!data || data.length === 0) return null;

  return (
    <section id="leaders">
      <SectionHeader eyebrow="Mentorship" title="Industry leaders in your corner." />
      <InstructorCarousel instructors={data} reverse />
    </section>
  );
}

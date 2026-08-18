"use client";

import { useCityFetch } from "@/lib/useCityFetch";
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
    <article className="elevate-3d flex w-[380px] flex-shrink-0 flex-col bg-surface rounded border border-[#E0E0E0] hover:border-primary p-card-padding group">
      <div className="flex items-start gap-4 mb-3">
        <Avatar
          src={ins.photoUrl}
          name={ins.name}
          size={88}
          rounded="rounded"
          className="text-headline-md shadow-sm flex-shrink-0"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-headline-sm text-on-background leading-tight">{ins.name}</h3>
            {ins.linkedinUrl && (
              <a
                aria-label="LinkedIn Profile"
                className="text-secondary group-hover:text-primary transition-colors flex-shrink-0"
                href={ins.linkedinUrl}
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
          <p className="text-label-bold font-bold text-tertiary uppercase tracking-wider">{ins.subjectTaught}</p>
          {ins.city?.name && (
            <p className="text-body-sm text-on-surface-variant flex items-center gap-1 mt-0.5">
              <Icon name="location_on" size={14} className="text-secondary" />
              {ins.city.name}
            </p>
          )}
        </div>
      </div>
      <p className="text-body-sm text-secondary line-clamp-2 mb-3 editable-field">{ins.bio}</p>
      <div className="flex items-center justify-between gap-2 mt-auto">
        <p className="text-body-sm font-semibold text-on-surface-variant flex items-center gap-1 flex-shrink-0">
          <Icon name="workspace_premium" size={16} className="text-primary" />
          {ins.experienceYears}+ yrs
        </p>
        <div className="flex flex-wrap justify-end gap-1.5 overflow-hidden">
          {ins.tags.slice(0, 2).map((t) => (
            <span
              key={t}
              className="inline-block bg-surface-container-high text-on-surface-variant text-label-bold font-bold px-2 py-1 rounded border border-outline-variant whitespace-nowrap"
            >
              {t}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}

function InstructorCarousel({ instructors, reverse }: { instructors: Instructor[]; reverse?: boolean }) {
  const duration = `${Math.max(instructors.length * 6, 20)}s`;
  return (
    <div
      className="w-full overflow-hidden"
      style={{ maskImage: "linear-gradient(90deg, transparent, black 4%, black 96%, transparent)" }}
    >
      <div
        className={`flex w-max items-stretch gap-gutter py-2 ${reverse ? "marquee-track-reverse" : "marquee-track"}`}
        style={{ ["--marquee-duration" as string]: duration }}
      >
        {[...instructors, ...instructors].map((ins, i) => (
          <InstructorCard key={`${ins.id}-${i}`} ins={ins} />
        ))}
      </div>
    </div>
  );
}

export function InstructorsSection() {
  const { data } = useCityFetch<Instructor[]>("/api/instructors", { leader: "0" });
  if (!data || data.length === 0) return null;

  return (
    <section id="instructors">
      <SectionHeader eyebrow="Faculty" title="Meet Your Instructors" />
      <InstructorCarousel instructors={data} />
    </section>
  );
}

export function IndustryLeadersSection() {
  const { data } = useCityFetch<Instructor[]>("/api/instructors", { leader: "1" });
  if (!data || data.length === 0) return null;

  return (
    <section id="leaders">
      <SectionHeader eyebrow="Mentorship" title="Industry Leaders" />
      <InstructorCarousel instructors={data} reverse />
    </section>
  );
}

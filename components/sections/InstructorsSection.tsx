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

function InstructorGrid({ instructors }: { instructors: Instructor[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
      {instructors.map((ins) => (
        <article
          key={ins.id}
          className="elevate-3d bg-surface rounded border border-[#E0E0E0] hover:border-primary p-card-padding flex flex-col group"
        >
          <div className="flex justify-between items-start mb-4">
            <Avatar
              src={ins.photoUrl}
              name={ins.name}
              size={64}
              rounded="rounded"
              className="text-headline-sm shadow-sm"
            />
            {ins.linkedinUrl && (
              <a
                aria-label="LinkedIn Profile"
                className="text-secondary group-hover:text-primary transition-colors"
                href={ins.linkedinUrl}
                target="_blank"
                rel="noreferrer"
              >
                <svg aria-hidden="true" className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"
                  />
                </svg>
              </a>
            )}
          </div>
          <h3 className="text-headline-sm text-on-background mb-1">{ins.name}</h3>
          <p className="text-label-bold font-bold text-tertiary mb-1 uppercase tracking-wider">
            {ins.subjectTaught}
          </p>
          {ins.city?.name && (
            <p className="text-body-sm text-on-surface-variant mb-3 flex items-center gap-1">
              <Icon name="location_on" size={14} className="text-secondary" />
              {ins.city.name}
            </p>
          )}
          <p className="text-body-sm text-secondary line-clamp-2 mb-4 flex-grow editable-field">{ins.bio}</p>
          <p className="text-body-sm font-semibold text-on-surface-variant mb-3 flex items-center gap-1">
            <Icon name="workspace_premium" size={16} className="text-primary" />
            {ins.experienceYears}+ years experience
          </p>
          <div className="flex flex-wrap gap-2 mt-auto">
            {ins.tags.map((t) => (
              <span
                key={t}
                className="inline-block bg-surface-container-high text-on-surface-variant text-label-bold font-bold px-2 py-1 rounded border border-outline-variant"
              >
                {t}
              </span>
            ))}
          </div>
        </article>
      ))}
    </div>
  );
}

export function InstructorsSection() {
  const { data } = useCityFetch<Instructor[]>("/api/instructors", { leader: "0" });
  if (!data || data.length === 0) return null;

  return (
    <section id="instructors">
      <SectionHeader eyebrow="Faculty" title="Meet Your Instructors" />
      <InstructorGrid instructors={data} />
    </section>
  );
}

export function IndustryLeadersSection() {
  const { data } = useCityFetch<Instructor[]>("/api/instructors", { leader: "1" });
  if (!data || data.length === 0) return null;

  return (
    <section id="leaders">
      <SectionHeader eyebrow="Mentorship" title="Industry Leaders" />
      <InstructorGrid instructors={data} />
    </section>
  );
}

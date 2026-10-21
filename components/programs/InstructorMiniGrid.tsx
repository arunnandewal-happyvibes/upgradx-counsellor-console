import { Avatar } from "@/components/ui/Avatar";

type Instructor = {
  id: string;
  name: string;
  subjectTaught: string;
  bio: string;
  experienceYears: number;
  tags: string[];
  linkedinUrl: string | null;
  photoUrl?: string | null;
};

export function InstructorMiniGrid({ instructors }: { instructors: Instructor[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {instructors.map((ins) => (
        <article key={ins.id} className="card-red-3d flex flex-col gap-4 rounded-[24px] border border-outline-variant bg-white p-6">
          <div className="flex items-center gap-3.5">
            <Avatar src={ins.photoUrl} name={ins.name} size={56} rounded="rounded-2xl" />
            <div className="min-w-0">
              <div className="font-display text-[18px] font-bold text-ink">{ins.name}</div>
              <div className="text-[12px] font-bold uppercase tracking-[0.12em] text-primary">{ins.subjectTaught}</div>
            </div>
          </div>
          <p className="editable-field line-clamp-2 text-[14px] leading-relaxed text-on-surface-variant">{ins.bio}</p>
          <div className="mt-auto flex flex-wrap gap-1.5">
            {ins.tags.map((t) => (
              <span key={t} className="rounded-full bg-surface-container px-2.5 py-1 text-[12px] font-medium text-ink">
                {t}
              </span>
            ))}
          </div>
        </article>
      ))}
    </div>
  );
}

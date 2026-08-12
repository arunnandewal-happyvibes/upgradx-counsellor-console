import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

type Instructor = {
  id: string;
  name: string;
  subjectTaught: string;
  bio: string;
  experienceYears: number;
  tags: string[];
  linkedinUrl: string | null;
};

export function InstructorMiniGrid({ instructors }: { instructors: Instructor[] }) {
  return (
    <div className="grid grid-cols-1 gap-gutter sm:grid-cols-3">
      {instructors.map((ins) => (
        <Card key={ins.id} className="p-card-padding">
          <div className="mb-2 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded bg-on-surface text-body-sm font-bold text-white">
              {ins.name.charAt(0)}
            </div>
            <div>
              <div className="text-body-md font-bold text-on-surface">{ins.name}</div>
              <div className="text-body-sm text-secondary">{ins.subjectTaught}</div>
            </div>
          </div>
          <p className="mb-2 line-clamp-2 text-body-sm text-on-surface-variant editable-field">{ins.bio}</p>
          <div className="flex flex-wrap gap-1">
            {ins.tags.map((t) => (
              <Badge key={t}>{t}</Badge>
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
}

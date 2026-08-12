import { Field, inputClass } from "@/components/admin/AdminUI";
import { Button } from "@/components/ui/Button";

type Program = {
  name: string;
  duration: string;
  mode: string;
  category: string;
  description: string;
  bullets: string[];
  certifications: { name: string; partnerInstitution: string; brochureUrl: string }[];
  curriculumModules: { title: string; content: string }[];
};

export function ProgramForm({
  action,
  initial,
}: {
  action: (formData: FormData) => void;
  initial?: Program;
}) {
  return (
    <form action={action} className="max-w-2xl space-y-4">
      <Field label="Program name">
        <input required name="name" defaultValue={initial?.name} className={inputClass} />
      </Field>
      <div className="grid grid-cols-3 gap-4">
        <Field label="Duration">
          <input required name="duration" defaultValue={initial?.duration ?? "6 months"} className={inputClass} />
        </Field>
        <Field label="Mode">
          <select name="mode" defaultValue={initial?.mode ?? "Offline"} className={inputClass}>
            <option>Offline</option>
            <option>Online</option>
          </select>
        </Field>
        <Field label="Category">
          <input required name="category" defaultValue={initial?.category} className={inputClass} />
        </Field>
      </div>
      <Field label="Description">
        <textarea required name="description" defaultValue={initial?.description} rows={3} className={inputClass} />
      </Field>
      <Field label="What it covers" hint="One bullet per line">
        <textarea
          name="bullets"
          defaultValue={initial?.bullets.join("\n")}
          rows={4}
          className={inputClass}
        />
      </Field>
      <Field label="Certifications" hint="One per line: Certification Name | Partner Institution | Brochure URL">
        <textarea
          name="certifications"
          defaultValue={initial?.certifications.map((c) => `${c.name} | ${c.partnerInstitution} | ${c.brochureUrl}`).join("\n")}
          rows={3}
          className={inputClass}
          placeholder="AI/ML Certification | IIIT Bangalore | /brochures/ds.pdf"
        />
      </Field>
      <Field label="Curriculum modules" hint="One per line: Title | Content">
        <textarea
          name="modules"
          defaultValue={initial?.curriculumModules.map((m) => `${m.title} | ${m.content}`).join("\n")}
          rows={5}
          className={inputClass}
          placeholder="Python Foundations | Hands-on lessons covering..."
        />
      </Field>
      <Button type="submit">Save Program</Button>
    </form>
  );
}

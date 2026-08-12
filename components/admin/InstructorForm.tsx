import { Field, inputClass } from "@/components/admin/AdminUI";
import { Button } from "@/components/ui/Button";
import { ImageField } from "@/components/admin/ImageField";

type City = { id: string; name: string };
type Instructor = {
  name: string;
  linkedinUrl: string | null;
  subjectTaught: string;
  bio: string;
  experienceYears: number;
  tags: string[];
  cityId: string;
  photoUrl?: string | null;
};

export function InstructorForm({
  action,
  cities,
  initial,
}: {
  action: (formData: FormData) => void;
  cities: City[];
  initial?: Instructor;
}) {
  return (
    <form action={action} className="max-w-xl space-y-4">
      <ImageField label="Headshot" urlName="photoUrl" fileName="photoFile" defaultUrl={initial?.photoUrl} />
      <Field label="Name">
        <input required name="name" defaultValue={initial?.name} className={inputClass} />
      </Field>
      <Field label="LinkedIn URL">
        <input name="linkedinUrl" defaultValue={initial?.linkedinUrl ?? ""} className={inputClass} />
      </Field>
      <Field label="Subject taught">
        <input required name="subjectTaught" defaultValue={initial?.subjectTaught} className={inputClass} placeholder="e.g. Data Science Instructor" />
      </Field>
      <Field label="Bio (2 lines)">
        <textarea required name="bio" defaultValue={initial?.bio} rows={2} className={inputClass} />
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Years of experience">
          <input required type="number" min={0} name="experienceYears" defaultValue={initial?.experienceYears} className={inputClass} />
        </Field>
        <Field label="City">
          <select required name="cityId" defaultValue={initial?.cityId} className={inputClass}>
            {cities.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <Field label="Credibility tags" hint="One per line, e.g. Ex-Microsoft">
        <textarea name="tags" defaultValue={initial?.tags.join("\n")} rows={3} className={inputClass} />
      </Field>
      <Button type="submit">Save Instructor</Button>
    </form>
  );
}

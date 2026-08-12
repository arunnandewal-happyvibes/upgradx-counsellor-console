import { Field, inputClass } from "@/components/admin/AdminUI";
import { Button } from "@/components/ui/Button";

type Option = { id: string; name: string };
type Drive = { company: string; role: string; cityId: string; date: Date };

export function DriveForm({
  action,
  cities,
  initial,
}: {
  action: (formData: FormData) => void;
  cities: Option[];
  initial?: Drive;
}) {
  return (
    <form action={action} className="max-w-xl space-y-4">
      <Field label="Company">
        <input required name="company" defaultValue={initial?.company} className={inputClass} />
      </Field>
      <Field label="Role">
        <input required name="role" defaultValue={initial?.role} className={inputClass} />
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
      <Field label="Date">
        <input required type="date" name="date" defaultValue={initial ? initial.date.toISOString().slice(0, 10) : ""} className={inputClass} />
      </Field>
      <Button type="submit">Save Drive</Button>
    </form>
  );
}

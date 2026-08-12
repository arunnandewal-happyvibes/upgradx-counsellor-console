import { Field, inputClass } from "@/components/admin/AdminUI";
import { Button } from "@/components/ui/Button";

type Option = { id: string; name: string };
type Batch = {
  programId: string;
  cityId: string;
  startDate: Date;
  applicationCloseDate: Date;
  timing: string;
  location: string;
};

function toInputDate(d?: Date) {
  return d ? d.toISOString().slice(0, 10) : "";
}

export function BatchForm({
  action,
  programs,
  cities,
  initial,
}: {
  action: (formData: FormData) => void;
  programs: Option[];
  cities: Option[];
  initial?: Batch;
}) {
  return (
    <form action={action} className="max-w-xl space-y-4">
      <Field label="Program">
        <select required name="programId" defaultValue={initial?.programId} className={inputClass}>
          {programs.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
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
      <div className="grid grid-cols-2 gap-4">
        <Field label="Start date">
          <input required type="date" name="startDate" defaultValue={toInputDate(initial?.startDate)} className={inputClass} />
        </Field>
        <Field label="Application closes">
          <input required type="date" name="applicationCloseDate" defaultValue={toInputDate(initial?.applicationCloseDate)} className={inputClass} />
        </Field>
      </div>
      <Field label="Timing">
        <input required name="timing" defaultValue={initial?.timing ?? "Mon–Fri, 6:00 PM – 9:00 PM"} className={inputClass} />
      </Field>
      <Field label="Location">
        <input required name="location" defaultValue={initial?.location} className={inputClass} />
      </Field>
      <Button type="submit">Save Batch</Button>
    </form>
  );
}

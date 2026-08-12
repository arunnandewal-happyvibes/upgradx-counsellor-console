import { Field, inputClass } from "@/components/admin/AdminUI";
import { Button } from "@/components/ui/Button";

type Story = {
  studentName: string;
  courseName: string;
  roleLanded: string;
  company: string;
  description: string;
  packageLabel: string;
};

export function StoryForm({
  action,
  initial,
}: {
  action: (formData: FormData) => void;
  initial?: Story;
}) {
  return (
    <form action={action} className="max-w-xl space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Field label="Student name">
          <input required name="studentName" defaultValue={initial?.studentName} className={inputClass} />
        </Field>
        <Field label="Course enrolled">
          <input required name="courseName" defaultValue={initial?.courseName} className={inputClass} />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Role landed">
          <input required name="roleLanded" defaultValue={initial?.roleLanded} className={inputClass} />
        </Field>
        <Field label="Company">
          <input required name="company" defaultValue={initial?.company} className={inputClass} />
        </Field>
      </div>
      <Field label="Description (2-3 lines)">
        <textarea required name="description" defaultValue={initial?.description} rows={3} className={inputClass} />
      </Field>
      <Field label="Package label" hint='e.g. "Accountant to ₹12 LPA"'>
        <input required name="packageLabel" defaultValue={initial?.packageLabel} className={inputClass} />
      </Field>
      <Button type="submit">Save Story</Button>
    </form>
  );
}

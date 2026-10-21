import { Field, inputClass } from "@/components/admin/AdminUI";
import { Button } from "@/components/ui/Button";
import { CENTRES } from "@/lib/centres";

type Counsellor = { name: string; email: string; centre: string; active: boolean };

export function CounsellorForm({
  action,
  initial,
  submitLabel = "Save counsellor",
}: {
  action: (formData: FormData) => void;
  initial?: Counsellor;
  submitLabel?: string;
}) {
  return (
    <form action={action} className="max-w-xl space-y-4">
      <Field label="Name">
        <input required minLength={2} name="name" defaultValue={initial?.name} className={inputClass} placeholder="e.g. Priya Sharma" />
      </Field>
      <Field
        label="LSQ login email"
        hint={
          <>
            Must be the counsellor&apos;s <strong>LeadSquared login</strong> (an active Learning Centre LSQ user), not a
            personal address. Leads are assigned to this email — a wrong or ex-employee address sends leads out of LC.
          </>
        }
      >
        <input required type="email" name="email" defaultValue={initial?.email} className={inputClass} placeholder="e.g. jaipur.ac2@upgrad.com" />
      </Field>
      <Field label="Centre" hint="Pre-fills the Centre on their Close Session form.">
        <select required name="centre" defaultValue={initial?.centre ?? ""} className={inputClass}>
          <option value="" disabled>
            — Select a centre —
          </option>
          {CENTRES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
              {c.hasRule ? "" : " (no LSQ rule yet)"}
            </option>
          ))}
        </select>
      </Field>
      <label className="flex items-center gap-2.5 text-[14px] font-medium text-ink">
        <input type="checkbox" name="active" defaultChecked={initial?.active ?? true} className="h-5 w-5 accent-primary" />
        Active (can check in and own leads)
      </label>
      <Button type="submit">{submitLabel}</Button>
    </form>
  );
}

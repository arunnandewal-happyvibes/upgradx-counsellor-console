import { Field, inputClass } from "@/components/admin/AdminUI";
import { Button } from "@/components/ui/Button";
import { FileField } from "@/components/admin/FileField";
import {
  ADD_ON_DESCRIPTION_MAX,
  ADD_ON_DESCRIPTION_MIN,
  ADD_ON_DESCRIPTION_PLACEHOLDER,
} from "@/lib/addOnCertificate";

type AddOnCertificate = {
  name: string;
  pdfUrl?: string | null;
  description?: string | null;
  programs: { id: string }[];
};

type Program = { id: string; name: string };

export function AddOnCertificateForm({
  action,
  programs,
  initial,
}: {
  action: (formData: FormData) => void;
  programs: Program[];
  initial?: AddOnCertificate;
}) {
  const selectedIds = new Set(initial?.programs.map((p) => p.id) ?? []);

  return (
    <form action={action} className="max-w-xl space-y-4">
      <Field label="Certificate name" hint='e.g. "Advanced Excel Specialist — Microsoft"'>
        <input required name="name" defaultValue={initial?.name} className={inputClass} />
      </Field>
      <FileField
        label="Certificate PDF"
        urlName="pdfUrl"
        fileName="pdfFile"
        defaultUrl={initial?.pdfUrl}
        hint="A sample of this add-on certificate — opens in a new tab wherever it's shown."
      />
      <Field label="Description (required)" hint="2-3 lines on the additional masterclasses or projects this certificate adds. Shown to the counsellor and student with the certificate.">
        <textarea
          required
          name="description"
          rows={3}
          minLength={ADD_ON_DESCRIPTION_MIN}
          maxLength={ADD_ON_DESCRIPTION_MAX}
          defaultValue={initial?.description ?? ""}
          placeholder={ADD_ON_DESCRIPTION_PLACEHOLDER}
          className={inputClass}
        />
      </Field>
      <Field label="Eligible programs" hint="Select every program a student can earn this certificate through.">
        <div className="max-h-64 space-y-2 overflow-y-auto rounded-2xl border border-outline-variant p-3">
          {programs.map((p) => (
            <label key={p.id} className="flex items-center gap-2 text-sm text-brand-ink2">
              <input
                type="checkbox"
                name="programIds"
                value={p.id}
                defaultChecked={selectedIds.has(p.id)}
                className="h-4 w-4 rounded border-brand-gray-300 text-brand-red focus:ring-brand-red"
              />
              {p.name}
            </label>
          ))}
        </div>
      </Field>
      <Button type="submit">Save Certificate</Button>
    </form>
  );
}

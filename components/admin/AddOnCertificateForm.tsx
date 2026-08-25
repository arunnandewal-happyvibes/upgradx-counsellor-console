import { Field, inputClass } from "@/components/admin/AdminUI";
import { Button } from "@/components/ui/Button";
import { FileField } from "@/components/admin/FileField";

type AddOnCertificate = {
  name: string;
  pdfUrl?: string | null;
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
      <Field label="Eligible programs" hint="Select every program a student can earn this certificate through.">
        <div className="max-h-64 space-y-2 overflow-y-auto rounded-lg border border-brand-gray-200 p-3">
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

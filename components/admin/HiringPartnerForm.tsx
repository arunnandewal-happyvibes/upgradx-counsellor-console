import { Field, inputClass } from "@/components/admin/AdminUI";
import { Button } from "@/components/ui/Button";
import { ImageField } from "@/components/admin/ImageField";

type Partner = { name: string; logoUrl?: string | null };

export function HiringPartnerForm({
  action,
  initial,
}: {
  action: (formData: FormData) => void;
  initial?: Partner;
}) {
  return (
    <form action={action} className="max-w-xl space-y-4">
      <ImageField
        label="Company logo"
        urlName="logoUrl"
        fileName="logoFile"
        defaultUrl={initial?.logoUrl}
        placeholderIcon="domain"
      />
      <Field label="Company name">
        <input required name="name" defaultValue={initial?.name} className={inputClass} placeholder="e.g. Amazon" />
      </Field>
      <Button type="submit">Save Company</Button>
    </form>
  );
}

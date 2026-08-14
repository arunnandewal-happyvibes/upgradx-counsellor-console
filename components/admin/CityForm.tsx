import { Field, inputClass } from "@/components/admin/AdminUI";
import { Button } from "@/components/ui/Button";
import { ImageField } from "@/components/admin/ImageField";

type City = { name: string; monumentImageUrl?: string | null };

export function CityForm({
  action,
  initial,
}: {
  action: (formData: FormData) => void;
  initial?: City;
}) {
  return (
    <form action={action} className="max-w-xl space-y-4">
      <Field label="City name">
        <input required name="name" defaultValue={initial?.name} className={inputClass} placeholder="e.g. Chennai" />
      </Field>
      <ImageField
        label="Monument photo"
        urlName="monumentImageUrl"
        fileName="monumentFile"
        defaultUrl={initial?.monumentImageUrl}
        rounded="rounded-lg"
        placeholderIcon="location_city"
      />
      <Button type="submit">Save City</Button>
    </form>
  );
}

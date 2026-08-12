import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { Field, inputClass } from "@/components/admin/AdminUI";
import { Button } from "@/components/ui/Button";
import { upsertCityContact } from "@/app/admin/city-contacts/actions";

export default async function CityContactsAdminPage() {
  const cities = await prisma.city.findMany({
    orderBy: { name: "asc" },
    include: { contact: true },
  });

  return (
    <div>
      <h1 className="mb-1 text-2xl font-extrabold text-brand-ink">City Contacts</h1>
      <p className="mb-6 text-sm text-brand-ink2">
        Shown on the Contact page for the currently selected city.
      </p>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {cities.map((city) => (
          <Card key={city.id} className="p-4">
            <h2 className="mb-3 text-base font-bold text-brand-ink">{city.name}</h2>
            <form action={upsertCityContact.bind(null, city.id)} className="space-y-3">
              <Field label="Address">
                <textarea name="address" defaultValue={city.contact?.address} rows={2} className={inputClass} />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Phone">
                  <input name="phone" defaultValue={city.contact?.phone} className={inputClass} />
                </Field>
                <Field label="Email">
                  <input name="email" defaultValue={city.contact?.email} className={inputClass} />
                </Field>
              </div>
              <Button type="submit" variant="secondary">
                Save
              </Button>
            </form>
          </Card>
        ))}
      </div>
    </div>
  );
}

import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { Field, inputClass } from "@/components/admin/AdminUI";
import { Button } from "@/components/ui/Button";
import { updateJourneyStep } from "@/app/admin/journey-steps/actions";

export default async function JourneyStepsAdminPage() {
  const steps = await prisma.journeyStep.findMany({ orderBy: { order: "asc" } });

  return (
    <div>
      <h1 className="mb-1 text-2xl font-extrabold text-brand-ink">How Learning Works — Journey Steps</h1>
      <p className="mb-6 text-sm text-brand-ink2">
        The 4-step pitch shown on the console. Copy here is CMS-editable per counsellor group.
      </p>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {steps.map((s) => (
          <Card key={s.id} className="p-4">
            <h2 className="mb-3 text-sm font-bold text-brand-red">Step {s.order}</h2>
            <form action={updateJourneyStep.bind(null, s.order)} className="space-y-3">
              <Field label="Title">
                <input required name="title" defaultValue={s.title} className={inputClass} />
              </Field>
              <Field label="Description">
                <textarea required name="description" defaultValue={s.description} rows={3} className={inputClass} />
              </Field>
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

import { prisma } from "@/lib/prisma";
import { Field, inputClass } from "@/components/admin/AdminUI";
import { Button } from "@/components/ui/Button";
import { updateHomeScreenSettings } from "./actions";

export const dynamic = "force-dynamic";

const DEFAULTS = {
  headline: "can transform your journey",
  subheadline:
    "Offline, mentor-led programs built with hiring partners — from classroom to career, in one connected track.",
  primaryCtaLabel: "Explore Programs",
  secondaryCtaLabel: "Book Counselling",
  placementRecordPercent: "85%",
  placementRecordCaption: "Avg. successful transitions within 6 months",
  careerGrowthCaption: "Tailored pathways for senior roles.",
};

export default async function HomeScreenAdminPage() {
  const settings = await prisma.homeScreenSettings.findFirst();
  const s = settings ?? DEFAULTS;

  return (
    <div>
      <h1 className="mb-1 text-2xl font-extrabold text-brand-ink">Home Screen (Default)</h1>
      <p className="mb-6 text-sm text-brand-ink2">
        Shown on the console hero when a student skips onboarding (no name/degree/skills to
        personalize recommendations for). Once a student completes onboarding, they see
        personalized program recommendations instead — that content is edited at{" "}
        <a href="/admin/recommendations" className="text-brand-red hover:underline">
          Recommendations
        </a>
        .
      </p>

      <form action={updateHomeScreenSettings} className="max-w-xl space-y-4">
        <Field label="Headline" hint='Shown after a fixed red "upGrad X" — e.g. "can transform your journey"'>
          <input required name="headline" defaultValue={s.headline} className={inputClass} />
        </Field>
        <Field label="Subheadline">
          <textarea required name="subheadline" defaultValue={s.subheadline} rows={2} className={inputClass} />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Primary button label">
            <input required name="primaryCtaLabel" defaultValue={s.primaryCtaLabel} className={inputClass} />
          </Field>
          <Field label="Secondary button label">
            <input required name="secondaryCtaLabel" defaultValue={s.secondaryCtaLabel} className={inputClass} />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Placement record %">
            <input required name="placementRecordPercent" defaultValue={s.placementRecordPercent} className={inputClass} />
          </Field>
          <Field label="Placement record caption">
            <input required name="placementRecordCaption" defaultValue={s.placementRecordCaption} className={inputClass} />
          </Field>
        </div>
        <Field label="Career growth caption">
          <input required name="careerGrowthCaption" defaultValue={s.careerGrowthCaption} className={inputClass} />
        </Field>
        <p className="text-xs text-brand-gray-400">
          Highest CTC is computed automatically from Success Stories and isn't editable here.
        </p>
        <Button type="submit">Save</Button>
      </form>
    </div>
  );
}

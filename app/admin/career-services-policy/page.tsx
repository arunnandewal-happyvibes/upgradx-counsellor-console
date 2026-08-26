import { prisma } from "@/lib/prisma";
import { Field, inputClass } from "@/components/admin/AdminUI";
import { Button } from "@/components/ui/Button";
import { updateCareerServicesPolicy } from "./actions";

export const dynamic = "force-dynamic";

const DEFAULT_BODY = `## 1. OBJECTIVE
Describe the purpose of this policy here.

- Add bullet points like this
- Another point

### A Sub-heading

**A standalone bold label**
`;

export default async function CareerServicesPolicyAdminPage() {
  const policy = await prisma.careerServicesPolicy.findFirst();

  return (
    <div>
      <h1 className="mb-1 text-2xl font-extrabold text-brand-ink">Career Services &amp; Placement Assistance Policy</h1>
      <p className="mb-6 text-sm text-brand-ink2">
        Edits the single public policy page linked from every program page. Formatting in the body
        uses a light markup: <code className="rounded bg-brand-gray-100 px-1">## </code> for a
        section heading, <code className="rounded bg-brand-gray-100 px-1">### </code> for a
        sub-heading, <code className="rounded bg-brand-gray-100 px-1">**text**</code> alone on a
        line for a bold label, <code className="rounded bg-brand-gray-100 px-1">- </code> for a
        bullet point, and any other line is a plain paragraph. Blank lines are just for
        readability and are ignored.
      </p>

      <form action={updateCareerServicesPolicy} className="max-w-3xl space-y-4">
        <Field label="Page title">
          <input
            required
            name="title"
            defaultValue={policy?.title ?? "Career Services & Placement Assistance Policy"}
            className={inputClass}
          />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Version">
            <input required name="version" defaultValue={policy?.version ?? "Version 1.0"} className={inputClass} />
          </Field>
          <Field label="Effective date">
            <input
              required
              name="effectiveDate"
              defaultValue={policy?.effectiveDate ?? "Effective Date: [DD/MM/YYYY]"}
              className={inputClass}
            />
          </Field>
        </div>
        <Field label="Policy body">
          <textarea
            required
            name="body"
            defaultValue={policy?.body ?? DEFAULT_BODY}
            rows={28}
            className={`${inputClass} font-mono text-xs leading-relaxed`}
          />
        </Field>
        <Button type="submit">Save Policy</Button>
      </form>
    </div>
  );
}

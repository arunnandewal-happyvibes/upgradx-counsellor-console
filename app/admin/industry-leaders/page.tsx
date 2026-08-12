import { prisma } from "@/lib/prisma";
import { InstructorList } from "@/components/admin/InstructorList";
import { InstructorForm } from "@/components/admin/InstructorForm";
import { createInstructor } from "@/app/admin/instructors/actions";

export default async function IndustryLeadersAdminPage() {
  const [leaders, cities] = await Promise.all([
    prisma.instructor.findMany({ where: { isIndustryLeader: true }, orderBy: { order: "asc" }, include: { city: true } }),
    prisma.city.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div>
      <h1 className="mb-1 text-2xl font-extrabold text-brand-ink">Industry Leaders</h1>
      <p className="mb-6 text-sm text-brand-ink2">
        Shown on program pages only where the "industry-leaders" section is enabled — see{" "}
        <a href="/admin/section-visibility" className="text-brand-red hover:underline">
          Section Visibility
        </a>
        .
      </p>

      <InstructorList instructors={leaders} basePath="/admin/industry-leaders" isIndustryLeader={true} />

      <h2 className="mb-4 mt-10 text-lg font-bold text-brand-ink">Add Industry Leader</h2>
      <InstructorForm action={createInstructor.bind(null, true)} cities={cities} />
    </div>
  );
}

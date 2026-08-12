import { prisma } from "@/lib/prisma";
import { InstructorList } from "@/components/admin/InstructorList";
import { InstructorForm } from "@/components/admin/InstructorForm";
import { createInstructor } from "@/app/admin/instructors/actions";

export default async function InstructorsAdminPage() {
  const [instructors, cities] = await Promise.all([
    prisma.instructor.findMany({ where: { isIndustryLeader: false }, orderBy: { order: "asc" }, include: { city: true } }),
    prisma.city.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div>
      <h1 className="mb-1 text-2xl font-extrabold text-brand-ink">Instructors</h1>
      <p className="mb-6 text-sm text-brand-ink2">
        Only a curated subset should be shown publicly — target 2–3 per city.
      </p>

      <InstructorList instructors={instructors} basePath="/admin/instructors" isIndustryLeader={false} />

      <h2 className="mb-4 mt-10 text-lg font-bold text-brand-ink">Add Instructor</h2>
      <InstructorForm action={createInstructor.bind(null, false)} cities={cities} />
    </div>
  );
}

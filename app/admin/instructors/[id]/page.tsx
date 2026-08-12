import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { InstructorForm } from "@/components/admin/InstructorForm";
import { updateInstructor } from "@/app/admin/instructors/actions";

export default async function EditInstructorPage({ params }: { params: { id: string } }) {
  const [instructor, cities] = await Promise.all([
    prisma.instructor.findUnique({ where: { id: params.id } }),
    prisma.city.findMany({ orderBy: { name: "asc" } }),
  ]);
  if (!instructor) notFound();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-extrabold text-brand-ink">Edit — {instructor.name}</h1>
      <InstructorForm
        action={updateInstructor.bind(null, instructor.id, instructor.isIndustryLeader)}
        cities={cities}
        initial={instructor}
      />
    </div>
  );
}

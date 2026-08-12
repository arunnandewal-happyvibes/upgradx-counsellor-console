import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProgramForm } from "@/components/admin/ProgramForm";
import { updateProgram } from "@/app/admin/courses/actions";

export default async function EditCoursePage({ params }: { params: { id: string } }) {
  const program = await prisma.program.findUnique({
    where: { id: params.id },
    include: { certifications: true, curriculumModules: { orderBy: { order: "asc" } } },
  });
  if (!program) notFound();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-extrabold text-brand-ink">Edit — {program.name}</h1>
      <ProgramForm action={updateProgram.bind(null, program.id)} initial={program} />
    </div>
  );
}

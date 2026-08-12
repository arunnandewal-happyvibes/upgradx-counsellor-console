import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Table, Th, Td } from "@/components/admin/AdminUI";
import { ProgramForm } from "@/components/admin/ProgramForm";
import { Button } from "@/components/ui/Button";
import { createProgram, deleteProgram } from "@/app/admin/courses/actions";

export default async function CoursesAdminPage() {
  const programs = await prisma.program.findMany({
    orderBy: { order: "asc" },
    include: { certifications: true },
  });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-extrabold text-brand-ink">Courses</h1>

      <Table>
        <thead>
          <tr>
            <Th>Name</Th>
            <Th>Duration</Th>
            <Th>Mode</Th>
            <Th>Certifications</Th>
            <Th></Th>
          </tr>
        </thead>
        <tbody>
          {programs.map((p) => (
            <tr key={p.id} className="border-t border-brand-gray-100">
              <Td className="font-semibold text-brand-ink">{p.name}</Td>
              <Td>{p.duration}</Td>
              <Td>{p.mode}</Td>
              <Td>{p.certifications.map((c) => c.partnerInstitution).join(", ")}</Td>
              <Td>
                <div className="flex gap-2">
                  <Link href={`/admin/courses/${p.id}`} className="text-sm font-semibold text-brand-red hover:underline">
                    Edit
                  </Link>
                  <form action={deleteProgram.bind(null, p.id)}>
                    <button className="text-sm font-semibold text-brand-gray-400 hover:text-brand-red">Delete</button>
                  </form>
                </div>
              </Td>
            </tr>
          ))}
        </tbody>
      </Table>

      <h2 className="mb-4 mt-10 text-lg font-bold text-brand-ink">Add Course</h2>
      <ProgramForm action={createProgram} />
    </div>
  );
}

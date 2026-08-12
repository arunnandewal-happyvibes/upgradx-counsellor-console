import Link from "next/link";
import { Table, Th, Td } from "@/components/admin/AdminUI";
import { deleteInstructor } from "@/app/admin/instructors/actions";

type Instructor = {
  id: string;
  name: string;
  subjectTaught: string;
  experienceYears: number;
  city: { name: string };
  tags: string[];
};

export function InstructorList({
  instructors,
  basePath,
  isIndustryLeader,
}: {
  instructors: Instructor[];
  basePath: string;
  isIndustryLeader: boolean;
}) {
  return (
    <Table>
      <thead>
        <tr>
          <Th>Name</Th>
          <Th>Subject</Th>
          <Th>City</Th>
          <Th>Experience</Th>
          <Th>Tags</Th>
          <Th></Th>
        </tr>
      </thead>
      <tbody>
        {instructors.map((ins) => (
          <tr key={ins.id} className="border-t border-brand-gray-100">
            <Td className="font-semibold text-brand-ink">{ins.name}</Td>
            <Td>{ins.subjectTaught}</Td>
            <Td>{ins.city.name}</Td>
            <Td>{ins.experienceYears} yrs</Td>
            <Td>{ins.tags.join(", ")}</Td>
            <Td>
              <div className="flex gap-2">
                <Link href={`${basePath}/${ins.id}`} className="text-sm font-semibold text-brand-red hover:underline">
                  Edit
                </Link>
                <form action={deleteInstructor.bind(null, ins.id, isIndustryLeader)}>
                  <button className="text-sm font-semibold text-brand-gray-400 hover:text-brand-red">Delete</button>
                </form>
              </div>
            </Td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}

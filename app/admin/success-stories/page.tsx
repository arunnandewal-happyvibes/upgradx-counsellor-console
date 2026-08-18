import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Table, Th, Td } from "@/components/admin/AdminUI";
import { StoryForm } from "@/components/admin/StoryForm";
import { createStory, deleteStory } from "@/app/admin/success-stories/actions";

export default async function SuccessStoriesAdminPage() {
  const stories = await prisma.successStory.findMany({ orderBy: { order: "asc" } });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-extrabold text-brand-ink">Success Stories</h1>

      <Table>
        <thead>
          <tr>
            <Th>Student</Th>
            <Th>Course</Th>
            <Th>Role</Th>
            <Th>Company</Th>
            <Th>Package</Th>
            <Th>LinkedIn</Th>
            <Th></Th>
          </tr>
        </thead>
        <tbody>
          {stories.map((s) => (
            <tr key={s.id} className="border-t border-brand-gray-100">
              <Td className="font-semibold text-brand-ink">{s.studentName}</Td>
              <Td>{s.courseName}</Td>
              <Td>{s.roleLanded}</Td>
              <Td>{s.company}</Td>
              <Td className="font-semibold text-brand-red">{s.packageLabel}</Td>
              <Td>
                {s.linkedinUrl ? (
                  <a
                    href={s.linkedinUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm font-semibold text-brand-red hover:underline"
                  >
                    Open profile ↗
                  </a>
                ) : (
                  <span className="text-sm text-brand-gray-400">—</span>
                )}
              </Td>
              <Td>
                <div className="flex gap-2">
                  <Link href={`/admin/success-stories/${s.id}`} className="text-sm font-semibold text-brand-red hover:underline">
                    Edit
                  </Link>
                  <form action={deleteStory.bind(null, s.id)}>
                    <button className="text-sm font-semibold text-brand-gray-400 hover:text-brand-red">Delete</button>
                  </form>
                </div>
              </Td>
            </tr>
          ))}
        </tbody>
      </Table>

      <h2 className="mb-4 mt-10 text-lg font-bold text-brand-ink">Add Story</h2>
      <StoryForm action={createStory} />
    </div>
  );
}

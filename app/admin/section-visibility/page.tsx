import { prisma } from "@/lib/prisma";
import { Table, Th, Td } from "@/components/admin/AdminUI";
import { isSectionVisible } from "@/lib/section-visibility";
import { setSectionVisibility } from "@/app/admin/section-visibility/actions";

const SECTION_KEY = "industry-leaders";

export default async function SectionVisibilityAdminPage() {
  const programs = await prisma.program.findMany({ orderBy: { order: "asc" } });
  const rows = await Promise.all(
    programs.map(async (p) => ({ program: p, visible: await isSectionVisible(SECTION_KEY, p.id) })),
  );

  return (
    <div>
      <h1 className="mb-1 text-2xl font-extrabold text-brand-ink">Section Visibility</h1>
      <p className="mb-6 text-sm text-brand-ink2">
        Reusable per-program toggle. Currently controls the "Industry Leaders" section on each program's detail page.
      </p>

      <Table>
        <thead>
          <tr>
            <Th>Program</Th>
            <Th>Industry Leaders section</Th>
            <Th></Th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ program, visible }) => (
            <tr key={program.id} className="border-t border-brand-gray-100">
              <Td className="font-semibold text-brand-ink">{program.name}</Td>
              <Td>{visible ? "Visible" : "Hidden"}</Td>
              <Td>
                <form action={setSectionVisibility.bind(null, SECTION_KEY, program.id, !visible)}>
                  <button className="text-sm font-semibold text-brand-red hover:underline">
                    {visible ? "Hide" : "Show"}
                  </button>
                </form>
              </Td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}

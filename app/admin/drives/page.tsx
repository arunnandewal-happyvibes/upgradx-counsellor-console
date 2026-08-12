import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Table, Th, Td } from "@/components/admin/AdminUI";
import { DriveForm } from "@/components/admin/DriveForm";
import { createDrive, deleteDrive } from "@/app/admin/drives/actions";

export default async function DrivesAdminPage() {
  const [drives, cities] = await Promise.all([
    prisma.placementDrive.findMany({ orderBy: { date: "asc" }, include: { city: true } }),
    prisma.city.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-extrabold text-brand-ink">Placement Drives</h1>

      <Table>
        <thead>
          <tr>
            <Th>Company</Th>
            <Th>Role</Th>
            <Th>City</Th>
            <Th>Date</Th>
            <Th></Th>
          </tr>
        </thead>
        <tbody>
          {drives.map((d) => (
            <tr key={d.id} className="border-t border-brand-gray-100">
              <Td className="font-semibold text-brand-ink">{d.company}</Td>
              <Td>{d.role}</Td>
              <Td>{d.city.name}</Td>
              <Td>{d.date.toLocaleDateString("en-IN")}</Td>
              <Td>
                <div className="flex gap-2">
                  <Link href={`/admin/drives/${d.id}`} className="text-sm font-semibold text-brand-red hover:underline">
                    Edit
                  </Link>
                  <form action={deleteDrive.bind(null, d.id)}>
                    <button className="text-sm font-semibold text-brand-gray-400 hover:text-brand-red">Delete</button>
                  </form>
                </div>
              </Td>
            </tr>
          ))}
        </tbody>
      </Table>

      <h2 className="mb-4 mt-10 text-lg font-bold text-brand-ink">Add Drive</h2>
      <DriveForm action={createDrive} cities={cities} />
    </div>
  );
}

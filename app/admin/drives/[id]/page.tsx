import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { DriveForm } from "@/components/admin/DriveForm";
import { updateDrive } from "@/app/admin/drives/actions";

export default async function EditDrivePage({ params }: { params: { id: string } }) {
  const [drive, cities] = await Promise.all([
    prisma.placementDrive.findUnique({ where: { id: params.id } }),
    prisma.city.findMany({ orderBy: { name: "asc" } }),
  ]);
  if (!drive) notFound();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-extrabold text-brand-ink">Edit Drive</h1>
      <DriveForm action={updateDrive.bind(null, drive.id)} cities={cities} initial={drive} />
    </div>
  );
}

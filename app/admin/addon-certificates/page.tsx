import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Table, Th, Td } from "@/components/admin/AdminUI";
import { AddOnCertificateForm } from "@/components/admin/AddOnCertificateForm";
import { createAddOnCertificate, deleteAddOnCertificate } from "@/app/admin/addon-certificates/actions";

export default async function AddOnCertificatesAdminPage() {
  const [certificates, programs] = await Promise.all([
    prisma.addOnCertificate.findMany({
      orderBy: { createdAt: "desc" },
      include: { programs: { select: { id: true, name: true } } },
    }),
    prisma.program.findMany({ orderBy: { order: "asc" }, select: { id: true, name: true } }),
  ]);

  return (
    <div>
      <h1 className="mb-1 text-2xl font-extrabold text-brand-ink">Add-on Certificates</h1>
      <p className="mb-6 text-sm text-brand-ink2">
        Extra certificates a student can earn across one or more programs. Each shows up as a tag
        in that program's Eligible Add-ons, and as its own button under "Additional Eligible
        Certificates" on the program's detail page.
      </p>

      <Table>
        <thead>
          <tr>
            <Th>Name</Th>
            <Th>Eligible Programs</Th>
            <Th>PDF</Th>
            <Th></Th>
          </tr>
        </thead>
        <tbody>
          {certificates.map((c) => (
            <tr key={c.id} className="border-t border-brand-gray-100">
              <Td className="font-semibold text-brand-ink">{c.name}</Td>
              <Td>{c.programs.length > 0 ? c.programs.map((p) => p.name).join(", ") : "—"}</Td>
              <Td>
                <a href={c.pdfUrl} target="_blank" rel="noreferrer" className="text-brand-red hover:underline">
                  View PDF ↗
                </a>
              </Td>
              <Td>
                <div className="flex gap-2">
                  <Link href={`/admin/addon-certificates/${c.id}`} className="text-sm font-semibold text-brand-red hover:underline">
                    Edit
                  </Link>
                  <form action={deleteAddOnCertificate.bind(null, c.id)}>
                    <button className="text-sm font-semibold text-brand-gray-400 hover:text-brand-red">Delete</button>
                  </form>
                </div>
              </Td>
            </tr>
          ))}
        </tbody>
      </Table>

      <h2 className="mb-4 mt-10 text-lg font-bold text-brand-ink">Add Certificate</h2>
      <AddOnCertificateForm action={createAddOnCertificate} programs={programs} />
    </div>
  );
}

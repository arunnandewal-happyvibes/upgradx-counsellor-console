import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Table, Th, Td } from "@/components/admin/AdminUI";
import { HiringPartnerForm } from "@/components/admin/HiringPartnerForm";
import { createHiringPartner, deleteHiringPartner } from "@/app/admin/hiring-partners/actions";

export default async function HiringPartnersAdminPage() {
  const partners = await prisma.hiringPartner.findMany({ orderBy: { order: "asc" } });

  return (
    <div>
      <h1 className="mb-1 text-2xl font-extrabold text-brand-ink">Hiring Partners</h1>
      <p className="mb-6 text-sm text-brand-ink2">
        Company logos shown in the "Top Hiring Partners" strip on the console home page.
      </p>

      <Table>
        <thead>
          <tr>
            <Th>Logo</Th>
            <Th>Name</Th>
            <Th></Th>
          </tr>
        </thead>
        <tbody>
          {partners.map((p) => (
            <tr key={p.id} className="border-t border-brand-gray-100">
              <Td>
                {p.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.logoUrl} alt={p.name} className="h-8 w-auto object-contain" />
                ) : (
                  <span className="text-brand-gray-400">—</span>
                )}
              </Td>
              <Td className="font-semibold text-brand-ink">{p.name}</Td>
              <Td>
                <div className="flex gap-2">
                  <Link href={`/admin/hiring-partners/${p.id}`} className="text-sm font-semibold text-brand-red hover:underline">
                    Edit
                  </Link>
                  <form action={deleteHiringPartner.bind(null, p.id)}>
                    <button className="text-sm font-semibold text-brand-gray-400 hover:text-brand-red">Delete</button>
                  </form>
                </div>
              </Td>
            </tr>
          ))}
        </tbody>
      </Table>

      <h2 className="mb-4 mt-10 text-lg font-bold text-brand-ink">Add Company</h2>
      <HiringPartnerForm action={createHiringPartner} />
    </div>
  );
}

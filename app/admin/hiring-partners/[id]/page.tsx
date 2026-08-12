import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { HiringPartnerForm } from "@/components/admin/HiringPartnerForm";
import { updateHiringPartner } from "@/app/admin/hiring-partners/actions";

export default async function EditHiringPartnerPage({ params }: { params: { id: string } }) {
  const partner = await prisma.hiringPartner.findUnique({ where: { id: params.id } });
  if (!partner) notFound();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-extrabold text-brand-ink">Edit — {partner.name}</h1>
      <HiringPartnerForm action={updateHiringPartner.bind(null, partner.id)} initial={partner} />
    </div>
  );
}

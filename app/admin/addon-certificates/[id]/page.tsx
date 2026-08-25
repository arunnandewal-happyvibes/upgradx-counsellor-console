import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AddOnCertificateForm } from "@/components/admin/AddOnCertificateForm";
import { updateAddOnCertificate } from "@/app/admin/addon-certificates/actions";

export default async function EditAddOnCertificatePage({ params }: { params: { id: string } }) {
  const [certificate, programs] = await Promise.all([
    prisma.addOnCertificate.findUnique({
      where: { id: params.id },
      include: { programs: { select: { id: true, name: true } } },
    }),
    prisma.program.findMany({ orderBy: { order: "asc" }, select: { id: true, name: true } }),
  ]);
  if (!certificate) notFound();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-extrabold text-brand-ink">Edit Add-on Certificate</h1>
      <AddOnCertificateForm
        action={updateAddOnCertificate.bind(null, certificate.id)}
        programs={programs}
        initial={certificate}
      />
    </div>
  );
}

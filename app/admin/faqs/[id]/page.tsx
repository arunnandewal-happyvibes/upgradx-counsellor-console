import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { FaqForm } from "@/components/admin/FaqForm";
import { updateFaq } from "@/app/admin/faqs/actions";

export default async function EditFaqPage({ params }: { params: { id: string } }) {
  const [faq, categories] = await Promise.all([
    prisma.faq.findUnique({ where: { id: params.id } }),
    prisma.faqCategory.findMany({ orderBy: { order: "asc" } }),
  ]);
  if (!faq) notFound();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-extrabold text-brand-ink">Edit FAQ</h1>
      <FaqForm action={updateFaq.bind(null, faq.id)} categories={categories} initial={faq} />
    </div>
  );
}

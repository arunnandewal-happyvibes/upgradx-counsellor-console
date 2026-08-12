import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Table, Th, Td } from "@/components/admin/AdminUI";
import { FaqForm } from "@/components/admin/FaqForm";
import { createFaq, deleteFaq } from "@/app/admin/faqs/actions";

export default async function FaqsAdminPage() {
  const [faqs, categories] = await Promise.all([
    prisma.faq.findMany({ orderBy: { order: "asc" }, include: { category: true } }),
    prisma.faqCategory.findMany({ orderBy: { order: "asc" } }),
  ]);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-extrabold text-brand-ink">FAQs</h1>

      <Table>
        <thead>
          <tr>
            <Th>Category</Th>
            <Th>Question</Th>
            <Th></Th>
          </tr>
        </thead>
        <tbody>
          {faqs.map((f) => (
            <tr key={f.id} className="border-t border-brand-gray-100">
              <Td className="font-semibold text-brand-ink">{f.category.name}</Td>
              <Td>{f.question}</Td>
              <Td>
                <div className="flex gap-2">
                  <Link href={`/admin/faqs/${f.id}`} className="text-sm font-semibold text-brand-red hover:underline">
                    Edit
                  </Link>
                  <form action={deleteFaq.bind(null, f.id)}>
                    <button className="text-sm font-semibold text-brand-gray-400 hover:text-brand-red">Delete</button>
                  </form>
                </div>
              </Td>
            </tr>
          ))}
        </tbody>
      </Table>

      <h2 className="mb-4 mt-10 text-lg font-bold text-brand-ink">Add FAQ</h2>
      <FaqForm action={createFaq} categories={categories} />
    </div>
  );
}

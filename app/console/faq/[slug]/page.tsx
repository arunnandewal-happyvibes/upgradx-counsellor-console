import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { FaqSearchBar } from "@/components/faq/FaqSearchBar";
import { FaqAccordion } from "@/components/faq/FaqAccordion";
import { SuggestQuestion } from "@/components/faq/SuggestQuestion";
import { PageHeader } from "@/components/ui/PageHeader";

export default async function FaqCategoryPage({ params }: { params: { slug: string } }) {
  const category = await prisma.faqCategory.findUnique({
    where: { slug: params.slug },
    include: { faqs: { orderBy: { order: "asc" } } },
  });
  if (!category) notFound();

  return (
    <div className="flex flex-col gap-10">
      <PageHeader
        back={{ href: "/console/faq", label: "All topics" }}
        eyebrow={`${category.faqs.length} question${category.faqs.length === 1 ? "" : "s"}`}
        title={category.name}
      />
      <FaqSearchBar />
      <FaqAccordion faqs={category.faqs} />
      <SuggestQuestion />
    </div>
  );
}

import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { FaqSearchBar } from "@/components/faq/FaqSearchBar";
import { FaqAccordion } from "@/components/faq/FaqAccordion";
import { SuggestQuestion } from "@/components/faq/SuggestQuestion";

export default async function FaqCategoryPage({ params }: { params: { slug: string } }) {
  const category = await prisma.faqCategory.findUnique({
    where: { slug: params.slug },
    include: { faqs: { orderBy: { order: "asc" } } },
  });
  if (!category) notFound();

  return (
    <div className="pb-16">
      <Link href="/console/faq" className="mb-4 inline-block text-body-sm text-secondary hover:text-primary">
        ← All categories
      </Link>
      <h1 className="text-display-lg text-on-surface mb-2">{category.name}</h1>
      <p className="text-body-lg text-secondary mb-6">Search across every category below.</p>

      <FaqSearchBar className="mb-section-gap" />

      <FaqAccordion faqs={category.faqs} />

      <SuggestQuestion className="mt-section-gap" />
    </div>
  );
}

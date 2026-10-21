import { prisma } from "@/lib/prisma";
import type { FaqTopic } from "@/components/faq/FaqTopicCard";

/** FAQ categories with their question count and the first two questions as a preview. */
export async function getFaqTopics(): Promise<FaqTopic[]> {
  const categories = await prisma.faqCategory.findMany({
    orderBy: { order: "asc" },
    include: {
      _count: { select: { faqs: true } },
      faqs: { orderBy: { order: "asc" }, take: 2, select: { question: true } },
    },
  });
  return categories.map((c) => ({
    id: c.id,
    slug: c.slug,
    name: c.name,
    icon: c.icon,
    count: c._count.faqs,
    preview: c.faqs.map((f) => f.question),
  }));
}

import { PrismaClient } from "@prisma/client";
import faqData from "./faq-data.json";

const prisma = new PrismaClient();

// Replaces the FAQ section with the real content from the user-supplied
// "FAQs - 6 categories.docx". That document is itself already organized
// under 6 top-level headings — Placements, Pricing, Certifications, Quality
// of Teachers, Number of Classes, Course Structure — so each question was
// placed under its own doc heading with no re-bucketing needed. Every
// question/answer is copied verbatim (including "(upGrad)" source tags
// where the doc has them); a couple of multi-paragraph answers (e.g. the
// additional-certificates list, the No-Cost vs Standard EMI comparison)
// were joined with newlines to keep their original list structure. Course
// Structure carries per-program sub-sections from the doc (Data Science,
// Full Stack ×2, Digital Marketing, Data Analytics, AI Pro, FutureStack,
// CGIBO) flattened into one category per the doc's own top-level grouping —
// several near-duplicate questions (e.g. "How long is the program?")
// appear multiple times with different real per-program answers.
async function main() {
  await prisma.faq.deleteMany();
  await prisma.faqCategory.deleteMany();

  for (const [i, cat] of (faqData as any[]).entries()) {
    await prisma.faqCategory.create({
      data: {
        name: cat.name,
        slug: cat.slug,
        icon: cat.icon,
        order: i,
        faqs: {
          create: cat.faqs.map(([question, answer]: [string, string], order: number) => ({
            question,
            answer,
            order,
          })),
        },
      },
    });
    console.log(`Created category "${cat.name}" with ${cat.faqs.length} FAQs`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

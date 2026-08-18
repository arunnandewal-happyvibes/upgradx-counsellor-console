import { PrismaClient } from "@prisma/client";
import faqData from "./faq-data.json";

const prisma = new PrismaClient();

// Replaces the FAQ section with the real content from the user-supplied
// "FAQs_X.docx". Every question, answer, and category header below is
// copied verbatim from that document (including its "(UpGrad)" source
// tags) — nothing here is invented. The only judgment calls are the
// per-category slug and Material Symbols icon, chosen to fit each header's
// subject. One paragraph in the source doc (an editorial note introducing
// the "Comparison FAQs" section, addressed to whoever builds the site) is
// not a question/answer pair and has no home in the Faq/FaqCategory schema,
// so it's intentionally omitted — see the docx section 10 intro line.
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

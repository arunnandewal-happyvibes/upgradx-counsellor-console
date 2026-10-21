import { SectionHeader } from "@/components/ui/SectionHeader";
import { SectionLink } from "@/components/ui/SectionLink";
import { FaqTopicCard } from "@/components/faq/FaqTopicCard";
import { getFaqTopics } from "@/lib/faqTopics";

export async function FaqLandingSection() {
  const topics = await getFaqTopics();
  if (topics.length === 0) return null;

  return (
    <section id="faq">
      <SectionHeader
        eyebrow="Frequently asked"
        title="Questions learners ask."
        action={<SectionLink href="/console/faq">Search all FAQs</SectionLink>}
      />
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {topics.map((t) => (
          <FaqTopicCard key={t.id} topic={t} />
        ))}
      </div>
    </section>
  );
}

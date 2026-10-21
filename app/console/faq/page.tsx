import { FaqSearchBar } from "@/components/faq/FaqSearchBar";
import { FaqTopicCard } from "@/components/faq/FaqTopicCard";
import { PageHeader } from "@/components/ui/PageHeader";
import { getFaqTopics } from "@/lib/faqTopics";

export default async function FaqIndexPage() {
  const topics = await getFaqTopics();

  return (
    <div className="flex flex-col gap-12">
      <PageHeader
        back={{ href: "/console#faq", label: "Console" }}
        eyebrow="Knowledge base"
        title="Answers, fast."
        lead="Search every question learners ask, or browse by topic."
      />

      <FaqSearchBar />

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {topics.map((t) => (
          <FaqTopicCard key={t.id} topic={t} />
        ))}
      </div>
    </div>
  );
}

import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { FaqSearchBar } from "@/components/faq/FaqSearchBar";
import { Icon } from "@/components/ui/Icon";

// FaqCategory.icon stores a Material Symbols icon name directly (e.g.
// "quiz", "psychology") — this map only translates a few legacy short-key
// values from before that change. Unrecognized values (the normal case now)
// pass straight through to the Icon component.
const ICONS: Record<string, string> = {
  briefcase: "work",
  "indian-rupee": "currency_rupee",
  award: "workspace_premium",
  "graduation-cap": "school",
  calendar: "calendar_month",
  "layout-list": "list_alt",
};

export default async function FaqIndexPage() {
  const categories = await prisma.faqCategory.findMany({
    orderBy: { order: "asc" },
    include: { _count: { select: { faqs: true } } },
  });

  return (
    <div className="pb-16">
      <h1 className="text-display-lg text-on-surface mb-2">Knowledge Base</h1>
      <p className="text-body-lg text-secondary mb-8">Quick answers for high-velocity counselling.</p>

      <div className="h-[2px] bg-primary mb-section-gap" />

      <FaqSearchBar className="mb-section-gap" />

      <div className="grid grid-cols-1 gap-gutter sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((c) => (
          <Link
            key={c.id}
            href={`/console/faq/${c.slug}`}
            className="elevate-3d group text-left bg-surface-container-lowest border border-surface-variant rounded p-container-margin hover:border-primary h-full flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded bg-surface-container flex items-center justify-center mb-card-padding group-hover:bg-primary-fixed transition-colors">
                <Icon name={ICONS[c.icon] ?? c.icon} className="text-primary" />
              </div>
              <h2 className="text-headline-sm text-on-surface mb-1 group-hover:text-primary transition-colors">
                {c.name}
              </h2>
              <p className="text-body-sm text-secondary">{c._count.faqs} questions</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

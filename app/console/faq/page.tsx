import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { FaqSearchBar } from "@/components/faq/FaqSearchBar";
import { PageHeader } from "@/components/ui/PageHeader";
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
    <div className="flex flex-col gap-12">
      <PageHeader
        back={{ href: "/console#faq", label: "Console" }}
        eyebrow="Knowledge base"
        title="Answers, fast."
        lead="Search every question learners ask, or browse by topic."
      />

      <FaqSearchBar />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((c) => (
          <Link
            key={c.id}
            href={`/console/faq/${c.slug}`}
            className="elevate-3d group flex min-h-[180px] flex-col justify-between gap-6 rounded-[24px] border border-outline-variant bg-white p-6"
          >
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-primary-fixed text-primary transition-colors group-hover:bg-primary group-hover:text-white">
              <Icon name={ICONS[c.icon] ?? c.icon} />
            </span>
            <span className="flex items-end justify-between gap-3">
              <span>
                <span className="block font-display text-[22px] font-bold tracking-[-0.02em] text-ink">{c.name}</span>
                <span className="text-[14px] text-on-surface-variant">
                  {c._count.faqs} question{c._count.faqs === 1 ? "" : "s"}
                </span>
              </span>
              <Icon name="arrow_forward" size={20} className="text-on-surface-variant transition-transform group-hover:translate-x-0.5 group-hover:text-ink" />
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}

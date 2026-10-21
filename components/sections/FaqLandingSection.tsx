import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { SectionLink } from "@/components/ui/SectionLink";
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

export async function FaqLandingSection() {
  const categories = await prisma.faqCategory.findMany({ orderBy: { order: "asc" } });
  if (categories.length === 0) return null;

  return (
    <section id="faq">
      <SectionHeader
        eyebrow="Frequently asked"
        title="Questions learners ask."
        action={<SectionLink href="/console/faq">Search all FAQs</SectionLink>}
      />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {categories.map((c) => (
          <Link
            key={c.id}
            href={`/console/faq/${c.slug}`}
            className="elevate-3d group flex min-h-[148px] flex-col justify-between gap-6 rounded-[22px] border border-outline-variant bg-white p-5"
          >
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary-fixed text-primary transition-colors group-hover:bg-primary group-hover:text-white">
              <Icon name={ICONS[c.icon] ?? c.icon} />
            </span>
            <span className="flex items-end justify-between gap-2 text-[15px] font-semibold leading-snug text-ink">
              {c.name}
              <Icon name="arrow_forward" size={18} className="flex-shrink-0 text-on-surface-variant transition-transform group-hover:translate-x-0.5 group-hover:text-ink" />
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

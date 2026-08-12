import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Icon } from "@/components/ui/Icon";

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
        eyebrow="Frequently Asked"
        title="FAQ"
        action={
          <Link href="/console/faq" className="text-label-bold font-bold uppercase text-primary hover:underline">
            Search all FAQs →
          </Link>
        }
      />
      <div className="grid grid-cols-2 gap-gutter sm:grid-cols-3 lg:grid-cols-6">
        {categories.map((c) => (
          <Link
            key={c.id}
            href={`/console/faq/${c.slug}`}
            className="elevate-3d group text-left bg-surface-container-lowest border border-surface-variant rounded p-card-padding hover:border-primary flex flex-col gap-2"
          >
            <div className="w-10 h-10 rounded bg-surface-container flex items-center justify-center group-hover:bg-primary-fixed transition-colors">
              <Icon name={ICONS[c.icon] ?? "help"} className="text-primary" />
            </div>
            <span className="text-body-md font-bold text-on-surface group-hover:text-primary transition-colors">
              {c.name}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

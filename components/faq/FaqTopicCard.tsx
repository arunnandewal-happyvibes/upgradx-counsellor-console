import Link from "next/link";
import { Icon } from "@/components/ui/Icon";

// FaqCategory.icon stores a Material Symbols icon name directly (e.g. "quiz") — this map only
// translates a few legacy short-key values from before that change.
const ICONS: Record<string, string> = {
  briefcase: "work",
  "indian-rupee": "currency_rupee",
  award: "workspace_premium",
  "graduation-cap": "school",
  calendar: "calendar_month",
  "layout-list": "list_alt",
};

export type FaqTopic = {
  id: string;
  slug: string;
  name: string;
  icon: string;
  count: number;
  preview: string[];
};

/** A FAQ topic as a full card: big icon, title, question count and a peek at real questions. */
export function FaqTopicCard({ topic }: { topic: FaqTopic }) {
  return (
    <Link
      href={`/console/faq/${topic.slug}`}
      className="card-red-3d group flex min-h-[260px] flex-col gap-6 rounded-[28px] border border-outline-variant bg-white p-7"
    >
      <div className="flex items-start justify-between gap-4">
        <span className="grid h-16 w-16 place-items-center rounded-[20px] bg-primary-fixed text-primary transition-colors duration-base group-hover:bg-primary group-hover:text-white">
          <Icon name={ICONS[topic.icon] ?? topic.icon} size={32} />
        </span>
        <span className="rounded-full bg-surface-container px-3 py-1.5 text-[13px] font-semibold text-ink">
          {topic.count} question{topic.count === 1 ? "" : "s"}
        </span>
      </div>

      <h3 className="font-display text-[28px] font-bold leading-[1.1] tracking-[-0.025em] text-ink">{topic.name}</h3>

      {topic.preview.length > 0 && (
        <ul className="flex flex-col gap-2.5 border-t border-outline-variant pt-5">
          {topic.preview.map((q) => (
            <li key={q} className="flex gap-2.5 text-[15px] leading-snug text-on-surface-variant">
              <span className="mt-[9px] h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" aria-hidden="true" />
              <span className="line-clamp-2">{q}</span>
            </li>
          ))}
        </ul>
      )}

      <span className="mt-auto inline-flex items-center gap-2 text-[16px] font-bold text-ink">
        See all answers
        <Icon name="arrow_forward" size={20} className="transition-transform duration-base group-hover:translate-x-1" />
      </span>
    </Link>
  );
}

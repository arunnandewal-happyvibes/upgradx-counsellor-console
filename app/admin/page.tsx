import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Icon } from "@/components/ui/Icon";
import { startOfToday } from "@/lib/dateFilters";

export default async function AdminDashboard() {
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const [
    cities,
    programs,
    instructors,
    batches,
    drives,
    faqs,
    stories,
    events,
    suggested,
    sessionsWeek,
    ratingWeek,
    referralFailures,
    addOnsMissingDescription,
    openBatches,
  ] = await Promise.all([
    prisma.city.count(),
    prisma.program.count(),
    prisma.instructor.count(),
    prisma.batch.count(),
    prisma.placementDrive.count(),
    prisma.faq.count(),
    prisma.successStory.count(),
    prisma.event.count(),
    prisma.suggestedQuestion.count({ where: { status: "pending" } }),
    prisma.lead.count({ where: { sessionClosedAt: { gte: weekAgo } } }),
    prisma.lead.aggregate({ where: { sessionClosedAt: { gte: weekAgo }, rating: { not: null } }, _avg: { rating: true }, _count: { rating: true } }),
    prisma.lead.count({ where: { referralStatus: { not: null }, referralSentAt: null } }),
    prisma.addOnCertificate.count({ where: { OR: [{ description: null }, { description: "" }] } }),
    prisma.batch.count({ where: { applicationCloseDate: { gte: startOfToday() } } }),
  ]);

  const avg = ratingWeek._avg.rating;
  const attention = [
    referralFailures > 0 && {
      href: "/admin/sessions",
      icon: "sync_problem",
      title: `${referralFailures} referral drop${referralFailures === 1 ? "" : "s"} failed`,
      body: "These learners didn't reach upGrad's referral form. See the Referral column in Closed Sessions.",
    },
    suggested > 0 && {
      href: "/admin/faqs/suggested",
      icon: "forum",
      title: `${suggested} suggested question${suggested === 1 ? "" : "s"} to review`,
      body: "Counsellors sent questions they couldn't find in the FAQ.",
    },
    addOnsMissingDescription > 0 && {
      href: "/admin/addon-certificates",
      icon: "edit_note",
      title: `${addOnsMissingDescription} add-on certificate${addOnsMissingDescription === 1 ? "" : "s"} missing a description`,
      body: "Add the masterclasses or projects each certificate needs.",
    },
    openBatches === 0 && {
      href: "/admin/batches",
      icon: "event_busy",
      title: "No batches open for applications",
      body: "Counsellors have nothing to offer learners until a batch is added.",
    },
  ].filter(Boolean) as { href: string; icon: string; title: string; body: string }[];

  const stats = [
    { label: "Programs", value: programs, href: "/admin/courses", icon: "school" },
    { label: "Open batches", value: openBatches, sub: `${batches} total`, href: "/admin/batches", icon: "calendar_month" },
    { label: "Cities", value: cities, href: "/admin/cities", icon: "location_city" },
    { label: "Instructors", value: instructors, href: "/admin/instructors", icon: "person" },
    { label: "Placement drives", value: drives, href: "/admin/drives", icon: "work" },
    { label: "FAQs", value: faqs, href: "/admin/faqs", icon: "quiz" },
    { label: "Success stories", value: stories, href: "/admin/success-stories", icon: "workspace_premium" },
    { label: "Events", value: events, href: "/admin/events", icon: "event" },
  ];

  return (
    <div className="flex flex-col gap-10">
      <div>
        <div className="eyebrow mb-2">Admin</div>
        <h1>Dashboard</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Link href="/admin/sessions" className="elevate-3d flex flex-col gap-3 rounded-[24px] bg-ink p-7 text-white">
          <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-white/50">Sessions · last 7 days</span>
          <span className="font-display text-[64px] font-extrabold leading-none tracking-[-0.045em]">{sessionsWeek}</span>
          <span className="mt-auto inline-flex items-center gap-1 text-[14px] text-white/70">
            View closed sessions <Icon name="arrow_forward" size={16} />
          </span>
        </Link>
        <div className="flex flex-col gap-3 rounded-[24px] border border-outline-variant bg-white p-7">
          <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-on-surface-variant">Avg. learner rating · 7 days</span>
          <span className="font-display text-[64px] font-extrabold leading-none tracking-[-0.045em] text-ink">
            {avg != null ? avg.toFixed(1) : "—"}
            {avg != null && <span className="text-[28px] text-on-surface-variant"> / 5</span>}
          </span>
          <span className="mt-auto text-[14px] text-on-surface-variant">
            {ratingWeek._count.rating} rating{ratingWeek._count.rating === 1 ? "" : "s"} from learners&apos; summary emails
          </span>
        </div>
        <div className="flex flex-col gap-3 rounded-[24px] border border-outline-variant bg-white p-7">
          <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-on-surface-variant">Needs attention</span>
          <span
            className={`font-display text-[64px] font-extrabold leading-none tracking-[-0.045em] ${attention.length ? "text-primary" : "text-ink"}`}
          >
            {attention.length}
          </span>
          <span className="mt-auto text-[14px] text-on-surface-variant">
            {attention.length ? "Items below need a look." : "All clear."}
          </span>
        </div>
      </div>

      {attention.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-[22px] font-bold">Needs attention</h2>
          <ul className="overflow-hidden rounded-[20px] border border-outline-variant bg-white">
            {attention.map((a) => (
              <li key={a.href + a.title} className="border-b border-outline-variant last:border-0">
                <Link href={a.href} className="group flex items-center gap-4 px-5 py-4 transition-colors hover:bg-surface-container-low">
                  <span className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-xl bg-primary-fixed text-primary">
                    <Icon name={a.icon} size={20} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[15px] font-semibold text-ink">{a.title}</span>
                    <span className="block text-[13px] text-on-surface-variant">{a.body}</span>
                  </span>
                  <Icon name="arrow_forward" size={18} className="text-on-surface-variant group-hover:text-ink" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="flex flex-col gap-3">
        <h2 className="text-[22px] font-bold">Content</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {stats.map((s) => (
            <Link
              key={s.label}
              href={s.href}
              className="elevate-3d flex flex-col gap-4 rounded-[20px] border border-outline-variant bg-white p-5"
            >
              <Icon name={s.icon} size={22} className="text-primary" />
              <span>
                <span className="block font-display text-[34px] font-extrabold leading-none tracking-[-0.04em] text-ink">{s.value}</span>
                <span className="mt-1 block text-[14px] font-medium text-on-surface-variant">
                  {s.label}
                  {s.sub && <span className="text-[12px]"> · {s.sub}</span>}
                </span>
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

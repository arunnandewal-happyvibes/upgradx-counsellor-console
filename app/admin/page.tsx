import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";

export default async function AdminDashboard() {
  const [cities, programs, instructors, batches, drives, faqs, stories, events, suggested] =
    await Promise.all([
      prisma.city.count(),
      prisma.program.count(),
      prisma.instructor.count(),
      prisma.batch.count(),
      prisma.placementDrive.count(),
      prisma.faq.count(),
      prisma.successStory.count(),
      prisma.event.count(),
      prisma.suggestedQuestion.count({ where: { status: "pending" } }),
    ]);

  const stats = [
    { label: "Cities", value: cities, href: "/admin/cities" },
    { label: "Programs", value: programs, href: "/admin/courses" },
    { label: "Instructors", value: instructors, href: "/admin/instructors" },
    { label: "Batches", value: batches, href: "/admin/batches" },
    { label: "Placement Drives", value: drives, href: "/admin/drives" },
    { label: "FAQs", value: faqs, href: "/admin/faqs" },
    { label: "Success Stories", value: stories, href: "/admin/success-stories" },
    { label: "Events", value: events, href: "/admin/events" },
    { label: "Pending Suggestions", value: suggested, href: "/admin/faqs/suggested" },
  ];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-extrabold text-brand-ink">Admin Dashboard</h1>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map((s) => (
          <Link key={s.label} href={s.href}>
            <Card className="p-5 hover:border-brand-red">
              <div className="text-3xl font-extrabold text-brand-red">{s.value}</div>
              <div className="text-sm font-medium text-brand-ink2">{s.label}</div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

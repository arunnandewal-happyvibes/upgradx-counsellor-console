import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { LogoutButton } from "@/components/admin/LogoutButton";

export const dynamic = "force-dynamic";

const NAV = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/cities", label: "Cities" },
  { href: "/admin/courses", label: "Courses" },
  { href: "/admin/addon-certificates", label: "Add-on Certificates" },
  { href: "/admin/hiring-partners", label: "Hiring Partners" },
  { href: "/admin/instructors", label: "Instructors" },
  { href: "/admin/industry-leaders", label: "Industry Leaders" },
  { href: "/admin/batches", label: "Batches" },
  { href: "/admin/drives", label: "Placement Drives" },
  { href: "/admin/success-stories", label: "Success Stories" },
  { href: "/admin/faqs", label: "FAQs" },
  { href: "/admin/faqs/suggested", label: "Suggested Questions" },
  { href: "/admin/events", label: "Events" },
  { href: "/admin/city-contacts", label: "City Contacts" },
  { href: "/admin/journey-steps", label: "Journey Steps" },
  { href: "/admin/section-visibility", label: "Section Visibility" },
  { href: "/admin/career-services-policy", label: "Career Services Policy" },
  { href: "/admin/home-screen", label: "Home Screen (Default)" },
  { href: "/admin/recommendations", label: "Recommendations" },
  { href: "/admin/backups", label: "Backups" },
  { href: "/admin/sessions", label: "Closed Sessions" },
  { href: "/admin/counsellors", label: "Counsellors" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-brand-gray-50">
      <aside className="sticky top-0 flex h-screen w-60 flex-shrink-0 flex-col border-r border-brand-gray-200 bg-white">
        <div className="flex-1 overflow-y-auto p-4">
          <Link href="/admin" className="mb-6 flex items-center gap-2">
            <Logo height={22} />
            <span className="text-xs font-semibold text-brand-gray-400">Expert Counselling Portal</span>
          </Link>
          <nav className="space-y-1">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block rounded-lg px-3 py-2 text-sm font-medium text-brand-ink2 hover:bg-brand-redLight hover:text-brand-red"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        {/* Fixed footer — stays visible without scrolling through the whole nav list above. */}
        <div className="flex-shrink-0 space-y-2 border-t border-brand-gray-200 bg-white p-4">
          <Link
            href="/console"
            className="block rounded-lg bg-brand-red px-3 py-2 text-center text-sm font-bold text-white shadow-sm hover:bg-brand-red/90"
          >
            ← Back to Console
          </Link>
          <LogoutButton />
        </div>
      </aside>
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}

import Link from "next/link";
import { CityDropdown } from "@/components/ui/CityDropdown";
import { Icon } from "@/components/ui/Icon";
import { Logo } from "@/components/ui/Logo";

const NAV = [
  { href: "/console#programs", label: "Programs" },
  { href: "/console#batches", label: "Batches" },
  { href: "/console#instructors", label: "Instructors" },
  { href: "/console#leaders", label: "Leaders" },
];

export function TopBar() {
  return (
    <header className="sticky top-0 z-50 flex justify-between items-center w-full px-container-margin h-16 bg-surface border-b-2 border-primary shadow-sm">
      <div className="flex items-center gap-gutter">
        <Link href="/console" className="flex items-center">
          <Logo height={30} priority />
        </Link>
        <CityDropdown />
      </div>

      <nav className="hidden md:flex gap-gutter items-center">
        {NAV.map((item) => (
          <a
            key={item.href}
            className="text-secondary text-body-md hover:text-primary transition-colors duration-200"
            href={item.href}
          >
            {item.label}
          </a>
        ))}
      </nav>

      <div className="flex items-center gap-4">
        <Link
          href="/console/contact"
          aria-label="Contact"
          className="text-primary hover:opacity-80 transition-opacity"
        >
          <Icon name="location_on" />
        </Link>
        <Link
          href="/admin"
          className="btn-3d inline-flex items-center gap-1.5 rounded border border-outline-variant px-3 py-1.5 text-label-bold font-bold uppercase tracking-wide text-on-surface-variant hover:border-primary hover:text-primary transition-colors"
        >
          <Icon name="admin_panel_settings" size={18} />
          <span className="hidden sm:inline">Admin</span>
        </Link>
      </div>
    </header>
  );
}

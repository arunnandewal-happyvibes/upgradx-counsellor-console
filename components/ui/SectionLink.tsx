import Link from "next/link";

/** The "see everything" link that sits on the right of a section header. */
export function SectionLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="whitespace-nowrap border-b-[1.5px] border-current pb-0.5 text-[15px] font-semibold text-ink transition-colors hover:text-primary"
    >
      {children}
    </Link>
  );
}

import Link from "next/link";
import { Logo } from "@/components/ui/Logo";

const COLUMNS = [
  {
    title: "Programs",
    links: [
      { href: "/console#programs", label: "Data Science" },
      { href: "/console#programs", label: "Full Stack Development" },
      { href: "/console#programs", label: "Digital Marketing" },
    ],
  },
  {
    title: "About",
    links: [
      { href: "/console#hero", label: "Our story" },
      { href: "/console#success-stories", label: "Success stories" },
    ],
  },
  {
    title: "Support",
    links: [
      { href: "/console/faq", label: "FAQ" },
      { href: "/console/career-services-policy", label: "Career services policy" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="grid w-full grid-cols-1 gap-10 rounded-[32px] bg-ink px-8 py-12 text-white md:grid-cols-[1.4fr_repeat(3,minmax(0,1fr))] md:px-12">
      <div className="flex flex-col gap-5">
        <Link href="/console" className="w-fit rounded-xl bg-white px-3 py-2">
          <Logo height={30} />
        </Link>
        <p className="max-w-xs font-display text-[22px] font-bold leading-tight tracking-[-0.02em]">
          Expert counselling, <span className="text-primary">in person.</span>
        </p>
        <Link
          href="/console/contact"
          className="btn-3d inline-flex h-11 w-fit items-center rounded-xl bg-primary px-5 text-[14px] font-bold hover:bg-primary-container"
        >
          Contact a centre
        </Link>
      </div>
      {COLUMNS.map((col) => (
        <div key={col.title} className="flex flex-col gap-3">
          <h4 className="mb-1 text-[12px] font-bold uppercase tracking-[0.12em] text-white/50">{col.title}</h4>
          {col.links.map((l) => (
            <Link key={l.label} href={l.href} className="w-fit text-[15px] text-white/80 transition-colors hover:text-white">
              {l.label}
            </Link>
          ))}
        </div>
      ))}
      <p className="text-[13px] text-white/40 md:col-span-4">
        © {new Date().getFullYear()} upGrad Education Pvt. Ltd. All rights reserved.
      </p>
    </footer>
  );
}

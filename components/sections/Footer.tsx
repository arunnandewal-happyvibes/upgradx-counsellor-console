import Link from "next/link";
import { Logo } from "@/components/ui/Logo";

export function Footer() {
  return (
    <footer className="w-full py-section-gap px-card-padding grid grid-cols-1 md:grid-cols-4 gap-gutter bg-surface-container-highest border-t-2 border-primary mt-section-gap rounded">
      <div className="flex flex-col gap-4">
        <Link href="/console" className="w-fit">
          <Logo height={34} />
        </Link>
        <p className="text-body-sm text-secondary">
          © {new Date().getFullYear()} upGrad Education Pvt. Ltd. All rights reserved.
        </p>
      </div>
      <div className="flex flex-col gap-2">
        <h4 className="text-label-bold font-bold text-on-surface uppercase mb-2">Program</h4>
        <Link href="/console#programs" className="text-body-sm text-on-surface-variant hover:text-primary hover:underline transition-all">
          Data Science
        </Link>
        <Link href="/console#programs" className="text-body-sm text-on-surface-variant hover:text-primary hover:underline transition-all">
          Full Stack Development
        </Link>
        <Link href="/console#programs" className="text-body-sm text-on-surface-variant hover:text-primary hover:underline transition-all">
          Digital Marketing
        </Link>
      </div>
      <div className="flex flex-col gap-2">
        <h4 className="text-label-bold font-bold text-on-surface uppercase mb-2">About</h4>
        <Link href="/console#hero" className="text-body-sm text-on-surface-variant hover:text-primary hover:underline transition-all">
          Our Story
        </Link>
        <Link href="/console#success-stories" className="text-body-sm text-on-surface-variant hover:text-primary hover:underline transition-all">
          Success Stories
        </Link>
      </div>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <h4 className="text-label-bold font-bold text-on-surface uppercase mb-2">Support</h4>
          <Link href="/console/faq" className="text-body-sm text-on-surface-variant hover:text-primary hover:underline transition-all">
            FAQ
          </Link>
        </div>
        <Link
          href="/console/contact"
          className="bg-primary text-on-primary text-label-bold font-bold uppercase py-2 px-4 rounded border border-primary hover:bg-primary-container transition-colors duration-200 w-fit"
        >
          Contact Us
        </Link>
      </div>
    </footer>
  );
}

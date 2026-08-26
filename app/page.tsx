import Link from "next/link";
import { OnboardingForm } from "@/components/onboarding/OnboardingForm";
import { Icon } from "@/components/ui/Icon";
import { Logo } from "@/components/ui/Logo";

export const dynamic = "force-dynamic";

export default function OnboardingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-50 flex justify-between items-center w-full px-container-margin h-16 bg-surface border-b-2 border-primary shadow-sm">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center">
            <Logo height={38} priority />
          </Link>
          <nav className="hidden md:flex items-center gap-gutter">
            {["Batches", "Instructors", "Leaders", "Programs"].map((item) => (
              <span key={item} className="text-secondary text-body-md">
                {item}
              </span>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/admin"
            className="btn-3d inline-flex items-center gap-1.5 rounded border border-outline-variant px-3 py-1.5 text-label-bold font-bold uppercase tracking-wide text-secondary hover:border-primary hover:text-primary transition-colors"
          >
            <Icon name="admin_panel_settings" size={18} />
            <span className="hidden sm:inline">Admin</span>
          </Link>
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center px-container-margin py-section-gap">
        <div className="w-[94%] sm:w-[88%] md:w-[75%] lg:w-[68%] max-w-[1100px] bg-surface-container-lowest border border-outline-variant border-t-4 border-t-primary rounded-lg shadow-sm p-8 sm:p-12 md:p-16">
          <p className="text-body-lg text-secondary text-center mb-10">
            Your counsellor is asking for these details on your behalf, to personalize today's session just for you.
          </p>

          <OnboardingForm />
        </div>
      </main>
    </div>
  );
}

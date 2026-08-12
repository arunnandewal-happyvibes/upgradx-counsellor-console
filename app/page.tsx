import { prisma } from "@/lib/prisma";
import { OnboardingForm } from "@/components/onboarding/OnboardingForm";
import { Icon } from "@/components/ui/Icon";
import { Logo } from "@/components/ui/Logo";

export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  const cities = await prisma.city.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, slug: true },
  });

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-50 flex justify-between items-center w-full px-container-margin h-16 bg-surface border-b-2 border-primary shadow-sm">
        <div className="flex items-center gap-6">
          <Logo height={28} priority />
          <nav className="hidden md:flex items-center gap-gutter">
            {["Batches", "Instructors", "Leaders", "Programs"].map((item) => (
              <span key={item} className="text-secondary text-body-md">
                {item}
              </span>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <Icon name="location_on" className="text-secondary" />
          <Icon name="account_circle" className="text-secondary" />
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center px-container-margin py-section-gap">
        <div className="w-full max-w-[440px] bg-surface-container-lowest border border-outline-variant border-t-4 border-t-primary rounded-lg shadow-sm p-8">
          <div className="text-center mb-8">
            <h2 className="text-headline-sm font-semibold text-on-surface mb-2">Counsellor Profile Setup</h2>
            <p className="text-body-sm text-secondary">
              This information helps us personalize the session for you.
            </p>
          </div>

          <OnboardingForm cities={cities} />
        </div>
      </main>
    </div>
  );
}

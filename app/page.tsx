import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { OnboardingForm } from "@/components/onboarding/OnboardingForm";
import { CounsellorCheckIn } from "@/components/console/CounsellorCheckIn";
import { Icon } from "@/components/ui/Icon";
import { Logo } from "@/components/ui/Logo";

export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  const cities = await prisma.city.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, slug: true },
  });

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <CounsellorCheckIn />
      <header className="sticky top-0 z-50 w-full border-b border-outline-variant bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-[1760px] items-center gap-4 px-4 sm:px-6 lg:px-8 2xl:px-10">
          <Link href="/" className="flex items-center gap-4">
            <Logo height={36} priority />
            <span className="hidden whitespace-nowrap border-l border-outline-variant pl-4 text-[13px] font-medium text-on-surface-variant md:block">
              Expert Counselling Portal
            </span>
          </Link>
          <Link
            href="/admin"
            className="btn-3d ml-auto inline-flex h-11 items-center gap-2 whitespace-nowrap rounded-xl border border-outline-variant bg-white px-4 text-[14px] font-semibold text-ink hover:border-ink"
          >
            <Icon name="admin_panel_settings" size={18} />
            <span className="hidden sm:inline">Admin</span>
          </Link>
        </div>
      </header>

      <main className="flex flex-grow justify-center px-container-margin pb-32 pt-10 md:pt-16">
        <div className="w-full max-w-[880px]">
          <p className="mb-10 flex items-start gap-2.5 rounded-2xl bg-surface-container-low px-4 py-3 text-[14px] leading-relaxed text-on-surface-variant">
            <Icon name="lock" size={18} className="mt-0.5 flex-shrink-0 text-ink" />
            Your counsellor is asking these on your behalf to personalise today&apos;s session. It takes about a minute.
          </p>
          <OnboardingForm cities={cities} />
        </div>
      </main>
    </div>
  );
}

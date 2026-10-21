import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { CityProvider } from "@/lib/city-context";
import { TopBar } from "@/components/ui/TopBar";
import { CounsellorCheckIn } from "@/components/console/CounsellorCheckIn";

export const dynamic = "force-dynamic";

export default async function ConsoleLayout({ children }: { children: React.ReactNode }) {
  const [cities, programs] = await Promise.all([
    prisma.city.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, slug: true, monumentImageUrl: true },
    }),
    // For the ⌘K search palette in the top bar.
    prisma.program.findMany({ orderBy: { order: "asc" }, select: { name: true, slug: true, duration: true } }),
  ]);

  return (
    <Suspense>
      <CityProvider cities={cities}>
        <CounsellorCheckIn />
        <TopBar programs={programs} />
        <main className="mx-auto flex w-full max-w-[1440px] flex-col gap-20 px-container-margin pb-32 pt-section-gap md:gap-24 lg:px-12">
          {children}
        </main>
      </CityProvider>
    </Suspense>
  );
}

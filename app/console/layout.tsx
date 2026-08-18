import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { CityProvider } from "@/lib/city-context";
import { TopBar } from "@/components/ui/TopBar";

export const dynamic = "force-dynamic";

export default async function ConsoleLayout({ children }: { children: React.ReactNode }) {
  const cities = await prisma.city.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, slug: true, monumentImageUrl: true },
  });

  return (
    <Suspense>
      <CityProvider cities={cities}>
        <TopBar />
        <main className="mx-auto max-w-[1600px] w-full flex flex-col gap-section-gap px-container-margin py-section-gap">
          {children}
        </main>
      </CityProvider>
    </Suspense>
  );
}

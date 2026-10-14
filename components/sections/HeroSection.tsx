import { prisma } from "@/lib/prisma";
import { HeroClient } from "@/components/sections/HeroClient";
import { highestPackage } from "@/lib/highestPackage";

export async function HeroSection() {
  const [cityCount, stories, settings, recommendations] = await Promise.all([
    prisma.city.count(),
    prisma.successStory.findMany({ select: { packageLabel: true } }),
    prisma.homeScreenSettings.findFirst(),
    prisma.degreeRecommendation.findMany({
      orderBy: { order: "asc" },
      include: {
        choice1Program: { select: { name: true, slug: true, duration: true, mode: true } },
        choice2Program: { select: { name: true, slug: true, duration: true, mode: true } },
        choice3Program: { select: { name: true, slug: true, duration: true, mode: true } },
      },
    }),
  ]);

  const topCtc = highestPackage(stories.map((s) => s.packageLabel));

  return (
    <HeroClient
      cityCount={cityCount}
      topCtc={topCtc}
      settings={settings}
      recommendations={recommendations}
    />
  );
}

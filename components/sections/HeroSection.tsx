import { prisma } from "@/lib/prisma";
import { HeroClient } from "@/components/sections/HeroClient";
import { highestPackage } from "@/lib/highestPackage";
import { IIT_PROGRAM_SELECT, isIitCertified } from "@/lib/iitBadge";

type ProgramRow = { name: string; slug: string; duration: string; mode: string } & Parameters<typeof isIitCertified>[0];
const toRef = (p: ProgramRow | null) =>
  p ? { name: p.name, slug: p.slug, duration: p.duration, mode: p.mode, iit: isIitCertified(p) } : null;

export async function HeroSection() {
  const [cityCount, stories, settings, recommendations] = await Promise.all([
    prisma.city.count(),
    prisma.successStory.findMany({ select: { packageLabel: true } }),
    prisma.homeScreenSettings.findFirst(),
    prisma.degreeRecommendation.findMany({
      orderBy: { order: "asc" },
      include: {
        choice1Program: { select: IIT_PROGRAM_SELECT },
        choice2Program: { select: IIT_PROGRAM_SELECT },
        choice3Program: { select: IIT_PROGRAM_SELECT },
      },
    }),
  ]);

  const topCtc = highestPackage(stories.map((s) => s.packageLabel));

  return (
    <HeroClient
      cityCount={cityCount}
      topCtc={topCtc}
      settings={settings}
      recommendations={recommendations.map((r) => ({
        id: r.id,
        degree: r.degree,
        choice1ProgramId: r.choice1ProgramId,
        choice1Program: toRef(r.choice1Program),
        choice1Why: r.choice1Why,
        choice2Program: toRef(r.choice2Program),
        choice2Why: r.choice2Why,
        choice3Program: toRef(r.choice3Program),
        choice3Why: r.choice3Why,
      }))}
    />
  );
}

import { prisma } from "@/lib/prisma";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { JourneySteps } from "@/components/sections/JourneySteps";

export async function HowLearningWorksSection() {
  const steps = await prisma.journeyStep.findMany({ orderBy: { order: "asc" } });
  if (steps.length === 0) return null;

  return (
    <section>
      <SectionHeader eyebrow="The Pitch" title="How Learning Works" />
      <JourneySteps steps={steps} />
    </section>
  );
}

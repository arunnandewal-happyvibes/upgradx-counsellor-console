import { HeroSection } from "@/components/sections/HeroSection";
import { SuccessStoriesSection } from "@/components/sections/SuccessStoriesSection";
import { ProgramsSection } from "@/components/sections/ProgramsSection";
import { HowLearningWorksSection } from "@/components/sections/HowLearningWorksSection";
import { InstructorsSection, IndustryLeadersSection } from "@/components/sections/InstructorsSection";
import { PlacementDrivesSection } from "@/components/sections/PlacementDrivesSection";
import { BatchesSection } from "@/components/sections/BatchesSection";
import { FaqLandingSection } from "@/components/sections/FaqLandingSection";
import { EventsSection } from "@/components/sections/EventsSection";
import { Footer } from "@/components/sections/Footer";

export default function ConsolePage() {
  return (
    <>
      <HeroSection />
      <SuccessStoriesSection />
      <ProgramsSection />
      <HowLearningWorksSection />
      <InstructorsSection />
      <IndustryLeadersSection />
      <PlacementDrivesSection />
      <BatchesSection />
      <FaqLandingSection />
      <EventsSection />
      <Footer />
    </>
  );
}

import { HeroSection } from "@/components/sections/HeroSection";
import { HiringPartnersSection } from "@/components/sections/HiringPartnersSection";
import { SuccessStoriesSection } from "@/components/sections/SuccessStoriesSection";
import { ProgramsSection } from "@/components/sections/ProgramsSection";
import { HowLearningWorksSection } from "@/components/sections/HowLearningWorksSection";
import { InstructorsSection, IndustryLeadersSection } from "@/components/sections/InstructorsSection";
import { PlacementDrivesSection } from "@/components/sections/PlacementDrivesSection";
import { BatchesSection } from "@/components/sections/BatchesSection";
import { FaqLandingSection } from "@/components/sections/FaqLandingSection";
import { EventsSection } from "@/components/sections/EventsSection";
import { Footer } from "@/components/sections/Footer";
import { WelcomeModal } from "@/components/console/WelcomeModal";

export default function ConsolePage() {
  return (
    <>
      <WelcomeModal />
      <HeroSection />
      <HiringPartnersSection />
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

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { Button, LinkButton } from "@/components/ui/Button";
import { Tag } from "@/components/ui/Chip";
import { cn } from "@/lib/cn";
import { useCity } from "@/lib/city-context";
import { getLeadProfile, type LeadProfile } from "@/lib/leadProfile";
import { findRecommendationForDegree } from "@/lib/recommendationMatch";
import { openAssistant } from "@/lib/sessionDock";

type ProgramRef = { name: string; slug: string; duration: string; mode: string } | null;

type Recommendation = {
  id: string;
  degree: string;
  choice1ProgramId: string | null;
  choice1Program: ProgramRef;
  choice1Why: string | null;
  choice2Program: ProgramRef;
  choice2Why: string | null;
  choice3Program: ProgramRef;
  choice3Why: string | null;
};

type Settings = {
  headline: string;
  subheadline: string;
  primaryCtaLabel: string;
  secondaryCtaLabel: string;
  placementRecordPercent: string;
  placementRecordCaption: string;
  careerGrowthCaption: string;
} | null;

const DEFAULT_SETTINGS: NonNullable<Settings> = {
  headline: "can transform your journey",
  subheadline:
    "Offline, mentor-led programs built with hiring partners — from classroom to career, in one connected track.",
  primaryCtaLabel: "Explore Programs",
  secondaryCtaLabel: "Book Counselling",
  placementRecordPercent: "85%",
  placementRecordCaption: "Avg. successful transitions within 6 months",
  careerGrowthCaption: "Tailored pathways for senior roles.",
};

const MATCH_LABELS = ["Best match", "Also great", "Worth exploring"];

const MOTIVATIONAL_LINES: Record<string, string> = {
  "B.Tech": "Your technical foundation is strong — let's turn it into a career that matches your ambition.",
  "B.Com": "Your commerce background is a launchpad — let's build the career you've been working towards.",
  BCA: "You've already built the programming foundation — now let's build the career to match it.",
  "BSc - CS": "Your CS foundation puts you ahead — let's turn that into real-world momentum.",
  BBA: "Your business instincts are ready for the real world — let's put them to work.",
  "MSc - CS": "Your advanced CS expertise deserves an equally advanced career path.",
  Other: "Whatever your path so far, your next big career move starts right here.",
};

function getGreeting(hour: number) {
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

/** Bottom-right stat on the dark aside, shared by both hero variants. */
function CentresStat({ count }: { count: number }) {
  return (
    <div className="flex items-baseline gap-3 border-t border-white/10 pt-6">
      <span className="font-display text-[56px] font-extrabold leading-none tracking-[-0.04em]">
        {count}
        <span className="text-primary">+</span>
      </span>
      <span className="text-[14px] leading-snug text-white/60">
        learning centres
        <br />
        across India
      </span>
    </div>
  );
}

type StepState = "done" | "now" | "next";

function JourneyCard({ profile, cityCount }: { profile: LeadProfile; cityCount: number }) {
  const focus = profile.skills[0] ?? profile.interests[0];
  const steps: { title: string; sub: string; state: StepState }[] = [
    { title: profile.degree ? `${profile.degree} graduate` : "Graduate", sub: "Foundation in place", state: "done" },
    { title: focus ? `${focus} interest` : "Interests captured", sub: "Matched to programs", state: "done" },
    { title: "Career ready", sub: "Pick a program and batch", state: "now" },
    { title: "Success", sub: "Placement support", state: "next" },
  ];

  return (
    <aside
      aria-label="Learner journey"
      className="flex animate-rise flex-col gap-7 rounded-[28px] bg-ink p-8 text-white md:p-9"
      style={{ animationDelay: "120ms" }}
    >
      <div className="flex items-center justify-between">
        <span className="text-label-bold uppercase text-white/50">Your path</span>
        <span className="text-[13px] text-white/50">Step 3 of 4</span>
      </div>
      <ol className="flex flex-col">
        {steps.map((s, i) => (
          <li key={s.title} className="flex gap-4">
            <div className="flex flex-col items-center">
              <span
                className={cn(
                  "grid h-[34px] w-[34px] flex-shrink-0 place-items-center rounded-full text-[14px] font-bold",
                  s.state === "done" && "bg-white text-ink",
                  s.state === "now" && "bg-primary text-white shadow-[0_0_0_6px_rgba(228,31,38,0.25)]",
                  s.state === "next" && "border-[1.5px] border-white/30 text-white/50",
                )}
              >
                {s.state === "done" ? <Icon name="check" size={18} /> : i + 1}
              </span>
              {i < steps.length - 1 && (
                <span className={cn("my-1 w-0.5 flex-1 min-h-[22px]", s.state === "done" ? "bg-white" : "bg-white/20")} />
              )}
            </div>
            <div className="pb-5 pt-1">
              <div className={cn("text-[17px] font-bold", s.state === "next" && "text-white/50")}>{s.title}</div>
              <div className="mt-0.5 text-[14px] text-white/50">{s.sub}</div>
            </div>
          </li>
        ))}
      </ol>
      <div className="mt-auto">
        <CentresStat count={cityCount} />
      </div>
    </aside>
  );
}

function RecommendationCard({ rank, program, why }: { rank: number; program: NonNullable<ProgramRef>; why: string | null }) {
  const best = rank === 0;
  return (
    <Link
      href={`/console/programs/${program.slug}`}
      className={cn(
        "elevate-3d group flex min-h-[300px] animate-rec-card flex-col gap-4 rounded-[28px] border p-7 md:p-8",
        best ? "border-primary bg-primary text-white hover:border-primary" : "border-outline-variant bg-white text-ink",
      )}
      style={{ animationDelay: `${rank * 110}ms` }}
    >
      <div className="flex items-center justify-between gap-2">
        <span className={cn("text-label-bold uppercase", best ? "text-white" : "text-primary")}>{MATCH_LABELS[rank]}</span>
        <span
          className={cn(
            "rounded-full px-3 py-1.5 text-[13px] font-semibold",
            best ? "bg-white/20 text-white" : "bg-surface-container text-ink",
          )}
        >
          {program.duration}
        </span>
      </div>
      <h3 className="font-display text-[26px] font-bold leading-[1.12] tracking-[-0.02em] md:text-[28px]">{program.name}</h3>
      {why && (
        <p className={cn("editable-field text-[15px] leading-relaxed", best ? "text-white/85" : "text-on-surface-variant")}>
          {why}
        </p>
      )}
      <span className="mt-auto inline-flex items-center gap-2 text-[15px] font-bold">
        View details
        <Icon name="arrow_forward" size={18} className="transition-transform duration-base group-hover:translate-x-1" />
      </span>
    </Link>
  );
}

function PersonalizedHero({
  profile,
  recommendations,
  cityCount,
}: {
  profile: LeadProfile;
  recommendations: Recommendation[];
  cityCount: number;
}) {
  const { selectedCity } = useCity();
  const [greeting, setGreeting] = useState("Welcome");
  useEffect(() => setGreeting(getGreeting(new Date().getHours())), []);

  const firstName = profile.name.split(" ")[0] || "there";
  const focus = profile.skills[0] ?? profile.interests[0];
  const rec = findRecommendationForDegree(recommendations, profile.degree);
  const choices = rec
    ? [
        { program: rec.choice1Program, why: rec.choice1Why },
        { program: rec.choice2Program, why: rec.choice2Why },
        { program: rec.choice3Program, why: rec.choice3Why },
      ].filter((c): c is { program: NonNullable<ProgramRef>; why: string | null } => !!c.program)
    : [];
  const occupation =
    profile.occupation === "Working Professional"
      ? profile.yearsOfExperience != null
        ? `Working · ${profile.yearsOfExperience} yrs`
        : "Working professional"
      : profile.occupation;

  return (
    <>
      <div className="flex flex-wrap items-stretch gap-10 lg:gap-12">
        <div className="flex min-w-0 flex-[999_1_560px] animate-rise flex-col justify-center gap-7">
          <span className="eyebrow">{greeting}</span>
          <h1 className="font-display text-display-xl font-extrabold text-ink">
            {firstName}, let’s build
            <br />
            your <span className="text-primary">next move.</span>
          </h1>
          <div className="flex flex-wrap gap-2">
            {profile.degree && <Tag dark>{profile.degree} graduate</Tag>}
            {focus && <Tag>Interested in {focus}</Tag>}
            {occupation && <Tag>{occupation}</Tag>}
            {selectedCity && <Tag>Prefers {selectedCity.name}</Tag>}
          </div>
          <p className="max-w-[560px] text-[19px] leading-relaxed text-[#3d3d3d]">
            {MOTIVATIONAL_LINES[profile.degree] ?? MOTIVATIONAL_LINES.Other}
            {choices.length > 0 && ` Here are the ${choices.length === 1 ? "program" : `${choices.length} programs`} that fit best.`}
          </p>
          <div className="flex flex-wrap gap-3">
            <LinkButton href="#matches" size="lg">
              See my matches
              <Icon name="arrow_forward" size={20} />
            </LinkButton>
            <Button variant="secondary" size="lg" onClick={openAssistant}>
              <Icon name="mic" size={20} />
              Ask the assistant
            </Button>
          </div>
        </div>
        <div className="flex min-w-0 flex-[1_1_340px]">
          <div className="w-full">
            <JourneyCard profile={profile} cityCount={cityCount} />
          </div>
        </div>
      </div>

      <div id="matches" className="scroll-mt-24">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="eyebrow mb-2">Recommended for you</div>
            <h2 className="text-display-lg font-extrabold text-ink">
              {choices.length > 1 ? `${["", "One", "Two", "Three"][choices.length]} matches, ranked.` : "Your best match."}
            </h2>
          </div>
          <a
            href="#programs"
            className="border-b-[1.5px] border-current pb-0.5 text-[15px] font-semibold text-ink hover:text-primary"
          >
            Compare all programs
          </a>
        </div>
        {choices.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {choices.map((c, i) => (
              <RecommendationCard key={c.program.slug} rank={i} program={c.program} why={c.why} />
            ))}
          </div>
        ) : (
          <p className="rounded-card border border-dashed border-outline-variant p-8 text-body-md text-on-surface-variant">
            Recommendations for this degree aren’t set up yet — browse the full catalogue below.
          </p>
        )}
      </div>
    </>
  );
}

function DefaultHero({
  settings,
  topCtc,
  cityCount,
}: {
  settings: NonNullable<Settings>;
  topCtc: string;
  cityCount: number;
}) {
  return (
    <div className="flex flex-wrap items-stretch gap-10 lg:gap-12">
      <div className="flex min-w-0 flex-[999_1_560px] animate-rise flex-col justify-center gap-7">
        <span className="eyebrow">Expert counselling</span>
        <h1 className="font-display text-display-xl font-extrabold text-ink">
          <span className="text-primary">upGrad X</span> {settings.headline}
        </h1>
        <p className="editable-field max-w-[560px] text-[19px] leading-relaxed text-[#3d3d3d]">{settings.subheadline}</p>
        <div className="flex flex-wrap gap-3">
          <LinkButton href="#programs" size="lg">
            {settings.primaryCtaLabel}
            <Icon name="arrow_forward" size={20} />
          </LinkButton>
          <LinkButton href="#faq" variant="secondary" size="lg">
            {settings.secondaryCtaLabel}
          </LinkButton>
        </div>
      </div>

      <aside
        aria-label="At a glance"
        className="flex min-w-0 flex-[1_1_340px] animate-rise flex-col gap-7 rounded-[28px] bg-ink p-8 text-white md:p-9"
        style={{ animationDelay: "120ms" }}
      >
        <div>
          <span className="text-label-bold uppercase text-white/50">Placement record</span>
          <div className="mt-2 font-display text-[64px] font-extrabold leading-none tracking-[-0.045em]">
            {settings.placementRecordPercent}
          </div>
          <p className="editable-field mt-2 text-[14px] text-white/60">{settings.placementRecordCaption}</p>
        </div>
        <div className="border-t border-white/10 pt-6">
          <span className="text-label-bold uppercase text-white/50">Highest CTC</span>
          <div className="mt-2 font-display text-[40px] font-extrabold leading-none tracking-[-0.035em] text-[#ff5c61]">
            {topCtc}
          </div>
        </div>
        <div className="flex items-start gap-3 rounded-2xl bg-white/5 p-4">
          <Icon name="trending_up" className="text-[#ff5c61]" />
          <div>
            <div className="font-semibold">Career growth</div>
            <div className="editable-field text-[14px] text-white/60">{settings.careerGrowthCaption}</div>
          </div>
        </div>
        <div className="mt-auto">
          <CentresStat count={cityCount} />
        </div>
      </aside>
    </div>
  );
}

export function HeroClient({
  cityCount,
  topCtc,
  settings,
  recommendations,
}: {
  cityCount: number;
  topCtc: string;
  settings: Settings;
  recommendations: Recommendation[];
}) {
  const [profile, setProfile] = useState<LeadProfile | null>(null);

  useEffect(() => {
    setProfile(getLeadProfile());
  }, []);

  const resolvedSettings = settings ?? DEFAULT_SETTINGS;

  return (
    <section id="hero" className="flex flex-col gap-16 pb-4 pt-6 md:pt-10">
      {profile ? (
        <PersonalizedHero profile={profile} recommendations={recommendations} cityCount={cityCount} />
      ) : (
        <DefaultHero settings={resolvedSettings} topCtc={topCtc} cityCount={cityCount} />
      )}
    </section>
  );
}

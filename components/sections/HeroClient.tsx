"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";
import { getLeadProfile, type LeadProfile } from "@/lib/leadProfile";
import { findRecommendationForDegree } from "@/lib/recommendationMatch";

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

const MATCH_LABELS = ["Best Match", "Also Great", "Worth Exploring"];

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

function getMotivationalLine(degree: string) {
  return MOTIVATIONAL_LINES[degree] ?? MOTIVATIONAL_LINES.Other;
}

function RecommendationCard({
  rank,
  program,
  why,
}: {
  rank: number;
  program: ProgramRef;
  why: string | null;
}) {
  if (!program) return null;
  const isBestMatch = rank === 0;
  return (
    <div
      className={`elevate-3d animate-rec-card flex flex-col gap-2.5 rounded-lg border p-[22px] transition-colors ${
        isBestMatch
          ? "border-primary bg-surface-container-lowest animate-best-match-glow"
          : "border-surface-variant bg-surface-container-lowest hover:border-primary"
      }`}
      style={{ animationDelay: `${rank * 130}ms` }}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-[13px] font-bold uppercase tracking-wide text-primary">{MATCH_LABELS[rank]}</span>
        <span className="bg-surface-container-highest px-2 py-0.5 text-on-surface text-[10px] font-bold tracking-wider uppercase rounded-full">
          {program.duration}
        </span>
      </div>
      <h3 className="text-headline-sm text-on-surface">{program.name}</h3>
      {why && <p className="text-body-sm text-on-surface-variant editable-field">{why}</p>}
      <Link
        href={`/console/programs/${program.slug}`}
        className="mt-1 inline-flex items-center gap-1 text-body-sm font-bold text-primary hover:underline"
      >
        View Details
        <Icon name="arrow_forward" size={16} />
      </Link>
    </div>
  );
}

type Milestone = { icon: string; label: string; x: number; y: number; color: string };

function JourneyBanner({ profile }: { profile: LeadProfile }) {
  const [greeting, setGreeting] = useState("Welcome");
  const firstName = profile.name.split(" ")[0];

  useEffect(() => {
    setGreeting(getGreeting(new Date().getHours()));
  }, []);

  const milestones: Milestone[] = [
    { icon: "school", label: profile.degree || "Graduate", x: 6, y: 70, color: "#7A1015" },
    { icon: "code", label: profile.skills[0] ?? "Skilled Up", x: 36, y: 30, color: "#A61319" },
    { icon: "rocket_launch", label: "Career Ready", x: 66, y: 62, color: "#C81922" },
    { icon: "emoji_events", label: "Success", x: 94, y: 18, color: "#E41F26" },
  ];

  return (
    <div className="relative flex min-h-[150px] w-full items-center overflow-hidden rounded-lg bg-gradient-to-r from-black via-[#141414] to-[#1A1C1C] py-5 md:h-[18vh] md:py-0">
      <div className="pointer-events-none absolute -left-10 top-1/2 h-48 w-48 -translate-y-1/2 rounded-full bg-primary opacity-20 blur-3xl" />
      <div className="pointer-events-none absolute -right-10 top-0 h-56 w-56 rounded-full bg-white opacity-[0.06] blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-1/3 h-40 w-40 rounded-full bg-primary opacity-10 blur-3xl" />

      <div className="relative z-10 flex w-full items-center gap-6 px-6 md:px-10">
        <div className="w-full min-w-0 md:w-auto md:shrink-0">
          <span className="text-[13px] font-bold uppercase tracking-wide text-white/60">{greeting}</span>
          <h1 className="break-words text-[32px] font-extrabold leading-[1.05] text-white md:text-[54px]">
            <span className="bg-gradient-to-r from-white to-primary bg-clip-text text-transparent">
              {firstName}!
            </span>
          </h1>
          {profile.degree && (
            <p className="text-[17px] font-semibold text-white/70">
              {profile.degree} graduate
              {profile.skills[0] ? ` · ${profile.skills[0]}` : ""}
            </p>
          )}
          <p className="mt-1 line-clamp-2 max-w-md text-[13px] italic leading-snug text-white/60">
            {getMotivationalLine(profile.degree)}
          </p>
        </div>

        {/* "Path to success" infographic — desktop only; mobile keeps the compact identity block alone. */}
        <div className="relative hidden h-full flex-1 md:block">
          <svg
            className="absolute inset-0 h-full w-full"
            viewBox="0 0 1000 200"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="journeyGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#4A4A4A" />
                <stop offset="36%" stopColor="#7A1015" />
                <stop offset="66%" stopColor="#C81922" />
                <stop offset="100%" stopColor="#E41F26" />
              </linearGradient>
            </defs>
            <path
              d="M60,140 C160,140 220,60 360,60 C480,60 520,124 660,124 C780,124 840,36 940,36"
              fill="none"
              stroke="url(#journeyGradient)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray="1 9"
              className="animate-path-draw"
            />
          </svg>

          {milestones.map((m, i) => (
            <div
              key={m.label}
              className="animate-milestone-in absolute flex flex-col items-center gap-1.5"
              style={{ left: `${m.x}%`, top: `${m.y}%`, animationDelay: `${700 + i * 200}ms` }}
            >
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full text-white ${
                  i === milestones.length - 1 ? "animate-welcome-pulse" : ""
                }`}
                style={{ backgroundColor: m.color, boxShadow: `0 0 16px 2px ${m.color}99` }}
              >
                <Icon name={m.icon} size={19} />
              </div>
              <span
                className="whitespace-nowrap rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-white backdrop-blur-sm"
                style={{ boxShadow: `0 0 0 1px ${m.color}55` }}
              >
                {m.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PersonalizedHero({ profile, recommendations }: { profile: LeadProfile; recommendations: Recommendation[] }) {
  const rec = findRecommendationForDegree(recommendations, profile.degree);
  const choices = rec
    ? [
        { program: rec.choice1Program, why: rec.choice1Why },
        { program: rec.choice2Program, why: rec.choice2Why },
        { program: rec.choice3Program, why: rec.choice3Why },
      ].filter((c) => c.program)
    : [];

  return (
    <div className="flex flex-col gap-[22px]">
      <JourneyBanner profile={profile} />

      <div className="flex flex-col gap-[14px]">
        <span className="text-[13px] font-bold uppercase tracking-wide text-secondary">Recommended for you</span>
        {choices.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-[18px]">
            {choices.map((c, i) => (
              <RecommendationCard key={i} rank={i} program={c.program} why={c.why} />
            ))}
          </div>
        ) : (
          <p className="text-body-sm text-on-surface-variant">
            Recommendations aren't set up yet — browse the full catalogue below.
          </p>
        )}
      </div>
    </div>
  );
}

function DefaultHero({ settings, topCtc }: { settings: NonNullable<Settings>; topCtc: string }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
      <div className="md:col-span-8 b2b-card elevate-3d p-8 flex flex-col justify-center relative overflow-hidden bg-surface-bright">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
        <h1 className="text-display-lg text-on-surface mb-4 max-w-2xl leading-tight">
          <span className="text-primary">upGrad X</span> {settings.headline}
        </h1>
        <p className="text-body-lg text-on-surface-variant max-w-xl mb-8 border-l-2 border-primary pl-4 py-1 editable-field">
          {settings.subheadline}
        </p>
        <div className="flex gap-4">
          <a href="#programs">
            <Button variant="primary">{settings.primaryCtaLabel}</Button>
          </a>
          <a href="#faq">
            <Button variant="secondary">{settings.secondaryCtaLabel}</Button>
          </a>
        </div>
      </div>

      <div className="md:col-span-4 flex flex-col gap-gutter">
        <div className="b2b-card elevate-3d p-6 flex-1 flex flex-col justify-between">
          <div>
            <span className="text-label-bold font-bold text-secondary uppercase mb-2 block">Placement Record</span>
            <div className="text-stat-lg text-on-surface">{settings.placementRecordPercent}</div>
            <p className="text-body-sm text-on-surface-variant mt-1 editable-field inline-block">
              {settings.placementRecordCaption}
            </p>
          </div>
          <div className="mt-4 pt-4 border-t border-surface-variant">
            <span className="text-label-bold font-bold text-secondary uppercase mb-2 block">Highest CTC</span>
            <div className="text-headline-md text-primary">{topCtc}</div>
          </div>
        </div>
        <div className="b2b-card elevate-3d p-6 flex-1 bg-surface-container-low flex items-center gap-4">
          <div className="w-12 h-12 rounded bg-primary-container/10 flex items-center justify-center shrink-0">
            <Icon name="trending_up" className="text-primary" />
          </div>
          <div>
            <div className="text-headline-sm text-on-surface">Career Growth</div>
            <div className="text-body-sm text-on-surface-variant editable-field">{settings.careerGrowthCaption}</div>
          </div>
        </div>
      </div>
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
    <section id="hero" className="flex flex-col gap-section-gap">
      <div className="w-full bg-surface-container-lowest border-b border-surface-variant py-4 px-card-padding shadow-sm rounded flex items-center gap-4">
        <span className="text-stat-lg text-primary">{cityCount}+</span>
        <span className="text-label-bold font-bold text-secondary uppercase tracking-wide">
          Learning Centres Across India
        </span>
      </div>

      {profile ? (
        <PersonalizedHero profile={profile} recommendations={recommendations} />
      ) : (
        <DefaultHero settings={resolvedSettings} topCtc={topCtc} />
      )}
    </section>
  );
}

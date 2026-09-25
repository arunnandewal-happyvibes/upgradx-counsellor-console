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

type Milestone = { icon: string; label: string; x: number; y: number };

function JourneyBanner({ profile }: { profile: LeadProfile }) {
  const [greeting, setGreeting] = useState("Welcome");
  const firstName = profile.name.split(" ")[0];

  useEffect(() => {
    setGreeting(getGreeting(new Date().getHours()));
  }, []);

  const milestones: Milestone[] = [
    { icon: "school", label: profile.degree || "Graduate", x: 46, y: 82 },
    { icon: "code", label: profile.skills[0] ?? "Skilled Up", x: 60, y: 62 },
    { icon: "rocket_launch", label: "Career Ready", x: 76, y: 40 },
    { icon: "emoji_events", label: "Success", x: 90, y: 16 },
  ];

  return (
    <div className="relative flex min-h-[70vh] w-full items-center overflow-hidden rounded-lg border border-surface-variant bg-gradient-to-br from-surface-bright via-white to-surface-container-low md:min-h-[88vh]">
      <div className="pointer-events-none absolute -right-24 -top-24 h-[420px] w-[420px] rounded-full bg-primary opacity-5 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-on-surface opacity-[0.03] blur-3xl" />

      {/* "Path to success" infographic — desktop only; mobile keeps a clean centered card. */}
      <div className="pointer-events-none absolute inset-0 hidden md:block">
        <svg
          className="absolute inset-0 h-full w-full"
          viewBox="0 0 1000 600"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="journeyGradient" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#603E3A" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#E41F26" stopOpacity="0.9" />
            </linearGradient>
          </defs>
          <path
            d="M460,492 C520,470 560,410 600,372 C660,318 700,280 760,240 C810,208 850,150 900,96"
            fill="none"
            stroke="url(#journeyGradient)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray="6 10"
            className="animate-path-draw"
          />
        </svg>

        {milestones.map((m, i) => (
          <div
            key={m.label}
            className="animate-milestone-in absolute flex flex-col items-center gap-2"
            style={{ left: `${m.x}%`, top: `${m.y}%`, animationDelay: `${900 + i * 220}ms` }}
          >
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white shadow-lg ring-4 ring-white ${
                i === milestones.length - 1 ? "animate-welcome-pulse" : ""
              }`}
            >
              <Icon name={m.icon} size={22} />
            </div>
            <span className="whitespace-nowrap rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-on-surface shadow-sm">
              {m.label}
            </span>
          </div>
        ))}
      </div>

      <div className="relative z-10 w-full px-8 py-16 text-center md:w-[46%] md:px-16 md:text-left">
        <span className="text-[13px] font-bold uppercase tracking-wide text-secondary">Welcome</span>
        <h1 className="mb-4 mt-3 leading-[1.05]">
          <span className="block text-[22px] font-medium text-on-surface-variant">{greeting},</span>
          <span className="block text-[64px] font-extrabold leading-[1.05] tracking-tight text-primary">
            {firstName}!
          </span>
        </h1>
        {profile.degree && (
          <p className="mb-4 text-[18px] text-on-surface-variant">
            <span className="font-semibold text-on-surface">{profile.degree}</span> graduate
          </p>
        )}
        {profile.skills.length > 0 && (
          <div className="mb-6 flex flex-wrap justify-center gap-2 md:justify-start">
            {profile.skills.slice(0, 6).map((s) => (
              <span
                key={s}
                className="rounded border border-outline-variant bg-surface-container-high px-3 py-1.5 text-[13px] font-bold text-on-surface-variant"
              >
                {s}
              </span>
            ))}
          </div>
        )}
        <p className="mx-auto max-w-md border-t border-outline-variant pt-4 text-[17px] italic leading-snug text-on-surface-variant md:mx-0">
          {getMotivationalLine(profile.degree)}
        </p>
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

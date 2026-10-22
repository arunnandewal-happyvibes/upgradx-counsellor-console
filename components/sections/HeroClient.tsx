"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { Button, LinkButton } from "@/components/ui/Button";
import { Tag } from "@/components/ui/Chip";
import { cn } from "@/lib/cn";
import { useCity } from "@/lib/city-context";
import { getLeadProfile, type LeadProfile } from "@/lib/leadProfile";
import { findRecommendationForDegree } from "@/lib/recommendationMatch";
import { openAssistant } from "@/lib/sessionDock";
import { computeInsights } from "@/lib/learnerInsights";
import { setRecommendedSlugs } from "@/lib/recommendedPrograms";
import { IitSeal } from "@/components/programs/ProgramBadges";

type ProgramRef = { name: string; slug: string; duration: string; mode: string; iit: boolean } | null;

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
    <div className="flex items-center gap-4 border-t border-white/10 pt-6">
      <span className="font-display text-[56px] font-extrabold leading-none tracking-[-0.04em]">
        {count}
        <span className="text-primary">+</span>
      </span>
      <span className="text-[15px] font-medium leading-snug text-white/70">learning centres across India</span>
    </div>
  );
}

/** Generic head-and-shoulders silhouette — deliberately not gendered. */
function Silhouette() {
  return (
    <svg viewBox="0 0 64 64" className="h-full w-full" aria-hidden="true">
      <circle cx="32" cy="23" r="11" fill="currentColor" />
      <path d="M10 58c0-12.2 9.8-20 22-20s22 7.8 22 20" fill="currentColor" />
    </svg>
  );
}

function ReadinessRing({ score }: { score: number }) {
  const r = 34;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative h-[92px] w-[92px] flex-shrink-0">
      <svg viewBox="0 0 80 80" className="h-full w-full -rotate-90" aria-hidden="true">
        <circle cx="40" cy="40" r={r} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="8" />
        <circle
          cx="40"
          cy="40"
          r={r}
          fill="none"
          stroke="#E41F26"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - score / 100)}
          className="transition-[stroke-dashoffset] duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center leading-none">
        <span className="font-display text-[28px] font-extrabold tracking-[-0.03em]">{score}</span>
        <span className="mt-0.5 text-[11px] text-white/50">/ 100</span>
      </div>
    </div>
  );
}

function ProfileCard({ profile }: { profile: LeadProfile }) {
  const insights = useMemo(() => computeInsights(profile), [profile]);
  const meta = [
    profile.collegeTier,
    profile.graduationYear ? `Class of ${profile.graduationYear}` : null,
    profile.age ? `Age ${profile.age}` : null,
    profile.cgpa ? `CGPA ${profile.cgpa}` : null,
  ].filter(Boolean);

  return (
    <aside
      aria-label="Learner profile"
      className="flex h-full animate-rise flex-col gap-7 rounded-[28px] bg-ink p-8 text-white md:p-10"
      style={{ animationDelay: "120ms" }}
    >
      <span className="text-label-bold uppercase text-white/50">Learner profile</span>

      <div className="flex items-center gap-4">
        <div className="grid h-16 w-16 flex-shrink-0 place-items-end overflow-hidden rounded-full bg-white/10 pt-2 text-white/60">
          <Silhouette />
        </div>
        <div className="min-w-0">
          <div className="truncate text-[20px] font-bold leading-snug">{profile.name}</div>
          <div className="truncate text-[14px] text-white/60">
            {[profile.degree, profile.collegeName].filter(Boolean).join(" · ") || "Graduate"}
          </div>
          {meta.length > 0 && <div className="mt-0.5 text-[13px] text-white/45">{meta.join(" · ")}</div>}
        </div>
      </div>

      <div className="flex items-center gap-5 rounded-2xl bg-white/5 p-4">
        <ReadinessRing score={insights.score} />
        <div>
          <div className="text-label-bold uppercase text-white/50">Placement readiness</div>
          <div className="mt-1 text-[22px] font-bold leading-tight">{insights.band}</div>
          <div className="mt-1 text-[13px] text-white/50">A rough guide from today&apos;s answers</div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 2xl:grid-cols-2">
        <InsightList title="Strengths" items={insights.strengths} icon="check_circle" tone="text-[#5fd38d]" />
        <InsightList title="Gaps to close" items={insights.gaps} icon="error" tone="text-[#ff5c61]" />
      </div>
    </aside>
  );
}

function InsightList({ title, items, icon, tone }: { title: string; items: string[]; icon: string; tone: string }) {
  return (
    <div>
      <div className="mb-3 text-label-bold uppercase text-white/50">{title}</div>
      {items.length === 0 ? (
        <p className="text-[14px] text-white/50">Nothing major.</p>
      ) : (
        <ul className="flex flex-col gap-2.5">
          {items.map((t) => (
            <li key={t} className="flex items-start gap-2 text-[15px] leading-snug">
              <Icon name={icon} size={18} fill className={cn("mt-0.5 flex-shrink-0", tone)} />
              <span>{t}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function RecommendationCard({ rank, program, why }: { rank: number; program: NonNullable<ProgramRef>; why: string | null }) {
  const best = rank === 0;
  return (
    <Link
      href={`/console/programs/${program.slug}`}
      className={cn(
        "card-red-3d group flex min-h-[300px] animate-rec-card flex-col gap-4 rounded-[28px] border p-7 md:p-8",
        best ? "border-primary bg-primary text-white hover:border-primary" : "border-outline-variant bg-white text-ink",
      )}
      style={{ animationDelay: `${rank * 110}ms` }}
    >
      <div className="flex items-center justify-between gap-2">
        <span className={cn("inline-flex items-center gap-1.5 text-label-bold uppercase", best ? "text-white" : "text-primary")}>
          {best && <Icon name="star" size={18} fill />}
          {MATCH_LABELS[rank]}
        </span>
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
      {program.iit && (
        <div className="flex flex-wrap gap-2">
          <IitSeal onDark={best} />
        </div>
      )}
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
}: {
  profile: LeadProfile;
  recommendations: Recommendation[];
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
  const choiceSlugs = choices.map((c) => c.program.slug).join(",");
  useEffect(() => {
    setRecommendedSlugs(choiceSlugs ? choiceSlugs.split(",") : []);
  }, [choiceSlugs]);
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
        <div className="flex min-w-0 flex-[1_1_440px]">
          <div className="w-full">
            <ProfileCard profile={profile} />
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
        className="flex min-w-0 flex-[1_1_440px] animate-rise flex-col gap-7 rounded-[28px] bg-ink p-8 text-white md:p-10"
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
        <PersonalizedHero profile={profile} recommendations={recommendations} />
      ) : (
        <DefaultHero settings={resolvedSettings} topCtc={topCtc} cityCount={cityCount} />
      )}
    </section>
  );
}

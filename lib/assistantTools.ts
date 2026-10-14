import { prisma } from "@/lib/prisma";
import { startOfToday } from "@/lib/dateFilters";
import { DOMAIN_TAGS } from "@/lib/domainTags";
import { highestPackage } from "@/lib/highestPackage";
import type { ToolSpec } from "@/lib/llm";

// Everything here reads the same published content the console shows — never learner records,
// transcripts or counsellor data.

const fmt = (d: Date) => d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9 ]+/g, " ").replace(/\s+/g, " ").trim();
const STOP = new Set("a an the is are was be to of in on at for and or do does did can could i you we they it this that what how when where which who tell me about any have has with my your our there their from by as if".split(" "));
const keywords = (s: string) => norm(s).split(" ").filter((w) => w.length > 1 && !STOP.has(w));

function tool(name: string, description: string, properties: Record<string, unknown> = {}, required: string[] = []): ToolSpec {
  return { type: "function", function: { name, description, parameters: { type: "object", properties, required } } };
}
const str = (description: string) => ({ type: "string", description });

export const ASSISTANT_TOOLS: ToolSpec[] = [
  tool("list_programs", "All programs: duration, mode, summary."),
  tool("get_program_details", "One program's coverage, certifications, curriculum, add-on certificates.", { program: str("name") }, ["program"]),
  tool("get_upcoming_batches", "Open batches (online ones are for everyone).", { city: str("city"), program: str("program"), mode: { type: "string", enum: ["Online", "Offline"] } }),
  tool("get_placement_drives", "Upcoming placement drives.", { city: str("city") }),
  tool("get_upcoming_events", "Upcoming events and workshops."),
  tool("get_instructors", "Instructors or industry leaders.", { city: str("city"), topic: str("subject"), industry_leaders: { type: "boolean" } }),
  tool("get_hiring_partners", `Hiring companies, by sector (${DOMAIN_TAGS.join(", ")}).`, { sector: str("sector") }),
  tool("get_placement_stats", "Headline placement record and highest package shown on the console."),
  tool("get_success_stories", "Placed-student stories.", { course: str("course"), city: str("city") }),
  tool("search_faqs", "FAQ: fees, pricing, placements, certificates, teachers, classes, course structure.", { query: str("keywords") }, ["query"]),
  tool("get_degree_recommendation", "Recommended programs for a degree.", { degree: str("e.g. B.Tech") }, ["degree"]),
  tool("get_centre_contact", "Centre address, phone, email.", { city: str("city") }, ["city"]),
  tool("search_career_services_policy", "Career services policy text.", { query: str("keywords") }, ["query"]),
];

function editDistance(a: string, b: string) {
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++)
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return dp[a.length][b.length];
}

// Common alternate spellings people (and speech recognition) use for our city names.
const CITY_ALIASES: Record<string, string> = { bangalore: "bengaluru", bengalore: "bengaluru", banglore: "bengaluru", delhi: "delhi", gurgaon: "gurugram", bombay: "mumbai", calcutta: "kolkata", madras: "chennai", poona: "pune" };

async function cityIdsFor(city?: string) {
  if (!city) return null;
  const q0 = norm(city).replace(/\b(city|centre|center)\b/g, "").trim();
  const q = CITY_ALIASES[q0] ?? q0;
  const cities = await prisma.city.findMany({ select: { id: true, name: true, slug: true } });
  const exact = cities.filter((c) => norm(c.name).includes(q) || q.includes(norm(c.name).split(" ")[0]) || c.slug.includes(q.replace(/ /g, "-")));
  if (exact.length) return exact.map((c) => c.id);
  // Speech recognition can drop or swap a letter ("Mumbi" for "Mumbai") — accept a close match.
  const close = cities.filter((c) => {
    const first = norm(c.name).split(" ")[0];
    return q.length >= 4 && editDistance(first, q.split(" ")[0]) <= 2;
  });
  return close.map((c) => c.id);
}

async function findProgram(name: string) {
  const programs = await prisma.program.findMany({ select: { id: true, name: true } });
  const q = norm(name);
  const kw = keywords(name);
  return (
    programs.find((p) => norm(p.name).includes(q)) ??
    [...programs].sort((a, b) => score(b.name, kw) - score(a.name, kw))[0]
  );
}
const score = (text: string, kw: string[]) => { const t = norm(text); return kw.filter((k) => t.includes(k)).length; };

export async function runTool(name: string, args: Record<string, unknown>): Promise<unknown> {
  const s = (k: string) => (typeof args[k] === "string" ? (args[k] as string).trim() : "");
  const today = startOfToday();

  switch (name) {
    case "list_programs": {
      const ps = await prisma.program.findMany({ orderBy: { order: "asc" } });
      return ps.map((p) => ({ name: p.name, duration: p.duration, mode: p.mode, category: p.category, summary: p.description.slice(0, 160) }));
    }
    case "get_program_details": {
      const p0 = await findProgram(s("program"));
      if (!p0) return { error: "No matching program." };
      const p = await prisma.program.findUnique({
        where: { id: p0.id },
        include: { certifications: true, curriculumModules: { orderBy: { order: "asc" } }, addOnCertificates: true },
      });
      return {
        name: p!.name, duration: p!.duration, mode: p!.mode, description: p!.description, covers: p!.bullets,
        certifications: p!.certifications.map((c) => `${c.name} (${c.partnerInstitution})`),
        curriculum: p!.curriculumModules.map((m) => m.title),
        additionalCertificates: p!.addOnCertificates.map((a) => ({ name: a.name, details: a.description })),
      };
    }
    case "get_upcoming_batches": {
      const cityIds = await cityIdsFor(s("city"));
      const prog = s("program") ? await findProgram(s("program")) : null;
      const mode = s("mode") === "Online" ? "Online" : s("mode") === "Offline" ? "Offline" : null;
      const batches = await prisma.batch.findMany({
        where: {
          applicationCloseDate: { gte: today },
          ...(prog ? { programId: prog.id } : {}),
          ...(mode ? { mode } : {}),
          ...(cityIds ? { OR: [{ cityId: { in: cityIds } }, { mode: "Online" }] } : {}),
        },
        include: { program: { select: { name: true } }, city: { select: { name: true } } },
        orderBy: { startDate: "asc" },
        take: 8,
      });
      if (!batches.length) return { batches: [], note: "No open batches match. Applications may have closed or none are scheduled." };
      return batches.map((b) => ({ program: b.program.name, mode: b.mode, city: b.city?.name ?? "Open to all (online)", starts: fmt(b.startDate), applyBy: fmt(b.applicationCloseDate), timing: b.timing, location: b.location }));
    }
    case "get_placement_drives": {
      const cityIds = await cityIdsFor(s("city"));
      const ds = await prisma.placementDrive.findMany({ where: { date: { gte: today }, ...(cityIds ? { cityId: { in: cityIds } } : {}) }, include: { city: { select: { name: true } } }, orderBy: { date: "asc" }, take: 8 });
      return ds.length ? ds.map((d) => ({ company: d.company, role: d.role, city: d.city.name, date: fmt(d.date) })) : { drives: [], note: "No upcoming placement drives." };
    }
    case "get_upcoming_events": {
      const os = await prisma.eventOccurrence.findMany({ where: { date: { gte: today }, event: { isEnabled: true } }, include: { event: true, city: { select: { name: true } } }, orderBy: { date: "asc" }, take: 8 });
      return os.length ? os.map((o) => ({ event: o.event.name, about: o.event.description, city: o.city.name, date: fmt(o.date) })) : { events: [], note: "No upcoming events." };
    }
    case "get_instructors": {
      const cityIds = await cityIdsFor(s("city"));
      const topic = s("topic");
      const is = await prisma.instructor.findMany({
        where: { isIndustryLeader: args.industry_leaders === true, ...(cityIds ? { cityId: { in: cityIds } } : {}), ...(topic ? { OR: [{ subjectTaught: { contains: topic, mode: "insensitive" } }, { tags: { has: topic } }] } : {}) },
        include: { city: { select: { name: true } } }, orderBy: { order: "asc" }, take: 8,
      });
      return is.map((i) => ({ name: i.name, teaches: i.subjectTaught, experienceYears: i.experienceYears, city: i.city.name, expertise: i.tags, about: i.bio.slice(0, 200) }));
    }
    case "get_hiring_partners": {
      const sector = s("sector");
      const tag = sector ? DOMAIN_TAGS.find((t) => norm(t).includes(norm(sector)) || norm(sector).includes(norm(t))) : null;
      const ps = await prisma.hiringPartner.findMany({ where: tag ? { tags: { has: tag } } : {}, orderBy: { order: "asc" }, take: 40, select: { name: true } });
      return { sector: tag ?? "all", companies: ps.map((p) => p.name), note: ps.length === 40 ? "List truncated; there are more." : undefined };
    }
    case "get_placement_stats": {
      const hs = await prisma.homeScreenSettings.findFirst();
      const stories = await prisma.successStory.findMany({ select: { packageLabel: true } });
      return {
        placementRecord: hs ? `${hs.placementRecordPercent} — ${hs.placementRecordCaption}` : null,
        highestPackage: highestPackage(stories.map((s) => s.packageLabel)),
      };
    }
    case "get_success_stories": {
      const cityIds = await cityIdsFor(s("city"));
      const course = s("course");
      const ss = await prisma.successStory.findMany({ where: { ...(course ? { courseName: { contains: course, mode: "insensitive" } } : {}), ...(cityIds ? { cityId: { in: cityIds } } : {}) }, orderBy: { order: "asc" }, take: 6 });
      return ss.map((x) => ({ student: x.studentName, course: x.courseName, role: x.roleLanded, company: x.company, package: x.packageLabel }));
    }
    case "search_faqs": {
      const kw = keywords(s("query"));
      const faqs = await prisma.faq.findMany({ include: { category: { select: { name: true } } } });
      const ranked = faqs
        .map((f) => ({ f, sc: score(f.question, kw) * 3 + score(f.answer, kw) }))
        .filter((x) => x.sc > 0)
        .sort((a, b) => b.sc - a.sc)
        .slice(0, 4);
      return ranked.length ? ranked.map(({ f }) => ({ category: f.category.name, question: f.question, answer: f.answer.slice(0, 700) })) : { note: "No FAQ matched." };
    }
    case "get_degree_recommendation": {
      const q = norm(s("degree"));
      const recs = await prisma.degreeRecommendation.findMany({ include: { choice1Program: true, choice2Program: true, choice3Program: true } });
      const r = recs.find((x) => norm(x.degree) === q) ?? recs.find((x) => norm(x.degree).includes(q) || q.includes(norm(x.degree)));
      if (!r) return { note: "No specific recommendation for that degree.", knownDegrees: recs.map((x) => x.degree) };
      return { degree: r.degree, best: r.choice1Program && { program: r.choice1Program.name, why: r.choice1Why }, alsoGreat: r.choice2Program && { program: r.choice2Program.name, why: r.choice2Why }, worthExploring: r.choice3Program && { program: r.choice3Program.name, why: r.choice3Why } };
    }
    case "get_centre_contact": {
      const cityIds = await cityIdsFor(s("city"));
      const cs = await prisma.cityContact.findMany({ where: cityIds ? { cityId: { in: cityIds } } : {}, include: { city: { select: { name: true } } }, take: 4 });
      return cs.length ? cs.map((c) => ({ city: c.city.name, address: c.address, phone: c.phone, email: c.email })) : { note: "No centre contact found for that city." };
    }
    case "search_career_services_policy": {
      const pol = await prisma.careerServicesPolicy.findFirst();
      if (!pol) return { note: "Policy not available." };
      const kw = keywords(s("query"));
      const paras = pol.body.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
      const hits = paras.map((p) => ({ p, sc: score(p, kw) })).filter((x) => x.sc > 0).sort((a, b) => b.sc - a.sc).slice(0, 3);
      return hits.length ? hits.map((h) => h.p.slice(0, 600)) : { note: "Nothing in the policy matched." };
    }
    default:
      return { error: `Unknown tool ${name}` };
  }
}

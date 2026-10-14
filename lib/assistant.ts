import { prisma } from "@/lib/prisma";
import { chat, LlmError, type ChatMessage } from "@/lib/llm";
import { ASSISTANT_TOOLS, runTool } from "@/lib/assistantTools";

export type Turn = { role: "user" | "assistant"; content: string };
export type LearnerContext = {
  degree?: string | null;
  occupation?: string | null;
  yearsOfExperience?: number | null;
  interests?: string[];
  citySlug?: string | null;
  /** Console page the counsellor is currently looking at, e.g. /console/programs/data-science. */
  page?: string | null;
};
export type AnswerLink = { label: string; url: string };

/** Pages the assistant may point to for each kind of lookup. */
const PAGE_FOR_TOOL: Record<string, AnswerLink> = {
  get_upcoming_batches: { label: "Upcoming batches", url: "/console/batches" },
  get_placement_drives: { label: "Placement drives", url: "/console/drives" },
  get_upcoming_events: { label: "Events", url: "/console/events" },
  search_faqs: { label: "FAQs", url: "/console/faq" },
  get_centre_contact: { label: "Centre contacts", url: "/console/contact" },
  search_career_services_policy: { label: "Career services policy", url: "/console/career-services-policy" },
};

const MAX_STEPS = 4;

async function systemPrompt(ctx: LearnerContext) {
  const city = ctx.citySlug ? await prisma.city.findUnique({ where: { slug: ctx.citySlug }, select: { name: true } }) : null;
  const learner = [
    ctx.degree && `graduation: ${ctx.degree}`,
    ctx.occupation && `${ctx.occupation}${ctx.yearsOfExperience != null ? `, ${ctx.yearsOfExperience} years of experience` : ""}`,
    ctx.interests?.length && `interested in: ${ctx.interests.join(", ")}`,
    city && `preferred city: ${city.name}`,
  ].filter(Boolean).join("; ");
  const page = ctx.page && /^\/console(\/[a-z0-9-]+)*$/.test(ctx.page) ? ctx.page : null;

  return `You are the voice assistant for upGrad X counsellors, who run in-person counselling sessions for prospective learners. A counsellor asks you a question out loud and your answer is read aloud, so:
- Answer in one to three short, natural spoken sentences. No lists, no markdown, no symbols, no URLs.
- Say money and numbers the way a person would ("seven lakh per annum", "the twelfth of October").
- Use ONLY facts returned by your tools. Never invent fees, dates, batches, names or policies. If the tools don't have it, say so plainly and suggest checking with the centre.
- Always call a tool for anything about programs, batches, drives, events, instructors, partners, placements, fees, contacts or policies; the data changes daily.
- If the counsellor doesn't name a city, use the learner's preferred city when relevant; if that city has nothing, say so and mention what exists elsewhere.
- Follow-up questions ("are these available in Hyderabad?", "what about the second one?", "and the fees?") refer to the programs and topics in the previous turns: resolve "these/that/it/they" from the conversation, then look up each program named there with the new detail (e.g. its batches in the city asked about) instead of asking which program they mean.
- This is one continuous counselling session: remember everything said earlier (the learner's city, interests, programs discussed, certifications, placements) and use it for later questions without asking again.
- When it helps, finish with a line "Links:" followed by up to three markdown links, e.g. "Links: [Data Science program](/console/programs/data-science) [Course webpage](https://...)". Only use URLs that appeared in tool results (consolePage, courseWebpage) or the pages /console/batches, /console/drives, /console/events, /console/faq, /console/contact. Never put links in the spoken sentences themselves.
- Batches shown are only those still open for applications; online batches are open to everyone.
${page ? `The counsellor currently has this page open: ${page} (the program in its path, if any, is what "this course" means).` : ""}
${learner ? `Current learner (for context only): ${learner}.` : "No learner profile is available yet."}`;
}

export async function answerQuestion(question: string, history: Turn[], ctx: LearnerContext): Promise<{ text: string; links: AnswerLink[] }> {
  const allowed = new Map<string, string>();
  const messages: ChatMessage[] = [
    { role: "system", content: await systemPrompt(ctx) },
    ...history.slice(-10).map((t) => ({ role: t.role, content: t.content }) as ChatMessage),
    { role: "user", content: question },
  ];

  let useTools = true;
  for (let step = 0; step < MAX_STEPS; step++) {
    let msg;
    try {
      msg = await chat(messages, useTools ? ASSISTANT_TOOLS : undefined);
    } catch (err) {
      // Open models occasionally emit a malformed tool call; retry once without forcing tools.
      if (err instanceof LlmError && err.code === "tool_use_failed" && useTools) {
        useTools = false;
        continue;
      }
      throw err;
    }
    if (!msg.tool_calls?.length) {
      return splitLinks((msg.content ?? "").trim() || "Sorry, I couldn't come up with an answer for that.", allowed);
    }
    messages.push({ role: "assistant", content: msg.content ?? null, tool_calls: msg.tool_calls });
    for (const call of msg.tool_calls) {
      let result: unknown;
      try {
        result = await runTool(call.function.name, JSON.parse(call.function.arguments || "{}"));
      } catch (err) {
        console.error("assistant tool failed:", call.function.name, err);
        result = { error: "That lookup failed." };
      }
      const page = PAGE_FOR_TOOL[call.function.name];
      if (page) allowed.set(page.url, page.label);
      collectUrls(result, allowed);
      messages.push({ role: "tool", tool_call_id: call.id, content: JSON.stringify(result).slice(0, 6000) });
    }
  }
  return { text: "Sorry, that took too many steps. Could you ask it a bit more simply?", links: [] };
}

/** Collect the URLs a tool actually returned, so the model can only link to real pages. */
function collectUrls(v: unknown, into: Map<string, string>) {
  if (Array.isArray(v)) return v.forEach((x) => collectUrls(x, into));
  if (v && typeof v === "object") {
    const o = v as Record<string, unknown>;
    for (const k of ["consolePage", "courseWebpage"]) {
      const u = o[k];
      if (typeof u === "string" && !into.has(u)) into.set(u, k === "courseWebpage" ? "Course webpage" : String(o.name ?? "Program page"));
    }
    Object.values(o).forEach((x) => typeof x === "object" && collectUrls(x, into));
  }
}

/** Separate the spoken answer from its trailing "Links:" line, keeping only URLs from real lookups. */
export function splitLinks(raw: string, allowed: Map<string, string>): { text: string; links: AnswerLink[] } {
  const m = raw.match(/\n*\s*Links?:\s*([\s\S]*)$/i);
  const text = (m ? raw.slice(0, m.index) : raw).trim();
  const links: AnswerLink[] = [];
  if (m) {
    for (const [, label, url] of m[1].matchAll(/\[([^\]]+)\]\(([^)\s]+)\)/g)) {
      if (allowed.has(url) && !links.some((l) => l.url === url)) links.push({ label: label.trim().slice(0, 60), url });
    }
  }
  return { text, links: links.slice(0, 3) };
}

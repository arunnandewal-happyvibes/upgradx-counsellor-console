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

  return `You are the voice assistant for upGrad X counsellors, who run in-person counselling sessions for prospective learners. A counsellor asks you a question out loud and your answer is read aloud, so:
- Answer in one to three short, natural spoken sentences. No lists, no markdown, no symbols, no URLs.
- Say money and numbers the way a person would ("seven lakh per annum", "the twelfth of October").
- Use ONLY facts returned by your tools. Never invent fees, dates, batches, names or policies. If the tools don't have it, say so plainly and suggest checking with the centre.
- Always call a tool for anything about programs, batches, drives, events, instructors, partners, placements, fees, contacts or policies; the data changes daily.
- If the counsellor doesn't name a city, use the learner's preferred city when relevant; if that city has nothing, say so and mention what exists elsewhere.
- Follow-up questions ("are these available in Hyderabad?", "what about the second one?", "and the fees?") refer to the programs and topics in the previous turns: resolve "these/that/it/they" from the conversation, then look up each program named there with the new detail (e.g. its batches in the city asked about) instead of asking which program they mean.
- Batches shown are only those still open for applications; online batches are open to everyone.
${learner ? `Current learner (for context only): ${learner}.` : "No learner profile is available yet."}`;
}

export async function answerQuestion(question: string, history: Turn[], ctx: LearnerContext): Promise<string> {
  const messages: ChatMessage[] = [
    { role: "system", content: await systemPrompt(ctx) },
    ...history.slice(-6).map((t) => ({ role: t.role, content: t.content }) as ChatMessage),
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
      return (msg.content ?? "").trim() || "Sorry, I couldn't come up with an answer for that.";
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
      messages.push({ role: "tool", tool_call_id: call.id, content: JSON.stringify(result).slice(0, 6000) });
    }
  }
  return "Sorry, that took too many steps. Could you ask it a bit more simply?";
}

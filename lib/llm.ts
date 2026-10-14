// Chat model access through any OpenAI-compatible /chat/completions endpoint. Defaults to Groq's
// hosted open-weight model (free tier; model names change, so override with LLM_MODEL if one is retired); set LLM_BASE_URL / LLM_MODEL to use another host, a local Ollama
// (http://localhost:11434/v1), or Claude through a compatible gateway — nothing else changes.

const DEFAULT_BASE_URL = "https://api.groq.com/openai/v1";
const DEFAULT_MODEL = "openai/gpt-oss-120b";

export function llmConfig() {
  return {
    apiKey: process.env.LLM_API_KEY ?? process.env.GROQ_API_KEY ?? "",
    baseUrl: (process.env.LLM_BASE_URL ?? DEFAULT_BASE_URL).replace(/\/$/, ""),
    model: process.env.LLM_MODEL ?? DEFAULT_MODEL,
  };
}

export function llmEnabled() {
  return Boolean(llmConfig().apiKey) || Boolean(process.env.LLM_BASE_URL);
}

export type ChatMessage =
  | { role: "system" | "user"; content: string }
  | { role: "assistant"; content: string | null; tool_calls?: ToolCall[] }
  | { role: "tool"; tool_call_id: string; content: string };

export type ToolCall = { id: string; type: "function"; function: { name: string; arguments: string } };

export type ToolSpec = {
  type: "function";
  function: { name: string; description: string; parameters: Record<string, unknown> };
};

export class LlmError extends Error {
  constructor(message: string, readonly status: number, readonly code?: string) {
    super(message);
  }
}

export async function chat(messages: ChatMessage[], tools?: ToolSpec[], retried = false): Promise<{ content: string | null; tool_calls?: ToolCall[] }> {
  const { apiKey, baseUrl, model } = llmConfig();
  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}) },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.3,
      max_tokens: 600, // short spoken answers; also keeps us inside free-tier per-minute token limits
      ...(model.includes("gpt-oss") ? { reasoning_effort: "low" } : {}),
      ...(tools ? { tools, tool_choice: "auto" } : {}),
    }),
  });
  if (!res.ok) {
    let code: string | undefined;
    let detail = "";
    try {
      const j = await res.json();
      code = j?.error?.code;
      detail = String(j?.error?.message ?? "").slice(0, 300);
    } catch {}
    // Free tiers cap tokens per minute; a brief wait usually clears it.
    if (res.status === 429 && !retried) {
      const wait = Number(/try again in ([\d.]+)s/i.exec(detail)?.[1]);
      if (Number.isFinite(wait) && wait <= 8) {
        await new Promise((r) => setTimeout(r, wait * 1000 + 300));
        return chat(messages, tools, true);
      }
    }
    throw new LlmError(`Chat model failed (${res.status}): ${detail}`, res.status, code);
  }
  const json = await res.json();
  return json.choices?.[0]?.message;
}

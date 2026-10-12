import type { SynthesisInput } from "./llm.js";
import { log } from "../util/log.js";

/**
 * OpenAI via the Chat Completions REST endpoint (no extra dependency).
 * Model: --model, then WATERCOLOR_OPENAI_MODEL, then a default flagship.
 */
export async function synthesizeOpenAI(input: SynthesisInput, modelOverride?: string): Promise<string> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error("OPENAI_API_KEY is not set.");
  const model = modelOverride ?? process.env.WATERCOLOR_OPENAI_MODEL ?? "gpt-5.5";
  const base = (process.env.OPENAI_BASE_URL ?? "https://api.openai.com/v1").replace(/\/$/, "");
  log.step(`Synthesizing strategy with ${model} (${input.images.length} screenshots)`);

  let res: Response;
  try {
    res = await fetch(`${base}/chat/completions`, {
      method: "POST",
      headers: { authorization: `Bearer ${key}`, "content-type": "application/json" },
      signal: AbortSignal.timeout(15 * 60_000),
      body: JSON.stringify({
        model,
        response_format: { type: "json_object" },
        max_completion_tokens: 32_000,
        messages: [
          { role: "system", content: input.system },
          {
            role: "user",
            content: [
              ...input.images.map((i) => ({ type: "image_url", image_url: { url: `data:${i.mime};base64,${i.base64}`, detail: "high" } })),
              { type: "text", text: input.prompt },
            ],
          },
        ],
      }),
    });
  } catch (e) {
    throw new Error(`Couldn't reach the OpenAI API — check your connection. (${(e as Error).message})`);
  }

  if (!res.ok) {
    const body = await res.text();
    const msg = (() => {
      try {
        return (JSON.parse(body) as { error?: { message?: string } }).error?.message ?? body;
      } catch {
        return body;
      }
    })().slice(0, 400);
    if (res.status === 401) throw new Error("OpenAI rejected the API key. Check OPENAI_API_KEY.");
    if (res.status === 429) throw new Error(`OpenAI rate limit or quota reached: ${msg}`);
    if (res.status === 404 || /model/i.test(msg)) throw new Error(`OpenAI couldn't use model "${model}": ${msg}\nPick another with --model or WATERCOLOR_OPENAI_MODEL.`);
    throw new Error(`OpenAI API error ${res.status}: ${msg}`);
  }

  const data = (await res.json()) as { choices?: { message?: { content?: string; refusal?: string | null }; finish_reason?: string }[] };
  const choice = data.choices?.[0];
  if (choice?.message?.refusal) throw new Error(`The model declined to write a strategy: ${choice.message.refusal}`);
  if (choice?.finish_reason === "length") throw new Error("Strategy output was truncated (token limit). Try again.");
  const text = choice?.message?.content;
  if (!text) throw new Error("OpenAI returned an empty response.");
  return text;
}

import Anthropic from "@anthropic-ai/sdk";
import type { SynthesisInput } from "./llm.js";
import { log } from "../util/log.js";

/** Claude via the Anthropic SDK: streamed, adaptive thinking, server-side refusal fallback. */
export async function synthesizeAnthropic(input: SynthesisInput, modelOverride?: string): Promise<string> {
  const model = modelOverride ?? process.env.WATERCOLOR_MODEL ?? "claude-opus-5-5";
  log.step(`Synthesizing strategy with ${model} (${input.images.length} screenshots)`);
  const client = new Anthropic();
  const stream = client.beta.messages.stream({
    model,
    max_tokens: 64000,
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    thinking: { type: "adaptive" },
    output_config: { effort: "high" },
    system: [{ type: "text", text: input.system, cache_control: { type: "ephemeral" } }],
    messages: [
      {
        role: "user",
        content: [
          ...input.images.map((i) => ({ type: "image" as const, source: { type: "base64" as const, media_type: i.mime, data: i.base64 } })),
          { type: "text", text: input.prompt },
        ],
      },
    ],
  });
  let msg: Anthropic.Beta.BetaMessage;
  try {
    msg = await stream.finalMessage();
  } catch (e) {
    if (e instanceof Anthropic.AuthenticationError) throw new Error("Anthropic API rejected the credentials. Set a valid ANTHROPIC_API_KEY (or log in with `ant auth login`), or use OpenAI with --provider openai.");
    if (e instanceof Anthropic.RateLimitError) throw new Error("Rate limited by the Anthropic API — wait a moment and retry.");
    if (e instanceof Anthropic.BadRequestError) throw new Error(`Anthropic API rejected the request: ${e.message}`);
    if (e instanceof Anthropic.APIConnectionError) throw new Error("Couldn't reach the Anthropic API — check your connection.");
    throw e;
  }
  if (msg.stop_reason === "refusal") throw new Error(`The model declined to write a strategy (${msg.stop_details?.category ?? "no category"}).`);
  if (msg.stop_reason === "max_tokens") throw new Error("Strategy output was truncated (max_tokens). Try again.");
  return msg.content.flatMap((b) => (b.type === "text" ? [b.text] : [])).join("");
}

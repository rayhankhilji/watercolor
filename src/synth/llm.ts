import path from "node:path";
import { readFile } from "node:fs/promises";
import Anthropic from "@anthropic-ai/sdk";
import type { BrandProfile } from "../profile/schema.js";
import type { BrandStrategy } from "../profile/strategy.js";
import { buildBrief } from "./brief.js";
import { readJson, writeJson, exists } from "../util/fs.js";
import { log } from "../util/log.js";
import { REFERENCE_FILES, readReference } from "./references.js";

/**
 * Standalone strategy synthesis via the Anthropic API.
 * When watercolor runs as an Agent Skill, the agent itself does this step and this
 * command is never needed. Credentials resolve the SDK's usual way (ANTHROPIC_API_KEY,
 * ANTHROPIC_AUTH_TOKEN, or an `ant auth login` profile).
 */
export async function synthesize(dir: string, o: { model?: string } = {}) {
  const profile = await readJson<BrandProfile>(path.join(dir, "brand.json"));
  const sp = path.join(dir, "strategy.json");
  const current = (await exists(sp)) ? await readJson<BrandStrategy>(sp) : ({ version: "1", mode: "extract" } as BrandStrategy);
  const brief = buildBrief(profile, current.mode);
  const model = o.model ?? process.env.WATERCOLOR_MODEL ?? "claude-opus-5-5";

  // Screenshots: desktop + mobile viewport, plus the first canvas still (≤ 4 images).
  const shots = [
    ...profile.screenshots.filter((s) => !s.fullPage).slice(0, 3).map((s) => s.path),
    ...profile.media.canvases.filter((c) => c.poster).slice(0, 1).map((c) => c.poster!),
  ];
  const images: Anthropic.Beta.BetaImageBlockParam[] = [];
  for (const s of shots) {
    const file = path.join(dir, s);
    if (!(await exists(file))) continue;
    const media_type = s.endsWith(".png") ? "image/png" : "image/jpeg";
    images.push({ type: "image", source: { type: "base64", media_type, data: (await readFile(file)).toString("base64") } });
  }
  const refs = (await Promise.all(REFERENCE_FILES.map(async (f) => `<reference name="${f}">\n${await readReference(f)}\n</reference>`))).join("\n\n");

  log.step(`Synthesizing strategy with ${model} (${images.length} screenshots, mode ${current.mode})`);
  const client = new Anthropic();
  const stream = client.beta.messages.stream({
    model,
    max_tokens: 64000,
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    thinking: { type: "adaptive" },
    output_config: { effort: "high" },
    system: [
      {
        type: "text",
        text: `You are a senior brand strategist and design director. You write precise, evidence-grounded brand strategy — never generic filler. Use the reference library below as your training in what great (and sloppy) brand work looks like.\n\n${refs}`,
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: [
      {
        role: "user",
        content: [
          ...images,
          { type: "text", text: `${brief}\n\nRespond with ONLY the strategy.json object as raw JSON (no prose, no code fences). Keep "version": "1" and "mode": "${current.mode}".` },
        ],
      },
    ],
  });
  let msg: Anthropic.Beta.BetaMessage;
  try {
    msg = await stream.finalMessage();
  } catch (e) {
    if (e instanceof Anthropic.AuthenticationError) throw new Error("Anthropic API rejected the credentials. Set a valid ANTHROPIC_API_KEY (or log in with `ant auth login`). Running as an Agent Skill? Skip this command — the agent writes strategy.json itself.");
    if (e instanceof Anthropic.RateLimitError) throw new Error("Rate limited by the Anthropic API — wait a moment and retry.");
    if (e instanceof Anthropic.BadRequestError) throw new Error(`Anthropic API rejected the request: ${e.message}`);
    if (e instanceof Anthropic.APIConnectionError) throw new Error("Couldn't reach the Anthropic API — check your connection.");
    throw e;
  }
  if (msg.stop_reason === "refusal") throw new Error(`The model declined to write a strategy (${msg.stop_details?.category ?? "no category"}).`);
  if (msg.stop_reason === "max_tokens") throw new Error("Strategy output was truncated (max_tokens). Try again.");
  const text = msg.content.flatMap((b) => (b.type === "text" ? [b.text] : [])).join("");
  const strategy = parseStrategy(text, current);
  await writeJson(sp, strategy);
  log.ok(`strategy.json written (${Object.keys(strategy).length} sections) — now run \`watercolor build ${dir}\``);
  return strategy;
}

export function parseStrategy(text: string, base: BrandStrategy): BrandStrategy {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start < 0 || end < start) throw new Error("No JSON object found in the model response.");
  let parsed: unknown;
  try {
    parsed = JSON.parse(text.slice(start, end + 1));
  } catch (e) {
    throw new Error(`Model returned invalid JSON: ${(e as Error).message}`);
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("strategy.json must be an object.");
  return { ...base, ...(parsed as BrandStrategy), version: "1", mode: base.mode };
}

import path from "node:path";
import { readFile } from "node:fs/promises";
import type { BrandProfile } from "../profile/schema.js";
import type { BrandStrategy } from "../profile/strategy.js";
import { buildBrief } from "./brief.js";
import { readJson, writeJson, exists } from "../util/fs.js";
import { log } from "../util/log.js";
import { REFERENCE_FILES, readReference } from "./references.js";

/**
 * Standalone strategy synthesis — writes strategy.json with an LLM when no agent is driving
 * (CI, scripts, plain CLI use). When watercolor runs as an Agent Skill, the agent does this
 * step itself and this command isn't needed.
 *
 * Providers: Claude (ANTHROPIC_API_KEY or an `ant auth login` profile) or OpenAI (OPENAI_API_KEY).
 */
export type Provider = "anthropic" | "openai";

export interface SynthesisInput {
  system: string;
  prompt: string;
  images: { mime: "image/png" | "image/jpeg"; base64: string }[];
}

export async function synthesize(dir: string, o: { model?: string; provider?: Provider } = {}) {
  const profile = await readJson<BrandProfile>(path.join(dir, "brand.json"));
  const sp = path.join(dir, "strategy.json");
  const current = (await exists(sp)) ? await readJson<BrandStrategy>(sp) : ({ version: "1", mode: "extract" } as BrandStrategy);
  const provider = o.provider ?? pickProvider();

  // Screenshots: desktop + mobile viewport, plus the first canvas still (≤ 4 images).
  const shots = [
    ...profile.screenshots.filter((s) => !s.fullPage).slice(0, 3).map((s) => s.path),
    ...profile.media.canvases.filter((c) => c.poster).slice(0, 1).map((c) => c.poster!),
  ];
  const images: SynthesisInput["images"] = [];
  for (const s of shots) {
    const file = path.join(dir, s);
    if (!(await exists(file))) continue;
    images.push({ mime: s.endsWith(".png") ? "image/png" : "image/jpeg", base64: (await readFile(file)).toString("base64") });
  }
  const refs = (await Promise.all(REFERENCE_FILES.map(async (f) => `<reference name="${f}">\n${await readReference(f)}\n</reference>`))).join("\n\n");
  const input: SynthesisInput = {
    system: `You are a senior brand strategist and design director. You write precise, evidence-grounded brand strategy — never generic filler. Use the reference library below as your training in what great (and sloppy) brand work looks like.\n\n${refs}`,
    prompt: `${buildBrief(profile, current.mode)}\n\nRespond with ONLY the strategy.json object as raw JSON (no prose, no code fences). Keep "version": "1" and "mode": "${current.mode}".`,
    images,
  };

  const run = provider === "openai" ? (await import("./openai.js")).synthesizeOpenAI : (await import("./anthropic.js")).synthesizeAnthropic;
  const text = await run(input, o.model);
  const strategy = parseStrategy(text, current);
  await writeJson(sp, strategy);
  log.ok(`strategy.json written (${Object.keys(strategy).length} sections) — now run \`watercolor build ${dir}\``);
  return strategy;
}

function pickProvider(): Provider {
  if (process.env.WATERCOLOR_PROVIDER === "openai" || process.env.WATERCOLOR_PROVIDER === "anthropic") return process.env.WATERCOLOR_PROVIDER;
  if (process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN) return "anthropic";
  if (process.env.OPENAI_API_KEY) return "openai";
  throw new Error("No LLM credentials found. Set ANTHROPIC_API_KEY (Claude) or OPENAI_API_KEY (OpenAI) — or run watercolor as an Agent Skill, where the agent writes strategy.json itself.");
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

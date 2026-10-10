import path from "node:path";
import { loadBrand, type ResolvedBrand } from "../profile/resolve.js";
import { write } from "../util/fs.js";
import { log } from "../util/log.js";
import { describeColor } from "../util/color.js";

/**
 * Optional, pluggable image generation for the things code can't draw well:
 * photographic campaign imagery, illustration in the brand's style, product-in-scene shots.
 * Prompts are composed from the extracted brand profile so output stays on-brand.
 *
 * Providers (first available wins): OpenAI Images (OPENAI_API_KEY), fal.ai (FAL_KEY).
 */
export interface ImageProvider {
  name: string;
  generate(prompt: string, size: { width: number; height: number }): Promise<Uint8Array>;
}

const openai = (): ImageProvider | null => {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;
  const model = process.env.WATERCOLOR_IMAGE_MODEL ?? "gpt-image-1";
  return {
    name: `openai:${model}`,
    async generate(prompt, size) {
      const s = size.width > size.height ? "1536x1024" : size.width < size.height ? "1024x1536" : "1024x1024";
      const res = await fetch("https://api.openai.com/v1/images/generations", {
        method: "POST",
        headers: { authorization: `Bearer ${key}`, "content-type": "application/json" },
        body: JSON.stringify({ model, prompt, size: s, n: 1 }),
      });
      if (!res.ok) throw new Error(`OpenAI images ${res.status}: ${(await res.text()).slice(0, 300)}`);
      const j = (await res.json()) as { data: { b64_json?: string; url?: string }[] };
      const d = j.data[0];
      if (d.b64_json) return Buffer.from(d.b64_json, "base64");
      if (d.url) return new Uint8Array(await (await fetch(d.url)).arrayBuffer());
      throw new Error("OpenAI returned no image");
    },
  };
};

const fal = (): ImageProvider | null => {
  const key = process.env.FAL_KEY;
  if (!key) return null;
  const model = process.env.WATERCOLOR_FAL_MODEL ?? "fal-ai/flux-pro/v1.1";
  return {
    name: `fal:${model}`,
    async generate(prompt, size) {
      const res = await fetch(`https://fal.run/${model}`, {
        method: "POST",
        headers: { authorization: `Key ${key}`, "content-type": "application/json" },
        body: JSON.stringify({ prompt, image_size: { width: size.width, height: size.height } }),
      });
      if (!res.ok) throw new Error(`fal ${res.status}: ${(await res.text()).slice(0, 300)}`);
      const j = (await res.json()) as { images: { url: string }[] };
      return new Uint8Array(await (await fetch(j.images[0].url)).arrayBuffer());
    },
  };
};

export function artDirection(b: ResolvedBrand) {
  const pal = [b.roles.primary, ...b.roles.accent.slice(0, 3)].map((c) => `${describeColor(c).toLowerCase()} (${c})`).join(", ");
  const imagery = b.strategy.visual?.imagery ?? "";
  const personality = b.strategy.personality?.traits?.map((t) => t.trait.toLowerCase()).join(", ") ?? "";
  const kinds = b.profile.imagery.summary;
  const leaning = kinds.photo >= kinds.illustration ? "editorial photography" : "flat, considered illustration";
  return [
    `Art direction for ${b.name}: ${imagery || leaning}.`,
    personality && `Mood: ${personality}.`,
    `Palette restricted to ${pal}, with ${b.scheme === "dark" ? "deep dark" : "clean light"} neutrals.`,
    "No text, no logos, no watermarks. No generic stock tropes, no glossy 3D blobs, no robot hands, no neon cyberpunk.",
  ]
    .filter(Boolean)
    .join(" ");
}

export async function imagine(dir: string, o: { count?: number; prompt?: string }) {
  const provider = openai() ?? fal();
  if (!provider) {
    log.error("No image provider configured. Set OPENAI_API_KEY (OpenAI Images) or FAL_KEY (fal.ai). Everything else in watercolor works without one.");
    process.exitCode = 1;
    return;
  }
  const b = await loadBrand(dir);
  const dirn = path.join(dir, "imagery");
  const base = artDirection(b);
  const subjects = [
    { name: "hero", size: { width: 1536, height: 1024 }, subject: `A hero image expressing: ${b.copy.headline}` },
    { name: "people", size: { width: 1536, height: 1024 }, subject: `The people ${b.name} serves (${b.strategy.company?.audience?.primary ?? "its customers"}) in a real working moment` },
    { name: "abstract", size: { width: 1024, height: 1024 }, subject: `An abstract composition built from the brand palette and its ${b.profile.shape.language} shape language` },
    { name: "product-scene", size: { width: 1536, height: 1024 }, subject: `A device on a desk in a real environment showing a ${b.name} interface (screen content blurred)` },
  ];
  log.step(`Generating imagery with ${provider.name}`);
  for (const s of subjects) {
    for (let i = 0; i < (o.count ?? 1); i++) {
      const prompt = `${s.subject}. ${base}${o.prompt ? ` ${o.prompt}` : ""}`;
      try {
        const img = await provider.generate(prompt, s.size);
        const f = await write(path.join(dirn, `${s.name}-${i + 1}.png`), img);
        await write(path.join(dirn, `${s.name}-${i + 1}.prompt.txt`), prompt);
        log.ok(f);
      } catch (e) {
        log.warn(`${s.name}: ${(e as Error).message}`);
      }
    }
  }
}

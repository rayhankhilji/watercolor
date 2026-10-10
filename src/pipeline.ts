import path from "node:path";
import { capture, type CaptureOptions } from "./crawl/crawl.js";
import { buildProfile } from "./extract/index.js";
import { writeBrief } from "./synth/brief.js";
import { writeJson, readJson, exists } from "./util/fs.js";
import { log } from "./util/log.js";
import type { BrandProfile } from "./profile/schema.js";
import type { BrandMode, BrandStrategy } from "./profile/strategy.js";

export interface ExtractOptions extends Omit<CaptureOptions, "url" | "outDir"> {
  mode?: BrandMode;
}

export function normalizeUrl(input: string) {
  let u = input.trim();
  if (!/^https?:\/\//i.test(u)) u = `https://${u}`;
  return new URL(u).href;
}

export async function extract(url: string, outDir: string, opts: ExtractOptions = {}): Promise<BrandProfile> {
  const dir = path.resolve(outDir);
  const target = normalizeUrl(url);
  log.step(`Capturing ${target}`);
  const cap = await capture({ ...opts, url: target, outDir: dir });
  await writeJson(path.join(dir, ".watercolor", "capture.json"), cap);
  log.ok(`Captured ${cap.pages.length} page(s), ${cap.fonts.length} font files, ${cap.svgs.length} SVGs, ${cap.shaders.length} shaders, ${cap.canvasRecordings.length} canvas recordings, ${cap.videos.length} videos, ${cap.lotties.length} Lottie`);
  const profile = await buildProfile(cap, dir);
  await writeJson(path.join(dir, "brand.json"), profile);
  const mode = opts.mode ?? "extract";
  await writeBrief(profile, dir, mode);
  // Seed strategy.json with the chosen mode so `build` knows intent even before synthesis.
  const sp = path.join(dir, "strategy.json");
  if (!(await exists(sp))) await writeJson(sp, { version: "1", mode } satisfies BrandStrategy);
  else {
    const s = await readJson<BrandStrategy>(sp);
    if (opts.mode && s.mode !== opts.mode) await writeJson(sp, { ...s, mode: opts.mode });
  }
  log.ok(`brand.json written — ${profile.colors.palette.length} colors, ${profile.typography.families.length} type families, ${profile.icons.items.length} icons, logo: ${profile.logo.primary ? profile.logo.primary.format : "not found"}`);
  for (const w of profile.warnings) log.warn(w);
  return profile;
}

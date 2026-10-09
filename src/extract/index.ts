import { readFile } from "node:fs/promises";
import path from "node:path";
import type { CaptureResult } from "../crawl/crawl.js";
import { PROFILE_VERSION, type BrandProfile, type CssVariable, type TechStack, type Screenshot } from "../profile/schema.js";
import { summarizeCss, type CssSummary } from "../util/css.js";
import { parseColor } from "../util/color.js";
import { extractColors } from "./colors.js";
import { extractTypography } from "./typography.js";
import { extractSpacing, extractShape, extractLayout, extractMotion } from "./system.js";
import { extractLogo, extractIcons, extractImagery, extractMedia, extractComponents } from "./assets.js";
import { extractVoice, extractIdentity, extractCompany } from "./voice.js";
import { log } from "../util/log.js";
import { VERSION } from "../version.js";

export async function buildProfile(capture: CaptureResult, outDir: string): Promise<BrandProfile> {
  log.step("Analyzing stylesheets");
  const css = await loadCss(capture);
  const cssVariables = extractCssVariables(capture, css);

  log.step("Extracting identity, logo & icons");
  const identity = extractIdentity(capture);
  const logo = await extractLogo(capture, outDir, identity.name);
  const icons = await extractIcons(capture, outDir);

  log.step("Building color system");
  const logoColors = [...(logo.primary?.colors ?? []), ...(logo.mark?.colors ?? [])];
  const colors = extractColors({ capture, logoColors, cssVariables });

  log.step("Building type, spacing, shape, layout & motion systems");
  const typography = extractTypography(capture, css);
  const spacing = extractSpacing(capture);
  const shape = extractShape(capture);
  const layout = extractLayout(capture, css, spacing);
  const motion = extractMotion(capture, css);

  log.step("Cataloguing imagery, media & components");
  const imagery = await extractImagery(capture, outDir);
  const media = extractMedia(capture);
  const components = extractComponents(capture, colors.roles.background, colors.roles.primary);

  log.step("Reading voice & company signals");
  const voice = extractVoice(capture);
  const company = extractCompany(capture, voice, imagery.customerLogos.map((c) => c.name));

  const warnings: string[] = [...capture.errors];
  if (!logo.primary) warnings.push("No logo candidate found — add one to brand/captured/logos and re-run `watercolor build`.");
  if (logo.primary && logo.primary.format !== "svg") warnings.push("Primary logo is raster; vector variants will be traced from the favicon/mark where possible.");
  for (const f of typography.families) if (f.alternatives.length && f.source !== "google") warnings.push(`"${f.family}" looks proprietary — captured files are for reference only. Open alternatives: ${f.alternatives.join(", ")}.`);

  const screenshots: Screenshot[] = [];
  for (const p of capture.pages) {
    if (p.screenshot) screenshots.push({ path: p.screenshot, page: p.url, viewport: "desktop", fullPage: false });
    if (p.fullPage) screenshots.push({ path: p.fullPage, page: p.url, viewport: "desktop", fullPage: true });
  }
  if (capture.mobile) {
    screenshots.push({ path: capture.mobile.screenshot, page: capture.finalUrl, viewport: "mobile", fullPage: false });
    if (capture.mobile.fullPage) screenshots.push({ path: capture.mobile.fullPage, page: capture.finalUrl, viewport: "mobile", fullPage: true });
  }

  const profile: BrandProfile = {
    $schema: "https://raw.githubusercontent.com/rayhankhilji/watercolor/main/docs/brand.schema.json",
    version: PROFILE_VERSION,
    generatedAt: new Date().toISOString(),
    source: {
      url: capture.url,
      finalUrl: capture.finalUrl,
      origin: new URL(capture.finalUrl).origin,
      pages: capture.pages.map((p) => ({ url: p.url, title: p.raw.title as string, kind: p.kind, screenshot: p.screenshot })),
      tool: { name: "watercolor", version: VERSION },
    },
    identity,
    company,
    colors,
    typography,
    spacing,
    shape,
    layout,
    motion,
    logo,
    icons,
    imagery,
    media,
    components,
    voice,
    stack: extractStack(capture),
    cssVariables: cssVariables.slice(0, 300),
    screenshots,
    warnings,
  };
  return relativize(profile, outDir);
}

async function loadCss(capture: CaptureResult): Promise<CssSummary> {
  const merged: CssSummary = { fontFaces: [], keyframes: [], breakpoints: new Map(), customProps: [], containerQueries: 0, layers: 0 };
  const add = (s: CssSummary) => {
    merged.fontFaces.push(...s.fontFaces);
    for (const k of s.keyframes) if (!merged.keyframes.some((x) => x.name === k.name)) merged.keyframes.push(k);
    for (const [k, v] of s.breakpoints) merged.breakpoints.set(k, (merged.breakpoints.get(k) || 0) + v);
    merged.customProps.push(...s.customProps);
    merged.containerQueries += s.containerQueries;
    merged.layers += s.layers;
  };
  for (const c of capture.css) {
    try {
      add(summarizeCss(await readFile(c.path, "utf8"), c.url));
    } catch {
      /* skip */
    }
  }
  for (const p of capture.pages) if (p.raw.inlineCss) add(summarizeCss(p.raw.inlineCss as string, p.url));
  return merged;
}

const LENGTH_RE = /^-?[\d.]+(px|rem|em|%|vw|vh)$/;
function classifyVar(name: string, value: string): CssVariable["kind"] {
  const v = value.trim();
  if (/^(cubic-bezier|linear\(|steps\(|ease)/.test(v)) return "easing";
  if (/^[\d.]+m?s$/.test(v)) return "duration";
  if (/(\d+px\s+){2,}.*(rgba?|#|hsla?)/.test(v) && /shadow/i.test(name + v)) return "shadow";
  if (parseColor(v) && !/^\d/.test(v)) return "color";
  if (LENGTH_RE.test(v)) return "length";
  if (/font|family/i.test(name) && /[a-z]/i.test(v) && v.includes(",")) return "font";
  return "other";
}

function extractCssVariables(capture: CaptureResult, css: CssSummary): CssVariable[] {
  const vars = new Map<string, CssVariable>();
  for (const p of capture.pages) {
    for (const [name, value] of Object.entries(p.raw.rootVars as Record<string, string>)) {
      if (!value || vars.has(name)) continue;
      const kind = classifyVar(name, value);
      vars.set(name, { name, value, resolved: kind === "color" ? parseColor(value)?.hex : undefined, kind, count: 0 });
    }
  }
  for (const cp of css.customProps) {
    if (vars.has(cp.name)) continue;
    const kind = classifyVar(cp.name, cp.value);
    vars.set(cp.name, { name: cp.name, value: cp.value, resolved: kind === "color" ? parseColor(cp.value)?.hex : undefined, kind, count: 0 });
  }
  // Rough usage count from captured CSS text (cheap: count "var(--name" occurrences).
  return [...vars.values()].sort((a, b) => a.name.localeCompare(b.name));
}

function extractStack(capture: CaptureResult): TechStack {
  const s = capture.pages[0].raw.stack as Record<string, boolean | string>;
  const pick = (keys: [string, string][]) => keys.filter(([k]) => s[k]).map(([, n]) => n);
  return {
    frameworks: pick([["next", "Next.js"], ["nuxt", "Nuxt"], ["gatsby", "Gatsby"], ["astro", "Astro"], ["remix", "Remix"], ["sveltekit", "SvelteKit"]]),
    styling: pick([["tailwind", "Tailwind CSS"], ["styledComponents", "styled-components"], ["emotion", "Emotion"]]),
    animation: pick([["framerMotion", "framer-motion"], ["gsap", "GSAP"], ["lottie", "Lottie"], ["rive", "Rive"], ["three", "three.js"], ["lenis", "Lenis"], ["spline", "Spline"]]),
    platform: [...pick([["framer", "Framer"], ["webflow", "Webflow"], ["wordpress", "WordPress"], ["shopify", "Shopify"], ["squarespace", "Squarespace"], ["wix", "Wix"]]), ...(s.generator ? [String(s.generator)] : [])],
  };
}

/** Make every absolute path inside the brand dir relative to it, so brand.json is portable. */
function relativize<T>(obj: T, base: string): T {
  const walk = (v: unknown): unknown => {
    if (typeof v === "string" && path.isAbsolute(v) && v.startsWith(base)) return path.relative(base, v).split(path.sep).join("/");
    if (Array.isArray(v)) return v.map(walk);
    if (v && typeof v === "object") return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, walk(x)]));
    return v;
  };
  return walk(obj) as T;
}

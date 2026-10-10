import path from "node:path";
import { readFile } from "node:fs/promises";
import type { BrandProfile, ColorRoles, Hex, TypeStyle, FontFamily } from "./schema.js";
import type { BrandStrategy } from "./strategy.js";
import { EMPTY_STRATEGY } from "./strategy.js";
import { readJson, exists } from "../util/fs.js";
import { ramp, isNeutral, oklch, readableOn, mix, distance, isDark } from "../util/color.js";

export interface FontRef {
  family: string;
  /** CSS font-family value with sensible fallbacks. */
  stack: string;
  /** Absolute paths to captured font files (for local rendering only). */
  files: { path: string; weight: string; style: string; format: string }[];
  weights: number[];
  alternatives: string[];
  source: FontFamily["source"];
  classification: FontFamily["classification"];
}

export interface ResolvedBrand {
  dir: string;
  profile: BrandProfile;
  strategy: BrandStrategy;
  name: string;
  domain: string;
  url: string;
  tagline: string;
  description: string;
  roles: ColorRoles;
  scheme: "light" | "dark";
  ramps: BrandProfile["colors"]["ramps"];
  /** Signature gradient stops (from the site's own gradients / shader canvas, else derived). */
  gradient: Hex[];
  gradientIsCaptured: boolean;
  /** Still of the brand's signature animated canvas (WebGL hero), relative to the kit — the most authentic art. */
  signatureArt?: string;
  /** Largest captured hero image (product shot / illustration / photo) — art for flat brands. */
  heroImage?: string;
  fonts: { display: FontRef; body: FontRef; mono: FontRef };
  type: Record<string, TypeStyle>;
  radius: { none: number; sm: number; md: number; lg: number; xl: number; full: number; button: string; card: string };
  spacing: { base: number; scale: number[] };
  shadows: { name: string; value: string }[];
  motion: {
    fast: number;
    base: number;
    slow: number;
    standard: string;
    entrance: string;
    exit: string;
    emphasis: string;
  };
  logo: {
    primary?: string;
    primarySvg?: string;
    mark?: string;
    markSvg?: string;
    /** True when the primary logo is light-colored (designed for dark backgrounds). */
    primaryIsLight: boolean;
    monochrome: boolean;
  };
  copy: { headline: string; subhead: string; cta: string; secondaryCta: string; taglines: string[] };
  monochrome: boolean;
}

const FALLBACK_SANS = `ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`;
const FALLBACK_SERIF = `ui-serif, Georgia, Cambria, "Times New Roman", serif`;
const FALLBACK_MONO = `ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace`;

export async function loadBrand(dir: string): Promise<ResolvedBrand> {
  const profile = await readJson<BrandProfile>(path.join(dir, "brand.json"));
  const strategyPath = path.join(dir, "strategy.json");
  const strategy = (await exists(strategyPath)) ? await readJson<BrandStrategy>(strategyPath) : EMPTY_STRATEGY;
  return resolveBrand(profile, strategy, dir);
}

export async function resolveBrand(profile: BrandProfile, strategy: BrandStrategy, dir: string): Promise<ResolvedBrand> {
  const abs = (p?: string) => (p ? (path.isAbsolute(p) ? p : path.join(dir, p)) : undefined);
  const o = strategy.overrides ?? {};
  const roles: ColorRoles = { ...profile.colors.roles, ...(o.roles ?? {}), accent: o.roles?.accent ?? profile.colors.roles.accent };
  if (o.roles?.primary && !o.roles.primaryForeground) roles.primaryForeground = readableOn(roles.primary, [roles.background, "#ffffff", "#0a0a0a"]);
  const scheme = oklch(roles.background).l < 0.5 ? "dark" : "light";
  const monochrome = isNeutral(roles.primary, 0.045);

  const ramps = { ...profile.colors.ramps };
  if (o.roles?.primary) ramps.primary = ramp(o.roles.primary);
  if (o.roles?.accent) o.roles.accent.forEach((a, i) => (ramps[i ? `accent${i + 1}` : "accent"] = ramp(a)));

  // Signature gradient
  let gradient: Hex[] = o.gradient ?? [];
  let gradientIsCaptured = false;
  if (!gradient.length) {
    const g = profile.colors.gradients.find((x) => x.colors.length >= 2 && x.colors.some((c) => !isNeutral(c, 0.05)));
    if (g) {
      gradient = g.colors.slice(0, 5);
      gradientIsCaptured = true;
    }
  }
  if (gradient.length < 2) {
    const chroma = [roles.primary, ...roles.accent].filter((c) => !isNeutral(c, 0.04));
    if (chroma.length >= 2) gradient = chroma.slice(0, 4);
    else if (chroma.length === 1) {
      const p = oklch(chroma[0]);
      gradient = [mix(chroma[0], "#ffffff", 0.55), chroma[0], mix(chroma[0], roles.foreground, 0.4)];
      void p;
    } else gradient = scheme === "dark" ? [roles.background, mix(roles.background, "#ffffff", 0.18), roles.background] : [roles.background, mix(roles.background, roles.foreground, 0.12), roles.surface];
  }

  // Fonts
  const fams = profile.typography.families;
  const byRole = (role: string) => fams.find((f) => f.roles.includes(role as never));
  const toRef = (f: FontFamily | undefined, fallback: "sans" | "serif" | "mono", override?: string): FontRef => {
    if (override) return { family: override, stack: `"${override}", ${fallback === "mono" ? FALLBACK_MONO : fallback === "serif" ? FALLBACK_SERIF : FALLBACK_SANS}`, files: [], weights: [400, 500, 600, 700], alternatives: [], source: "google", classification: fallback === "mono" ? "mono" : fallback === "serif" ? "serif" : "sans" };
    if (!f) {
      const stack = fallback === "mono" ? FALLBACK_MONO : fallback === "serif" ? FALLBACK_SERIF : FALLBACK_SANS;
      return { family: fallback === "mono" ? "ui-monospace" : "system-ui", stack, files: [], weights: [400, 500, 600, 700], alternatives: [], source: "system", classification: fallback };
    }
    const cls = f.classification === "serif" ? FALLBACK_SERIF : f.classification === "mono" ? FALLBACK_MONO : FALLBACK_SANS;
    const alt = f.alternatives.filter((a) => !a.includes("(")).map((a) => `"${a}"`);
    return {
      family: f.family,
      stack: [`"${f.family}"`, ...alt.slice(0, 1), cls].join(", "),
      files: f.files.map((x) => ({ ...x, path: abs(x.path)! })),
      weights: f.weights,
      alternatives: f.alternatives,
      source: f.source,
      classification: f.classification,
    };
  };
  const display = toRef(byRole("display") ?? byRole("heading") ?? fams[0], "sans", o.fonts?.display);
  const body = toRef(byRole("body") ?? fams[0], "sans", o.fonts?.body);
  const mono = toRef(byRole("mono"), "mono", o.fonts?.mono);

  // Type styles with guaranteed keys
  const styles = Object.fromEntries(profile.typography.styles.map((s) => [s.name, s]));
  const base = profile.typography.scale.base || 16;
  const r = Math.min(Math.max(profile.typography.scale.ratio || 1.25, 1.15), 1.5);
  const mk = (name: string, size: number, weight: number, lh: number, ls: number, fam: FontRef, extra: Partial<TypeStyle> = {}): TypeStyle => ({
    name, family: fam.family, size: Math.round(size), weight, lineHeight: lh, letterSpacing: ls, textTransform: "none", fontStyle: "normal", features: "normal", usage: 0, tags: [], sample: "", ...extra,
  });
  const h1 = styles.h1 ?? styles.display ?? mk("h1", base * r ** 5, 600, 1.08, -0.025, display);
  const type: Record<string, TypeStyle> = {
    display: styles.display ?? { ...h1, name: "display", size: Math.round(Math.max(h1.size * 1.25, 56)), letterSpacing: Math.min(h1.letterSpacing, -0.02), lineHeight: Math.min(h1.lineHeight, 1.05) },
    h1,
    h2: styles.h2 ?? mk("h2", base * r ** 4, h1.weight, 1.12, -0.02, display),
    h3: styles.h3 ?? mk("h3", base * r ** 2.5, h1.weight, 1.2, -0.012, display),
    h4: styles.h4 ?? mk("h4", base * r ** 1.4, Math.max(500, h1.weight - 100), 1.3, -0.005, display),
    "body-lg": styles["body-lg"] ?? mk("body-lg", base * 1.15, 400, 1.55, 0, body),
    body: styles.body ?? mk("body", base, 400, 1.6, 0, body),
    "body-sm": styles["body-sm"] ?? mk("body-sm", base * 0.875, 400, 1.5, 0, body),
    label: styles.label ?? styles["label-sm"] ?? mk("label", base * 0.9375, 500, 1.2, 0, body),
    caption: styles.caption ?? mk("caption", base * 0.75, 400, 1.4, 0.01, body),
    eyebrow: styles.eyebrow ?? mk("eyebrow", base * 0.75, 600, 1.2, 0.08, body, { textTransform: "uppercase" }),
    code: styles.code ?? mk("code", base * 0.875, 400, 1.6, 0, mono),
  };

  // Radius
  const rad = profile.shape.radii.filter((x) => x.name !== "full").map((x) => parseFloat(x.value)).sort((a, b) => a - b);
  const hasFull = profile.shape.radii.some((x) => x.name === "full");
  const pickR = (q: number, fb: number) => (rad.length ? rad[Math.min(rad.length - 1, Math.floor(q * rad.length))] : fb);
  const radius = {
    none: 0,
    sm: pickR(0, 4),
    md: pickR(0.4, 8),
    lg: pickR(0.75, 12),
    xl: Math.max(pickR(0.99, 16), pickR(0.75, 12) * 1.5),
    full: 9999,
    button: "",
    card: "",
  };
  if (o.radius) radius.md = parseFloat(o.radius);
  const primaryBtn = profile.components.buttons.find((b) => b.variant === "primary") ?? profile.components.buttons[0];
  const rawBtn = primaryBtn?.styles["border-top-left-radius"];
  const btnH = parseFloat(primaryBtn?.styles["height"] ?? "0");
  // A radius of at least half the height is a pill, whatever the pixel value says.
  radius.button = rawBtn ? (btnH && parseFloat(rawBtn) >= btnH / 2 - 1 ? "9999px" : rawBtn) : hasFull && profile.shape.language === "pill" ? "9999px" : `${radius.md}px`;
  radius.card = profile.components.cards[0]?.styles["border-top-left-radius"] ?? `${radius.lg}px`;

  // Motion tokens
  const durs = profile.motion.durations.map((d) => d.ms).filter((d) => d >= 60 && d <= 1200);
  const near = (target: number, lo: number, hi: number) => durs.filter((d) => d >= lo && d <= hi).sort((a, b) => Math.abs(a - target) - Math.abs(b - target))[0] ?? target;
  const curves = profile.motion.easings.filter((e) => e.value.startsWith("cubic-bezier") || e.value.startsWith("linear("));
  const outCurve = curves.find((c) => /ease-out|deceler|Out|soft landing|spring/i.test(c.name + c.character));
  const standard = curves[0]?.value ?? "cubic-bezier(0.2, 0, 0, 1)";
  const motion = {
    fast: near(120, 60, 180),
    base: near(220, 150, 350),
    slow: near(480, 350, 900),
    standard,
    entrance: outCurve?.value ?? "cubic-bezier(0.16, 1, 0.3, 1)",
    exit: "cubic-bezier(0.7, 0, 0.84, 0)",
    emphasis: curves.find((c) => /overshoot|spring|Back/i.test(c.name + c.character))?.value ?? "cubic-bezier(0.34, 1.56, 0.64, 1)",
  };

  // Logo
  const primaryPath = abs(profile.logo.primary?.path);
  const markPath = abs(profile.logo.mark?.path);
  const primarySvg = primaryPath?.endsWith(".svg") ? await readFile(primaryPath, "utf8").catch(() => undefined) : undefined;
  const markSvg = markPath?.endsWith(".svg") ? await readFile(markPath, "utf8").catch(() => undefined) : undefined;
  const lcols = profile.logo.primary?.colors ?? [];
  const primaryIsLight = lcols.length > 0 && lcols.every((c) => oklch(c).l > 0.86);
  const logoMono = lcols.length <= 1 || lcols.every((c) => isNeutral(c, 0.04));

  // Copy
  const v = profile.voice;
  const headline = strategy.copy?.headlines?.[0] ?? profile.identity.tagline ?? v.headlines[0] ?? profile.identity.name;
  const subhead = strategy.company?.oneLiner ?? profile.identity.description ?? v.paragraphs[0] ?? "";
  const notCta = /consent|cookie|preferences|privacy|language|english|sign in|log in|login|menu|close|search|linkedin|twitter|instagram|youtube|facebook|tiktok|github|discord|^[←→‹›<>]+$/i;
  const primaryBtn2 = profile.components.buttons.find((x) => x.variant === "primary");
  const ctas = [primaryBtn2?.text, ...v.ctas].filter((c): c is string => !!c && c.split(" ").length <= 5 && !notCta.test(c)).filter((c, i, a) => a.indexOf(c) === i);
  return {
    dir,
    profile,
    strategy,
    name: strategy.company?.name ?? profile.identity.name,
    domain: profile.identity.domain,
    url: profile.source.finalUrl,
    tagline: strategy.voice?.taglines?.[0] ?? strategy.copy?.taglines?.[0] ?? profile.identity.tagline ?? "",
    description: strategy.company?.description ?? profile.identity.description ?? "",
    roles,
    scheme,
    ramps,
    gradient,
    gradientIsCaptured,
    signatureArt: pickSignatureArt(profile),
    heroImage: pickHeroImage(profile),
    fonts: { display, body, mono },
    type,
    radius,
    spacing: { base: profile.spacing.base, scale: profile.spacing.scale },
    shadows: profile.shape.shadows.map((s) => ({ name: s.name, value: s.value })),
    motion,
    logo: { primary: primaryPath, primarySvg, mark: markPath, markSvg, primaryIsLight, monochrome: logoMono },
    copy: { headline, subhead, cta: ctas[0] ?? "Get started", secondaryCta: ctas[1] ?? "Learn more", taglines: strategy.copy?.taglines ?? strategy.voice?.taglines ?? [] },
    monochrome,
  };
}

/** Pick the logo variant that reads on a given background. */
export function logoFor(brand: ResolvedBrand, bg: Hex): { svg?: string; recolor?: Hex } {
  const svg = brand.logo.primarySvg;
  if (!svg) return {};
  const dark = isDark(bg);
  if (brand.logo.primaryIsLight && !dark) return { svg, recolor: brand.roles.foreground };
  if (!brand.logo.primaryIsLight && dark && brand.logo.monochrome) return { svg, recolor: "#ffffff" };
  if (!brand.logo.primaryIsLight && dark) {
    // Multi-color logo on dark: keep colors only if they contrast; otherwise go white.
    const cols = brand.profile.logo.primary?.colors ?? [];
    const ok = cols.every((c) => distance(c, bg) > 0.25);
    return ok ? { svg } : { svg, recolor: "#ffffff" };
  }
  return { svg };
}

function pickSignatureArt(p: BrandProfile): string | undefined {
  // Largest WebGL/2D canvas still that is colorful (not a blank or monochrome UI canvas).
  const c = [...p.media.canvases]
    .filter((x) => x.poster && x.poster.endsWith(".png") && x.width * x.height >= 300_000)
    .sort((a, b) => b.width * b.height - a.width * a.height)[0];
  return c?.poster;
}

function pickHeroImage(p: BrandProfile): string | undefined {
  const brandWord = p.identity.domain.split(".")[0].toLowerCase();
  const ogFile = p.logo.ogImage ? p.logo.ogImage.split("/").pop() : undefined;
  // Real product UI and illustration beat photos (which are often video stills with logos baked in).
  const rank = { screenshot: 3, illustration: 2, photo: 1 } as Record<string, number>;
  const img = p.imagery.images
    .filter((i) => i.path && /\.(png|jpe?g|webp)$/i.test(i.path) && rank[i.kind] && i.displayWidth >= 480 && i.displayHeight >= 270)
    .filter((i) => !/og|opengraph|social|share|thumbnail|poster|logo|press/i.test(`${i.alt} ${i.url}`) && !(i.alt || "").toLowerCase().includes(brandWord) && (!ogFile || !i.path!.endsWith(ogFile)))
    .sort((a, b) => rank[b.kind] - rank[a.kind] || (b.context === "hero" ? 1 : 0) - (a.context === "hero" ? 1 : 0) || b.displayWidth * b.displayHeight - a.displayWidth * a.displayHeight)[0];
  return img?.path;
}

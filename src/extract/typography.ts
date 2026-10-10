import path from "node:path";
import type { CaptureResult } from "../crawl/crawl.js";
import type { FontFamily, FontRole, TypeStyle, TypographySystem, Hex } from "../profile/schema.js";
import type { CssSummary } from "../util/css.js";
import { parseColor } from "../util/color.js";
import { round } from "../util/color.js";

/** Proprietary → open-license families with a similar skeleton and texture. */
const ALTERNATIVES: [RegExp, string[]][] = [
  [/s[öo]hne\s*mono/i, ["IBM Plex Mono", "JetBrains Mono"]],
  [/s[öo]hne|sohne/i, ["Inter Tight", "Geist"]],
  [/circular/i, ["Plus Jakarta Sans", "DM Sans"]],
  [/gt[\s-]?america\s*mono/i, ["IBM Plex Mono", "Geist Mono"]],
  [/gt[\s-]?america/i, ["Inter", "Public Sans"]],
  [/gt[\s-]?walsheim/i, ["Albert Sans", "Outfit"]],
  [/gt[\s-]?sectra/i, ["Fraunces", "Newsreader"]],
  [/gt[\s-]?super/i, ["Fraunces", "Playfair Display"]],
  [/gt[\s-]?flexa/i, ["Archivo", "Space Grotesk"]],
  [/gt[\s-]?standard/i, ["Inter", "Geist"]],
  [/gt[\s-]?maru/i, ["Nunito", "M PLUS Rounded 1c"]],
  [/graphik/i, ["Inter", "Figtree"]],
  [/neue\s*haas|haas\s*grot|helvetica\s*now|helvetica\s*neue/i, ["Inter", "Hanken Grotesk"]],
  [/founders\s*grotesk/i, ["Hanken Grotesk", "Schibsted Grotesk"]],
  [/aeonik/i, ["Manrope", "Outfit"]],
  [/suisse\s*int|suisse/i, ["Inter", "Geist"]],
  [/basier/i, ["Manrope", "Figtree"]],
  [/sf\s*pro|-apple-system|system-ui|blinkmacsystemfont/i, ["Inter", "Geist"]],
  [/sf\s*mono|menlo|monaco|consolas/i, ["JetBrains Mono", "Geist Mono"]],
  [/avenir/i, ["Nunito Sans", "Figtree"]],
  [/futura/i, ["Jost", "Outfit"]],
  [/gilroy/i, ["Plus Jakarta Sans", "Urbanist"]],
  [/proxima/i, ["Figtree", "Montserrat"]],
  [/sofia\s*pro/i, ["Outfit", "Lexend"]],
  [/calibre/i, ["Hanken Grotesk", "Instrument Sans"]],
  [/diatype\s*mono/i, ["Geist Mono", "IBM Plex Mono"]],
  [/diatype/i, ["Geist", "Inter"]],
  [/favorit/i, ["Space Grotesk", "Darker Grotesque"]],
  [/untitled\s*sans/i, ["Inter", "Instrument Sans"]],
  [/untitled\s*serif/i, ["Source Serif 4", "Newsreader"]],
  [/tiempos/i, ["Newsreader", "Source Serif 4"]],
  [/canela/i, ["Cormorant Garamond", "Fraunces"]],
  [/lyon/i, ["Source Serif 4", "Literata"]],
  [/freight/i, ["Literata", "Crimson Pro"]],
  [/recoleta/i, ["Fraunces", "Young Serif"]],
  [/editorial\s*new/i, ["Instrument Serif", "Newsreader"]],
  [/neue\s*montreal/i, ["Inter Tight", "Manrope"]],
  [/berkeley\s*mono/i, ["JetBrains Mono", "Commit Mono"]],
  [/matter/i, ["Figtree", "Onest"]],
  [/whyte/i, ["Inter Tight", "Instrument Sans"]],
  [/haffer/i, ["Inter", "Onest"]],
  [/sharp\s*grotesk/i, ["Archivo", "Bricolage Grotesque"]],
  [/apercu/i, ["DM Sans", "Work Sans"]],
  [/brown/i, ["Josefin Sans", "Outfit"]],
  [/campton/i, ["Montserrat", "Outfit"]],
  [/cera/i, ["Outfit", "Lexend"]],
  [/euclid/i, ["Plus Jakarta Sans", "Manrope"]],
  [/tt\s*commons/i, ["Figtree", "Manrope"]],
  [/tt\s*norms/i, ["Manrope", "Albert Sans"]],
  [/mabry/i, ["Space Grotesk", "Sora"]],
  [/roobert/i, ["Manrope", "Instrument Sans"]],
  [/general\s*sans/i, ["General Sans (Fontshare, free)", "Manrope"]],
  [/satoshi/i, ["Satoshi (Fontshare, free)", "Manrope"]],
  [/cabinet\s*grotesk/i, ["Cabinet Grotesk (Fontshare, free)", "Bricolage Grotesque"]],
  [/clash/i, ["Clash Display (Fontshare, free)", "Unbounded"]],
  [/arial|helvetica/i, ["Inter", "Arimo"]],
  [/georgia|times/i, ["Source Serif 4", "Tinos"]],
];

const OPEN_FONTS = /^(inter( tight| display)?|geist( mono)?|roboto( mono| flex| slab)?|open sans|lato|montserrat|poppins|source (sans|serif|code)( pro| 3| 4)?|ibm plex( sans| serif| mono)?|jetbrains mono|fira (sans|code|mono)|dm (sans|serif|mono)|manrope|figtree|outfit|plus jakarta sans|space (grotesk|mono)|work sans|nunito( sans)?|rubik|karla|sora|lexend|onest|instrument (sans|serif)|newsreader|fraunces|playfair display|lora|merriweather|crimson( pro| text)?|literata|libre (franklin|baskerville)|public sans|hanken grotesk|schibsted grotesk|bricolage grotesque|albert sans|urbanist|archivo|be vietnam pro|noto (sans|serif)( mono)?|ubuntu|mulish|raleway|epilogue|syne|unbounded|commit mono|cormorant( garamond)?)$/i;

const SYSTEM = /^(system-ui|-apple-system|blinkmacsystemfont|segoe ui|helvetica( neue)?|arial|sans-serif|serif|monospace|ui-sans-serif|ui-serif|ui-monospace|apple color emoji|segoe ui emoji|segoe ui symbol|noto color emoji|roboto|ubuntu|cantarell|menlo|monaco|consolas|courier( new)?|times( new roman)?|georgia|sf pro( display| text)?|sf mono|liberation mono|lucida grande|tahoma|verdana)$/i;

const SERIF_NAMES = /serif(?!.*sans)|tiempos|georgia|times|garamond|canela|lyon|freight|recoleta|newsreader|fraunces|playfair|editorial|sectra|caslon|baskerville|bodoni|didot|lora|merriweather|literata|crimson|cormorant|domaine|signifier|reckless|ogg|gt super|chronicle|publico|austin/i;
const MONO_NAMES = /mono|code|courier|consolas|menlo|monaco|plex mono|berkeley|fira code|jetbrains/i;
const DISPLAY_NAMES = /display|headline|poster|black|condensed|compressed|extended|wide/i;

export function primaryFamily(stack: string) {
  return splitStack(stack)[0] ?? stack;
}

export function splitStack(stack: string) {
  return stack
    .split(",")
    .map((s) => s.trim().replace(/^['"]|['"]$/g, ""))
    .filter(Boolean);
}

/** Many sites prefix a brand alias ("NotionInter", "__Inter_a1b2c3"); recover the real name. */
export function cleanFamilyName(name: string) {
  let n = name.replace(/^__/, "").replace(/_[a-f0-9]{5,}$/i, "").replace(/_Fallback.*$/i, "").replace(/_/g, " ").trim();
  n = n.replace(/[\s-]*(variable|var|vf|web|webfont|regular)$/i, "").replace(/-+$/, "").trim();
  // Weight-named families ("Sohne Buch", "Soehne Halbfett", "Inter SemiBold") are one family.
  n = n.replace(/[\s-]+(extraleicht|leicht|buch|kr(a|ä)ftig|halbfett|dreiviertelfett|fett|extrafett|thin|hairline|extralight|ultralight|light|book|normal|medium|semibold|demibold|bold|extrabold|ultrabold|black|heavy|italic)$/i, "").trim();
  n = n.replace(/^soehne\b/i, "sohne");
  n = n.replace(/-/g, " ");
  // Restore well-known diacritics / casing.
  const KNOWN: Record<string, string> = { sohne: "Söhne", "sohne mono": "Söhne Mono", "sohne breit": "Söhne Breit", "gt america": "GT America", "gt walsheim": "GT Walsheim", "abc diatype": "ABC Diatype", "pp neue montreal": "PP Neue Montreal", "sf pro display": "SF Pro Display", "sf pro text": "SF Pro Text", "ibm plex sans": "IBM Plex Sans", "ibm plex mono": "IBM Plex Mono" };
  if (KNOWN[n.toLowerCase()]) return KNOWN[n.toLowerCase()];
  if (n === n.toLowerCase()) n = n.replace(/\b\w/g, (c) => c.toUpperCase());
  // "SourceCodePro" → "Source Code Pro"
  if (!/\s/.test(n) && /[a-z][A-Z]/.test(n)) n = n.replace(/([a-z])([A-Z])/g, "$1 $2");
  // Brand-aliased open fonts ("NotionInter", "Vercel Geist") → the real family.
  const words = n.split(" ");
  for (let i = 1; i < words.length; i++) {
    const rest = words.slice(i).join(" ");
    if (OPEN_FONTS.test(rest)) return rest;
  }
  return n;
}

export function alternativesFor(family: string): string[] {
  if (OPEN_FONTS.test(family)) return [];
  for (const [re, alts] of ALTERNATIVES) if (re.test(family)) return alts;
  return [];
}

function classify(family: string, stack: string): FontFamily["classification"] {
  if (MONO_NAMES.test(family) || /\bmonospace\b/.test(stack)) return "mono";
  if (SERIF_NAMES.test(family) || (/\bserif\b/.test(stack) && !/sans-serif/.test(stack))) return "serif";
  if (/script|hand|brush|marker/i.test(family)) return "script";
  if (DISPLAY_NAMES.test(family)) return "display";
  if (/sans|grotesk|grotesque|gothic|inter|geist|helvetica|arial/i.test(family + stack)) return "sans";
  return "sans";
}

export function extractTypography(capture: CaptureResult, css: CssSummary): TypographySystem {
  type Raw = { family: string; size: number; weight: number; lineHeight: number; letterSpacing: number; textTransform: string; fontStyle: string; features: string; chars: number; count: number; tags: Record<string, number>; sample: string; colors: Record<string, number> };

  // ---------------- families
  const famMap = new Map<string, { stack: string; chars: number; weights: Map<number, number>; tags: Map<string, number>; sizes: Map<number, number> }>();
  capture.pages.forEach((p, i) => {
    const pw = i === 0 ? 1 : 0.6;
    for (const s of p.raw.textStyles as Raw[]) {
      const fam = cleanFamilyName(primaryFamily(s.family));
      const e = famMap.get(fam) || { stack: s.family, chars: 0, weights: new Map(), tags: new Map(), sizes: new Map() };
      e.chars += s.chars * pw;
      e.weights.set(s.weight, (e.weights.get(s.weight) || 0) + s.chars);
      for (const [t, n] of Object.entries(s.tags)) e.tags.set(t, (e.tags.get(t) || 0) + n * s.chars);
      e.sizes.set(s.size, (e.sizes.get(s.size) || 0) + s.chars);
      famMap.set(fam, e);
    }
  });
  const totalChars = [...famMap.values()].reduce((a, b) => a + b.chars, 0) || 1;

  const fontFiles = new Map(capture.fonts.map((f) => [f.url, f]));
  const families: FontFamily[] = [...famMap.entries()]
    .filter(([, e]) => e.chars / totalChars > 0.004)
    .sort((a, b) => b[1].chars - a[1].chars)
    .slice(0, 6)
    .map(([family, e]) => {
      const faces = css.fontFaces.filter((f) => f.family.toLowerCase() === primaryFamily(e.stack).toLowerCase() || cleanFamilyName(f.family).toLowerCase() === family.toLowerCase());
      const files = faces.flatMap((f) =>
        f.urls
          .map((u) => fontFiles.get(u))
          .filter(Boolean)
          .map((ff) => ({ path: ff!.path, url: ff!.url, weight: f.weight, style: f.style, format: path.extname(ff!.path).slice(1) })),
      );
      const uniqFiles = [...new Map(files.map((f) => [f.path, f])).values()];
      const urls = faces.flatMap((f) => f.urls).join(" ");
      const source: FontFamily["source"] = /fonts\.(gstatic|googleapis)\.com/.test(urls)
        ? "google"
        : /typekit|use\.adobe/.test(urls)
          ? "adobe"
          : faces.length
            ? "self-hosted"
            : SYSTEM.test(family)
              ? "system"
              : "unknown";
      const variable = faces.some((f) => /\d+\s+\d+/.test(f.weight)) || /var|variable|vf/i.test(urls);
      const tagShare = (re: RegExp) => [...e.tags.entries()].filter(([t]) => re.test(t)).reduce((a, [, n]) => a + n, 0) / ([...e.tags.values()].reduce((a, b) => a + b, 0) || 1);
      const maxSize = Math.max(...e.sizes.keys());
      const roles: FontRole[] = [];
      const cls = classify(family, e.stack);
      if (cls === "mono") roles.push("mono");
      if (tagShare(/^h1$/) > 0.02 || maxSize >= 40) roles.push("display");
      if (tagShare(/^h[1-4]$/) > 0.05) roles.push("heading");
      if (tagShare(/^(p|li|span|div|td)$/) > 0.3 && cls !== "mono") roles.push("body");
      if (tagShare(/^(button|a|label|input)$/) > 0.08) roles.push("ui");
      if (!roles.length) roles.push(cls === "mono" ? "mono" : "accent");
      return {
        family,
        cssFamily: primaryFamily(e.stack),
        stack: e.stack,
        roles,
        weights: [...e.weights.entries()].filter(([, n]) => n > 0).sort((a, b) => a[0] - b[0]).map(([w]) => w),
        usage: round(e.chars / totalChars, 3),
        source,
        variable,
        files: uniqFiles,
        alternatives: alternativesFor(family),
        classification: cls,
      };
    });
  // Ensure there's always a body + display family.
  if (families.length && !families.some((f) => f.roles.includes("body"))) families[0].roles.push("body");
  if (families.length && !families.some((f) => f.roles.includes("display"))) families[0].roles.unshift("display");

  // ---------------- styles
  const styleMap = new Map<string, Raw & { pages: number }>();
  capture.pages.forEach((p, i) => {
    const pw = i === 0 ? 1 : 0.5;
    for (const s of p.raw.textStyles as Raw[]) {
      const fam = cleanFamilyName(primaryFamily(s.family));
      const key = [fam, Math.round(s.size), s.weight, round(s.lineHeight, 2), round(s.letterSpacing, 3), s.textTransform].join("|");
      const prev = styleMap.get(key);
      if (prev) {
        prev.chars += s.chars * pw;
        prev.count += s.count;
        for (const [t, n] of Object.entries(s.tags)) prev.tags[t] = (prev.tags[t] || 0) + n;
        for (const [c, n] of Object.entries(s.colors)) prev.colors[c] = (prev.colors[c] || 0) + n;
        if (s.sample.length > prev.sample.length && prev.sample.length < 40) prev.sample = s.sample;
      } else styleMap.set(key, { ...s, family: fam, chars: s.chars * pw, tags: { ...s.tags }, colors: { ...s.colors }, pages: 1 });
    }
  });
  const allStyles = [...styleMap.values()].filter((s) => s.size >= 9);
  const maxChars = Math.max(...allStyles.map((s) => s.chars), 1);
  // Keep styles that matter: either widely used, or large (display) even if rare.
  const keep = allStyles
    .filter((s) => s.chars / maxChars > 0.01 || (s.size >= 28 && s.chars > 8) || Object.keys(s.tags).some((t) => /^h[1-3]$/.test(t)))
    .sort((a, b) => b.size - a.size || b.chars - a.chars);

  const bodyStyle = [...allStyles].filter((s) => s.size >= 13 && s.size <= 20).sort((a, b) => b.chars - a.chars)[0];
  const base = bodyStyle ? Math.round(bodyStyle.size) : 16;

  const named: TypeStyle[] = [];
  const used = new Set<string>();
  const nameFor = (s: Raw): string => {
    const tagTop = Object.entries(s.tags).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "";
    const upper = s.textTransform === "uppercase";
    if (upper && s.size <= 15) return "eyebrow";
    if (/^(code|pre|kbd)$/.test(tagTop) || MONO_NAMES.test(s.family)) return s.size > base ? "code-lg" : "code";
    if (s.size >= 56) return "display";
    if (tagTop === "h1" || s.size >= 44) return "h1";
    if (tagTop === "h2" || s.size >= 32) return "h2";
    if (tagTop === "h3" || s.size >= 24) return "h3";
    if (tagTop === "h4" || (s.size >= 19 && s.weight >= 500)) return "h4";
    const d = Math.round(s.size) - base;
    if (d >= 2) return "body-lg";
    if (Math.abs(d) <= 1) return /^(button|a|label)$/.test(tagTop) && s.weight >= 500 ? "label" : "body";
    if (d >= -3) return /^(button|a|label)$/.test(tagTop) ? "label-sm" : "body-sm";
    return "caption";
  };
  for (const s of keep) {
    let name = nameFor(s);
    if (used.has(name)) {
      // Keep the most-used variant for each name; allow a second with suffix for headings.
      if (!/^(h[1-4]|display|body|label|eyebrow)$/.test(name)) continue;
      const alt = `${name}-alt`;
      if (used.has(alt)) continue;
      name = alt;
    }
    used.add(name);
    const topColor = Object.entries(s.colors).sort((a, b) => b[1] - a[1])[0]?.[0];
    named.push({
      name,
      family: s.family,
      size: round(s.size, 2),
      weight: s.weight,
      lineHeight: round(s.lineHeight, 3),
      letterSpacing: round(s.letterSpacing, 4),
      textTransform: s.textTransform,
      fontStyle: s.fontStyle,
      features: s.features,
      usage: round(s.chars / maxChars, 3),
      tags: Object.keys(s.tags),
      sample: s.sample,
      color: topColor ? (parseColor(topColor)?.hex as Hex | undefined) : undefined,
    });
    if (named.length >= 16) break;
  }
  const ORDER = ["display", "h1", "h1-alt", "h2", "h2-alt", "h3", "h3-alt", "h4", "h4-alt", "body-lg", "body", "body-alt", "label", "label-alt", "body-sm", "label-sm", "eyebrow", "eyebrow-alt", "caption", "code-lg", "code"];
  named.sort((a, b) => ORDER.indexOf(a.name) - ORDER.indexOf(b.name));

  // ---------------- scale
  const sizeUse = new Map<number, number>();
  for (const s of allStyles) {
    const k = Math.round(s.size);
    sizeUse.set(k, (sizeUse.get(k) || 0) + s.chars + (s.size >= 28 ? maxChars * 0.02 : 0));
  }
  const sizes = [...sizeUse.entries()]
    .filter(([, n]) => n / maxChars > 0.004)
    .map(([k]) => k)
    .sort((a, b) => a - b);
  const headingSizes = sizes.filter((s) => s >= base);
  let ratio = 1.25;
  if (headingSizes.length >= 3) {
    const r = Math.pow(headingSizes[headingSizes.length - 1] / headingSizes[0], 1 / (headingSizes.length - 1));
    ratio = round(r, 3);
  }
  const RATIOS: [number, string][] = [
    [1.067, "Minor Second"],
    [1.125, "Major Second"],
    [1.2, "Minor Third"],
    [1.25, "Major Third"],
    [1.333, "Perfect Fourth"],
    [1.414, "Augmented Fourth"],
    [1.5, "Perfect Fifth"],
    [1.618, "Golden Ratio"],
  ];
  const ratioName = RATIOS.reduce((best, cur) => (Math.abs(cur[0] - ratio) < Math.abs(best[0] - ratio) ? cur : best))[1];

  const features = Object.entries(capture.pages[0].raw.fontFeatures as Record<string, number>)
    .sort((a, b) => b[1] - a[1])
    .map(([k]) => k)
    .slice(0, 6);

  const measure = capture.pages[0].raw.measure ? Math.round(capture.pages[0].raw.measure as number) : undefined;

  // Two-tone headlines: ≥2 headings whose text runs in two clearly different colors.
  type H = { tag: string; text: string; colors?: string[] };
  const twoToned = capture.pages.flatMap((p) => p.raw.headings as H[]).filter((h) => (h.tag === "h1" || h.tag === "h2") && (h.colors?.length ?? 0) >= 2);
  let twoTone: TypographySystem["twoTone"];
  if (twoToned.length >= 2) {
    const a = parseColor(twoToned[0].colors![0])?.hex;
    const b2 = parseColor(twoToned[0].colors![1])?.hex;
    if (a && b2 && a !== b2) twoTone = { primary: a, secondary: b2, examples: twoToned.slice(0, 4).map((h) => h.text) };
  }
  return { families, styles: named, scale: { sizes, base, ratio, ratioName }, features, measure, twoTone };
}

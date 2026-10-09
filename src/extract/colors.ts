import type { CaptureResult } from "../crawl/crawl.js";
import type { ColorRoles, ColorSystem, ContrastPair, Gradient, Swatch, Hex, CssVariable } from "../profile/schema.js";
import { parseColor, composite, oklch, distance, contrast, apca, isNeutral, ramp, readableOn, describeColor, mix, fromOklch, round } from "../util/color.js";
import { splitTop } from "../util/css.js";

type Channel = "background" | "text" | "border" | "svg" | "gradient" | "logo";

interface Bucket {
  hex: Hex;
  weight: Record<Channel, number>;
  contexts: Map<string, number>;
}

const CHANNEL_WEIGHT: Record<Channel, number> = { background: 0.42, text: 0.3, border: 0.06, svg: 0.1, gradient: 0.07, logo: 0.05 };

export interface ColorInputs {
  capture: CaptureResult;
  logoColors: Hex[];
  cssVariables: CssVariable[];
}

export function extractColors({ capture, logoColors, cssVariables }: ColorInputs): ColorSystem {
  const home = capture.pages[0].raw;

  // 1. Page background = the background color that paints the most area on the homepage.
  const bgCandidates = Object.entries(home.colors as Record<string, { bg: number }>)
    .map(([raw, s]) => ({ c: parseColor(raw), w: s.bg }))
    .filter((x) => x.c && x.c.alpha > 0.9)
    .sort((a, b) => b.w - a.w);
  const pageBg = bgCandidates[0]?.c?.hex ?? "#ffffff";

  // 2. Bucket every observed color (all pages), compositing translucency over the page background.
  const buckets = new Map<Hex, Bucket>();
  const totals: Record<Channel, number> = { background: 0, text: 0, border: 0, svg: 0, gradient: 0, logo: 0 };
  const add = (hex: Hex, ch: Channel, w: number, ctx?: Record<string, number> | string) => {
    if (!(w > 0)) return;
    let b = buckets.get(hex);
    if (!b) buckets.set(hex, (b = { hex, weight: { background: 0, text: 0, border: 0, svg: 0, gradient: 0, logo: 0 }, contexts: new Map() }));
    b.weight[ch] += w;
    totals[ch] += w;
    if (typeof ctx === "string") b.contexts.set(ctx, (b.contexts.get(ctx) || 0) + w);
    else if (ctx) for (const [k, v] of Object.entries(ctx)) b.contexts.set(k, (b.contexts.get(k) || 0) + v);
  };

  capture.pages.forEach((p, i) => {
    const pageWeight = i === 0 ? 1 : 0.5; // homepage is the strongest brand statement
    for (const [raw, s] of Object.entries(p.raw.colors as Record<string, { bg: number; text: number; border: number; svg: number; ctx: Record<string, number> }>)) {
      const c = parseColor(raw);
      if (!c || c.alpha < 0.06) continue;
      const hex = composite(c, pageBg);
      const ctx = Object.fromEntries(Object.entries(s.ctx).map(([k, v]) => [k, v * pageWeight]));
      add(hex, "background", s.bg * pageWeight * (c.alpha < 0.5 ? 0.5 : 1), ctx);
      add(hex, "text", s.text * pageWeight, ctx);
      add(hex, "border", s.border * pageWeight);
      add(hex, "svg", s.svg * pageWeight, ctx);
    }
  });

  // Gradients
  const gradients: Gradient[] = [];
  const gradSeen = new Set<string>();
  for (const p of capture.pages) {
    for (const [css, g] of Object.entries(p.raw.gradients as Record<string, { area: number; count: number }>)) {
      if (gradSeen.has(css)) continue;
      gradSeen.add(css);
      for (const layer of splitTop(css, ",").length ? [css] : []) {
        const parsed = parseGradient(layer, pageBg);
        if (!parsed || parsed.colors.length < 2) continue;
        // ignore pure fade-to-transparent overlays of a single hue
        const distinct = dedupe(parsed.colors, 0.03);
        if (distinct.length < 2) continue;
        gradients.push({ ...parsed, colors: distinct, weight: g.area, source: p.url });
        distinct.forEach((h) => add(h, "gradient", g.area / distinct.length, "gradient"));
      }
    }
  }
  // Canvas / shader gradients (e.g. Stripe's WebGL wave): prefer CSS-var colors, fall back to sampled pixels.
  for (const c of capture.canvasRecordings) {
    const rootVars = capture.pages[0].raw.rootVars as Record<string, string>;
    const own = Object.entries(c.cssVars).filter(([k, v]) => rootVars[k] !== v && /grad|shader|canvas|wave|mesh/i.test(k));
    const varColors = (own.length <= 8 ? own.map(([, v]) => parseColor(v)?.hex) : []).filter(Boolean) as Hex[];
    const sampled = c.colors.filter((x) => x.weight > 0.04).map((x) => x.hex);
    const colors = dedupe(varColors.length >= 2 ? varColors : sampled.filter((h) => distance(h, pageBg) > 0.05), 0.04);
    if (colors.length >= 2) {
      gradients.push({ css: `/* ${c.ctx} canvas */ linear-gradient(120deg, ${colors.join(", ")})`, type: "shader", colors, weight: c.w * c.h * 2, source: c.page });
      colors.forEach((h) => add(h, "gradient", (c.w * c.h) / colors.length, "canvas"));
    }
  }
  gradients.sort((a, b) => b.weight - a.weight);

  for (const h of logoColors) add(h, "logo", 1, "logo");

  // 3. Merge perceptually indistinguishable colors (ΔE_ok < 0.018) into the heavier one.
  const score = (b: Bucket) =>
    (Object.keys(CHANNEL_WEIGHT) as Channel[]).reduce((s, ch) => s + (totals[ch] ? (b.weight[ch] / totals[ch]) * CHANNEL_WEIGHT[ch] : 0), 0);
  let list = [...buckets.values()].sort((a, b) => score(b) - score(a));
  const merged: Bucket[] = [];
  for (const b of list) {
    const target = merged.find((m) => distance(m.hex, b.hex) < 0.018);
    if (target) {
      (Object.keys(b.weight) as Channel[]).forEach((k) => (target.weight[k] += b.weight[k]));
      b.contexts.forEach((v, k) => target.contexts.set(k, (target.contexts.get(k) || 0) + v));
    } else merged.push(b);
  }
  list = merged.sort((a, b) => score(b) - score(a));
  const totalScore = list.reduce((s, b) => s + score(b), 0) || 1;

  // Variables that resolve to each color.
  const varsByHex = new Map<Hex, string[]>();
  for (const v of cssVariables) {
    if (v.kind !== "color" || !v.resolved) continue;
    const near = list.find((b) => distance(b.hex, v.resolved!) < 0.018);
    const key = near?.hex ?? v.resolved;
    const arr = varsByHex.get(key) || [];
    if (arr.length < 6) arr.push(v.name);
    varsByHex.set(key, arr);
  }

  const palette: Swatch[] = list
    .filter((b) => score(b) / totalScore > 0.0008 || b.weight.logo > 0)
    .slice(0, 32)
    .map((b) => ({
      hex: b.hex,
      oklch: oklch(b.hex),
      share: round(score(b) / totalScore, 4),
      weight: {
        background: round(totals.background ? b.weight.background / totals.background : 0, 4),
        text: round(totals.text ? b.weight.text / totals.text : 0, 4),
        border: round(totals.border ? b.weight.border / totals.border : 0, 4),
        svg: round(totals.svg ? b.weight.svg / totals.svg : 0, 4),
        gradient: round(totals.gradient ? b.weight.gradient / totals.gradient : 0, 4),
        logo: round(totals.logo ? b.weight.logo / totals.logo : 0, 4),
      },
      contexts: [...b.contexts.entries()].sort((a, c) => c[1] - a[1]).slice(0, 5).map(([k]) => k),
      name: describeColor(b.hex),
      variables: varsByHex.get(b.hex) ?? [],
    }));

  const roles = assignRoles(palette, pageBg, capture, logoColors);
  const scheme = oklch(roles.background).l < 0.5 ? "dark" : "light";

  // Disambiguate names ("Blue", "Blue 2" → "Blue", "Deep Blue")
  const used = new Map<string, number>();
  for (const s of palette) {
    const n = used.get(s.name) || 0;
    used.set(s.name, n + 1);
    if (n > 0) s.name = `${s.name} ${n + 1}`;
  }

  // Ramps: brand hues + a neutral tinted toward the brand.
  const ramps: ColorSystem["ramps"] = {};
  const neutralSeed = pickNeutralSeed(palette, roles);
  ramps.neutral = ramp(neutralSeed);
  if (!isNeutral(roles.primary)) ramps.primary = ramp(roles.primary);
  roles.accent.slice(0, 4).forEach((a, i) => {
    if (!isNeutral(a)) ramps[i === 0 ? "accent" : `accent${i + 1}`] = ramp(a);
  });
  for (const k of ["success", "warning", "danger"] as const) if (roles[k]) ramps[k] = ramp(roles[k]!);

  const pairs: [Hex, Hex][] = [
    [roles.foreground, roles.background],
    [roles.muted, roles.background],
    [roles.subtle, roles.background],
    [roles.foreground, roles.surface],
    [roles.primaryForeground, roles.primary],
    [roles.primary, roles.background],
    [roles.link, roles.background],
    [roles.inverseForeground, roles.inverseBackground],
    ...roles.accent.slice(0, 3).map((a) => [a, roles.background] as [Hex, Hex]),
  ];
  const contrastPairs: ContrastPair[] = dedupePairs(pairs).map(([fg, bg]) => {
    const ratio = contrast(fg, bg);
    return { fg, bg, ratio, apca: apca(fg, bg), aa: ratio >= 4.5, aaa: ratio >= 7, aaLarge: ratio >= 3 };
  });

  return { scheme, palette, roles, ramps, gradients: gradients.slice(0, 12), contrast: contrastPairs };
}

function assignRoles(palette: Swatch[], pageBg: Hex, capture: CaptureResult, logoColors: Hex[]): ColorRoles {
  const bgL = oklch(pageBg).l;
  const dark = bgL < 0.5;
  const byText = [...palette].filter((s) => s.weight.text > 0).sort((a, b) => b.weight.text - a.weight.text);
  // Foreground = the highest-contrast color among heavily used text colors (headings usually carry the ink).
  const maxText = byText[0]?.weight.text ?? 0;
  const heavy = byText.filter((s) => s.weight.text >= maxText * 0.18 && contrast(s.hex, pageBg) >= 4.5);
  const foreground = [...heavy].sort((a, b) => contrast(b.hex, pageBg) - contrast(a.hex, pageBg))[0]?.hex ?? byText[0]?.hex ?? readableOn(pageBg);
  const muted = byText.find((s) => s.hex !== foreground && isNeutral(s.hex, 0.06) && contrast(s.hex, pageBg) >= 3.2 && contrast(s.hex, pageBg) < contrast(foreground, pageBg))?.hex ?? mix(foreground, pageBg, 0.35);
  const subtle = byText.find((s) => s.hex !== foreground && s.hex !== muted && isNeutral(s.hex, 0.06) && contrast(s.hex, pageBg) < contrast(muted, pageBg))?.hex ?? mix(foreground, pageBg, 0.55);

  const bgs = [...palette].filter((s) => s.weight.background > 0).sort((a, b) => b.weight.background - a.weight.background);
  const nearBg = bgs.filter((s) => s.hex !== pageBg && Math.abs(oklch(s.hex).l - bgL) < 0.09 && isNeutral(s.hex, 0.05));
  const surface = nearBg[0]?.hex ?? (dark ? mix(pageBg, "#ffffff", 0.05) : mix(pageBg, "#000000", 0.025));
  const surfaceAlt = nearBg[1]?.hex ?? (dark ? mix(pageBg, "#ffffff", 0.1) : mix(pageBg, "#000000", 0.05));
  const byBorder = [...palette].filter((s) => s.weight.border > 0 && s.hex !== foreground).sort((a, b) => b.weight.border - a.weight.border);
  const border = byBorder.find((s) => isNeutral(s.hex, 0.06) && contrast(s.hex, pageBg) < 3)?.hex ?? mix(foreground, pageBg, 0.86);

  // Primary: the chromatic color that the brand spends on its CTAs, links, logo and gradients.
  const chromatic = palette.filter((s) => !isNeutral(s.hex, 0.045));
  const buttons = capture.pages.flatMap((p) => p.raw.buttons as { styles: Record<string, string>; rect: { y: number } }[]);
  const btnBg = new Map<Hex, number>();
  for (const b of buttons) {
    const c = parseColor(b.styles["background-color"]);
    if (!c || c.alpha < 0.5) continue;
    const hex = composite(c, pageBg);
    const near = palette.find((s) => distance(s.hex, hex) < 0.018)?.hex ?? hex;
    // Buttons above the fold weigh more.
    btnBg.set(near, (btnBg.get(near) || 0) + (b.rect.y < 900 ? 3 : 1));
  }
  const ctaScore = (s: Swatch) => {
    const btn = btnBg.get(s.hex) || 0;
    const logo = logoColors.some((l) => distance(l, s.hex) < 0.03) ? 1 : 0;
    const ctx = s.contexts;
    return (
      btn * 2 +
      s.weight.background * 6 +
      s.weight.text * 3 +
      s.weight.svg * 3 +
      s.weight.gradient * 2 +
      logo * 4 +
      (ctx.includes("button") ? 2 : 0) +
      (ctx.includes("link") ? 1 : 0) +
      oklch(s.hex).c * 4
    );
  };
  const rankedChromatic = [...chromatic].sort((a, b) => ctaScore(b) - ctaScore(a));
  // Monochrome brands (Notion, Vercel, Linear-ish): primary is the ink color.
  const monochrome = !rankedChromatic.length || ctaScore(rankedChromatic[0]) < 0.4;
  const neutralBtn = [...btnBg.entries()].sort((a, b) => b[1] - a[1]).find(([h]) => isNeutral(h, 0.045) && distance(h, pageBg) > 0.1)?.[0];
  const primary = monochrome ? neutralBtn ?? foreground : rankedChromatic[0].hex;

  // Text color actually used on the primary button, else best contrast.
  let primaryForeground = readableOn(primary, [pageBg, "#ffffff", "#0a0a0a"]);
  for (const b of buttons) {
    const c = parseColor(b.styles["background-color"]);
    if (c && distance(composite(c, pageBg), primary) < 0.02) {
      const t = parseColor(b.styles["color"]);
      if (t && contrast(t.hex, primary) >= 3) {
        primaryForeground = t.hex;
        break;
      }
    }
  }

  const accent: Hex[] = [];
  for (const s of rankedChromatic) {
    if (s.hex === primary) continue;
    if (distance(s.hex, primary) < 0.07) continue;
    if (oklch(s.hex).c < 0.06) continue;
    if (accent.some((a) => distance(a, s.hex) < 0.07)) continue;
    if (ctaScore(s) < 0.02 && s.share < 0.002) continue;
    accent.push(s.hex);
    if (accent.length >= 5) break;
  }

  const links = [...palette].sort((a, b) => (b.contexts.includes("link") ? 1 : 0) - (a.contexts.includes("link") ? 1 : 0));
  const link = links.find((s) => s.contexts.includes("link") && !isNeutral(s.hex, 0.045))?.hex ?? (monochrome ? foreground : primary);

  const inverseBackground = bgs.find((s) => (dark ? oklch(s.hex).l > 0.85 : oklch(s.hex).l < 0.3))?.hex ?? (dark ? "#fafafa" : foreground);
  const inverseForeground = readableOn(inverseBackground, [pageBg, foreground, "#ffffff", "#0a0a0a"]);

  const semantic = (hueMin: number, hueMax: number): Hex | undefined =>
    chromatic.find((s) => {
      const o = oklch(s.hex);
      return o.c > 0.08 && (hueMin < hueMax ? o.h >= hueMin && o.h <= hueMax : o.h >= hueMin || o.h <= hueMax) && s.hex !== primary;
    })?.hex;
  const p = oklch(primary);
  const lTarget = dark ? 0.72 : 0.58;
  const cTarget = Math.max(0.12, Math.min(0.19, p.c || 0.15));
  const success = semantic(135, 165) ?? fromOklch(lTarget, cTarget, 150);
  const warning = semantic(60, 95) ?? fromOklch(dark ? 0.8 : 0.72, cTarget, 75);
  const danger = semantic(15, 35) ?? semantic(350, 15) ?? fromOklch(lTarget, cTarget + 0.02, 25);

  return { background: pageBg, surface, surfaceAlt, foreground, muted, subtle, border, primary, primaryForeground, accent, link, inverseBackground, inverseForeground, success, warning, danger };
}

function pickNeutralSeed(palette: Swatch[], roles: ColorRoles): Hex {
  // Use the brand's own grays if they carry a tint; otherwise a gray at the foreground's hue.
  const grays = palette.filter((s) => isNeutral(s.hex, 0.04) && oklch(s.hex).l > 0.3 && oklch(s.hex).l < 0.75);
  if (grays.length) return grays[0].hex;
  const f = oklch(roles.foreground);
  return fromOklch(0.55, Math.min(f.c, 0.02), f.h);
}

const COLOR_RE = /(#[0-9a-f]{3,8}\b|rgba?\([^)]*\)|hsla?\([^)]*\)|oklch\([^)]*\)|oklab\([^)]*\)|lab\([^)]*\)|lch\([^)]*\)|color\([^)]*\))/gi;

export function parseGradient(css: string, bg: Hex): Omit<Gradient, "weight" | "source"> | null {
  const m = /(repeating-)?(linear|radial|conic)-gradient\(/i.exec(css);
  if (!m) return null;
  const colors: Hex[] = [];
  for (const c of css.match(COLOR_RE) ?? []) {
    const p = parseColor(c);
    if (!p || p.alpha < 0.15) continue;
    colors.push(composite(p, bg));
  }
  const angle = /(-?[\d.]+)deg/.exec(css);
  return { css, type: m[2].toLowerCase() as Gradient["type"], colors, angle: angle ? parseFloat(angle[1]) : undefined };
}

function dedupe(colors: Hex[], threshold: number): Hex[] {
  const out: Hex[] = [];
  for (const c of colors) if (!out.some((o) => distance(o, c) < threshold)) out.push(c);
  return out;
}

function dedupePairs(pairs: [Hex, Hex][]) {
  const seen = new Set<string>();
  return pairs.filter(([a, b]) => {
    const k = a + b;
    if (seen.has(k) || a === b) return false;
    seen.add(k);
    return true;
  });
}

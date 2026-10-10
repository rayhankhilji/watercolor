import { parse, formatHex, converter, toGamut, wcagContrast, differenceEuclidean, interpolate, type Color } from "culori";

const toOklch = converter("oklch");
const toRgb = converter("rgb");
const gamutRgb = toGamut("rgb", "oklch");
const deltaOklab = differenceEuclidean("oklab");

export interface ParsedColor {
  hex: string;
  alpha: number;
}

const cache = new Map<string, ParsedColor | null>();

/** Parse any CSS color string (rgb, hsl, oklch, lab, color(display-p3 …), hex, named). */
export function parseColor(input: string | undefined | null): ParsedColor | null {
  if (!input) return null;
  const key = input.trim();
  if (cache.has(key)) return cache.get(key)!;
  let out: ParsedColor | null = null;
  try {
    if (key === "transparent" || key === "none" || key.startsWith("url(") || key === "currentcolor") {
      out = null;
    } else {
      const c = parse(key) as Color | undefined;
      if (c) {
        const alpha = c.alpha ?? 1;
        const inGamut = gamutRgb({ ...c, alpha: 1 } as Color);
        out = { hex: formatHex(inGamut)!.toLowerCase(), alpha };
      }
    }
  } catch {
    out = null;
  }
  cache.set(key, out);
  return out;
}

export function hexToRgb(hex: string) {
  const c = toRgb(parse(hex)!)!;
  return { r: Math.round(c.r * 255), g: Math.round(c.g * 255), b: Math.round(c.b * 255) };
}

/** Composite a translucent color over an opaque background. */
export function composite(fg: ParsedColor, bgHex: string): string {
  if (fg.alpha >= 0.999) return fg.hex;
  const a = toRgb(parse(fg.hex)!)!;
  const b = toRgb(parse(bgHex)!)!;
  const t = fg.alpha;
  return formatHex({ mode: "rgb", r: a.r * t + b.r * (1 - t), g: a.g * t + b.g * (1 - t), b: a.b * t + b.b * (1 - t) })!.toLowerCase();
}

export function oklch(hex: string) {
  const c = toOklch(parse(hex)!)!;
  return { l: round(c.l, 4), c: round(c.c ?? 0, 4), h: round(Number.isFinite(c.h) ? c.h! : 0, 2) };
}

export function oklchCss(hex: string) {
  const { l, c, h } = oklch(hex);
  return `oklch(${round(l * 100, 2)}% ${round(c, 4)} ${round(h, 2)})`;
}

export function rgbCss(hex: string) {
  const { r, g, b } = hexToRgb(hex);
  return `rgb(${r} ${g} ${b})`;
}

export function hslValues(hex: string) {
  const c = converter("hsl")(parse(hex)!)!;
  return { h: Math.round(c.h ?? 0), s: Math.round((c.s ?? 0) * 100), l: Math.round((c.l ?? 0) * 100) };
}

export function fromOklch(l: number, c: number, h: number): string {
  return formatHex(gamutRgb({ mode: "oklch", l, c, h }))!.toLowerCase();
}

export function distance(a: string, b: string) {
  return deltaOklab(parse(a)!, parse(b)!);
}

export function contrast(fg: string, bg: string) {
  return round(wcagContrast(parse(fg)!, parse(bg)!), 2);
}

export function isNeutral(hex: string, threshold = 0.035) {
  return oklch(hex).c < threshold;
}

export function luminance(hex: string) {
  const { r, g, b } = hexToRgb(hex);
  const f = (v: number) => {
    const s = v / 255;
    return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

export function isDark(hex: string) {
  return oklch(hex).l < 0.55;
}

/** Best readable foreground (pure-ish black or white, or the supplied candidates) for a background. */
export function readableOn(bg: string, candidates: string[] = ["#ffffff", "#0a0a0a"]) {
  return [...candidates].sort((a, b) => contrast(b, bg) - contrast(a, bg))[0];
}

/**
 * APCA-W3 (0.0.98G-4g) lightness contrast. Returns Lc (positive for dark-on-light, negative for light-on-dark).
 * https://github.com/Myndex/apca-w3
 */
export function apca(textHex: string, bgHex: string) {
  const sRGBtoY = (hex: string) => {
    const { r, g, b } = hexToRgb(hex);
    const lin = (v: number) => Math.pow(v / 255, 2.4);
    return 0.2126729 * lin(r) + 0.7151522 * lin(g) + 0.072175 * lin(b);
  };
  const blkThrs = 0.022;
  const blkClmp = 1.414;
  let txtY = sRGBtoY(textHex);
  let bgY = sRGBtoY(bgHex);
  txtY = txtY > blkThrs ? txtY : txtY + Math.pow(blkThrs - txtY, blkClmp);
  bgY = bgY > blkThrs ? bgY : bgY + Math.pow(blkThrs - bgY, blkClmp);
  if (Math.abs(bgY - txtY) < 0.0005) return 0;
  let out: number;
  if (bgY > txtY) {
    const sapc = (Math.pow(bgY, 0.56) - Math.pow(txtY, 0.57)) * 1.14;
    out = sapc < 0.1 ? 0 : sapc - 0.027;
  } else {
    const sapc = (Math.pow(bgY, 0.65) - Math.pow(txtY, 0.62)) * 1.14;
    out = sapc > -0.1 ? 0 : sapc + 0.027;
  }
  return round(out * 100, 1);
}

export const RAMP_STEPS = ["50", "100", "200", "300", "400", "500", "600", "700", "800", "900", "950"] as const;
const RAMP_L = [0.977, 0.945, 0.885, 0.805, 0.715, 0.635, 0.55, 0.465, 0.385, 0.305, 0.225];
// Chroma envelope: tints and shades taper so they stay in gamut and feel natural.
const RAMP_C = [0.12, 0.25, 0.45, 0.7, 0.9, 1, 0.97, 0.88, 0.75, 0.6, 0.48];

/**
 * Build an 11-step OKLCH ramp around a source color. The source hex is pinned *exactly*
 * at the step whose target lightness is nearest, so the real brand color always survives.
 */
export function ramp(hex: string): { pinned: string; steps: Record<string, string> } {
  const src = oklch(hex);
  let pinIdx = 0;
  let best = Infinity;
  RAMP_L.forEach((l, i) => {
    const d = Math.abs(l - src.l);
    if (d < best) {
      best = d;
      pinIdx = i;
    }
  });
  // Peak chroma such that the pinned step reproduces the source chroma.
  // Cap so a very dark/light source (pinned at 50/950) doesn't explode into neon mid-tones.
  const peak = Math.min(src.c / RAMP_C[pinIdx], Math.max(src.c * 1.35, 0.06), 0.32);
  const lShift = src.l - RAMP_L[pinIdx];
  const steps: Record<string, string> = {};
  RAMP_STEPS.forEach((step, i) => {
    if (i === pinIdx) {
      steps[step] = hex.toLowerCase();
      return;
    }
    // Fade the lightness shift toward the ends so 50 stays near-white and 950 near-black.
    const falloff = 1 - Math.min(1, Math.abs(i - pinIdx) / 5);
    const l = clamp(RAMP_L[i] + lShift * falloff, 0.08, 0.99);
    // Slight hue drift toward warmer shades / cooler tints mimics natural pigments.
    const h = src.h + (i - pinIdx) * (src.c < 0.04 ? 0 : 0.8);
    steps[step] = fromOklch(l, peak * RAMP_C[i], h);
  });
  return { pinned: RAMP_STEPS[pinIdx], steps };
}

/** Mix two colors in OKLab. */
export function mix(a: string, b: string, t: number) {
  return formatHex(interpolate([a, b], "oklab")(t))!.toLowerCase();
}

export function shift(hex: string, { l = 0, c = 0, h = 0 }: { l?: number; c?: number; h?: number }) {
  const o = oklch(hex);
  return fromOklch(clamp(o.l + l, 0, 1), Math.max(0, o.c + c), o.h + h);
}

const HUE_NAMES: [number, string][] = [
  [12, "Rose"],
  [30, "Red"],
  [50, "Coral"],
  [70, "Orange"],
  [85, "Amber"],
  [105, "Yellow"],
  [125, "Lime"],
  [150, "Green"],
  [168, "Emerald"],
  [190, "Teal"],
  [215, "Cyan"],
  [235, "Sky"],
  [262, "Blue"],
  [280, "Indigo"],
  [298, "Violet"],
  [318, "Purple"],
  [340, "Fuchsia"],
  [360, "Pink"],
];

/** A plain-language name for a color: "Indigo", "Warm Gray", "Ink", "Paper". */
export function describeColor(hex: string): string {
  const { l, c, h } = oklch(hex);
  if (c < 0.02) {
    const tint = c < 0.006 ? "" : h > 200 && h < 300 ? "Cool " : h > 30 && h < 120 ? "Warm " : "";
    if (l > 0.995) return "White";
    if (l > 0.965) return `${tint}Snow`;
    if (l > 0.9) return `${tint}Paper`;
    if (l > 0.75) return `${tint}Mist`;
    if (l > 0.55) return `${tint}Gray`;
    if (l > 0.35) return `${tint}Graphite`;
    if (l > 0.18) return `${tint}Ink`;
    return l < 0.08 ? "Black" : `${tint}Onyx`;
  }
  if (c < 0.05) {
    const warm = h > 30 && h < 120;
    const base = l > 0.8 ? "Light" : l < 0.35 ? "Dark" : "";
    return `${base ? base + " " : ""}${warm ? "Warm" : h > 180 && h < 300 ? "Cool" : "Tinted"} Gray`;
  }
  const name = HUE_NAMES.find(([deg]) => h < deg)?.[1] ?? "Pink";
  const tone = l > 0.85 ? "Pale " : l < 0.3 ? "Deep " : "";
  return tone + name;
}

export function round(n: number, d = 2) {
  const p = Math.pow(10, d);
  return Math.round(n * p) / p;
}

export function clamp(n: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, n));
}

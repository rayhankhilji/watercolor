import type { CaptureResult } from "../crawl/crawl.js";
import type { SpacingSystem, ShapeSystem, LayoutSystem, MotionSystem, Easing, Keyframes, NamedValue, Hex } from "../profile/schema.js";
import type { CssSummary } from "../util/css.js";
import { declarations } from "../util/css.js";
import { parseColor, composite } from "../util/color.js";

const sumMaps = (maps: Record<string, number>[]) => {
  const out: Record<string, number> = {};
  for (const m of maps) for (const [k, v] of Object.entries(m)) out[k] = (out[k] || 0) + v;
  return out;
};

/* ---------------------------------------------------------------- spacing */

export function extractSpacing(capture: CaptureResult): SpacingSystem {
  const all = sumMaps(capture.pages.map((p) => p.raw.spacing as Record<string, number>));
  const raw = Object.entries(all)
    .map(([k, v]) => ({ value: Number(k), count: v }))
    .filter((x) => x.value > 0)
    .sort((a, b) => b.count - a.count);
  const total = raw.reduce((a, b) => a + b.count, 0) || 1;
  const divisible = (n: number) => raw.filter((x) => x.value % n === 0).reduce((a, b) => a + b.count, 0) / total;
  const base = divisible(8) >= 0.72 ? 8 : divisible(4) >= 0.7 ? 4 : divisible(6) >= 0.7 ? 6 : divisible(5) >= 0.7 ? 5 : 4;

  // Scale = frequently used values, snapped to the base grid where they're close.
  const snapped = new Map<number, number>();
  for (const { value, count } of raw) {
    const s = value <= 4 ? value : Math.round(value / base) * base === value || Math.abs(Math.round(value / base) * base - value) <= 1 ? Math.round(value / base) * base : value;
    snapped.set(s, (snapped.get(s) || 0) + count);
  }
  const threshold = total * 0.006;
  let scale = [...snapped.entries()]
    .filter(([v, c]) => c >= threshold && v <= 240)
    .map(([v]) => v)
    .sort((a, b) => a - b);
  if (scale.length < 6) scale = Array.from(new Set([base / 2, base, base * 1.5, base * 2, base * 3, base * 4, base * 6, base * 8, base * 12, base * 16].map(Math.round))).sort((a, b) => a - b);
  scale = scale.slice(0, 18);

  const sectionPadding = Array.from(
    new Set(
      capture.pages[0].raw.sections
        .flatMap((s: { pt: number; pb: number }) => [s.pt, s.pb])
        .filter((v: number) => v >= 40)
        .map((v: number) => Math.round(v / base) * base),
    ),
  )
    .sort((a, b) => (a as number) - (b as number))
    .slice(0, 6) as number[];

  if (!sectionPadding.length) sectionPadding.push(...scale.filter((v) => v >= 48).slice(-3));
  if (!sectionPadding.length) sectionPadding.push(base * 12, base * 16);
  return { base, scale, sectionPadding, raw: raw.slice(0, 40) };
}

/* ---------------------------------------------------------------- shape */

export function extractShape(capture: CaptureResult): ShapeSystem {
  const pageBg = "#ffffff";
  const rad = sumMaps(capture.pages.map((p) => p.raw.radii as Record<string, number>));
  const radList = Object.entries(rad)
    .map(([v, c]) => ({ v, px: v.includes("%") ? 9999 : parseFloat(v), c }))
    .filter((x) => Number.isFinite(x.px))
    .sort((a, b) => a.px - b.px);
  // Cluster radii within 1px
  const clusters: { px: number; c: number; v: string }[] = [];
  for (const r of radList) {
    const px = r.px >= 999 ? 9999 : Math.round(r.px);
    const near = clusters.find((c) => Math.abs(c.px - px) <= 1);
    if (near) {
      near.c += r.c;
      if (r.c > near.c / 2) {
        near.px = px;
        near.v = `${px}px`;
      }
    } else clusters.push({ px, c: r.c, v: px >= 9999 ? "9999px" : `${px}px` });
  }
  const totalR = clusters.reduce((a, b) => a + b.c, 0) || 1;
  const significant = clusters.filter((c) => c.c / totalR > 0.015).sort((a, b) => a.px - b.px).slice(0, 7);
  const names = ["xs", "sm", "md", "lg", "xl", "2xl", "3xl"];
  const radii: NamedValue[] = [];
  significant.forEach((c, i) => {
    if (c.px >= 9999) radii.push({ name: "full", value: "9999px", count: c.c });
    else radii.push({ name: names[Math.min(i, names.length - 1)], value: c.v, count: c.c });
  });

  const sh = sumMaps(capture.pages.map((p) => p.raw.shadows as Record<string, number>));
  const shadowsSorted = Object.entries(sh)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([v, c]) => ({ v, c, blur: shadowBlur(v) }))
    .sort((a, b) => a.blur - b.blur);
  const shadowNames = ["xs", "sm", "md", "lg", "xl", "2xl", "3xl", "4xl"];
  const shadows = shadowsSorted.map((s, i) => ({ name: shadowNames[i], value: s.v, count: s.c }));

  const b = sumMaps(capture.pages.map((p) => p.raw.borders as Record<string, number>));
  const borders = Object.entries(b)
    .map(([k, count]) => {
      const [w, style, color] = k.split("|");
      const c = parseColor(color);
      return { width: parseFloat(w), style, color: (c ? composite(c, pageBg) : "#000000") as Hex, count };
    })
    .sort((a, b2) => b2.count - a.count)
    .slice(0, 6);

  // Shape language from usage-weighted radius of UI elements.
  let weighted = 0;
  let pillShare = 0;
  for (const c of clusters) {
    if (c.px >= 9999) pillShare += c.c / totalR;
    else weighted += Math.min(c.px, 40) * (c.c / totalR);
  }
  const nonPill = 1 - pillShare || 1;
  const avg = weighted / nonPill;
  const language: ShapeSystem["language"] = !clusters.length ? "sharp" : pillShare > 0.35 ? "pill" : avg < 2.5 ? "sharp" : avg < 7 ? "subtle" : avg < 18 ? "rounded" : "rounded";
  return { radii, shadows, borders, language: pillShare > 0.2 && avg > 8 ? "mixed" : language };
}

function shadowBlur(v: string) {
  // largest blur radius among layers
  let max = 0;
  for (const layer of v.split(/,(?![^(]*\))/)) {
    const nums = layer.replace(/rgba?\([^)]*\)|oklch\([^)]*\)|#[0-9a-f]+/gi, "").match(/-?[\d.]+px/g) || [];
    const blur = parseFloat(nums[2] || "0");
    max = Math.max(max, blur + Math.abs(parseFloat(nums[1] || "0")));
  }
  return max;
}

/* ---------------------------------------------------------------- layout */

export function extractLayout(capture: CaptureResult, css: CssSummary, spacing: SpacingSystem): LayoutSystem {
  const mw = sumMaps(capture.pages.map((p) => p.raw.maxWidths as Record<string, number>));
  const containers = Object.entries(mw)
    .map(([v, c]) => ({ value: Number(v), count: c }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);
  const maxWidth = containers.filter((c) => c.value >= 960).sort((a, b) => b.count - a.count)[0]?.value ?? containers[0]?.value ?? 1200;

  const bps = [...css.breakpoints.entries()].sort((a, b) => b[1] - a[1]);
  const breakpoints: number[] = [];
  for (const [v] of bps) {
    if (breakpoints.some((b) => Math.abs(b - v) < 24)) continue;
    breakpoints.push(v);
    if (breakpoints.length >= 6) break;
  }
  breakpoints.sort((a, b) => a - b);

  const gc = sumMaps(capture.pages.map((p) => p.raw.gridCols as Record<string, number>));
  const gridColumns = Object.entries(gc)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([k]) => Number(k));
  const gutter = spacing.raw.filter((r) => r.value >= 16 && r.value <= 48).sort((a, b) => b.count - a.count)[0]?.value ?? spacing.base * 3;

  const sections = capture.pages[0].raw.sections as { pt: number; pb: number; h: number }[];
  const pads = sections.flatMap((s) => [s.pt, s.pb]).filter((v) => v > 0);
  const avgPad = pads.length ? pads.reduce((a, b) => a + b, 0) / pads.length : 64;
  const density: LayoutSystem["density"] = avgPad >= 96 ? "airy" : avgPad < 48 ? "dense" : "balanced";

  const headings = capture.pages[0].raw.headings as { tag: string; align?: string; centered?: boolean }[];
  const centered = headings.filter((h) => h.centered).length;
  const alignment: LayoutSystem["alignment"] = !headings.length ? "mixed" : centered / headings.length > 0.6 ? "centered" : centered / headings.length < 0.25 ? "left" : "mixed";

  return { containers, maxWidth, breakpoints, gridColumns, gutter, sectionSpacing: spacing.sectionPadding, density, alignment };
}

/* ---------------------------------------------------------------- motion */

const KNOWN_EASINGS: [string, number[], string][] = [
  ["linear", [0, 0, 1, 1], "Mechanical, constant velocity — loops, marquees, progress."],
  ["ease", [0.25, 0.1, 0.25, 1], "Browser default; gentle and generic."],
  ["ease-in", [0.42, 0, 1, 1], "Accelerates out — for exits."],
  ["ease-out", [0, 0, 0.58, 1], "Soft deceleration — default for entrances."],
  ["ease-in-out", [0.42, 0, 0.58, 1], "Symmetric and smooth — for on-screen movement."],
  ["standard (Material)", [0.4, 0, 0.2, 1], "Material standard curve — quick start, long settle."],
  ["decelerate (Material)", [0, 0, 0.2, 1], "Lands softly — entrances."],
  ["accelerate (Material)", [0.4, 0, 1, 1], "Leaves decisively — exits."],
  ["easeOutQuad", [0.25, 0.46, 0.45, 0.94], "Light, natural deceleration."],
  ["easeOutCubic", [0.215, 0.61, 0.355, 1], "Confident deceleration."],
  ["easeOutQuart", [0.165, 0.84, 0.44, 1], "Fast arrival, long graceful settle."],
  ["easeOutQuint", [0.23, 1, 0.32, 1], "Snappy and premium — very fast start, silky end."],
  ["easeOutExpo", [0.19, 1, 0.22, 1], "Dramatic, product-launch deceleration."],
  ["easeOutCirc", [0.075, 0.82, 0.165, 1], "Abrupt start, gentle glide."],
  ["easeOutBack", [0.175, 0.885, 0.32, 1.275], "Overshoots then settles — playful."],
  ["easeInOutCubic", [0.645, 0.045, 0.355, 1], "Cinematic, deliberate transitions."],
  ["easeInOutQuart", [0.77, 0, 0.175, 1], "Strong, editorial transitions."],
  ["easeInOutQuint", [0.86, 0, 0.07, 1], "Very dramatic in-out."],
  ["easeInOutExpo", [1, 0, 0, 1], "Snap transitions — high energy."],
  ["iOS sheet / drawer", [0.32, 0.72, 0, 1], "Physical, spring-like deceleration without overshoot."],
  ["emphasized (Material 3)", [0.2, 0, 0, 1], "Expressive, confident."],
];

function parseBezier(v: string): number[] | null {
  const kw = KNOWN_EASINGS.find(([n]) => n === v.trim());
  if (kw) return kw[1];
  const m = /cubic-bezier\(\s*([-\d.]+)\s*,\s*([-\d.]+)\s*,\s*([-\d.]+)\s*,\s*([-\d.]+)\s*\)/.exec(v);
  return m ? m.slice(1, 5).map(Number) : null;
}

export function describeEasing(v: string): Pick<Easing, "name" | "character"> {
  if (v.startsWith("steps(")) return { name: v, character: "Stepped / frame-by-frame — sprite or ticker motion." };
  if (v.startsWith("linear(")) return { name: "spring (linear())", character: "Spring physics approximated with CSS linear() — organic and modern." };
  const b = parseBezier(v);
  if (!b) return { name: v, character: "Custom timing." };
  let best = KNOWN_EASINGS[0];
  let bd = Infinity;
  for (const k of KNOWN_EASINGS) {
    const d = k[1].reduce((s, x, i) => s + (x - b[i]) ** 2, 0);
    if (d < bd) {
      bd = d;
      best = k;
    }
  }
  if (bd < 0.012) return { name: best[0], character: best[2] };
  const [x1, y1, x2, y2] = b;
  let character = "Custom curve";
  if (y2 > 1.02 || y1 > 1.02) character = "Custom overshoot — springy, playful";
  else if (y1 < -0.02) character = "Custom anticipation — winds up before moving";
  else if (x1 < 0.2 && y1 > 0.6) character = "Custom ease-out — decisive start, soft landing";
  else if (x1 > 0.4 && x2 < 0.3) character = "Custom ease-in-out — deliberate, cinematic";
  else if (x1 > 0.4 && x2 > 0.8) character = "Custom ease-in — accelerating exit";
  return { name: `cubic-bezier(${x1}, ${y1}, ${x2}, ${y2})`, character };
}

function toMs(v: string) {
  const n = parseFloat(v);
  return v.trim().endsWith("ms") ? n : n * 1000;
}

export function extractMotion(capture: CaptureResult, css: CssSummary): MotionSystem {
  const trans = sumMaps(capture.pages.map((p) => p.raw.transitions as Record<string, number>));
  const durations = new Map<number, number>();
  const easings = new Map<string, number>();
  const transitions: MotionSystem["transitions"] = [];
  for (const [k, count] of Object.entries(trans)) {
    const [property, dur, ease] = k.split("|");
    const ms = Math.round(toMs(dur));
    if (!(ms > 0) || ms > 5000) continue;
    durations.set(ms, (durations.get(ms) || 0) + count);
    easings.set(ease, (easings.get(ease) || 0) + count);
    transitions.push({ property, duration: ms, easing: ease, count });
  }
  const anim = sumMaps(capture.pages.map((p) => p.raw.animations as Record<string, number>));
  const usedAnimations = new Map<string, number>();
  for (const [k, count] of Object.entries(anim)) {
    const [name, dur, ease] = k.split("|");
    usedAnimations.set(name, (usedAnimations.get(name) || 0) + count);
    const ms = Math.round(toMs(dur.split(",")[0]));
    if (ms > 0 && ms <= 5000) durations.set(ms, (durations.get(ms) || 0) + count);
    const e = ease.split(/,(?![^(]*\))/)[0].trim();
    easings.set(e, (easings.get(e) || 0) + count);
  }

  const kfMap = new Map(css.keyframes.map((k) => [k.name, k]));
  const keyframes: Keyframes[] = [];
  for (const [name, count] of [...usedAnimations.entries()].sort((a, b) => b[1] - a[1])) {
    const k = kfMap.get(name);
    if (!k) continue;
    keyframes.push({ name, css: k.css.slice(0, 2400), count, ...summarizeKeyframes(k.body) });
  }
  // Also surface unused-but-defined keyframes with brand-y names (they're part of the system).
  for (const k of css.keyframes) {
    if (keyframes.length >= 24) break;
    if (usedAnimations.has(k.name) || keyframes.some((x) => x.name === k.name)) continue;
    if (/^(?:_|css-|sc-|[a-z]{5,8}$)/i.test(k.name) && !/fade|slide|spin|pulse|marquee|float|shimmer|reveal|rise|glow|wave|gradient|bounce|scale|ticker|blink|caret|loop/i.test(k.name)) continue;
    keyframes.push({ name: k.name, css: k.css.slice(0, 2400), count: 0, ...summarizeKeyframes(k.body) });
  }

  const s = capture.pages[0].raw.stack as Record<string, boolean | string>;
  const libraries = [
    s.framerMotion && "framer-motion",
    s.gsap && "GSAP",
    s.scrollTrigger && "GSAP ScrollTrigger",
    s.lottie && "Lottie",
    s.rive && "Rive",
    s.three && "three.js",
    s.spline && "Spline",
    s.lenis && "Lenis",
    s.locomotive && "Locomotive Scroll",
    capture.shaders.length && "WebGL shaders",
    capture.lotties.length && !s.lottie && "Lottie",
    capture.rive.length && !s.rive && "Rive",
  ].filter(Boolean) as string[];

  const scrollEffects: string[] = [];
  if (s.lenis || s.locomotive) scrollEffects.push("Smooth (inertial) scrolling");
  if (s.scrollTrigger) scrollEffects.push("Scroll-linked timelines (GSAP ScrollTrigger)");
  if (s.framerMotion) scrollEffects.push("Reveal-on-scroll / layout animations (framer-motion)");
  if (capture.canvasRecordings.length) scrollEffects.push(`${capture.canvasRecordings.length} animated canvas surface(s) (WebGL/2D)`);
  if (keyframes.some((k) => /marquee|ticker|scroll|logos?/i.test(k.name) || k.summary.includes("marquee"))) scrollEffects.push("Infinite marquee");

  const score =
    keyframes.filter((k) => k.count > 0).length +
    libraries.length * 2 +
    capture.canvasRecordings.length * 3 +
    capture.videos.length +
    capture.lotties.length * 2 +
    capture.rive.length * 2;
  const intensity: MotionSystem["intensity"] = score >= 14 ? "cinematic" : score >= 7 ? "expressive" : score >= 2 ? "subtle" : "still";

  return {
    durations: [...durations.entries()].map(([ms, count]) => ({ ms, count })).sort((a, b) => b.count - a.count).slice(0, 10),
    easings: [...easings.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([value, count]) => ({ value, count, ...describeEasing(value) })),
    keyframes,
    transitions: transitions.sort((a, b) => b.count - a.count).slice(0, 20),
    libraries: Array.from(new Set(libraries)),
    smoothScroll: !!(s.lenis || s.locomotive),
    intensity,
    scrollEffects,
  };
}

function summarizeKeyframes(body: string): { summary: string; properties: string[] } {
  const props = new Set<string>();
  const transforms = new Set<string>();
  for (const block of body.split("}")) {
    const idx = block.indexOf("{");
    if (idx < 0) continue;
    for (const [k, v] of declarations(block.slice(idx + 1))) {
      props.add(k);
      if (k === "transform") for (const m of v.matchAll(/(translate[XYZ3d]*|scale[XYZ3d]*|rotate[XYZ3d]*|skew[XY]?)\(/g)) transforms.add(m[1].replace(/[XYZ]|3d/g, ""));
      if (k === "translate") transforms.add("translate");
      if (k === "scale") transforms.add("scale");
      if (k === "rotate") transforms.add("rotate");
    }
  }
  const parts: string[] = [];
  if (props.has("opacity")) parts.push("fade");
  if (transforms.has("translate")) parts.push(body.match(/translateX\(-?(100|50)%\)|translateX\(calc/) ? "marquee" : "move");
  if (transforms.has("scale")) parts.push("scale");
  if (transforms.has("rotate")) parts.push(body.includes("360deg") ? "spin" : "rotate");
  if (props.has("background-position")) parts.push("gradient/shimmer pan");
  if (props.has("clip-path")) parts.push("clip reveal");
  if (props.has("stroke-dashoffset")) parts.push("line draw");
  if (props.has("filter")) parts.push("blur/filter");
  if (props.has("width") || props.has("height")) parts.push("size");
  if (props.has("color") || props.has("background-color") || props.has("fill")) parts.push("color shift");
  return { summary: parts.join(" + ") || [...props].slice(0, 3).join(", ") || "custom", properties: [...props] };
}

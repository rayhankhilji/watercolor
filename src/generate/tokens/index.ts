import path from "node:path";
import type { ResolvedBrand } from "../../profile/resolve.js";
import type { Hex } from "../../profile/schema.js";
import { write, writeJson } from "../../util/fs.js";
import { hexToRgb, oklchCss, ramp, mix, readableOn, oklch, fromOklch, isNeutral } from "../../util/color.js";

/** Flat, ordered token model that every output format is derived from. */
export interface TokenModel {
  colors: [string, Hex, string?][];
  ramps: Record<string, Record<string, Hex>>;
  dark: [string, Hex][];
  fonts: { display: string[]; body: string[]; mono: string[]; cssDisplay: string; cssBody: string; cssMono: string };
  weights: number[];
  type: { name: string; family: "display" | "body" | "mono"; size: number; weight: number; lineHeight: number; letterSpacing: number; transform: string }[];
  space: [string, number][];
  radius: [string, string][];
  shadows: [string, string][];
  durations: [string, number][];
  easings: [string, string][];
  gradient: Hex[];
  layout: { maxWidth: number; gutter: number; breakpoints: [string, number][] };
}

export function buildTokenModel(b: ResolvedBrand): TokenModel {
  const r = b.roles;
  const colors: [string, Hex, string?][] = [
    ["background", r.background, "Page background"],
    ["surface", r.surface, "Raised / alternate section background"],
    ["surface-alt", r.surfaceAlt, "Second surface tier"],
    ["foreground", r.foreground, "Primary text & ink"],
    ["muted", r.muted, "Secondary text"],
    ["subtle", r.subtle, "Tertiary text, placeholders"],
    ["border", r.border, "Hairlines, dividers, input borders"],
    ["primary", r.primary, "Brand primary — CTAs, focus, key accents"],
    ["primary-foreground", r.primaryForeground, "Text/icons on primary"],
    ["link", r.link, "Inline links"],
    ...r.accent.slice(0, 4).map((a, i) => [i ? `accent-${i + 1}` : "accent", a, "Secondary brand color"] as [string, Hex, string]),
    ["inverse-background", r.inverseBackground, "Inverted sections (footer, dark bands)"],
    ["inverse-foreground", r.inverseForeground, "Text on inverse background"],
    ...(r.success ? [["success", r.success, "Positive states"] as [string, Hex, string]] : []),
    ...(r.warning ? [["warning", r.warning, "Caution states"] as [string, Hex, string]] : []),
    ...(r.danger ? [["danger", r.danger, "Errors & destructive"] as [string, Hex, string]] : []),
  ];
  const ramps: Record<string, Record<string, Hex>> = {};
  for (const [k, v] of Object.entries(b.ramps)) ramps[k] = v.steps;

  const dark = deriveCounterTheme(b);
  const fam = (f: ResolvedBrand["fonts"]["display"]) => [f.family, ...f.alternatives.filter((a) => !a.includes("(")).slice(0, 1)];
  const cssFam = (f: ResolvedBrand["fonts"]["display"]) => f.stack;

  const famOf = (family: string): "display" | "body" | "mono" => (family === b.fonts.mono.family ? "mono" : family === b.fonts.display.family && family !== b.fonts.body.family ? "display" : "body");
  const type = Object.values(b.type).map((s) => ({
    name: s.name,
    family: s.name === "code" ? "mono" : ["display", "h1", "h2", "h3", "h4"].includes(s.name) ? (b.fonts.display.family !== b.fonts.body.family ? "display" : famOf(s.family)) : famOf(s.family),
    size: s.size,
    weight: s.weight,
    lineHeight: s.lineHeight,
    letterSpacing: s.letterSpacing,
    transform: s.textTransform,
  })) as TokenModel["type"];

  const space: [string, number][] = b.spacing.scale.map((v) => [String(+(v / 4).toFixed(2)).replace(".", "_"), v]);
  const radius: [string, string][] = [
    ["none", "0px"],
    ["sm", `${b.radius.sm}px`],
    ["md", `${b.radius.md}px`],
    ["lg", `${b.radius.lg}px`],
    ["xl", `${b.radius.xl}px`],
    ["full", "9999px"],
    ["button", b.radius.button],
    ["card", b.radius.card],
  ];
  const shadows: [string, string][] = b.shadows.slice(0, 6).map((s, i) => [["xs", "sm", "md", "lg", "xl", "2xl"][i], s.value]);
  const weights = Array.from(new Set([...b.fonts.display.weights, ...b.fonts.body.weights])).sort((a, c) => a - c);
  const bps = b.profile.layout.breakpoints;
  const bpNames = ["sm", "md", "lg", "xl", "2xl", "3xl"];
  return {
    colors,
    ramps,
    dark,
    fonts: { display: fam(b.fonts.display), body: fam(b.fonts.body), mono: fam(b.fonts.mono), cssDisplay: cssFam(b.fonts.display), cssBody: cssFam(b.fonts.body), cssMono: cssFam(b.fonts.mono) },
    weights,
    type,
    space,
    radius,
    shadows,
    durations: [["fast", b.motion.fast], ["base", b.motion.base], ["slow", b.motion.slow]],
    easings: [["standard", b.motion.standard], ["entrance", b.motion.entrance], ["exit", b.motion.exit], ["emphasis", b.motion.emphasis]],
    gradient: b.gradient,
    layout: { maxWidth: b.profile.layout.maxWidth, gutter: b.profile.layout.gutter, breakpoints: bps.map((v, i) => [bpNames[i] ?? `bp${i}`, v]) },
  };
}

/**
 * The brand only shows one theme on its marketing site. Derive the counterpart (dark for light brands,
 * light for dark brands) from its own neutral ramp so product teams get a coherent second theme.
 */
function deriveCounterTheme(b: ResolvedBrand): [string, Hex][] {
  const r = b.roles;
  const n = b.ramps.neutral?.steps ?? ramp(mix(r.foreground, r.background, 0.5)).steps;
  const nh = oklch(n["500"]);
  const tintedDark = (l: number) => fromOklch(l, Math.min(nh.c, 0.03), nh.h);
  if (b.scheme === "light") {
    const bg = oklch(r.inverseBackground).l < 0.25 && !isNeutral(r.inverseBackground, 0.08) ? r.inverseBackground : tintedDark(0.17);
    const primary = oklch(r.primary).l < 0.5 ? mix(r.primary, "#ffffff", 0.25) : r.primary;
    return [
      ["background", bg],
      ["surface", mix(bg, "#ffffff", 0.05)],
      ["surface-alt", mix(bg, "#ffffff", 0.09)],
      ["foreground", mix(r.background, bg, 0.04)],
      ["muted", mix(r.background, bg, 0.32)],
      ["subtle", mix(r.background, bg, 0.5)],
      ["border", mix(bg, "#ffffff", 0.13)],
      ["primary", primary],
      ["primary-foreground", readableOn(primary, [bg, "#ffffff", "#0a0a0a"])],
      ["link", oklch(r.link).l < 0.55 ? mix(r.link, "#ffffff", 0.35) : r.link],
    ];
  }
  const bg = "#ffffff";
  return [
    ["background", bg],
    ["surface", n["50"]],
    ["surface-alt", n["100"]],
    ["foreground", n["950"]],
    ["muted", n["600"]],
    ["subtle", n["500"]],
    ["border", n["200"]],
    ["primary", oklch(r.primary).l > 0.75 ? mix(r.primary, "#000000", 0.25) : r.primary],
    ["primary-foreground", readableOn(r.primary, ["#ffffff", "#0a0a0a"])],
    ["link", oklch(r.link).l > 0.7 ? mix(r.link, "#000000", 0.35) : r.link],
  ];
}

const em = (n: number) => `${+n.toFixed(4)}em`;

export async function writeTokens(b: ResolvedBrand, outDir: string) {
  const t = buildTokenModel(b);
  const dir = path.join(outDir, "tokens");
  const files: string[] = [];
  files.push(await writeJson(path.join(dir, "tokens.json"), dtcg(t, b)));
  files.push(await write(path.join(dir, "tokens.css"), css(t, b)));
  files.push(await write(path.join(dir, "tailwind.css"), tailwind(t, b)));
  files.push(await writeJson(path.join(dir, "tokens.figma.json"), tokensStudio(t)));
  files.push(await write(path.join(dir, "tokens.ts"), ts(t, b)));
  files.push(await write(path.join(dir, "tokens.scss"), scss(t)));
  const pal = paletteEntries(t, b);
  files.push(await write(path.join(outDir, "colors", "palette.gpl"), gpl(pal, b.name)));
  files.push(await write(path.join(outDir, "colors", "palette.ase"), ase(pal)));
  files.push(await writeJson(path.join(outDir, "colors", "palette.json"), pal.map(([name, hex]) => ({ name, hex, rgb: hexToRgb(hex), oklch: oklchCss(hex) }))));
  return { model: t, files };
}

function paletteEntries(t: TokenModel, b: ResolvedBrand): [string, Hex][] {
  const names = b.strategy.colorNames ?? {};
  const out: [string, Hex][] = t.colors.map(([k, v]) => [names[v] ? `${names[v]} (${k})` : k, v]);
  for (const [rk, steps] of Object.entries(t.ramps)) for (const [s, v] of Object.entries(steps)) out.push([`${rk}-${s}`, v]);
  return out;
}

function dtcg(t: TokenModel, b: ResolvedBrand) {
  const color: Record<string, unknown> = {};
  for (const [k, v, d] of t.colors) color[k] = { $type: "color", $value: v, ...(d ? { $description: d } : {}) };
  color.scale = Object.fromEntries(Object.entries(t.ramps).map(([k, steps]) => [k, Object.fromEntries(Object.entries(steps).map(([s, v]) => [s, { $type: "color", $value: v }]))]));
  const themeName = b.scheme === "light" ? "dark" : "light";
  const typography = Object.fromEntries(
    t.type.map((s) => [
      s.name,
      {
        $type: "typography",
        $value: { fontFamily: `{font.family.${s.family}}`, fontSize: `${s.size}px`, fontWeight: s.weight, lineHeight: s.lineHeight, letterSpacing: em(s.letterSpacing) },
        ...(s.transform !== "none" ? { $extensions: { "com.watercolor": { textTransform: s.transform } } } : {}),
      },
    ]),
  );
  return {
    $description: `${b.name} design tokens — extracted from ${b.url} by watercolor. W3C Design Tokens (DTCG) format.`,
    color,
    [`color-${themeName}`]: Object.fromEntries(t.dark.map(([k, v]) => [k, { $type: "color", $value: v, $description: `Derived ${themeName} theme` }])),
    gradient: { signature: { $type: "gradient", $value: t.gradient.map((c, i) => ({ color: c, position: +(i / Math.max(1, t.gradient.length - 1)).toFixed(3) })) } },
    font: {
      family: { display: { $type: "fontFamily", $value: t.fonts.display }, body: { $type: "fontFamily", $value: t.fonts.body }, mono: { $type: "fontFamily", $value: t.fonts.mono } },
      weight: Object.fromEntries(t.weights.map((w) => [String(w), { $type: "fontWeight", $value: w }])),
    },
    typography,
    space: Object.fromEntries(t.space.map(([k, v]) => [k, { $type: "dimension", $value: `${v}px` }])),
    radius: Object.fromEntries(t.radius.map(([k, v]) => [k, { $type: "dimension", $value: v }])),
    shadow: Object.fromEntries(t.shadows.map(([k, v]) => [k, { $type: "shadow", $value: parseShadow(v) }])),
    duration: Object.fromEntries(t.durations.map(([k, v]) => [k, { $type: "duration", $value: `${v}ms` }])),
    easing: Object.fromEntries(t.easings.map(([k, v]) => [k, { $type: "cubicBezier", $value: bezier(v) ?? v }])),
    layout: {
      "max-width": { $type: "dimension", $value: `${t.layout.maxWidth}px` },
      gutter: { $type: "dimension", $value: `${t.layout.gutter}px` },
      breakpoint: Object.fromEntries(t.layout.breakpoints.map(([k, v]) => [k, { $type: "dimension", $value: `${v}px` }])),
    },
  };
}

function bezier(v: string): number[] | null {
  const m = /cubic-bezier\(([^)]+)\)/.exec(v);
  return m ? m[1].split(",").map((x) => +x.trim()) : null;
}

function parseShadow(v: string) {
  return v.split(/,(?![^(]*\))/).map((layer) => {
    const color = (layer.match(/(rgba?\([^)]*\)|#[0-9a-f]{3,8}|oklch\([^)]*\))/i) || ["#00000026"])[0];
    const nums = layer.replace(color, "").match(/-?[\d.]+px|\b0\b/g) || [];
    const px = (i: number) => `${parseFloat(nums[i] || "0")}px`;
    return { color, offsetX: px(0), offsetY: px(1), blur: px(2), spread: px(3), inset: /inset/.test(layer) };
  });
}

function typeCss(t: TokenModel, s: TokenModel["type"][number]) {
  return `font-family: var(--font-${s.family}); font-size: var(--text-${s.name}-size); font-weight: var(--text-${s.name}-weight); line-height: var(--text-${s.name}-line-height); letter-spacing: var(--text-${s.name}-tracking);${s.transform !== "none" ? ` text-transform: ${s.transform};` : ""}`;
}

function css(t: TokenModel, b: ResolvedBrand) {
  const L: string[] = [];
  L.push(`/**\n * ${b.name} — design tokens\n * Extracted from ${b.url} by watercolor (https://github.com/rayhankhilji/watercolor)\n * Values marked "derived" were generated to complete the system; everything else was measured.\n */\n`);
  L.push(":root {");
  L.push("  /* Color — roles */");
  for (const [k, v, d] of t.colors) L.push(`  --color-${k}: ${v};${d ? ` /* ${d} */` : ""}`);
  L.push("\n  /* Color — scales (OKLCH ramps; the brand's own value is pinned at its nearest step) */");
  for (const [rk, steps] of Object.entries(t.ramps)) for (const [s, v] of Object.entries(steps)) L.push(`  --color-${rk}-${s}: ${v};`);
  L.push("\n  /* Signature gradient */");
  L.push(`  --gradient-signature: linear-gradient(120deg, ${t.gradient.join(", ")});`);
  L.push("\n  /* Typography */");
  L.push(`  --font-display: ${t.fonts.cssDisplay};`);
  L.push(`  --font-body: ${t.fonts.cssBody};`);
  L.push(`  --font-mono: ${t.fonts.cssMono};`);
  for (const s of t.type) {
    L.push(`  --text-${s.name}-size: ${s.size / 16}rem; /* ${s.size}px */`);
    L.push(`  --text-${s.name}-weight: ${s.weight};`);
    L.push(`  --text-${s.name}-line-height: ${s.lineHeight};`);
    L.push(`  --text-${s.name}-tracking: ${em(s.letterSpacing)};`);
  }
  L.push("\n  /* Space */");
  for (const [k, v] of t.space) L.push(`  --space-${k}: ${v / 16}rem; /* ${v}px */`);
  L.push("\n  /* Radius */");
  for (const [k, v] of t.radius) L.push(`  --radius-${k}: ${v};`);
  if (t.shadows.length) {
    L.push("\n  /* Elevation */");
    for (const [k, v] of t.shadows) L.push(`  --shadow-${k}: ${v};`);
  }
  L.push("\n  /* Motion */");
  for (const [k, v] of t.durations) L.push(`  --duration-${k}: ${v}ms;`);
  for (const [k, v] of t.easings) L.push(`  --ease-${k}: ${v};`);
  L.push("\n  /* Layout */");
  L.push(`  --layout-max-width: ${t.layout.maxWidth}px;`);
  L.push(`  --layout-gutter: ${t.layout.gutter}px;`);
  L.push("}\n");
  const other = b.scheme === "light" ? "dark" : "light";
  L.push(`/* Derived ${other} theme — not present on the source site; generated from the brand's own neutrals. */`);
  L.push(`[data-theme="${other}"] {`);
  for (const [k, v] of t.dark) L.push(`  --color-${k}: ${v};`);
  L.push("}\n");
  L.push("/* Type utilities */");
  for (const s of t.type) L.push(`.text-${s.name} { ${typeCss(t, s)} }`);
  L.push(`\n@media (prefers-reduced-motion: reduce) {\n  :root { --duration-fast: 0ms; --duration-base: 0ms; --duration-slow: 0ms; }\n}\n`);
  return L.join("\n");
}

function tailwind(t: TokenModel, b: ResolvedBrand) {
  const L: string[] = [];
  L.push(`/* ${b.name} — Tailwind CSS v4 theme. Generated by watercolor.\n   Usage: @import "tailwindcss"; @import "./tailwind.css"; */\n`);
  L.push("@theme {");
  for (const [k, v] of t.colors) L.push(`  --color-${k}: ${v};`);
  for (const [rk, steps] of Object.entries(t.ramps)) for (const [s, v] of Object.entries(steps)) L.push(`  --color-${rk}-${s}: ${v};`);
  L.push(`  --font-display: ${t.fonts.cssDisplay};`);
  L.push(`  --font-sans: ${t.fonts.cssBody};`);
  L.push(`  --font-mono: ${t.fonts.cssMono};`);
  for (const s of t.type) {
    L.push(`  --text-${s.name}: ${s.size / 16}rem;`);
    L.push(`  --text-${s.name}--line-height: ${s.lineHeight};`);
    L.push(`  --text-${s.name}--letter-spacing: ${em(s.letterSpacing)};`);
    L.push(`  --text-${s.name}--font-weight: ${s.weight};`);
  }
  L.push(`  --spacing: ${b.spacing.base === 8 ? 0.25 : b.spacing.base / 16}rem;`);
  for (const [k, v] of t.radius) L.push(`  --radius-${k}: ${v};`);
  for (const [k, v] of t.shadows) L.push(`  --shadow-${k}: ${v};`);
  for (const [k, v] of t.easings) L.push(`  --ease-${k}: ${v};`);
  for (const [k, v] of t.layout.breakpoints) L.push(`  --breakpoint-${k}: ${v / 16}rem;`);
  L.push(`  --container-site: ${t.layout.maxWidth / 16}rem;`);
  L.push("}\n");
  const other = b.scheme === "light" ? "dark" : "light";
  L.push(`@custom-variant ${other} (&:where([data-theme=${other}], [data-theme=${other}] *));\n`);
  L.push(`[data-theme="${other}"] {`);
  for (const [k, v] of t.dark) L.push(`  --color-${k}: ${v};`);
  L.push("}\n");
  L.push(`@utility bg-signature { background-image: linear-gradient(120deg, ${t.gradient.join(", ")}); }`);
  for (const [k, v] of t.durations) L.push(`@utility duration-${k} { transition-duration: ${v}ms; }`);
  return L.join("\n") + "\n";
}

function tokensStudio(t: TokenModel) {
  const global: Record<string, unknown> = {
    color: Object.fromEntries([...t.colors.map(([k, v]) => [k, { value: v, type: "color" }]), ...Object.entries(t.ramps).map(([k, steps]) => [k, Object.fromEntries(Object.entries(steps).map(([s, v]) => [s, { value: v, type: "color" }]))])]),
    fontFamilies: { display: { value: t.fonts.display[0], type: "fontFamilies" }, body: { value: t.fonts.body[0], type: "fontFamilies" }, mono: { value: t.fonts.mono[0], type: "fontFamilies" } },
    typography: Object.fromEntries(
      t.type.map((s) => [s.name, { type: "typography", value: { fontFamily: `{fontFamilies.${s.family}}`, fontWeight: String(s.weight), fontSize: String(s.size), lineHeight: `${Math.round(s.lineHeight * 100)}%`, letterSpacing: `${+(s.letterSpacing * 100).toFixed(2)}%`, textCase: s.transform === "uppercase" ? "uppercase" : "none" } }]),
    ),
    spacing: Object.fromEntries(t.space.map(([k, v]) => [k, { value: String(v), type: "spacing" }])),
    borderRadius: Object.fromEntries(t.radius.map(([k, v]) => [k, { value: String(parseFloat(v)), type: "borderRadius" }])),
    boxShadow: Object.fromEntries(t.shadows.map(([k, v]) => [k, { type: "boxShadow", value: parseShadow(v).map((s) => ({ x: parseFloat(s.offsetX), y: parseFloat(s.offsetY), blur: parseFloat(s.blur), spread: parseFloat(s.spread), color: s.color, type: s.inset ? "innerShadow" : "dropShadow" })) }])),
  };
  return { global, theme: { color: Object.fromEntries(t.dark.map(([k, v]) => [k, { value: v, type: "color" }])) }, $themes: [], $metadata: { tokenSetOrder: ["global", "theme"] } };
}

function ts(t: TokenModel, b: ResolvedBrand) {
  const obj = {
    color: Object.fromEntries(t.colors.map(([k, v]) => [camel(k), v])),
    scale: t.ramps,
    gradient: t.gradient,
    font: { display: t.fonts.cssDisplay, body: t.fonts.cssBody, mono: t.fonts.cssMono },
    type: Object.fromEntries(t.type.map((s) => [camel(s.name), { fontFamily: s.family, fontSize: s.size, fontWeight: s.weight, lineHeight: s.lineHeight, letterSpacing: em(s.letterSpacing), textTransform: s.transform }])),
    space: Object.fromEntries(t.space.map(([k, v]) => [k, v])),
    radius: Object.fromEntries(t.radius.map(([k, v]) => [k, v])),
    shadow: Object.fromEntries(t.shadows),
    motion: { duration: Object.fromEntries(t.durations), easing: Object.fromEntries(t.easings) },
    layout: { maxWidth: t.layout.maxWidth, gutter: t.layout.gutter, breakpoints: Object.fromEntries(t.layout.breakpoints) },
  };
  return `/** ${b.name} design tokens — generated by watercolor from ${b.url} */\nexport const tokens = ${JSON.stringify(obj, null, 2)} as const;\n\nexport type Tokens = typeof tokens;\nexport default tokens;\n`;
}

function scss(t: TokenModel) {
  const L = ["// Generated by watercolor"];
  for (const [k, v] of t.colors) L.push(`$color-${k}: ${v};`);
  for (const [rk, steps] of Object.entries(t.ramps)) for (const [s, v] of Object.entries(steps)) L.push(`$color-${rk}-${s}: ${v};`);
  L.push(`$font-display: ${t.fonts.cssDisplay};`, `$font-body: ${t.fonts.cssBody};`, `$font-mono: ${t.fonts.cssMono};`);
  for (const [k, v] of t.space) L.push(`$space-${k}: ${v}px;`);
  for (const [k, v] of t.radius) L.push(`$radius-${k}: ${v};`);
  for (const [k, v] of t.shadows) L.push(`$shadow-${k}: ${v};`);
  for (const [k, v] of t.durations) L.push(`$duration-${k}: ${v}ms;`);
  for (const [k, v] of t.easings) L.push(`$ease-${k}: ${v};`);
  return L.join("\n") + "\n";
}

function gpl(entries: [string, Hex][], name: string) {
  const L = ["GIMP Palette", `Name: ${name}`, "Columns: 11", "#"];
  for (const [n, hex] of entries) {
    const { r, g, b } = hexToRgb(hex);
    L.push(`${String(r).padStart(3)} ${String(g).padStart(3)} ${String(b).padStart(3)}\t${n}`);
  }
  return L.join("\n") + "\n";
}

/** Adobe Swatch Exchange (.ase) — imports into Illustrator, Photoshop, InDesign, Affinity, Procreate. */
function ase(entries: [string, Hex][]): Uint8Array {
  const blocks: Buffer[] = [];
  for (const [name, hex] of entries) {
    const nameBuf = Buffer.alloc((name.length + 1) * 2);
    for (let i = 0; i < name.length; i++) nameBuf.writeUInt16BE(name.charCodeAt(i), i * 2);
    const { r, g, b } = hexToRgb(hex);
    const body = Buffer.alloc(2 + nameBuf.length + 4 + 12 + 2);
    let o = 0;
    body.writeUInt16BE(name.length + 1, o);
    o += 2;
    nameBuf.copy(body, o);
    o += nameBuf.length;
    body.write("RGB ", o, "ascii");
    o += 4;
    body.writeFloatBE(r / 255, o);
    body.writeFloatBE(g / 255, o + 4);
    body.writeFloatBE(b / 255, o + 8);
    o += 12;
    body.writeUInt16BE(2, o); // normal color
    const head = Buffer.alloc(6);
    head.writeUInt16BE(0x0001, 0);
    head.writeUInt32BE(body.length, 2);
    blocks.push(head, body);
  }
  const header = Buffer.alloc(12);
  header.write("ASEF", 0, "ascii");
  header.writeUInt16BE(1, 4);
  header.writeUInt16BE(0, 6);
  header.writeUInt32BE(entries.length, 8);
  return Buffer.concat([header, ...blocks]);
}

const camel = (s: string) => s.replace(/-(\w)/g, (_, c) => c.toUpperCase());

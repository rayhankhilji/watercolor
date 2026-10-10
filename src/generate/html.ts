import { pathToFileURL } from "node:url";
import type { ResolvedBrand, FontRef } from "../profile/resolve.js";
import type { TokenModel } from "./tokens/index.js";

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);
export { esc };

/**
 * @font-face rules for the brand's captured font files (rendering only), plus a Google Fonts
 * import for open alternatives so templates still look right when files are missing.
 */
export function fontFaces(b: ResolvedBrand, mode: "file" | "relative" = "file", relBase?: string): string {
  const out: string[] = [];
  const seen = new Set<string>();
  const add = (f: FontRef) => {
    for (const file of f.files) {
      const key = f.family + file.path;
      if (seen.has(key)) continue;
      seen.add(key);
      const url = mode === "file" ? pathToFileURL(file.path).href : relBase ? relPath(relBase, file.path) : file.path;
      const fmt = file.format === "woff2" ? "woff2" : file.format === "woff" ? "woff" : file.format === "otf" ? "opentype" : "truetype";
      out.push(`@font-face{font-family:"${f.family}";src:url("${url}") format("${fmt}");font-weight:${normalizeWeight(file.weight)};font-style:${file.style || "normal"};font-display:block}`);
    }
  };
  add(b.fonts.display);
  add(b.fonts.body);
  add(b.fonts.mono);
  const google = new Set<string>();
  for (const f of [b.fonts.display, b.fonts.body, b.fonts.mono]) {
    if (!f.files.length && f.source === "google") google.add(f.family);
    for (const a of f.alternatives.filter((x) => !x.includes("(")).slice(0, 1)) google.add(a);
  }
  const imports = [...google].map((g) => `@import url("https://fonts.googleapis.com/css2?family=${encodeURIComponent(g).replace(/%20/g, "+")}:wght@300;400;500;600;700&display=block");`);
  return [...imports, ...out].join("\n");
}

function normalizeWeight(w: string) {
  return /^\d+(\s+\d+)?$/.test(w.trim()) ? w : w === "bold" ? "700" : w === "normal" ? "400" : w;
}

function relPath(from: string, to: string) {
  const fromParts = from.split("/").filter(Boolean);
  const toParts = to.split("/").filter(Boolean);
  let i = 0;
  while (i < fromParts.length && fromParts[i] === toParts[i]) i++;
  return [...fromParts.slice(i).map(() => ".."), ...toParts.slice(i)].join("/");
}

/** CSS custom properties for the brand — used by every template. */
export function brandVars(b: ResolvedBrand, t: TokenModel): string {
  const L: string[] = [":root{"];
  for (const [k, v] of t.colors) L.push(`--${k}:${v};`);
  for (const [rk, steps] of Object.entries(t.ramps)) for (const [s, v] of Object.entries(steps)) L.push(`--${rk}-${s}:${v};`);
  L.push(`--font-display:${b.fonts.display.stack};--font-body:${b.fonts.body.stack};--font-mono:${b.fonts.mono.stack};`);
  L.push(`--radius-sm:${b.radius.sm}px;--radius-md:${b.radius.md}px;--radius-lg:${b.radius.lg}px;--radius-button:${b.radius.button};--radius-card:${b.radius.card};`);
  L.push(`--ease-standard:${b.motion.standard};--ease-entrance:${b.motion.entrance};--ease-exit:${b.motion.exit};--ease-emphasis:${b.motion.emphasis};`);
  L.push(`--duration-fast:${b.motion.fast}ms;--duration-base:${b.motion.base}ms;--duration-slow:${b.motion.slow}ms;`);
  L.push(`--gradient:linear-gradient(120deg,${b.gradient.join(",")});`);
  L.push("}");
  return L.join("");
}

/** Inline CSS for a named type style (scaled). */
export function typeStyle(b: ResolvedBrand, name: string, scale = 1, overrides: Record<string, string> = {}): string {
  const s = b.type[name] ?? b.type.body;
  const fam = s.name === "code" ? "var(--font-mono)" : ["display", "h1", "h2", "h3", "h4"].includes(s.name) ? "var(--font-display)" : "var(--font-body)";
  const base: Record<string, string> = {
    "font-family": fam,
    "font-size": `${Math.round(s.size * scale)}px`,
    "font-weight": String(s.weight),
    "line-height": String(s.lineHeight),
    "letter-spacing": `${s.letterSpacing}em`,
    ...(s.textTransform !== "none" ? { "text-transform": s.textTransform } : {}),
    ...overrides,
  };
  return Object.entries(base)
    .map(([k, v]) => `${k}:${v}`)
    .join(";");
}

export function doc(title: string, head: string, body: string) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title>${head}</head><body>${body}</body></html>`;
}

/** Split a headline into a balanced length for templates. */
export function clip(s: string, max: number) {
  if (s.length <= max) return s;
  const cut = s.slice(0, max);
  const sentence = cut.lastIndexOf(". ");
  if (sentence > max * 0.5) return cut.slice(0, sentence + 1);
  return cut.slice(0, cut.lastIndexOf(" ")).replace(/[,;:–—-]$/, "") + "…";
}

/** First sentence of a headline (Stripe-style "Headline. Supporting clause." patterns). */
export function firstSentence(s: string) {
  const m = /^(.{12,}?[.!?])\s/.exec(s);
  return m ? m[1] : s;
}

/**
 * Headline markup honoring the brand's two-tone treatment when measured:
 * the first sentence in the primary ink, the continuation in the secondary color.
 * `onDark` swaps to light-on-dark equivalents.
 */
export function headlineHtml(b: { profile: { typography: { twoTone?: { primary: string; secondary: string } } } }, text: string, onDark = false) {
  const tt = b.profile.typography.twoTone;
  const m = /^(.{8,}?[.!?])\s+(.+)$/.exec(text);
  if (!tt || !m) return esc(text);
  return `${esc(m[1])} <span style="opacity:${onDark ? 0.62 : 1};${onDark ? "" : `color:${tt.secondary}`}">${esc(m[2])}</span>`;
}

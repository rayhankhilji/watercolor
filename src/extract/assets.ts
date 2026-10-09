import path from "node:path";
import { readFile } from "node:fs/promises";
import { optimize } from "svgo";
import type { CaptureResult } from "../crawl/crawl.js";
import type { LogoAsset, LogoSet, IconSet, IconAsset, ImagerySet, ImageAsset, MediaSet, ComponentSet, ComponentSample, Hex } from "../profile/schema.js";
import { write, hash, slug, fileNameFromUrl, exists } from "../util/fs.js";
import { parseColor, composite, isNeutral, distance } from "../util/color.js";
import { imageSize } from "../util/image-size.js";
import { log } from "../util/log.js";

export function optimizeSvg(svg: string, { keepDims = true } = {}): string {
  try {
    return optimize(svg, {
      multipass: true,
      plugins: [
        {
          name: "preset-default",
          params: { overrides: { cleanupIds: false, convertShapeToPath: false, mergePaths: false, inlineStyles: false } },
        },
        ...(keepDims ? [] : [{ name: "removeDimensions" as const }]),
      ],
    }).data;
  } catch {
    return svg;
  }
}

export function svgColors(svg: string): Hex[] {
  const out: Hex[] = [];
  for (const m of svg.matchAll(/(?:fill|stroke|stop-color)\s*[:=]\s*["']?\s*(#[0-9a-f]{3,8}|rgba?\([^)]*\)|oklch\([^)]*\)|[a-z]+)/gi)) {
    const v = m[1];
    if (/^(none|currentcolor|transparent|inherit|url)$/i.test(v)) continue;
    const c = parseColor(v);
    if (c && c.alpha > 0.2 && !out.some((o) => distance(o, c.hex) < 0.01)) out.push(c.hex);
  }
  return out;
}

function svgViewBox(svg: string) {
  const vb = /viewBox=["']([^"']+)["']/i.exec(svg)?.[1];
  if (vb) {
    const [, , w, h] = vb.split(/[\s,]+/).map(Number);
    if (w > 0 && h > 0) return { w, h, vb };
  }
  const w = Number(/\swidth=["']?([\d.]+)/.exec(svg)?.[1] || 0);
  const h = Number(/\sheight=["']?([\d.]+)/.exec(svg)?.[1] || 0);
  return { w, h, vb: `0 0 ${w} ${h}` };
}

async function fetchTo(url: string, file: string): Promise<{ path: string; bytes: number; type: string } | null> {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(15_000), headers: { accept: "*/*" } });
    if (!res.ok) return null;
    const buf = new Uint8Array(await res.arrayBuffer());
    if (buf.length < 50) return null;
    await write(file, buf);
    return { path: file, bytes: buf.length, type: res.headers.get("content-type") || "" };
  } catch {
    return null;
  }
}

function formatOf(file: string): LogoAsset["format"] {
  const e = path.extname(file).slice(1).toLowerCase();
  return (["svg", "png", "jpg", "webp", "ico", "gif"].includes(e) ? (e as LogoAsset["format"]) : e === "jpeg" ? "jpg" : "other");
}

/* ------------------------------------------------------------------ logo */

export async function extractLogo(capture: CaptureResult, outDir: string, brandName: string): Promise<LogoSet> {
  const dir = path.join(outDir, "captured", "logos");
  const candidates: LogoAsset[] = [];
  const seen = new Set<string>();
  const imgByUrl = new Map([...capture.images, ...capture.svgs].map((i) => [i.url, i]));

  type Cand = { kind: string; html?: string; src?: string; score: number; reasons: string[]; rect: { w: number; h: number }; context: string; color?: string };
  for (const [pi, p] of capture.pages.entries()) {
    for (const c of p.raw.logoCandidates as Cand[]) {
      const score = c.score - (pi === 0 ? 0 : 1.5);
      if (c.kind === "svg" && c.html) {
        const svg = optimizeSvg(c.html);
        const key = hash(svg.replace(/\s+/g, ""));
        if (seen.has(key)) continue;
        seen.add(key);
        const file = path.join(dir, `${c.context}-${key}.svg`);
        await write(file, svg);
        const { w, h } = svgViewBox(svg);
        const aspect = w && h ? w / h : c.rect.w / c.rect.h;
        candidates.push({ path: file, source: p.url, format: "svg", width: Math.round(c.rect.w), height: Math.round(c.rect.h), aspect: round2(aspect), colors: svgColors(svg), type: typeFromAspect(aspect), context: c.context as LogoAsset["context"], score, reasons: c.reasons });
      } else if (c.src) {
        if (seen.has(c.src)) continue;
        seen.add(c.src);
        let file = imgByUrl.get(c.src)?.path;
        if (!file) {
          const got = await fetchTo(c.src, path.join(dir, fileNameFromUrl(c.src, ".png")));
          file = got?.path;
        }
        if (!file) continue;
        const aspect = c.rect.w / c.rect.h;
        const isSvg = file.endsWith(".svg");
        const colors = isSvg ? svgColors(await readFile(file, "utf8")) : [];
        candidates.push({ path: file, source: c.src, format: formatOf(file), width: Math.round(c.rect.w), height: Math.round(c.rect.h), aspect: round2(aspect), colors, type: typeFromAspect(aspect), context: c.context as LogoAsset["context"], score, reasons: c.reasons });
      }
    }
  }

  // ---------------- favicons, mask-icon, apple-touch, manifest icons
  const home = capture.pages[0].raw;
  const favicons: LogoAsset[] = [];
  type IconLink = { rel: string; href: string; sizes?: string; type?: string; color?: string };
  const links = (home.iconLinks as IconLink[]).filter((l) => l.href && !l.href.startsWith("data:"));
  const origin = new URL(capture.finalUrl).origin;
  if (!links.some((l) => /icon/i.test(l.rel))) links.push({ rel: "icon", href: `${origin}/favicon.ico` });
  for (const l of links) {
    try {
      if (/manifest/i.test(l.rel)) {
        const res = await fetch(l.href, { signal: AbortSignal.timeout(10_000) });
        if (!res.ok) continue;
        const man = (await res.json()) as { icons?: { src: string; sizes?: string; purpose?: string }[] };
        const icons = (man.icons || []).sort((a, b) => parseInt(b.sizes || "0") - parseInt(a.sizes || "0")).slice(0, 2);
        for (const ic of icons) {
          const u = new URL(ic.src, l.href).href;
          const got = await fetchTo(u, path.join(dir, `manifest-${slug(ic.sizes || "icon")}-${fileNameFromUrl(u, ".png")}`));
          if (got) favicons.push(await iconAsset(got.path, u, "manifest", ic.purpose === "maskable" ? ["maskable"] : []));
        }
        continue;
      }
      const ctx: LogoAsset["context"] = /mask-icon/i.test(l.rel) ? "mask-icon" : /apple-touch/i.test(l.rel) ? "apple-touch" : "favicon";
      const got = await fetchTo(l.href, path.join(dir, `${ctx}-${fileNameFromUrl(l.href, ".ico")}`));
      if (got) {
        const a = await iconAsset(got.path, l.href, ctx, l.sizes ? [`sizes ${l.sizes}`] : []);
        if (ctx === "mask-icon" && l.color) {
          const c = parseColor(l.color);
          if (c) a.colors = [c.hex];
        }
        if (!favicons.some((f) => f.path === a.path)) favicons.push(a);
      }
    } catch (e) {
      log.debug(`icon ${l.href}: ${(e as Error).message}`);
    }
  }

  // ---------------- og image
  let ogImage: string | undefined;
  const og = (home.meta as Record<string, string>)["og:image"] || (home.meta as Record<string, string>)["twitter:image"];
  if (og) {
    const u = new URL(og, capture.finalUrl).href;
    const got = await fetchTo(u, path.join(outDir, "captured", "og", fileNameFromUrl(u, ".png")));
    ogImage = got?.path;
  }

  // ---------------- brand kit files are the most authoritative logos
  const brandKit = capture.brandKit.map((b) => ({ url: b.url, path: b.extractedTo ?? b.path, kind: b.kind }));
  for (const b of capture.brandKit) {
    if (b.kind === "svg" && b.path && /logo|wordmark|mark|brand/i.test(b.url)) {
      const svg = await readFile(b.path, "utf8");
      const { w, h } = svgViewBox(svg);
      const aspect = w && h ? w / h : 3;
      candidates.push({ path: b.path, source: b.url, format: "svg", width: w, height: h, aspect: round2(aspect), colors: svgColors(svg), type: typeFromAspect(aspect), context: "brand-kit", score: 14, reasons: ["official brand kit"] });
    }
  }

  candidates.sort((a, b) => b.score - a.score || (a.format === "svg" ? -1 : 1));
  // Primary: best-scoring vector logo; prefer header over footer when scores tie.
  const primary = candidates.find((c) => c.format === "svg" && c.score >= 5) ?? candidates[0];

  // Mark: square-ish vector (mask-icon / svg favicon) else apple-touch / largest raster favicon.
  const mark =
    favicons.find((f) => f.context === "mask-icon" && f.format === "svg") ??
    favicons.find((f) => f.format === "svg") ??
    candidates.find((c) => c !== primary && c.type === "mark" && c.format === "svg" && c.score >= 4) ??
    favicons.filter((f) => f.format === "png").sort((a, b) => b.width - a.width)[0] ??
    favicons[0];

  return { primary, mark, candidates: candidates.slice(0, 16), favicons, ogImage, brandKit };
}

async function iconAsset(file: string, url: string, context: LogoAsset["context"], reasons: string[]): Promise<LogoAsset> {
  const buf = await readFile(file);
  let width = 0;
  let height = 0;
  let colors: Hex[] = [];
  if (file.endsWith(".svg") || buf.subarray(0, 200).toString().includes("<svg")) {
    const svg = buf.toString("utf8");
    const vb = svgViewBox(svg);
    width = vb.w;
    height = vb.h;
    colors = svgColors(svg);
  } else {
    const s = imageSize(buf);
    width = s?.width ?? 0;
    height = s?.height ?? 0;
  }
  return { path: file, source: url, format: formatOf(file), width, height, aspect: height ? round2(width / height) : 1, colors, type: "mark", context, score: 0, reasons };
}

function typeFromAspect(a: number): LogoAsset["type"] {
  if (a >= 2.1) return "wordmark";
  if (a <= 1.35) return "mark";
  return "lockup";
}

const round2 = (n: number) => Math.round(n * 100) / 100;

/* ------------------------------------------------------------------ icons */

const SOCIAL = /github|twitter|x\.com|linkedin|youtube|instagram|facebook|discord|tiktok|dribbble|medium|threads|bluesky|mastodon|slack|reddit/i;

export async function extractIcons(capture: CaptureResult, outDir: string): Promise<IconSet> {
  const dir = path.join(outDir, "captured", "icons");
  type RawIcon = { html: string; w: number; h: number; label: string; context: string; color: string; cls: string };
  const items: IconAsset[] = [];
  const seen = new Set<string>();
  const libs = new Map<string, number>();
  let strokeWidths = new Map<number, number>();
  const caps = new Map<string, number>();
  const joins = new Map<string, number>();
  const grids = new Map<number, number>();

  for (const p of capture.pages) {
    for (const ic of p.raw.icons as RawIcon[]) {
      const lib = detectIconLibrary(ic.cls, ic.html);
      if (lib) libs.set(lib, (libs.get(lib) || 0) + 1);
      const current = parseColor(ic.color)?.hex;
      // Normalize: the element's own text color becomes currentColor so icons re-theme.
      let svg = ic.html.replace(/\s(width|height)="[^"]*"/g, "");
      if (current) {
        svg = svg.replace(/(fill|stroke)="([^"]+)"/g, (m, attr, val) => (parseColor(val)?.hex === current ? `${attr}="currentColor"` : m));
      }
      svg = optimizeSvg(svg, { keepDims: false });
      const pathData = (svg.match(/\sd="[^"]+"/g) || []).join("");
      const key = hash(pathData || svg);
      if (seen.has(key)) continue;
      seen.add(key);
      const vb = svgViewBox(svg);
      const strokes = (svg.match(/stroke="(?!none)[^"]+"/g) || []).length;
      const fills = (svg.match(/fill="(?!none)[^"]+"/g) || []).length;
      const style: IconAsset["style"] = strokes && fills ? (strokes > fills * 2 ? "stroke" : fills > strokes * 2 ? "fill" : "mixed") : strokes ? "stroke" : "fill";
      const sw = Number(/stroke-width="([\d.]+)/.exec(svg)?.[1] || 0);
      if (style === "stroke" && sw) strokeWidths.set(sw, (strokeWidths.get(sw) || 0) + 1);
      const cap = /stroke-linecap="(\w+)"/.exec(svg)?.[1];
      if (cap) caps.set(cap, (caps.get(cap) || 0) + 1);
      const join = /stroke-linejoin="(\w+)"/.exec(svg)?.[1];
      if (join) joins.set(join, (joins.get(join) || 0) + 1);
      if (vb.w === vb.h && vb.w) grids.set(vb.w, (grids.get(vb.w) || 0) + 1);
      const label = ic.label || "";
      const name = slug(label || `icon-${key}`, 32);
      const file = path.join(dir, SOCIAL.test(label) ? "social" : "", `${name}-${key.slice(0, 4)}.svg`);
      await write(file, svg);
      items.push({ path: file, hash: key, viewBox: vb.vb, size: Math.round(Math.max(ic.w, ic.h)), style, strokeWidth: sw || undefined, context: ic.context, label: label || undefined });
      if (items.length >= 160) break;
    }
  }
  const top = <T,>(m: Map<T, number>) => [...m.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
  const brandIcons = items.filter((i) => !SOCIAL.test(i.label || ""));
  const counts = { stroke: 0, fill: 0, mixed: 0, duotone: 0 };
  brandIcons.forEach((i) => counts[i.style]++);
  const dominant: IconSet["style"]["dominant"] = !brandIcons.length ? "none" : counts.stroke > counts.fill * 1.5 ? "stroke" : counts.fill > counts.stroke * 1.5 ? "fill" : "mixed";
  const linecap = top(caps);
  return {
    items,
    library: top(libs),
    style: { dominant, strokeWidth: top(strokeWidths), linecap, linejoin: top(joins), grid: top(grids), cornerStyle: linecap === "round" || top(joins) === "round" ? "rounded" : linecap ? "sharp" : undefined },
  };
}

function detectIconLibrary(cls: string, html: string): string | undefined {
  const c = (cls || "").toLowerCase();
  if (/lucide/.test(c)) return "Lucide";
  if (/heroicon/.test(c)) return "Heroicons";
  if (/\bph\b|phosphor/.test(c)) return "Phosphor";
  if (/tabler/.test(c)) return "Tabler";
  if (/feather/.test(c)) return "Feather";
  if (/material|mui/.test(c)) return "Material";
  if (/\bfa-|fontawesome|svg-inline--fa/.test(c)) return "Font Awesome";
  if (/\bbi-|bootstrap/.test(c)) return "Bootstrap Icons";
  if (/remix|\bri-/.test(c)) return "Remix Icon";
  if (/iconoir/.test(c)) return "Iconoir";
  if (/viewBox="0 0 15 15"/.test(html)) return "Radix Icons";
  if (/viewBox="0 0 256 256"/.test(html)) return "Phosphor";
  return undefined;
}

/* ------------------------------------------------------------------ imagery */

export async function extractImagery(capture: CaptureResult, outDir: string): Promise<ImagerySet> {
  type RawImg = { src: string; alt: string; natural: { w: number; h: number }; display: { w: number; h: number }; context: string };
  const byUrl = new Map([...capture.images, ...capture.svgs, ...capture.gifs].map((i) => [i.url, i]));
  const images: ImageAsset[] = [];
  const customerLogos: ImagerySet["customerLogos"] = [];
  const seen = new Set<string>();
  for (const p of capture.pages) {
    for (const im of p.raw.images as RawImg[]) {
      if (seen.has(im.src)) continue;
      seen.add(im.src);
      const file = byUrl.get(im.src)?.path;
      const format = file ? path.extname(file).slice(1) : path.extname(new URL(im.src, p.url).pathname).slice(1) || "img";
      if (im.context === "logo-wall") {
        const name = cleanLogoName(im.alt) || cleanLogoName(path.basename(new URL(im.src, p.url).pathname).replace(/\.[^.]+$/, ""));
        if (name && !customerLogos.some((c) => c.name.toLowerCase() === name.toLowerCase())) customerLogos.push({ name, url: im.src, path: file });
        continue;
      }
      const kind = classifyImage(im, format);
      images.push({ path: file, url: im.src, width: im.natural.w, height: im.natural.h, displayWidth: im.display.w, displayHeight: im.display.h, alt: im.alt, kind, format, context: im.context });
    }
    // Inline-SVG logo walls
    type WallSvg = { html: string; label: string; w: number; h: number };
    for (const w of (p.raw.wallSvgs ?? []) as WallSvg[]) {
      const svg = optimizeSvg(w.html);
      const key = hash(svg);
      if (seen.has(key)) continue;
      seen.add(key);
      const name = cleanLogoName(w.label) || `logo-${key.slice(0, 6)}`;
      const file = path.join(outDir, "captured", "customer-logos", `${slug(name)}.svg`);
      await write(file, svg);
      if (!customerLogos.some((c) => c.name.toLowerCase() === name.toLowerCase())) customerLogos.push({ name, url: "inline-svg", path: file });
    }
  }
  // Bring raster customer logos into their own folder for convenience.
  for (const c of customerLogos) {
    if (c.path && !c.path.includes("customer-logos") && (await exists(c.path))) {
      const dest = path.join(outDir, "captured", "customer-logos", `${slug(c.name)}${path.extname(c.path)}`);
      await write(dest, await readFile(c.path));
      c.path = dest;
    }
  }
  images.sort((a, b) => b.displayWidth * b.displayHeight - a.displayWidth * a.displayHeight);
  const summary = { photo: 0, illustration: 0, screenshot: 0, other: 0 };
  for (const i of images) {
    if (i.kind === "photo") summary.photo++;
    else if (i.kind === "illustration") summary.illustration++;
    else if (i.kind === "screenshot") summary.screenshot++;
    else summary.other++;
  }
  return { images: images.slice(0, 80), customerLogos: customerLogos.slice(0, 60), summary };
}

function cleanLogoName(s: string) {
  return (s || "")
    .replace(/\b(logo|logotype|wordmark|icon|image|customer|brand|svg|png|white|black|dark|light|color|colour|mono)\b/gi, "")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^\w/, (c) => c.toUpperCase());
}

function classifyImage(im: { alt: string; natural: { w: number; h: number }; display: { w: number; h: number }; context: string; src: string }, format: string): ImageAsset["kind"] {
  const alt = (im.alt + " " + im.src).toLowerCase();
  const { w, h } = im.display;
  if (/logo/.test(alt) && h < 120) return "logo";
  if (w <= 72 && h <= 72 && Math.abs(w - h) < 6) return /avatar|headshot|portrait|profile|team|ceo|founder/.test(alt) ? "avatar" : "icon";
  if (/avatar|headshot|portrait|profile/.test(alt) && w < 200) return "avatar";
  if (/screenshot|dashboard|ui|app|interface|product|editor|terminal|demo/.test(alt)) return "screenshot";
  if (format === "svg") return "illustration";
  if (/illustration|graphic|art|3d|render/.test(alt)) return "illustration";
  if (format === "png" && w > 400) return "screenshot";
  if (/jpe?g/.test(format) || (format === "webp" && w > 300) || format === "avif") return "photo";
  return "unknown";
}

/* ------------------------------------------------------------------ media */

export function extractMedia(capture: CaptureResult): MediaSet {
  type RawVideo = { srcs: string[]; poster?: string; w: number; h: number; autoplay: boolean; loop: boolean; context: string };
  const domVideos = capture.pages.flatMap((p) => p.raw.videos as RawVideo[]);
  const videos: MediaSet["videos"] = [];
  for (const v of capture.videos) {
    const dom = domVideos.find((d) => d.srcs.includes(v.url));
    videos.push({ path: v.path, url: v.url, poster: v.poster, width: dom?.w ?? 0, height: dom?.h ?? 0, context: dom?.context ?? "network", autoplay: dom?.autoplay ?? false, loop: dom?.loop ?? false });
  }
  for (const d of domVideos) {
    if (videos.some((v) => d.srcs.includes(v.url))) continue;
    videos.push({ url: d.srcs[0], poster: d.poster, width: d.w, height: d.h, context: d.context, autoplay: d.autoplay, loop: d.loop });
  }
  return {
    videos: videos.slice(0, 20),
    gifs: capture.gifs.map((g) => ({ path: g.path, url: g.url, width: g.width ?? 0, height: g.height ?? 0 })),
    lotties: capture.lotties.map((l) => ({
      path: l.path,
      url: l.url,
      width: l.width ?? 0,
      height: l.height ?? 0,
      frames: Number(l.meta?.op ?? 0) - Number(l.meta?.ip ?? 0),
      fps: Number(l.meta?.fr ?? 0),
      name: l.meta?.nm as string | undefined,
    })),
    rive: capture.rive.map((r) => ({ path: r.path, url: r.url })),
    shaders: capture.shaders.map((s) => ({
      path: s.path,
      type: s.type as "vertex" | "fragment" | "unknown",
      length: s.source.length,
      uniforms: [...new Set([...s.source.matchAll(/uniform\s+\w+\s+(\w+)/g)].map((m) => m[1]))].filter((u) => !/^(modelMatrix|modelViewMatrix|projectionMatrix|viewMatrix|normalMatrix|cameraPosition|isOrthographic)$/.test(u)).slice(0, 24),
      page: s.page,
    })),
    canvases: capture.canvasRecordings.map((c) => ({ kind: c.ctx, width: c.w, height: c.h, recording: c.mp4, gif: c.gif, poster: c.poster || undefined, page: c.page, cssVariables: c.cssVars })),
    recordings: capture.recordings.map((r) => ({ path: r.path, kind: r.kind, page: r.page })),
  };
}

/* ------------------------------------------------------------------ components */

const COMPONENT_KEYS = ["background-color", "color", "border-top-left-radius", "border-top-width", "border-top-color", "font-size", "font-weight", "padding-top", "padding-left"];

export function extractComponents(capture: CaptureResult, pageBg: Hex, primary: Hex): ComponentSet {
  type Raw = { id: string; text: string; tag: string; rect: { y: number; w: number; h: number }; styles: Record<string, string> };
  const home = capture.pages[0].raw;
  const shots = new Map(capture.componentShots.map((s) => [s.id, s.path]));
  const hovers = new Map(capture.hovers.map((h) => [h.id, h]));

  const group = (list: Raw[], kind: ComponentSample["kind"], variantOf: (r: Raw) => string, limit: number): ComponentSample[] => {
    const map = new Map<string, { sample: Raw; count: number; variant: string }>();
    for (const r of list) {
      const key = COMPONENT_KEYS.map((k) => r.styles[k]).join("|");
      const e = map.get(key);
      if (e) {
        e.count++;
        if (shots.has(r.id) && !shots.has(e.sample.id)) e.sample = r;
      } else map.set(key, { sample: r, count: 1, variant: variantOf(r) });
    }
    const out: ComponentSample[] = [];
    const usedVariants = new Map<string, number>();
    for (const e of [...map.values()].sort((a, b) => b.count - a.count || a.sample.rect.y - b.sample.rect.y)) {
      const n = usedVariants.get(e.variant) || 0;
      usedVariants.set(e.variant, n + 1);
      const h = hovers.get(e.sample.id);
      out.push({
        kind,
        variant: n ? `${e.variant}-${n + 1}` : e.variant,
        text: e.sample.text.slice(0, 80),
        styles: compactStyles(e.sample.styles),
        hover: h ? diffStyles(h.before, h.after) : undefined,
        screenshot: shots.get(e.sample.id),
        count: e.count,
      });
      if (out.length >= limit) break;
    }
    return out;
  };

  const buttonVariant = (r: Raw) => {
    const bg = parseColor(r.styles["background-color"]);
    const bw = parseFloat(r.styles["border-top-width"] || "0");
    if (!bg || bg.alpha < 0.1) return bw > 0 ? "secondary" : "ghost";
    const hex = composite(bg, pageBg);
    if (distance(hex, primary) < 0.03) return "primary";
    if (distance(hex, pageBg) < 0.03) return bw > 0 ? "secondary" : "ghost";
    if (!isNeutral(hex)) return "accent";
    return "neutral";
  };
  const all = <K extends string>(k: K) => capture.pages.flatMap((p, i) => (p.raw[k as keyof typeof p.raw] as Raw[]).map((r) => ({ ...r, rect: { ...r.rect, y: r.rect.y + i * 100000 } })));
  const buttons = group(all("buttons"), "button", buttonVariant, 8);
  // Make sure a "primary" exists and is first.
  buttons.sort((a, b) => (a.variant === "primary" ? -1 : b.variant === "primary" ? 1 : 0));

  const navShot = capture.componentShots.find((s) => s.kind === "nav");
  const footShot = capture.componentShots.find((s) => s.kind === "footer");
  return {
    buttons,
    inputs: group(all("inputs"), "input", () => "default", 3),
    cards: group(all("cards"), "card", (r) => (parseFloat(r.styles["border-top-width"] || "0") > 0 ? "outlined" : r.styles["box-shadow"] !== "none" ? "elevated" : "filled"), 4),
    badges: group(all("badges"), "badge", () => "default", 4),
    links: [],
    nav: navShot ? { kind: "nav", variant: "default", text: (home.nav as string[]).slice(0, 8).join(" · "), styles: {}, screenshot: navShot.path, count: 1 } : undefined,
    footer: footShot ? { kind: "footer", variant: "default", text: "", styles: {}, screenshot: footShot.path, count: 1 } : undefined,
  };
}

function compactStyles(s: Record<string, string>) {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(s)) {
    if (!v || v === "none" || v === "normal" || v === "auto" || v === "0px" || v === "rgba(0, 0, 0, 0)" || v === "all") continue;
    if (k === "transition" && v.startsWith("all 0s")) continue;
    out[k] = v;
  }
  return out;
}

function diffStyles(a: Record<string, string>, b: Record<string, string>) {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(b)) if (v && a[k] !== v) out[k] = v;
  return Object.keys(out).length ? out : undefined;
}

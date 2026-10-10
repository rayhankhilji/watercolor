import path from "node:path";
import { readFile, copyFile } from "node:fs/promises";
import type { ResolvedBrand } from "../../profile/resolve.js";
import type { Hex } from "../../profile/schema.js";
import type { Renderer } from "../../render/renderer.js";
import { write, writeJson, ensureDir } from "../../util/fs.js";
import { isDark, readableOn, distance, mix } from "../../util/color.js";
import { optimizeSvg } from "../../extract/assets.js";
import { esc, fontFaces } from "../html.js";
import { log } from "../../util/log.js";

/** Replace every paint in an SVG with a single color (keeps `none` and masks intact). */
export function recolorSvg(svg: string, color: Hex): string {
  let out = svg
    .replace(/(fill|stroke|stop-color)="(?!none|url|transparent)[^"]*"/gi, `$1="${color}"`)
    .replace(/(fill|stroke|stop-color)\s*:\s*(?!none|url|transparent)[^;"]+/gi, `$1:${color}`);
  // Shapes without an explicit fill default to black — set it on the root.
  out = out.replace(/<svg\b([^>]*)>/i, (m, attrs: string) => (/\sfill=/.test(attrs) ? m.replace(/\sfill="[^"]*"/, ` fill="${color}"`) : `<svg${attrs} fill="${color}">`));
  return out;
}

export function svgSize(svg: string) {
  const vb = /viewBox=["']([^"']+)["']/i.exec(svg)?.[1]?.split(/[\s,]+/).map(Number);
  if (vb && vb[2] > 0) return { w: vb[2], h: vb[3] };
  return { w: Number(/\swidth=["']?([\d.]+)/.exec(svg)?.[1] || 100), h: Number(/\sheight=["']?([\d.]+)/.exec(svg)?.[1] || 100) };
}

/** Make an SVG scale to its container (drop fixed width/height, keep viewBox). */
export function fluidSvg(svg: string, extra = "") {
  return svg.replace(/<svg\b([^>]*)>/i, (_m, attrs: string) => `<svg${attrs.replace(/\s(width|height)="[^"]*"/g, "")} preserveAspectRatio="xMidYMid meet" ${extra}>`);
}

export interface LogoMarkupOpts {
  on: Hex;
  height: number;
  variant?: "primary" | "mark";
  color?: Hex;
}

/** HTML for the logo that reads on a given background, at a given height. */
export function logoMarkup(b: ResolvedBrand, o: LogoMarkupOpts): string {
  const wantMark = o.variant === "mark";
  let svg = wantMark ? b.logo.markSvg ?? b.logo.primarySvg : b.logo.primarySvg;
  const file = wantMark ? b.logo.mark ?? b.logo.primary : b.logo.primary;
  if (svg) {
    const colors = (wantMark ? b.profile.logo.mark?.colors : b.profile.logo.primary?.colors) ?? [];
    const lowContrast = colors.length > 0 && colors.every((c) => distance(c, o.on) < 0.22);
    if (o.color) svg = recolorSvg(svg, o.color);
    else if (lowContrast) svg = recolorSvg(svg, readableOn(o.on, [b.roles.foreground, b.roles.background, "#ffffff", "#0a0a0a"]));
    const { w, h } = svgSize(svg);
    const width = Math.round((w / h) * o.height);
    return `<span class="wc-logo" style="display:inline-block;height:${o.height}px;width:${width}px;line-height:0">${fluidSvg(svg, 'style="width:100%;height:100%"')}</span>`;
  }
  if (file) {
    const filter = o.color ? (isDark(o.color) ? "brightness(0)" : "brightness(0) invert(1)") : "";
    return `<img class="wc-logo" src="${fileUrl(file)}" style="height:${o.height}px;width:auto;${filter ? `filter:${filter}` : ""}" alt="${esc(b.name)}">`;
  }
  // No logo at all: typeset the name in the display face.
  return `<span class="wc-logo" style="font-family:var(--font-display);font-weight:${Math.max(600, b.type.h1.weight)};font-size:${Math.round(o.height * 0.9)}px;letter-spacing:-0.02em;color:${o.color ?? readableOn(o.on, [b.roles.foreground, "#ffffff"])};line-height:1">${esc(b.name)}</span>`;
}

function fileUrl(p: string) {
  return "file://" + p.split(path.sep).map(encodeURIComponent).join("/");
}

/**
 * If the primary logo is a lockup (symbol + wordmark) split out the symbol by measuring
 * the rendered geometry: shapes are clustered by horizontal gaps; a squarish leading
 * cluster separated by a clear gap is the mark.
 */
export async function splitMark(r: Renderer, svg: string): Promise<string | null> {
  const html = `<!doctype html><html><body style="margin:0">${fluidSvg(svg, 'id="logo" style="width:1200px;height:auto;display:block"')}</body></html>`;
  try {
    const res = await r.withPage(html, { width: 1300, height: 900, name: "split-mark" }, (page) =>
      page.evaluate(() => {
        const root = document.getElementById("logo") as unknown as SVGSVGElement;
        const rr = root.getBoundingClientRect();
        const shapes = Array.from(root.querySelectorAll("path,circle,rect,ellipse,polygon,polyline,line,text,use,image"))
          .filter((el) => !el.closest("defs,clipPath,mask,symbol,linearGradient,radialGradient,pattern"));
        const boxes = shapes.map((el, i) => {
          const b = el.getBoundingClientRect();
          return { i, x0: b.left - rr.left, x1: b.right - rr.left, y0: b.top - rr.top, y1: b.bottom - rr.top };
        }).filter((b) => b.x1 - b.x0 > 0.5 && b.x1 - b.x0 < rr.width * 0.98);
        if (boxes.length < 2) return null;
        boxes.sort((a, b) => a.x0 - b.x0);
        const clusters: { x0: number; x1: number; y0: number; y1: number; ids: number[] }[] = [];
        const gapMin = rr.width * 0.025;
        for (const b of boxes) {
          const c = clusters[clusters.length - 1];
          if (c && b.x0 <= c.x1 + gapMin) {
            c.x1 = Math.max(c.x1, b.x1);
            c.y0 = Math.min(c.y0, b.y0);
            c.y1 = Math.max(c.y1, b.y1);
            c.ids.push(b.i);
          } else clusters.push({ ...b, ids: [b.i] });
        }
        if (clusters.length < 2) return null;
        const first = clusters[0];
        const fw = first.x1 - first.x0;
        const fh = first.y1 - first.y0;
        const aspect = fw / fh;
        const rest = clusters.slice(1).reduce((a, c) => a + (c.x1 - c.x0), 0);
        const gap = clusters[1].x0 - first.x1;
        const fullH = Math.max(...clusters.map((c) => c.y1)) - Math.min(...clusters.map((c) => c.y0));
        if (aspect < 0.55 || aspect > 1.8 || rest < fw * 1.2 || gap < rr.width * 0.03 || fh < fullH * 0.6) return null;
        const vb = root.viewBox.baseVal;
        const k = vb && vb.width ? vb.width / rr.width : 1;
        const pad = Math.max(fw, fh) * 0.02;
        return { ids: first.ids, total: shapes.length, viewBox: [vb.x + (first.x0 - pad) * k, vb.y + (first.y0 - pad) * k, (fw + pad * 2) * k, (fh + pad * 2) * k] };
      }),
    );
    if (!res) return null;
    // Rebuild: keep only the mark's shapes.
    let idx = -1;
    const keep = new Set(res.ids);
    const outside = /<(defs|clipPath|mask|symbol|linearGradient|radialGradient|pattern)\b[\s\S]*?<\/\1>/gi;
    const preserved: string[] = [];
    let body = svg.replace(outside, (m) => {
      preserved.push(m);
      return `\u0000${preserved.length - 1}\u0000`;
    });
    body = body.replace(/<(path|circle|rect|ellipse|polygon|polyline|line|text|use|image)\b[^>]*?(\/>|>[\s\S]*?<\/\1>)/gi, (m) => {
      idx++;
      return keep.has(idx) ? m : "";
    });
    body = body.replace(/\u0000(\d+)\u0000/g, (_m, i) => preserved[Number(i)]);
    const [x, y, w, h] = res.viewBox.map((n: number) => +n.toFixed(2));
    body = body.replace(/<svg\b([^>]*)>/i, (_m, attrs: string) => `<svg${attrs.replace(/\s(viewBox|width|height)="[^"]*"/gi, "")} viewBox="${x} ${y} ${w} ${h}" width="${Math.round(w)}" height="${Math.round(h)}">`);
    return optimizeSvg(body);
  } catch (e) {
    log.debug(`splitMark: ${(e as Error).message}`);
    return null;
  }
}

/** A typographic monogram when the brand has no symbol of its own (clearly labelled as derived). */
export function monogramSvg(b: ResolvedBrand, size = 512): string {
  const letter = (b.name.match(/[A-Za-z0-9]/)?.[0] ?? "W").toUpperCase();
  const bg = b.monochrome ? b.roles.foreground : b.roles.primary;
  const fg = readableOn(bg, [b.roles.background, "#ffffff", "#0a0a0a"]);
  const r = Math.min(size * 0.5, (parseFloat(b.radius.button) || 12) * (size / 48));
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}"><rect width="${size}" height="${size}" rx="${Math.min(r, size * 0.24)}" fill="${bg}"/><text x="50%" y="50%" dominant-baseline="central" text-anchor="middle" font-family="${esc(b.fonts.display.family)}, ${esc(b.fonts.display.alternatives[0] ?? "system-ui")}, sans-serif" font-weight="${Math.max(600, b.type.h1.weight)}" font-size="${size * 0.56}" fill="${fg}" letter-spacing="-0.02em">${esc(letter)}</text></svg>`;
}

/* ------------------------------------------------------------------ ICO */

function ico(pngs: { size: number; data: Buffer }[]): Buffer {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(pngs.length, 4);
  const entries: Buffer[] = [];
  let offset = 6 + pngs.length * 16;
  for (const p of pngs) {
    const e = Buffer.alloc(16);
    e.writeUInt8(p.size >= 256 ? 0 : p.size, 0);
    e.writeUInt8(p.size >= 256 ? 0 : p.size, 1);
    e.writeUInt8(0, 2);
    e.writeUInt8(0, 3);
    e.writeUInt16LE(1, 4);
    e.writeUInt16LE(32, 6);
    e.writeUInt32LE(p.data.length, 8);
    e.writeUInt32LE(offset, 12);
    offset += p.data.length;
    entries.push(e);
  }
  return Buffer.concat([header, ...entries, ...pngs.map((p) => p.data)]);
}

/* ------------------------------------------------------------------ kit */

export interface LogoKit {
  files: string[];
  primarySvg?: string;
  markSvg?: string;
  markIsDerived: boolean;
  markSource: "captured" | "split" | "favicon" | "monogram";
}

export async function buildLogoKit(b: ResolvedBrand, r: Renderer, outDir: string): Promise<LogoKit> {
  const dir = path.join(outDir, "logo");
  const files: string[] = [];
  const fg = b.roles.foreground;
  let primarySvg = b.logo.primarySvg ? optimizeSvg(b.logo.primarySvg) : undefined;

  // ---------------- primary logo
  if (primarySvg) {
    const { w, h } = svgSize(primarySvg);
    files.push(await write(path.join(dir, "svg", "logo.svg"), primarySvg));
    files.push(await write(path.join(dir, "svg", "logo-black.svg"), recolorSvg(primarySvg, "#000000")));
    files.push(await write(path.join(dir, "svg", "logo-white.svg"), recolorSvg(primarySvg, "#ffffff")));
    files.push(await write(path.join(dir, "svg", "logo-ink.svg"), recolorSvg(primarySvg, fg)));
    if (!b.monochrome) files.push(await write(path.join(dir, "svg", "logo-primary.svg"), recolorSvg(primarySvg, b.roles.primary)));
    for (const width of [512, 1024, 2048]) {
      const height = Math.round((h / w) * width);
      files.push(await r.svgToPng(primarySvg, path.join(dir, "png", `logo-${width}.png`), width, height));
      files.push(await r.svgToPng(recolorSvg(primarySvg, "#ffffff"), path.join(dir, "png", `logo-white-${width}.png`), width, height));
      files.push(await r.svgToPng(recolorSvg(primarySvg, "#000000"), path.join(dir, "png", `logo-black-${width}.png`), width, height));
    }
  } else if (b.logo.primary) {
    const ext = path.extname(b.logo.primary);
    const dest = path.join(dir, "png", `logo-original${ext}`);
    await ensureDir(path.dirname(dest));
    await copyFile(b.logo.primary, dest);
    files.push(dest);
  }

  // ---------------- mark
  let markSvg: string | undefined;
  let markSource: LogoKit["markSource"] = "captured";
  if (primarySvg && b.profile.logo.primary?.type !== "mark") {
    const split = await splitMark(r, primarySvg);
    if (split) {
      markSvg = split;
      markSource = "split";
    }
  }
  if (!markSvg && b.logo.markSvg) {
    markSvg = optimizeSvg(b.logo.markSvg);
    markSource = "favicon";
  }
  if (!markSvg && primarySvg && b.profile.logo.primary?.type === "mark") {
    markSvg = primarySvg;
    markSource = "captured";
  }
  let markIsDerived = false;
  if (!markSvg && !b.logo.mark) {
    markSvg = monogramSvg(b);
    markSource = "monogram";
    markIsDerived = true;
  }

  if (markSvg) {
    files.push(await write(path.join(dir, "svg", "mark.svg"), markSvg));
    files.push(await write(path.join(dir, "svg", "mark-black.svg"), recolorSvg(markSvg, "#000000")));
    files.push(await write(path.join(dir, "svg", "mark-white.svg"), recolorSvg(markSvg, "#ffffff")));
    for (const s of [256, 512, 1024]) files.push(await r.svgToPng(markSvg, path.join(dir, "png", `mark-${s}.png`), s, s));
  }

  // ---------------- favicons & app icons
  const fav = path.join(dir, "favicon");
  const iconSvgOnBg = (bg: Hex, pad: number, radius: number, size: number) => {
    const inner = markSvg ? recolorIfNeeded(markSvg, bg, b) : undefined;
    const body = inner ? fluidSvg(inner, 'style="width:100%;height:100%"') : "";
    return `<!doctype html><html><head><style>html,body{margin:0;width:${size}px;height:${size}px;background:transparent}
      .i{width:${size}px;height:${size}px;border-radius:${radius}px;background:${bg};display:grid;place-items:center;box-sizing:border-box;padding:${pad}px;overflow:hidden}
      .i svg{display:block}</style></head><body><div class="i">${body}</div></body></html>`;
  };
  const markBg = b.monochrome ? b.roles.foreground : b.roles.primary;
  const capturedFavSvg = b.profile.logo.favicons.find((f) => f.format === "svg");
  if (capturedFavSvg) {
    const src = path.join(outDir, capturedFavSvg.path);
    files.push(await write(path.join(fav, "favicon.svg"), await readFile(src, "utf8")));
  } else if (markSvg) {
    files.push(await write(path.join(fav, "favicon.svg"), markSvg));
  }
  if (markSvg) {
    const pngs: { size: number; data: Buffer }[] = [];
    for (const s of [16, 32, 48]) {
      const p = path.join(fav, `favicon-${s}.png`);
      const transparentOk = !markIsDerived;
      if (transparentOk) await r.svgToPng(markSvg, p, s, s, "transparent", Math.round(s * 0.04));
      else await r.png(iconSvgOnBg(markBg, Math.round(s * 0.1), Math.round(s * 0.2), s), p, { width: s, height: s, transparent: true });
      files.push(p);
      pngs.push({ size: s, data: await readFile(p) });
    }
    files.push(await write(path.join(fav, "favicon.ico"), ico(pngs)));
    files.push(await r.png(iconSvgOnBg(markBg, 36, 0, 180), path.join(fav, "apple-touch-icon.png"), { width: 180, height: 180 }));
    files.push(await r.png(iconSvgOnBg(markBg, 38, 0, 192), path.join(fav, "icon-192.png"), { width: 192, height: 192 }));
    files.push(await r.png(iconSvgOnBg(markBg, 100, 0, 512), path.join(fav, "icon-512.png"), { width: 512, height: 512 }));
    files.push(await r.png(iconSvgOnBg(markBg, 150, 0, 512), path.join(fav, "icon-maskable-512.png"), { width: 512, height: 512 }));
    // App store icons
    files.push(await r.png(iconSvgOnBg(markBg, 230, 0, 1024), path.join(dir, "app-icon", "ios-1024.png"), { width: 1024, height: 1024 }));
    const mac = `<!doctype html><html><head><style>html,body{margin:0;width:1024px;height:1024px;background:transparent;display:grid;place-items:center}
      .i{width:824px;height:824px;border-radius:185px;background:linear-gradient(180deg,${mix(markBg, "#ffffff", 0.08)},${markBg});box-shadow:0 10px 28px rgba(0,0,0,.28),0 2px 4px rgba(0,0,0,.18);display:grid;place-items:center;box-sizing:border-box;padding:190px}</style></head>
      <body><div class="i">${markSvg ? fluidSvg(recolorIfNeeded(markSvg, markBg, b), 'style="width:100%;height:100%"') : ""}</div></body></html>`;
    files.push(await r.png(mac, path.join(dir, "app-icon", "macos-1024.png"), { width: 1024, height: 1024, transparent: true }));
    files.push(await r.png(iconSvgOnBg(markBg, 0, 0, 432).replace(/background:[^;]+;/, "background:transparent;").replace("padding:0px", "padding:132px"), path.join(dir, "app-icon", "android-foreground-432.png"), { width: 432, height: 432, transparent: true }));
  }
  const manifest = {
    name: b.name,
    short_name: b.name.length > 12 ? b.name.split(/\s/)[0] : b.name,
    icons: [
      { src: "icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    theme_color: b.profile.identity.themeColor ?? b.roles.background,
    background_color: b.roles.background,
    display: "standalone",
  };
  files.push(await writeJson(path.join(fav, "site.webmanifest"), manifest));
  files.push(
    await write(
      path.join(fav, "head.html"),
      `<!-- ${b.name} favicons — generated by watercolor -->\n<link rel="icon" href="/favicon.ico" sizes="48x48">\n<link rel="icon" href="/favicon.svg" type="image/svg+xml">\n<link rel="apple-touch-icon" href="/apple-touch-icon.png">\n<link rel="manifest" href="/site.webmanifest">\n<meta name="theme-color" content="${manifest.theme_color}">\n`,
    ),
  );

  // ---------------- logo-on-background compositions
  const comps: [string, Hex | string][] = [
    ["light", b.scheme === "light" ? b.roles.background : "#ffffff"],
    ["dark", b.scheme === "dark" ? b.roles.background : b.roles.inverseBackground],
    ...(!b.monochrome ? ([["primary", b.roles.primary]] as [string, Hex][]) : []),
    ["gradient", `linear-gradient(120deg, ${b.gradient.join(", ")})`],
  ];
  for (const [name, bg] of comps) {
    const solid = bg.startsWith("#") ? (bg as Hex) : b.gradient[Math.floor(b.gradient.length / 2)];
    const color = name === "gradient" ? "#ffffff" : undefined;
    const html = `<!doctype html><html><head><style>${fontFaces(b)}html,body{margin:0;width:1600px;height:900px;background:${bg};display:grid;place-items:center}</style></head><body>${logoMarkup(b, { on: solid, height: 120, color: color as Hex | undefined })}</body></html>`;
    files.push(await r.png(html, path.join(dir, "lockups", `logo-on-${name}.png`), { width: 1600, height: 900 }));
  }
  return { files, primarySvg, markSvg, markIsDerived, markSource };
}

function recolorIfNeeded(svg: string, bg: Hex, b: ResolvedBrand) {
  // On a colored tile, a single-color mark reads best in the tile's readable foreground.
  const cols = [...svg.matchAll(/(?:fill|stroke)="(#[0-9a-f]{3,8})"/gi)].map((m) => m[1].toLowerCase());
  const uniq = [...new Set(cols)];
  if (uniq.length <= 1 || uniq.every((c) => distance(c.length === 4 ? "#" + c.slice(1).replace(/./g, "$&$&") : c, bg) < 0.25)) return recolorSvg(svg, readableOn(bg, [b.roles.background, "#ffffff", "#0a0a0a"]));
  return svg;
}

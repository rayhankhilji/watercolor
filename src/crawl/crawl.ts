import { chromium, type Browser, type BrowserContext, type Page, type Response } from "playwright";
import path from "node:path";
import { mkdtemp, readdir, rename, rm, copyFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { spawnSync } from "node:child_process";
import { collectPage, INIT_SCRIPT, type RawPage } from "./page-script.js";
import { discoverPages, sameSite, type DiscoveredPage } from "./discover.js";
import { ensureDir, write, fileNameFromUrl, hash, slug, exists } from "../util/fs.js";
import { imageSize } from "../util/image-size.js";
import { encodeFrames, transcode, downloadStream, extractFrame } from "../render/ffmpeg.js";
import { log } from "../util/log.js";
import type { PageKind } from "../profile/schema.js";

export interface CaptureOptions {
  url: string;
  outDir: string;
  maxPages?: number;
  headed?: boolean;
  recordScroll?: boolean;
  mobile?: boolean;
  canvas?: boolean;
  videos?: boolean;
  maxVideoMB?: number;
  timeoutMs?: number;
  userAgent?: string;
  /** Extra same-site URLs to include in the crawl. */
  include?: string[];
}

export interface CapturedPage {
  url: string;
  kind: PageKind;
  raw: RawPage;
  screenshot?: string;
  fullPage?: string;
}

export interface NetworkFile {
  url: string;
  path: string;
  type: string;
  bytes: number;
  width?: number;
  height?: number;
  meta?: Record<string, unknown>;
}

export interface CaptureResult {
  url: string;
  finalUrl: string;
  capturedAt: string;
  pages: CapturedPage[];
  mobile?: { screenshot: string; fullPage?: string };
  shaders: { type: string; source: string; page: string; path: string }[];
  css: { url: string; path: string; bytes: number }[];
  fonts: NetworkFile[];
  svgs: NetworkFile[];
  gifs: NetworkFile[];
  images: NetworkFile[];
  lotties: NetworkFile[];
  rive: NetworkFile[];
  videoUrls: string[];
  videos: { url: string; path: string; poster?: string; gif?: string }[];
  canvasRecordings: { page: string; id: string; mp4?: string; gif?: string; poster: string; frames: number; fps: number; colors: { hex: string; weight: number }[]; ctx: string; w: number; h: number; cssVars: Record<string, string> }[];
  hovers: { id: string; text: string; before: Record<string, string>; after: Record<string, string>; shotBefore?: string; shotAfter?: string }[];
  componentShots: { kind: string; id: string; path: string }[];
  recordings: { path: string; gif?: string; kind: "scroll" | "mobile-scroll"; page: string }[];
  brandKit: { url: string; path?: string; kind: string; extractedTo?: string }[];
  errors: string[];
}

const HOVER_PROPS = ["background-color", "background-image", "color", "border-top-color", "box-shadow", "transform", "opacity", "text-decoration-line", "filter"];

export async function capture(opts: CaptureOptions): Promise<CaptureResult> {
  const out = opts.outDir;
  const cap = path.join(out, "captured");
  const dirs = {
    fonts: path.join(cap, "fonts"),
    css: path.join(out, ".watercolor", "css"),
    svgs: path.join(cap, "svgs"),
    gifs: path.join(cap, "gifs"),
    images: path.join(cap, "images"),
    lottie: path.join(cap, "lottie"),
    rive: path.join(cap, "rive"),
    shaders: path.join(cap, "shaders"),
    shots: path.join(cap, "screenshots"),
    components: path.join(cap, "components"),
    canvas: path.join(cap, "canvas"),
    videos: path.join(cap, "videos"),
    recordings: path.join(cap, "recordings"),
    brandKit: path.join(cap, "brand-kit"),
  };
  await Promise.all(Object.values(dirs).map(ensureDir));

  const result: CaptureResult = {
    url: opts.url,
    finalUrl: opts.url,
    capturedAt: new Date().toISOString(),
    pages: [],
    shaders: [],
    css: [],
    fonts: [],
    svgs: [],
    gifs: [],
    images: [],
    lotties: [],
    rive: [],
    videoUrls: [],
    videos: [],
    canvasRecordings: [],
    hovers: [],
    componentShots: [],
    recordings: [],
    brandKit: [],
    errors: [],
  };

  const timeout = opts.timeoutMs ?? 45_000;
  let browser: Browser | undefined;
  try {
    browser = await launch(opts.headed);
  } catch (e) {
    throw new Error(`Could not launch Chromium. Run \`npx playwright install chromium\` and try again.\n${(e as Error).message}`);
  }

  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
    userAgent: opts.userAgent,
    colorScheme: "light",
    reducedMotion: "no-preference",
    locale: "en-US",
  });
  await ctx.addInitScript(INIT_SCRIPT);

  // ---------------------------------------------------------------- network capture
  const seen = new Set<string>();
  const pending = new Set<Promise<unknown>>();
  let imageBytes = 0;
  const onResponse = (res: Response) => {
    const p = handleResponse(res).catch((e) => log.debug(`response ${res.url()}: ${(e as Error).message}`));
    pending.add(p);
    p.finally(() => pending.delete(p));
  };
  const handleResponse = async (res: Response) => {
    const url = res.url();
    if (seen.has(url) || url.startsWith("data:") || url.startsWith("blob:")) return;
    const status = res.status();
    const ct = (res.headers()["content-type"] || "").toLowerCase();
    const ext = path.extname(new URL(url).pathname).toLowerCase();
    const isVideo = ct.startsWith("video/") || [".mp4", ".webm", ".mov", ".m3u8"].includes(ext) || ct.includes("mpegurl");
    if (isVideo) {
      seen.add(url);
      result.videoUrls.push(url);
      return;
    }
    if (status < 200 || status >= 300) return;
    seen.add(url);
    if (ct.includes("text/css") || ext === ".css") {
      const text = await res.text();
      const file = path.join(dirs.css, fileNameFromUrl(url, ".css"));
      await write(file, text);
      result.css.push({ url, path: file, bytes: text.length });
    } else if (ct.startsWith("font/") || ct.includes("font-woff") || ct.includes("opentype") || ct.includes("truetype") || [".woff2", ".woff", ".ttf", ".otf"].includes(ext)) {
      const body = await res.body();
      const file = path.join(dirs.fonts, fileNameFromUrl(url, ".woff2"));
      await write(file, body);
      result.fonts.push({ url, path: file, type: ext.slice(1) || ct.split("/")[1] || "font", bytes: body.length });
    } else if (ct.includes("image/svg") || ext === ".svg") {
      const body = await res.body();
      if (body.length > 2_000_000) return;
      const file = path.join(dirs.svgs, fileNameFromUrl(url, ".svg"));
      await write(file, body);
      result.svgs.push({ url, path: file, type: "svg", bytes: body.length });
    } else if (ct.includes("image/gif") || ext === ".gif") {
      const body = await res.body();
      const size = imageSize(body);
      if (!size || size.width < 48 || size.height < 48) return; // tracking pixels / spacers
      const file = path.join(dirs.gifs, fileNameFromUrl(url, ".gif"));
      await write(file, body);
      result.gifs.push({ url, path: file, type: "gif", bytes: body.length, width: size.width, height: size.height });
    } else if (ct.startsWith("image/") || [".png", ".jpg", ".jpeg", ".webp", ".avif", ".ico"].includes(ext)) {
      const body = await res.body();
      if (body.length < 1200 || body.length > 12_000_000) return;
      if (result.images.length >= 220 || imageBytes > 160_000_000) return;
      imageBytes += body.length;
      const size = imageSize(body);
      const fext = ct.includes("avif") ? ".avif" : ct.includes("webp") ? ".webp" : ct.includes("png") ? ".png" : ct.includes("jpeg") ? ".jpg" : ct.includes("icon") ? ".ico" : ext || ".img";
      const file = path.join(dirs.images, fileNameFromUrl(url, fext).replace(/\.[^.]+$/, fext));
      await write(file, body);
      result.images.push({ url, path: file, type: fext.slice(1), bytes: body.length, width: size?.width, height: size?.height });
    } else if (ext === ".lottie") {
      const body = await res.body();
      const file = path.join(dirs.lottie, fileNameFromUrl(url, ".lottie"));
      await write(file, body);
      result.lotties.push({ url, path: file, type: "dotlottie", bytes: body.length });
    } else if (ext === ".riv") {
      const body = await res.body();
      const file = path.join(dirs.rive, fileNameFromUrl(url, ".riv"));
      await write(file, body);
      result.rive.push({ url, path: file, type: "riv", bytes: body.length });
    } else if (ct.includes("json") || ext === ".json") {
      const len = Number(res.headers()["content-length"] || 0);
      if (len > 8_000_000) return;
      const text = await res.text();
      if (text.length > 8_000_000 || !text.includes('"layers"')) return;
      try {
        const j = JSON.parse(text);
        if (j && typeof j === "object" && "v" in j && "fr" in j && "layers" in j && "w" in j) {
          const file = path.join(dirs.lottie, fileNameFromUrl(url, ".json"));
          await write(file, text);
          result.lotties.push({ url, path: file, type: "lottie", bytes: text.length, width: j.w, height: j.h, meta: { fr: j.fr, ip: j.ip, op: j.op, nm: j.nm, layers: j.layers?.length } });
        }
      } catch {
        /* not json */
      }
    }
  };
  ctx.on("response", onResponse);

  // ---------------------------------------------------------------- pages
  const brandHint = guessBrandHint(opts.url);
  const visit = async (url: string, kind: PageKind): Promise<CapturedPage | null> => {
    const page = await ctx.newPage();
    try {
      log.step(`Visiting ${kind === "home" ? "homepage" : kind + " page"} ${url}`);
      const resp = await page.goto(url, { waitUntil: "domcontentloaded", timeout });
      if (resp && resp.status() >= 400) log.warn(`${url} returned HTTP ${resp.status()}`);
      await settle(page);
      await dismissOverlays(page);
      await autoScroll(page);
      // Consent banners often appear late (after scroll or a timer) — dismiss again before measuring.
      await dismissOverlays(page);
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(700);
      const raw = (await page.evaluate(collectPage, { maxElements: 9000, brandHint, pageUrl: url })) as RawPage;
      const tag = kind === "home" ? "home" : `${kind}-${slug(new URL(url).pathname, 30)}`;
      const shot = path.join(dirs.shots, `${tag}-desktop.png`);
      await page.screenshot({ path: shot, type: "png" });
      const full = path.join(dirs.shots, `${tag}-desktop-full.jpg`);
      // Stitch viewport tiles instead of a native full-page shot: resizing the viewport resets
      // scroll-triggered (GSAP/IntersectionObserver) content, leaving blank pages.
      if (!(await stitchedFullPage(page, full))) await page.screenshot({ path: full, type: "jpeg", quality: 82, fullPage: true, timeout: 30_000 }).catch(() => undefined);
      const shaders = (await page.evaluate(() => (window as unknown as { __wc?: { shaders: { type: string; source: string }[] } }).__wc?.shaders ?? []).catch(() => [])) as { type: string; source: string }[];
      for (const s of shaders) {
        const h = hash(s.source);
        if (result.shaders.some((x) => hash(x.source) === h)) continue;
        const ext = s.type === "fragment" ? ".frag" : s.type === "vertex" ? ".vert" : ".glsl";
        const file = path.join(dirs.shaders, `${slug(kind)}-${s.type}-${h}${ext}`);
        await write(file, s.source);
        result.shaders.push({ ...s, page: url, path: file });
      }
      if (kind === "home") {
        result.finalUrl = page.url();
        await captureComponents(page, raw, dirs.components, result);
        if (opts.canvas !== false) await captureCanvases(page, raw, dirs.canvas, result, url);
      }
      if (kind === "brand") await collectBrandKit(ctx, raw, dirs.brandKit, result);
      return { url: page.url(), kind, raw, screenshot: shot, fullPage: (await exists(full)) ? full : undefined };
    } catch (e) {
      const msg = `Failed to capture ${url}: ${(e as Error).message.split("\n")[0]}`;
      log.warn(msg);
      result.errors.push(msg);
      return null;
    } finally {
      await page.close().catch(() => undefined);
    }
  };

  const home = await visit(opts.url, "home");
  if (!home) {
    await browser.close();
    throw new Error(`Could not load ${opts.url}. ${result.errors.join(" ")}`);
  }
  result.pages.push(home);

  const discovered: DiscoveredPage[] = discoverPages(home.url, home.raw.links, opts.maxPages ?? 6);
  for (const extra of opts.include ?? []) discovered.unshift({ url: extra, kind: "other", score: 99 });
  if (discovered.length) log.info(`Discovered: ${discovered.map((d) => d.kind).join(", ")}`);
  for (const d of discovered) {
    const p = await visit(d.url, d.kind);
    if (p) result.pages.push(p);
  }

  // ---------------------------------------------------------------- mobile
  if (opts.mobile !== false) {
    try {
      log.step("Capturing mobile viewport");
      const mctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, userAgent: opts.userAgent });
      await mctx.addInitScript(INIT_SCRIPT);
      const mp = await mctx.newPage();
      await mp.goto(result.finalUrl, { waitUntil: "domcontentloaded", timeout });
      await settle(mp);
      await dismissOverlays(mp);
      await autoScroll(mp);
      await dismissOverlays(mp);
      await mp.evaluate(() => window.scrollTo(0, 0));
      await mp.waitForTimeout(500);
      const shot = path.join(dirs.shots, "home-mobile.png");
      await mp.screenshot({ path: shot });
      const full = path.join(dirs.shots, "home-mobile-full.jpg");
      await mp.screenshot({ path: full, fullPage: true, type: "jpeg", quality: 80, timeout: 30_000 }).catch(() => undefined);
      result.mobile = { screenshot: shot, fullPage: (await exists(full)) ? full : undefined };
      await mctx.close();
    } catch (e) {
      result.errors.push(`mobile: ${(e as Error).message}`);
    }
  }

  // ---------------------------------------------------------------- scroll recording
  if (opts.recordScroll !== false) {
    try {
      log.step("Recording scroll-through (motion & product demo reference)");
      const tmp = await mkdtemp(path.join(tmpdir(), "wc-rec-"));
      const rctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, recordVideo: { dir: tmp, size: { width: 1280, height: 800 } }, userAgent: opts.userAgent });
      await rctx.addInitScript(INIT_SCRIPT);
      const rp = await rctx.newPage();
      await rp.goto(result.finalUrl, { waitUntil: "domcontentloaded", timeout });
      await settle(rp);
      await dismissOverlays(rp);
      await rp.waitForTimeout(1500);
      await dismissOverlays(rp);
      await rp.evaluate(smoothScrollThrough, { pxPerSecond: 700, maxMs: 16000 });
      await rp.waitForTimeout(600);
      const video = rp.video();
      await rctx.close();
      const src = video ? await video.path() : null;
      if (src) {
        const webm = path.join(dirs.recordings, "home-scroll.webm");
        await rename(src, webm).catch(async () => copyFile(src, webm));
        const mp4 = path.join(dirs.recordings, "home-scroll.mp4");
        const gif = path.join(dirs.recordings, "home-scroll-preview.gif");
        const made = await transcode(webm, mp4, gif, 640).catch((e) => {
          log.debug(`transcode: ${e.message}`);
          return [] as string[];
        });
        result.recordings.push({ path: made.includes(mp4) ? mp4 : webm, gif: made.includes(gif) ? gif : undefined, kind: "scroll", page: result.finalUrl });
      }
      await rm(tmp, { recursive: true, force: true });
    } catch (e) {
      result.errors.push(`recording: ${(e as Error).message}`);
    }
  }

  // ---------------------------------------------------------------- videos
  if (opts.videos !== false) {
    // One source per <video> element (prefer MP4 over WebM duplicates of the same clip).
    const pickSrc = (srcs: string[]) => srcs.find((s) => /\.mp4(\?|$)/i.test(s)) ?? srcs.find((s) => !s.startsWith("blob:")) ?? srcs[0];
    const domVideos = result.pages.flatMap((p) => p.raw.videos.map((v: { srcs: string[]; poster?: string }) => ({ src: pickSrc(v.srcs), poster: v.poster })));
    const domAll = new Set(result.pages.flatMap((p) => p.raw.videos.flatMap((v: { srcs: string[] }) => v.srcs)));
    const urls = new Map<string, string | undefined>();
    for (const v of domVideos) if (!v.src.startsWith("blob:")) urls.set(v.src, v.poster);
    for (const u of result.videoUrls) if (!urls.has(u) && !domAll.has(u)) urls.set(u, undefined);
    let n = 0;
    for (const [url, poster] of urls) {
      if (n >= 8) break;
      try {
        const isStream = /\.m3u8|mpegurl|\.mpd/i.test(url);
        const base = fileNameFromUrl(url, ".mp4").replace(/\.(m3u8|mpd|mov)$/i, ".mp4");
        const file = path.join(dirs.videos, base);
        if (isStream) {
          log.step(`Downloading streamed video ${short(url)}`);
          if (await downloadStream(url, file)) {
            result.videos.push({ url, path: file, poster });
            n++;
          }
          continue;
        }
        const head = await ctx.request.head(url, { timeout: 15_000 }).catch(() => null);
        const len = Number(head?.headers()["content-length"] || 0);
        const cap = (opts.maxVideoMB ?? 60) * 1_000_000;
        if (len > cap) {
          log.info(`Skipping large video (${(len / 1e6).toFixed(0)} MB): ${short(url)}`);
          continue;
        }
        log.step(`Downloading video ${short(url)}`);
        const res = await ctx.request.get(url, { timeout: 90_000 });
        if (!res.ok()) continue;
        const body = await res.body();
        if (body.length > cap || body.length < 10_000) continue;
        await write(file, body);
        const gif = file.replace(/\.[^.]+$/, "-preview.gif");
        await transcode(file, file.replace(/\.[^.]+$/, ".tmp.mp4"), gif, 480)
          .then(async () => rm(file.replace(/\.[^.]+$/, ".tmp.mp4"), { force: true }))
          .catch(() => undefined);
        result.videos.push({ url, path: file, poster, gif: (await exists(gif)) ? gif : undefined });
        n++;
      } catch (e) {
        log.debug(`video ${url}: ${(e as Error).message}`);
      }
    }
  }

  await Promise.allSettled([...pending]);
  ctx.off("response", onResponse);
  await ctx.close();
  await browser.close();
  return result;
}

async function launch(headed?: boolean): Promise<Browser> {
  const args = ["--autoplay-policy=no-user-gesture-required"];
  // Prefer Chrome's "new headless" (full browser): it gets real GPU acceleration, so WebGL
  // hero canvases animate at a usable frame rate for recording. Fall back to the headless shell.
  try {
    return await chromium.launch({ headless: !headed, channel: "chromium", args });
  } catch {
    return chromium.launch({ headless: !headed, args });
  }
}

function guessBrandHint(url: string) {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    return host.split(".")[0];
  } catch {
    return "";
  }
}

function short(url: string) {
  return url.length > 90 ? url.slice(0, 60) + "…" + url.slice(-24) : url;
}

async function settle(page: Page) {
  await page.waitForLoadState("load", { timeout: 15_000 }).catch(() => undefined);
  await page.waitForLoadState("networkidle", { timeout: 8_000 }).catch(() => undefined);
  await page.evaluate(() => (document as unknown as { fonts: { ready: Promise<unknown> } }).fonts.ready).catch(() => undefined);
}

/**
 * Cookie / consent banners: prefer the most privacy-preserving choice (reject / necessary only).
 * If none is offered we never click "accept" — we hide the overlay from screenshots instead.
 */
async function dismissOverlays(page: Page) {
  try {
    const found = await page.evaluate(() => {
      const declineRe = /^(reject( all)?( cookies)?|decline( all)?|deny( all)?|refuse( all)?|(use )?(only )?(strictly )?(necessary|essential)( cookies)?( only)?|continue without accepting|no,? thanks)$/i;
      for (const b of Array.from(document.querySelectorAll("button, [role=button], a[role=button]"))) {
        const r = b.getBoundingClientRect();
        if (!r.width || !r.height) continue;
        const text = ((b as HTMLElement).innerText || "").trim();
        if (text && text.length < 60 && declineRe.test(text)) {
          b.setAttribute("data-wc-decline", "");
          return true;
        }
      }
      return false;
    });
    if (found) {
      await page.locator("[data-wc-decline]").first().click({ timeout: 1500 }).catch(() => undefined);
      await page.waitForTimeout(300);
    }
  } catch {
    /* ignore */
  }
  await page
    .evaluate(() => {
      const re = /cookie|consent|gdpr|privacy preferences|we use cookies|onetrust|cookiebot|truste|didomi|usercentrics/i;
      document.querySelectorAll("body *").forEach((el) => {
        const cs = getComputedStyle(el);
        if (cs.position !== "fixed" && cs.position !== "sticky") return;
        const id = `${el.id} ${el.getAttribute("class") || ""} ${el.getAttribute("aria-label") || ""}`;
        const text = ((el as HTMLElement).innerText || "").slice(0, 600);
        if (re.test(id) || (re.test(text) && el.getBoundingClientRect().height < innerHeight * 0.7)) {
          (el as HTMLElement).style.setProperty("display", "none", "important");
          el.setAttribute("data-wc-skip", "");
        }
      });
      for (const id of ["onetrust-consent-sdk", "CybotCookiebotDialog", "usercentrics-root", "didomi-host", "truste-consent-track"]) {
        const el = document.getElementById(id);
        if (el) el.style.setProperty("display", "none", "important");
      }
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    })
    .catch(() => undefined);
}

/** Scroll the whole page so lazy images, reveal-on-scroll animations and videos all load. */
async function autoScroll(page: Page) {
  await page
    .evaluate(async () => {
      const step = Math.max(400, Math.floor(innerHeight * 0.8));
      const max = Math.min(document.documentElement.scrollHeight, 30000);
      for (let y = 0; y < max; y += step) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 140));
      }
      window.scrollTo(0, document.documentElement.scrollHeight);
      await new Promise((r) => setTimeout(r, 400));
    })
    .catch(() => undefined);
  await page.waitForLoadState("networkidle", { timeout: 5_000 }).catch(() => undefined);
}

async function smoothScrollThrough({ pxPerSecond, maxMs }: { pxPerSecond: number; maxMs: number }) {
  const total = Math.min(document.documentElement.scrollHeight - innerHeight, (pxPerSecond * maxMs) / 1000);
  const dur = Math.min(maxMs, (total / pxPerSecond) * 1000);
  const t0 = performance.now();
  await new Promise<void>((resolve) => {
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / dur);
      const e = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
      window.scrollTo(0, total * e);
      if (p < 1) requestAnimationFrame(tick);
      else resolve();
    };
    requestAnimationFrame(tick);
  });
}

/** Hover states and element screenshots for the components that define the brand's UI. */
async function captureComponents(page: Page, raw: RawPage, dir: string, result: CaptureResult) {
  log.step("Capturing components & hover states");
  type B = RawPage["buttons"][number];
  const uniq = new Map<string, B>();
  for (const b of raw.buttons as B[]) {
    const s = b.styles;
    const key = [s["background-color"], s["color"], s["border-top-left-radius"], s["border-top-width"], s["font-size"]].join("|");
    if (!uniq.has(key)) uniq.set(key, b);
  }
  const picks = [...uniq.values()].sort((a, b) => a.rect.y - b.rect.y).slice(0, 8);
  for (const b of picks) {
    const loc = page.locator(`[data-wc-id="${b.id}"]`).first();
    try {
      const visible = await page.evaluate((id) => {
        const el = document.querySelector(`[data-wc-id="${id}"]`);
        if (!el) return false;
        el.scrollIntoView({ block: "center" });
        const r = el.getBoundingClientRect();
        const hit = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2);
        return r.width > 0 && !!hit && (el === hit || el.contains(hit) || hit.contains(el));
      }, b.id);
      if (!visible) continue;
      await page.waitForTimeout(120);
      const box = await loc.boundingBox();
      if (!box) continue;
      const clip = padClip(box, 14, page);
      const before = path.join(dir, `button-${b.id}.png`);
      await page.screenshot({ path: before, clip: await clip });
      const readStyles = () =>
        loc.evaluate((el, props) => {
          const cs = getComputedStyle(el);
          return Object.fromEntries(props.map((p) => [p, cs.getPropertyValue(p)]));
        }, HOVER_PROPS);
      const beforeStyles = await readStyles();
      await loc.hover({ timeout: 1500, force: true });
      await page.waitForTimeout(450);
      const after = path.join(dir, `button-${b.id}-hover.png`);
      await page.screenshot({ path: after, clip: await clip });
      const afterStyles = await readStyles();
      result.hovers.push({ id: b.id, text: b.text, before: beforeStyles, after: afterStyles, shotBefore: before, shotAfter: after });
      result.componentShots.push({ kind: "button", id: b.id, path: before });
      await page.mouse.move(2, 2);
    } catch (e) {
      log.debug(`hover ${b.id}: ${(e as Error).message}`);
    }
  }
  const shoot = async (kind: string, id: string, maxH = 1400) => {
    try {
      const loc = page.locator(`[data-wc-id="${id}"]`).first();
      await page.evaluate((i) => document.querySelector(`[data-wc-id="${i}"]`)?.scrollIntoView({ block: "center" }), id);
      await page.waitForTimeout(150);
      const box = await loc.boundingBox();
      if (!box) return;
      const file = path.join(dir, `${kind}-${id}.png`);
      const clip = await padClip({ ...box, height: Math.min(box.height, maxH) }, 16, page);
      await page.screenshot({ path: file, clip });
      result.componentShots.push({ kind, id, path: file });
    } catch {
      /* ignore */
    }
  };
  for (const c of (raw.cards as { id: string }[]).slice(0, 4)) await shoot("card", c.id);
  for (const c of (raw.inputs as { id: string }[]).slice(0, 2)) await shoot("input", c.id);
  for (const c of (raw.badges as { id: string }[]).slice(0, 4)) await shoot("badge", c.id);
  // Header + footer
  for (const [kind, sel] of [["nav", "header, [role=banner], nav"], ["footer", "footer"]] as const) {
    try {
      await page.evaluate(() => window.scrollTo(0, 0));
      const loc = page.locator(sel).first();
      if (!(await loc.count())) continue;
      await loc.scrollIntoViewIfNeeded({ timeout: 2000 });
      await page.waitForTimeout(250);
      const box = await loc.boundingBox();
      if (!box || box.height < 20) continue;
      const vp = page.viewportSize()!;
      const file = path.join(dir, `${kind}.png`);
      await page.screenshot({ path: file, clip: { x: 0, y: Math.max(0, box.y), width: vp.width, height: Math.min(box.height, vp.height) } });
      result.componentShots.push({ kind, id: kind, path: file });
    } catch {
      /* ignore */
    }
  }
  await page.evaluate(() => window.scrollTo(0, 0));
}

async function padClip(box: { x: number; y: number; width: number; height: number }, pad: number, page: Page) {
  const vp = page.viewportSize()!;
  const x = Math.max(0, box.x - pad);
  const y = Math.max(0, box.y - pad);
  return { x, y, width: Math.min(vp.width - x, box.width + pad * 2), height: Math.min(vp.height - y, box.height + pad * 2) };
}

/** Record animated <canvas> elements (WebGL gradients, particle fields, 3D heroes) to video. */
async function captureCanvases(page: Page, raw: RawPage, dir: string, result: CaptureResult, pageUrl: string) {
  type C = { id: string; ctx: string; w: number; h: number; y: number; cssVars: Record<string, string> };
  const canvases = (raw.canvases as C[]).filter((c) => c.w * c.h >= 50_000).slice(0, 4);
  for (const c of canvases) {
    try {
      log.step(`Recording ${c.ctx} canvas (${c.w}×${c.h})`);
      await page.evaluate((id) => document.querySelector(`[data-wc-id="${id}"]`)?.scrollIntoView({ block: "center" }), c.id);
      await page.waitForTimeout(900);
      const base = path.join(dir, `canvas-${c.ctx}-${c.id}`);
      // Preferred path: record the canvas itself in real time (smooth, text-free, fast).
      const rec = await page
        .evaluate(async ({ id, ms }) => {
          const el = document.querySelector(`[data-wc-id="${id}"]`) as HTMLCanvasElement | null;
          if (!el || !("captureStream" in el)) return null;
          const poster = (() => {
            try {
              return el.toDataURL("image/png");
            } catch {
              return null;
            }
          })();
          const stream = el.captureStream(30);
          const type = ["video/webm;codecs=vp9", "video/webm;codecs=vp8", "video/webm"].find((t) => MediaRecorder.isTypeSupported(t));
          if (!type) return null;
          const rec = new MediaRecorder(stream, { mimeType: type, videoBitsPerSecond: 8_000_000 });
          const chunks: Blob[] = [];
          rec.ondataavailable = (e) => e.data.size && chunks.push(e.data);
          const done = new Promise((r) => (rec.onstop = r));
          rec.start(250);
          await new Promise((r) => setTimeout(r, ms));
          rec.stop();
          await done;
          const blob = new Blob(chunks, { type });
          if (blob.size < 2000) return null;
          const buf = new Uint8Array(await blob.arrayBuffer());
          let bin = "";
          for (let i = 0; i < buf.length; i += 0x8000) bin += String.fromCharCode(...buf.subarray(i, i + 0x8000));
          return { video: btoa(bin), poster };
        }, { id: c.id, ms: 5000 })
        .catch((e) => {
          log.debug(`captureStream: ${(e as Error).message}`);
          return null;
        });
      if (rec?.video) {
        const webm = `${base}.webm`;
        await write(webm, Buffer.from(rec.video, "base64"));
        let poster = `${base}-poster.png`;
        if (rec.poster && rec.poster.length > 3000) await write(poster, Buffer.from(rec.poster.split(",")[1], "base64"));
        else poster = "";
        const pageBg = await page.evaluate(() => {
          const pick = (el: Element) => getComputedStyle(el).backgroundColor;
          const c = pick(document.body);
          return c && c !== "rgba(0, 0, 0, 0)" ? c : pick(document.documentElement);
        }).catch(() => "rgb(255, 255, 255)");
        const bgHex = rgbToHex(pageBg);
        const made = await transcode(webm, `${base}.mp4`, `${base}.gif`, Math.min(640, c.w), bgHex).catch(() => [] as string[]);
        if (!poster && made.length) {
          poster = `${base}-poster.jpg`;
          await extractFrame(`${base}.mp4`, poster).catch(() => (poster = ""));
        }
        const colors = poster ? await sampleColors(page, poster).catch(() => []) : [];
        result.canvasRecordings.push({ page: pageUrl, id: c.id, mp4: made.find((m) => m.endsWith(".mp4")) ?? webm, gif: made.find((m) => m.endsWith(".gif")), poster, frames: 150, fps: 30, colors, ctx: c.ctx, w: c.w, h: c.h, cssVars: c.cssVars });
        continue;
      }
      // Fallback: screenshot frames of the canvas region.
      const loc = page.locator(`[data-wc-id="${c.id}"]`).first();
      const box = await loc.boundingBox();
      if (!box) continue;
      const vp = page.viewportSize()!;
      const clip = { x: Math.max(0, box.x), y: Math.max(0, box.y), width: Math.min(vp.width - Math.max(0, box.x), box.width), height: Math.min(vp.height - Math.max(0, box.y), box.height) };
      if (clip.width < 50 || clip.height < 50) continue;
      const tmp = await mkdtemp(path.join(tmpdir(), "wc-canvas-"));
      const t0 = Date.now();
      const frames = 40;
      for (let i = 0; i < frames; i++) {
        await page.screenshot({ path: path.join(tmp, `${String(i).padStart(5, "0")}.jpg`), clip, type: "jpeg", quality: 92 });
      }
      const elapsed = (Date.now() - t0) / 1000;
      const fps = Math.max(4, Math.min(30, Math.round(frames / elapsed)));
      const poster = `${base}-poster.jpg`;
      await copyFile(path.join(tmp, "00000.jpg"), poster);
      const made = await encodeFrames({ fps, input: path.join(tmp, "%05d.jpg"), mp4: `${base}.mp4`, gif: `${base}.gif`, gifWidth: Math.min(640, Math.round(clip.width)) }).catch((e) => {
        log.debug(`canvas encode: ${e.message}`);
        return [] as string[];
      });
      const colors = await sampleColors(page, poster).catch(() => []);
      result.canvasRecordings.push({ page: pageUrl, id: c.id, mp4: made.find((m) => m.endsWith(".mp4")), gif: made.find((m) => m.endsWith(".gif")), poster, frames, fps, colors, ctx: c.ctx, w: c.w, h: c.h, cssVars: c.cssVars });
      await rm(tmp, { recursive: true, force: true });
    } catch (e) {
      log.debug(`canvas ${c.id}: ${(e as Error).message}`);
    }
  }
}

/** K-means dominant colors of an image, computed in the browser (no native image deps). */
export async function sampleColors(page: Page, file: string, k = 5): Promise<{ hex: string; weight: number }[]> {
  const { readFile } = await import("node:fs/promises");
  const b64 = (await readFile(file)).toString("base64");
  const mime = file.endsWith(".png") ? "image/png" : "image/jpeg";
  return page.evaluate(
    async ({ src, k }) => {
      const img = new Image();
      img.src = src;
      await img.decode();
      const c = document.createElement("canvas");
      c.width = 64;
      c.height = Math.max(1, Math.round((64 * img.height) / img.width));
      const g = c.getContext("2d")!;
      g.drawImage(img, 0, 0, c.width, c.height);
      const d = g.getImageData(0, 0, c.width, c.height).data;
      const px: number[][] = [];
      for (let i = 0; i < d.length; i += 4) if (d[i + 3] > 200) px.push([d[i], d[i + 1], d[i + 2]]);
      let cents = Array.from({ length: k }, (_, i) => px[Math.floor((i + 0.5) * (px.length / k))] || [0, 0, 0]);
      for (let it = 0; it < 12; it++) {
        const sums = cents.map(() => [0, 0, 0, 0]);
        for (const p of px) {
          let bi = 0;
          let bd = Infinity;
          cents.forEach((c2, i) => {
            const dd = (p[0] - c2[0]) ** 2 + (p[1] - c2[1]) ** 2 + (p[2] - c2[2]) ** 2;
            if (dd < bd) {
              bd = dd;
              bi = i;
            }
          });
          const s = sums[bi];
          s[0] += p[0];
          s[1] += p[1];
          s[2] += p[2];
          s[3]++;
        }
        cents = sums.map((s, i) => (s[3] ? [s[0] / s[3], s[1] / s[3], s[2] / s[3]] : cents[i]));
        if (it === 11) {
          return cents
            .map((c2, i) => ({ hex: "#" + c2.map((v) => Math.round(v).toString(16).padStart(2, "0")).join(""), weight: sums[i][3] / px.length }))
            .sort((a, b) => b.weight - a.weight);
        }
      }
      return [];
    },
    { src: `data:${mime};base64,${b64}`, k },
  );
}

/** Official brand / press kits: download the logo packs they publish. */
async function collectBrandKit(ctx: BrowserContext, raw: RawPage, dir: string, result: CaptureResult) {
  const assetRe = /\.(svg|png|zip|pdf|eps|ai|jpg|jpeg|webp)(\?|$)/i;
  const candidates = (raw.links as { href: string; text: string; download: boolean }[]).filter(
    (l) => (l.download || assetRe.test(l.href)) && (sameSite(raw.url, l.href) || /cdn|assets|static|images|brand|press|media|dropbox|figma/i.test(l.href)),
  );
  const uniq = [...new Map(candidates.map((c) => [c.href, c])).values()].slice(0, 24);
  if (!uniq.length) return;
  log.step(`Brand kit page found — downloading ${uniq.length} official asset(s)`);
  let total = 0;
  for (const l of uniq) {
    try {
      const res = await ctx.request.get(l.href, { timeout: 60_000 });
      if (!res.ok()) continue;
      const body = await res.body();
      total += body.length;
      if (total > 120_000_000) break;
      const ext = (assetRe.exec(l.href)?.[1] || "bin").toLowerCase();
      const file = path.join(dir, fileNameFromUrl(l.href, "." + ext));
      await write(file, body);
      const entry: CaptureResult["brandKit"][number] = { url: l.href, path: file, kind: ext };
      if (ext === "zip" && spawnSync("unzip", ["-v"], { stdio: "ignore" }).status === 0) {
        const to = file.replace(/\.zip$/i, "");
        const r = spawnSync("unzip", ["-o", "-q", file, "-d", to, "-x", "__MACOSX/*"], { stdio: "ignore", timeout: 60_000 });
        if (r.status === 0) entry.extractedTo = to;
      }
      result.brandKit.push(entry);
    } catch (e) {
      log.debug(`brand kit ${l.href}: ${(e as Error).message}`);
    }
  }
}

export async function listFiles(dir: string, re: RegExp): Promise<string[]> {
  const out: string[] = [];
  const walk = async (d: string) => {
    for (const e of await readdir(d, { withFileTypes: true }).catch(() => [])) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) await walk(p);
      else if (re.test(e.name)) out.push(p);
    }
  };
  await walk(dir);
  return out;
}

function rgbToHex(css: string) {
  const m = css.match(/\d+(\.\d+)?/g);
  if (!m || m.length < 3 || (m.length > 3 && Number(m[3]) === 0)) return "#ffffff";
  return "#" + m.slice(0, 3).map((v) => Math.round(Number(v)).toString(16).padStart(2, "0")).join("");
}

async function stitchedFullPage(page: Page, out: string, maxTiles = 24): Promise<boolean> {
  const { runFfmpeg, findFfmpeg } = await import("../render/ffmpeg.js");
  const bin = await findFfmpeg();
  if (!bin) return false;
  const vp = page.viewportSize();
  if (!vp) return false;
  const docH = await page.evaluate(() => document.documentElement.scrollHeight);
  const tiles = Math.min(maxTiles, Math.ceil(docH / vp.height));
  const tmp = await mkdtemp(path.join(tmpdir(), "wc-stitch-"));
  try {
    const files: string[] = [];
    for (let i = 0; i < tiles; i++) {
      const y = Math.min(i * vp.height, Math.max(0, docH - vp.height));
      await page.evaluate((top) => window.scrollTo(0, top), y);
      await page.waitForTimeout(i === 0 ? 300 : 450);
      if (i === 1) {
        // Hide fixed/sticky chrome after the first tile so headers don't repeat.
        await page.evaluate(() => {
          for (const el of Array.from(document.querySelectorAll("body *"))) {
            const pos = getComputedStyle(el).position;
            if (pos === "fixed" || pos === "sticky") (el as HTMLElement).style.setProperty("visibility", "hidden", "important");
          }
        });
      }
      const f = path.join(tmp, `${String(i).padStart(3, "0")}.jpg`);
      await page.screenshot({ path: f, type: "jpeg", quality: 85 });
      // The last tile overlaps the previous one; crop the overlap away.
      const overlap = i > 0 && i === tiles - 1 ? i * vp.height - y : 0;
      files.push(overlap > 0 ? `${f}#${overlap}` : f);
    }
    const inputs = files.flatMap((f) => ["-i", f.split("#")[0]]);
    const crops = files.map((f, i) => {
      const ov = Number(f.split("#")[1] || 0);
      return ov ? `[${i}:v]crop=iw:ih-${ov}:0:${ov}[t${i}]` : `[${i}:v]null[t${i}]`;
    });
    const graph = `${crops.join(";")};${files.map((_, i) => `[t${i}]`).join("")}vstack=inputs=${files.length}`;
    if (files.length === 1) await copyFile(files[0].split("#")[0], out);
    else await runFfmpeg(bin, [...inputs, "-filter_complex", graph, "-q:v", "3", out]);
    return true;
  } catch (e) {
    log.debug(`stitch: ${(e as Error).message}`);
    return false;
  } finally {
    await page.evaluate(() => {
      for (const el of Array.from(document.querySelectorAll("body *"))) (el as HTMLElement).style.removeProperty("visibility");
      window.scrollTo(0, 0);
    }).catch(() => undefined);
    await rm(tmp, { recursive: true, force: true });
  }
}

import { chromium, type Browser, type Page } from "playwright";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { mkdtemp, rm, writeFile, copyFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { write, ensureDir } from "../util/fs.js";
import { encodeFrames, extractFrame } from "./ffmpeg.js";
import { log } from "../util/log.js";

/**
 * Renders HTML documents to PNG / PDF / video using headless Chromium.
 * Documents are written to disk first so relative asset paths (fonts, logos) resolve.
 */
export class Renderer {
  private pages = new Map<number, Page>();
  /** Lazily launched new-headless Chrome with real GPU (Metal/D3D/Vulkan) for WebGL scenes; null if unavailable. */
  private gpuBrowser?: Browser | null;

  private constructor(
    private browser: Browser,
    private workDir: string,
  ) {}

  static async create(workDir: string) {
    const browser = await chromium.launch({ args: ["--font-render-hinting=none"] });
    await ensureDir(workDir);
    return new Renderer(browser, workDir);
  }

  async close() {
    await this.browser.close();
    if (this.gpuBrowser) await this.gpuBrowser.close();
  }

  private async gpu(): Promise<Browser> {
    if (this.gpuBrowser === undefined) {
      try {
        this.gpuBrowser = await chromium.launch({ channel: "chromium", args: ["--font-render-hinting=none"] });
      } catch {
        this.gpuBrowser = null;
      }
    }
    return this.gpuBrowser ?? this.browser;
  }

  private async open(html: string, name: string, width: number, height: number, scale = 1, gpu = false): Promise<Page> {
    const file = path.isAbsolute(name) ? `${name}.html` : path.join(this.workDir, `${name}.html`);
    await write(file, html);
    // Pages are reused per device-scale-factor: creating a page costs ~400ms, navigating ~30ms.
    const key = gpu ? -scale : scale;
    let page = this.pages.get(key);
    if (!page || page.isClosed()) {
      const browser = gpu ? await this.gpu() : this.browser;
      page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: scale });
      page.setDefaultTimeout(120_000);
      this.pages.set(key, page);
    } else await page.setViewportSize({ width, height });
    await page.goto(pathToFileURL(file).href, { waitUntil: "load" });
    await page.evaluate(() => (document as unknown as { fonts: { ready: Promise<unknown> } }).fonts.ready);
    await page.waitForTimeout(30);
    return page;
  }

  /** Open an HTML document and run a callback against the live page. */
  async withPage<T>(html: string, o: { width: number; height: number; name: string }, fn: (page: Page) => Promise<T>): Promise<T> {
    const page = await this.open(html, o.name, o.width, o.height, 1);
    try {
      return await fn(page);
    } finally {
      await page.goto("about:blank").catch(() => undefined);
    }
  }

  async png(html: string, out: string, o: { width: number; height: number; scale?: number; transparent?: boolean; fullPage?: boolean; name?: string; gpu?: boolean }) {
    const page = await this.open(html, o.name ?? path.basename(out, path.extname(out)), o.width, o.height, o.scale ?? 1, !!o.gpu);
    try {
      await ensureDir(path.dirname(out));
      await page.screenshot({ path: out, omitBackground: !!o.transparent, fullPage: !!o.fullPage, type: out.endsWith(".jpg") ? "jpeg" : "png", ...(out.endsWith(".jpg") ? { quality: 92 } : {}) });
    } finally {
      await page.goto("about:blank").catch(() => undefined);
    }
    return out;
  }

  /** Render an SVG string to PNG at an exact pixel size, transparent background. */
  async svgToPng(svg: string, out: string, width: number, height: number, background = "transparent", padding = 0) {
    const html = `<!doctype html><html><head><style>html,body{margin:0;width:${width}px;height:${height}px;background:${background};overflow:hidden}
      .w{width:100%;height:100%;display:grid;place-items:center;box-sizing:border-box;padding:${padding}px}
      .w svg{width:100%;height:100%;display:block}</style></head><body><div class="w">${svg}</div></body></html>`;
    return this.png(html, out, { width, height, transparent: background === "transparent", name: `svg-${path.basename(out, ".png")}` });
  }

  async pdf(html: string, out: string, o: { width?: string; height?: string; name?: string } = {}) {
    const page = await this.open(html, o.name ?? path.basename(out, ".pdf"), 1440, 900);
    try {
      await page.emulateMedia({ media: "print" });
      await page.pdf({ path: out, width: o.width ?? "1440px", height: o.height ?? "900px", printBackground: true, preferCSSPageSize: true });
    } finally {
      await page.goto("about:blank").catch(() => undefined);
    }
    return out;
  }

  /**
   * Render a deterministic animation. The document must expose `window.__seek(ms)`
   * which puts the scene at an exact time (we pause all WAAPI animations and drive time).
   */
  async video(html: string, o: { width: number; height: number; fps: number; durationMs: number; mp4?: string; webm?: string; gif?: string; gifWidth?: number; poster?: string; name: string; transparent?: boolean; canvas?: string }) {
    const page = await this.open(html, o.name, o.width, o.height, 1, !!o.canvas);
    const tmp = await mkdtemp(path.join(tmpdir(), "wc-frames-"));
    try {
      const frames = Math.round((o.durationMs / 1000) * o.fps);
      await page.evaluate(() => {
        const w = window as unknown as { __seek?: (t: number) => void };
        if (!w.__seek) {
          // Generic WAAPI driver: pause everything and set currentTime.
          w.__seek = (t: number) => document.getAnimations().forEach((a) => {
            a.pause();
            a.currentTime = t;
          });
        }
      });
      if (o.canvas) {
        // Fast path for WebGL scenes: read pixels straight from the canvas (no compositor round-trip),
        // in batches, then let ffmpeg upscale to the output size.
        const batch = 12;
        for (let i = 0; i < frames; i += batch) {
          const urls = await page.evaluate(
            ({ sel, start, n, fps }) => {
              const w = window as unknown as { __seek: (t: number) => void };
              const c = document.querySelector(sel) as HTMLCanvasElement;
              const out: string[] = [];
              for (let k = start; k < start + n; k++) {
                w.__seek((k / fps) * 1000);
                out.push(c.toDataURL("image/jpeg", 0.95));
              }
              return out;
            },
            { sel: o.canvas, start: i, n: Math.min(batch, frames - i), fps: o.fps },
          );
          for (const [k, u] of urls.entries()) await writeFile(path.join(tmp, `${String(i + k).padStart(5, "0")}.jpg`), Buffer.from(u.split(",")[1], "base64"));
        }
        const made = await encodeFrames({ fps: o.fps, input: path.join(tmp, "%05d.jpg"), mp4: o.mp4, webm: o.webm, gif: o.gif, gifWidth: o.gifWidth, scale: { w: o.width, h: o.height } });
        // Poster from the upscaled video so it matches the delivered resolution.
        if (o.poster && o.mp4 && made.includes(o.mp4)) await extractFrame(o.mp4, o.poster, (o.durationMs / 1000) * 0.66).catch(() => undefined);
        else if (o.poster) await copyFile(path.join(tmp, `${String(Math.floor(frames * 0.66)).padStart(5, "0")}.jpg`), o.poster);
        return made;
      }
      for (let i = 0; i < frames; i++) {
        const t = (i / o.fps) * 1000;
        await page.evaluate((ms) => (window as unknown as { __seek: (t: number) => void | Promise<void> }).__seek(ms), t);
        await page.screenshot({ path: path.join(tmp, `${String(i).padStart(5, "0")}.png`), omitBackground: !!o.transparent });
        if (o.poster && i === Math.floor(frames * 0.66)) await page.screenshot({ path: o.poster, omitBackground: !!o.transparent });
      }
      const made = await encodeFrames({ fps: o.fps, input: path.join(tmp, "%05d.png"), mp4: o.mp4, webm: o.webm, gif: o.gif, gifWidth: o.gifWidth, alpha: o.transparent });
      return made;
    } catch (e) {
      log.warn(`Render ${o.name} failed: ${(e as Error).message}`);
      return [];
    } finally {
      await page.goto("about:blank").catch(() => undefined);
      await rm(tmp, { recursive: true, force: true });
    }
  }
}

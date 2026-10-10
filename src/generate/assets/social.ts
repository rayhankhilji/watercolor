import path from "node:path";
import type { ResolvedBrand } from "../../profile/resolve.js";
import type { Hex } from "../../profile/schema.js";
import type { Renderer } from "../../render/renderer.js";
import { write } from "../../util/fs.js";
import { readableOn, isDark, mix } from "../../util/color.js";
import { esc, clip, firstSentence, typeStyle, headlineHtml } from "../html.js";
import { logoMarkup } from "./logo.js";

export interface SocialContext {
  fontCss: string;
  vars: string;
  /** URL resolver for brand assets (file:// for rendering, relative for editable templates). */
  asset: (rel: string) => string;
  hasPattern: (name: string) => boolean;
}

interface Spec {
  name: string;
  title: string;
  w: number;
  h: number;
  use: string;
  html: (b: ResolvedBrand, c: SocialContext) => string;
}

const page = (b: ResolvedBrand, c: SocialContext, w: number, h: number, bg: string, color: Hex, body: string, extraCss = "") => `<!doctype html><html><head><meta charset="utf-8"><style>
${c.fontCss}
${c.vars}
*{box-sizing:border-box;margin:0}
html,body{width:${w}px;height:${h}px;overflow:hidden}
body{background:${bg};color:${color};font-family:var(--font-body);-webkit-font-smoothing:antialiased;text-rendering:geometricPrecision}
.h{text-wrap:balance}
.p{text-wrap:pretty}
${extraCss}
</style></head><body>${body}</body></html>`;

function fitHeadline(text: string, width: number) {
  const chars = text.length;
  const k = width / 1200;
  const size = chars < 22 ? 92 : chars < 36 ? 78 : chars < 56 ? 64 : chars < 80 ? 54 : 44;
  return Math.round(size * k);
}

function headlineCss(b: ResolvedBrand, size: number) {
  const s = b.type.h1;
  const lh = Math.min(Math.max(s.lineHeight, 1.0), 1.12);
  const ls = Math.min(s.letterSpacing, size > 60 ? -0.02 : -0.01);
  return typeStyle(b, "h1", 1, { "font-size": `${size}px`, "line-height": String(lh), "letter-spacing": `${ls}em` });
}

function copy(b: ResolvedBrand) {
  const full = b.copy.taglines[0] ?? b.copy.headline;
  // Brands with two-tone headlines keep the continuation (it's the signature); others get the first sentence.
  const headline = b.profile.typography.twoTone && !b.copy.taglines[0] ? clip(full, 96) : firstSentence(full);
  const sub = clip(b.copy.subhead || b.description, 150);
  const cat = (b.strategy.company?.category ?? "").split(/[(\-–—,]/)[0].trim();
  const eyebrow = cat && cat.length <= 28 ? cat : b.profile.company.categories[0]?.name ?? b.domain;
  return { headline: b.profile.typography.twoTone ? headline : clip(headline, 90), sub, eyebrow };
}

export const art = (b: ResolvedBrand, c: SocialContext, prefer: string[]) => {
  // The brand's own animated surface (captured WebGL/canvas still) beats any generated pattern.
  if (b.signatureArt && prefer.includes("mesh-gradient")) return `url('${c.asset(b.signatureArt)}') center/cover, ${b.roles.background}`;
  // Flat brands (no measured gradient): never invent one — use their real imagery or a flat texture.
  if (!b.gradientIsCaptured) {
    if (b.heroImage) return `url('${c.asset(b.heroImage)}') center/cover, ${b.roles.surface}`;
    prefer = prefer.filter((p) => !/gradient/.test(p)).concat(["watercolor-wash", "contours"]);
  }
  for (const p of prefer) if (c.hasPattern(p)) return `url('${c.asset(`patterns/${p}.png`)}')`;
  return `linear-gradient(120deg, ${b.gradient.join(", ")})`;
};

export const SOCIAL_SPECS: Spec[] = [
  {
    name: "og-default",
    title: "Open Graph — default",
    w: 1200,
    h: 630,
    use: "Link previews (website, docs, blog index). 1200×630.",
    html: (b, c) => {
      const { headline, eyebrow } = copy(b);
      const bg = b.roles.background;
      const size = fitHeadline(headline, 760);
      return page(b, c, 1200, 630, bg, b.roles.foreground, `
<div style="position:absolute;inset:0;display:grid;grid-template-columns:1fr 380px">
  <div style="padding:64px 0 60px 72px;display:flex;flex-direction:column;justify-content:space-between">
    <div>${logoMarkup(b, { on: bg, height: 40 })}</div>
    <div>
      <div style="${typeStyle(b, "eyebrow", 1.35)};color:${b.monochrome ? b.roles.muted : b.roles.primary};margin-bottom:22px">${esc(eyebrow)}</div>
      <h1 class="h" style="${headlineCss(b, size)};max-width:700px">${headlineHtml(b, headline)}</h1>
    </div>
    <div style="${typeStyle(b, "body", 1.2)};color:${b.roles.muted}">${esc(b.domain)}</div>
  </div>
  <div style="background:${art(b, c, ["mesh-gradient", "watercolor-wash", "signature-gradient"])} center/cover;border-radius:${Math.min(28, b.radius.lg * 2)}px 0 0 ${Math.min(28, b.radius.lg * 2)}px;margin:28px 0 28px 0"></div>
</div>`);
    },
  },
  {
    name: "og-announcement",
    title: "Open Graph — announcement (inverse)",
    w: 1200,
    h: 630,
    use: "Launches, changelog, press. Swap the headline in the HTML template.",
    html: (b, c) => {
      const bg = b.scheme === "dark" ? b.roles.background : b.roles.inverseBackground;
      const fg = readableOn(bg, [b.roles.inverseForeground, "#ffffff", b.roles.background]);
      const headline = b.strategy.copy?.announcement ?? `Introducing the new ${b.name}`;
      const size = fitHeadline(headline, 1000);
      return page(b, c, 1200, 630, bg, fg, `
<div style="position:absolute;inset:0;background:${art(b, c, ["mesh-gradient", "signature-gradient"])} center/cover;opacity:.9;-webkit-mask-image:radial-gradient(120% 90% at 100% 100%,#000 10%,transparent 62%)"></div>
<div style="position:absolute;inset:0;padding:64px 72px;display:flex;flex-direction:column;justify-content:space-between">
  <div style="display:flex;justify-content:space-between;align-items:center">${logoMarkup(b, { on: bg, height: 38 })}
    <span style="${typeStyle(b, "label", 1.1)};border:1px solid ${mix(fg, bg, 0.7)};padding:10px 18px;border-radius:${b.radius.button}">New</span></div>
  <h1 class="h" style="${headlineCss(b, size)};max-width:960px">${esc(headline)}</h1>
</div>`);
    },
  },
  {
    name: "og-article",
    title: "Open Graph — article / blog post",
    w: 1200,
    h: 630,
    use: "Blog and docs articles. Title on surface color with author/date slot.",
    html: (b, c) => {
      const bg = b.roles.surface;
      const title = clip(b.profile.voice.headlines[1] ?? b.copy.headline, 80);
      return page(b, c, 1200, 630, bg, b.roles.foreground, `
<div style="position:absolute;inset:0;padding:68px 72px;display:flex;flex-direction:column;justify-content:space-between">
  <div style="display:flex;gap:16px;align-items:center">${logoMarkup(b, { on: bg, height: 34 })}<span style="${typeStyle(b, "body", 1.2)};color:${b.roles.subtle}">/ Blog</span></div>
  <h1 class="h" style="${headlineCss(b, fitHeadline(title, 1000))};max-width:1000px">${esc(title)}</h1>
  <div style="display:flex;justify-content:space-between;align-items:center;border-top:1px solid ${b.roles.border};padding-top:26px;${typeStyle(b, "body", 1.15)};color:${b.roles.muted}"><span>Author name · 6 min read</span><span>${esc(b.domain)}</span></div>
</div>
<div style="position:absolute;left:0;right:0;top:0;height:8px;background:var(--gradient)"></div>`);
    },
  },
  {
    name: "x-header",
    title: "X / Twitter header",
    w: 1500,
    h: 500,
    use: "Profile header. Content sits right of the avatar overlap zone.",
    html: (b, c) => {
      const { headline } = copy(b);
      const bg = b.roles.background;
      return page(b, c, 1500, 500, bg, b.roles.foreground, `
<div style="position:absolute;inset:0;background:${art(b, c, ["watercolor-wash", "mesh-gradient", "signature-gradient"])} center/cover"></div>
<div style="position:absolute;right:80px;top:50%;transform:translateY(-50%);max-width:760px;padding:44px 52px;background:${bg};border-radius:${Math.min(24, b.radius.lg * 2)}px;box-shadow:0 30px 80px -30px rgba(0,0,0,.35)">
  <div style="margin-bottom:22px">${logoMarkup(b, { on: bg, height: 32 })}</div>
  <div class="h" style="${headlineCss(b, 46)}">${headlineHtml(b, headline)}</div>
</div>`);
    },
  },
  {
    name: "linkedin-banner",
    title: "LinkedIn company banner",
    w: 1584,
    h: 396,
    use: "Company page cover. Safe area keeps clear of the logo overlap at left.",
    html: (b, c) => {
      const { headline } = copy(b);
      const bg = b.scheme === "dark" ? b.roles.background : b.roles.inverseBackground;
      const fg = readableOn(bg, [b.roles.inverseForeground, "#ffffff"]);
      return page(b, c, 1584, 396, bg, fg, `
<div style="position:absolute;right:0;top:0;bottom:0;width:58%;background:${art(b, c, ["mesh-gradient", "signature-gradient"])} center/cover;-webkit-mask-image:linear-gradient(90deg,transparent,#000 40%)"></div>
<div style="position:absolute;left:420px;top:0;bottom:0;display:flex;align-items:center;max-width:820px">
  <div class="h" style="${headlineCss(b, 48)}">${headlineHtml(b, headline, true)}</div>
</div>`);
    },
  },
  {
    name: "instagram-post",
    title: "Instagram / LinkedIn square post",
    w: 1080,
    h: 1080,
    use: "Feed post. Big statement + art panel.",
    html: (b, c) => {
      const { headline, sub } = copy(b);
      const bg = b.roles.background;
      return page(b, c, 1080, 1080, bg, b.roles.foreground, `
<div style="position:absolute;inset:0;display:grid;grid-template-rows:1fr 420px">
  <div style="padding:80px 80px 0;display:flex;flex-direction:column;justify-content:space-between">
    ${logoMarkup(b, { on: bg, height: 44 })}
    <div style="padding-bottom:56px"><h1 class="h" style="${headlineCss(b, fitHeadline(headline, 1100))}">${headlineHtml(b, headline)}</h1>
    <p class="p" style="${typeStyle(b, "body-lg", 1.5)};color:${b.roles.muted};margin-top:26px;max-width:860px">${esc(clip(sub, 110))}</p></div>
  </div>
  <div style="background:${art(b, c, ["watercolor-wash", "mesh-gradient", "signature-gradient"])} center/cover"></div>
</div>`);
    },
  },
  {
    name: "instagram-story",
    title: "Story / Reel cover",
    w: 1080,
    h: 1920,
    use: "Stories, Reels, TikTok covers. Respects top/bottom UI safe zones (250px).",
    html: (b, c) => {
      const { headline } = copy(b);
      const bg = b.scheme === "dark" ? b.roles.background : b.roles.inverseBackground;
      const fg = readableOn(bg, [b.roles.inverseForeground, "#ffffff"]);
      return page(b, c, 1080, 1920, bg, fg, `
<div style="position:absolute;inset:0;background:${art(b, c, ["mesh-gradient", "watercolor-wash", "signature-gradient"])} center/cover"></div>
<div style="position:absolute;inset:0;background:linear-gradient(180deg,transparent 30%,${bg} 78%)"></div>
<div style="position:absolute;left:84px;right:84px;bottom:300px">
  <div style="margin-bottom:48px">${logoMarkup(b, { on: bg, height: 52 })}</div>
  <h1 class="h" style="${headlineCss(b, headline.length > 60 ? 84 : 104)}">${headlineHtml(b, headline, true)}</h1>
  <div style="margin-top:56px;display:inline-block;${typeStyle(b, "label", 1.9)};background:${b.monochrome ? fg : b.roles.primary};color:${b.monochrome ? bg : b.roles.primaryForeground};padding:26px 44px;border-radius:${b.radius.button}">${esc(b.copy.cta)}</div>
</div>`);
    },
  },
  {
    name: "youtube-thumbnail",
    title: "YouTube thumbnail",
    w: 1280,
    h: 720,
    use: "Video thumbnails. High-contrast, few words.",
    html: (b, c) => {
      const words = firstSentence(b.copy.headline).split(/\s+/).slice(0, 5).join(" ");
      const bg = b.monochrome ? b.roles.foreground : b.roles.primary;
      const fg = readableOn(bg, [b.roles.primaryForeground, "#ffffff", "#0a0a0a"]);
      return page(b, c, 1280, 720, bg, fg, `
<div style="position:absolute;inset:0;background:${art(b, c, ["mesh-gradient", "signature-gradient"])} center/cover;opacity:.55;mix-blend-mode:${isDark(bg) ? "screen" : "multiply"}"></div>
<div style="position:absolute;inset:0;padding:72px;display:flex;flex-direction:column;justify-content:space-between">
  ${logoMarkup(b, { on: bg, height: 46, color: fg })}
  <h1 class="h" style="${headlineCss(b, 112)};max-width:1000px">${esc(words)}</h1>
</div>`);
    },
  },
  {
    name: "quote-card",
    title: "Quote / stat card",
    w: 1200,
    h: 1200,
    use: "Customer quotes, metrics and milestones for LinkedIn & X.",
    html: (b, c) => {
      const stat = b.profile.company.stats[0];
      const big = stat?.match(/^[$€£]?\s?[\d.,]+\s?(%|\+|x|k|m|bn|b|t|million|billion|trillion)?\+?/i)?.[0] ?? "10×";
      const label = stat ? stat.replace(big, "").trim() : "Your metric, in the brand's words";
      const bg = b.roles.surface;
      return page(b, c, 1200, 1200, bg, b.roles.foreground, `
<div style="position:absolute;inset:0;padding:96px;display:flex;flex-direction:column;justify-content:space-between">
  ${logoMarkup(b, { on: bg, height: 40 })}
  <div><div style="${headlineCss(b, 260)};line-height:.9;background:var(--gradient);-webkit-background-clip:text;background-clip:text;color:transparent">${esc(big)}</div>
  <div class="h" style="${typeStyle(b, "h2", 1)};font-size:52px;margin-top:28px;max-width:900px">${esc(label)}</div></div>
  <div style="${typeStyle(b, "body", 1.3)};color:${b.roles.muted}">${esc(b.domain)}</div>
</div>`);
    },
  },
  {
    name: "avatar",
    title: "Profile avatar",
    w: 800,
    h: 800,
    use: "Social profile picture. Mark centered with optical padding; circle-crop safe.",
    html: (b, c) => {
      const bg = b.monochrome ? b.roles.foreground : b.roles.primary;
      return page(b, c, 800, 800, bg, readableOn(bg), `<div style="position:absolute;inset:0;display:grid;place-items:center">${logoMarkup(b, { on: bg, height: 300, variant: "mark", color: readableOn(bg, [b.roles.primaryForeground, "#ffffff", "#0a0a0a"]) })}</div>`);
    },
  },
];

export async function renderSocial(b: ResolvedBrand, r: Renderer, outDir: string, render: SocialContext, editable: SocialContext) {
  const files: string[] = [];
  for (const s of SOCIAL_SPECS) {
    files.push(await r.png(s.html(b, render), path.join(outDir, "social", `${s.name}.png`), { width: s.w, height: s.h, name: `social-${s.name}` }));
    files.push(await write(path.join(outDir, "social", "templates", `${s.name}.html`), s.html(b, editable)));
  }
  return files;
}

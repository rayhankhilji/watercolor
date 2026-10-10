import path from "node:path";
import { readFile, rm } from "node:fs/promises";
import type { ResolvedBrand } from "../../profile/resolve.js";
import type { TokenModel } from "../tokens/index.js";
import type { AssetIndex } from "../docs/sections.js";
import type { Renderer } from "../../render/renderer.js";
import { write, exists } from "../../util/fs.js";
import { readableOn, oklchCss, rgbCss, contrast, mix, isDark, describeColor } from "../../util/color.js";
import { esc, fontFaces, brandVars, typeStyle, clip, firstSentence } from "../html.js";
import { hardRules, antiSlop, observedPersonality, colorRatio } from "../docs/heuristics.js";
import { logoMarkup, recolorSvg, fluidSvg } from "../assets/logo.js";

/**
 * The brand book: a single, self-contained HTML document dressed in the brand itself.
 * Lives at brand/guidelines/index.html with relative links to every asset; also printed to PDF.
 */
export async function buildGuidelines(b: ResolvedBrand, t: TokenModel, assets: AssetIndex, r: Renderer, outDir: string) {
  const dir = path.join(outDir, "guidelines");
  const rel = (p: string) => `../${p}`;
  const has = async (p: string) => exists(path.join(outDir, p));
  const s = b.strategy;
  const P = b.profile;
  const bg = b.roles.background;
  const fg = b.roles.foreground;
  const accent = b.monochrome ? fg : b.roles.primary;
  const inv = b.scheme === "dark" ? b.roles.surface : b.roles.inverseBackground;
  const invFg = readableOn(inv, [b.roles.inverseForeground, "#ffffff"]);
  const names = s.colorNames ?? {};

  const nav = ["Overview", "Logo", "Color", "Typography", "Layout", "Components", "Iconography", "Imagery", "Motion", "Voice", "Patterns", "Applications", "Downloads"];
  const section = (id: string, num: number, title: string, lead: string, body: string, opts: { invert?: boolean } = {}) => `
<section id="${id.toLowerCase()}" class="sec${opts.invert ? " inv" : ""}">
  <div class="sec-head"><span class="num">${String(num).padStart(2, "0")}</span><h2>${esc(title)}</h2><p class="lead">${lead}</p></div>
  ${body}
</section>`;

  // ---------------- Overview
  const pers = s.personality?.traits?.length
    ? `<div class="traits">${s.personality.traits.map((x) => `<div class="trait"><div class="t-yes">${esc(x.trait)}</div><div class="t-no">not ${esc(x.notThis.toLowerCase())}</div>${x.description ? `<p>${esc(x.description)}</p>` : ""}</div>`).join("")}</div>`
    : `<ul class="obs">${observedPersonality(b).map((o) => `<li>${esc(o)}</li>`).join("")}</ul>`;
  const overview = section(
    "Overview",
    1,
    "Overview",
    esc(s.company?.oneLiner ?? P.identity.description ?? b.tagline),
    `<div class="grid2">
      <div>
        ${s.positioning?.statement ? `<p class="statement">${esc(s.positioning.statement)}</p>` : ""}
        <dl class="facts">
          <dt>Category</dt><dd>${esc(s.company?.category ?? P.company.categories.map((c) => c.name).join(", "))}</dd>
          <dt>Model</dt><dd>${esc(String(s.company?.businessModel ?? P.company.model.guess))} · ${esc(P.company.motion)}</dd>
          ${s.company?.audience?.primary ? `<dt>Audience</dt><dd>${esc(s.company.audience.primary)}</dd>` : ""}
          ${P.company.customers.length ? `<dt>Customers</dt><dd>${esc(P.company.customers.slice(0, 10).join(", "))}</dd>` : ""}
          ${P.company.stats.length ? `<dt>Proof</dt><dd>${esc(P.company.stats.slice(0, 4).join(" · "))}</dd>` : ""}
        </dl>
      </div>
      <div><h3 class="kicker">Personality</h3>${pers}</div>
    </div>
    ${s.positioning?.pillars?.length ? `<div class="pillars">${s.positioning.pillars.map((p, i) => `<div class="pillar"><span class="mono">0${i + 1}</span><h4>${esc(p.name)}</h4><p>${esc(p.description)}</p></div>`).join("")}</div>` : ""}
    <h3 class="kicker">The rules</h3>
    <ol class="rules">${hardRules(b).map((x) => `<li>${mdInline(x.text)}</li>`).join("")}</ol>`,
  );

  // ---------------- Logo
  const logoTiles: [string, string, string][] = [
    ["Primary", b.scheme === "light" ? bg : "#ffffff", ""],
    ["Reversed", inv, "#ffffff"],
    ...(b.monochrome ? [] : ([["On primary", b.roles.primary, readableOn(b.roles.primary, [b.roles.primaryForeground, "#ffffff"])]] as [string, string, string][])),
    ["On gradient", `linear-gradient(120deg, ${b.gradient.join(",")})`, "#ffffff"],
  ];
  const markSvg = (await has("logo/svg/mark.svg")) ? await readFile(path.join(outDir, "logo/svg/mark.svg"), "utf8") : undefined;
  const logoBody = `
    <div class="logo-hero">${logoMarkup(b, { on: bg, height: 96 })}</div>
    <div class="tiles">${logoTiles.map(([n, tbg, col]) => `<figure class="tile" style="background:${tbg}">${logoMarkup(b, { on: tbg.startsWith("#") ? tbg : b.gradient[0], height: 44, color: (col || undefined) as string | undefined })}<figcaption style="color:${tbg.startsWith("#") ? readableOn(tbg, [fg, "#ffffff"]) : "#fff"}">${n}</figcaption></figure>`).join("")}</div>
    <div class="grid2" style="margin-top:48px">
      <div><h3 class="kicker">Clear space</h3><div class="clearspace">${logoMarkup(b, { on: bg, height: 56 })}</div><p class="small">${esc(s.logo?.clearspace ?? "Keep clear space equal to the cap-height of the wordmark on all sides.")}</p></div>
      <div><h3 class="kicker">Mark</h3><div class="markbox">${markSvg ? fluidSvg(markSvg, 'style="width:120px;height:120px"') : "—"}</div><p class="small">${assets.markSource === "split" ? "Split automatically from the lockup." : assets.markSource === "monogram" ? "Derived monogram — the brand has no standalone symbol." : `From the site's ${assets.markSource}.`} Minimum size: ${esc(s.logo?.minSize ?? "16px")}.</p></div>
    </div>
    <h3 class="kicker">Misuse</h3>
    <div class="misuse">${misuse(b)}</div>`;

  // ---------------- Color
  const roles: [string, string, string][] = t.colors.map(([k, v, d]) => [k, v, d ?? ""]);
  const big = roles.filter(([k]) => ["primary", "foreground", "background", "accent", "inverse-background"].includes(k));
  const colorBody = `
    <div class="ratio">${colorRatio(b).map((x, i) => `<div style="flex:${Math.max(x.percent, 2)};background:${[b.scheme === "dark" ? bg : bg, fg, b.roles.primary, b.roles.accent[0] ?? b.roles.primary][i]}" title="${esc(x.name)} ${x.percent}%"><span style="color:${readableOn([bg, fg, b.roles.primary, b.roles.accent[0] ?? b.roles.primary][i])}">${esc(x.name)} · ${x.percent}%</span></div>`).join("")}</div>
    <div class="bigsw">${big.map(([k, v]) => swatchCard(k, v, names[v], true)).join("")}</div>
    <div class="smallsw">${roles.filter(([k]) => !big.some(([bk]) => bk === k)).map(([k, v]) => swatchCard(k, v, names[v], false)).join("")}</div>
    <h3 class="kicker">Scales</h3>
    <div class="ramps">${Object.entries(b.ramps).map(([k, rr]) => `<div class="ramp"><span class="rl">${esc(k)}</span>${Object.entries(rr.steps).map(([st, v]) => `<div class="st" style="background:${v};color:${readableOn(v, ["#fff", "#0a0a0a"])}"><b>${st}${st === rr.pinned ? " ●" : ""}</b><span>${v}</span></div>`).join("")}</div>`).join("")}</div>
    <h3 class="kicker">Contrast</h3>
    <div class="contrast">${P.colors.contrast.map((c) => `<div class="cpair" style="background:${c.bg};color:${c.fg}"><b>Aa</b><span>${c.ratio}:1 · Lc ${Math.abs(c.apca)}</span><em>${c.aaa ? "AAA" : c.aa ? "AA" : c.aaLarge ? "AA Large" : "Fail"}</em></div>`).join("")}</div>
    ${b.gradient.length ? `<h3 class="kicker">Gradient</h3><div class="gradbar" style="background:linear-gradient(120deg,${b.gradient.join(",")})"></div><p class="small mono">${b.gradient.join(" → ")}${b.gradientIsCaptured ? " · measured on site" : " · derived"}</p>` : ""}`;

  // ---------------- Typography
  const typeBody = `
    <div class="spec">
      <div class="aa" style="font-family:var(--font-display);font-weight:${b.type.h1.weight};letter-spacing:${Math.min(b.type.h1.letterSpacing, -0.02)}em">Aa</div>
      <div><div class="famname">${esc(b.fonts.display.family)}${b.fonts.body.family !== b.fonts.display.family ? ` <span class="muted">+ ${esc(b.fonts.body.family)}</span>` : ""}</div>
      <div class="glyphs" style="font-family:var(--font-display)">ABCDEFGHIJKLMNOPQRSTUVWXYZ<br>abcdefghijklmnopqrstuvwxyz<br>0123456789 &amp;@#%?!—“”</div>
      <p class="small">${P.typography.families.map((f) => `${esc(f.family)} (${f.weights.join(", ")}) — ${f.source}${f.alternatives.length ? `; open alternative: ${esc(f.alternatives[0])}` : ""}`).join("<br>")}</p></div>
    </div>
    <div class="scale">${Object.values(b.type).map((st) => `<div class="srow"><div class="smeta mono">${st.name}<br>${st.size}/${st.lineHeight} · ${st.weight}${st.letterSpacing ? ` · ${st.letterSpacing.toFixed(3)}em` : ""}</div><div class="ssample" style="${typeStyle(b, st.name, st.size > 64 ? 64 / st.size : 1)}">${esc(clip(st.sample || b.copy.headline, st.size > 30 ? 46 : 110))}</div></div>`).join("")}</div>`;

  // ---------------- Layout
  const sp = P.spacing;
  const layoutBody = `
    <div class="spacing">${sp.scale.filter((v) => v <= 160).map((v) => `<div class="sp"><div class="bar" style="width:${v}px;height:${v}px"></div><span class="mono">${v}</span></div>`).join("")}</div>
    <dl class="facts" style="margin-top:40px">
      <dt>Max width</dt><dd>${P.layout.maxWidth}px</dd><dt>Grid</dt><dd>${P.layout.gridColumns.join(", ") || "—"} columns · ${P.layout.gutter}px gutter</dd>
      <dt>Breakpoints</dt><dd>${P.layout.breakpoints.join(" · ") || "—"}</dd><dt>Rhythm</dt><dd>${P.layout.density} · ${P.layout.alignment}</dd>
      <dt>Radii</dt><dd>${P.shape.radii.map((x) => `<span class="rad" style="border-radius:${x.value}"></span>${x.name} ${x.value}`).join(" &nbsp; ")}</dd>
    </dl>
    ${P.shape.shadows.length ? `<div class="shadows">${P.shape.shadows.slice(0, 5).map((x) => `<div class="shadow" style="box-shadow:${x.value}"><span class="mono">${x.name}</span></div>`).join("")}</div>` : ""}
    ${(await has("captured/screenshots/home-desktop.png")) ? `<div class="shots"><figure><img src="${rel("captured/screenshots/home-desktop.png")}" alt="Desktop"><figcaption>Desktop · ${esc(b.domain)}</figcaption></figure>${(await has("captured/screenshots/home-mobile.png")) ? `<figure class="mob"><img src="${rel("captured/screenshots/home-mobile.png")}" alt="Mobile"><figcaption>Mobile</figcaption></figure>` : ""}</div>` : ""}`;

  // ---------------- Components
  const comps = P.components;
  const compBody = `
    <div class="comp-grid">${comps.buttons.slice(0, 6).map((c) => `<figure class="comp">${c.screenshot ? `<img src="${rel(c.screenshot)}" alt="">` : ""}<figcaption><b>${esc(c.variant)}</b> · “${esc(c.text)}”${c.hover ? `<br><span class="mono small">hover: ${esc(Object.entries(c.hover).map(([k, v]) => `${k}: ${v}`).join("; ").slice(0, 120))}</span>` : ""}</figcaption></figure>`).join("")}</div>
    <div class="comp-grid">${[...comps.cards.slice(0, 2), ...comps.inputs.slice(0, 1), ...comps.badges.slice(0, 2)].filter((c) => c.screenshot).map((c) => `<figure class="comp"><img src="${rel(c.screenshot!)}" alt=""><figcaption><b>${c.kind}</b> · ${esc(c.variant)}</figcaption></figure>`).join("")}</div>
    ${comps.nav?.screenshot ? `<figure class="wide"><img src="${rel(comps.nav.screenshot)}" alt=""><figcaption>Navigation</figcaption></figure>` : ""}`;

  // ---------------- Iconography
  const icons = P.icons.items.filter((i) => !i.path.includes("/social/")).slice(0, 48);
  const iconSvgs = await Promise.all(icons.map(async (i) => (await exists(path.join(outDir, i.path))) ? recolorSvg(await readFile(path.join(outDir, i.path), "utf8"), fg).replace(/fill="[^"]*"(?=[^>]*stroke=)/, 'fill="none"') : ""));
  const iconBody = icons.length
    ? `<p class="small">${P.icons.style.dominant} · ${P.icons.style.strokeWidth ? `${P.icons.style.strokeWidth}px stroke · ` : ""}${P.icons.style.grid ? `${P.icons.style.grid}px grid · ` : ""}${P.icons.library ?? "custom set"}</p><div class="icons">${iconSvgs.map((svg, i) => (svg ? `<div class="icon" title="${esc(icons[i].label ?? "")}">${fluidSvg(svg, 'style="width:24px;height:24px"')}</div>` : "")).join("")}</div>`
    : `<p class="small">No inline icons were found on the site.</p>`;

  // ---------------- Imagery
  const imgs = P.imagery.images.filter((i) => i.path && i.kind !== "logo" && i.kind !== "icon").slice(0, 9);
  const imageryBody = `
    ${s.visual?.imagery ? `<p>${esc(s.visual.imagery)}</p>` : ""}
    <div class="masonry">${imgs.map((i) => `<figure><img src="${rel(i.path!)}" alt="${esc(i.alt)}" loading="lazy"><figcaption>${i.kind}</figcaption></figure>`).join("")}</div>
    ${P.media.canvases.filter((c) => c.recording).length ? `<h3 class="kicker">Live surfaces</h3><div class="grid2">${P.media.canvases.filter((c) => c.recording).slice(0, 2).map((c) => `<video src="${rel(c.recording!)}" autoplay loop muted playsinline></video>`).join("")}</div>` : ""}
    ${P.imagery.customerLogos.length ? `<h3 class="kicker">Customers shown</h3><div class="custlogos">${P.imagery.customerLogos.filter((c) => c.path).slice(0, 16).map((c) => `<img src="${rel(c.path!)}" alt="${esc(c.name)}" title="${esc(c.name)}">`).join("")}</div>` : ""}`;

  // ---------------- Motion
  const motionBody = `
    <div class="grid2"><div>
      <dl class="facts"><dt>Intensity</dt><dd>${P.motion.intensity}</dd><dt>Fast</dt><dd>${b.motion.fast}ms</dd><dt>Base</dt><dd>${b.motion.base}ms</dd><dt>Slow</dt><dd>${b.motion.slow}ms</dd><dt>Standard</dt><dd class="mono">${esc(b.motion.standard)}</dd><dt>Entrance</dt><dd class="mono">${esc(b.motion.entrance)}</dd>${P.motion.libraries.length ? `<dt>Stack</dt><dd>${esc(P.motion.libraries.join(", "))}</dd>` : ""}</dl>
      ${s.motion?.principles?.length ? `<ul class="obs">${s.motion.principles.map((p) => `<li><b>${esc(p.name)}</b> — ${esc(p.description)}</li>`).join("")}</ul>` : ""}
      <div class="demo"><button class="demo-btn">Hover me</button><div class="demo-card">Reveal</div></div>
    </div><div><img src="${rel("motion/easing-curves.svg")}" alt="Easing curves" style="width:100%"></div></div>
    <div class="videos">${assets.motion.map((m) => `<figure><video src="${rel(`motion/${m.name}.${m.name === "loader" ? "webm" : "mp4"}`)}" poster="${rel(`motion/${m.name}-poster.png`)}" autoplay loop muted playsinline></video><figcaption><b>${esc(m.title)}</b><br><span class="small">${esc(m.description)}</span></figcaption></figure>`).join("")}</div>`;

  // ---------------- Voice
  const v = P.voice;
  const voiceBody = `
    ${s.voice?.summary ? `<p class="statement">${esc(s.voice.summary)}</p>` : ""}
    ${s.voice?.principles?.length ? `<div class="pillars">${s.voice.principles.map((p) => `<div class="pillar"><h4>${esc(p.name)}</h4><p>${esc(p.description)}</p>${p.do ? `<p class="do">✓ ${esc(p.do)}</p>` : ""}${p.dont ? `<p class="dont">✗ ${esc(p.dont)}</p>` : ""}</div>`).join("")}</div>` : ""}
    <div class="grid2"><div><h3 class="kicker">In their words</h3><div class="quotes">${v.headlines.slice(0, 6).map((h) => `<blockquote>${esc(h)}</blockquote>`).join("")}</div></div>
    <div><h3 class="kicker">Mechanics</h3><dl class="facts"><dt>Case</dt><dd>${v.stats.headingCase}</dd><dt>Headline</dt><dd>${v.stats.avgHeadlineWords} words avg</dd><dt>Sentence</dt><dd>${v.stats.avgSentenceLength} words avg</dd><dt>Grade</dt><dd>${v.stats.readingGrade}</dd><dt>You / We</dt><dd>${v.stats.secondPerson} / ${v.stats.firstPersonPlural} per 100</dd><dt>Exclamations</dt><dd>${v.stats.exclamationRate ? v.stats.exclamationRate : "never"}</dd><dt>CTAs</dt><dd>${esc(v.ctas.slice(0, 6).join(" · "))}</dd></dl></div></div>
    ${s.voice?.examples?.length ? `<table class="rewrites"><thead><tr><th>Context</th><th>On brand</th><th>Off brand</th></tr></thead><tbody>${s.voice.examples.map((e) => `<tr><td>${esc(e.context)}</td><td>${esc(e.onBrand)}</td><td>${esc(e.offBrand ?? "")}</td></tr>`).join("")}</tbody></table>` : ""}
    <h3 class="kicker">Never</h3><ul class="obs dont">${antiSlop(b).map((x) => `<li>${esc(x)}</li>`).join("")}</ul>`;

  // ---------------- Patterns
  const patternsBody = `<div class="pgrid">${assets.patterns.map((p) => `<figure><img src="${rel(`patterns/${p.name}.png`)}" alt="${esc(p.title)}" loading="lazy"><figcaption><b>${esc(p.title)}</b>${p.derived ? ' <span class="tag">derived</span>' : ""}<br><span class="small">${esc(p.description)}</span></figcaption></figure>`).join("")}</div>`;

  // ---------------- Applications
  const appsBody = `<div class="pgrid apps">${assets.social.map((x) => `<figure><img src="${rel(`social/${x.name}.png`)}" alt="${esc(x.title)}" loading="lazy"><figcaption><b>${esc(x.title)}</b><br><span class="small">${esc(x.use)}</span></figcaption></figure>`).join("")}
    ${["business-card-front", "business-card-back", "video-call-background", "email-signature"].map((n) => `<figure><img src="${rel(`templates/${n}.png`)}" alt="" loading="lazy"><figcaption><b>${n.replace(/-/g, " ")}</b></figcaption></figure>`).join("")}</div>`;

  // ---------------- Downloads
  const dl: [string, string][] = [
    ["WATERCOLOR.md", "WATERCOLOR.md"],
    ["Design tokens (DTCG)", "tokens/tokens.json"],
    ["CSS variables", "tokens/tokens.css"],
    ["Tailwind v4 theme", "tokens/tailwind.css"],
    ["Figma (Tokens Studio)", "tokens/tokens.figma.json"],
    ["Adobe swatches (.ase)", "colors/palette.ase"],
    ["Logo SVG", "logo/svg/logo.svg"],
    ["Favicon set", "logo/favicon/head.html"],
    ["Slide template (PDF)", "templates/slides.pdf"],
    ["Motion CSS", "motion/motion.css"],
  ];
  const dlBody = `<div class="dl">${dl.map(([n, p]) => `<a href="${rel(p)}" download><span>${esc(n)}</span><span class="mono small">${esc(p)}</span></a>`).join("")}</div>`;

  const sections = [
    overview,
    section("Logo", 2, "Logo", "The primary signature and how to use it.", logoBody),
    section("Color", 3, "Color", b.monochrome ? "A monochrome palette — contrast does the work." : `${esc(names[b.roles.primary] ?? describeColor(b.roles.primary))} leads; neutrals carry the page.`, colorBody),
    section("Typography", 4, "Typography", `${esc(b.fonts.display.family)} sets the tone.`, typeBody),
    section("Layout", 5, "Layout & space", `A ${P.spacing.base}px system, ${P.layout.maxWidth}px measure, ${P.shape.language} corners.`, layoutBody),
    section("Components", 6, "Components", "Captured from the live product, hover states included.", compBody),
    section("Iconography", 7, "Iconography", "How the brand draws small things.", iconBody),
    section("Imagery", 8, "Imagery & media", "What the brand shows, and how.", imageryBody),
    section("Motion", 9, "Motion", "Timing and curves measured on the live site.", motionBody, { invert: false }),
    section("Voice", 10, "Voice", "How the brand sounds.", voiceBody),
    section("Patterns", 11, "Patterns", "Textures built from the brand's own color and geometry.", patternsBody),
    section("Applications", 12, "Applications", "Ready-to-use templates.", appsBody),
    section("Downloads", 13, "Downloads", "Everything in this kit.", dlBody),
  ];

  const css = `
${brandVars(b, t)}
*{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth;scroll-padding-top:24px}
body{background:${bg};color:${fg};font-family:var(--font-body);font-size:${b.type.body.size}px;line-height:${b.type.body.lineHeight};-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility}
a{color:inherit}
img,video{max-width:100%;display:block}
.mono{font-family:var(--font-mono);font-size:.86em}
.small{font-size:.86em;color:${b.roles.muted}}
.muted{color:${b.roles.muted}}
.layout{display:grid;grid-template-columns:240px 1fr;min-height:100vh}
aside{position:sticky;top:0;height:100vh;padding:32px 28px;border-right:1px solid ${b.roles.border};display:flex;flex-direction:column;gap:28px;background:${bg}}
aside nav{display:flex;flex-direction:column;gap:2px}
aside nav a{text-decoration:none;color:${b.roles.muted};padding:6px 10px;border-radius:${b.radius.sm}px;transition:background var(--duration-fast) var(--ease-standard),color var(--duration-fast) var(--ease-standard);font-size:14px}
aside nav a:hover{background:${b.roles.surface};color:${fg}}
aside .meta{margin-top:auto;font-size:12px;color:${b.roles.subtle}}
main{min-width:0}
.cover{position:relative;min-height:88vh;display:flex;flex-direction:column;justify-content:flex-end;padding:72px 80px;overflow:hidden;background:${inv};color:${invFg}}
.cover .art{position:absolute;inset:0;background:${(await has("patterns/mesh-gradient.png")) ? `url(${rel("patterns/mesh-gradient.png")}) center/cover` : `linear-gradient(120deg,${b.gradient.join(",")})`};opacity:.95}
.cover video{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.cover .shade{position:absolute;inset:0;background:linear-gradient(180deg,transparent 30%,${inv}ee 92%)}
.cover .inner{position:relative}
.cover h1{${typeStyle(b, "display", 1)};font-size:clamp(48px,7vw,${Math.max(88, b.type.display.size)}px);max-width:1100px;text-wrap:balance;margin:28px 0 18px}
.cover p{font-size:20px;max-width:640px;opacity:.85}
.sec{padding:112px 80px;border-bottom:1px solid ${b.roles.border}}
.sec.inv{background:${inv};color:${invFg}}
.sec-head{display:grid;grid-template-columns:80px 1fr;column-gap:24px;margin-bottom:56px}
.sec-head .num{font-family:var(--font-mono);color:${accent};padding-top:14px}
.sec-head h2{${typeStyle(b, "h1", 1)};font-size:clamp(36px,4vw,${Math.min(64, b.type.h1.size)}px)}
.sec-head .lead{grid-column:2;font-size:20px;color:${b.roles.muted};max-width:720px;margin-top:12px;text-wrap:pretty}
.kicker{${typeStyle(b, "eyebrow", 1)};color:${b.roles.muted};margin:56px 0 18px}
.grid2{display:grid;grid-template-columns:1fr 1fr;gap:56px}
.statement{${typeStyle(b, "h3", 1)};line-height:1.35;margin-bottom:32px;text-wrap:pretty}
.facts{display:grid;grid-template-columns:140px 1fr;gap:10px 20px}
.facts dt{color:${b.roles.subtle};font-size:14px}
.facts dd{font-size:15px}
.traits{display:grid;grid-template-columns:1fr 1fr;gap:18px}
.trait{padding:20px;border:1px solid ${b.roles.border};border-radius:${b.radius.card}}
.t-yes{${typeStyle(b, "h4", 1)}}.t-no{color:${b.roles.subtle};font-size:14px;margin-bottom:6px}.trait p{font-size:14px;color:${b.roles.muted}}
.obs{list-style:none;display:flex;flex-direction:column;gap:10px}.obs li{padding-left:18px;position:relative}.obs li:before{content:"";position:absolute;left:0;top:.65em;width:8px;height:2px;background:${accent}}
.obs.dont li:before{background:${b.roles.danger ?? "#e5484d"}}
.rules{counter-reset:r;list-style:none;display:grid;grid-template-columns:1fr 1fr;gap:16px 40px}
.rules li{counter-increment:r;position:relative;padding:18px 0 0;border-top:1px solid ${b.roles.border};font-size:15px}
.rules li:before{content:counter(r,decimal-leading-zero);font-family:var(--font-mono);font-size:12px;color:${accent};display:block;margin-bottom:6px}
.rules code{font-family:var(--font-mono);font-size:.85em;background:${b.roles.surface};padding:1px 5px;border-radius:4px}
.pillars{display:grid;grid-template-columns:repeat(3,1fr);gap:32px;margin-top:48px}
.pillar{border-top:2px solid ${accent};padding-top:18px}.pillar h4{${typeStyle(b, "h4", 1)};margin:8px 0}.pillar p{color:${b.roles.muted};font-size:15px}
.do{color:${b.roles.success ?? accent}}.dont{color:${b.roles.danger ?? "#e5484d"}}
.logo-hero{padding:96px;display:grid;place-items:center;background:${b.roles.surface};border-radius:${b.radius.card}}
.tiles{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-top:16px}
.tile{aspect-ratio:4/3;display:grid;place-items:center;border-radius:${b.radius.card};position:relative;box-shadow:inset 0 0 0 1px ${mix(fg, bg, 0.9)}}
.tile figcaption{position:absolute;left:16px;bottom:12px;font-size:12px;opacity:.8}
.clearspace{display:inline-block;padding:56px;background:repeating-linear-gradient(45deg,${mix(accent, bg, 0.92)} 0 6px,transparent 6px 12px);outline:1px dashed ${accent}}
.clearspace .wc-logo{background:${bg};outline:1px solid ${mix(accent, bg, 0.6)}}
.markbox{width:200px;height:200px;display:grid;place-items:center;background:${b.roles.surface};border-radius:${b.radius.card}}
.misuse{display:grid;grid-template-columns:repeat(4,1fr);gap:16px}
.mis{aspect-ratio:4/3;background:${b.roles.surface};border-radius:${b.radius.card};display:grid;place-items:center;position:relative;overflow:hidden}
.mis:after{content:"";position:absolute;inset:0;background:linear-gradient(to top right,transparent calc(50% - 1px),${b.roles.danger ?? "#e5484d"} 50%,transparent calc(50% + 1px))}
.mis figcaption{position:absolute;bottom:10px;left:12px;font-size:12px;color:${b.roles.muted}}
.ratio{display:flex;height:72px;border-radius:${b.radius.card};overflow:hidden;box-shadow:inset 0 0 0 1px ${b.roles.border};margin-bottom:32px}
.ratio div{display:flex;align-items:flex-end;padding:10px;font-size:12px;min-width:0;white-space:nowrap;overflow:hidden}
.bigsw{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px}
.smallsw{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:12px;margin-top:16px}
.sw{border-radius:${b.radius.card};overflow:hidden;box-shadow:inset 0 0 0 1px ${b.roles.border}}
.sw .chip{height:140px;padding:14px;display:flex;align-items:flex-end;font-size:13px}
.sw.small .chip{height:80px}
.sw .vals{padding:12px 14px;font-family:var(--font-mono);font-size:11.5px;line-height:1.6;color:${b.roles.muted};background:${bg}}
.sw .vals b{font-family:var(--font-body);font-size:13px;color:${fg};display:block}
.ramps{display:flex;flex-direction:column;gap:6px}
.ramp{display:grid;grid-template-columns:110px repeat(11,1fr);gap:4px}
.rl{font-size:13px;align-self:center;text-transform:capitalize}
.st{height:56px;border-radius:6px;padding:6px 8px;display:flex;flex-direction:column;justify-content:space-between;font-family:var(--font-mono);font-size:10px}
.contrast{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:12px}
.cpair{padding:16px;border-radius:${b.radius.md}px;display:flex;flex-direction:column;gap:4px;box-shadow:inset 0 0 0 1px ${b.roles.border}}
.cpair b{font-family:var(--font-display);font-size:32px;line-height:1}.cpair span{font-family:var(--font-mono);font-size:11px}.cpair em{font-style:normal;font-size:11px;opacity:.8}
.gradbar{height:120px;border-radius:${b.radius.card}}
.spec{display:grid;grid-template-columns:auto 1fr;gap:56px;align-items:end;padding-bottom:40px;border-bottom:1px solid ${b.roles.border}}
.aa{font-size:clamp(160px,18vw,280px);line-height:.8}
.famname{${typeStyle(b, "h3", 1)};margin-bottom:16px}
.glyphs{font-size:28px;line-height:1.4;color:${b.roles.muted};margin-bottom:16px;word-break:break-all}
.srow{display:grid;grid-template-columns:200px 1fr;gap:32px;padding:22px 0;border-bottom:1px solid ${b.roles.border};align-items:baseline}
.smeta{color:${b.roles.subtle};font-size:12px;line-height:1.5}
.ssample{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.spacing{display:flex;align-items:flex-end;gap:20px;flex-wrap:wrap}
.sp{display:flex;flex-direction:column;align-items:center;gap:8px}.sp .bar{background:${mix(accent, bg, 0.75)};outline:1px solid ${mix(accent, bg, 0.4)}}
.rad{display:inline-block;width:22px;height:22px;border:2px solid ${accent};vertical-align:middle;margin-right:6px}
.shadows{display:grid;grid-template-columns:repeat(5,1fr);gap:28px;margin-top:48px;padding:32px;background:${b.roles.surface};border-radius:${b.radius.card}}
.shadow{aspect-ratio:1;background:${bg};border-radius:${b.radius.card};display:grid;place-items:center}
.shots{display:grid;grid-template-columns:1fr 240px;gap:24px;margin-top:56px;align-items:start}
.shots img{border-radius:${b.radius.md}px;box-shadow:0 0 0 1px ${b.roles.border},0 20px 50px -24px rgba(0,0,0,.25)}
.shots figcaption,.comp figcaption,.wide figcaption,.pgrid figcaption,.videos figcaption,.masonry figcaption{font-size:13px;color:${b.roles.muted};margin-top:10px}
.comp-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;margin-bottom:24px}
.comp{padding:20px;background:${b.roles.surface};border-radius:${b.radius.card}}
.comp img{max-height:120px;object-fit:contain;margin:0 auto}
.wide img{border-radius:${b.radius.md}px;box-shadow:0 0 0 1px ${b.roles.border}}
.icons{display:grid;grid-template-columns:repeat(auto-fill,minmax(64px,1fr));gap:8px;margin-top:20px}
.icon{aspect-ratio:1;display:grid;place-items:center;background:${b.roles.surface};border-radius:${b.radius.md}px;color:${fg}}
.custlogos{display:flex;flex-wrap:wrap;gap:40px 56px;align-items:center;padding:32px;background:${b.roles.surface};border-radius:${b.radius.card}}.custlogos img{height:28px;width:auto;max-width:140px;object-fit:contain;filter:grayscale(1);opacity:.75}
.masonry{columns:3;column-gap:16px}.masonry figure{break-inside:avoid;margin-bottom:16px}.masonry img{border-radius:${b.radius.md}px}
.videos{display:grid;grid-template-columns:repeat(2,1fr);gap:24px;margin-top:48px}
.videos video,.grid2 video{border-radius:${b.radius.card};width:100%;background:${b.roles.surface}}
.demo{display:flex;gap:16px;margin-top:32px;align-items:center}
.demo-btn{font:inherit;font-weight:500;padding:10px 18px;border:0;border-radius:${b.radius.button};background:${accent};color:${readableOn(accent, [b.roles.primaryForeground, "#fff"])};cursor:pointer;transition:transform var(--duration-base) var(--ease-standard),box-shadow var(--duration-base) var(--ease-standard)}
.demo-btn:hover{transform:translateY(-2px);box-shadow:0 10px 24px -10px ${accent}}
.demo-card{padding:10px 18px;border:1px solid ${b.roles.border};border-radius:${b.radius.md}px;animation:wcin var(--duration-slow) var(--ease-entrance) infinite alternate}
@keyframes wcin{from{opacity:.2;transform:translateY(10px)}to{opacity:1;transform:none}}
.quotes blockquote{${typeStyle(b, "h4", 1)};padding:14px 0;border-bottom:1px solid ${b.roles.border};text-wrap:balance}
.rewrites{width:100%;border-collapse:collapse;margin-top:40px;font-size:15px}.rewrites th{text-align:left;font-weight:500;color:${b.roles.subtle};padding:10px;border-bottom:1px solid ${b.roles.border}}.rewrites td{padding:14px 10px;border-bottom:1px solid ${b.roles.border};vertical-align:top}
.pgrid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px}
.pgrid img{border-radius:${b.radius.md}px;box-shadow:0 0 0 1px ${b.roles.border};width:100%;aspect-ratio:16/9;object-fit:cover}
.apps img{aspect-ratio:auto;object-fit:contain;background:${b.roles.surface}}
.tag{font-size:11px;padding:2px 8px;border-radius:99px;background:${b.roles.surface};color:${b.roles.muted}}
.dl{display:grid;grid-template-columns:repeat(2,1fr);gap:12px}
.dl a{display:flex;justify-content:space-between;align-items:center;padding:18px 20px;border:1px solid ${b.roles.border};border-radius:${b.radius.md}px;text-decoration:none;transition:border-color var(--duration-fast) var(--ease-standard),background var(--duration-fast) var(--ease-standard)}
.dl a:hover{border-color:${accent};background:${b.roles.surface}}
footer{padding:48px 80px;color:${b.roles.subtle};font-size:13px;display:flex;justify-content:space-between}
@media (max-width:960px){.layout{grid-template-columns:1fr}aside{display:none}.sec{padding:72px 24px}.cover{padding:48px 24px}.grid2,.pillars,.rules,.tiles,.misuse,.comp-grid,.pgrid,.videos,.shadows,.dl,.traits{grid-template-columns:1fr}.ramp{grid-template-columns:repeat(6,1fr)}.ramp .rl{grid-column:1/-1}.srow{grid-template-columns:1fr}.masonry{columns:1}.shots{grid-template-columns:1fr}.spec{grid-template-columns:1fr}}
@media print{aside{display:none}.layout{grid-template-columns:1fr}.sec{break-inside:avoid-page;padding:56px 48px}.cover{min-height:100vh;break-after:page}video{display:none}@page{size:1440px 900px;margin:0}}
@media (prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}
`;

  const sigCanvas = P.media.canvases.filter((c) => c.recording && c.poster === b.signatureArt)[0];
  const coverVideo = sigCanvas
    ? `<video src="${rel(sigCanvas.recording!)}" autoplay loop muted playsinline poster="${rel(sigCanvas.poster!)}" style="object-fit:cover;object-position:right center"></video>`
    : (await has("motion/gradient-loop.mp4")) ? `<video src="${rel("motion/gradient-loop.mp4")}" autoplay loop muted playsinline poster="${rel("motion/gradient-loop-poster.png")}"></video>` : "";
  const body = `<div class="layout">
<aside>${logoMarkup(b, { on: bg, height: 26 })}<nav>${nav.map((n) => `<a href="#${n.toLowerCase()}">${n}</a>`).join("")}</nav><div class="meta">Brand guidelines<br>Generated by <a href="https://github.com/rayhankhilji/watercolor">watercolor</a><br>${P.generatedAt.slice(0, 10)}</div></aside>
<main>
<header class="cover"><div class="art"></div>${coverVideo}<div class="shade"></div><div class="inner">${logoMarkup(b, { on: inv, height: 40, color: invFg })}<h1>${esc(clip(firstSentence(b.copy.taglines[0] ?? b.copy.headline), 90))}</h1><p>Brand guidelines · ${esc(b.domain)}</p></div></header>
${sections.join("\n")}
<footer><span>${esc(b.name)} brand guidelines</span><span>Made with watercolor</span></footer>
</main></div>`;

  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(b.name)} — Brand guidelines</title><style>${fontFaces(b, "relative", dir)}\n${css}</style></head><body>${body}</body></html>`;
  const file = await write(path.join(dir, "index.html"), html);
  // PDF: render from the same directory so relative links resolve.
  const pdfPath = path.join(dir, "brand-book.pdf");
  try {
    await r.pdf(html, pdfPath, { width: "1440px", height: "900px", name: path.join(dir, ".print") });
  } catch {
    /* PDF is best-effort */
  } finally {
    await rm(path.join(dir, ".print.html"), { force: true });
  }
  return [file, pdfPath];
}

function swatchCard(k: string, v: string, name: string | undefined, big: boolean) {
  const tc = readableOn(v, ["#ffffff", "#0a0a0a"]);
  return `<div class="sw${big ? "" : " small"}"><div class="chip" style="background:${v};color:${tc}">${esc(name ?? describeColor(v))}</div><div class="vals"><b>${esc(k)}</b>${v.toUpperCase()}<br>${rgbCss(v)}<br>${oklchCss(v)}<br>${contrast(tc, v)}:1 with ${tc === "#ffffff" ? "white" : "black"}</div></div>`;
}

function misuse(b: ResolvedBrand) {
  const l = (style: string) => `<div style="${style}">${logoMarkup(b, { on: b.roles.surface, height: 40 })}</div>`;
  return [
    [l("transform:scaleX(1.5)"), "Don't stretch"],
    [l("transform:rotate(-12deg)"), "Don't rotate"],
    [l(`filter:drop-shadow(0 6px 8px rgba(0,0,0,.5))`), "Don't add effects"],
    [`<div style="filter:hue-rotate(140deg) saturate(2)">${logoMarkup(b, { on: b.roles.surface, height: 40, color: isDark(b.roles.surface) ? "#ffcc00" : "#ff3d7f" })}</div>`, "Don't recolor"],
  ]
    .map(([inner, cap]) => `<figure class="mis">${inner}<figcaption>${cap}</figcaption></figure>`)
    .join("");
}

function mdInline(s: string) {
  return esc(s)
    .replace(/\*\*(.+?)\*\*/g, "<b>$1</b>")
    .replace(/`([^`]+)`/g, "<code>$1</code>");
}

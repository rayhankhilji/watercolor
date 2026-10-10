import path from "node:path";
import type { ResolvedBrand } from "../../profile/resolve.js";
import type { Hex } from "../../profile/schema.js";
import type { Renderer } from "../../render/renderer.js";
import { write } from "../../util/fs.js";
import { hexToRgb, readableOn, isDark, mix } from "../../util/color.js";
import { esc, firstSentence, typeStyle, clip } from "../html.js";
import { logoMarkup, fluidSvg, recolorSvg } from "../assets/logo.js";
import { paletteForArt } from "../assets/patterns.js";
import { log } from "../../util/log.js";

export interface MotionOptions {
  fps: number;
  fast: boolean;
}

interface Comp {
  name: string;
  title: string;
  description: string;
  w: number;
  h: number;
  durationMs: number;
  transparent?: boolean;
  /** Selector of a WebGL canvas to read frames from directly (fast path). */
  canvas?: string;
  html: string;
}

const base = (b: ResolvedBrand, fontCss: string, vars: string, w: number, h: number, bg: string, color: string, css: string, body: string, script: string) => `<!doctype html><html><head><meta charset="utf-8"><style>
${fontCss}${vars}
*{box-sizing:border-box;margin:0}
html,body{width:${w}px;height:${h}px;overflow:hidden}
body{background:${bg};color:${color};font-family:var(--font-body);-webkit-font-smoothing:antialiased}
${css}</style></head><body>${body}<script>${script}</script></body></html>`;

/** Generic stagger-in for every drawable inside the logo (left-to-right, like ink being laid down). */
const LOGO_REVEAL_SCRIPT = (ease: string, dur: number, stagger: number, delay: number, rise: string) => `
(() => {
  const svg = document.querySelector('.wc-logo svg');
  if (!svg) { const l = document.querySelector('.wc-logo'); l && l.animate([{opacity:0,transform:'translateY(24px)'},{opacity:1,transform:'none'}],{duration:${dur},delay:${delay},easing:'${ease}',fill:'both'}); return; }
  const shapes = [...svg.querySelectorAll('path,circle,rect,ellipse,polygon,polyline,line,text,use')].filter(e => !e.closest('defs,clipPath,mask,symbol,pattern'));
  shapes.sort((a, b) => a.getBoundingClientRect().left - b.getBoundingClientRect().left);
  shapes.forEach((el, i) => {
    el.style.transformBox = 'fill-box';
    el.style.transformOrigin = '50% 100%';
    el.animate([{ opacity: 0, transform: '${rise}' }, { opacity: 1, transform: 'none' }], { duration: ${dur}, delay: ${delay} + i * ${stagger}, easing: '${ease}', fill: 'both' });
  });
})();`;

export function compositions(b: ResolvedBrand, fontCss: string, vars: string, o: MotionOptions): Comp[] {
  const comps: Comp[] = [];
  const bg = b.roles.background;
  const fg = b.roles.foreground;
  const intensity = b.profile.motion.intensity;
  const expressive = intensity === "expressive" || intensity === "cinematic";
  const ease = b.motion.entrance;
  const dur = expressive ? 900 : 700;
  const stagger = expressive ? 45 : 25;
  const rise = expressive ? "translateY(70%) scale(0.92)" : "translateY(28%)";
  const scale = o.fast ? 0.5 : 1;
  const W = Math.round(1920 * scale);
  const H = Math.round(1080 * scale);

  // 1. Logo reveal — 16:9 and 1:1
  for (const [suffix, w, h] of [["", W, H], ["-square", Math.round(1080 * scale), Math.round(1080 * scale)]] as const) {
    const logoH = Math.round((w > h ? 150 : 130) * scale);
    comps.push({
      name: `logo-reveal${suffix}`,
      title: `Logo reveal${suffix ? " (1:1)" : " (16:9)"}`,
      description: `Glyph-by-glyph ${expressive ? "rise with scale" : "rise"} on the brand's entrance curve (${ease}), ${stagger}ms stagger.`,
      w,
      h,
      durationMs: 3200,
      html: base(
        b, fontCss, vars, w, h, bg, fg,
        `.stage{position:absolute;inset:0;display:grid;place-items:center}.line{position:absolute;left:50%;top:calc(50% + ${logoH * 0.85}px);height:${Math.max(2, Math.round(3 * scale))}px;width:${Math.round(260 * scale)}px;transform:translateX(-50%) scaleX(0);transform-origin:left;background:var(--gradient);border-radius:9px}`,
        `<div class="stage">${logoMarkup(b, { on: bg, height: logoH })}</div>${expressive ? '<div class="line"></div>' : ""}`,
        LOGO_REVEAL_SCRIPT(ease, dur, stagger, 250, rise) +
          (expressive ? `document.querySelector('.line').animate([{transform:'translateX(-50%) scaleX(0)'},{transform:'translateX(-50%) scaleX(1)'}],{duration:${dur},delay:1100,easing:'${b.motion.standard}',fill:'both'});` : ""),
      ),
    });
  }

  // 2. Living gradient — seamless WebGL loop in the brand's colors
  const cols = paletteForArt(b).slice(0, 5);
  const gradCols = cols.length >= 2 ? cols : [cols[0], mix(cols[0], bg, 0.6)];
  const loopMs = 6000;
  const gw = Math.round(1600 * scale);
  const gh = Math.round(900 * scale);
  comps.push({
    name: "gradient-loop",
    title: "Living gradient (seamless loop)",
    description: `${b.gradientIsCaptured ? "The site's own gradient colors" : "The brand's chromatic palette"} flowing through domain-warped noise. Loops perfectly every ${loopMs / 1000}s.`,
    w: gw,
    h: gh,
    durationMs: loopMs,
    canvas: "#c",
    html: base(
      b, fontCss, vars, gw, gh, gradCols[0], fg,
      `canvas{display:block;width:100%;height:100%}.grain{position:absolute;inset:0;opacity:.14;mix-blend-mode:overlay;background:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='240'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")}`,
      // Rendered at half resolution: the field is smooth, so upscaling is invisible and 4× faster.
      `<canvas id="c" width="${Math.round(gw / 2)}" height="${Math.round(gh / 2)}"></canvas><div class="grain"></div>`,
      gradientShaderScript(gradCols, loopMs),
    ),
  });

  // 3. Kinetic headline
  const words = firstSentence(b.copy.taglines[0] ?? b.copy.headline);
  const headline = clip(words, 70);
  const ts = Math.round((headline.length < 30 ? 120 : headline.length < 50 ? 96 : 80) * scale);
  comps.push({
    name: "type-reveal",
    title: "Kinetic headline",
    description: "Word-by-word reveal with blur-to-sharp focus — for launch videos, ads and social cuts.",
    w: W,
    h: H,
    durationMs: 4200,
    html: base(
      b, fontCss, vars, W, H, bg, fg,
      `.t{position:absolute;inset:0;display:flex;align-items:center;padding:0 ${Math.round(160 * scale)}px}
       h1{${typeStyle(b, "h1", 1, { "font-size": `${ts}px`, "line-height": "1.05", "letter-spacing": `${Math.min(b.type.h1.letterSpacing, -0.02)}em` })};text-wrap:balance;max-width:${Math.round(1500 * scale)}px}
       .w{display:inline-block;white-space:pre}`,
      `<div class="t"><h1>${headline.split(/\s+/).map((w) => `<span class="w">${esc(w)} </span>`).join("")}</h1></div>`,
      `document.querySelectorAll('.w').forEach((w,i)=>w.animate([{opacity:0,transform:'translateY(0.35em)',filter:'blur(12px)'},{opacity:1,transform:'none',filter:'blur(0)'}],{duration:${expressive ? 900 : 700},delay:200+i*${expressive ? 90 : 70},easing:'${ease}',fill:'both'}));`,
    ),
  });

  // 4. Loader — mark (or logo) breathing, transparent
  const markSvg = b.logo.markSvg;
  const lw = 512;
  const loaderInner = markSvg ? `<div class="m">${fluidSvg(markSvg, 'style="width:100%;height:100%"')}</div>` : `<div class="m">${logoMarkup(b, { on: bg, height: 80 })}</div>`;
  comps.push({
    name: "loader",
    title: "Loader (transparent)",
    description: "Mark breathing on the brand's standard curve; 1.6s loop. Transparent WebM for apps; GIF fallback.",
    w: lw,
    h: lw,
    durationMs: 1600,
    transparent: true,
    html: base(
      b, fontCss, vars, lw, lw, "transparent", fg,
      `.m{position:absolute;inset:0;margin:auto;width:${markSvg ? 200 : 380}px;height:${markSvg ? 200 : 120}px;display:grid;place-items:center}
       .ring{position:absolute;inset:0;margin:auto;width:340px;height:340px;border-radius:50%;border:6px solid ${b.monochrome ? mix(fg, bg, 0.7) : mix(b.roles.primary, bg, 0.6)};border-top-color:${b.monochrome ? fg : b.roles.primary}}`,
      `<div class="ring"></div>${loaderInner}`,
      `document.querySelector('.m').animate([{transform:'scale(1)',opacity:1},{transform:'scale(0.88)',opacity:.72},{transform:'scale(1)',opacity:1}],{duration:1600,easing:'${b.motion.standard}',iterations:Infinity});
       document.querySelector('.ring').animate([{transform:'rotate(0deg)'},{transform:'rotate(360deg)'}],{duration:1600,easing:'linear',iterations:Infinity});`,
    ),
  });

  // 5. Transition wipe
  const panels: Hex[] = (b.monochrome ? [fg, mix(fg, bg, 0.5), bg] : [b.roles.primary, ...(b.roles.accent.slice(0, 1) as Hex[]), b.roles.inverseBackground]).slice(0, 3);
  comps.push({
    name: "transition-wipe",
    title: "Transition wipe",
    description: "Three brand-color panels sweep across — a cut between scenes in product videos.",
    w: W,
    h: H,
    durationMs: 1600,
    html: base(
      b, fontCss, vars, W, H, bg, fg,
      `.p{position:absolute;inset:0;transform:translateX(-100%)}`,
      panels.map((c) => `<div class="p" style="background:${c}"></div>`).join(""),
      `document.querySelectorAll('.p').forEach((p,i)=>p.animate([{transform:'translateX(-101%)'},{transform:'translateX(0)',offset:.45},{transform:'translateX(0)',offset:.55},{transform:'translateX(101%)'}],{duration:1300,delay:i*80,easing:'${b.motion.standard}',fill:'both'}));`,
    ),
  });

  // 6. End card
  const ebg = b.scheme === "dark" ? bg : b.roles.inverseBackground;
  const efg = readableOn(ebg, [b.roles.inverseForeground, "#ffffff"]);
  const btnBg = b.monochrome ? efg : b.roles.primary;
  comps.push({
    name: "end-card",
    title: "End card",
    description: "Logo, call to action and URL — the closing frame for every video.",
    w: W,
    h: H,
    durationMs: 4000,
    html: base(
      b, fontCss, vars, W, H, ebg, efg,
      `.c{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:${Math.round(56 * scale)}px}
       .cta{${typeStyle(b, "label", 1.8 * scale)};background:${btnBg};color:${readableOn(btnBg, [b.roles.primaryForeground, ebg, "#ffffff"])};padding:${Math.round(26 * scale)}px ${Math.round(48 * scale)}px;border-radius:${b.radius.button}}
       .u{${typeStyle(b, "body", 1.6 * scale)};opacity:.7}`,
      `<div class="c"><div class="l">${logoMarkup(b, { on: ebg, height: Math.round(110 * scale) })}</div><div class="cta">${esc(b.copy.cta)}</div><div class="u">${esc(b.domain)}</div></div>`,
      `const E='${ease}';document.querySelector('.l').animate([{opacity:0,transform:'translateY(30px)'},{opacity:1,transform:'none'}],{duration:800,delay:200,easing:E,fill:'both'});
       document.querySelector('.cta').animate([{opacity:0,transform:'scale(.85)'},{opacity:1,transform:'scale(1)'}],{duration:700,delay:700,easing:'${b.motion.emphasis}',fill:'both'});
       document.querySelector('.u').animate([{opacity:0},{opacity:.7}],{duration:600,delay:1100,easing:E,fill:'both'});`,
    ),
  });
  return comps;
}

function gradientShaderScript(colors: Hex[], loopMs: number) {
  const rgb = colors.map((c) => {
    const { r, g, b } = hexToRgb(c);
    return [r / 255, g / 255, b / 255].map((v) => v.toFixed(4)).join(",");
  });
  return `
const c = document.getElementById('c');
const gl = c.getContext('webgl2', { preserveDrawingBuffer: true, antialias: false });
const vs = \`#version 300 es
in vec2 p; void main(){ gl_Position = vec4(p,0.,1.); }\`;
const fs = \`#version 300 es
precision highp float;
uniform vec2 r; uniform float t; uniform vec3 cols[5]; uniform int n;
out vec4 o;
vec2 h2(vec2 p){ p = vec2(dot(p,vec2(127.1,311.7)), dot(p,vec2(269.5,183.3))); return -1.+2.*fract(sin(p)*43758.5453123); }
float noise(vec2 p){ vec2 i=floor(p), f=fract(p); vec2 u=f*f*(3.-2.*f);
  return mix(mix(dot(h2(i),f), dot(h2(i+vec2(1,0)),f-vec2(1,0)),u.x), mix(dot(h2(i+vec2(0,1)),f-vec2(0,1)), dot(h2(i+vec2(1,1)),f-vec2(1,1)),u.x),u.y); }
float fbm(vec2 p){ float v=0., a=.5; mat2 m=mat2(1.6,1.2,-1.2,1.6); for(int i=0;i<4;i++){ v+=a*noise(p); p=m*p; a*=.5; } return v; }
vec3 ramp(float x){ x = clamp(x,0.,1.)*float(n-1); int i = int(floor(x)); int j = min(i+1, n-1); float f = smoothstep(0.,1.,fract(x)); return mix(cols[i], cols[j], f); }
void main(){
  vec2 uv = gl_FragCoord.xy / r; vec2 p = (gl_FragCoord.xy - .5*r) / r.y;
  float a = 6.28318530718 * t;
  vec2 loop = vec2(cos(a), sin(a)) * .35;
  // Long, silky bands: low-frequency warp of a diagonal coordinate.
  vec2 q = vec2(fbm(p*.7 + loop), fbm(p*.7 - loop.yx + 3.7));
  float band = dot(p, normalize(vec2(1., .55))) * .9 + 1.15 * fbm(p*.55 + 1.3*q + loop*.5);
  float x = fract(band * .55 + .5);
  x = x < .5 ? x * 2. : 2. - x * 2.;
  vec3 col = ramp(smoothstep(.02, .98, x));
  col += .06 * (fbm(p*2.2 + q*2. - loop) );
  col += (fract(sin(dot(gl_FragCoord.xy + t * 97., vec2(12.9898, 78.233))) * 43758.5453) - .5) * .03;
  o = vec4(col, 1.);
}\`;
const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s)); return s; };
const pr = gl.createProgram(); gl.attachShader(pr, sh(gl.VERTEX_SHADER, vs)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, fs)); gl.linkProgram(pr); gl.useProgram(pr);
const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,1,1]), gl.STATIC_DRAW);
const loc = gl.getAttribLocation(pr, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
const cols = [${rgb.map((x) => `[${x}]`).join(",")}];
while (cols.length < 5) cols.push(cols[cols.length - 1]);
gl.uniform3fv(gl.getUniformLocation(pr, 'cols'), new Float32Array(cols.flat()));
gl.uniform1i(gl.getUniformLocation(pr, 'n'), ${colors.length});
gl.uniform2f(gl.getUniformLocation(pr, 'r'), c.width, c.height);
const tl = gl.getUniformLocation(pr, 't');
window.__seek = (ms) => { gl.uniform1f(tl, (ms % ${loopMs}) / ${loopMs}); gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4); gl.finish(); };
window.__seek(0);
// Live preview when opened in a browser
if (!navigator.webdriver) { const t0 = performance.now(); const tick = () => { window.__seek(performance.now() - t0); requestAnimationFrame(tick); }; tick(); }
`;
}

/** motion.css — the brand's motion system as reusable CSS. */
export function motionCss(b: ResolvedBrand) {
  const m = b.motion;
  const captured = b.profile.motion.keyframes.filter((k) => k.count > 0).slice(0, 8);
  return `/**
 * ${b.name} — motion system
 * Durations and curves measured on ${b.domain}; utilities generated by watercolor.
 */
:root {
  --duration-fast: ${m.fast}ms;
  --duration-base: ${m.base}ms;
  --duration-slow: ${m.slow}ms;
  --ease-standard: ${m.standard};
  --ease-entrance: ${m.entrance};
  --ease-exit: ${m.exit};
  --ease-emphasis: ${m.emphasis};
}

/* Interaction defaults — what hover/press feel like on ${b.domain} */
.wc-interactive { transition: color var(--duration-fast) var(--ease-standard), background-color var(--duration-fast) var(--ease-standard), border-color var(--duration-fast) var(--ease-standard), box-shadow var(--duration-base) var(--ease-standard), transform var(--duration-base) var(--ease-standard); }

@keyframes wc-fade-up { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: none; } }
@keyframes wc-fade-in { from { opacity: 0; } to { opacity: 1; } }
@keyframes wc-scale-in { from { opacity: 0; transform: scale(.96); } to { opacity: 1; transform: none; } }
@keyframes wc-blur-in { from { opacity: 0; filter: blur(8px); } to { opacity: 1; filter: blur(0); } }
@keyframes wc-slide-in-right { from { opacity: 0; transform: translateX(24px); } to { opacity: 1; transform: none; } }
@keyframes wc-shimmer { from { background-position: 200% 0; } to { background-position: -200% 0; } }
@keyframes wc-gradient-pan { 0%, 100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }

.wc-enter { animation: wc-fade-up var(--duration-slow) var(--ease-entrance) both; }
.wc-enter-scale { animation: wc-scale-in var(--duration-base) var(--ease-entrance) both; }
.wc-enter-blur { animation: wc-blur-in var(--duration-slow) var(--ease-entrance) both; }
.wc-stagger > * { animation: wc-fade-up var(--duration-slow) var(--ease-entrance) both; }
${Array.from({ length: 8 }, (_, i) => `.wc-stagger > *:nth-child(${i + 1}) { animation-delay: ${i * 60}ms; }`).join("\n")}
.wc-gradient-animated { background: linear-gradient(120deg, ${b.gradient.join(", ")}); background-size: 300% 300%; animation: wc-gradient-pan 12s var(--ease-standard) infinite; }

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation-duration: 1ms !important; animation-iteration-count: 1 !important; transition-duration: 1ms !important; }
}
${captured.length ? `\n/* ----- Keyframes captured from ${b.domain} (for reference) ----- */\n${captured.map((k) => `/* used ${k.count}× — ${k.summary} */\n${k.css}`).join("\n\n")}\n` : ""}`;
}

/** Visual of the brand's easing curves (SVG). */
export function easingSvg(b: ResolvedBrand) {
  const curves = [
    ["standard", b.motion.standard],
    ["entrance", b.motion.entrance],
    ["exit", b.motion.exit],
    ["emphasis", b.motion.emphasis],
  ];
  const size = 180;
  const pad = 24;
  const fg = b.roles.foreground;
  const accent = b.monochrome ? fg : b.roles.primary;
  const cells = curves
    .map(([name, v], i) => {
      const m = /cubic-bezier\(([^)]+)\)/.exec(v);
      const [x1, y1, x2, y2] = m ? m[1].split(",").map(Number) : [0.25, 0.1, 0.25, 1];
      const X = (x: number) => pad + x * size;
      const Y = (y: number) => pad + size - y * size;
      return `<g transform="translate(${i * (size + pad * 2 + 20)} 0)">
<rect x="${pad}" y="${pad}" width="${size}" height="${size}" fill="none" stroke="${mix(fg, b.roles.background, 0.85)}"/>
<line x1="${X(0)}" y1="${Y(0)}" x2="${X(x1)}" y2="${Y(y1)}" stroke="${mix(fg, b.roles.background, 0.6)}" stroke-dasharray="3 3"/>
<line x1="${X(1)}" y1="${Y(1)}" x2="${X(x2)}" y2="${Y(y2)}" stroke="${mix(fg, b.roles.background, 0.6)}" stroke-dasharray="3 3"/>
<path d="M${X(0)} ${Y(0)} C${X(x1)} ${Y(y1)} ${X(x2)} ${Y(y2)} ${X(1)} ${Y(1)}" fill="none" stroke="${accent}" stroke-width="3"/>
<circle cx="${X(x1)}" cy="${Y(y1)}" r="4" fill="${fg}"/><circle cx="${X(x2)}" cy="${Y(y2)}" r="4" fill="${fg}"/>
<text x="${pad}" y="${size + pad * 2 + 6}" font-family="ui-monospace,monospace" font-size="13" fill="${fg}">${name}</text>
<text x="${pad}" y="${size + pad * 2 + 24}" font-family="ui-monospace,monospace" font-size="10" fill="${mix(fg, b.roles.background, 0.4)}">${esc(v)}</text></g>`;
    })
    .join("");
  const total = curves.length * (size + pad * 2 + 20);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${total} ${size + pad * 2 + 40}" width="${total}" height="${size + pad * 2 + 40}"><rect width="100%" height="100%" fill="${b.roles.background}"/>${cells}</svg>`;
}

/** A self-contained animated SVG loader (no JS) for direct use on the web. */
export function loaderSvg(b: ResolvedBrand) {
  const c = b.monochrome ? b.roles.foreground : b.roles.primary;
  const track = mix(c, b.roles.background, 0.75);
  const mark = b.logo.markSvg ? recolorSvg(b.logo.markSvg, c).replace(/<svg\b([^>]*)>/, '<svg$1 x="26" y="26" width="48" height="48">') : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100" role="img" aria-label="Loading">
<style>.r{transform-origin:50px 50px;animation:s 1.1s linear infinite}.m{transform-origin:50px 50px;animation:p 1.6s ${b.motion.standard} infinite}@keyframes s{to{transform:rotate(360deg)}}@keyframes p{50%{transform:scale(.88);opacity:.7}}@media (prefers-reduced-motion:reduce){.r,.m{animation-duration:4s}}</style>
<circle cx="50" cy="50" r="44" fill="none" stroke="${track}" stroke-width="5"/>
<circle class="r" cx="50" cy="50" r="44" fill="none" stroke="${c}" stroke-width="5" stroke-linecap="round" stroke-dasharray="70 207"/>
${mark ? `<g class="m">${mark}</g>` : ""}
</svg>`;
}

export async function renderMotion(b: ResolvedBrand, r: Renderer, outDir: string, fontCss: string, vars: string, o: MotionOptions) {
  const dir = path.join(outDir, "motion");
  const files: string[] = [];
  files.push(await write(path.join(dir, "motion.css"), motionCss(b)));
  files.push(await write(path.join(dir, "easing-curves.svg"), easingSvg(b)));
  files.push(await write(path.join(dir, "loader.svg"), loaderSvg(b)));
  const rendered: { name: string; title: string; description: string; files: string[]; poster?: string }[] = [];
  for (const c of compositions(b, fontCss, vars, o)) {
    log.step(`Rendering motion: ${c.title}`);
    files.push(await write(path.join(dir, "source", `${c.name}.html`), c.html));
    const poster = path.join(dir, `${c.name}-poster.png`);
    const made = await r.video(c.html, {
      name: `motion-${c.name}`,
      width: c.w,
      height: c.h,
      fps: o.fps,
      durationMs: c.durationMs,
      mp4: c.transparent ? undefined : path.join(dir, `${c.name}.mp4`),
      webm: path.join(dir, `${c.name}.webm`),
      gif: path.join(dir, `${c.name}.gif`),
      gifWidth: Math.min(c.w, c.name === "loader" ? 256 : 720),
      poster,
      transparent: c.transparent,
      canvas: c.canvas,
    });
    files.push(...made, poster);
    rendered.push({ name: c.name, title: c.title, description: c.description, files: made, poster });
  }
  return { files, rendered };
}
void isDark;

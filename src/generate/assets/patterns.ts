import path from "node:path";
import type { ResolvedBrand } from "../../profile/resolve.js";
import type { Hex } from "../../profile/schema.js";
import type { Renderer } from "../../render/renderer.js";
import { write } from "../../util/fs.js";
import { isNeutral, mix, oklch, isDark, fromOklch, distance } from "../../util/color.js";
import { recolorSvg, svgSize } from "./logo.js";
import { esc } from "../html.js";

/** Deterministic PRNG so every brand gets the same patterns on every run. */
export function rng(seedText: string) {
  let h = 1779033703 ^ seedText.length;
  for (let i = 0; i < seedText.length; i++) {
    h = Math.imul(h ^ seedText.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  let a = h >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface Pattern {
  name: string;
  title: string;
  description: string;
  /** Vector source (omitted for shader-rendered patterns). */
  svg?: string;
  /** Self-contained HTML that renders the pattern (shader patterns); also saved as editable source. */
  render?: string;
  tile?: string;
  derived: boolean;
}

/** Colors used for expressive patterns: the brand's chromatic voice, never invented hues. */
export function paletteForArt(b: ResolvedBrand): Hex[] {
  const chroma = [...b.gradient, b.roles.primary, ...b.roles.accent].filter((c) => !isNeutral(c, 0.04) && oklch(c).l > 0.38 && oklch(c).l < 0.94);
  const uniq: Hex[] = [];
  for (const c of chroma) if (!uniq.some((u) => distance(u, c) < 0.05)) uniq.push(c);
  if (uniq.length >= 2) {
    // Order around the hue wheel starting from the primary so blends never pass through mud.
    const start = oklch(uniq[0]).h;
    return uniq.slice(0, 5).sort((a, c) => ((oklch(a).h - start + 360) % 360) - ((oklch(c).h - start + 360) % 360));
  }
  // Monochrome brands: tonal washes of the ink.
  const base = uniq[0] ?? b.roles.foreground;
  return [mix(base, b.roles.background, 0.2), mix(base, b.roles.background, 0.55), mix(base, b.roles.background, 0.8)];
}

const W = 1600;
const H = 900;

export function buildPatterns(b: ResolvedBrand, markSvg?: string): Pattern[] {
  const rand = rng(b.name + b.domain);
  const cols = paletteForArt(b);
  const bg = b.roles.background;
  const fg = b.roles.foreground;
  const darkBg = isDark(bg);
  const out: Pattern[] = [];

  // 1 — Watercolor wash: translucent pigment glazes with wet, noise-warped edges, pooled
  //     (darker) rims, granulation and cold-press paper — in the brand's own hues.
  //     Rendered by a WebGL shader (SVG filter stacks take minutes on CPU rasterizers).
  {
    const blobs = Array.from({ length: 7 }, (_, i) => ({
      x: 0.05 + rand() * 0.9,
      y: 0.08 + rand() * 0.84,
      rx: 0.1 + rand() * 0.17,
      ry: 0.16 + rand() * 0.26,
      rot: rand() * Math.PI,
      a: 0.4 + rand() * 0.28,
      c: cols[i % cols.length],
    }));
    const paper = darkBg ? bg : mix(bg, "#f4efe6", 0.4);
    const seed = Math.floor(rand() * 1000);
    out.push({
      name: "watercolor-wash",
      title: "Watercolor wash",
      description: "Translucent glazes in the brand's own hues, with wet edges, pooled pigment rims, granulation and cold-press paper. Hero backgrounds, covers, editorial and campaign moments.",
      derived: true,
      render: watercolorHtml(blobs, paper, darkBg, seed, W, H),
    });
  }

  // 2 — Mesh gradient: large soft fields (the "living gradient" still). Radial falloffs, no blur filter.
  {
    const fields: string[] = [];
    const defs: string[] = [];
    const g = cols.length >= 2 ? cols : [cols[0], mix(cols[0], bg, 0.5)];
    for (let i = 0; i < 7; i++) {
      const c = g[i % g.length];
      const id = `f${i}`;
      defs.push(`<radialGradient id="${id}"><stop offset="0" stop-color="${c}" stop-opacity="0.95"/><stop offset="0.45" stop-color="${c}" stop-opacity="0.55"/><stop offset="1" stop-color="${c}" stop-opacity="0"/></radialGradient>`);
      const r = H * (0.55 + rand() * 0.6);
      fields.push(`<ellipse cx="${(W * (rand() * 1.1 - 0.05)).toFixed(0)}" cy="${(H * (rand() * 1.1 - 0.05)).toFixed(0)}" rx="${(r * (1 + rand() * 0.6)).toFixed(0)}" ry="${r.toFixed(0)}" fill="url(#${id})"/>`);
    }
    out.push({
      name: "mesh-gradient",
      title: "Mesh gradient",
      description: "Soft overlapping color fields with film grain — the brand's gradient as a surface. Use full-bleed behind light type.",
      derived: !b.gradientIsCaptured,
      svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
  <defs>${defs.join("")}
  <filter id="grain"><feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="2" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 0.55 0"/></filter></defs>
  <rect width="100%" height="100%" fill="${mix(g[0], g[g.length - 1], 0.5)}"/>
  ${fields.join("")}
  <rect width="100%" height="100%" filter="url(#grain)" opacity="0.2" style="mix-blend-mode:overlay"/>
</svg>`,
    });
  }

  // 3 — Signature linear gradient with grain
  out.push({
    name: "signature-gradient",
    title: "Signature gradient",
    description: b.gradientIsCaptured ? "The gradient measured on the live site, with fine grain to prevent banding." : "A gradient composed from the brand's chromatic colors (derived — the site uses none).",
    derived: !b.gradientIsCaptured,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
  <defs><linearGradient id="g" x1="0" y1="1" x2="1" y2="0">${b.gradient.map((c, i) => `<stop offset="${(i / Math.max(1, b.gradient.length - 1)).toFixed(3)}" stop-color="${c}"/>`).join("")}</linearGradient>
  <filter id="grain"><feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 0.5 0"/></filter></defs>
  <rect width="100%" height="100%" fill="url(#g)"/><rect width="100%" height="100%" filter="url(#grain)" opacity="0.16" style="mix-blend-mode:overlay"/>
</svg>`,
  });

  // 4 — Contour lines (topographic), drawn from summed sines seeded by the brand.
  {
    const lines: string[] = [];
    const count = 34;
    const ph = Array.from({ length: 4 }, () => rand() * Math.PI * 2);
    const fr = Array.from({ length: 4 }, (_, i) => 0.0012 * (i + 1) * (0.7 + rand() * 0.6));
    const stroke = darkBg ? mix(fg, bg, 0.65) : mix(fg, bg, 0.82);
    const accentLine = cols[0];
    for (let i = 0; i < count; i++) {
      const base = (H / count) * i * 1.35 - H * 0.15;
      const pts: string[] = [];
      for (let x = -40; x <= W + 40; x += 30) {
        const y = base + Math.sin(x * fr[0] + ph[0] + i * 0.11) * 70 + Math.sin(x * fr[1] + ph[1] - i * 0.07) * 40 + Math.sin(x * fr[2] + ph[2]) * (18 + i) + Math.sin(x * fr[3] + ph[3] + i * 0.2) * 12;
        pts.push(`${x},${y.toFixed(1)}`);
      }
      const hi = i === Math.floor(count * 0.62);
      lines.push(`<polyline points="${pts.join(" ")}" fill="none" stroke="${hi ? accentLine : stroke}" stroke-width="${hi ? 3 : 1.6}"/>`);
    }
    out.push({
      name: "contours",
      title: "Contour lines",
      description: "Topographic hairlines in the brand's neutrals with a single accent line. Quiet texture for data, infrastructure and editorial contexts.",
      derived: true,
      svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}"><rect width="100%" height="100%" fill="${bg}"/>${lines.join("")}</svg>`,
    });
  }

  // 5 — Dot grid on the brand's spacing unit (seamless tile)
  {
    const step = Math.max(16, b.spacing.base * 6);
    const dot = darkBg ? mix(fg, bg, 0.7) : mix(fg, bg, 0.78);
    const tile = `<svg xmlns="http://www.w3.org/2000/svg" width="${step}" height="${step}" viewBox="0 0 ${step} ${step}"><circle cx="${step / 2}" cy="${step / 2}" r="1.6" fill="${dot}"/></svg>`;
    out.push({
      name: "dot-grid",
      title: "Dot grid",
      description: `Dots on a ${step}px lattice (${step / b.spacing.base}× the ${b.spacing.base}px spacing unit). Product backgrounds, diagrams, empty states.`,
      derived: true,
      tile,
      svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}"><defs><pattern id="p" width="${step}" height="${step}" patternUnits="userSpaceOnUse"><circle cx="${step / 2}" cy="${step / 2}" r="1.6" fill="${dot}"/></pattern><radialGradient id="fade" cx="50%" cy="45%" r="65%"><stop offset="0.4" stop-color="#fff"/><stop offset="1" stop-color="#000"/></radialGradient><mask id="m"><rect width="100%" height="100%" fill="url(#fade)"/></mask></defs><rect width="100%" height="100%" fill="${bg}"/><rect width="100%" height="100%" fill="url(#p)" mask="url(#m)"/></svg>`,
    });
  }

  // 6 — Blueprint grid with major/minor lines
  {
    const minor = b.spacing.base * 6;
    const major = minor * 4;
    const c1 = darkBg ? mix(fg, bg, 0.88) : mix(fg, bg, 0.93);
    const c2 = darkBg ? mix(fg, bg, 0.78) : mix(fg, bg, 0.86);
    const tile = `<svg xmlns="http://www.w3.org/2000/svg" width="${major}" height="${major}" viewBox="0 0 ${major} ${major}"><path d="${Array.from({ length: 4 }, (_, i) => `M${i * minor} 0V${major}M0 ${i * minor}H${major}`).join("")}" stroke="${c1}" stroke-width="1"/><path d="M0 0V${major}M0 0H${major}" stroke="${c2}" stroke-width="1"/></svg>`;
    out.push({
      name: "grid",
      title: "Construction grid",
      description: `Minor lines every ${minor}px, major every ${major}px — derived from the spacing system. Technical diagrams, docs headers.`,
      derived: true,
      tile,
      svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}"><defs><pattern id="g" width="${major}" height="${major}" patternUnits="userSpaceOnUse">${tile.replace(/^<svg[^>]*>|<\/svg>$/g, "")}</pattern></defs><rect width="100%" height="100%" fill="${bg}"/><rect width="100%" height="100%" fill="url(#g)"/></svg>`,
    });
  }

  // 7 — Mark lattice
  if (markSvg) {
    const { w, h } = svgSize(markSvg);
    const size = 72;
    const gap = size * 2.2;
    const tint = darkBg ? mix(fg, bg, 0.82) : mix(fg, bg, 0.9);
    const inner = recolorSvg(markSvg, tint)
      .replace(/<svg\b[^>]*>/, "")
      .replace(/<\/svg>\s*$/, "");
    const sx = size / Math.max(w, h);
    const tileW = gap;
    const tileH = gap;
    const cell = (x: number, y: number) => `<g transform="translate(${x - (w * sx) / 2} ${y - (h * sx) / 2}) scale(${sx})">${inner}</g>`;
    const tile = `<svg xmlns="http://www.w3.org/2000/svg" width="${tileW}" height="${tileH}" viewBox="0 0 ${tileW} ${tileH}">${cell(tileW / 4, tileH / 4)}${cell((tileW * 3) / 4, (tileH * 3) / 4)}</svg>`;
    out.push({
      name: "mark-lattice",
      title: "Mark lattice",
      description: "The brand mark repeated on a staggered lattice at low contrast. Packaging, merch, swag, app splash.",
      derived: true,
      tile,
      svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}"><defs><pattern id="m" width="${tileW}" height="${tileH}" patternUnits="userSpaceOnUse">${tile.replace(/^<svg[^>]*>|<\/svg>$/g, "")}</pattern></defs><rect width="100%" height="100%" fill="${bg}"/><rect width="100%" height="100%" fill="url(#m)"/></svg>`,
    });
  }

  // 8 — Orbits: concentric rings in the brand's colors (hero / AI / data moments)
  {
    const cx = W * (0.62 + rand() * 0.2);
    const cy = H * (0.45 + rand() * 0.2);
    const rings: string[] = [];
    for (let i = 1; i <= 16; i++) {
      const r = i * 70 + i * i * 4;
      const c = i % 5 === 0 ? cols[(i / 5) % cols.length] : darkBg ? mix(fg, bg, 0.8) : mix(fg, bg, 0.88);
      rings.push(`<circle cx="${cx.toFixed(0)}" cy="${cy.toFixed(0)}" r="${r}" fill="none" stroke="${c}" stroke-width="${i % 5 === 0 ? 2.4 : 1.2}" ${i % 3 === 0 ? `stroke-dasharray="2 10"` : ""}/>`);
    }
    out.push({
      name: "orbits",
      title: "Orbits",
      description: "Concentric rings with accent rhythm every fifth ring. Works behind product shots, AI features, announcements.",
      derived: true,
      svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}"><rect width="100%" height="100%" fill="${bg}"/>${rings.join("")}<circle cx="${cx.toFixed(0)}" cy="${cy.toFixed(0)}" r="10" fill="${cols[0]}"/></svg>`,
    });
  }

  // 9 — Wordmark wallpaper (type as texture)
  {
    const word = esc(b.name);
    const rows: string[] = [];
    const size = 150;
    const c = darkBg ? mix(fg, bg, 0.86) : mix(fg, bg, 0.92);
    for (let i = 0; i < 8; i++) {
      const offset = (i % 2) * -400 - 200;
      rows.push(`<text x="${offset}" y="${i * size * 0.92 + size * 0.8}" font-family="${esc(b.fonts.display.family)}, ${esc(b.fonts.display.alternatives[0] ?? "system-ui")}, sans-serif" font-weight="${Math.max(500, b.type.h1.weight)}" font-size="${size}" letter-spacing="-0.03em" fill="${c}">${Array(6).fill(word).join("  ")}</text>`);
    }
    out.push({
      name: "wordmark-wall",
      title: "Name wallpaper",
      description: `The name "${b.name}" set in the display face as an all-over texture. Event backdrops, merch, social covers.`,
      derived: true,
      svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}"><rect width="100%" height="100%" fill="${bg}"/>${rows.join("")}</svg>`,
    });
  }
  void oklch;
  void fromOklch;
  return out;
}

export async function renderPatterns(b: ResolvedBrand, r: Renderer, outDir: string, patterns: Pattern[], fontCss: string) {
  const files: string[] = [];
  const dir = path.join(outDir, "patterns");
  for (const p of patterns) {
    if (p.svg) files.push(await write(path.join(dir, `${p.name}.svg`), p.svg));
    if (p.render) files.push(await write(path.join(dir, "source", `${p.name}.html`), p.render));
    if (p.tile) files.push(await write(path.join(dir, "tiles", `${p.name}-tile.svg`), p.tile));
    const html = p.render ?? `<!doctype html><html><head><style>${fontCss}html,body{margin:0;width:${W}px;height:${H}px;overflow:hidden}svg{display:block}</style></head><body>${p.svg}</body></html>`;
    files.push(await r.png(html, path.join(dir, `${p.name}.png`), { width: W, height: H, name: `pattern-${p.name}` }));
  }
  return files;
}

interface Blob {
  x: number;
  y: number;
  rx: number;
  ry: number;
  rot: number;
  a: number;
  c: Hex;
}

/** Self-contained WebGL watercolor renderer. Deterministic: same blobs + seed → same image. */
export function watercolorHtml(blobs: Blob[], paper: Hex, dark: boolean, seed: number, w: number, h: number) {
  const rgb = (hx: string) => [1, 3, 5].map((i) => (parseInt(hx.slice(i, i + 2), 16) / 255).toFixed(4));
  const data = blobs.map((b) => [b.x * w, b.y * h, b.rx * w, b.ry * h, b.rot, b.a, ...rgb(b.c)].map(Number));
  return `<!doctype html><html><head><meta charset="utf-8"><title>Watercolor wash</title><style>html,body{margin:0;width:${w}px;height:${h}px;overflow:hidden;background:${paper}}canvas{display:block}</style></head>
<body><canvas id="c" width="${w}" height="${h}"></canvas><script>
const B = ${JSON.stringify(data)};
const gl = document.getElementById('c').getContext('webgl2', { preserveDrawingBuffer: true });
const fs = \`#version 300 es
precision highp float;
uniform vec2 r; uniform vec3 paper; uniform float seed; uniform int n; uniform float D[${blobs.length * 9}];
out vec4 o;
vec2 h2(vec2 p){ p = vec2(dot(p,vec2(127.1,311.7)), dot(p,vec2(269.5,183.3))); return -1.+2.*fract(sin(p)*43758.5453123); }
float noise(vec2 p){ vec2 i=floor(p), f=fract(p); vec2 u=f*f*(3.-2.*f);
  return mix(mix(dot(h2(i),f), dot(h2(i+vec2(1,0)),f-vec2(1,0)),u.x), mix(dot(h2(i+vec2(0,1)),f-vec2(0,1)), dot(h2(i+vec2(1,1)),f-vec2(1,1)),u.x),u.y); }
float fbm(vec2 p){ float v=0., a=.5; for(int i=0;i<5;i++){ v+=a*noise(p); p=p*2.03+17.1; a*=.5; } return v; }
void main(){
  vec2 px = vec2(gl_FragCoord.x, r.y - gl_FragCoord.y);
  vec3 c = paper;
  for (int i = 0; i < ${blobs.length}; i++) {
    if (i >= n) break;
    int k = i * 9;
    vec2 d = px - vec2(D[k], D[k+1]);
    float cr = cos(D[k+4]), sr = sin(D[k+4]);
    d = mat2(cr, -sr, sr, cr) * d / vec2(D[k+2], D[k+3]);
    float fi = float(i) * 13.7 + seed;
    // Wet edge: the boundary wanders at two scales, like pigment following paper fibres.
    float warp = fbm(px * .0035 + fi) * .7 + fbm(px * .018 + fi * 1.7) * .14;
    float dist = length(d) + warp - .12;
    float inside = 1. - smoothstep(.86, .9, dist);
    float rim = smoothstep(.55, .89, dist) * inside;                 // pooled pigment at the drying edge
    float bloom = smoothstep(.0, .45, fbm(px * .006 - fi)) * .35;     // back-runs / cauliflower blooms
    float gran = fbm(px * .22 + fi) * .5 + .5;                        // granulation
    float a = D[k+5] * inside * (.55 + .75 * rim - bloom) * (.82 + .3 * gran);
    vec3 pig = vec3(D[k+6], D[k+7], D[k+8]);
    ${dark ? "c = 1. - (1. - c) * (1. - pig * clamp(a, 0., 1.));" : "c *= mix(vec3(1.), pig, clamp(a, 0., 1.));"}
  }
  float tooth = fbm(px * .9 + seed) * .5 + .5;
  c *= ${dark ? "1. + (tooth - .5) * .05" : ".965 + tooth * .05"};
  o = vec4(c, 1.);
}\`;
const vs = \`#version 300 es
in vec2 p; void main(){ gl_Position = vec4(p, 0., 1.); }\`;
const sh = (t, s) => { const x = gl.createShader(t); gl.shaderSource(x, s); gl.compileShader(x); if (!gl.getShaderParameter(x, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(x)); return x; };
const pr = gl.createProgram(); gl.attachShader(pr, sh(gl.VERTEX_SHADER, vs)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, fs)); gl.linkProgram(pr); gl.useProgram(pr);
gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer()); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,1,1]), gl.STATIC_DRAW);
const l = gl.getAttribLocation(pr, 'p'); gl.enableVertexAttribArray(l); gl.vertexAttribPointer(l, 2, gl.FLOAT, false, 0, 0);
gl.uniform2f(gl.getUniformLocation(pr, 'r'), ${w}, ${h});
gl.uniform3f(gl.getUniformLocation(pr, 'paper'), ${rgb(paper).join(", ")});
gl.uniform1f(gl.getUniformLocation(pr, 'seed'), ${seed % 97});
gl.uniform1i(gl.getUniformLocation(pr, 'n'), B.length);
gl.uniform1fv(gl.getUniformLocation(pr, 'D'), new Float32Array(B.flat()));
gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4); gl.finish();
</script></body></html>`;
}

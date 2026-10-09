/**
 * A small, forgiving CSS walker. We don't need a full CSSOM — just enough structure
 * to pull @font-face, @keyframes, media-query breakpoints and custom properties out of
 * minified production stylesheets.
 */

export interface CssBlock {
  prelude: string;
  body: string;
  children: CssBlock[];
}

const NESTED_AT = /^@(media|supports|layer|container|document|scope|starting-style)\b/i;

export function walkCss(text: string): CssBlock[] {
  const src = text.replace(/\/\*[\s\S]*?\*\//g, "");
  return parseBlocks(src, 0, src.length);
}

function parseBlocks(src: string, start: number, end: number): CssBlock[] {
  const out: CssBlock[] = [];
  let i = start;
  let preludeStart = start;
  while (i < end) {
    const ch = src[i];
    if (ch === '"' || ch === "'") {
      i = skipString(src, i);
      continue;
    }
    if (ch === ";") {
      // Statement at-rule (@import, @charset, @layer a,b;)
      preludeStart = i + 1;
      i++;
      continue;
    }
    if (ch === "{") {
      const close = findClose(src, i, end);
      const prelude = src.slice(preludeStart, i).trim();
      const body = src.slice(i + 1, close);
      const block: CssBlock = { prelude, body, children: [] };
      if (NESTED_AT.test(prelude) || (!prelude.startsWith("@") && body.includes("{") && !/^@(font-face|keyframes|-webkit-keyframes|property|page)/i.test(prelude))) {
        block.children = parseBlocks(src, i + 1, close);
      }
      out.push(block);
      i = close + 1;
      preludeStart = i;
      continue;
    }
    i++;
  }
  return out;
}

function skipString(src: string, i: number) {
  const q = src[i];
  i++;
  while (i < src.length && src[i] !== q) {
    if (src[i] === "\\") i++;
    i++;
  }
  return i + 1;
}

function findClose(src: string, open: number, end: number) {
  let depth = 0;
  for (let i = open; i < end; i++) {
    const ch = src[i];
    if (ch === '"' || ch === "'") {
      i = skipString(src, i) - 1;
      continue;
    }
    if (ch === "{") depth++;
    else if (ch === "}") {
      depth--;
      if (depth === 0) return i;
    }
  }
  return end;
}

export function declarations(body: string): [string, string][] {
  const out: [string, string][] = [];
  // Strip nested blocks (CSS nesting) before splitting declarations.
  let flat = "";
  let depth = 0;
  for (const ch of body) {
    if (ch === "{") depth++;
    else if (ch === "}") depth--;
    else if (depth === 0) flat += ch;
  }
  for (const part of splitTop(flat, ";")) {
    const idx = part.indexOf(":");
    if (idx <= 0) continue;
    const prop = part.slice(0, idx).trim();
    const value = part.slice(idx + 1).trim();
    if (prop && value) out.push([prop, value]);
  }
  return out;
}

/** Split on a delimiter, ignoring delimiters inside parentheses or strings. */
export function splitTop(input: string, delim: string): string[] {
  const out: string[] = [];
  let depth = 0;
  let cur = "";
  let quote = "";
  for (let i = 0; i < input.length; i++) {
    const ch = input[i];
    if (quote) {
      cur += ch;
      if (ch === quote && input[i - 1] !== "\\") quote = "";
      continue;
    }
    if (ch === '"' || ch === "'") quote = ch;
    if (ch === "(") depth++;
    if (ch === ")") depth--;
    if (ch === delim && depth === 0) {
      out.push(cur);
      cur = "";
      continue;
    }
    cur += ch;
  }
  if (cur.trim()) out.push(cur);
  return out.map((s) => s.trim()).filter(Boolean);
}

export interface FontFace {
  family: string;
  weight: string;
  style: string;
  urls: string[];
  unicodeRange?: string;
  display?: string;
}

export interface KeyframesRule {
  name: string;
  css: string;
  body: string;
}

export interface CustomProp {
  name: string;
  value: string;
  selector: string;
}

export interface CssSummary {
  fontFaces: FontFace[];
  keyframes: KeyframesRule[];
  breakpoints: Map<number, number>;
  customProps: CustomProp[];
  containerQueries: number;
  layers: number;
}

export function summarizeCss(text: string, baseUrl: string): CssSummary {
  const summary: CssSummary = { fontFaces: [], keyframes: [], breakpoints: new Map(), customProps: [], containerQueries: 0, layers: 0 };
  const visit = (blocks: CssBlock[], inScope = "") => {
    for (const b of blocks) {
      const p = b.prelude;
      if (/^@font-face/i.test(p)) {
        const decl = Object.fromEntries(declarations(b.body).map(([k, v]) => [k.toLowerCase(), v]));
        const family = (decl["font-family"] || "").replace(/^['"]|['"]$/g, "").trim();
        if (!family) continue;
        const urls = [...(decl["src"] || "").matchAll(/url\(\s*(['"]?)(.*?)\1\s*\)/g)].map((m) => absolutize(m[2], baseUrl));
        summary.fontFaces.push({
          family,
          weight: decl["font-weight"] || "400",
          style: decl["font-style"] || "normal",
          urls,
          unicodeRange: decl["unicode-range"],
          display: decl["font-display"],
        });
      } else if (/^@(-webkit-)?keyframes/i.test(p)) {
        const name = p.replace(/^@(-webkit-)?keyframes\s+/i, "").replace(/['"]/g, "").trim();
        if (!p.startsWith("@-webkit")) summary.keyframes.push({ name, css: `${p} {${b.body}}`, body: b.body });
      } else if (/^@media/i.test(p)) {
        for (const m of p.matchAll(/(min|max)-width\s*:\s*([\d.]+)(px|em|rem)/gi)) {
          let v = parseFloat(m[2]);
          if (m[3] !== "px") v *= 16;
          if (m[1].toLowerCase() === "max") v = Math.round(v + 1);
          v = Math.round(v);
          if (v >= 320 && v <= 2560) summary.breakpoints.set(v, (summary.breakpoints.get(v) || 0) + 1);
        }
        for (const m of p.matchAll(/width\s*(>=|>|<=|<)\s*([\d.]+)(px|em|rem)/gi)) {
          let v = parseFloat(m[2]);
          if (m[3] !== "px") v *= 16;
          v = Math.round(v);
          if (v >= 320 && v <= 2560) summary.breakpoints.set(v, (summary.breakpoints.get(v) || 0) + 1);
        }
        visit(b.children, inScope);
      } else if (/^@container/i.test(p)) {
        summary.containerQueries++;
        visit(b.children, inScope);
      } else if (/^@layer/i.test(p)) {
        summary.layers++;
        visit(b.children, inScope);
      } else if (/^@(supports|scope|document)/i.test(p)) {
        visit(b.children, inScope);
      } else if (!p.startsWith("@")) {
        const isThemeScope = /(^|,|\s)(:root|html|body|:host|\[data-theme[^\]]*\]|\.dark|\.light|\[class\*?=)/.test(p);
        if (isThemeScope || inScope) {
          for (const [k, v] of declarations(b.body)) {
            if (k.startsWith("--")) summary.customProps.push({ name: k, value: v, selector: p.slice(0, 120) });
          }
        }
        if (b.children.length) visit(b.children, inScope);
      }
    }
  };
  try {
    visit(walkCss(text));
  } catch {
    /* never let a hostile stylesheet kill extraction */
  }
  return summary;
}

export function absolutize(url: string, base: string) {
  try {
    return new URL(url, base).href;
  } catch {
    return url;
  }
}

/** Parse a CSS length into px (best-effort; em/rem assume 16px). */
export function toPx(value: string | undefined | null): number | null {
  if (!value) return null;
  const m = /^(-?[\d.]+)(px|rem|em)?$/.exec(value.trim());
  if (!m) return null;
  const n = parseFloat(m[1]);
  if (!Number.isFinite(n)) return null;
  return m[2] === "rem" || m[2] === "em" ? n * 16 : n;
}

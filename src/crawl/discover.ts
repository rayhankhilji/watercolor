import type { PageKind } from "../profile/schema.js";

const PATTERNS: [PageKind, RegExp, number][] = [
  ["brand", /\/(brand|brand-?assets|brand-?guidelines|brand-?kit|press|press-?kit|media|media-?kit|newsroom|logos?)(\/|$)/i, 10],
  ["about", /\/(about|about-?us|company|story|mission|manifesto|team)(\/|$)/i, 9],
  ["pricing", /\/(pricing|plans|price)(\/|$)/i, 8],
  ["product", /\/(product|products|features|platform|solutions|how-it-works|tour)(\/|$)/i, 7],
  ["customers", /\/(customers|case-studies|stories|testimonials|showcase)(\/|$)/i, 6],
  ["enterprise", /\/(enterprise|business|teams)(\/|$)/i, 5],
  ["careers", /\/(careers|jobs|join|hiring)(\/|$)/i, 4],
  ["blog", /\/(blog|journal|news|changelog|updates)(\/|$)/i, 3],
  ["docs", /\/(docs|documentation|developers|api)(\/|$)/i, 2],
];

const TEXT_HINTS: [PageKind, RegExp][] = [
  ["brand", /^(brand|press|media kit|brand assets|newsroom|logos?)$/i],
  ["about", /^(about|about us|company|our story|mission|manifesto)$/i],
  ["pricing", /^(pricing|plans)$/i],
  ["customers", /^(customers|case studies|stories)$/i],
  ["careers", /^(careers|jobs|we.re hiring)$/i],
  ["product", /^(product|features|platform|how it works)$/i],
];

export interface DiscoveredPage {
  url: string;
  kind: PageKind;
  score: number;
}

export function sameSite(a: string, b: string) {
  try {
    const ha = new URL(a).hostname.replace(/^www\./, "");
    const hb = new URL(b).hostname.replace(/^www\./, "");
    return ha === hb || hb.endsWith("." + ha) || ha.endsWith("." + hb);
  } catch {
    return false;
  }
}

/**
 * Rank internal links by how much brand signal the destination usually carries.
 * Brand/press pages win because they often host the official logo pack.
 */
export function discoverPages(homeUrl: string, links: { href: string; text: string }[], max: number): DiscoveredPage[] {
  const best = new Map<PageKind, DiscoveredPage>();
  const home = new URL(homeUrl);
  for (const l of links) {
    let u: URL;
    try {
      u = new URL(l.href);
    } catch {
      continue;
    }
    if (!sameSite(home.href, u.href)) continue;
    if (/\.(pdf|zip|png|jpe?g|svg|mp4|webm|gif)$/i.test(u.pathname)) continue;
    // Skip deep links (blog posts, docs pages) — we want hub pages.
    // Locale prefixes (/gb/, /en-us/, /fr/) don't count toward depth.
    const segs = u.pathname.split("/").filter(Boolean);
    if (segs.length && /^[a-z]{2}(-[a-z]{2})?$/i.test(segs[0])) segs.shift();
    const depth = segs.length;
    if (depth === 0) continue;
    // Hub pages only: one level deep (brand/press kits may sit one level lower).
    u.hash = "";
    u.search = "";
    let kind: PageKind | null = null;
    let score = 0;
    for (const [k, re, s] of PATTERNS) {
      if (re.test(u.pathname)) {
        kind = k;
        score = s;
        break;
      }
    }
    for (const [k, re] of TEXT_HINTS) {
      if (re.test(l.text.trim())) {
        if (!kind) kind = k;
        score += 2;
        break;
      }
    }
    if (!kind) continue;
    if (depth > 2 || (depth === 2 && kind !== "brand")) continue;
    score -= Math.max(0, depth - 1) * 2;
    // Prefer the subdomain-free version of a page.
    if (u.hostname !== home.hostname) score -= 1;
    const prev = best.get(kind);
    if (!prev || score > prev.score) best.set(kind, { url: u.href, kind, score });
  }
  return [...best.values()].sort((a, b) => b.score - a.score).slice(0, max);
}

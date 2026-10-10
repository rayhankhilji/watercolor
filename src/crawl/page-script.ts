/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Runs *inside* the target page via `page.evaluate`. Must be fully self-contained:
 * no imports, no references to module scope. Returns plain JSON.
 *
 * It walks every visible element once and aggregates usage-weighted statistics
 * (colors by painted area, fonts by rendered characters, spacing, radii, shadows,
 * transitions …) plus structured samples (logo candidates, CTAs, icons, images,
 * canvases, copy) that the Node side turns into a BrandProfile.
 */
export function collectPage(opts: { maxElements: number; brandHint: string; pageUrl: string }) {
  const W = Math.max(document.documentElement.clientWidth, 1);
  const docH = Math.max(document.documentElement.scrollHeight, 1);
  const origin = location.origin;
  const brandHint = (opts.brandHint || "").toLowerCase();

  const inc = (map: Record<string, number>, key: string, by = 1) => {
    map[key] = (map[key] || 0) + by;
  };

  type ColorStat = { bg: number; text: number; border: number; svg: number; gradient: number; count: number; ctx: Record<string, number> };
  const colors: Record<string, ColorStat> = {};
  const addColor = (raw: string, kind: "bg" | "text" | "border" | "svg" | "gradient", weight: number, ctx: string) => {
    if (!raw || raw === "transparent" || raw === "rgba(0, 0, 0, 0)" || raw.startsWith("url(") || raw === "none") return;
    const s = (colors[raw] ||= { bg: 0, text: 0, border: 0, svg: 0, gradient: 0, count: 0, ctx: {} });
    s[kind] += weight;
    s.count++;
    inc(s.ctx, ctx, weight);
  };

  const textStyles: Record<string, any> = {};
  const fontStacks: Record<string, { chars: number; weights: Record<string, number>; tags: Record<string, number> }> = {};
  const spacing: Record<string, number> = {};
  const radii: Record<string, number> = {};
  const shadows: Record<string, number> = {};
  const transitions: Record<string, number> = {};
  const animations: Record<string, number> = {};
  const gradients: Record<string, { area: number; count: number }> = {};
  const maxWidths: Record<string, number> = {};
  const gridCols: Record<string, number> = {};
  const borders: Record<string, number> = {};
  const fontFeatures: Record<string, number> = {};
  const filters: Record<string, number> = {};
  let measureSamples: number[] = [];

  const ctxOf = (el: Element): string => {
    const tag = el.tagName.toLowerCase();
    if (/^h[1-6]$/.test(tag)) return "heading";
    if (tag === "button" || el.getAttribute("role") === "button") return "button";
    if (tag === "a") return "link";
    if (tag === "input" || tag === "textarea" || tag === "select") return "input";
    if (el.closest("footer")) return "footer";
    if (el.closest("header, nav, [role=banner]")) return "nav";
    if (tag === "code" || tag === "pre" || el.closest("pre")) return "code";
    return "body";
  };

  const ownText = (el: Element) => {
    let t = "";
    for (const n of Array.from(el.childNodes)) if (n.nodeType === 3) t += n.textContent || "";
    return t.replace(/\s+/g, " ").trim();
  };

  const isVisible = (el: Element, cs: CSSStyleDeclaration, r: DOMRect) =>
    r.width > 0 && r.height > 0 && cs.display !== "none" && cs.visibility !== "hidden" && parseFloat(cs.opacity || "1") > 0.02;

  let wcCounter = 0;
  const tagId = (el: Element) => {
    let id = el.getAttribute("data-wc-id");
    if (!id) {
      id = `wc${++wcCounter}`;
      el.setAttribute("data-wc-id", id);
    }
    return id;
  };

  const pick = (cs: CSSStyleDeclaration, props: string[]) => {
    const o: Record<string, string> = {};
    for (const p of props) o[p] = cs.getPropertyValue(p);
    return o;
  };

  const COMPONENT_PROPS = [
    "background-color", "background-image", "color", "font-family", "font-size", "font-weight", "line-height", "letter-spacing",
    "text-transform", "padding-top", "padding-right", "padding-bottom", "padding-left", "border-top-width", "border-top-style",
    "border-top-color", "border-top-left-radius", "border-top-right-radius", "border-bottom-left-radius", "border-bottom-right-radius", "box-shadow",
    "height", "width", "transition", "backdrop-filter", "gap", "display", "text-decoration-line", "text-underline-offset", "outline",
  ];

  const all = Array.from(document.querySelectorAll("body *")).slice(0, opts.maxElements);
  const SKIP = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "TEMPLATE", "LINK", "META", "BR", "WBR", "SOURCE", "TRACK"]);
  const SVG_SHAPES = new Set(["path", "circle", "rect", "ellipse", "polygon", "polyline", "line", "text"]);

  const buttons: any[] = [];
  const cards: any[] = [];
  const inputs: any[] = [];
  const badges: any[] = [];

  for (const el of all) {
    if (SKIP.has(el.tagName)) continue;
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    if (!isVisible(el, cs, r)) continue;
    const isSvgChild = el instanceof SVGElement && el.tagName.toLowerCase() !== "svg";
    const tag = el.tagName.toLowerCase();
    const ctx = ctxOf(el);
    const area = Math.min(r.width, W) * Math.min(r.height, docH);

    if (isSvgChild) {
      if (SVG_SHAPES.has(tag)) {
        const fill = cs.fill;
        if (fill && fill !== "none" && !fill.startsWith("url(")) addColor(fill, "svg", Math.max(area, 1) * 0.5, el.closest("header,nav") ? "nav-svg" : "svg");
        const stroke = cs.stroke;
        if (stroke && stroke !== "none" && !stroke.startsWith("url(")) addColor(stroke, "svg", Math.max(area, 1) * 0.2, "svg-stroke");
      }
      continue;
    }

    // --- color: backgrounds
    const bg = cs.backgroundColor;
    if (bg && bg !== "rgba(0, 0, 0, 0)") addColor(bg, "bg", area, ctx === "body" ? (tag === "section" || tag === "main" || tag === "div" ? "surface" : "body") : ctx);
    const bgi = cs.backgroundImage;
    if (bgi && bgi.includes("gradient(")) {
      const g = (gradients[bgi] ||= { area: 0, count: 0 });
      g.area += area;
      g.count++;
    }

    // --- text
    const text = ownText(el);
    const size = parseFloat(cs.fontSize);
    if (text.length > 0 && size > 0) {
      const weight = text.length * size;
      addColor(cs.color, "text", weight, ctx);
      const family = cs.fontFamily;
      const fs = (fontStacks[family] ||= { chars: 0, weights: {}, tags: {} });
      fs.chars += text.length;
      inc(fs.weights, cs.fontWeight, text.length);
      inc(fs.tags, tag, text.length);
      const lh = cs.lineHeight === "normal" ? 1.2 * size : parseFloat(cs.lineHeight);
      const ls = cs.letterSpacing === "normal" ? 0 : parseFloat(cs.letterSpacing);
      const key = [family, size, cs.fontWeight, Math.round((lh / size) * 100) / 100, Math.round((ls / size) * 1000) / 1000, cs.textTransform, cs.fontStyle].join("|");
      const ts = (textStyles[key] ||= { family, size, weight: Number(cs.fontWeight), lineHeight: lh / size, letterSpacing: ls / size, textTransform: cs.textTransform, fontStyle: cs.fontStyle, features: cs.fontFeatureSettings, chars: 0, count: 0, tags: {}, sample: "", colors: {} });
      ts.chars += text.length;
      ts.count++;
      inc(ts.tags, tag);
      inc(ts.colors, cs.color, text.length);
      if (!ts.sample || (text.length > ts.sample.length && ts.sample.length < 60)) ts.sample = text.slice(0, 120);
      if (cs.fontFeatureSettings && cs.fontFeatureSettings !== "normal") inc(fontFeatures, cs.fontFeatureSettings, text.length);
      if (tag === "p" && text.length > 120) measureSamples.push(r.width / (size * 0.5));
    }

    // --- borders
    const bw = parseFloat(cs.borderTopWidth);
    if (bw > 0 && cs.borderTopStyle !== "none") {
      addColor(cs.borderTopColor, "border", (r.width + r.height) * 2 * bw, ctx);
      inc(borders, `${bw}|${cs.borderTopStyle}|${cs.borderTopColor}`);
    } else {
      const bbw = parseFloat(cs.borderBottomWidth);
      if (bbw > 0 && cs.borderBottomStyle !== "none") {
        addColor(cs.borderBottomColor, "border", r.width * bbw, ctx);
        inc(borders, `${bbw}|${cs.borderBottomStyle}|${cs.borderBottomColor}`);
      }
    }
    if (cs.outlineStyle !== "none" && parseFloat(cs.outlineWidth) > 0 && cs.outlineColor) addColor(cs.outlineColor, "border", 1, "outline");

    // --- spacing
    for (const p of ["padding-top", "padding-right", "padding-bottom", "padding-left", "margin-top", "margin-bottom", "gap", "row-gap", "column-gap"]) {
      const v = cs.getPropertyValue(p);
      if (v && v !== "0px" && v !== "normal" && v.endsWith("px")) {
        const n = Math.round(parseFloat(v));
        if (n > 0 && n <= 400) inc(spacing, String(n));
      }
    }

    // --- radius / shadow / transitions / animations
    const rad = cs.borderTopLeftRadius;
    if (rad && rad !== "0px") {
      const same = rad === cs.borderTopRightRadius && rad === cs.borderBottomRightRadius;
      if (same || cs.borderBottomLeftRadius === rad) inc(radii, rad.includes("%") ? rad : r.height > 0 && parseFloat(rad) >= r.height / 2 - 0.5 && r.height < 80 ? "9999px" : rad);
    }
    if (cs.boxShadow && cs.boxShadow !== "none") inc(shadows, cs.boxShadow);
    if (cs.filter && cs.filter !== "none") inc(filters, cs.filter);
    if (cs.backdropFilter && cs.backdropFilter !== "none") inc(filters, "backdrop:" + cs.backdropFilter);
    if (cs.transitionDuration && cs.transitionDuration !== "0s") {
      const props = cs.transitionProperty.split(",").map((s) => s.trim());
      const durs = cs.transitionDuration.split(",").map((s) => s.trim());
      const eases = cs.transitionTimingFunction.split(/,(?![^(]*\))/).map((s) => s.trim());
      props.forEach((p, i) => {
        const d = durs[i % durs.length];
        if (d === "0s") return;
        inc(transitions, `${p}|${d}|${eases[i % eases.length]}`);
      });
    }
    if (cs.animationName && cs.animationName !== "none") {
      for (const n of cs.animationName.split(",")) inc(animations, `${n.trim()}|${cs.animationDuration}|${cs.animationTimingFunction}|${cs.animationIterationCount}`);
    }

    // --- layout
    if (cs.maxWidth && cs.maxWidth.endsWith("px")) {
      const mw = Math.round(parseFloat(cs.maxWidth));
      if (mw >= 480 && mw <= 2400 && r.width >= Math.min(mw, W) * 0.9) inc(maxWidths, String(mw));
    }
    if (cs.display === "grid" && cs.gridTemplateColumns && cs.gridTemplateColumns !== "none") {
      const n = cs.gridTemplateColumns.split(" ").filter(Boolean).length;
      if (n > 1 && n <= 24) inc(gridCols, String(n));
    }

    // --- component candidates
    const label = (el as HTMLElement).innerText?.replace(/\s+/g, " ").trim() || el.getAttribute("aria-label") || "";
    const hasBg = bg && bg !== "rgba(0, 0, 0, 0)";
    const isButtonish =
      (tag === "button" || el.getAttribute("role") === "button" || (tag === "a" && (hasBg || bw > 0) && parseFloat(cs.paddingLeft) >= 8)) &&
      label.length > 0 &&
      label.length <= 40 &&
      r.height >= 24 &&
      r.height <= 80 &&
      r.width <= 480;
    if (isButtonish) {
      buttons.push({ id: tagId(el), text: label, tag, href: (el as HTMLAnchorElement).href || "", rect: { x: r.x, y: r.y + scrollY, w: r.width, h: r.height }, styles: pick(cs, COMPONENT_PROPS) });
    }
    if ((tag === "input" && !["hidden", "checkbox", "radio", "submit"].includes((el as HTMLInputElement).type)) || tag === "textarea") {
      inputs.push({ id: tagId(el), text: (el as HTMLInputElement).placeholder || "", tag, rect: { x: r.x, y: r.y + scrollY, w: r.width, h: r.height }, styles: pick(cs, COMPONENT_PROPS) });
    }
    const radN = parseFloat(rad || "0");
    if (
      (tag === "div" || tag === "article" || tag === "li" || tag === "a") &&
      r.width >= 200 && r.width <= W * 0.6 && r.height >= 120 && r.height <= 900 &&
      (hasBg || bw > 0 || (cs.boxShadow && cs.boxShadow !== "none")) && radN > 0 && label.length > 20
    ) {
      cards.push({ id: tagId(el), text: label.slice(0, 140), tag, rect: { x: r.x, y: r.y + scrollY, w: r.width, h: r.height }, styles: pick(cs, COMPONENT_PROPS) });
    }
    if (label.length > 0 && label.length <= 24 && r.height <= 32 && r.height >= 14 && (hasBg || bw > 0) && radN >= 4 && tag !== "button" && tag !== "a" && tag !== "input") {
      badges.push({ id: tagId(el), text: label, tag, rect: { x: r.x, y: r.y + scrollY, w: r.width, h: r.height }, styles: pick(cs, COMPONENT_PROPS) });
    }
  }

  // ---------------------------------------------------------------- logo
  const rootLinks = new Set([origin, origin + "/", "/", "#", location.href.split("#")[0]]);
  const isRootHref = (href: string | null) => {
    if (!href) return false;
    try {
      const u = new URL(href, location.href);
      return u.origin === origin && (u.pathname === "/" || u.pathname === "" || /^\/(en|en-us|us)\/?$/i.test(u.pathname)) && !u.search;
    } catch {
      return rootLinks.has(href);
    }
  };

  const serializeSvg = (svg: SVGSVGElement): string => {
    const clone = svg.cloneNode(true) as SVGSVGElement;
    const srcEls = [svg, ...Array.from(svg.querySelectorAll("*"))];
    const dstEls = [clone, ...Array.from(clone.querySelectorAll("*"))];
    srcEls.forEach((s, i) => {
      const d = dstEls[i] as Element;
      if (!d) return;
      const scs = getComputedStyle(s);
      const t = s.tagName.toLowerCase();
      if (SVG_SHAPES.has(t) || t === "g" || t === "svg" || t === "use") {
        for (const p of ["fill", "stroke", "stroke-width", "stroke-linecap", "stroke-linejoin", "fill-rule", "clip-rule", "opacity", "fill-opacity", "stroke-opacity"]) {
          const v = scs.getPropertyValue(p);
          if (!v) continue;
          if (p === "opacity" && v === "1") continue;
          if ((p === "fill-opacity" || p === "stroke-opacity") && v === "1") continue;
          if (p === "stroke-width" && (scs.stroke === "none" || !scs.stroke)) continue;
          if ((p === "stroke-linecap" || p === "stroke-linejoin") && (scs.stroke === "none" || !scs.stroke)) continue;
          if (p === "fill-rule" && v === "nonzero") continue;
          if (p === "clip-rule" && v === "nonzero") continue;
          if (t === "g" || t === "svg") {
            if (p === "fill" || p === "stroke") continue; // children carry their own resolved values
          }
          d.setAttribute(p, v.startsWith("url(") ? v.replace(/url\(["']?[^#]*#([^"')]+)["']?\)/, "url(#$1)") : v);
        }
      }
      d.removeAttribute("class");
      d.removeAttribute("style");
      d.removeAttribute("data-wc-id");
    });
    // Inline <use> references that point outside this svg.
    clone.querySelectorAll("use").forEach((u) => {
      const ref = u.getAttribute("href") || u.getAttribute("xlink:href");
      if (!ref || !ref.startsWith("#")) return;
      if (clone.querySelector(ref)) return;
      const target = document.querySelector(ref);
      if (!target) return;
      let defs = clone.querySelector("defs");
      if (!defs) {
        defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
        clone.prepend(defs);
      }
      defs.appendChild(target.cloneNode(true));
    });
    // Pull in referenced gradients / clipPaths defined elsewhere in the document.
    const html0 = clone.outerHTML;
    for (const m of Array.from(html0.matchAll(/url\(#([^)]+)\)/g))) {
      const id = m[1];
      if (clone.querySelector(`#${CSS.escape(id)}`)) continue;
      const target = document.getElementById(id);
      if (!target) continue;
      let defs = clone.querySelector("defs");
      if (!defs) {
        defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
        clone.prepend(defs);
      }
      defs.appendChild(target.cloneNode(true));
    }
    const r = svg.getBoundingClientRect();
    if (!clone.getAttribute("viewBox")) clone.setAttribute("viewBox", `0 0 ${Math.round(r.width)} ${Math.round(r.height)}`);
    clone.setAttribute("width", String(Math.round(r.width)));
    clone.setAttribute("height", String(Math.round(r.height)));
    clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    clone.removeAttribute("aria-hidden");
    clone.removeAttribute("focusable");
    return clone.outerHTML;
  };

  const logoCandidates: any[] = [];
  const seenLogo = new Set<Element>();
  const consider = (el: Element, base: number, reasons: string[]) => {
    if (seenLogo.has(el)) return;
    const r = el.getBoundingClientRect();
    if (r.width < 12 || r.height < 8 || r.width > 600 || r.height > 260) return;
    const cs = getComputedStyle(el);
    if (!isVisible(el, cs, r)) return;
    seenLogo.add(el);
    let score = base;
    const why = [...reasons];
    const attrs = [el.getAttribute("class"), el.id, el.getAttribute("aria-label"), el.getAttribute("alt"), el.getAttribute("title"), el.closest("a")?.getAttribute("aria-label"), el.closest("a")?.getAttribute("class"), el.querySelector?.("title")?.textContent, (el as HTMLImageElement).src]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    if (/logo|brand|wordmark|logotype/.test(attrs)) {
      score += 3;
      why.push("named logo");
    }
    if (brandHint && attrs.includes(brandHint)) {
      score += 2;
      why.push("matches brand name");
    }
    if (el.closest("header, nav, [role=banner]")) {
      score += 3;
      why.push("in header");
    }
    if (el.closest("footer")) {
      score += 1;
      why.push("in footer");
    }
    if (isRootHref(el.closest("a")?.getAttribute("href") ?? null)) {
      score += 4;
      why.push("links home");
    }
    const absTop = r.top + scrollY;
    if (absTop < 140) {
      score += 2;
      why.push("top of page");
    }
    if (r.left < W * 0.35) score += 1;
    if (el.tagName.toLowerCase() === "svg") score += 1;
    if (r.width >= 40 && r.width <= 320 && r.height >= 14 && r.height <= 90) score += 1;
    // penalize icon-ish things (hamburger, search, social glyphs)
    if (/menu|search|close|hamburger|chevron|arrow|github|twitter|linkedin|youtube|instagram|discord|facebook/.test(attrs)) score -= 5;
    const entry: any = { score, reasons: why, rect: { x: r.x, y: absTop, w: r.width, h: r.height }, context: el.closest("footer") ? "footer" : el.closest("header,nav,[role=banner]") ? "header" : "other" };
    if (el.tagName.toLowerCase() === "svg") {
      entry.kind = "svg";
      entry.html = serializeSvg(el as SVGSVGElement);
      entry.color = cs.color;
    } else if (el.tagName.toLowerCase() === "img") {
      entry.kind = "img";
      entry.src = (el as HTMLImageElement).currentSrc || (el as HTMLImageElement).src;
      entry.alt = (el as HTMLImageElement).alt;
      entry.natural = { w: (el as HTMLImageElement).naturalWidth, h: (el as HTMLImageElement).naturalHeight };
    } else {
      const bgImg = cs.backgroundImage;
      const m = /url\(["']?(.*?)["']?\)/.exec(bgImg);
      if (!m) return;
      entry.kind = "img";
      entry.src = new URL(m[1], location.href).href;
    }
    logoCandidates.push(entry);
  };

  document.querySelectorAll("header a, nav a, [role=banner] a, a[href='/'], footer a").forEach((a) => {
    const href = a.getAttribute("href");
    const home = isRootHref(href);
    a.querySelectorAll(":scope svg, :scope img").forEach((m) => consider(m, home ? 2 : 0, home ? ["home link"] : []));
    if (home) {
      const s = getComputedStyle(a);
      if (s.backgroundImage.includes("url(")) consider(a, 2, ["home link bg"]);
    }
  });
  document.querySelectorAll("[class*=logo i] svg, [id*=logo i] svg, svg[class*=logo i], img[alt*=logo i], img[src*=logo i], img[class*=logo i], svg[aria-label]").forEach((m) => consider(m, 0, []));

  // ---------------------------------------------------------------- icons (small inline svgs)
  const icons: any[] = [];
  const illus: any[] = [];
  const wallSvgs: any[] = [];
  const svgSeen = new Set<string>();
  document.querySelectorAll("svg").forEach((svg) => {
    if (seenLogo.has(svg)) return;
    const r = svg.getBoundingClientRect();
    const cs = getComputedStyle(svg);
    if (!isVisible(svg, cs, r)) return;
    if (svg.closest("[data-wc-skip]")) return;
    const small = r.width <= 48 && r.height <= 48 && r.width >= 10 && r.height >= 10;
    const big = r.width >= 120 && r.height >= 80;
    const logoish = !small && !big && r.height >= 12 && r.height <= 90 && r.width >= r.height * 1.4 && r.width <= 340;
    if (logoish && wallSvgs.length < 60) {
      const grand = svg.parentElement?.parentElement?.parentElement;
      const peers = grand ? Array.from(grand.querySelectorAll("svg, img")).filter((p) => {
        const pr = p.getBoundingClientRect();
        return pr.height >= 12 && pr.height <= 100 && pr.width >= pr.height;
      }).length : 0;
      if (peers >= 4) {
        const label = (svg.getAttribute("aria-label") || svg.querySelector("title")?.textContent || svg.closest("a")?.getAttribute("aria-label") || svg.parentElement?.getAttribute("aria-label") || "").trim();
        wallSvgs.push({ html: serializeSvg(svg as SVGSVGElement), label, w: r.width, h: r.height });
      }
      return;
    }
    if (!small && !big) return;
    const html = serializeSvg(svg as SVGSVGElement);
    if (html.length > 60000 || svgSeen.has(html)) return;
    svgSeen.add(html);
    const parentLabel = (svg.closest("a,button")?.getAttribute("aria-label") || svg.getAttribute("aria-label") || svg.querySelector("title")?.textContent || "").trim();
    const entry = { html, w: r.width, h: r.height, label: parentLabel, context: ctxOf(svg), color: cs.color, cls: (svg.getAttribute("class") || "").slice(0, 120), wall: !!svg.closest("ul,div") && r.height <= 90 && r.width > r.height * 1.6 };
    if (small && icons.length < 240) icons.push(entry);
    else if (big && illus.length < 40) illus.push(entry);
  });

  // ---------------------------------------------------------------- images
  const images: any[] = [];
  document.querySelectorAll("img").forEach((img) => {
    const r = img.getBoundingClientRect();
    const cs = getComputedStyle(img);
    if (!isVisible(img, cs, r) || r.width < 24 || r.height < 16) return;
    const src = img.currentSrc || img.src;
    if (!src || src.startsWith("data:image/gif")) return;
    // Logo-wall detection: several similarly sized images in the same row.
    const parent = img.parentElement?.parentElement?.parentElement;
    let wall = false;
    if (parent && r.height <= 90) {
      const peers = Array.from(parent.querySelectorAll("img")).filter((p) => {
        const pr = p.getBoundingClientRect();
        return pr.height > 0 && pr.height <= 100 && Math.abs(pr.height - r.height) < 40;
      });
      wall = peers.length >= 4;
    }
    images.push({
      src,
      alt: img.alt || "",
      natural: { w: img.naturalWidth, h: img.naturalHeight },
      display: { w: Math.round(r.width), h: Math.round(r.height) },
      y: r.top + scrollY,
      context: wall ? "logo-wall" : img.closest("header,nav") ? "nav" : img.closest("footer") ? "footer" : r.top + scrollY < 900 ? "hero" : "body",
      filter: cs.filter,
    });
  });
  // CSS background images on large blocks (hero art, textures)
  const bgImages: any[] = [];
  for (const el of all.slice(0, 3000)) {
    const cs = getComputedStyle(el);
    const bgi = cs.backgroundImage;
    if (!bgi || !bgi.includes("url(")) continue;
    const r = el.getBoundingClientRect();
    if (r.width < 160 || r.height < 100) continue;
    for (const m of Array.from(bgi.matchAll(/url\(["']?(.*?)["']?\)/g))) {
      if (m[1].startsWith("data:")) continue;
      bgImages.push({ src: new URL(m[1], location.href).href, display: { w: Math.round(r.width), h: Math.round(r.height) }, size: cs.backgroundSize, repeat: cs.backgroundRepeat });
    }
    if (bgImages.length > 40) break;
  }

  // ---------------------------------------------------------------- video / canvas
  const videos: any[] = [];
  document.querySelectorAll("video").forEach((v) => {
    const r = v.getBoundingClientRect();
    const srcs = [v.currentSrc, v.src, ...Array.from(v.querySelectorAll("source")).map((s) => (s as HTMLSourceElement).src)].filter(Boolean);
    if (!srcs.length) return;
    videos.push({ srcs: Array.from(new Set(srcs)), poster: v.poster, w: Math.round(r.width), h: Math.round(r.height), autoplay: v.autoplay, loop: v.loop, muted: v.muted, y: r.top + scrollY, context: r.top + scrollY < 1000 ? "hero" : "body" });
  });
  const canvases: any[] = [];
  document.querySelectorAll("canvas").forEach((c) => {
    const r = c.getBoundingClientRect();
    if (r.width < 120 || r.height < 80) return;
    const cs = getComputedStyle(c);
    if (!isVisible(c, cs, r)) return;
    const vars: Record<string, string> = {};
    for (let i = 0; i < cs.length; i++) {
      const p = cs[i];
      if (p.startsWith("--")) vars[p] = cs.getPropertyValue(p).trim();
    }
    // Only keep vars that look like they belong to this canvas (gradient/color/shader)
    const own: Record<string, string> = {};
    for (const [k, v] of Object.entries(vars)) if (/grad|color|shader|canvas|wave|mesh|glow/i.test(k)) own[k] = v;
    canvases.push({ id: tagId(c), ctx: c.getAttribute("data-wc-ctx") || "unknown", w: Math.round(r.width), h: Math.round(r.height), y: r.top + scrollY, cssVars: own, idAttr: c.id, className: (c.getAttribute("class") || "").slice(0, 80) });
  });

  // ---------------------------------------------------------------- copy
  const clean = (s: string | null | undefined) => (s || "").replace(/\s+/g, " ").trim();
  const visibleText = (el: Element) => {
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) return "";
    const cs = getComputedStyle(el);
    if (cs.visibility === "hidden" || cs.display === "none") return "";
    return clean((el as HTMLElement).innerText);
  };
  const headings: any[] = [];
  document.querySelectorAll("h1, h2, h3").forEach((h) => {
    const t = visibleText(h);
    if (t && t.length < 200 && headings.length < 80) {
      const cs = getComputedStyle(h);
      const hr = h.getBoundingClientRect();
      // Distinct text colors inside the heading (two-tone headline treatments).
      const tchars: Record<string, number> = {};
      const walk = document.createTreeWalker(h, NodeFilter.SHOW_TEXT);
      let tn: Node | null;
      while ((tn = walk.nextNode())) {
        const txt = (tn.textContent || "").trim();
        if (!txt || !tn.parentElement) continue;
        const pcs = getComputedStyle(tn.parentElement);
        if (pcs.visibility === "hidden" || parseFloat(pcs.opacity) < 0.1) continue;
        tchars[pcs.color] = (tchars[pcs.color] || 0) + txt.length;
      }
      // Colors ordered by how much of the heading they set.
      const tcols = Object.entries(tchars).sort((a, b) => b[1] - a[1]).map(([c, n]) => ({ c, n }));
      headings.push({ colors: tcols, tag: h.tagName.toLowerCase(), text: t, size: parseFloat(cs.fontSize), y: hr.top + scrollY, centered: cs.textAlign === "center" || (Math.abs(hr.left + hr.width / 2 - W / 2) < 24 && hr.width < W * 0.8) });
    }
  });
  // Large non-heading text acting as display copy
  const displayCopy: string[] = [];
  Object.values(textStyles)
    .filter((s: any) => s.size >= 36)
    .forEach((s: any) => s.sample && displayCopy.push(s.sample));
  const paragraphs: string[] = [];
  document.querySelectorAll("p").forEach((p) => {
    const t = visibleText(p);
    if (t.length >= 30 && t.length <= 600 && paragraphs.length < 60) paragraphs.push(t);
  });
  const nav: string[] = [];
  document.querySelectorAll("header a, nav a, header button").forEach((a) => {
    const t = visibleText(a);
    if (t && t.length <= 30 && !nav.includes(t)) nav.push(t);
  });
  const microcopy: string[] = [];
  document.querySelectorAll("input[placeholder], textarea[placeholder]").forEach((i) => microcopy.push((i as HTMLInputElement).placeholder));
  document.querySelectorAll("label, small, figcaption, [class*=eyebrow i], [class*=kicker i], [class*=badge i], [class*=tag i]").forEach((e) => {
    const t = visibleText(e);
    if (t && t.length <= 80 && microcopy.length < 60 && !microcopy.includes(t)) microcopy.push(t);
  });
  const footerText = clean((document.querySelector("footer") as HTMLElement | null)?.innerText).slice(0, 2000);
  const links = Array.from(document.querySelectorAll("a[href]"))
    .map((a) => ({ href: (a as HTMLAnchorElement).href, text: clean((a as HTMLElement).innerText).slice(0, 60), download: a.hasAttribute("download") }))
    .filter((l) => l.href.startsWith("http"))
    .slice(0, 600);

  // ---------------------------------------------------------------- sections (rhythm)
  const sections: any[] = [];
  const root = document.querySelector("main") || document.body;
  const sectionEls = Array.from(root.children).length > 2 ? Array.from(root.children) : Array.from(document.querySelectorAll("section"));
  sectionEls.slice(0, 40).forEach((s) => {
    const r = s.getBoundingClientRect();
    if (r.height < 80) return;
    const cs = getComputedStyle(s);
    sections.push({ y: r.top + scrollY, h: r.height, pt: parseFloat(cs.paddingTop), pb: parseFloat(cs.paddingBottom), bg: cs.backgroundColor, tag: s.tagName.toLowerCase() });
  });

  // ---------------------------------------------------------------- root vars & meta
  const rootVars: Record<string, string> = {};
  const rcs = getComputedStyle(document.documentElement);
  for (let i = 0; i < rcs.length; i++) {
    const p = rcs[i];
    if (p.startsWith("--")) rootVars[p] = rcs.getPropertyValue(p).trim();
  }
  const bcs = getComputedStyle(document.body);
  for (let i = 0; i < bcs.length; i++) {
    const p = bcs[i];
    if (p.startsWith("--") && !(p in rootVars)) rootVars[p] = bcs.getPropertyValue(p).trim();
  }

  const meta: Record<string, string> = {};
  document.querySelectorAll("meta[name], meta[property]").forEach((m) => {
    const k = (m.getAttribute("name") || m.getAttribute("property") || "").toLowerCase();
    const v = m.getAttribute("content");
    if (k && v && !(k in meta)) meta[k] = v;
  });
  const iconLinks = Array.from(document.querySelectorAll("link[rel]"))
    .filter((l) => /icon|apple-touch|mask-icon|manifest/i.test(l.getAttribute("rel") || ""))
    .map((l) => ({ rel: l.getAttribute("rel"), href: (l as HTMLLinkElement).href, sizes: l.getAttribute("sizes"), type: l.getAttribute("type"), color: l.getAttribute("color"), media: l.getAttribute("media") }));
  const jsonld: any[] = [];
  document.querySelectorAll('script[type="application/ld+json"]').forEach((s) => {
    try {
      jsonld.push(JSON.parse(s.textContent || "null"));
    } catch {
      /* ignore */
    }
  });
  const inlineCss = Array.from(document.querySelectorAll("style"))
    .map((s) => s.textContent || "")
    .filter((t) => t.length > 0)
    .join("\n")
    .slice(0, 3_000_000);

  const fontsLoaded: any[] = [];
  try {
    (document as any).fonts.forEach((f: any) => {
      if (f.status === "loaded") fontsLoaded.push({ family: f.family.replace(/['"]/g, ""), weight: f.weight, style: f.style });
    });
  } catch {
    /* ignore */
  }

  // ---------------------------------------------------------------- stack fingerprint
  const w = window as any;
  const scripts = Array.from(document.scripts).map((s) => s.src).filter(Boolean);
  const html = document.documentElement;
  const has = (sel: string) => !!document.querySelector(sel);
  const stack = {
    next: !!w.__NEXT_DATA__ || scripts.some((s) => s.includes("/_next/")) || has("#__next") || has("script#__NEXT_DATA__"),
    nuxt: !!w.__NUXT__ || has("#__nuxt"),
    gatsby: has("#___gatsby"),
    astro: has("astro-island") || scripts.some((s) => s.includes("/_astro/")),
    remix: !!w.__remixContext,
    sveltekit: has("[data-sveltekit-preload-data]") || scripts.some((s) => s.includes("/_app/immutable")),
    framer: has("[data-framer-name]") || has("[data-framer-component-type]") || scripts.some((s) => s.includes("framer")),
    webflow: !!w.Webflow || html.hasAttribute("data-wf-site"),
    wordpress: scripts.some((s) => s.includes("wp-content") || s.includes("wp-includes")),
    shopify: !!w.Shopify,
    squarespace: !!w.Squarespace || scripts.some((s) => s.includes("squarespace")),
    wix: scripts.some((s) => s.includes("wixstatic") || s.includes("parastorage")),
    tailwind: (() => {
      const cls = Array.from(document.querySelectorAll("[class]")).slice(0, 400).map((e) => e.getAttribute("class") || "").join(" ");
      return (cls.match(/\b(flex|px-\d|py-\d|text-(sm|lg|xl)|rounded-(md|lg|xl)|bg-[a-z]+-\d{2,3}|md:|lg:)/g) || []).length > 20;
    })(),
    styledComponents: has("style[data-styled]"),
    emotion: has("style[data-emotion]"),
    gsap: !!w.gsap || !!w.TweenMax,
    scrollTrigger: !!w.ScrollTrigger,
    framerMotion: has("[data-projection-id]") || has("[data-framer-appear-id]"),
    lottie: !!w.lottie || !!w.bodymovin || has("lottie-player") || has("dotlottie-player") || has("dotlottie-wc"),
    rive: !!w.rive || scripts.some((s) => s.includes("rive")),
    three: !!w.THREE || !!w.__THREE__,
    lenis: html.classList.contains("lenis") || !!w.lenis,
    locomotive: html.classList.contains("has-scroll-smooth"),
    spline: has("spline-viewer") || scripts.some((s) => s.includes("spline")),
    generator: meta["generator"] || "",
  };

  const bodyText = clean(document.body.innerText).slice(0, 40000);

  return {
    url: location.href,
    title: document.title,
    lang: html.lang,
    viewport: { w: W, h: innerHeight, docH },
    colors,
    textStyles: Object.values(textStyles),
    fontStacks,
    spacing,
    radii,
    shadows,
    transitions,
    animations,
    gradients,
    maxWidths,
    gridCols,
    borders,
    filters,
    fontFeatures,
    measure: measureSamples.length ? measureSamples.sort((a, b) => a - b)[Math.floor(measureSamples.length / 2)] : null,
    buttons: buttons.slice(0, 120),
    inputs: inputs.slice(0, 20),
    cards: cards.slice(0, 40),
    badges: badges.slice(0, 40),
    logoCandidates: logoCandidates.sort((a, b) => b.score - a.score).slice(0, 12),
    icons,
    illustrations: illus,
    wallSvgs,
    images,
    bgImages,
    videos,
    canvases,
    headings,
    displayCopy,
    paragraphs,
    nav,
    microcopy,
    footerText,
    links,
    sections,
    rootVars,
    meta,
    iconLinks,
    jsonld,
    inlineCss,
    fontsLoaded,
    stack,
    bodyText,
  };
}

export type RawPage = ReturnType<typeof collectPage>;

/**
 * Installed before any page script runs. Records WebGL shader sources and which
 * canvases own which rendering context, so we can recover "the moving gradient thing".
 */
export const INIT_SCRIPT = `
(() => {
  if (window.__wc) return;
  const store = window.__wc = { shaders: [], contexts: 0 };
  globalThis.__name = globalThis.__name || ((t) => t);
  const hookGL = (proto) => {
    if (!proto) return;
    const orig = proto.shaderSource;
    proto.shaderSource = function (shader, source) {
      try {
        let type = 'unknown';
        try {
          const t = this.getShaderParameter(shader, this.SHADER_TYPE);
          type = t === this.FRAGMENT_SHADER ? 'fragment' : t === this.VERTEX_SHADER ? 'vertex' : 'unknown';
        } catch (e) {}
        if (store.shaders.length < 64 && typeof source === 'string') store.shaders.push({ type, source: source.slice(0, 200000) });
      } catch (e) {}
      return orig.apply(this, arguments);
    };
  };
  try { hookGL(WebGLRenderingContext.prototype); } catch (e) {}
  try { hookGL(WebGL2RenderingContext.prototype); } catch (e) {}
  try {
    const origGet = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type, attrs) {
      try {
        this.setAttribute('data-wc-ctx', String(type));
        store.contexts++;
        if (type === 'webgl' || type === 'webgl2' || type === 'experimental-webgl') {
          attrs = Object.assign({}, attrs || {}, { preserveDrawingBuffer: true });
        }
      } catch (e) {}
      return origGet.call(this, type, attrs);
    };
  } catch (e) {}
})();
`;

import { describe, it, expect } from "vitest";
import { ramp, parseColor, composite, contrast, apca, oklch, describeColor, readableOn } from "../src/util/color.js";
import { summarizeCss, splitTop, toPx } from "../src/util/css.js";
import { discoverPages } from "../src/crawl/discover.js";
import { describeEasing } from "../src/extract/system.js";
import { cleanFamilyName, alternativesFor } from "../src/extract/typography.js";
import { parseStrategy } from "../src/synth/llm.js";
import { collapseRepeat } from "../src/extract/voice.js";
import { recolorSvg, svgSize } from "../src/generate/assets/logo.js";
import { imageSize } from "../src/util/image-size.js";

describe("color", () => {
  it("parses modern CSS colors to sRGB hex", () => {
    expect(parseColor("rgb(99, 91, 255)")?.hex).toBe("#635bff");
    expect(parseColor("#FFF")?.hex).toBe("#ffffff");
    expect(parseColor("oklch(0.5784 0.2346 278.29)")?.hex).toBe("#635bff");
    expect(parseColor("rgba(0, 0, 0, 0.5)")?.alpha).toBe(0.5);
    expect(parseColor("transparent")).toBeNull();
    expect(parseColor("color(display-p3 1 0 0)")?.hex).toMatch(/^#[0-9a-f]{6}$/);
  });

  it("composites translucent colors over a background", () => {
    expect(composite({ hex: "#000000", alpha: 0.5 }, "#ffffff")).toBe("#808080");
  });

  it("pins the exact brand color inside its ramp", () => {
    for (const hex of ["#635bff", "#0a2540", "#ffbb01", "#00d4ff", "#111111"]) {
      const r = ramp(hex);
      expect(r.steps[r.pinned]).toBe(hex);
      expect(Object.keys(r.steps)).toHaveLength(11);
      // lightness decreases monotonically from 50 to 950
      const ls = Object.values(r.steps).map((h) => oklch(h).l);
      for (let i = 1; i < ls.length; i++) expect(ls[i]).toBeLessThan(ls[i - 1] + 0.02);
    }
  });

  it("does not blow up chroma for dark brand colors", () => {
    const r = ramp("#0a2540");
    expect(oklch(r.steps["500"]).c).toBeLessThan(0.15);
  });

  it("computes WCAG and APCA contrast", () => {
    expect(contrast("#000000", "#ffffff")).toBe(21);
    expect(apca("#000000", "#ffffff")).toBeGreaterThan(100);
    expect(apca("#ffffff", "#000000")).toBeLessThan(-100);
    expect(readableOn("#635bff")).toBe("#ffffff");
  });

  it("names colors in plain language", () => {
    expect(describeColor("#ffffff")).toBe("White");
    expect(describeColor("#635bff")).toMatch(/Indigo|Blue|Violet/);
  });
});

describe("css", () => {
  const css = `
    @font-face { font-family: "Söhne"; src: url(/fonts/sohne.woff2) format("woff2"); font-weight: 300 700; }
    :root { --brand: #635bff; --space-2: 8px }
    @media (min-width: 768px) and (max-width: 1023px) { .a { color: red } }
    @media (width >= 64rem) { .b { color: blue } }
    @keyframes fade-up { from { opacity: 0; transform: translateY(8px) } to { opacity: 1 } }
    .x { color: var(--brand) }
  `;
  const s = summarizeCss(css, "https://example.com/assets/app.css");

  it("extracts font faces with absolute URLs", () => {
    expect(s.fontFaces[0]).toMatchObject({ family: "Söhne", weight: "300 700" });
    expect(s.fontFaces[0].urls[0]).toBe("https://example.com/fonts/sohne.woff2");
  });
  it("extracts custom properties from theme scopes", () => {
    expect(s.customProps.map((p) => p.name)).toEqual(["--brand", "--space-2"]);
  });
  it("extracts breakpoints in px (including range syntax and rem)", () => {
    expect([...s.breakpoints.keys()].sort((a, b) => a - b)).toEqual([768, 1024]);
  });
  it("extracts keyframes", () => {
    expect(s.keyframes.map((k) => k.name)).toEqual(["fade-up"]);
  });
  it("splits on top-level delimiters only", () => {
    expect(splitTop("a, rgb(1, 2, 3), b", ",")).toEqual(["a", "rgb(1, 2, 3)", "b"]);
    expect(toPx("1.5rem")).toBe(24);
  });
});

describe("discovery", () => {
  it("ranks brand-signal pages and ignores deep links", () => {
    const pages = discoverPages("https://acme.com/", [
      { href: "https://acme.com/blog/how-we-built-x", text: "How we built X" },
      { href: "https://acme.com/pricing", text: "Pricing" },
      { href: "https://acme.com/about", text: "About" },
      { href: "https://acme.com/press", text: "Press" },
      { href: "https://other.com/about", text: "About" },
    ], 6);
    expect(pages.map((p) => p.kind)).toEqual(["brand", "about", "pricing"]);
  });
});

describe("motion", () => {
  it("names known easing curves", () => {
    expect(describeEasing("cubic-bezier(0.215, 0.61, 0.355, 1)").name).toBe("easeOutCubic");
    expect(describeEasing("ease-in-out").name).toBe("ease-in-out");
    expect(describeEasing("cubic-bezier(0.3, 1.6, 0.6, 1)").character).toMatch(/overshoot/i);
  });
});

describe("typography", () => {
  it("cleans bundler-mangled family names", () => {
    expect(cleanFamilyName("__Inter_a1b2c3")).toBe("Inter");
    expect(cleanFamilyName("sohne-var")).toBe("Söhne");
  });
  it("suggests open alternatives for proprietary faces", () => {
    expect(alternativesFor("Söhne")).toContain("Inter Tight");
    expect(alternativesFor("Inter")).toEqual([]);
  });
});

describe("strategy parsing", () => {
  it("extracts JSON and keeps version + mode", () => {
    const s = parseStrategy('Here you go:\n{"version":"2","mode":"reimagine","company":{"oneLiner":"x"}}', { version: "1", mode: "extract" });
    expect(s).toMatchObject({ version: "1", mode: "extract", company: { oneLiner: "x" } });
  });
  it("throws on non-JSON", () => {
    expect(() => parseStrategy("nope", { version: "1", mode: "extract" })).toThrow();
  });
});

describe("svg", () => {
  it("recolors every paint and reads the viewBox", () => {
    const svg = '<svg viewBox="0 0 120 40"><path fill="#635bff" d="M0 0h10v10z"/><path d="M5 5h5v5z" stroke="red"/></svg>';
    const out = recolorSvg(svg, "#ffffff");
    expect(out).not.toMatch(/#635bff|red/);
    expect(out).toMatch(/<svg[^>]*fill="#ffffff"/);
    expect(svgSize(svg)).toEqual({ w: 120, h: 40 });
  });
});

describe("image size", () => {
  it("reads PNG dimensions from the header", () => {
    const png = Buffer.from("89504e470d0a1a0a0000000d49484452000002000000010008060000001f15c489", "hex");
    expect(imageSize(png)).toEqual({ width: 512, height: 256, type: "png" });
  });
});

describe("copy cleanup", () => {
  it("collapses headings duplicated for animation or screen readers", () => {
    expect(collapseRepeat("The system for teams and agents The system for teams and agents")).toBe("The system for teams and agents");
    expect(collapseRepeat("Ship it. Ship it.")).toBe("Ship it. Ship it.");
    expect(collapseRepeat("A normal headline")).toBe("A normal headline");
  });
});

import type { ResolvedBrand } from "../../profile/resolve.js";
import type { TokenModel } from "../tokens/index.js";
import type { ComponentSample } from "../../profile/schema.js";
import { oklchCss, contrast, apca, describeColor, readableOn } from "../../util/color.js";
import { hardRules, antiSlop, observedPersonality, colorRatio } from "./heuristics.js";

/** Paths of generated assets, relative to the brand dir, used for linking from docs. */
export interface AssetIndex {
  logo: string[];
  favicon: string[];
  patterns: { name: string; title: string; description: string; derived: boolean }[];
  social: { name: string; title: string; use: string }[];
  motion: { name: string; title: string; description: string }[];
  templates: string[];
  markSource: string;
}

const table = (head: string[], rows: (string | number)[][]) =>
  [`| ${head.join(" | ")} |`, `| ${head.map(() => "---").join(" | ")} |`, ...rows.map((r) => `| ${r.map((c) => String(c).replace(/\|/g, "\\|").replace(/\n/g, " ")).join(" | ")} |`)].join("\n");

const code = (lang: string, s: string) => "```" + lang + "\n" + s.trim() + "\n```";
const hx = (h: string) => `\`${h.toUpperCase()}\``;
const swatch = (h: string) => `![${h}](https://img.shields.io/badge/-%20%20%20%20%20-${h.slice(1)}?style=flat-square)`;
const strat = (b: ResolvedBrand) => b.strategy;
const quote = (s: string) => `“${s}”`;

export function frontmatter(b: ResolvedBrand) {
  const P = b.profile;
  return `---
watercolor: 1
brand: ${JSON.stringify(b.name)}
url: ${b.url}
generated: ${P.generatedAt.slice(0, 10)}
mode: ${b.strategy.mode}
scheme: ${b.scheme}
colors:
  background: "${b.roles.background}"
  foreground: "${b.roles.foreground}"
  primary: "${b.roles.primary}"
  accent: [${b.roles.accent.slice(0, 3).map((a) => `"${a}"`).join(", ")}]
fonts:
  display: ${JSON.stringify(b.fonts.display.family)}
  body: ${JSON.stringify(b.fonts.body.family)}
  mono: ${JSON.stringify(b.fonts.mono.family)}
radius: { button: "${b.radius.button}", card: "${b.radius.card}" }
spacing_base: ${b.spacing.base}
motion: { fast: ${b.motion.fast}, base: ${b.motion.base}, slow: ${b.motion.slow}, ease: "${b.motion.standard}" }
---`;
}

export function intro(b: ResolvedBrand) {
  return `# ${b.name} — WATERCOLOR.md

> The single source of truth for designing, writing and building **on-brand for ${b.name}**. Measured from [${b.domain}](${b.url}) by [watercolor](https://github.com/rayhankhilji/watercolor), then distilled into rules. When this file and your instincts disagree, **this file wins**.
>
> **For agents:** read §0 before generating anything. Tokens live in \`tokens/\`; assets are indexed in §12. Values marked *derived* were generated to complete the system; everything else was observed on the live site.`;
}

export function rulesSection(b: ResolvedBrand) {
  const rules = hardRules(b);
  const extra = strat(b).visual?.do ?? [];
  return `## 0. The rules

${rules.map((r, i) => `${i + 1}. ${r.text}`).join("\n")}
${extra.length ? extra.map((d, i) => `${rules.length + i + 1}. ${d}`).join("\n") + "\n" : ""}`;
}

export function essenceSection(b: ResolvedBrand) {
  const s = strat(b);
  const P = b.profile;
  const c = s.company ?? {};
  const lines: string[] = ["## 1. Brand essence", ""];
  lines.push(`**${b.name}** — ${c.oneLiner ?? P.identity.description ?? b.tagline}`);
  lines.push("");
  const facts: [string, string][] = [];
  facts.push(["Category", c.category ?? P.company.categories.map((x) => x.name).join(", ") ?? "—"]);
  facts.push(["Model", `${c.businessModel ?? P.company.model.guess}${P.company.motion !== "unknown" ? ` · ${P.company.motion}` : ""}`]);
  if (c.audience?.primary) facts.push(["Primary audience", c.audience.primary]);
  if (c.audience?.buyer) facts.push(["Buyer", c.audience.buyer]);
  if (c.audience?.user) facts.push(["User", c.audience.user]);
  if (c.stage) facts.push(["Stage", c.stage]);
  if (c.competitors?.length) facts.push(["Competitive set", c.competitors.join(", ")]);
  if (P.company.customers.length) facts.push(["Customers shown", P.company.customers.slice(0, 12).join(", ")]);
  if (P.company.stats.length) facts.push(["Proof points", P.company.stats.slice(0, 5).join(" · ")]);
  lines.push(table(["", ""], facts));
  lines.push("");
  if (s.positioning?.statement) lines.push(`**Positioning.** ${s.positioning.statement}`, "");
  if (s.positioning?.promise) lines.push(`**Promise.** ${s.positioning.promise}`, "");
  if (s.positioning?.pillars?.length) {
    lines.push("**Pillars**", "");
    for (const p of s.positioning.pillars) lines.push(`- **${p.name}** — ${p.description}`);
    lines.push("");
  }
  if (c.differentiators?.length) lines.push("**What makes it different**", "", ...c.differentiators.map((d) => `- ${d}`), "");
  lines.push("### Personality", "");
  if (s.personality?.summary) lines.push(s.personality.summary, "");
  if (s.personality?.traits?.length) {
    lines.push(table(["We are", "We are not", ""], s.personality.traits.map((t) => [`**${t.trait}**`, t.notThis, t.description ?? ""])));
    lines.push("");
  } else {
    lines.push("*Observed from the site (run the strategy step for a fuller read):*", "", ...observedPersonality(b).map((o) => `- ${o}`), "");
  }
  const sp = s.personality?.spectrum;
  if (sp) {
    const bar = (v: number | undefined) => (v === undefined ? "" : "`" + "─".repeat(Math.round(v * 10)) + "●" + "─".repeat(10 - Math.round(v * 10)) + "`");
    const rows: [string, number | undefined, string][] = [
      ["Formal", sp.formalCasual, "Casual"],
      ["Serious", sp.seriousPlayful, "Playful"],
      ["Technical", sp.technicalAccessible, "Accessible"],
      ["Restrained", sp.restrainedExpressive, "Expressive"],
      ["Classic", sp.classicModern, "Modern"],
      ["Quiet", sp.quietLoud, "Loud"],
    ];
    lines.push(table(["", "", ""], rows.filter((r) => r[1] !== undefined).map(([a, v, z]) => [a, bar(v), z])), "");
  }
  if (s.personality?.archetype) lines.push(`**Archetype:** ${s.personality.archetype}`, "");
  return lines.join("\n");
}

export function voiceSection(b: ResolvedBrand) {
  const v = b.profile.voice;
  const s = strat(b).voice ?? {};
  const st = v.stats;
  const L: string[] = ["## 2. Voice & copy", ""];
  if (s.summary) L.push(s.summary, "");
  if (s.principles?.length) {
    for (const p of s.principles) {
      L.push(`**${p.name}.** ${p.description}`);
      if (p.do || p.dont) L.push(`  - ✓ ${p.do ?? ""}${p.dont ? `\n  - ✗ ${p.dont}` : ""}`);
    }
    L.push("");
  }
  L.push("### Mechanics (measured)", "");
  L.push(
    table(
      ["", ""],
      [
        ["Heading case", st.headingCase],
        ["Average headline length", `${st.avgHeadlineWords} words`],
        ["Average sentence length", `${st.avgSentenceLength} words`],
        ["Reading grade (Flesch-Kincaid)", st.readingGrade],
        ["Addresses the reader (you/your)", `${st.secondPerson} per 100 words`],
        ["Speaks as we/our", `${st.firstPersonPlural} per 100 words`],
        ["Exclamation marks", st.exclamationRate ? `${Math.round(st.exclamationRate * 100)}% of sentences` : "never"],
        ["Emoji", st.emojiRate ? `${st.emojiRate} per 100 words` : "never"],
        ["Periods on headlines", `${Math.round(st.periodsInHeadlines * 100)}% of headlines`],
        ["Em dashes", st.emDash ? "yes" : "no"],
        ["Oxford comma", st.oxfordComma],
      ],
    ),
    "",
  );
  if (s.mechanics?.length) L.push(...s.mechanics.map((m) => `- ${m}`), "");
  if (s.vocabulary?.use?.length || s.vocabulary?.avoid?.length) {
    L.push("### Vocabulary", "");
    if (s.vocabulary.use?.length) L.push(`**Say:** ${s.vocabulary.use.map((w) => `\`${w}\``).join(" · ")}`, "");
    if (s.vocabulary.avoid?.length) L.push(`**Don't say:** ${s.vocabulary.avoid.map((w) => `~~${w}~~`).join(" · ")}`, "");
  }
  L.push("### The brand in its own words", "");
  L.push("**Headlines**", "", ...v.headlines.slice(0, 10).map((h) => `> ${h}`), "");
  if (v.ctas.length) L.push(`**Calls to action:** ${v.ctas.slice(0, 10).map((c) => `\`${c}\``).join(" · ")}`, "");
  if (v.topTerms.length) L.push(`**Recurring terms:** ${v.topTerms.slice(0, 16).map((t) => t.term).join(", ")}`, "");
  if (s.examples?.length) {
    L.push("### Rewrites", "");
    L.push(table(["Context", "On brand ✓", "Off brand ✗"], s.examples.map((e) => [e.context, e.onBrand, e.offBrand ?? ""])), "");
  }
  if (s.taglines?.length) L.push("### Tagline options", "", ...s.taglines.map((t) => `- ${quote(t)}`), "");
  return L.join("\n");
}

export function colorSection(b: ResolvedBrand, t: TokenModel) {
  const r = b.roles;
  const names = strat(b).colorNames ?? {};
  const L: string[] = ["## 3. Color", ""];
  if (strat(b).visual?.colorUsage) L.push(strat(b).visual!.colorUsage!, "");
  L.push(`Scheme: **${b.scheme}**. ${b.monochrome ? "Monochrome brand — ink is the accent." : `Primary ${hx(r.primary)} is the one color that means "${b.name}".`}`, "");
  L.push(
    table(
      ["", "Token", "Hex", "OKLCH", "Name", "Use"],
      t.colors.map(([k, v, d]) => [swatch(v), `\`--color-${k}\``, hx(v), `\`${oklchCss(v)}\``, names[v] ?? describeColor(v), d ?? ""]),
    ),
    "",
  );
  const ratio = strat(b).visual?.colorRatio ?? colorRatio(b);
  L.push("**Proportion** (share of painted surface on the live site):", "", ratio.map((x) => `- ${x.name}: **${x.percent}%**`).join("\n"), "");
  L.push("### Contrast", "");
  L.push(
    table(
      ["Foreground", "on Background", "WCAG", "APCA Lc", "Pass"],
      b.profile.colors.contrast.map((c) => [hx(c.fg), hx(c.bg), `${c.ratio}:1`, c.apca, c.aaa ? "AAA" : c.aa ? "AA" : c.aaLarge ? "AA large" : "✗ decorative only"]),
    ),
    "",
  );
  L.push("### Scales", "", "OKLCH ramps generated around each brand color. The brand's exact value is pinned (●) at its nearest step, so tints and shades stay in family.", "");
  const steps = Object.keys(Object.values(t.ramps)[0] ?? {});
  L.push(table(["", ...steps], Object.entries(b.ramps).map(([k, rr]) => [k, ...steps.map((s) => `${rr.steps[s]}${s === rr.pinned ? " ●" : ""}`)])), "");
  if (b.profile.colors.gradients.length || b.gradient.length) {
    L.push("### Gradient", "");
    L.push(`${b.gradientIsCaptured ? "Measured on site" : "*Derived* from the palette"}: ${b.gradient.map(hx).join(" → ")}`, "");
    L.push(code("css", `background: linear-gradient(120deg, ${b.gradient.join(", ")});`), "");
    const shaderCanvas = b.profile.media.canvases.find((c) => /webgl/.test(c.kind));
    if (shaderCanvas) L.push(`The live site renders an animated **WebGL** surface (${shaderCanvas.width}×${shaderCanvas.height}). Recording: \`${shaderCanvas.recording ?? shaderCanvas.gif ?? "—"}\`; shader sources in \`captured/shaders/\`. A brand-faithful recreation ships as \`motion/gradient-loop.*\`.`, "");
  }
  L.push(`### ${b.scheme === "light" ? "Dark" : "Light"} theme (*derived*)`, "", `The site ships one theme. This counterpart is built from the brand's own neutrals; apply with \`[data-theme="${b.scheme === "light" ? "dark" : "light"}"]\`.`, "");
  L.push(table(["Token", "Value"], t.dark.map(([k, v]) => [`\`--color-${k}\``, hx(v)])), "");
  const vars = b.profile.cssVariables.filter((v) => v.kind === "color").slice(0, 24);
  if (vars.length) {
    L.push("<details><summary>Original CSS variables found on the site</summary>", "", table(["Variable", "Value"], vars.map((v) => [`\`${v.name}\``, `\`${v.value.slice(0, 60)}\``])), "", "</details>", "");
  }
  return L.join("\n");
}

export function typeSection(b: ResolvedBrand) {
  const L: string[] = ["## 4. Typography", ""];
  if (strat(b).visual?.typography) L.push(strat(b).visual!.typography!, "");
  const fams = b.profile.typography.families;
  L.push(
    table(
      ["Family", "CSS name", "Roles", "Weights", "Source", "Open alternative"],
      fams.map((f) => [`**${f.family}**`, `\`${f.cssFamily}\``, f.roles.join(", "), f.weights.join(" "), f.source, f.alternatives.join(", ") || "—"]),
    ),
    "",
  );
  if (fams.some((f) => f.alternatives.length && f.source !== "google"))
    L.push("> Proprietary faces are captured to `captured/fonts/` **for reference and local rendering only**. License them from the foundry before shipping; until then use the open alternative, which the token stacks already include as the first fallback.", "");
  L.push("### Scale", "");
  L.push(
    table(
      ["Style", "Family", "Size", "Weight", "Line height", "Tracking", "Case", "Sample"],
      Object.values(b.type).map((s) => [`\`${s.name}\``, s.family, `${s.size}px`, s.weight, s.lineHeight, `${s.letterSpacing.toFixed(3)}em`, s.textTransform === "none" ? "—" : s.textTransform, s.sample ? quote(s.sample.slice(0, 48)) : ""]),
    ),
    "",
  );
  const sc = b.profile.typography.scale;
  L.push(`Base **${sc.base}px**; measured ratio ≈ **${sc.ratio}** (${sc.ratioName}). Sizes in use: ${sc.sizes.join(", ")}.${b.profile.typography.measure ? ` Body measure ≈ ${b.profile.typography.measure} characters.` : ""}`, "");
  if (b.profile.typography.features.length) L.push(`OpenType features in use: ${b.profile.typography.features.map((f) => `\`${f}\``).join(", ")}.`, "");
  L.push(code("css", `.display { font: ${b.type.display.weight} ${b.type.display.size}px/${b.type.display.lineHeight} var(--font-display); letter-spacing: ${b.type.display.letterSpacing}em; }\n.body { font: ${b.type.body.weight} ${b.type.body.size}px/${b.type.body.lineHeight} var(--font-body); }`), "");
  return L.join("\n");
}

export function layoutSection(b: ResolvedBrand) {
  const l = b.profile.layout;
  const sp = b.profile.spacing;
  const L: string[] = ["## 5. Layout & spacing", ""];
  if (strat(b).visual?.layout) L.push(strat(b).visual!.layout!, "");
  L.push(
    table(
      ["", ""],
      [
        ["Content max-width", `${l.maxWidth}px`],
        ["Other containers", l.containers.slice(0, 5).map((c) => `${c.value}px`).join(", ")],
        ["Grid columns in use", l.gridColumns.join(", ") || "—"],
        ["Gutter", `${l.gutter}px`],
        ["Breakpoints", l.breakpoints.map((x) => `${x}px`).join(" · ") || "—"],
        ["Spacing unit", `${sp.base}px`],
        ["Spacing scale", sp.scale.join(", ")],
        ["Section padding", sp.sectionPadding.map((x) => `${x}px`).join(", ")],
        ["Density", l.density],
        ["Alignment", l.alignment],
      ],
    ),
    "",
  );
  return L.join("\n");
}

export function shapeSection(b: ResolvedBrand) {
  const s = b.profile.shape;
  const L: string[] = ["## 6. Shape & depth", ""];
  if (strat(b).visual?.shape) L.push(strat(b).visual!.shape!, "");
  L.push(`Shape language: **${s.language}**.`, "");
  L.push(table(["Radius", "Value", "Uses"], s.radii.map((r) => [r.name, `\`${r.value}\``, r.count])), "");
  if (s.shadows.length) L.push("**Elevation**", "", table(["Level", "box-shadow"], s.shadows.map((x) => [x.name, `\`${x.value}\``])), "");
  if (s.borders.length) L.push("**Borders**", "", table(["Width", "Style", "Color", "Uses"], s.borders.map((x) => [`${x.width}px`, x.style, hx(x.color), x.count])), "");
  return L.join("\n");
}

export function motionSection(b: ResolvedBrand, assets?: AssetIndex) {
  const m = b.profile.motion;
  const s = strat(b).motion ?? {};
  const L: string[] = ["## 7. Motion", ""];
  if (s.summary) L.push(s.summary, "");
  L.push(`Intensity: **${m.intensity}**.${m.libraries.length ? ` Stack: ${m.libraries.join(", ")}.` : ""}${m.smoothScroll ? " Smooth (inertial) scrolling." : ""}`, "");
  if (s.principles?.length) L.push(...s.principles.map((p) => `- **${p.name}** — ${p.description}`), "");
  L.push(table(["Token", "Value", "Use"], [
    ["`--duration-fast`", `${b.motion.fast}ms`, "Hover, press, color changes"],
    ["`--duration-base`", `${b.motion.base}ms`, "Small movement, dropdowns, toggles"],
    ["`--duration-slow`", `${b.motion.slow}ms`, "Reveals, page-level transitions"],
    ["`--ease-standard`", `\`${b.motion.standard}\``, "Default for on-screen movement"],
    ["`--ease-entrance`", `\`${b.motion.entrance}\``, "Elements arriving"],
    ["`--ease-exit`", `\`${b.motion.exit}\``, "Elements leaving (*derived*)"],
    ["`--ease-emphasis`", `\`${b.motion.emphasis}\``, "Celebratory / attention moments"],
  ]), "");
  if (m.easings.length) L.push("**Curves measured on the site**", "", table(["Curve", "Character", "Uses"], m.easings.map((e) => [`\`${e.value}\``, `${e.name} — ${e.character}`, e.count])), "");
  if (m.durations.length) L.push(`**Durations measured:** ${m.durations.map((d) => `${d.ms}ms (${d.count})`).join(", ")}`, "");
  if (m.scrollEffects.length) L.push("**Scroll & ambient motion:** " + m.scrollEffects.join("; ") + ".", "");
  const used = m.keyframes.filter((k) => k.count > 0);
  if (used.length) L.push("**Keyframes in use**", "", table(["Name", "What it does", "Uses"], used.slice(0, 12).map((k) => [`\`${k.name}\``, k.summary, k.count])), "");
  if (s.signature) L.push(`**Signature motion.** ${s.signature}`, "");
  if (assets?.motion.length) L.push("**Rendered motion assets** (`motion/`):", "", ...assets.motion.map((x) => `- \`${x.name}\` — ${x.title}: ${x.description}`), "");
  L.push("Always honor `prefers-reduced-motion` (see `motion/motion.css`).", "");
  return L.join("\n");
}

function componentCss(c: ComponentSample) {
  const s = c.styles;
  const pick = (k: string) => s[k];
  const lines: string[] = [];
  const add = (k: string, v?: string) => v && lines.push(`  ${k}: ${v};`);
  add("background", pick("background-color"));
  if (pick("background-image")) add("background-image", pick("background-image"));
  add("color", pick("color"));
  add("font", `${pick("font-weight") ?? 400} ${pick("font-size")}/${pick("line-height")} ${pick("font-family")?.split(",")[0]}`);
  if (pick("letter-spacing")) add("letter-spacing", pick("letter-spacing"));
  if (pick("text-transform")) add("text-transform", pick("text-transform"));
  add("padding", [pick("padding-top"), pick("padding-right"), pick("padding-bottom"), pick("padding-left")].map((x) => x ?? "0px").join(" "));
  if (pick("border-top-width")) add("border", `${pick("border-top-width")} ${pick("border-top-style") ?? "solid"} ${pick("border-top-color")}`);
  add("border-radius", pick("border-top-left-radius"));
  add("box-shadow", pick("box-shadow"));
  if (pick("height")) add("height", pick("height"));
  add("transition", pick("transition"));
  return lines.join("\n");
}

export function componentsSection(b: ResolvedBrand) {
  const c = b.profile.components;
  const L: string[] = ["## 8. Components", "", "Exact computed styles captured from the live site. Hover states were measured by actually hovering.", ""];
  for (const btn of c.buttons.slice(0, 5)) {
    L.push(`### Button — ${btn.variant}`, "", `Seen as ${quote(btn.text)} (${btn.count}×)${btn.screenshot ? ` · ![](${btn.screenshot})` : ""}`, "");
    L.push(code("css", `.btn-${btn.variant.replace(/[^a-z0-9-]/g, "")} {\n${componentCss(btn)}\n}${btn.hover ? `\n.btn-${btn.variant.replace(/[^a-z0-9-]/g, "")}:hover {\n${Object.entries(btn.hover).map(([k, v]) => `  ${k}: ${v};`).join("\n")}\n}` : ""}`), "");
  }
  for (const [title, list] of [["Input", c.inputs], ["Card", c.cards], ["Badge", c.badges]] as const) {
    const first = list[0];
    if (!first) continue;
    L.push(`### ${title}${first.variant !== "default" ? ` — ${first.variant}` : ""}`, "", first.screenshot ? `![](${first.screenshot})` : "", "", code("css", `.${title.toLowerCase()} {\n${componentCss(first)}\n}`), "");
  }
  if (c.nav?.screenshot) L.push("### Navigation", "", `![](${c.nav.screenshot})`, "", `Items: ${c.nav.text}`, "");
  if (c.footer?.screenshot) L.push("### Footer", "", `![](${c.footer.screenshot})`, "");
  return L.join("\n");
}

export function iconSection(b: ResolvedBrand) {
  const i = b.profile.icons;
  const L: string[] = ["## 9. Iconography", ""];
  if (strat(b).visual?.iconography) L.push(strat(b).visual!.iconography!, "");
  if (!i.items.length) {
    L.push("No inline icons were found. If you add icons, match the stroke weight to the body text weight and use the ink color.", "");
    return L.join("\n");
  }
  L.push(
    table(
      ["", ""],
      [
        ["Style", i.style.dominant],
        ["Stroke width", i.style.strokeWidth ? `${i.style.strokeWidth}px` : "—"],
        ["Grid", i.style.grid ? `${i.style.grid}×${i.style.grid}` : "—"],
        ["Line caps / joins", `${i.style.linecap ?? "—"} / ${i.style.linejoin ?? "—"}`],
        ["Corners", i.style.cornerStyle ?? "—"],
        ["Library", i.library ?? "custom / unknown"],
        ["Captured", `${i.items.length} icons in \`captured/icons/\``],
      ],
    ),
    "",
  );
  L.push(`**Drawing a new icon:** ${i.style.grid ?? 24}px grid, ${i.style.dominant === "stroke" ? `${i.style.strokeWidth ?? 1.5}px stroke, ${i.style.linecap ?? "round"} caps, ${i.style.linejoin ?? "round"} joins, no fills` : "solid fills, consistent optical weight"}, color \`currentColor\`. Keep ≥ 2px between parallel strokes and align to whole pixels.`, "");
  return L.join("\n");
}

export function imagerySection(b: ResolvedBrand) {
  const im = b.profile.imagery;
  const md = b.profile.media;
  const L: string[] = ["## 10. Imagery & media", ""];
  if (strat(b).visual?.imagery) L.push(strat(b).visual!.imagery!, "");
  L.push(`Mix on site: ${im.summary.photo} photos · ${im.summary.illustration} illustrations · ${im.summary.screenshot} product screenshots · ${im.summary.other} other.`, "");
  const rows: string[][] = [];
  if (md.videos.length) rows.push(["Videos", `${md.videos.length} (${md.videos.filter((v) => v.path).length} downloaded to \`captured/videos/\`)`]);
  if (md.gifs.length) rows.push(["GIFs", `${md.gifs.length} in \`captured/gifs/\``]);
  if (md.lotties.length) rows.push(["Lottie", `${md.lotties.length} in \`captured/lottie/\``]);
  if (md.rive.length) rows.push(["Rive", `${md.rive.length} in \`captured/rive/\``]);
  if (md.canvases.length) rows.push(["Animated canvases", `${md.canvases.length} recorded to \`captured/canvas/\``]);
  if (md.shaders.length) rows.push(["WebGL shaders", `${md.shaders.length} GLSL sources in \`captured/shaders/\``]);
  if (md.recordings.length) rows.push(["Scroll recording", md.recordings.map((r) => `\`${r.path}\``).join(", ")]);
  if (rows.length) L.push(table(["Media", ""], rows), "");
  if (im.customerLogos.length) L.push(`**Customer logos shown:** ${im.customerLogos.map((c) => c.name).join(", ")}`, "");
  return L.join("\n");
}

export function logoSection(b: ResolvedBrand, assets?: AssetIndex) {
  const lg = b.profile.logo;
  const s = strat(b).logo ?? {};
  const L: string[] = ["## 11. Logo", ""];
  if (lg.primary) L.push(`Primary: \`${lg.primary.path}\` (${lg.primary.type}, ${lg.primary.format}, from the ${lg.primary.context}; confidence signals: ${lg.primary.reasons.join(", ")}).`, "");
  if (assets) L.push(`Mark: ${assets.markSource === "split" ? "split automatically from the lockup" : assets.markSource === "monogram" ? "*derived* monogram (no symbol found)" : `taken from the ${assets.markSource}`}.`, "");
  L.push("Files in `logo/`: SVG (original, black, white, ink" + (b.monochrome ? "" : ", primary") + "), PNG at 512/1024/2048, favicon set, app icons, and lockups on light/dark/brand/gradient.", "");
  L.push(`- **Clear space:** ${s.clearspace ?? "at least the cap-height of the wordmark on every side."}`);
  L.push(`- **Minimum size:** ${s.minSize ?? "16px tall on screen (wordmark), 16px for the mark."}`);
  L.push(`- **On color:** use the white version on ${hx(b.roles.inverseBackground)} and on the primary; the ink version on light surfaces.`);
  L.push("", "**Never:**", ...(s.misuse ?? ["stretch or skew it", "recolor it outside the provided variants", "add effects (shadows, glows, outlines)", "place it on busy imagery without a scrim", "rebuild it in a different typeface"]).map((m) => `- ${m}`), "");
  if (lg.brandKit.length) L.push(`Official brand-kit files were found and downloaded to \`captured/brand-kit/\` (${lg.brandKit.length}). Prefer them over extracted SVGs.`, "");
  return L.join("\n");
}

export function assetsSection(b: ResolvedBrand, assets: AssetIndex) {
  const L: string[] = ["## 12. Asset index", ""];
  L.push("| Folder | Contents |", "| --- | --- |");
  L.push("| `tokens/` | `tokens.json` (W3C DTCG) · `tokens.css` · `tailwind.css` (v4) · `tokens.figma.json` (Tokens Studio) · `tokens.ts` · `tokens.scss` |");
  L.push("| `colors/` | `palette.png` spec sheet · `palette.ase` (Adobe) · `palette.gpl` · `palette.json` |");
  L.push("| `typography/` | `specimen.png` |");
  L.push(`| \`logo/\` | ${assets.logo.length} files — SVG/PNG variants, lockups, \`favicon/\` (ico, svg, png, manifest, head.html), \`app-icon/\` |`);
  L.push(`| \`patterns/\` | ${assets.patterns.map((p) => p.name).join(", ")} (SVG + PNG${assets.patterns.some((p) => p) ? ", seamless tiles in `tiles/`" : ""}) |`);
  L.push(`| \`social/\` | ${assets.social.map((s) => s.name).join(", ")} — PNG + editable HTML in \`social/templates/\` |`);
  L.push(`| \`motion/\` | ${assets.motion.map((m) => m.name).join(", ")} (MP4 · WebM · GIF · poster) · \`motion.css\` · \`loader.svg\` · \`easing-curves.svg\` · HTML sources |`);
  L.push("| `templates/` | email signature · business cards · slide deck (HTML + PDF) · letterhead (PDF) · video-call background |");
  L.push("| `guidelines/` | `index.html` brand book · `brand-book.pdf` |");
  L.push("| `captured/` | Everything taken from the live site: screenshots, logos, fonts, icons, images, videos, GIFs, Lottie, Rive, shaders, canvas recordings, components, scroll recording |");
  L.push("");
  L.push("**Patterns**", "", ...assets.patterns.map((p) => `- \`${p.name}\` — ${p.description}${p.derived ? " *(derived)*" : ""}`), "");
  return L.join("\n");
}

export function doDontSection(b: ResolvedBrand) {
  const s = strat(b).visual ?? {};
  const L: string[] = ["## 13. Do / Don't", ""];
  if (s.do?.length) L.push("**Do**", "", ...s.do.map((d) => `- ✓ ${d}`), "");
  L.push("**Don't** — the generic-AI tells this brand never shows:", "", ...[...(s.dont ?? []), ...antiSlop(b)].map((d) => `- ✗ ${d}`), "");
  return L.join("\n");
}

export function implementationSection(b: ResolvedBrand) {
  const primary = b.profile.components.buttons.find((x) => x.variant === "primary");
  return `## 14. Implementation

${code("css", `@import "./tokens/tokens.css";\n\nbody { background: var(--color-background); color: var(--color-foreground); font-family: var(--font-body); }\nh1 { font: var(--text-h1-weight) var(--text-h1-size)/var(--text-h1-line-height) var(--font-display); letter-spacing: var(--text-h1-tracking); }`)}

Tailwind v4:

${code("css", `@import "tailwindcss";\n@import "./tokens/tailwind.css";`)}

${code("tsx", `export function Button({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className="inline-flex items-center gap-2 rounded-[var(--radius-button)] bg-primary px-4 py-2 text-[length:var(--text-label-size)] font-medium text-primary-foreground transition-colors duration-[${b.motion.fast}ms] ease-standard hover:bg-primary-${hoverStep(b)} focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
    >
      {children}
    </button>
  );
}`)}
${primary?.hover ? `\nMeasured hover on the live primary button: ${Object.entries(primary.hover).map(([k, v]) => `\`${k}: ${v}\``).join(", ")}.\n` : ""}
**Using this file with an agent.** Add one line to your \`CLAUDE.md\` / \`AGENTS.md\` / \`.cursorrules\`:

${code("md", `All UI, copy and assets must follow brand/WATERCOLOR.md. Use tokens from brand/tokens/. Never invent colors, fonts, radii or easing.`)}
`;
}

function hoverStep(b: ResolvedBrand) {
  const r = b.ramps.primary;
  if (!r) return "600";
  const steps = Object.keys(r.steps);
  const i = steps.indexOf(r.pinned);
  return steps[Math.min(steps.length - 1, i + 1)];
}

export function provenanceSection(b: ResolvedBrand) {
  const P = b.profile;
  return `## 15. Provenance

- Source: ${P.source.pages.map((p) => `[${p.kind}](${p.url})`).join(" · ")}
- Captured ${P.generatedAt.slice(0, 16).replace("T", " ")} UTC with watercolor ${P.source.tool.version}; mode **${b.strategy.mode}**${b.strategy.rationale ? ` — ${b.strategy.rationale}` : ""}.
- Stack detected: ${[...P.stack.frameworks, ...P.stack.styling, ...P.stack.animation, ...P.stack.platform].join(", ") || "—"}.
- Strategy layer: ${b.strategy.company || b.strategy.voice ? "authored (strategy.json)" : "not yet written — sections marked *observed* are heuristic. Run the strategy step for positioning, personality and voice."}
${P.warnings.length ? `- Notes:\n${P.warnings.map((w) => `  - ${w}`).join("\n")}` : ""}

<sub>Logos, fonts and imagery belong to their owners. Captured files are for internal reference; respect trademarks and font licenses.</sub>
`;
}

export function contrastBadge(fg: string, bg: string) {
  const r = contrast(fg, bg);
  return `${r}:1 · Lc ${apca(fg, bg)}`;
}
void readableOn;

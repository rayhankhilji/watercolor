import type { ResolvedBrand } from "../../profile/resolve.js";
import { isNeutral, oklch, distance, contrast, describeColor } from "../../util/color.js";

/**
 * Data-grounded observations. These run without any LLM: every statement is backed by a
 * measurement in brand.json. The agent's strategy layer adds the "why" on top.
 */

export interface Rule {
  text: string;
  evidence: string;
}

export function colorRatio(b: ResolvedBrand) {
  const p = b.profile.colors.palette;
  let neutralLight = 0;
  let ink = 0;
  let primary = 0;
  let accent = 0;
  for (const s of p) {
    if (distance(s.hex, b.roles.primary) < 0.04) primary += s.share;
    else if (!isNeutral(s.hex, 0.045) && oklch(s.hex).c > 0.06 && oklch(s.hex).l >= 0.35) accent += s.share;
    else if (oklch(s.hex).l > 0.6) neutralLight += s.share;
    else ink += s.share;
  }
  const total = neutralLight + ink + primary + accent || 1;
  const pct = (n: number) => Math.round((n / total) * 100);
  const darkScheme = b.scheme === "dark";
  return [
    { name: darkScheme ? "Dark surfaces" : "Light surfaces", percent: pct(darkScheme ? ink : neutralLight) },
    { name: darkScheme ? "Light text & lines" : "Ink & text", percent: pct(darkScheme ? neutralLight : ink) },
    { name: b.monochrome ? "Accent (ink as primary)" : "Primary", percent: pct(primary) },
    { name: "Accents", percent: pct(accent) },
  ].filter((x) => x.percent > 0);
}

export function hardRules(b: ResolvedBrand): Rule[] {
  const r = b.roles;
  const P = b.profile;
  const rules: Rule[] = [];
  const pName = b.strategy.colorNames?.[r.primary] ?? describeColor(r.primary);
  const ratio = colorRatio(b);
  const primaryPct = ratio.find((x) => x.name === "Primary")?.percent;

  if (!b.monochrome)
    rules.push({
      text: `**Primary is \`${r.primary.toUpperCase()}\`** (${pName}). Spend it on actions, focus and key accents — it covers only ~${primaryPct ?? 5}% of the surface. Text on it is \`${r.primaryForeground.toUpperCase()}\`.`,
      evidence: "colors.roles.primary, palette shares, primary button styles",
    });
  else
    rules.push({
      text: `**The brand is monochrome.** Primary actions use the ink \`${r.primary.toUpperCase()}\`; hierarchy comes from contrast, weight and space — never from adding a hue.`,
      evidence: "no chromatic color carries meaningful usage",
    });

  const fgL = oklch(r.foreground).l;
  if (fgL > 0.05 && b.scheme === "light") rules.push({ text: `**Ink is \`${r.foreground.toUpperCase()}\`, not black.** Never use \`#000\` for text or UI.`, evidence: `foreground L=${fgL.toFixed(2)}` });
  if (b.scheme === "dark") rules.push({ text: `**Dark-first.** Background \`${r.background.toUpperCase()}\`, text \`${r.foreground.toUpperCase()}\`. Design dark, then derive light.`, evidence: "page background luminance" });

  const vs = P.voice.stats;
  if (vs.headingCase === "sentence") rules.push({ text: "**Headlines are sentence case.** Capitalize only the first word and proper nouns.", evidence: "heading case analysis" });
  if (vs.headingCase === "title") rules.push({ text: "**Headlines are Title Case.**", evidence: "heading case analysis" });
  if (vs.headingCase === "lower") rules.push({ text: "**Headlines are all lowercase.** It's a signature — keep it.", evidence: "heading case analysis" });
  if (vs.headingCase === "upper") rules.push({ text: "**Headlines are set in caps.** Track them out slightly; keep them short.", evidence: "heading case analysis" });

  const h1 = b.type.h1;
  const display = b.fonts.display.family;
  rules.push({
    text: `**Display type is ${display} ${h1.weight}** at ${h1.size}px / ${h1.lineHeight} with ${h1.letterSpacing <= -0.005 ? `${h1.letterSpacing.toFixed(3)}em tracking (tight)` : "default tracking"}.${h1.weight <= 400 ? " Light, not bold — weight never carries hierarchy, size does." : h1.weight >= 700 ? " Heavy and confident." : ""}`,
    evidence: "typography.styles h1",
  });
  const tt = P.typography.twoTone;
  if (tt) rules.push({ text: `**Two-tone headlines.** Set the statement in \`${tt.primary.toUpperCase()}\` and the continuation in \`${tt.secondary.toUpperCase()}\` — same size, same weight. Hierarchy by color, not bold.`, evidence: `${tt.examples.length} headings measured with two text colors` });
  const body = b.type.body;
  rules.push({ text: `**Body copy is ${b.fonts.body.family} ${body.weight}, ${body.size}px / ${body.lineHeight}** in \`${(body.color ?? r.muted).toUpperCase()}\`.`, evidence: "typography.styles body" });

  rules.push({ text: `**Spacing sits on a ${b.spacing.base}px grid.** Use the scale: ${b.spacing.scale.filter((v) => v >= b.spacing.base).slice(0, 9).join(" · ")}.`, evidence: "spacing.raw divisibility" });

  const lang = P.shape.language;
  const btnR = b.radius.button;
  rules.push({
    text: `**Shape language is ${lang}.** Buttons use ${btnR === "9999px" ? "fully rounded (pill)" : btnR} corners; cards ${b.radius.card}. ${lang === "sharp" ? "Don't round things." : lang === "pill" ? "Pills are part of the identity." : `Don't exceed ${b.radius.xl}px except for pills.`}`,
    evidence: "shape.radii, button & card styles",
  });

  const sh = P.shape.shadows[0]?.value ?? "";
  const tinted = /rgba\((?!0, 0, 0)(\d+), (\d+), (\d+)/.exec(sh);
  const light = tinted && Number(tinted[1]) > 200 && Number(tinted[2]) > 200 && Number(tinted[3]) > 200;
  if (light) rules.push({ text: `**Depth comes from light, not shadow.** Elevation uses faint white edges and inner highlights (\`${sh.slice(0, 60)}${sh.length > 60 ? "…" : ""}\`) rather than drop shadows.`, evidence: "shape.shadows (white-tinted)" });
  else if (tinted) rules.push({ text: `**Shadows are tinted** (\`rgb(${tinted[1]} ${tinted[2]} ${tinted[3]})\`), never neutral black. Elevation is soft and layered.`, evidence: "shape.shadows" });
  else if (!P.shape.shadows.length) rules.push({ text: "**No drop shadows.** Separation comes from borders and surface color.", evidence: "no box-shadows measured" });

  const m = b.motion;
  rules.push({ text: `**Interactions take ${m.fast}–${m.base}ms on \`${m.standard}\`.** Reveals ${m.slow}ms on \`${m.entrance}\`. Motion intensity: ${P.motion.intensity}.`, evidence: "motion.durations & easings" });

  if (b.gradientIsCaptured) rules.push({ text: `**The signature gradient is ${b.gradient.map((c) => `\`${c}\``).join(" → ")}.** Use it as a surface or accent stroke, never behind body text.`, evidence: "colors.gradients" });
  else rules.push({ text: "**Flat color.** The site uses no meaningful gradients — don't introduce decorative ones.", evidence: "no chromatic gradients measured" });

  if (vs.exclamationRate === 0) rules.push({ text: "**No exclamation marks.** Confidence is quiet.", evidence: "0 exclamations in corpus" });
  if (vs.emojiRate === 0) rules.push({ text: "**No emoji** in product or marketing copy.", evidence: "0 emoji in corpus" });

  const lowContrastBody = contrast(r.muted, r.background) < 4.5;
  if (lowContrastBody) rules.push({ text: `**Watch muted text contrast:** \`${r.muted}\` on \`${r.background}\` is ${contrast(r.muted, r.background)}:1 — use it only ≥ 18px or for non-essential text.`, evidence: "contrast table" });
  return rules;
}

/** Anti-slop: generic AI-design tropes this brand demonstrably does not use. */
export function antiSlop(b: ResolvedBrand): string[] {
  const P = b.profile;
  const out: string[] = [];
  const fams = P.typography.families.map((f) => f.family.toLowerCase()).join(" ");
  if (!/inter\b/.test(fams)) out.push("Don't default to Inter. The brand's type is part of its identity — use the brand faces (or their listed alternatives).");
  const purpleBlue = b.gradient.some((c) => oklch(c).h > 260 && oklch(c).h < 310 && oklch(c).c > 0.1);
  if (!purpleBlue) out.push("No purple-to-blue \"AI gradient\". It isn't in this palette.");
  if (!b.gradientIsCaptured) out.push("No mesh-gradient blobs or aurora backgrounds behind content.");
  out.push("No glassmorphism, frosted cards or glowing borders unless the component spec below shows them.");
  if (P.voice.stats.emojiRate === 0) out.push("No ✨ sparkles, 🚀 rockets or emoji bullets.");
  const corpus = [...P.voice.headlines, ...P.voice.paragraphs].join(" ").toLowerCase();
  const cliches = ["unlock", "empower", "revolutionize", "supercharge", "seamless", "cutting-edge", "game-changer", "next-level", "elevate", "harness", "leverage", "unleash", "transform your"];
  const absent = cliches.filter((c) => !corpus.includes(c));
  if (absent.length) out.push(`Avoid generic SaaS verbs the brand never uses: ${absent.slice(0, 8).map((c) => `"${c}"`).join(", ")}.`);
  if (P.shape.language !== "pill" && P.shape.language !== "rounded") out.push(`Don't use large rounded corners (16–24px "bubbly" cards). The brand is ${P.shape.language}.`);
  out.push("Don't center everything. Follow the measured alignment and grid.");
  if (P.icons.style.dominant !== "none") out.push(`Don't mix icon styles. Icons here are ${P.icons.style.dominant}${P.icons.style.strokeWidth ? ` at ${P.icons.style.strokeWidth}px stroke` : ""}.`);
  out.push("No stock 3D illustrations, isometric people or abstract 3D shapes unless they appear in the captured imagery.");
  return out;
}

/** Plain-language personality read from measurements (used when strategy.json is missing). */
export function observedPersonality(b: ResolvedBrand): string[] {
  const P = b.profile;
  const out: string[] = [];
  const h1 = b.type.h1;
  if (h1.weight <= 400) out.push("Quiet confidence — large, light display type rather than heavy headlines.");
  else if (h1.weight >= 700) out.push("Assertive — heavy display weights carry the message.");
  if (b.monochrome) out.push("Restrained — color is withheld; typography and space do the work.");
  else if (b.roles.accent.length >= 3) out.push("Vivid — a broad chromatic palette used with intent.");
  if (P.layout.density === "airy") out.push("Generous — lots of whitespace and slow rhythm.");
  if (P.layout.density === "dense") out.push("Information-dense — tight rhythm, lots on screen.");
  if (P.motion.intensity === "cinematic") out.push("Cinematic — motion, WebGL and video are first-class brand surfaces.");
  if (P.motion.intensity === "still") out.push("Still — almost no motion; interactions are instant.");
  if (P.voice.stats.secondPerson > P.voice.stats.firstPersonPlural) out.push("Customer-centric voice — speaks to 'you' more than about 'we'.");
  else if (P.voice.stats.firstPersonPlural > 0) out.push("Company-centric voice — 'we' leads.");
  if (P.voice.stats.readingGrade > 12) out.push("Sophisticated vocabulary — written for expert buyers.");
  else if (P.voice.stats.readingGrade && P.voice.stats.readingGrade < 8) out.push("Plain-spoken — short words, simple sentences.");
  if (P.shape.language === "sharp") out.push("Precise, engineered — square corners.");
  if (P.shape.language === "pill") out.push("Friendly — pill shapes soften the UI.");
  return out;
}

import path from "node:path";
import type { BrandProfile } from "../profile/schema.js";
import type { BrandMode } from "../profile/strategy.js";
import { write } from "../util/fs.js";
import { STRATEGY_SCHEMA_TS } from "./strategy-schema.js";

/**
 * brief.md — everything an agent needs to write strategy.json, in one file.
 * Kept compact on purpose: evidence first, then the task, then the schema.
 */
export function buildBrief(p: BrandProfile, mode: BrandMode = "extract") {
  const c = p.company;
  const r = p.colors.roles;
  const v = p.voice;
  const L: string[] = [];
  L.push(`# Watercolor brief — ${p.identity.name}`, "");
  L.push(`You are the brand strategist and design director for **${p.identity.name}** (${p.source.finalUrl}).`);
  L.push("Below is evidence measured from the live site. Your job: write `strategy.json` (schema at the end) so the generated kit explains *why* the brand looks and sounds the way it does and *how* to extend it.", "");
  L.push("## Ground rules", "");
  L.push("1. **Evidence over vibes.** Every claim must be traceable to the evidence below or the screenshots. If unsure, leave the field out.");
  L.push("2. **Specific over generic.** \"Confident, not arrogant\" is slop unless the copy proves it. Quote their own phrasing.");
  L.push("3. **Read the references first:** `skills/watercolor/references/principles.md`, `anti-slop.md` and the category playbook that fits (`categories/*.md`).");
  L.push("4. **Look at the screenshots** listed below before writing the visual sections.");
  L.push(`5. **Mode: \`${mode}\`.** ${modeText(mode)}`, "");

  L.push("## Identity", "");
  L.push(`- Name: ${p.identity.name} · Domain: ${p.identity.domain}`);
  L.push(`- Title: ${p.identity.title}`);
  if (p.identity.description) L.push(`- Meta description: ${p.identity.description}`);
  if (p.identity.tagline) L.push(`- H1: ${p.identity.tagline}`);
  L.push(`- Social: ${Object.entries(p.identity.social).map(([k, u]) => `${k} ${u}`).join(" · ") || "—"}`, "");

  L.push("## Company signals (heuristic — verify)", "");
  L.push(`- Model guess: **${c.model.guess}** (${c.model.reasons.join("; ")})`);
  L.push(`- Go-to-market: ${c.motion}; pricing page: ${c.hasPricing}; enterprise: ${c.hasEnterprise}; docs: ${c.hasDocs}; API: ${c.hasApi}`);
  L.push(`- Category scores: ${c.categories.map((x) => `${x.name} ${x.score} (${x.reasons.slice(0, 4).join(", ")})`).join("; ")}`);
  L.push(`- Customers on site: ${c.customers.join(", ") || "—"}`);
  L.push(`- Stats: ${c.stats.join(" · ") || "—"}`);
  L.push(`- CTAs: ${c.ctas.map((x) => `"${x.text}"×${x.count}`).join(", ")}`, "");

  L.push("## Copy corpus", "");
  L.push("**Headlines**", ...v.headlines.slice(0, 18).map((h) => `- ${h}`), "");
  L.push("**Sub-headlines**", ...v.subheadlines.slice(0, 12).map((h) => `- ${h}`), "");
  L.push("**Paragraphs**", ...v.paragraphs.slice(0, 16).map((h) => `- ${h}`), "");
  L.push(`**Navigation:** ${v.navigation.join(" · ")}`, "");
  L.push(`**Microcopy:** ${v.microcopy.slice(0, 20).join(" · ")}`, "");
  L.push(`**Voice stats:** ${JSON.stringify(v.stats)}`, "");
  L.push(`**Top terms:** ${v.topTerms.map((t) => t.term).join(", ")}`, "");

  L.push("## Page excerpts", "");
  for (const pg of c.pagesText) L.push(`### ${pg.kind} — ${pg.url}`, "", pg.excerpt.slice(0, 1800), "");

  L.push("## Visual system (measured)", "");
  L.push(`- Scheme: ${p.colors.scheme}; background ${r.background}, foreground ${r.foreground}, primary ${r.primary}, accents ${r.accent.join(", ") || "—"}`);
  L.push(`- Palette (hex · share · contexts): ${p.colors.palette.slice(0, 14).map((s) => `${s.hex} ${(s.share * 100).toFixed(1)}% [${s.contexts.slice(0, 3).join("/")}]`).join("; ")}`);
  L.push(`- Gradients: ${p.colors.gradients.slice(0, 4).map((g) => `${g.type}(${g.colors.slice(0, 5).join(", ")})`).join("; ") || "none"}`);
  L.push(`- Fonts: ${p.typography.families.map((f) => `${f.family} [${f.roles.join("/")}] weights ${f.weights.join(",")} (${f.source})`).join("; ")}`);
  L.push(`- Type styles: ${p.typography.styles.map((s) => `${s.name} ${s.size}/${s.lineHeight} w${s.weight} ${s.letterSpacing}em`).join("; ")}`);
  L.push(`- Spacing base ${p.spacing.base}px; radii ${p.shape.radii.map((x) => x.value).join(", ")} (${p.shape.language}); shadows ${p.shape.shadows.length}`);
  L.push(`- Layout: max ${p.layout.maxWidth}px, ${p.layout.density}, ${p.layout.alignment}`);
  L.push(`- Motion: ${p.motion.intensity}; durations ${p.motion.durations.slice(0, 5).map((d) => d.ms).join(", ")}ms; easings ${p.motion.easings.slice(0, 3).map((e) => `${e.name}`).join(", ")}; libs ${p.motion.libraries.join(", ") || "—"}`);
  L.push(`- Imagery: ${JSON.stringify(p.imagery.summary)}; videos ${p.media.videos.length}; lottie ${p.media.lotties.length}; canvases ${p.media.canvases.length}; shaders ${p.media.shaders.length}`);
  L.push(`- Icons: ${p.icons.items.length} (${p.icons.style.dominant}, ${p.icons.style.strokeWidth ?? "?"}px, ${p.icons.library ?? "custom"})`);
  L.push(`- Logo: ${p.logo.primary?.path ?? "none"} (${p.logo.primary?.type ?? "?"}); mark ${p.logo.mark?.path ?? "none"}`, "");

  L.push("## Screenshots to inspect", "");
  for (const s of p.screenshots.filter((s) => !s.fullPage)) L.push(`- \`${s.path}\` (${s.viewport}, ${s.page})`);
  for (const s of p.screenshots.filter((s) => s.fullPage).slice(0, 3)) L.push(`- \`${s.path}\` (full page)`);
  if (p.media.canvases[0]?.poster) L.push(`- \`${p.media.canvases[0].poster}\` (animated canvas still)`);
  L.push("");

  L.push("## Task", "");
  L.push("Write `strategy.json` next to `brand.json`. Then run `watercolor build`. Prioritise, in order:");
  L.push("1. `company` (oneLiner, category, businessModel, audience.primary/buyer/user, competitors, differentiators)");
  L.push("2. `positioning` (statement, promise, 3 pillars)");
  L.push("3. `personality` (summary, 4–5 traits as `trait`/`notThis` pairs grounded in evidence, spectrum 0–1)");
  L.push("4. `voice` (summary, 3–5 principles with do/dont, vocabulary use/avoid, mechanics, 4–6 rewrite examples, 3 taglines)");
  L.push("5. `visual` (summary, principles, colorUsage, typography, layout, imagery, iconography, shape, do[], dont[])");
  L.push("6. `motion` (summary, principles, signature) · `logo` (clearspace, minSize, misuse) · `colorNames` (evocative names for the 6–10 key hexes) · `copy.headlines`");
  if (mode !== "extract") L.push("7. `overrides` / `extensions` per the mode instructions above. Explain changes in `rationale`.");
  L.push("");
  L.push("## strategy.json schema", "", "```ts", STRATEGY_SCHEMA_TS.trim(), "```", "");
  return L.join("\n");
}

function modeText(mode: BrandMode) {
  switch (mode) {
    case "extract":
      return "Describe the brand exactly as it is. Do not set `overrides`.";
    case "extend":
      return "Keep every measured value. Fill gaps the site doesn't cover (missing semantic colors, icon ideas, extra patterns, motion signature) via `extensions`, staying strictly inside the brand's language.";
    case "evolve":
      return "Propose a considered refresh: keep the brand recognisable (logo, name, core hue family) but fix weaknesses (contrast, type hierarchy, generic choices). Put changes in `overrides` and justify each in `rationale`.";
    case "reimagine":
      return "Treat the company as the brief, not the current design. Use the category playbook to propose a fresh, distinctive identity (palette via `overrides.roles`, type via `overrides.fonts`, gradient, radius). Avoid every item in anti-slop.md. Justify in `rationale`.";
  }
}

export async function writeBrief(p: BrandProfile, dir: string, mode: BrandMode = "extract") {
  return write(path.join(dir, ".watercolor", "brief.md"), buildBrief(p, mode));
}
